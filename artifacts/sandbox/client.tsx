import { useEffect, useRef, useState, useCallback } from 'react';
import { Artifact } from '@/components/create-artifact';
import { CodeEditor } from '@/components/code-editor';
import { DocumentSkeleton } from '@/components/document-skeleton';
import {
  CopyIcon,
  CodeIcon,
  EyeIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { toast } from 'sonner';

// Custom styles for sandbox rendering
const sandboxStyles = `
.sandbox-container {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
}

.sandbox-preview {
  width: 100%;
  height: 100%;
  border: none;
}

.sandbox-container .error {
  color: red;
  padding: 1rem;
  border: 1px solid red;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.sandbox-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 1rem;
}

.sandbox-loader {
  border: 3px solid #f3f3f3;
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Define sandbox project structure
interface ProjectFile {
  [key: string]: string;
}

interface SandboxProject {
  title: string;
  description: string;
  template: 'javascript' | 'node' | 'typescript' | 'angular' | 'react' | 'vue';
  files: ProjectFile;
  settings?: {
    compile?: {
      trigger?: 'auto' | 'save' | 'manual';
      clearConsole?: boolean;
    };
  };
}

interface StackBlitzVM {
  applyFsDiff: (diff: { create: Record<string, string>, destroy: string[] }) => Promise<null>;
  getDependencies: () => Promise<Record<string, string>>;
  getFsSnapshot: () => Promise<Record<string, string>>;
  editor: {
    openFile: (path: string | string[]) => Promise<null>;
    setCurrentFile: (path: string) => Promise<null>;
    setTheme: (theme: 'light' | 'dark' | 'auto') => Promise<null>;
    setView: (view: 'editor' | 'preview' | 'split') => Promise<null>;
    showSidebar: (visible?: boolean) => Promise<null>;
  };
  preview: {
    origin: string | null;
    getUrl: () => Promise<string | null>;
    setUrl: (path: string) => Promise<null>;
  };
}

interface SandboxArtifactMetadata {
  showPreview: boolean;
  project: SandboxProject | null;
  isEmbedded: boolean;
  lastUpdate: number;
  vm: StackBlitzVM | null;
}

// Define the type for setMetadata updater function to avoid 'any' type for prev
type SetMetadataType = (value: React.SetStateAction<SandboxArtifactMetadata>) => void;

interface SandboxContentProps {
  title: string;
  content: string;
  mode: 'edit' | 'diff';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: 'streaming' | 'idle';
  suggestions: Array<any>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  isInline: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  metadata: SandboxArtifactMetadata;
  setMetadata: SetMetadataType;
}

// Parse content into project structure
const parseContent = (content: string): SandboxProject | null => {
  try {
    // Check for file operations in the content
    const fileOperationsMatch = content.match(/\/\*\*\s*FILE_OPERATIONS\s*\*\/([\s\S]+?)\/\*\*\s*END_FILE_OPERATIONS\s*\*\//);
    if (fileOperationsMatch && fileOperationsMatch[1]) {
      try {
        const fileOperations = JSON.parse(fileOperationsMatch[1].trim());
        if (Array.isArray(fileOperations) && window.AISandboxInterface) {
          // Queue file operations to be executed after project is loaded
          setTimeout(async () => {
            try {
              if (window.AISandboxInterface) {
                for (const op of fileOperations) {
                  if (op.operation === 'create' || op.operation === 'update') {
                    if (op.path && op.content) {
                      await window.AISandboxInterface.updateFile(op.path, op.content);
                    }
                  } else if (op.operation === 'delete') {
                    if (op.path) {
                      await window.AISandboxInterface.deleteFile(op.path);
                    }
                  }
                }
              }
              toast.success('File operations completed');
            } catch (error) {
              console.error('Error applying file operations:', error);
              toast.error('Failed to apply file operations');
            }
          }, 2000); // Wait for project to load
        }
      } catch (e) {
        console.error("Failed to parse file operations JSON", e);
      }
    }
    
    // Try to find JSON project configuration in content
    const projectConfigMatch = content.match(/\/\*\*\s*PROJECT_CONFIG\s*\*\/([\s\S]+?)\/\*\*\s*END_PROJECT_CONFIG\s*\*\//);
    
    if (projectConfigMatch && projectConfigMatch[1]) {
      try {
        return JSON.parse(projectConfigMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse project config JSON", e);
      }
    }
    
    // Default project structure if no config found
    const files: ProjectFile = {};
    
    // Extract HTML content (assuming first HTML block is index.html)
    const htmlMatch = content.match(/```html([\s\S]+?)```/);
    if (htmlMatch && htmlMatch[1]) {
      files['index.html'] = htmlMatch[1].trim();
    } else {
      files['index.html'] = '<div id="app"></div>';
    }
    
    // Extract CSS content
    const cssMatch = content.match(/```css([\s\S]+?)```/);
    if (cssMatch && cssMatch[1]) {
      files['styles.css'] = cssMatch[1].trim();
    } else {
      files['styles.css'] = 'body { font-family: system-ui, sans-serif; }';
    }
    
    // Extract JS content
    const jsMatch = content.match(/```js(?:cript)?([\s\S]+?)```/);
    if (jsMatch && jsMatch[1]) {
      files['index.js'] = jsMatch[1].trim();
    } else {
      files['index.js'] = 'import "./styles.css";\ndocument.getElementById("app").innerHTML = "<h1>Hello World</h1>";';
    }
    
    // Create package.json if not exist
    if (!files['package.json']) {
      files['package.json'] = JSON.stringify({
        name: "stackblitz-sandbox",
        version: "1.0.0",
        description: "A sandbox project created by AI",
        scripts: {
          start: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          "vite": "^5.0.0"
        },
        stackblitz: {
          installDependencies: true,
          startCommand: "npm start"
        }
      }, null, 2);
    }
    
    return {
      title: "Generated Sandbox",
      description: "A web app sandbox generated by AI",
      template: "javascript",
      files,
      settings: {
        compile: {
          trigger: "auto",
          clearConsole: false
        }
      }
    };
  } catch (e) {
    console.error("Error parsing sandbox content", e);
    return null;
  }
};

// The main Sandbox content component
// Type declarations for setState updater functions to avoid implicit 'any' type errors
type ConsoleOutputType = Array<{type: 'log'|'info'|'warn'|'error', message: string}>;
type AppEventsType = Array<{type: string, data: any}>;
type ErrorsListType = Array<{file: string, line: number, message: string}>;

const SandboxContent = ({
  content,
  onSaveContent,
  isCurrentVersion,
  isLoading,
  metadata,
  setMetadata,
}: SandboxContentProps) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [projectStructure, setProjectStructure] = useState<Record<string, string> | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutputType>([]);
  const [appEvents, setAppEvents] = useState<AppEventsType>([]);
  const [errorsList, setErrorsList] = useState<ErrorsListType>([]);
  
  // Function to handle messages from the embedded application
  const handleAppMessage = useCallback((event: MessageEvent) => {
    // Only process messages from our sandbox iframe
    if (!previewContainerRef.current) return;
    
    const iframe = previewContainerRef.current.querySelector('iframe');
    if (!iframe || event.source !== iframe.contentWindow) return;
    
    // Process different message types
    if (event.data && typeof event.data === 'object') {
      // Handle console output
      if (event.data.type === 'console') {        setConsoleOutput((prev: ConsoleOutputType) => [...prev, {
          type: event.data.level || 'log',
          message: typeof event.data.message === 'string' 
            ? event.data.message 
            : JSON.stringify(event.data.message)
        }]);
      }
      
      // Handle errors
      if (event.data.type === 'error') {        setErrorsList((prev: ErrorsListType) => [...prev, {
          file: event.data.file || 'unknown',
          line: event.data.line || 0,
          message: event.data.message || 'Unknown error'
        }]);
        toast.error(`Error: ${event.data.message}`);
      }
      
      // Store general app events
      if (event.data.type === 'app-event') {        setAppEvents((prev: AppEventsType) => [...prev, {
          type: event.data.eventType || 'unknown',
          data: event.data.data
        }]);
      }
    }
  }, []);
  
  // Set up the message listener
  useEffect(() => {
    window.addEventListener('message', handleAppMessage);
    return () => {
      window.removeEventListener('message', handleAppMessage);
    };
  }, [handleAppMessage]);

  // Function to inject communication interface into the embedded app
  const injectCommunicationInterface = useCallback(async () => {
    if (!metadata.vm) return;
    
    try {
      // Get the current index.html content
      const files = await metadata.vm.getFsSnapshot();
      let indexHtml = files['index.html'] || '';
      
      // Check if communication script is already injected
      if (indexHtml.includes('ai-sandbox-communicator.js')) return;
      
      // Create the communication script file
      await metadata.vm.applyFsDiff({
        create: {
          'ai-sandbox-communicator.js': `
// AI Sandbox Communicator Script
// This script enables communication between the app and the AI
window.sendMessageToAI = function(type, data) {
  window.parent.postMessage({
    type: type,
    ...data
  }, '*');
};

// Capture console output and send to parent
(function() {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  
  function wrapConsole(method) {
    return function() {
      // Call original method
      originalConsole[method].apply(console, arguments);
      
      // Send to parent
      try {
        const args = Array.from(arguments).map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        );
        window.sendMessageToAI('console', { 
          level: method, 
          message: args.join(' ') 
        });
      } catch(e) {
        originalConsole.error('Error in console capture:', e);
      }
    };
  }
  
  // Override console methods
  console.log = wrapConsole('log');
  console.info = wrapConsole('info');
  console.warn = wrapConsole('warn');
  console.error = wrapConsole('error');
  
  // Capture unhandled errors
  window.addEventListener('error', function(event) {
    window.sendMessageToAI('error', {
      message: event.message,
      file: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error ? event.error.stack : null
    });
  });
  
  // Notify that the communicator is ready
  window.sendMessageToAI('app-event', {
    eventType: 'communicator-ready',
    data: { timestamp: Date.now() }
  });
})();
`
        },
        destroy: []
      });
      
      // Inject script reference into index.html
      const scriptTag = '<script src="./ai-sandbox-communicator.js"></script>';
      const updatedHtml = indexHtml.replace('</head>', `${scriptTag}\n</head>`);
      
      if (updatedHtml !== indexHtml) {
        await metadata.vm.applyFsDiff({
          create: { 'index.html': updatedHtml },
          destroy: []
        });
      }
      
      console.log('Communication interface injected successfully');
    } catch (error) {
      console.error('Failed to inject communication interface:', error);
    }
  }, [metadata.vm]);
  
  // Inject communication interface after VM is ready
  useEffect(() => {
    if (metadata.vm && metadata.isEmbedded) {
      injectCommunicationInterface();
    }
  }, [metadata.vm, metadata.isEmbedded, injectCommunicationInterface]);

  // Function to create or update a file in the project using the VM
  const updateProjectFile = async (filePath: string, content: string) => {
    if (!metadata.vm) {
      toast.error('VM not available');
      return;
    }

    try {
      await metadata.vm.applyFsDiff({
        create: { [filePath]: content },
        destroy: [],
      });
      toast.success(`Updated ${filePath}`);
      
      // If it's a new file, open it in the editor
      await metadata.vm.editor.openFile(filePath);
      
      // Update the metadata to reflect changes
      const files = await metadata.vm.getFsSnapshot();
      const updatedProject = metadata.project ? { 
        ...metadata.project,
        files: { ...files }
      } : null;
      
      setMetadata(prev => ({
        ...prev,
        project: updatedProject,
        lastUpdate: Date.now()
      }));
      
      // Update project structure
      setProjectStructure(files);
      
      return files;
    } catch (error) {
      toast.error(`Failed to update ${filePath}`);
      console.error('Error updating file:', error);
      throw error;
    }
  };
  
  // Function to delete a file in the project
  const deleteProjectFile = async (filePath: string) => {
    if (!metadata.vm) {
      toast.error('VM not available');
      return;
    }
    
    try {
      await metadata.vm.applyFsDiff({
        create: {},
        destroy: [filePath],
      });
      toast.success(`Deleted ${filePath}`);
      
      // Update the metadata to reflect changes
      const files = await metadata.vm.getFsSnapshot();
      const updatedProject = metadata.project ? { 
        ...metadata.project,
        files: { ...files }
      } : null;
      
      setMetadata(prev => ({
        ...prev,
        project: updatedProject,
        lastUpdate: Date.now()
      }));
      
      // Update project structure
      setProjectStructure(files);
      
      return files;
    } catch (error) {
      toast.error(`Failed to delete ${filePath}`);
      console.error('Error deleting file:', error);
      throw error;
    }
  };
  
  // Function to get current project structure
  const getProjectStructure = async () => {
    if (!metadata.vm) {
      toast.error('VM not available');
      return null;
    }
    
    try {
      const files = await metadata.vm.getFsSnapshot();
      setProjectStructure(files);
      return files;
    } catch (error) {
      toast.error('Failed to get project structure');
      console.error('Error getting project structure:', error);
      return null;
    }
  };
  
  // Function to get project dependencies
  const getProjectDependencies = async () => {
    if (!metadata.vm) {
      toast.error('VM not available');
      return null;
    }
    
    try {
      const deps = await metadata.vm.getDependencies();
      return deps;
    } catch (error) {
      toast.error('Failed to get dependencies');
      console.error('Error getting dependencies:', error);
      return null;
    }
  };
  
  // Function to reset VM state if needed
  const resetVM = async () => {
    if (!metadata.vm || !previewContainerRef.current) return;
    
    setIsProjectLoading(true);
    const project = parseContent(content);
    
    if (project && previewContainerRef.current) {
      try {
        // Clear the container
        previewContainerRef.current.innerHTML = '';
          // Re-embed the project
        if (!window.StackBlitzSDK) {
          throw new Error('StackBlitz SDK not loaded');
        }
        
        const vm = await window.StackBlitzSDK.embedProject(
          previewContainerRef.current,
          project,
          {
            height: '100%',
            hideDevTools: false,
            hideExplorer: false,
            forceEmbedLayout: true,
            openFile: 'index.js',
          }
        );
        
        // Store the VM instance
        setMetadata(prev => ({
          ...prev,
          project,
          isEmbedded: true,
          lastUpdate: Date.now(),
          vm
        }));
        
        // Update project structure
        const files = await vm.getFsSnapshot();
        setProjectStructure(files);
        
      } catch (error) {
        console.error('Error resetting VM:', error);
        toast.error('Failed to reset the project');
      } finally {
        setIsProjectLoading(false);
      }
    }
  };
  
  // Expose methods to window for AI interaction
  useEffect(() => {
    if (metadata.vm && metadata.isEmbedded) {
      // Define a global interface for AI to interact with the sandbox
      const aiSandboxInterface = {
        getFiles: getProjectStructure,
        updateFile: updateProjectFile,
        deleteFile: deleteProjectFile,
        getDependencies: getProjectDependencies,
        resetProject: resetVM,
        openFile: async (filePath: string) => {
          try {
            await metadata.vm?.editor.openFile(filePath);
            return true;
          } catch (error) {
            console.error('Error opening file:', error);
            return false;
          }
        },
        setEditorView: async (view: 'editor' | 'preview' | 'split') => {
          try {
            await metadata.vm?.editor.setView(view);
            return true;
          } catch (error) {
            console.error('Error setting view:', error);
            return false;
          }
        },
        getCurrentUrl: async () => {
          try {
            return await metadata.vm?.preview.getUrl();
          } catch (error) {
            console.error('Error getting URL:', error);
            return null;
          }
        }
      };
      
      // Expose the interface to window for AI to access
      (window as any).AISandboxInterface = aiSandboxInterface;
      
      // Initial project structure fetch
      getProjectStructure();
    }
    
    return () => {
      // Clean up when component unmounts
      delete (window as any).AISandboxInterface;
    };
  }, [metadata.vm, metadata.isEmbedded]);
  
  // Load StackBlitz SDK
  useEffect(() => {
    if (!metadata.showPreview) return;
    
    if (typeof window.StackBlitzSDK === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@stackblitz/sdk@1/bundles/sdk.umd.js';
      script.onload = () => {
        setIsSDKLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsSDKLoaded(true);
    }
  }, [metadata.showPreview]);
  
  // When content changes or SDK loads, update the project
  useEffect(() => {
    if (!metadata.showPreview || !isSDKLoaded || !previewContainerRef.current) return;
    
    const renderProject = async () => {
      const project = parseContent(content);
      
      if (!project) {
        if (previewContainerRef.current) {
          previewContainerRef.current.innerHTML = `
            <div className="error">
              Could not parse project configuration from the code.
              Please check your code format and try again.
            </div>
          `;
        }
        return;
      }
      
      try {
        setIsProjectLoading(true);
        const container = previewContainerRef.current;
        
        if (container) {
          container.innerHTML = `
            <div className="sandbox-loading">
              <div className="sandbox-loader"></div>
              <span>Loading project...</span>
            </div>
          `;
            if (window.StackBlitzSDK) {
            try {
              // Check if we already have an iframe to prevent recreation
              const existingIframe = container.querySelector('iframe');
              if (existingIframe && metadata.project && 
                  metadata.project.title === project.title && 
                  metadata.lastUpdate === metadata.lastUpdate) {
                // Project hasn't changed, no need to re-embed
                setIsProjectLoading(false);
                return;
              }
              
              // Clear the container
              container.innerHTML = '';
                // Embed the project
              const vm = await window.StackBlitzSDK.embedProject(
                container,
                project,
                {
                  height: '100%',
                  hideDevTools: false,
                  hideExplorer: false,
                  forceEmbedLayout: true,
                  openFile: 'index.js',
                }
              );
              
              // Store the VM instance for future interactions
              setMetadata(prev => ({
                ...prev,
                project,
                isEmbedded: true,
                lastUpdate: Date.now(),
                vm: vm
              }));
            } catch (err) {
              console.error('StackBlitz SDK error:', err);
              container.innerHTML = `
                <div className="error">
                  Error embedding StackBlitz project: ${err instanceof Error ? err.message : 'Unknown error'}
                </div>
              `;
            }
          }
        }
      } finally {
        setIsProjectLoading(false);
      }
    };
    
    renderProject();
  }, [content, isSDKLoaded, metadata.showPreview, metadata.lastUpdate]);
  
  if (isLoading) {
    return <DocumentSkeleton artifactKind="sandbox" />;
  }
  
  if (!isCurrentVersion) {    
    return (
      <div className="px-1">
        <CodeEditor
          content={content}
          status="idle"
          onSaveContent={() => {}}
          isCurrentVersion={false}
          currentVersionIndex={0}
          suggestions={[]}
        />
      </div>
    );
  }
    return (
    <>
      <div className="flex flex-col w-full h-full">
        {!metadata.showPreview ? (
          <div className="px-1">
            <CodeEditor
              content={content}
              status="idle"
              onSaveContent={(updatedContent) => onSaveContent(updatedContent, true)}
              isCurrentVersion={isCurrentVersion}
              currentVersionIndex={0}
              suggestions={[]}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-white overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: sandboxStyles }} />
            <div ref={previewContainerRef} className="sandbox-container w-full flex-1" />
            
            {/* Console Output */}
            {consoleOutput.length > 0 && (
              <div className="border-t border-gray-200 p-2 max-h-40 overflow-y-auto bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-semibold">Console Output</h3>
                  <button 
                    onClick={() => setConsoleOutput([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="text-xs font-mono">
                  {consoleOutput.map((log, i) => (
                    <div 
                      key={i} 
                      className={`py-0.5 ${
                        log.type === 'error' ? 'text-red-600' : 
                        log.type === 'warn' ? 'text-yellow-600' : 
                        log.type === 'info' ? 'text-blue-600' : 'text-gray-800'
                      }`}
                    >
                      <span className="opacity-70">[{log.type}]</span> {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Errors List */}
            {errorsList.length > 0 && (
              <div className="border-t border-red-200 p-2 max-h-40 overflow-y-auto bg-red-50">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-semibold text-red-700">Errors</h3>
                  <button 
                    onClick={() => setErrorsList([])}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="text-xs font-mono">
                  {errorsList.map((error, i) => (
                    <div key={i} className="py-0.5 text-red-600">
                      <span className="font-semibold">{error.file}:{error.line}</span> {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Need to declare global types for the dynamically loaded library
declare global {
  interface Window {
    StackBlitzSDK?: {
      embedProject: (
        elementOrId: string | HTMLElement,
        project: SandboxProject,
        embedOptions?: {
          height?: string | number;
          width?: string | number;
          hideDevTools?: boolean;
          hideExplorer?: boolean;
          forceEmbedLayout?: boolean;
          openFile?: string | string[];
          view?: 'preview' | 'editor' | 'split';
          terminalHeight?: number;
          clickToLoad?: boolean;
          showSidebar?: boolean;
        }
      ) => Promise<StackBlitzVM>;
      embedProjectId: (
        elementOrId: string | HTMLElement,
        projectId: string,
        embedOptions?: Object
      ) => Promise<StackBlitzVM>;
      embedGithubProject: (
        elementOrId: string | HTMLElement,
        repoPath: string,
        embedOptions?: Object
      ) => Promise<StackBlitzVM>;
      connect: (iframe: HTMLIFrameElement) => Promise<StackBlitzVM>;
    };
    
    // AI Sandbox interface for programmatically controlling the embedded project
    AISandboxInterface?: {
      getFiles: () => Promise<Record<string, string> | null>;
      updateFile: (filePath: string, content: string) => Promise<Record<string, string> | null>;
      deleteFile: (filePath: string) => Promise<Record<string, string> | null>;
      getDependencies: () => Promise<Record<string, string> | null>;
      resetProject: () => Promise<void>;
      openFile: (filePath: string) => Promise<boolean>;
      setEditorView: (view: 'editor' | 'preview' | 'split') => Promise<boolean>;
      getCurrentUrl: () => Promise<string | null>;
    };
  }
}

export const sandboxArtifact = new Artifact<'sandbox', SandboxArtifactMetadata>({
  kind: 'sandbox',
  description: 'Create and run JavaScript web applications using StackBlitz WebContainer SDK',  initialize: async ({ setMetadata }) => {
    setMetadata({
      showPreview: false,
      project: null,
      isEmbedded: false,
      lastUpdate: 0,
      vm: null,
    });
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'sandbox-delta' as any) {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible:
          draftArtifact.status === 'streaming' &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 310
            ? true
            : draftArtifact.isVisible,
        status: 'streaming',
      }));
    }

    if (streamPart.type === 'finish') {
      setMetadata((metadata) => ({
        ...metadata,
        showPreview: true,
        lastUpdate: Date.now(),
      }));
    }
  },
  content: SandboxContent,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CodeIcon size={18} />,
      description: 'View Code',
      onClick: ({ setMetadata }) => {
        setMetadata((metadata) => ({
          ...metadata,
          showPreview: false,
        }));
      },
      isDisabled: ({ metadata }) => {
        return !metadata.showPreview;
      },
    },
    {
      icon: <EyeIcon size={18} />,
      description: 'View Preview',
      onClick: ({ setMetadata }) => {
        setMetadata((metadata) => ({
          ...metadata,
          showPreview: true,
          lastUpdate: Date.now(), // Force re-render
        }));
      },
      isDisabled: ({ metadata }) => {
        return metadata.showPreview;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'Refresh Preview',
      onClick: ({ setMetadata }) => {
        setMetadata((metadata) => ({
          ...metadata,
          lastUpdate: Date.now(),
        }));
      },
      isDisabled: ({ metadata }) => {
        return !metadata.showPreview;
      },
    },    {
      icon: <CopyIcon size={18} />,
      description: 'Copy code to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>,
      description: 'Toggle Editor Mode',
      onClick: async ({ metadata, setMetadata }) => {
        if (metadata.vm) {
          try {
            // Toggle between editor and preview views
            const currentView = metadata.showPreview ? 'editor' : 'preview';
            await metadata.vm.editor.setView(currentView === 'editor' ? 'preview' : 'editor');
            toast.success(`Switched to ${currentView === 'editor' ? 'preview' : 'editor'} view`);
          } catch (err) {
            toast.error('Failed to switch view');
            console.error(err);
          }
        }
      },
      isDisabled: ({ metadata }) => {
        return !metadata.showPreview || !metadata.vm;
      },
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3z"></path><path d="M14 3h7v7h-7z"></path><path d="M14 14h7v7h-7z"></path><path d="M3 14h7v7H3z"></path></svg>,
      description: 'Split View',
      onClick: async ({ metadata, setMetadata }) => {
        if (metadata.vm) {
          try {
            await metadata.vm.editor.setView('split');
            toast.success('Switched to split view');
          } catch (err) {
            toast.error('Failed to switch to split view');
            console.error(err);
          }
        }
      },
      isDisabled: ({ metadata }) => {
        return !metadata.showPreview || !metadata.vm;
      },
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10h4V1h-4"/><path d="M4 19h10"/><path d="M21 19h2"/><path d="M4 5h2"/><path d="M9 5h14"/><path d="m8 19-5-5 5-5"/></svg>,
      description: 'Toggle Sidebar',
      onClick: async ({ metadata, setMetadata }) => {
        if (metadata.vm) {
          try {
            // Since we don't know the current sidebar state, we just toggle it
            // The VM will automatically determine if it should show or hide
            await metadata.vm.editor.showSidebar();
            toast.success('Toggled sidebar visibility');
          } catch (err) {
            toast.error('Failed to toggle sidebar');
            console.error(err);
          }
        }
      },
      isDisabled: ({ metadata }) => {
        return !metadata.showPreview || !metadata.vm;
      },
    },
  ],  toolbar: [
    {
      description: 'Add a new file to sandbox',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>,
      onClick: async ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'I want to add a new file to this sandbox project. Can you help me create one?',
        });
      },
    },
    {
      description: 'Modify existing files',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you modify the existing files in this sandbox project to add a new feature?',
        });
      },
    },
    {
      description: 'Fix errors in the code',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'My project has errors. Can you help identify and fix them?',
        });
      },
    },
    {
      description: 'Get project structure',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m18.7 8-5.1 5.2-2.8-2.8L7 14.1"/></svg>,
      onClick: async ({ appendMessage, metadata }) => {
        try {
          if (metadata.vm && window.AISandboxInterface) {
            const files = await window.AISandboxInterface.getFiles();
            if (files) {
              const fileList = Object.keys(files).map(file => `- \`${file}\``).join('\n');
              appendMessage({
                role: 'user',
                content: `Show me the current structure of this project and explain each file's purpose. Here's the file list:\n\n${fileList}`,
              });
            } else {
              appendMessage({
                role: 'user',
                content: 'Show me the current structure of this project and explain each file\'s purpose.',
              });
            }
          } else {
            appendMessage({
              role: 'user',
              content: 'Show me the current structure of this project and explain each file\'s purpose.',
            });
          }
        } catch (error) {
          console.error('Error getting project structure:', error);
          appendMessage({
            role: 'user',
            content: 'Show me the current structure of this project and explain each file\'s purpose.',
          });
        }
      },
    },
    {
      description: 'Add npm package',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H8a2 2 0 00-2 2v4"></path><path d="M16 12V9.5a1.5 1.5 0 00-3 0V12"></path><path d="M4 12h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z"></path></svg>,
      onClick: async ({ appendMessage, metadata }) => {
        try {
          if (metadata.vm && window.AISandboxInterface) {
            const deps = await window.AISandboxInterface.getDependencies();
            if (deps) {
              const depsList = Object.entries(deps)
                .map(([name, version]) => `- ${name}: ${version}`)
                .join('\n');
              appendMessage({
                role: 'user',
                content: `I want to add a new npm package to this project. Current dependencies:\n\n${depsList}\n\nPlease help me add a new package.`,
              });
            } else {
              appendMessage({
                role: 'user',
                content: 'I want to add a new npm package to this project. Please help me add one.',
              });
            }
          } else {
            appendMessage({
              role: 'user',
              content: 'I want to add a new npm package to this project. Please help me add one.',
            });
          }
        } catch (error) {
          console.error('Error getting dependencies:', error);
          appendMessage({
            role: 'user',
            content: 'I want to add a new npm package to this project. Please help me add one.',
          });
        }
      },
    },
    {
      description: 'Build a specific component',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect></svg>,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you help me build a specific UI component for this project?',
        });
      },
    },
    {
      description: 'Reset project',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>,
      onClick: async ({ appendMessage, metadata, setMetadata }) => {
        try {
          if (window.AISandboxInterface) {
            await window.AISandboxInterface.resetProject();
            toast.success('Project reset successfully');
            
            // Update metadata to reflect the reset
            setMetadata((prev: SandboxArtifactMetadata) => ({
              ...prev,
              lastUpdate: Date.now(),
              project: null, // Clear the current project
              isEmbedded: false // Will be re-embedded on next render
            }));
            
            appendMessage({
              role: 'user',
              content: 'I\'ve reset the project to its initial state. Can you explain what the current project does?',
            });
          } else {
            // Fallback reset if AISandboxInterface is not available
            setMetadata((prev: SandboxArtifactMetadata) => ({
              ...prev,
              lastUpdate: Date.now(),
              project: null,
              isEmbedded: false
            }));
            toast.success('Project reset requested');
            appendMessage({
              role: 'user',
              content: 'I\'ve reset the project to its initial state. Can you explain what the current project does?',
            });
          }
        } catch (error) {
          console.error('Error resetting project:', error);
          toast.error('Failed to reset project');
          // Update metadata to force re-render
          setMetadata((prev: SandboxArtifactMetadata) => ({
            ...prev,
            lastUpdate: Date.now()
          }));
          appendMessage({
            role: 'user',
            content: 'I tried to reset the project but encountered an error. Can you help me understand what this project does and fix any issues?',
          });
        }
      },
    },
    {
      description: 'Change project template',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline></svg>,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'I want to change this project to use a different framework template (React, Vue, Angular, etc.). Can you help me convert it?',
        });
      },
    },
    {
      description: 'Add API integration',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 15v-6l7 3-7 3z"></path><path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10z"></path></svg>,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you add a feature to fetch data from an API and display it in this application?',
        });
      },
    },
    {
      description: 'Add interactivity',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Please add more interactive features to this application, such as buttons, forms, and event handlers.',
        });
      },
    },
  ],
});

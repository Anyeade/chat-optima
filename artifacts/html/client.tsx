import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { CodeEditor } from '@/components/code-editor';
import { FileExplorer, VirtualFile } from '@/components/file-explorer';
import { useVirtualFileSystem } from '@/hooks/use-virtual-file-system';
import { toast } from 'sonner';
import {
  CopyIcon,
  UndoIcon,
  RedoIcon,
  EyeIcon,
  FileIcon,
} from '@/components/icons';
import { useState } from 'react';

interface HTMLArtifactMetadata {
  isPreview: boolean;
  showFileExplorer: boolean;
}

export const htmlArtifact = new Artifact<'html', HTMLArtifactMetadata>({
  kind: 'html',
  description: 'Useful for creating HTML documents with CSS and JavaScript.',
  initialize: async ({ setMetadata }) => {
    setMetadata((currentMetadata) => ({
      isPreview: false,
      showFileExplorer: false, // Disabled file explorer
    }));
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'html-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({
    mode,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
    setMetadata,
  }) => {
    const {
      fileSystem,
      fileExplorerExpanded,
      createFile,
      deleteFile,
      renameFile,
      selectFile,
      updateFileContent,
      getActiveFile,
      getCombinedHtml,
      toggleFileExplorer,
      generateFileSystemContent
    } = useVirtualFileSystem(content);

    const activeFile = getActiveFile();

    if (isLoading) {
      return <DocumentSkeleton artifactKind="html" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    if (metadata?.isPreview) {
      const htmlToRender = getCombinedHtml() || content;
      return (
        <div className="w-full h-full">
          <iframe
            srcDoc={htmlToRender}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        </div>
      );
    }

    const handleFileContentSave = (newContent: string) => {
      if (activeFile) {
        updateFileContent(activeFile.id, newContent);
        
        // Check if we're working with a multi-file project (FILE_SYSTEM format)
        const isMultiFileProject = content.includes('/** FILE_SYSTEM */');
        
        if (isMultiFileProject) {
          // Create updated file system with the new content
          const updatedFileSystem = {
            files: fileSystem.files.map(file => 
              file.id === activeFile.id 
                ? { ...file, content: newContent }
                : file
            )
          };
          
          const fileSystemContent = `/** FILE_SYSTEM */
${JSON.stringify(updatedFileSystem, null, 2)}
/** END_FILE_SYSTEM */

${getCombinedHtml()}`;
          
          onSaveContent(fileSystemContent, false);
        } else {
          // For single-file projects, save normally
          if (activeFile.extension === 'html' && activeFile.isEntry) {
            onSaveContent(newContent, false);
          } else {
            // For CSS/JS files, save the combined HTML
            const combined = getCombinedHtml();
            if (combined) {
              onSaveContent(combined, false);
            }
          }
        }
      }
    };

    const handleFileCreate = (name: string, extension: VirtualFile['extension']) => {
      createFile(name, extension);
      
      // If we're in a multi-file project, save the updated structure
      const isMultiFileProject = content.includes('/** FILE_SYSTEM */');
      if (isMultiFileProject) {
        setTimeout(() => {
          onSaveContent(generateFileSystemContent(), false);
        }, 0);
      }
    };

    const handleFileDelete = (fileId: string) => {
      deleteFile(fileId);
      
      // If we're in a multi-file project, save the updated structure
      const isMultiFileProject = content.includes('/** FILE_SYSTEM */');
      if (isMultiFileProject) {
        setTimeout(() => {
          onSaveContent(generateFileSystemContent(), false);
        }, 0);
      }
    };

    const handleFileRename = (fileId: string, newName: string) => {
      renameFile(fileId, newName);
      
      // If we're in a multi-file project, save the updated structure
      const isMultiFileProject = content.includes('/** FILE_SYSTEM */');
      if (isMultiFileProject) {
        setTimeout(() => {
          onSaveContent(generateFileSystemContent(), false);
        }, 0);
      }
    };

    return (
      <div className="flex w-full h-full">
        {/* File Explorer disabled - commented out */}
        {/* {metadata?.showFileExplorer && (
          <div className="w-64 h-full border-r">
            <FileExplorer
              fileSystem={fileSystem}
              onFileSelect={selectFile}
              onFileCreate={handleFileCreate}
              onFileDelete={handleFileDelete}
              onFileRename={handleFileRename}
              isExpanded={fileExplorerExpanded}
              onToggleExpanded={toggleFileExplorer}
            />
          </div>
        )} */}
        
        <div className="flex-1 h-full">
          {/* Show simple code editor for HTML content */}
          <div className="p-4 w-full h-full">
            <CodeEditor
              content={content}
              language="html"
              onSaveContent={(newContent) => onSaveContent(newContent, false)}
              isCurrentVersion={isCurrentVersion}
            />
          </div>
        </div>
      </div>
    );
  },
  actions: [
    // File Explorer toggle disabled
    // {
    //   icon: <FileIcon size={18} />,
    //   description: 'Toggle File Explorer',
    //   onClick: ({ metadata, setMetadata }) => {
    //     const newShowFileExplorer = !(metadata?.showFileExplorer ?? true);
    //     setMetadata({
    //       ...metadata,
    //       showFileExplorer: newShowFileExplorer,
    //     });
    //   }
    // },
    {
      icon: <EyeIcon size={18} />,
      description: 'Toggle Preview',
      onClick: ({ metadata, setMetadata }) => {
        const newIsPreview = !(metadata?.isPreview ?? false);
        setMetadata({
          ...metadata,
          isPreview: newIsPreview,
        });
      }
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content, metadata }) => {
        // If in file explorer mode, copy the combined HTML
        if (metadata?.showFileExplorer) {
          // We need access to getCombinedHtml here, but it's in the component scope
          // For now, just copy the content as-is
          navigator.clipboard.writeText(content);
        } else {
          navigator.clipboard.writeText(content);
        }
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [],
});

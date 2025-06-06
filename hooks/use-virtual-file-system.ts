'use client';

import { useState, useCallback, useEffect } from 'react';
import { VirtualFile, VirtualFileSystem } from '@/components/file-explorer';
import { nanoid } from 'nanoid';

const DEFAULT_FILE_TEMPLATES = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold text-center text-blue-600 mb-8">Welcome to Your Project</h1>
        <div class="bg-white rounded-lg shadow-lg p-6">
            <p class="text-gray-700 text-lg">This is your main HTML file. You can edit it to create your web application.</p>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
  css: `/* Custom styles using Tailwind CSS */
/* Add your custom Tailwind utilities and components here */

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom component styles */
.custom-button {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200;
}

.custom-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6;
}

/* Custom utility styles */
.text-gradient {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
}`,
  js: `// JavaScript for your web application
console.log('Hello from your JavaScript file!');

// DOM ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM is ready!');
    
    // Add your JavaScript logic here
    initializeApp();
});

function initializeApp() {
    // Initialize your application
    console.log('App initialized!');
    
    // Example: Add click handlers, API calls, etc.
    setupEventListeners();
}

function setupEventListeners() {
    // Add event listeners for your interactive elements
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', e.target);
        });
    });
}

// Utility functions
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}`
};

// Helper function to parse server content that may contain file system structure
function parseServerContent(content: string): VirtualFileSystem | null {
  if (!content.includes('/** FILE_SYSTEM */')) {
    return null;
  }
  
  try {
    const match = content.match(/\/\*\* FILE_SYSTEM \*\/\n(.*?)\n\/\*\* END_FILE_SYSTEM \*\//s);
    if (match) {
      const fileSystemData = JSON.parse(match[1]);
      return fileSystemData;
    }
  } catch (e) {
    console.warn('Failed to parse file system from server content:', e);
  }
  
  return null;
}

// Helper function to extract individual files from HTML content
function extractFilesFromHTML(content: string): VirtualFileSystem {
  let html = content;
  let css = '';
  let js = '';
  
  // Extract inline CSS
  const styleMatch = html.match(/<style[^>]*>(.*?)<\/style>/s);
  if (styleMatch) {
    css = styleMatch[1].trim();
    // Remove the style tag from HTML
    html = html.replace(/<style[^>]*>.*?<\/style>/s, '');
  }
  
  // Extract inline JS (but not external script references)
  const scriptMatch = html.match(/<script[^>]*(?!.*src=)>(.*?)<\/script>/s);
  if (scriptMatch) {
    js = scriptMatch[1].trim();
    // Remove the script tag from HTML
    html = html.replace(/<script[^>]*(?!.*src=)>.*?<\/script>/s, '');
  }
  
  const files: VirtualFile[] = [
    {
      id: 'index-html',
      name: 'index.html',
      extension: 'html',
      content: html.trim(),
      type: 'file',
      isEntry: true
    }
  ];
  
  if (css) {
    files.push({
      id: 'styles-css',
      name: 'styles.css',
      extension: 'css',
      content: css,
      type: 'file',
      isEntry: false
    });
  }
  
  if (js) {
    files.push({
      id: 'script-js',
      name: 'script.js',
      extension: 'js',
      content: js,
      type: 'file',
      isEntry: false
    });
  }
  
  const entryFile = files.find(f => f.isEntry);
  
  return { 
    files,
    activeFileId: entryFile?.id || files[0]?.id || ''
  };
}

export function useVirtualFileSystem(initialContent?: string) {
  // Initialize file system from content
  const initializeFileSystem = useCallback((content?: string): VirtualFileSystem => {
    if (!content) {
      // Create default file system with just an HTML file
      return {
        files: [
          {
            id: nanoid(),
            name: 'index.html',
            extension: 'html',
            content: DEFAULT_FILE_TEMPLATES.html,
            type: 'file',
            isEntry: true
          }
        ],
        activeFileId: ''
      };
    }
    
    // Check if content has structured file system
    const parsedFileSystem = parseServerContent(content);
    if (parsedFileSystem) {
      // Ensure all files have required properties
      const processedFiles = parsedFileSystem.files.map(file => ({
        ...file,
        type: 'file' as const,
        id: file.id || nanoid()
      }));
      
      return {
        files: processedFiles,
        activeFileId: processedFiles.find(f => f.isEntry)?.id || processedFiles[0]?.id || ''
      };
    }
    
    // Try to extract files from HTML content or use as single file
    const extractedFileSystem = extractFilesFromHTML(content);
    const processedFiles = extractedFileSystem.files.map(file => ({
      ...file,
      type: 'file' as const,
      id: file.id || nanoid()
    }));
    
    return {
      files: processedFiles,
      activeFileId: processedFiles.find(f => f.isEntry)?.id || processedFiles[0]?.id || ''
    };
  }, []);
  const [fileSystem, setFileSystem] = useState<VirtualFileSystem>(() => 
    initializeFileSystem(initialContent)
  );
  
  const [fileExplorerExpanded, setFileExplorerExpanded] = useState(true);

  // Re-initialize file system when content changes (e.g., when loading from database)
  useEffect(() => {
    if (initialContent !== undefined) {
      const newFileSystem = initializeFileSystem(initialContent);
      setFileSystem(newFileSystem);
    }
  }, [initialContent, initializeFileSystem]);

  const createFile = useCallback((name: string, extension: VirtualFile['extension']) => {
    // Ensure the name has the correct extension
    let fileName = name;
    if (!fileName.endsWith(`.${extension}`)) {
      fileName = `${fileName}.${extension}`;
    }

    // Check if file already exists
    const existingFile = fileSystem.files.find(f => f.name === fileName);
    if (existingFile) {
      return; // Don't create duplicate files
    }

    const newFile: VirtualFile = {
      id: nanoid(),
      name: fileName,
      content: DEFAULT_FILE_TEMPLATES[extension],
      type: 'file',
      extension,
      isEntry: extension === 'html' && fileSystem.files.filter(f => f.extension === 'html').length === 0
    };

    setFileSystem(prev => ({
      ...prev,
      files: [...prev.files, newFile],
      activeFileId: newFile.id
    }));
  }, [fileSystem.files]);

  const deleteFile = useCallback((fileId: string) => {
    setFileSystem(prev => {
      const updatedFiles = prev.files.filter(f => f.id !== fileId);
      const newActiveFileId = prev.activeFileId === fileId 
        ? (updatedFiles.length > 0 ? updatedFiles[0].id : null)
        : prev.activeFileId;

      return {
        files: updatedFiles,
        activeFileId: newActiveFileId
      };
    });
  }, []);

  const renameFile = useCallback((fileId: string, newName: string) => {
    setFileSystem(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === fileId ? { ...f, name: newName } : f
      )
    }));
  }, []);

  const selectFile = useCallback((file: VirtualFile) => {
    setFileSystem(prev => ({
      ...prev,
      activeFileId: file.id
    }));
  }, []);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFileSystem(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === fileId ? { ...f, content } : f
      )
    }));
  }, []);

  const getActiveFile = useCallback(() => {
    return fileSystem.files.find(f => f.id === fileSystem.activeFileId) || null;
  }, [fileSystem]);

  const getMainHtmlFile = useCallback(() => {
    return fileSystem.files.find(f => f.extension === 'html' && f.isEntry) || 
           fileSystem.files.find(f => f.extension === 'html') || 
           null;
  }, [fileSystem]);

  const getCssFile = useCallback(() => {
    return fileSystem.files.find(f => f.extension === 'css') || null;
  }, [fileSystem]);

  const getJsFile = useCallback(() => {
    return fileSystem.files.find(f => f.extension === 'js') || null;
  }, [fileSystem]);

  // Generate combined HTML with linked CSS and JS
  const getCombinedHtml = useCallback(() => {
    const htmlFile = getMainHtmlFile();
    const cssFile = getCssFile();
    const jsFile = getJsFile();

    if (!htmlFile) return '';

    let html = htmlFile.content;

    // Inject CSS
    if (cssFile && cssFile.content.trim()) {
      const cssTag = `<style>\n${cssFile.content}\n</style>`;
      
      // Try to replace existing link tag for styles.css
      if (html.includes('href="styles.css"') || html.includes("href='styles.css'")) {
        html = html.replace(/<link[^>]*href=['"]styles\.css['"][^>]*>/gi, cssTag);
      } else if (html.includes('</head>')) {
        html = html.replace('</head>', `${cssTag}\n</head>`);
      } else {
        html = `${cssTag}\n${html}`;
      }
    }

    // Inject JavaScript
    if (jsFile && jsFile.content.trim()) {
      const jsTag = `<script>\n${jsFile.content}\n</script>`;
      
      // Try to replace existing script tag for script.js
      if (html.includes('src="script.js"') || html.includes("src='script.js'")) {
        html = html.replace(/<script[^>]*src=['"]script\.js['"][^>]*><\/script>/gi, jsTag);
      } else if (html.includes('</body>')) {
        html = html.replace('</body>', `${jsTag}\n</body>`);
      } else {
        html = `${html}\n${jsTag}`;
      }
    }

    return html;
  }, [getMainHtmlFile, getCssFile, getJsFile]);
  const toggleFileExplorer = useCallback(() => {
    setFileExplorerExpanded(prev => !prev);
  }, []);

  // Generate FILE_SYSTEM format for saving
  const generateFileSystemContent = useCallback(() => {
    const fileSystemData = {
      files: fileSystem.files.map(file => ({
        id: file.id,
        name: file.name,
        extension: file.extension,
        content: file.content,
        type: file.type,
        isEntry: file.isEntry
      }))
    };

    return `/** FILE_SYSTEM */
${JSON.stringify(fileSystemData, null, 2)}
/** END_FILE_SYSTEM */

${getCombinedHtml()}`;
  }, [fileSystem, getCombinedHtml]);
  return {
    fileSystem,
    fileExplorerExpanded,
    createFile,
    deleteFile,
    renameFile,
    selectFile,
    updateFileContent,
    getActiveFile,
    getMainHtmlFile,
    getCssFile,
    getJsFile,
    getCombinedHtml,
    toggleFileExplorer,
    generateFileSystemContent
  };
}

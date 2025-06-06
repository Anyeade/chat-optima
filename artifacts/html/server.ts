import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamText, smoothStream, streamObject } from 'ai';
import { htmlPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { z } from 'zod';

// Helper function to detect if content is a multi-file project
function isMultiFileProject(content: string): boolean {
  return (
    content.includes('/** FILE_SYSTEM */') || 
    (content.includes('index.html') && content.includes('styles.css')) ||
    (content.includes('<link') && content.includes('href="styles.css"')) ||
    (content.includes('<script') && content.includes('src="script.js"'))
  );
}

// Helper function to parse multi-file content
function parseMultiFileContent(content: string): { html: string; css: string; js: string } {
  if (content.includes('/** FILE_SYSTEM */')) {
    // Parse structured file system format
    try {
      const match = content.match(/\/\*\* FILE_SYSTEM \*\/\n(.*?)\n\/\*\* END_FILE_SYSTEM \*\//s);
      if (match) {
        const fileSystem = JSON.parse(match[1]);
        const htmlFile = fileSystem.files?.find((f: any) => f.extension === 'html' && f.isEntry);
        const cssFile = fileSystem.files?.find((f: any) => f.extension === 'css');
        const jsFile = fileSystem.files?.find((f: any) => f.extension === 'js');
        
        return {
          html: htmlFile?.content || content,
          css: cssFile?.content || '',
          js: jsFile?.content || ''
        };
      }
    } catch (e) {
      // Fall back to single file
    }
  }
  
  // Extract CSS and JS from HTML
  let html = content;
  let css = '';
  let js = '';
  
  // Extract inline CSS
  const styleMatch = html.match(/<style[^>]*>(.*?)<\/style>/s);
  if (styleMatch) {
    css = styleMatch[1].trim();
  }
  
  // Extract inline JS
  const scriptMatch = html.match(/<script[^>]*(?:src="script\.js"[^>]*)?[^>]*>(.*?)<\/script>/s);
  if (scriptMatch && !scriptMatch[0].includes('src=')) {
    js = scriptMatch[1].trim();
  }
  
  return { html, css, js };
}

// Helper function to create file system structure
function createFileSystemStructure(html: string, css: string, js: string): string {
  const fileSystem = {
    files: [
      {
        id: 'index-html',
        name: 'index.html',
        extension: 'html',
        content: html,
        type: 'file',
        isEntry: true
      }
    ]
  };
  
  if (css.trim()) {
    fileSystem.files.push({
      id: 'styles-css',
      name: 'styles.css',
      extension: 'css',
      content: css,
      type: 'file',
      isEntry: false
    });
  }
  
  if (js.trim()) {
    fileSystem.files.push({
      id: 'script-js',
      name: 'script.js',
      extension: 'js',
      content: js,
      type: 'file',
      isEntry: false
    });
  }
  
  return `/** FILE_SYSTEM */
${JSON.stringify(fileSystem, null, 2)}
/** END_FILE_SYSTEM */

${html}`;
}

export const htmlDocumentHandler = createDocumentHandler<'html'>({
  kind: 'html',  onCreateDocument: async ({ title, dataStream, selectedChatModel }) => {
    let draftContent = '';

    // Use selectedChatModel if provided, fallback to artifact-model
    const modelToUse = selectedChatModel || 'artifact-model';

    // Enhanced prompt to create multi-file projects when appropriate
    const enhancedPrompt = `Create an HTML document: ${title}

If this requires CSS styling or JavaScript functionality, structure it as a multi-file project with:
- index.html (main HTML file with Tailwind CSS)
- styles.css (custom CSS if needed beyond Tailwind)
- script.js (JavaScript functionality if needed)

Use Tailwind CSS for styling when possible. Only create separate CSS/JS files if they add significant value.`;

    const { fullStream } = streamText({
      model: myProvider.languageModel(modelToUse),
      system: htmlPrompt,
      prompt: enhancedPrompt,
      experimental_transform: smoothStream({ chunking: 'word' }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'html-delta',
          content: draftContent,
        });
      }
    }

    // Post-process to detect and structure multi-file content
    const { html, css, js } = parseMultiFileContent(draftContent);
    
    // If we detected separate CSS or JS, structure as multi-file project
    if (css.trim() || js.trim()) {
      draftContent = createFileSystemStructure(html, css, js);
      
      dataStream.writeData({
        type: 'html-delta',
        content: draftContent,
      });
    }

    return draftContent;
  },  onUpdateDocument: async ({ document, description, dataStream, selectedChatModel }) => {
    let draftContent = '';

    // Use selectedChatModel if provided, fallback to artifact-model
    const modelToUse = selectedChatModel || 'artifact-model';    // Check if this is a multi-file project
    const isMultiFile = isMultiFileProject(document.content || '');
    
    if (isMultiFile) {
      // Handle multi-file updates using structured approach
      const { html, css, js } = parseMultiFileContent(document.content || '');
      
      const schema = z.object({
        html: z.string().describe('Updated HTML content'),
        css: z.string().describe('Updated CSS content (if any)'),
        js: z.string().describe('Updated JavaScript content (if any)'),
        updates: z.array(z.object({
          file: z.enum(['html', 'css', 'js']),
          change: z.string().describe('Description of the change made')
        })).describe('List of files updated and what changed')
      });

      const { fullStream } = streamObject({
        model: myProvider.languageModel(modelToUse),
        system: `You are updating a multi-file HTML project. The current project has:

HTML: ${html.substring(0, 500)}${html.length > 500 ? '...' : ''}
CSS: ${css.substring(0, 300)}${css.length > 300 ? '...' : ''}
JS: ${js.substring(0, 300)}${js.length > 300 ? '...' : ''}

Update the project based on the user's request. Return the complete updated content for each file.
- Preserve all existing functionality unless explicitly asked to change it
- Maintain the structure and organization
- Use Tailwind CSS classes when possible
- Only add custom CSS when Tailwind is insufficient
- Add JavaScript only when interactive functionality is needed

IMPORTANT: Return the COMPLETE content for each file, not just the changes.`,
        prompt: description,
        schema,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'object') {
          const { object } = delta;
          
          if (object.html || object.css || object.js) {
            // Create updated file system structure
            const updatedContent = createFileSystemStructure(
              object.html || html,
              object.css || css,
              object.js || js
            );
            
            draftContent = updatedContent;

            dataStream.writeData({
              type: 'html-delta',
              content: draftContent,
            });
          }
        }
      }
    } else {
      // Handle single-file updates (legacy approach)
      const { fullStream } = streamText({
        model: myProvider.languageModel(modelToUse),
        system: updateDocumentPrompt(document.content, 'html'),
        prompt: description,
        experimental_transform: smoothStream({ chunking: 'word' }),
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'text-delta') {
          const { textDelta } = delta;

          draftContent += textDelta;

          dataStream.writeData({
            type: 'html-delta',
            content: draftContent,
          });
        }
      }

      // Post-process to potentially convert to multi-file if beneficial
      const { html, css, js } = parseMultiFileContent(draftContent);
      
      if (css.trim() || js.trim()) {
        draftContent = createFileSystemStructure(html, css, js);
        
        dataStream.writeData({
          type: 'html-delta',
          content: draftContent,
        });
      }
    }

    return draftContent;
  },
});

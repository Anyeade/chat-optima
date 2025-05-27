import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import type { DataStreamWriter } from 'ai';
import { streamText, streamObject, smoothStream } from 'ai';
import { z } from 'zod';
import { htmlPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import type { Document } from '@/lib/db/schema';
import { JSDOM } from 'jsdom';

// Enhanced update methods enum
enum UpdateMethod {
  SMART_UPDATE = 'smart',
  REGEX_UPDATE = 'regex', 
  STRING_MANIPULATION = 'string',
  TEMPLATE_BASED = 'template',
  DIFF_BASED = 'diff',
  REGEX_BLOCK_REPLACE = 'regex_block'
}

// Simplified smart update schema
const simpleUpdateSchema = z.object({
  method: z.enum(['replace', 'insert', 'remove', 'modify']),
  target: z.string(),
  content: z.string().optional(),
  position: z.enum(['before', 'after', 'inside', 'replace']).optional(),
  selector: z.string().optional()
});

// Enhanced HTML update schema with multiple methods
const enhancedUpdateSchema = z.object({
  updateMethod: z.enum(['smart', 'regex', 'string', 'template', 'diff', 'regex_block']),
  operations: z.array(simpleUpdateSchema)
});

interface UpdateParams {
  document: Document;
  description: string;
  dataStream: DataStreamWriter;
}

export const htmlDocumentHandler = createDocumentHandler<'html'>({
  kind: 'html',
  
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: htmlPrompt,
      prompt: title,
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

    return draftContent;
  },

  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = document.content || '';

    // Determine the best update method based on the request
    const updateMethod = determineUpdateMethod(description, draftContent);
    
    console.log(`Using update method: ${updateMethod}`);
    
    // Send method info to client
    dataStream.writeData({
      type: 'html-smart-update',
      content: JSON.stringify({
        method: updateMethod,
        status: 'starting'
      })
    });

    try {
      switch (updateMethod) {
        case UpdateMethod.REGEX_UPDATE:
          draftContent = await regexBasedUpdate({ document, description, dataStream });
          break;
          
        case UpdateMethod.STRING_MANIPULATION:
          draftContent = await stringManipulationUpdate({ document, description, dataStream });
          break;
          
        case UpdateMethod.TEMPLATE_BASED:
          draftContent = await templateBasedUpdate({ document, description, dataStream });
          break;
          
        case UpdateMethod.DIFF_BASED:
          draftContent = await diffBasedUpdate({ document, description, dataStream });
          break;
          
        case UpdateMethod.REGEX_BLOCK_REPLACE:
          draftContent = await regexBlockReplaceUpdate({ document, description, dataStream });
          break;
          
        case UpdateMethod.SMART_UPDATE:
        default:
          draftContent = await simplifiedSmartUpdate({ document, description, dataStream });
          break;
      }
    } catch (error) {
      console.error('Update method failed, falling back to regular update:', error);
      draftContent = await fallbackRegularUpdate({ document, description, dataStream });
    }

    return draftContent;
  },
});

// Method 1: Regex-based updates for common patterns
async function regexBasedUpdate(params: UpdateParams): Promise<string> {
  const { document, description, dataStream } = params;
  let content = document.content || '';
  
  console.log('Using regex-based update method');
  
  // Common regex patterns for HTML updates
  const patterns = {
    title: /<title[^>]*>([^<]*)<\/title>/gi,
    h1: /<h1[^>]*>([^<]*)<\/h1>/gi,
    h2: /<h2[^>]*>([^<]*)<\/h2>/gi,
    footer: /<footer[^>]*>[\s\S]*?<\/footer>/gi,
    header: /<header[^>]*>[\s\S]*?<\/header>/gi,
    nav: /<nav[^>]*>[\s\S]*?<\/nav>/gi,
    paragraph: /<p[^>]*>([^<]*)<\/p>/gi
  };

  // Analyze description to determine what to update
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('title')) {
    const newTitle = extractNewContent(description, 'title');
    if (newTitle) {
      content = content.replace(patterns.title, `<title>${newTitle}</title>`);
      dataStream.writeData({
        type: 'html-smart-update',
        content: JSON.stringify({ operation: 'title-update', success: true })
      });
    }
  }
  
  if (lowerDesc.includes('heading') || lowerDesc.includes('h1')) {
    const newHeading = extractNewContent(description, 'heading');
    if (newHeading) {
      content = content.replace(patterns.h1, `<h1>${newHeading}</h1>`);
      dataStream.writeData({
        type: 'html-smart-update',
        content: JSON.stringify({ operation: 'heading-update', success: true })
      });
    }
  }
  
  if (lowerDesc.includes('footer')) {
    if (lowerDesc.includes('remove')) {
      content = content.replace(patterns.footer, '');
    } else {
      const newFooter = extractNewContent(description, 'footer');
      if (newFooter) {
        content = content.replace(patterns.footer, `<footer>${newFooter}</footer>`);
      }
    }
    dataStream.writeData({
      type: 'html-smart-update',
      content: JSON.stringify({ operation: 'footer-update', success: true })
    });
  }

  // Send final content
  dataStream.writeData({
    type: 'html-delta',
    content: content,
  });
  
  dataStream.writeData({
    type: 'finish',
    content: ''
  });

  return content;
}

// Method 2: String manipulation for simple text changes
async function stringManipulationUpdate(params: UpdateParams): Promise<string> {
  const { document, description, dataStream } = params;
  let content = document.content || '';
  
  console.log('Using string manipulation update method');
  
  // Use AI to generate simple find/replace operations
  const prompt = `
Given this HTML content and update request, provide a simple JSON response with find/replace operations.

HTML Content:
${content}

Update Request: ${description}

Respond with JSON in this format:
{
  "operations": [
    {
      "find": "exact text to find",
      "replace": "new text to replace with"
    }
  ]
}

Only include operations that will actually change the content. Be precise with the find strings.
`;

  const { fullStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: prompt,
    prompt: description,
    schema: z.object({
      operations: z.array(z.object({
        find: z.string(),
        replace: z.string()
      }))
    }),
  });

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object?.operations) {
      const operations = delta.object.operations;
      
      for (const op of operations) {
        if (op?.find && op.replace && content.includes(op.find)) {
          content = content.replace(op.find, op.replace);
          dataStream.writeData({
            type: 'html-smart-update',
            content: JSON.stringify({ 
              operation: 'string-replace', 
              find: op.find.substring(0, 50),
              success: true 
            })
          });
        }
      }
      
      dataStream.writeData({
        type: 'html-delta',
        content: content,
      });
      
      dataStream.writeData({
        type: 'finish',
        content: ''
      });
    }
  }

  return content;
}

// Method 3: Template-based updates for structured changes
async function templateBasedUpdate(params: UpdateParams): Promise<string> {
  const { document, description, dataStream } = params;
  let content = document.content || '';
  
  console.log('Using template-based update method');
  
  // Parse HTML into sections
  const sections = parseHtmlSections(content);
  
  // Use AI to generate new content for specific sections
  const prompt = `
Update the following HTML sections based on the request. Only modify the sections that need changes.

Current sections:
${JSON.stringify(sections, null, 2)}

Update request: ${description}

Respond with JSON containing only the sections that need to be updated:
{
  "updatedSections": {
    "sectionName": "new HTML content for this section"
  }
}
`;

  const { fullStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: prompt,
    prompt: description,
    schema: z.object({
      updatedSections: z.record(z.string())
    }),
  });

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object?.updatedSections) {
      const updates = delta.object.updatedSections;
      
      // Apply section updates
      for (const [sectionName, newContent] of Object.entries(updates)) {
        if (sections[sectionName] && newContent) {
          content = content.replace(sections[sectionName], newContent);
          dataStream.writeData({
            type: 'html-smart-update',
            content: JSON.stringify({ 
              operation: 'section-update', 
              section: sectionName,
              success: true 
            })
          });
        }
      }
      
      dataStream.writeData({
        type: 'html-delta',
        content: content,
      });
      
      dataStream.writeData({
        type: 'finish',
        content: ''
      });
    }
  }

  return content;
}

// Method 4: Diff-based updates
async function diffBasedUpdate(params: UpdateParams): Promise<string> {
  const { document, description, dataStream } = params;
  const originalContent = document.content || '';
  
  console.log('Using diff-based update method');
  
  // Generate new content and create a diff
  const { fullStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: updateDocumentPrompt(originalContent, 'html'),
    prompt: description,
    schema: z.object({
      html: z.string(),
    }),
  });

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object?.html) {
      const newContent = delta.object.html;
      
      // Apply intelligent merging to preserve unchanged parts
      const mergedContent = intelligentMerge(originalContent, newContent);
      
      dataStream.writeData({
        type: 'html-delta',
        content: mergedContent,
      });
      
      dataStream.writeData({
        type: 'finish',
        content: ''
      });
      
      return mergedContent;
    }
  }

  return originalContent;
}

// Method 5: Regex + Search and Replace Block method
async function regexBlockReplaceUpdate(params: UpdateParams): Promise<string> {
  const { document, description, dataStream } = params;
  let content = document.content || '';
  
  console.log('Using regex block replace update method');
  
  // Use AI to generate regex patterns and replacement blocks
  const prompt = `
You are an expert at HTML regex patterns and block replacements. Given the HTML content and update request, 
provide regex patterns and replacement blocks for complex HTML modifications.

HTML Content:
${content}

Update Request: ${description}

Respond with JSON containing regex operations:
{
  "operations": [
    {
      "type": "regex_replace",
      "pattern": "regex pattern (without delimiters)",
      "flags": "regex flags (g, i, m, s)",
      "replacement": "replacement content with $1, $2 capture groups if needed",
      "description": "what this operation does"
    },
    {
      "type": "block_replace",
      "startPattern": "pattern to find start of block",
      "endPattern": "pattern to find end of block", 
      "newContent": "entire new content for the block",
      "description": "what this operation does"
    }
  ]
}

Use regex_replace for pattern-based substitutions and block_replace for replacing entire sections.
Be precise with patterns and ensure they will match the actual content.
`;

  const { fullStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: prompt,
    prompt: description,
    schema: z.object({
      operations: z.array(z.object({
        type: z.enum(['regex_replace', 'block_replace']),
        pattern: z.string().optional(),
        flags: z.string().optional(),
        replacement: z.string().optional(),
        startPattern: z.string().optional(),
        endPattern: z.string().optional(),
        newContent: z.string().optional(),
        description: z.string().optional()
      }))
    }),
  });

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object?.operations) {
      const operations = delta.object.operations;
      
      for (const op of operations) {
        if (!op) continue;
        
        try {
          if (op.type === 'regex_replace' && op.pattern && op.replacement) {
            const flags = op.flags || 'g';
            const regex = new RegExp(op.pattern, flags);
            const oldContent = content;
            content = content.replace(regex, op.replacement);
            
            if (content !== oldContent) {
              dataStream.writeData({
                type: 'html-smart-update',
                content: JSON.stringify({ 
                  operation: 'regex-replace',
                  pattern: op.pattern.substring(0, 50),
                  description: op.description,
                  success: true 
                })
              });
            }
          } else if (op.type === 'block_replace' && op.startPattern && op.endPattern && op.newContent) {
            const blockRegex = new RegExp(
              `${op.startPattern}[\\s\\S]*?${op.endPattern}`, 
              'gi'
            );
            const oldContent = content;
            content = content.replace(blockRegex, op.newContent);
            
            if (content !== oldContent) {
              dataStream.writeData({
                type: 'html-smart-update',
                content: JSON.stringify({ 
                  operation: 'block-replace',
                  description: op.description,
                  success: true 
                })
              });
            }
          }
        } catch (error) {
          console.warn('Failed to apply regex operation:', op, error);
          dataStream.writeData({
            type: 'html-smart-update',
            content: JSON.stringify({ 
              operation: 'regex-error',
              error: error instanceof Error ? error.message : String(error),
              success: false 
            })
          });
        }
      }
      
      dataStream.writeData({
        type: 'html-delta',
        content: content,
      });
      
      dataStream.writeData({
        type: 'finish',
        content: ''
      });
    }
  }

  return content;
}

// Method 6: Simplified smart update (improved version)
async function simplifiedSmartUpdate(params: UpdateParams): Promise<string> {
  const { document, description, dataStream } = params;
  let content = document.content || '';
  
  console.log('Using simplified smart update method');
  
  const prompt = `
You are an HTML editor. Given the current HTML and update request, provide specific operations to modify the HTML.

Current HTML:
${content}

Update request: ${description}

Respond with JSON containing operations:
{
  "operations": [
    {
      "method": "replace|insert|remove|modify",
      "target": "CSS selector or text to find",
      "content": "new content (if applicable)",
      "position": "before|after|inside|replace"
    }
  ]
}

Be specific and ensure operations will actually change the content.
`;

  const { fullStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: prompt,
    prompt: description,
    schema: z.object({
      operations: z.array(z.object({
        method: z.enum(['replace', 'insert', 'remove', 'modify']),
        target: z.string(),
        content: z.string().optional(),
        position: z.enum(['before', 'after', 'inside', 'replace']).optional()
      }))
    }),
  });

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object?.operations) {
      const operations = delta.object.operations;
      
      for (const op of operations) {
        try {
          if (op?.method && op.target) {
            content = applySimpleOperation(content, op);
            dataStream.writeData({
              type: 'html-smart-update',
              content: JSON.stringify({ 
                operation: op.method,
                target: op.target.substring(0, 30),
                success: true 
              })
            });
          }
        } catch (error) {
          console.warn('Failed to apply operation:', op, error);
        }
      }
      
      dataStream.writeData({
        type: 'html-delta',
        content: content,
      });
      
      dataStream.writeData({
        type: 'finish',
        content: ''
      });
    }
  }

  return content;
}

// Fallback to regular update
async function fallbackRegularUpdate(params: UpdateParams): Promise<string> {
  const { document, description, dataStream } = params;
  let draftContent = '';
  
  console.log('Using fallback regular update');
  
  const { fullStream } = streamText({
    model: myProvider.languageModel('artifact-model'),
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

  return draftContent || document.content || '';
}

// Helper functions
function determineUpdateMethod(description: string, content: string): UpdateMethod {
  const lowerDesc = description.toLowerCase();
  
  // Check for specific method requests
  if (lowerDesc.includes('regex block') || lowerDesc.includes('block replace') || lowerDesc.includes('regex replace')) {
    return UpdateMethod.REGEX_BLOCK_REPLACE;
  }
  
  if (lowerDesc.includes('regex') || lowerDesc.includes('pattern')) {
    return UpdateMethod.REGEX_UPDATE;
  }
  
  if (lowerDesc.includes('simple') || lowerDesc.includes('text only')) {
    return UpdateMethod.STRING_MANIPULATION;
  }
  
  if (lowerDesc.includes('section') || lowerDesc.includes('template')) {
    return UpdateMethod.TEMPLATE_BASED;
  }
  
  if (lowerDesc.includes('diff') || lowerDesc.includes('merge')) {
    return UpdateMethod.DIFF_BASED;
  }
  
  // Auto-detect based on content and request complexity
  if (lowerDesc.includes('complex') || lowerDesc.includes('advanced') || lowerDesc.includes('multiple')) {
    return UpdateMethod.REGEX_BLOCK_REPLACE;
  }
  
  if (content.length > 5000 && (lowerDesc.includes('small') || lowerDesc.includes('minor'))) {
    return UpdateMethod.STRING_MANIPULATION;
  }
  
  if (lowerDesc.includes('title') || lowerDesc.includes('heading') || lowerDesc.includes('footer')) {
    return UpdateMethod.REGEX_UPDATE;
  }
  
  // Use regex block replace for complex HTML structure changes
  if (lowerDesc.includes('restructure') || lowerDesc.includes('reorganize') || 
      lowerDesc.includes('replace all') || lowerDesc.includes('change all')) {
    return UpdateMethod.REGEX_BLOCK_REPLACE;
  }
  
  return UpdateMethod.SMART_UPDATE;
}

function extractNewContent(description: string, type: string): string | null {
  const patterns = {
    title: /title[^"]*["']([^"']+)["']/i,
    heading: /heading[^"]*["']([^"']+)["']/i,
    footer: /footer[^"]*["']([^"']+)["']/i
  };
  
  const match = description.match(patterns[type as keyof typeof patterns]);
  return match ? match[1] : null;
}

function parseHtmlSections(html: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Extract common sections
  const sectionPatterns = {
    header: /<header[^>]*>[\s\S]*?<\/header>/gi,
    nav: /<nav[^>]*>[\s\S]*?<\/nav>/gi,
    main: /<main[^>]*>[\s\S]*?<\/main>/gi,
    footer: /<footer[^>]*>[\s\S]*?<\/footer>/gi,
    title: /<title[^>]*>[\s\S]*?<\/title>/gi
  };
  
  for (const [name, pattern] of Object.entries(sectionPatterns)) {
    const match = html.match(pattern);
    if (match) {
      sections[name] = match[0];
    }
  }
  
  return sections;
}

function intelligentMerge(original: string, updated: string): string {
  // Simple intelligent merge - preserve structure, update content
  // This is a simplified version - could be enhanced with proper diff algorithms
  
  const originalSections = parseHtmlSections(original);
  const updatedSections = parseHtmlSections(updated);
  
  let result = original;
  
  // Replace sections that have changed
  for (const [sectionName, updatedContent] of Object.entries(updatedSections)) {
    if (originalSections[sectionName] && originalSections[sectionName] !== updatedContent) {
      result = result.replace(originalSections[sectionName], updatedContent);
    }
  }
  
  return result;
}

function applySimpleOperation(content: string, operation: any): string {
  const { method, target, content: newContent, position } = operation;
  
  switch (method) {
    case 'replace':
      if (content.includes(target)) {
        return content.replace(target, newContent || '');
      }
      break;
      
    case 'insert': {
      const targetIndex = content.indexOf(target);
      if (targetIndex !== -1) {
        switch (position) {
          case 'before':
            return content.slice(0, targetIndex) + newContent + content.slice(targetIndex);
          case 'after': {
            const afterIndex = targetIndex + target.length;
            return content.slice(0, afterIndex) + newContent + content.slice(afterIndex);
          }
          case 'inside': {
            // Insert at the end of the target element
            const endTag = target.replace('<', '</');
            const endIndex = content.indexOf(endTag, targetIndex);
            if (endIndex !== -1) {
              return content.slice(0, endIndex) + newContent + content.slice(endIndex);
            }
            break;
          }
        }
      }
      break;
    }
      
    case 'remove':
      return content.replace(target, '');
      
    case 'modify':
      // Use DOM manipulation for more complex modifications
      try {
        const dom = new JSDOM(content);
        const elements = dom.window.document.querySelectorAll(target);
        
        if (elements.length > 0) {
          elements.forEach(el => {
            if (newContent) {
              el.innerHTML = newContent;
            }
          });
          return dom.serialize();
        }
      } catch (error) {
        console.warn('DOM modification failed, falling back to string replace');
        return content.replace(target, newContent || '');
      }
      break;
  }
  
  return content;
}
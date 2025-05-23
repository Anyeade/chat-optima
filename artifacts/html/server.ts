import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler, } from '@/lib/artifacts/server';
import type { DataStreamWriter } from 'ai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { htmlPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import type { Document } from '@/lib/db/schema';

// Define a schema for HTML smart updates
/**
 * HTML Smart Update Schema
 * 
 * This schema defines the structure for performing targeted updates to HTML documents
 * instead of completely rewriting them. This allows for more efficient updates, especially
 * for large HTML documents or when making small changes.
 * 
 * The schema supports three types of operations:
 * 1. 'replace' - Find and replace specific content (requires 'search' and 'replace' fields)
 * 2. 'add' - Add new content (requires 'position', 'target', and 'content' fields)
 * 3. 'remove' - Remove specific content (requires 'search' field)
 */
const htmlSmartUpdateSchema = z.object({
  updates: z.array(z.object({
    type: z.enum(['replace', 'add', 'remove']),
    search: z.string().optional(),
    replace: z.string().optional(),
    position: z.enum(['start', 'end', 'before', 'after']).optional(),
    target: z.string().optional(),
    content: z.string().optional(),
  })),
});

// Type for the smart update function parameters
interface SmartUpdateParams {
  document: Document;
  description: string;
  dataStream: DataStreamWriter;
}

export const htmlDocumentHandler = createDocumentHandler<'html'>({
  kind: 'html',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: htmlPrompt,
      prompt: title,
      schema: z.object({
        html: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { html } = object;

        if (html) {
          dataStream.writeData({
            type: 'html-delta',
            content: html,
          });

          draftContent = html;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {    // Initialize with existing content or empty string to ensure we always have valid HTML
    let draftContent = document.content || '';

    // Check if this is a smart update request by looking for specific keywords in the description
    // Users can trigger smart updates by including these phrases in their update instructions
    const isSmartUpdate = description.toLowerCase().includes('smart update') || 
                          description.toLowerCase().includes('search and replace') ||
                          description.toLowerCase().includes('specific change') ||
                          description.toLowerCase().includes('targeted update');

    if (isSmartUpdate) {
      console.log('Using smart update for HTML document');
      return await smartUpdateDocument({ document, description, dataStream });
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'html'),
      prompt: description,
      schema: z.object({
        html: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { html } = object;

        if (html) {
          const formattedHtml = html.trim();
          dataStream.writeData({
            type: 'html-delta',
            content: formattedHtml,
          });

          draftContent = formattedHtml;
        }
      }
    }

    return draftContent;
  },
});

// Smart update function for HTML documents
/**
 * Performs smart updates on HTML documents by generating and applying targeted
 * update operations rather than rewriting the entire document.
 * 
 * Smart updates are more efficient for:
 * - Large HTML documents
 * - Small targeted changes
 * - Preserving the original structure of the document
 * 
 * The function:
 * 1. Prompts the AI to generate specific update operations
 * 2. Applies each operation sequentially to the document
 * 3. Sends updates to the client for real-time feedback
 * 
 * @param params The SmartUpdateParams object containing document, description, and dataStream
 * @returns The updated HTML content
 */
async function smartUpdateDocument(params: SmartUpdateParams): Promise<string> {
  // Get existing content
  const { document, description, dataStream } = params;
  let draftContent = document.content || '';
  
  const smartUpdatePrompt = `
You are a precise HTML editor that performs targeted updates without rewriting the entire document.
Given the HTML content below and the user's update request, generate a JSON response that contains
an array of specific update operations. Each operation should be one of:

1. 'replace' - Find and replace specific content (requires 'search' and 'replace' fields)
2. 'add' - Add new content (requires 'position', 'target', and 'content' fields)
3. 'remove' - Remove specific content (requires 'search' field)

The operations will be applied in sequence.

Current HTML content:
${draftContent}

Update request: ${description}

Respond ONLY with JSON in the following format:
{
  "updates": [
    {
      "type": "replace",
      "search": "exact string to find",
      "replace": "new string to insert"
    },
    {
      "type": "add",
      "position": "before|after|start|end",
      "target": "element or content to target",
      "content": "content to add"
    },
    {
      "type": "remove",
      "search": "exact string to remove"
    }
  ]
}

Make changes as minimal and precise as possible. Include enough context in search strings to uniquely identify the sections.
`;

  const { fullStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: smartUpdatePrompt,
    prompt: description,
    schema: htmlSmartUpdateSchema,
  });

  let updates: any[] = [];
  
  for await (const delta of fullStream) {
    const { type } = delta;

    if (type === 'object') {
      const { object } = delta;
      
      if (object?.updates) {
        updates = object.updates;
        
        // Apply each update sequentially to the draft content
        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];
          
          // Notify about each update
          dataStream.writeData({
            type: 'html-smart-update',
            content: JSON.stringify(update),
          });
          
          // Apply the update to the draft content
          try {
            if (update.type === 'replace' && update.search && update.replace) {
              // Check if the search string exists in the content
              if (draftContent.includes(update.search)) {
                // For safety, only replace the first occurrence to avoid unexpected changes
                // Can be modified to replace all occurrences if needed
                draftContent = draftContent.replace(update.search, update.replace);
              } else {
                // Log warning if search string not found
                console.warn(`Smart update warning: Search string not found for replace operation: "${update.search.substring(0, 50)}..."`);
              }
            } else if (update.type === 'add' && update.position && update.target && update.content) {
              const targetIndex = draftContent.indexOf(update.target);
              
              if (targetIndex !== -1) {
                if (update.position === 'before') {
                  draftContent = draftContent.slice(0, targetIndex) + update.content + draftContent.slice(targetIndex);
                } else if (update.position === 'after') {
                  const insertPos = targetIndex + update.target.length;
                  draftContent = draftContent.slice(0, insertPos) + update.content + draftContent.slice(insertPos);
                } else if (update.position === 'start') {
                  // For 'start', we assume target is an element and we insert after its opening tag
                  const closingBracketPos = draftContent.indexOf('>', targetIndex);
                  if (closingBracketPos !== -1) {
                    draftContent = draftContent.slice(0, closingBracketPos + 1) + update.content + draftContent.slice(closingBracketPos + 1);
                  } else {
                    console.warn(`Smart update warning: Could not find closing bracket for 'start' position in target: "${update.target.substring(0, 50)}..."`);
                  }
                } else if (update.position === 'end') {
                  // For 'end', we assume target is an element and we insert before its closing tag
                  const tagName = update.target.match(/<([a-zA-Z0-9-]+)/)?.[1];
                  if (tagName) {
                    const closingTagRegex = new RegExp(`</${tagName}[^>]*>`, 'i');
                    const closingTagMatch = draftContent.substring(targetIndex).match(closingTagRegex);
                    
                    if (closingTagMatch && closingTagMatch.index !== undefined) {
                      const closingTagIndex = targetIndex + closingTagMatch.index;
                      draftContent = draftContent.slice(0, closingTagIndex) + update.content + draftContent.slice(closingTagIndex);
                    } else {
                      console.warn(`Smart update warning: Could not find closing tag for element: "${tagName}"`);
                    }
                  } else {
                    console.warn(`Smart update warning: Could not extract tag name from target: "${update.target.substring(0, 50)}..."`);
                  }
                }
              } else {
                console.warn(`Smart update warning: Target not found for add operation: "${update.target.substring(0, 50)}..."`);
              }
            } else if (update.type === 'remove' && update.search) {
              // Check if the search string exists in the content
              if (draftContent.includes(update.search)) {
                draftContent = draftContent.replace(update.search, '');
              } else {
                console.warn(`Smart update warning: Search string not found for remove operation: "${update.search.substring(0, 50)}..."`);
              }
            } else {
              console.warn(`Smart update warning: Invalid or incomplete update operation:`, update);
            }
          } catch (error) {
            console.error('Error applying smart update:', error);
            // Continue processing other updates even if one fails
          }
        }
        
        // Send the final updated content
        dataStream.writeData({
          type: 'html-delta',
          content: draftContent,
        });
      }
    }
  }

  return draftContent;
}

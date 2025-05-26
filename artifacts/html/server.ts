import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler, } from '@/lib/artifacts/server';
import type { DataStreamWriter } from 'ai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { htmlPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import type { Document } from '@/lib/db/schema';
import { JSDOM } from 'jsdom';

// Define a schema for HTML smart updates
/**
 * HTML Smart Update Schema
 * 
 * This schema defines the structure for performing targeted updates to HTML documents
 * instead of completely rewriting them. This allows for more efficient updates, especially
 * for large HTML documents or when making small changes.
 * 
 * The schema supports two approaches for updates:
 * 1. String-based operations (traditional):
 *    - 'replace' - Find and replace specific content (requires 'search' and 'replace' fields)
 *    - 'add' - Add new content (requires 'position', 'target', and 'content' fields)
 *    - 'remove' - Remove specific content (requires 'search' field)
 * 
 * 2. DOM-based operations (advanced):
 *    - 'replace' with 'selector' - Replace content of elements matching a CSS selector
 *    - 'add' with 'selector' - Add content relative to elements matching a CSS selector
 *    - 'remove' with 'selector' - Remove elements matching a CSS selector
 *    - These operations use a full HTML parser for more precise changes
 */
const htmlSmartUpdateSchema = z.object({
  updates: z.array(z.object({
    type: z.enum(['replace', 'add', 'remove']),
    search: z.string().optional(),
    replace: z.string().optional(),
    position: z.enum(['start', 'end', 'before', 'after']).optional(),
    target: z.string().optional(),
    content: z.string().optional(),
    selector: z.string().optional(), // CSS selector for precise targeting
    useParser: z.boolean().optional(), // Flag to use advanced HTML parsing
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
          
          // Signal that this is the final content
          dataStream.writeData({
            type: 'finish',
            content: ''
          });
        }
      }
    }

    return draftContent;
  },

  onUpdateDocument: async ({ document, description, dataStream }) => {
    // Initialize with existing content or empty string to ensure we always have valid HTML
    let draftContent = document.content || '';

    // Check if this is a smart update request by looking for specific keywords in the description
    // Users can trigger smart updates by including these phrases in their update instructions
    const isSmartUpdate = description.toLowerCase().includes('smart update') || 
                          description.toLowerCase().includes('search and replace') ||
                          description.toLowerCase().includes('specific change') ||
                          description.toLowerCase().includes('targeted update');
    
    // Also detect common HTML element updates that benefit from smart updates
    const lowerDesc = description.toLowerCase();
    const commonHtmlOperations = [
      'add footer', 'update footer', 'change footer', 'modify footer', 'remove footer',
      'add header', 'update header', 'change header', 'modify header', 'remove header',
      'add navigation', 'update navigation', 'change navigation', 'modify navigation', 'remove navigation',
      'add section', 'update section', 'change section', 'modify section', 'remove section'
    ];
    
    const isCommonHtmlOperation = commonHtmlOperations.some(op => lowerDesc.includes(op));
    
    if (isSmartUpdate || isCommonHtmlOperation) {
      console.log('Using smart update for HTML document');
      if (isCommonHtmlOperation && !isSmartUpdate) {
        // Send a note to the client that we're using smart update for this common operation
        dataStream.writeData({
          type: 'html-smart-update',
          content: JSON.stringify({
            info: "Using smart update for better precision with HTML structure changes"
          })
        });
      }
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
          
          // Signal that this is the final content
          dataStream.writeData({
            type: 'finish',
            content: ''
          });
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
an array of specific update operations. You should prefer using DOM-based operations with CSS selectors
for most HTML structure changes, as they are more precise and reliable.

CRITICAL: Make sure your operations will actually change the document content. Be specific and accurate.

DOM-based operations (PREFERRED for most structural HTML changes):
1. 'replace' with 'selector' - Replace content of elements matching a CSS selector (requires 'selector' and 'replace' fields)
2. 'add' with 'selector' - Add content relative to elements matching a CSS selector (requires 'selector', 'position', and 'content' fields)
3. 'remove' with 'selector' - Remove elements matching a CSS selector (requires only 'selector' field)

String-based operations (use only for simple text changes or when DOM operations won't work):
1. 'replace' - Find and replace specific content (requires 'search' and 'replace' fields)
2. 'add' - Add new content (requires 'position', 'target', and 'content' fields)
3. 'remove' - Remove specific content (requires 'search' field)

For common HTML elements, ALWAYS use DOM-based operations. For example:
- To add/modify a footer: Use a selector like "footer" or ".footer"
- To change headings: Use selectors like "h1", "h2", etc.
- To modify specific sections: Use class or id selectors like "#main-content" or ".navigation"

The operations will be applied in sequence.

Current HTML content:
${draftContent}

Update request: ${description}

Respond ONLY with JSON in the following format:
{
  "updates": [
    {
      "type": "replace",
      "selector": "footer",
      "replace": "<p>New footer content</p>",
      "useParser": true
    },
    {
      "type": "add",
      "selector": "body",
      "position": "end",
      "content": "<div class='new-section'>New content here</div>",
      "useParser": true
    },
    {
      "type": "remove",
      "selector": ".unused-element",
      "useParser": true
    },
    {
      "type": "replace",
      "search": "exact text to find",
      "replace": "new text to insert"
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
  let hasValidUpdates = false;
  
  for await (const delta of fullStream) {
    const { type } = delta;

    if (type === 'object') {
      const { object } = delta;
      
      if (object?.updates) {
        updates = object.updates;
        hasValidUpdates = true;
        
        console.log(`Processing ${updates.length} smart update operations`);
        
        // Apply each update sequentially to the draft content
        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];
          
          // Store original content to verify changes
          const beforeContent = draftContent;
          
          // Notify about each update being applied
          dataStream.writeData({
            type: 'html-smart-update',
            content: JSON.stringify({
              ...update,
              status: 'applying',
              step: i + 1,
              total: updates.length
            }),
          });

          // Apply the update to the draft content
          try {
            // Check if we should use the advanced DOM parser
            if (update.useParser === true || update.selector) {
              // Use the DOM-based approach for more precise updates
              draftContent = performDomOperation(draftContent, update);
            } else if (update.type === 'replace' && update.search && update.replace) {
              // Use the traditional string replace approach
              if (draftContent.includes(update.search)) {
                // For safety, only replace the first occurrence to avoid unexpected changes
                draftContent = draftContent.replace(update.search, update.replace);
              } else {
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

            // Verify the update made a change
            if (beforeContent === draftContent) {
              console.warn(`Smart update warning: Operation ${i + 1} did not modify the content`);
            } else {
              console.log(`Smart update: Operation ${i + 1} successfully applied`);
            }

          } catch (error) {
            console.error('Error applying smart update:', error);
            // Continue processing other updates even if one fails
          }
        }

        // Send the final updated content with proper streaming
        dataStream.writeData({
          type: 'html-delta',
          content: draftContent,
        });
        
        // Signal that this is the final content
        dataStream.writeData({
          type: 'finish',
          content: ''
        });
      }
    }
  }

  // If no valid updates were generated, fall back to regular update
  if (!hasValidUpdates) {
    console.log('No smart updates generated, falling back to regular update');
    
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
          
          // Signal that this is the final content
          dataStream.writeData({
            type: 'finish',
            content: ''
          });
        }
      }
    }
  }

  return draftContent;
}

/**
 * Performs HTML operations using DOM parsing for more precise manipulation
 * This allows for CSS selector targeting and proper DOM manipulation
 * 
 * @param html The HTML content to modify
 * @param update The update operation to perform
 * @returns The modified HTML content
 */
function performDomOperation(html: string, update: any): string {
  try {
    // Create a DOM from the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    if (update.type === 'replace' && update.selector && update.replace !== undefined) {
      // Use CSS selector to find elements
      const elements = document.querySelectorAll(update.selector);
      
      if (elements.length === 0) {
        // Special handling for common elements that might not exist yet but should be created
        if (update.selector === 'footer' || 
            update.selector === '.footer' || 
            update.selector.includes('#footer')) {
          // Create a footer if one doesn't exist
          console.log('Creating a new footer element as it does not exist');
          const body = document.querySelector('body');
          if (body) {
            const footer = document.createElement('footer');
            footer.innerHTML = update.replace;
            // Add to end of body
            body.appendChild(footer);
            return dom.serialize();
          }
        }
        
        console.warn(`Smart update warning: No elements found for selector: "${update.selector}"`);
        return html;
      }
      
      // Replace the innerHTML or outerHTML based on the update
      for (const element of elements) {
        if (update.replaceMode === 'outer') {
          // Replace the entire element
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = update.replace;
          if (tempDiv.firstChild && element.parentNode) {
            element.parentNode.replaceChild(tempDiv.firstChild, element);
          }
        } else {
          // Default: replace just the inner content
          element.innerHTML = update.replace;
        }
      }
    } else if (update.type === 'add' && update.selector && update.position && update.content) {
      // Find target elements using CSS selector
      const elements = document.querySelectorAll(update.selector);
      
      // If no elements found, handle special cases
      if (elements.length === 0) {
        // For body-level elements that need to be created
        if (update.selector === 'header' || update.selector === 'footer' || 
            update.selector === 'nav' || update.selector === 'main') {
          const body = document.querySelector('body');
          if (body) {
            // Create the element
            const newElement = document.createElement(update.selector);
            newElement.innerHTML = update.content;
            
            // Add to body in appropriate position
            if (update.selector === 'header' || update.selector === 'nav') {
              // Headers and navs usually go at the top
              body.insertBefore(newElement, body.firstChild);
            } else {
              // Footers and other elements go at the end
              body.appendChild(newElement);
            }
            return dom.serialize();
          }
        }
        
        console.warn(`Smart update warning: No elements found for selector: "${update.selector}"`);
        return html;
      }
      
      // Create the new content as DOM nodes
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = update.content;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      // Apply the addition to all matching elements
      for (const element of elements) {
        const clonedContent = fragment.cloneNode(true);
        
        switch (update.position) {
          case 'before':
            if (element.parentNode) {
              element.parentNode.insertBefore(clonedContent, element);
            }
            break;
          case 'after':
            if (element.parentNode) {
              if (element.nextSibling) {
                element.parentNode.insertBefore(clonedContent, element.nextSibling);
              } else {
                element.parentNode.appendChild(clonedContent);
              }
            }
            break;
          case 'start':
            element.insertBefore(clonedContent, element.firstChild);
            break;
          case 'end':
            element.appendChild(clonedContent);
            break;
        }
      }
    } else if (update.type === 'remove' && update.selector) {
      // Find and remove elements using CSS selector
      const elements = document.querySelectorAll(update.selector);
      
      if (elements.length === 0) {
        console.warn(`Smart update warning: No elements found for selector: "${update.selector}"`);
        return html;
      }
      
      for (const element of elements) {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    }
    
    // Return the serialized HTML
    return dom.serialize();
  } catch (error) {
    console.error('Error in DOM operation:', error);
    // Return original HTML if there was an error
    return html;
  }
}

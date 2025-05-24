import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler, } from '@/lib/artifacts/server';
import type { DataStreamWriter } from 'ai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { htmlPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import type { Document } from '@/lib/db/schema';
import { JSDOM } from 'jsdom';
import { generateUUID } from '@/lib/utils';

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

// Define a schema for HTML suggestions
const htmlSuggestionSchema = z.object({
  originalHtml: z.string().describe('The original HTML snippet that needs to be updated'),
  suggestedHtml: z.string().describe('The suggested improved HTML snippet'),
  description: z.string().describe('Description explaining the suggested change and its benefits'),
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
  },  onUpdateDocument: async ({ document, description, dataStream }) => {    // Initialize with existing content or empty string to ensure we always have valid HTML
    let draftContent = document.content || '';
      // First, determine if we should use smart update mode based on the request
    // We'll use an AI-based approach to determine if the request is for targeted changes rather than a complete rewrite
    const isHtmlModificationRequest = await shouldUseSmartUpdateMode(description, document.content || '');
    
    if (isHtmlModificationRequest) {
      console.log('Using Smart HTML update mode');
      // Signal to the client that we're processing changes in smart mode
      dataStream.writeData({
        type: 'html-smart-update',
        content: JSON.stringify({
          info: "Processing HTML update using Smart Mode"
        })
      });
      
      // Determine the best approach for handling this request and generate appropriate changes
      await processSmartHtmlUpdate({ document, description, dataStream });
      return draftContent; // Return original content, as changes are handled via UI
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
an array of specific update operations. You should prefer using DOM-based operations with CSS selectors
for most HTML structure changes, as they are more precise and reliable.

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
    },
    {
      "type": "remove",
      "selector": "CSS selector",
      "useParser": true
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

/**
 * Generates intelligent HTML suggestions for improving the document without directly modifying it.
 * These suggestions are context-aware and sent to the client as interactive widgets that can be applied selectively.
 * 
 * @param params The SmartUpdateParams object containing document, description, and dataStream
 */
async function generateHtmlSuggestions(params: SmartUpdateParams): Promise<void> {
  const { document, description, dataStream } = params;
  const htmlContent = document.content || '';
  
  // First analyze the document to understand its structure and potential issues
  const documentSummary = summarizeHtmlStructure(htmlContent);
  const stylePatterns = analyzeStylePatterns(htmlContent);
  
  // Identify potential improvement areas based on document analysis
  const improvementAreas = identifyPotentialImprovements(htmlContent, description);
  
  // Use the AI to generate intelligent, context-aware suggestions
  const { elementStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: `You are an expert HTML improvement assistant focusing on high-value, targeted enhancements.
Given an HTML document and user request, generate specific improvement suggestions that can be selectively applied.

Document analysis: ${documentSummary}
Style patterns: ${stylePatterns}
Suggested improvement areas: ${improvementAreas}

Focus on improvements like:
- Enhancing accessibility with ARIA attributes and semantic HTML
- Improving structure using appropriate HTML5 elements
- Optimizing performance (lazy loading, resource hints, etc.)
- Enhancing responsive design and mobile usability
- Implementing SEO best practices
- Fixing potential browser compatibility issues
- Following W3C standards and web best practices

For each suggestion:
1. The original HTML snippet (exactly as it appears in the document)
2. The improved HTML snippet to replace it with
3. A detailed explanation of:
   - What the issue is in the original code
   - How the change addresses the issue
   - The specific benefits achieved (e.g., "Improves screen reader experience" or "Reduces layout shift")

Important: Each originalHtml MUST be an exact string match from the document to enable precise replacement.
Prioritize high-impact, meaningful improvements over trivial changes.`,
    prompt: `HTML document to analyze:

${htmlContent}

User's request for improvements: "${description}"

Generate specific, focused suggestions to improve this HTML document.
Each suggestion should address a distinct issue and provide a clear, targeted improvement.
Ensure your suggestions align with the user's request while maintaining the document's style and purpose.

For each suggestion:
1. Ensure the original HTML is an EXACT string match from the document
2. Make the improved HTML maintain the same style patterns but with enhanced functionality
3. Explain both WHAT was changed and WHY it provides value

Focus on the most impactful improvements first.`,
    output: 'array',
    schema: htmlSuggestionSchema
  });

  // Send each suggestion to the client as it's generated
  let suggestionCount = 0;
  for await (const element of elementStream) {
    suggestionCount++;
    
    const suggestion = {
      id: generateUUID(),
      documentId: document.id,
      originalText: element.originalHtml,
      suggestedText: element.suggestedHtml,
      description: `${element.description} (Suggestion ${suggestionCount})`,
      isResolved: false,
      type: 'improvement-suggestion',
      category: categorizeImprovement(element.description)
    };

    // Send the suggestion to the client
    dataStream.writeData({
      type: 'suggestion',
      content: suggestion
    });
  }
  
  // If no suggestions were generated, notify the user
  if (suggestionCount === 0) {
    dataStream.writeData({
      type: 'html-smart-update',
      content: JSON.stringify({
        info: "No specific improvements could be suggested. Your HTML may already follow best practices or try a different request."
      })
    });
  }
}

/**
 * Identifies potential improvement areas in an HTML document.
 * Performs basic analysis to find common issues that could be improved.
 * 
 * @param htmlContent The HTML content to analyze
 * @param description The user's description of desired improvements
 * @returns A string describing potential improvement areas
 */
function identifyPotentialImprovements(htmlContent: string, description: string): string {
  try {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    const issues: string[] = [];
    
    // Accessibility checks
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])').length;
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt attributes`);
    }
    
    const linksWithoutText = document.querySelectorAll('a:empty').length;
    if (linksWithoutText > 0) {
      issues.push(`${linksWithoutText} empty links without text`);
    }
    
    // Semantic structure checks
    const hasDivs = document.querySelectorAll('div').length > 0;
    const hasSemanticElements = document.querySelectorAll('header, footer, nav, main, article, section, aside').length > 0;
    if (hasDivs && !hasSemanticElements) {
      issues.push('Uses divs without semantic HTML5 elements');
    }
    
    // Responsive design checks
    const hasViewport = document.querySelector('meta[name="viewport"]') !== null;
    if (!hasViewport) {
      issues.push('Missing viewport meta tag for responsive design');
    }
    
    // SEO checks
    const hasTitle = document.querySelector('title') !== null;
    const hasMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"]').length > 0;
    if (!hasTitle || !hasMeta) {
      issues.push('Missing important SEO meta tags');
    }
    
    // Performance indicators
    const unoptimizedImages = document.querySelectorAll('img:not([loading="lazy"])').length;
    if (unoptimizedImages > 5) {
      issues.push('Multiple images not using lazy loading');
    }
    
    // Analyze user request for specific interests
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('accessibility') || lowerDesc.includes('a11y')) {
      issues.push('User requested accessibility improvements');
    }
    if (lowerDesc.includes('responsive') || lowerDesc.includes('mobile')) {
      issues.push('User requested responsive design improvements');
    }
    if (lowerDesc.includes('seo') || lowerDesc.includes('search engine')) {
      issues.push('User requested SEO improvements');
    }
    if (lowerDesc.includes('performance') || lowerDesc.includes('speed')) {
      issues.push('User requested performance improvements');
    }
    
    return issues.length > 0 ? 
      `Potential improvement areas: ${issues.join('; ')}.` : 
      'No obvious issues detected; focusing on general best practices.';
  } catch (error) {
    console.error('Error identifying improvement areas:', error);
    return 'Could not analyze the document for improvements.';
  }
}

/**
 * Categorizes an improvement suggestion based on its description.
 * Helps with organizing and prioritizing suggestions for the user.
 * 
 * @param description The description of the improvement
 * @returns A category string for the improvement
 */
function categorizeImprovement(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('accessibility') || lowerDesc.includes('aria') || 
      lowerDesc.includes('screen reader') || lowerDesc.includes('keyboard')) {
    return 'accessibility';
  }
  
  if (lowerDesc.includes('performance') || lowerDesc.includes('loading') || 
      lowerDesc.includes('speed') || lowerDesc.includes('optimize')) {
    return 'performance';
  }
  
  if (lowerDesc.includes('seo') || lowerDesc.includes('search engine') || 
      lowerDesc.includes('metadata') || lowerDesc.includes('crawl')) {
    return 'seo';
  }
  
  if (lowerDesc.includes('responsive') || lowerDesc.includes('mobile') || 
      lowerDesc.includes('viewport') || lowerDesc.includes('screen size')) {
    return 'responsive';
  }
  
  if (lowerDesc.includes('semantic') || lowerDesc.includes('structure') || 
      lowerDesc.includes('html5') || lowerDesc.includes('organization')) {
    return 'semantic';
  }
  
  if (lowerDesc.includes('style') || lowerDesc.includes('visual') || 
      lowerDesc.includes('appearance') || lowerDesc.includes('layout')) {
    return 'style';
  }
    return 'general';
}

/**
 * Performs precise HTML additions or changes based on user request.
 * These are sent to the client as interactive widgets that can be applied selectively.
 * Enhanced with improved context analysis and more targeted changes.
 * 
 * @param params The SmartUpdateParams object containing document, description, and dataStream
 */
async function generateHtmlAdditions(params: SmartUpdateParams): Promise<void> {
  const { document, description, dataStream } = params;
  const htmlContent = document.content || '';
  
  // First analyze the document structure to better understand context
  const documentSummary = summarizeHtmlStructure(htmlContent);
  
  // Extract existing style patterns to maintain consistency
  const stylePatterns = analyzeStylePatterns(htmlContent);
  
  // Use the AI to generate targeted additions/changes with enhanced context
  const { elementStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: `You are an expert HTML engineer focused on making precise, targeted additions and changes to HTML code.
Given an HTML document and a user request, generate specific code changes that can be selectively applied.

Document analysis: ${documentSummary}
Style patterns: ${stylePatterns}

Important guidelines:
- Make targeted, minimal changes without rewriting unrelated parts
- Place new elements in semantically appropriate locations
- For new elements, identify the best insertion points in the existing HTML
- When modifying existing elements, provide the EXACT original code to be replaced
- Ensure changes maintain visual and functional consistency
- Match existing CSS class naming patterns and styling conventions
- Use the same indentation style as the original document
- Include brief HTML comments explaining the purpose of complex additions

For each change:
1. The original HTML snippet (exactly as it appears in the document)
2. The new HTML snippet to replace it with
3. A clear explanation of what the change accomplishes and why it's beneficial

Break complex requests into multiple smaller, focused changes that can be applied independently.
Make sure changes address the user's request precisely and elegantly.`,
    prompt: `HTML document to update:

${htmlContent}

User's request: "${description}"

Generate targeted HTML changes to implement this request without rewriting the entire document.
For EACH change, ensure:
1. The original HTML is an EXACT string match from the document
2. The new HTML maintains consistent style and structure
3. The description explains both what changed and why

Focus on high-quality, precise changes that implement exactly what the user requested.`,
    output: 'array',
    schema: htmlSuggestionSchema
  });

  // Send each targeted addition/change to the client as it's generated
  let changeCount = 0;
  for await (const element of elementStream) {
    changeCount++;
    
    const change = {
      id: generateUUID(),
      documentId: document.id,
      originalText: element.originalHtml,
      suggestedText: element.suggestedHtml,
      description: `${element.description} (Change ${changeCount})`,
      isResolved: false,
      type: 'targeted-change' // Add a type to distinguish from general suggestions
    };

    // Send the change to the client as a suggestion
    dataStream.writeData({
      type: 'suggestion',
      content: change
    });
  }
  
  // If no changes were generated, notify the user
  if (changeCount === 0) {
    dataStream.writeData({
      type: 'html-smart-update',
      content: JSON.stringify({
        info: "No specific changes could be generated. Try a different request or use full document update mode."
      })
    });
  }
}

/**
 * Analyzes style patterns in HTML content to maintain consistency in updates.
 * Extracts CSS class naming conventions, indentation styles, and other patterns.
 * 
 * @param htmlContent The HTML content to analyze
 * @returns A string describing the style patterns
 */
function analyzeStylePatterns(htmlContent: string): string {
  try {
    // Create a DOM from the HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Extract all class names
    const classNames: string[] = [];
    document.querySelectorAll('[class]').forEach(element => {
      const classes = element.getAttribute('class')?.split(/\s+/) || [];
      classNames.push(...classes);
    });
    
    // Count unique class names and identify patterns
    const uniqueClasses = [...new Set(classNames)].filter(Boolean);
    
    // Detect common class naming patterns (BEM, utility classes, etc.)
    const bemPattern = uniqueClasses.some(c => c.includes('__') || c.includes('--'));
    const tailwindPattern = uniqueClasses.some(c => /^(bg|text|p|m|flex|grid|w|h)-/.test(c));
    const bootstrapPattern = uniqueClasses.some(c => 
      ['container', 'row', 'col', 'btn', 'card', 'nav', 'navbar'].includes(c));
    
    // Detect indentation style
    const indentMatch = htmlContent.match(/^( +)</m);
    const indentStyle = indentMatch ? 
      `${indentMatch[1].length} spaces` : 
      (htmlContent.includes('\t') ? 'tabs' : 'unknown');
    
    // Build pattern summary
    let patterns = `Indentation: ${indentStyle}. `;
    
    if (bemPattern) patterns += 'Using BEM naming convention. ';
    if (tailwindPattern) patterns += 'Using Tailwind-style utility classes. ';
    if (bootstrapPattern) patterns += 'Using Bootstrap-style classes. ';
    
    if (uniqueClasses.length > 0) {
      patterns += `Common classes: ${uniqueClasses.slice(0, 5).join(', ')}`;
      if (uniqueClasses.length > 5) patterns += ' and others';
      patterns += '.';
    }
    
    return patterns;
  } catch (error) {
    console.error('Error analyzing style patterns:', error);
    return 'Style patterns could not be analyzed.';  }
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
    
    if (update.type === 'replace' && update.selector && update.replace) {
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

/**
 * Determines if the user's request should be handled using smart update mode.
 * This function uses AI analysis to determine if the request is for targeted changes
 * rather than a complete document rewrite.
 * 
 * @param description User's update request
 * @param currentContent Current HTML content
 * @returns Boolean indicating if smart update mode is appropriate
 */
async function shouldUseSmartUpdateMode(description: string, currentContent: string): Promise<boolean> {
  // Always use traditional mode for very short or empty content
  if (currentContent.length < 100) return false;
  
  // Use AI to analyze the request and determine if it's a targeted change
  const { fullStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: `You are an HTML update analyzer. Your task is to determine if a user request is asking for:
1. Complete rewrite of HTML content (return false)
2. Targeted changes or enhancements to existing HTML (return true)

Complete rewrites include requests that want to start from scratch, replace all content,
create entirely new HTML, or completely redesign the page.

Targeted changes include requests to:
- Add specific elements like headers, footers, buttons
- Modify specific sections or elements
- Enhance specific aspects like accessibility, responsiveness
- Fix specific issues
- Make style changes to particular elements
- Add functionality to existing elements`,
    prompt: `User HTML update request: "${description}"
Current HTML content size: ${currentContent.length} characters

Should this request be handled with targeted updates (true) or a complete rewrite (false)?
Reply with only true or false.`,
    schema: z.object({
      useSmartMode: z.boolean()
    }),
  });
    // Process the response stream  
  for await (const delta of fullStream) {
    if (delta.type === 'object') {
      return delta.object.useSmartMode === true;
    }
  }
  
  // Default to true for larger documents to preserve structure
  return currentContent.length >= 500;
}

/**
 * Processes HTML updates using the smart mode system, intelligently determining
 * the best approach for handling the specific update request.
 * 
 * @param params The SmartUpdateParams object containing document, description, and dataStream
 */
async function processSmartHtmlUpdate(params: SmartUpdateParams): Promise<void> {
  const { document, description, dataStream } = params;
  const htmlContent = document.content || '';
  
  // Enhanced analysis to determine the most appropriate update approach with more detailed context
  const { fullStream: analyzeStream } = streamObject({
    model: myProvider.languageModel('artifact-model'),
    system: `You are an advanced HTML processing assistant. Given a user request and HTML document context, 
determine the most appropriate way to handle updates. Provide a nuanced analysis based on the complexity
and nature of the requested changes.`,
    prompt: `User's HTML update request: "${description}"

Current HTML document size: ${htmlContent.length} characters
Document structure summary: ${summarizeHtmlStructure(htmlContent)}

Based on this request and document context, determine the most appropriate update approach.
Choose one of:
1. TARGETED_ADDITION - User wants to add specific new elements (new sections, components, etc.)
2. TARGETED_MODIFICATION - User wants to modify specific existing elements (style changes, content updates, etc.)
3. IMPROVEMENT_SUGGESTIONS - User wants general improvements (accessibility, SEO, best practices, etc.)
4. HYBRID_APPROACH - Request requires a combination of targeted changes and suggestions

Consider:
- Specificity of the request
- Complexity of changes needed
- Whether changes affect isolated parts or the entire document
- If changes are structural, aesthetic, functional, or content-related`,
    schema: z.object({
      approach: z.enum(['TARGETED_ADDITION', 'TARGETED_MODIFICATION', 'IMPROVEMENT_SUGGESTIONS', 'HYBRID_APPROACH']),
      confidence: z.number().min(0).max(100).describe('Confidence score for this classification (0-100)'),
      reasoning: z.string().optional().describe('Brief explanation of why this approach was selected')
    }),
  });
  
  // Get the determined approach with confidence
  let updateApproach = 'IMPROVEMENT_SUGGESTIONS'; // Default approach
  let confidence = 0;
  let reasoning = '';
  
  for await (const delta of analyzeStream) {
    if (delta.type === 'object' && delta.object) {
      if (typeof delta.object.approach === 'string') {
        updateApproach = delta.object.approach;
      }
      if (typeof delta.object.confidence === 'number') {
        confidence = delta.object.confidence;
      }
      if (typeof delta.object.reasoning === 'string') {
        reasoning = delta.object.reasoning;
      }
      break;
    }
  }
  
  // Notify the client about the determined approach
  dataStream.writeData({
    type: 'html-smart-update',
    content: JSON.stringify({
      info: `Processing as ${updateApproach.replace(/_/g, ' ').toLowerCase()} (${confidence}% confidence)`,
      details: reasoning
    })
  });
  
  // Use the appropriate update function based on the determined approach and confidence
  switch (updateApproach) {
    case 'TARGETED_ADDITION':
      await generateHtmlAdditions({ document, description, dataStream });
      break;
    
    case 'TARGETED_MODIFICATION':
      await generateHtmlAdditions({ document, description, dataStream });
      break;
    
    case 'HYBRID_APPROACH':
      // For hybrid approaches, generate both targeted changes and general suggestions
      await generateHtmlAdditions({ document, description, dataStream });
      await generateHtmlSuggestions({ document, description, dataStream });
      break;
    
    case 'IMPROVEMENT_SUGGESTIONS':
    default:
      await generateHtmlSuggestions({ document, description, dataStream });
      break;
  }
}

/**
 * Summarizes the structure of an HTML document to provide context for AI analysis.
 * Returns a brief overview of key elements and their nesting.
 * 
 * @param htmlContent The HTML content to summarize
 * @returns A string summarizing the key elements in the HTML document
 */
function summarizeHtmlStructure(htmlContent: string): string {
  try {
    // Create a DOM from the HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Get counts of key elements
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    const paragraphs = document.querySelectorAll('p').length;
    const divs = document.querySelectorAll('div').length;
    const images = document.querySelectorAll('img').length;
    const forms = document.querySelectorAll('form').length;
    const tables = document.querySelectorAll('table').length;
    const sections = document.querySelectorAll('section').length;
    const articles = document.querySelectorAll('article').length;
    const navs = document.querySelectorAll('nav').length;
    const links = document.querySelectorAll('a').length;
    const scripts = document.querySelectorAll('script').length;
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]').length;
    
    // Check for specific structural elements
    const hasHeader = document.querySelector('header') !== null;
    const hasFooter = document.querySelector('footer') !== null;    const hasMain = document.querySelector('main') !== null;
    const hasAside = document.querySelector('aside') !== null;
    const hasNav = document.querySelector('nav') !== null;
    
    // Identify main document structure
    let structure = '';
    
    if (hasHeader) structure += 'header, ';
    if (hasNav) structure += 'nav, ';
    if (hasMain) structure += 'main, ';
    if (sections > 0) structure += `${sections} sections, `;
    if (hasAside) structure += 'aside, ';
    if (hasFooter) structure += 'footer, ';
    
    // Truncate trailing comma and space
    if (structure.endsWith(', ')) {
      structure = structure.substring(0, structure.length - 2);
    }
    
    // Build the summary
    let summary = `Document contains: ${structure}. `;
    summary += `Elements: ${headings} headings, ${paragraphs} paragraphs, ${divs} divs, ${images} images`;
    
    if (forms > 0) summary += `, ${forms} forms`;
    if (tables > 0) summary += `, ${tables} tables`;
    if (links > 0) summary += `, ${links} links`;
    
    // Add meta information
    const hasDoctype = htmlContent.toLowerCase().includes('<!doctype');
    const hasMetaViewport = document.querySelector('meta[name="viewport"]') !== null;
    const hasMetaCharset = document.querySelector('meta[charset]') !== null;
    const hasResponsiveDesign = htmlContent.includes('@media') || hasMetaViewport;
    
    summary += `. Document ${hasDoctype ? 'has' : 'lacks'} doctype declaration`;
    summary += hasResponsiveDesign ? ' and appears to be responsive' : '';
    
    return summary;
  } catch (error) {
    console.error('Error summarizing HTML structure:', error);
    return 'Document structure could not be analyzed.';
  }
}

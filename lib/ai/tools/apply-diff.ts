import { DataStreamWriter, tool } from 'ai';
import { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById, saveDocument } from '@/lib/db/queries';

interface ApplyDiffProps {
  session: Session;
  dataStream: DataStreamWriter;
  selectedChatModel: string;
}

export const applyDiff = ({ session, dataStream, selectedChatModel }: ApplyDiffProps) =>
  tool({
    description: 'Apply precise SEARCH/REPLACE diffs to ANY document or artifact (HTML, CSS, JavaScript, Python, text files, code, etc.). Use this for surgical edits without rewriting entire files. CAPABILITIES: ADD new content (insert at specific points), EDIT existing content (modify text/code), REMOVE content (delete sections), REORGANIZE structure. Perfect for all document modifications: adding features, fixing bugs, styling updates, content changes, removing sections, or restructuring.',
    parameters: z.object({
      id: z.string().describe('The ID of the document/artifact to update (works with ANY document type: HTML, CSS, JS, Python, text, etc.)'),
      diff: z.string().describe(`The diff to apply in SEARCH/REPLACE format:
<<<<<<< SEARCH
:start_line:5
-------
<div class="old-content">
  <p>Old text</p>
</div>
=======
<div class="new-content">
  <p>New text</p>
  <span>Added element</span>
</div>
>>>>>>> REPLACE

Multiple SEARCH/REPLACE blocks can be used in a single diff.`),
      description: z.string().optional().describe('Optional description of the changes being made (e.g., "Added new button", "Fixed styling issue", "Updated function logic", "Modified content")'),
    }),
    execute: async ({ id, diff, description }) => {
      // Clear previous content and show loading state
      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      const selectedDocument = await getDocumentById({ id });

      if (!selectedDocument) {
        dataStream.writeData({
          type: 'tool-call',
          toolName: 'apply_diff',
          args: { title: `Document ${id}`, type: 'apply-diff' },
        });
        
        dataStream.writeData({
          type: 'tool-result',
          toolName: 'apply_diff',
          result: { error: 'Document not found' },
          isError: true,
        });
        
        return {
          success: false
        };
      }

      // Show loading state with the document name
      dataStream.writeData({
        type: 'tool-call',
        toolName: 'apply_diff',
        args: { title: selectedDocument.title, type: 'apply-diff' },
      });

      try {
        // Check if document has content
        if (selectedDocument.content === null) {
          dataStream.writeData({
            type: 'tool-result',
            toolName: 'apply_diff',
            result: { error: 'Document has no content to apply diff to' },
            isError: true,
          });
          
          return {
            success: false
          };
        }

        // Parse and apply the diff
        const updatedContent = await applyDiffToContent(selectedDocument.content, diff);
        
        // Save as new document version (following the same pattern as updateDocument tool)
        // This maintains version history by creating a new row with same id but new createdAt
        if (!session?.user?.id) {
          dataStream.writeData({
            type: 'tool-result',
            toolName: 'apply_diff',
            result: { error: 'User session required to save document changes' },
            isError: true,
          });
          
          return {
            success: false
          };
        }

        await saveDocument({
          id: selectedDocument.id,
          title: selectedDocument.title,
          content: updatedContent,
          kind: selectedDocument.kind,
          userId: session.user.id,
        });

        // Show success result
        const diffBlocks = parseDiffBlocks(diff);
        let summary = `Applied ${diffBlocks.length} change${diffBlocks.length > 1 ? 's' : ''}`;
        if (description) {
          summary += `: ${description}`;
        }

        dataStream.writeData({
          type: 'tool-result',
          toolName: 'apply_diff',
          result: {
            id: selectedDocument.id,
            title: selectedDocument.title,
            kind: selectedDocument.kind,
            summary
          },
          isStreaming: false,
        });

        return {
          success: true
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Send error using React component system
        dataStream.writeData({
          type: 'tool-result',
          toolName: 'apply_diff',
          result: { error: errorMessage },
          isError: true,
        });

        return {
          success: false
        };
      }
    },
  });

/**
 * Parse diff blocks from the diff string
 */
function parseDiffBlocks(diff: string): Array<{
  startLine?: number;
  searchContent: string;
  replaceContent: string;
}> {
  const blocks: Array<{
    startLine?: number;
    searchContent: string;
    replaceContent: string;
  }> = [];

  // Try multiple regex patterns to be more flexible
  const patterns = [
    // Standard format with optional whitespace
    /<<<<<<< SEARCH\s*\n(.*?)\n\s*=======\s*\n(.*?)\n\s*>>>>>>> REPLACE/gs,
    // Alternative format without spaces around markers
    /<<<<<<< SEARCH\n(.*?)\n=======\n(.*?)\n>>>>>>> REPLACE/gs,
    // More flexible format
    /<{7} SEARCH\s*\n(.*?)\n={7}\s*\n(.*?)\n>{7} REPLACE/gs
  ];

  for (const blockRegex of patterns) {
    let match;
    while ((match = blockRegex.exec(diff)) !== null) {
      const searchSection = match[1].trim();
      const replaceSection = match[2].trim();

      // Check for line number with flexible format
      const lineMatch = searchSection.match(/^:start_line:\s*(\d+)\s*\n\s*-+\s*\n(.*)/s);
      
      if (lineMatch) {
        blocks.push({
          startLine: parseInt(lineMatch[1]),
          searchContent: lineMatch[2].trim(),
          replaceContent: replaceSection,
        });
      } else {
        blocks.push({
          searchContent: searchSection,
          replaceContent: replaceSection,
        });
      }
    }
    
    // If we found blocks with this pattern, don't try others
    if (blocks.length > 0) break;
  }

  return blocks;
}

/**
 * Apply diff to content
 */
async function applyDiffToContent(originalContent: string, diff: string): Promise<string> {
  let updatedContent = originalContent;
  const diffBlocks = parseDiffBlocks(diff);

  if (diffBlocks.length === 0) {
    // Add debugging info to help diagnose the issue
    const hasSearchMarker = diff.includes('<<<<<<< SEARCH');
    const hasReplaceMarker = diff.includes('>>>>>>> REPLACE');
    const hasEquals = diff.includes('=======');
    
    let debugInfo = 'Debug info:\n';
    debugInfo += `- Contains <<<<<<< SEARCH: ${hasSearchMarker}\n`;
    debugInfo += `- Contains >>>>>>> REPLACE: ${hasReplaceMarker}\n`;
    debugInfo += `- Contains =======: ${hasEquals}\n`;
    debugInfo += `- Diff length: ${diff.length} characters\n`;
    debugInfo += `- First 200 chars: ${diff.substring(0, 200)}...\n`;
    
    // Provide specific guidance based on what's missing
    let guidance = '\n🔧 COMMON FIXES:\n';
    if (hasSearchMarker && !hasEquals) {
      guidance += '- Add "=======" separator between search and replace sections\n';
    }
    if (hasSearchMarker && !hasReplaceMarker) {
      guidance += '- Add ">>>>>>> REPLACE" at the end of your diff block\n';
    }
    if (!hasSearchMarker) {
      guidance += '- Start with "<<<<<<< SEARCH" marker\n';
    }
    guidance += '- Ensure ALL three markers are present: <<<<<<< SEARCH, =======, >>>>>>> REPLACE\n';
    
    throw new Error(`No valid SEARCH/REPLACE blocks found in diff.\n\n${debugInfo}${guidance}\n\nRequired format:\n<<<<<<< SEARCH\n:start_line:X\n-------\nexact text to find\n=======\nreplacement text\n>>>>>>> REPLACE`);
  }

  // Apply each diff block
  for (const block of diffBlocks) {
    const { searchContent, replaceContent, startLine } = block;

    if (startLine) {
      // Line-based replacement
      const lines = updatedContent.split('\n');
      const searchLines = searchContent.split('\n');
      
      // Find the search content starting at the specified line
      let found = false;
      for (let i = startLine - 1; i <= lines.length - searchLines.length; i++) {
        const candidateLines = lines.slice(i, i + searchLines.length);
        if (candidateLines.join('\n') === searchContent) {
          // Replace the lines
          const replaceLines = replaceContent.split('\n');
          lines.splice(i, searchLines.length, ...replaceLines);
          updatedContent = lines.join('\n');
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Try fuzzy matching by trimming whitespace
        for (let i = startLine - 1; i <= lines.length - searchLines.length; i++) {
          const candidateLines = lines.slice(i, i + searchLines.length);
          const trimmedCandidate = candidateLines.map(line => line.trim()).join('\n');
          const trimmedSearch = searchLines.map(line => line.trim()).join('\n');
          
          if (trimmedCandidate === trimmedSearch) {
            // Replace the lines
            const replaceLines = replaceContent.split('\n');
            lines.splice(i, searchLines.length, ...replaceLines);
            updatedContent = lines.join('\n');
            found = true;
            break;
          }
        }
        
        if (!found) {
          throw new Error(`Search content not found at line ${startLine}. Check that the content exists and try a shorter, more unique search phrase.`);
        }
      }
    } else {
      // String-based replacement
      if (!updatedContent.includes(searchContent)) {
        // Try fuzzy matching by normalizing whitespace
        const normalizedContent = updatedContent.replace(/\s+/g, ' ').trim();
        const normalizedSearch = searchContent.replace(/\s+/g, ' ').trim();
        
        if (normalizedContent.includes(normalizedSearch)) {
          // Find the original text with different whitespace
          const regex = new RegExp(searchContent.replace(/\s+/g, '\\s+'), 'g');
          updatedContent = updatedContent.replace(regex, replaceContent);
        } else {
          // Show context around potential matches
          const words = searchContent.split(/\s+/).slice(0, 3).join(' ');
          const contextMatch = updatedContent.match(new RegExp(`.{0,100}${words.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,100}`, 'i'));
          const context = contextMatch ? contextMatch[0] : 'No similar content found';
          
          throw new Error(`Search content not found. Try using a shorter, more unique search phrase or check that the content exists in the document.`);
        }
      } else {
        updatedContent = updatedContent.replace(searchContent, replaceContent);
      }
    }
  }

  return updatedContent;
}

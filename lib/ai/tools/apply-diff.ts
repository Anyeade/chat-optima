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
      const selectedDocument = await getDocumentById({ id });

      if (!selectedDocument) {
        return {
          error: 'Document not found',
        };
      }

      dataStream.writeData({
        type: 'clear',
        content: selectedDocument.title,
      });

      try {
        // Check if document has content
        if (selectedDocument.content === null) {
          return {
            error: 'Document has no content to apply diff to',
          };
        }

        // Parse and apply the diff
        const updatedContent = await applyDiffToContent(selectedDocument.content, diff);
        
        // Save as new document version (following the same pattern as updateDocument tool)
        // This maintains version history by creating a new row with same id but new createdAt
        if (!session?.user?.id) {
          return {
            error: 'User session required to save document changes',
          };
        }

        await saveDocument({
          id: selectedDocument.id,
          title: selectedDocument.title,
          content: updatedContent,
          kind: selectedDocument.kind,
          userId: session.user.id,
        });

        // Log the diff application
        dataStream.writeData({
          type: 'text-delta',
          content: `🔧 Applied diff to ${selectedDocument.title}\n`,
        });

        if (description) {
          dataStream.writeData({
            type: 'text-delta',
            content: `📝 Changes: ${description}\n`,
          });
        }

        // Show diff summary
        const diffBlocks = parseDiffBlocks(diff);
        dataStream.writeData({
          type: 'text-delta',
          content: `✅ Successfully applied ${diffBlocks.length} change${diffBlocks.length > 1 ? 's' : ''}\n`,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          id,
          title: selectedDocument.title,
          kind: selectedDocument.kind,
          content: 'The document has been updated successfully with precise diff changes.',
          changesApplied: diffBlocks.length,
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Send user-friendly toast notification
        dataStream.writeData({
          type: 'text-delta',
          content: `<div style="max-width: 600px; margin: 8px 0;">
<details style="border: 1px solid #ef4444; border-radius: 8px; padding: 12px; background: #fef2f2;">
<summary style="cursor: pointer; font-weight: 600; color: #dc2626; display: flex; align-items: center; gap: 8px;">
<span>🚨</span> Apply Diff Error - Click to expand
</summary>
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #fecaca; font-size: 14px; color: #991b1b;">
<strong>Error:</strong> ${errorMessage}
<br><br>
<strong>Tip:</strong> Try using shorter, more unique search phrases or check that the content exists in the document.
</div>
</details>
</div>\n`,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          error: `Failed to apply diff: ${errorMessage}`,
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

  // Match SEARCH/REPLACE blocks
  const blockRegex = /<<<<<<< SEARCH\n(.*?)\n=======\n(.*?)\n>>>>>>> REPLACE/gs;
  let match;

  while ((match = blockRegex.exec(diff)) !== null) {
    const searchSection = match[1];
    const replaceSection = match[2];

    // Check for line number
    const lineMatch = searchSection.match(/^:start_line:(\d+)\n-------\n(.*)/s);
    
    if (lineMatch) {
      blocks.push({
        startLine: parseInt(lineMatch[1]),
        searchContent: lineMatch[2],
        replaceContent: replaceSection,
      });
    } else {
      blocks.push({
        searchContent: searchSection,
        replaceContent: replaceSection,
      });
    }
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
    throw new Error('No valid SEARCH/REPLACE blocks found in diff');
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

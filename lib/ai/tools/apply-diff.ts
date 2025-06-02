import { DataStreamWriter, tool } from 'ai';
import { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById } from '@/lib/db/queries';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { document } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ApplyDiffProps {
  session: Session;
  dataStream: DataStreamWriter;
  selectedChatModel: string;
}

export const applyDiff = ({ session, dataStream, selectedChatModel }: ApplyDiffProps) =>
  tool({
    description: 'Apply precise SEARCH/REPLACE diffs to ANY document or artifact (HTML, CSS, JavaScript, Python, text files, code, etc.). Use this for surgical edits without rewriting entire files. Perfect for updating existing documents with targeted changes like adding features, fixing bugs, styling updates, or content modifications.',
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
        
        // Update the document content directly
        const client = postgres(process.env.POSTGRES_URL!);
        const db = drizzle(client);
        
        await db
          .update(document)
          .set({
            content: updatedContent,
            createdAt: new Date() // Update timestamp to show modification
          })
          .where(eq(document.id, id));

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
        dataStream.writeData({
          type: 'text-delta',
          content: `❌ Error applying diff: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          error: `Failed to apply diff: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        throw new Error(`Search content not found at line ${startLine}: "${searchContent.substring(0, 50)}..."`);
      }
    } else {
      // String-based replacement
      if (!updatedContent.includes(searchContent)) {
        throw new Error(`Search content not found: "${searchContent.substring(0, 50)}..."`);
      }
      
      updatedContent = updatedContent.replace(searchContent, replaceContent);
    }
  }

  return updatedContent;
}

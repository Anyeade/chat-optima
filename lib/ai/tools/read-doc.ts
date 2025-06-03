import { DataStreamWriter, tool } from 'ai';
import { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById, saveDocument } from '@/lib/db/queries';
import { smoothStream, streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';

interface ReadDocProps {
  session: Session;
  dataStream: DataStreamWriter;
  selectedChatModel: string;
}

const diffFormatPrompt = `
You are an AI document assistant with autonomous read and edit capabilities. When making changes to documents, you MUST use the specific diff format below.

**applyDiff CRITICAL FORMAT:**
- MUST include line number and ------- separator
- Search text must match EXACTLY (including spaces/newlines)
- Use SHORT, UNIQUE search phrases (5-20 words)
- Copy search text character-by-character from document
- **EXACT FORMAT:** \`<<<<<<< SEARCH\`, line number with \`:start_line:\`, dashes, exact text, \`=======\`, replacement, \`>>>>>>> REPLACE\`

**EXAMPLES:**
- ADD: Search "## Conclusion", replace with "## New Section\\n\\nContent here\\n\\n## Conclusion"
- EDIT: Search "old paragraph text", replace with "updated paragraph text"
- REMOVE: Search "unwanted section\\n\\nNext section", replace with "Next section"

**COMPLETE EXAMPLE for adding a navigation menu:**
\`\`\`
<<<<<<< SEARCH
:start_line:5
-------
<body>
    <header>
=======
<body>
    <nav class="navbar">
        <div class="nav-brand">Logo</div>
        <ul class="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
        </ul>
    </nav>
    <header>
>>>>>>> REPLACE
\`\`\`

Always read the full document content first to understand context before making any changes.
`;

export const readDoc = ({ session, dataStream, selectedChatModel }: ReadDocProps) =>
  tool({
    description: 'Read a document and intelligently make changes using diff-based updates. Can autonomously read document content, understand context, and apply targeted changes. CRITICAL: When modifying, ALWAYS preserve ALL existing content - never replace the entire document with just modifications. The result must be the COMPLETE document with changes integrated.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to read and potentially modify'),
      action: z.enum(['read', 'modify']).describe('Whether to just read the document or read and modify it'),
      instructions: z.string().optional().describe('Instructions for modifications (required if action is "modify")'),
    }),
    execute: async ({ id, action, instructions }) => {
      const document = await getDocumentById({ id });

      if (!document) {
        return {
          error: 'Document not found',
        };
      }

      // Always read and understand the document first
      dataStream.writeData({
        type: 'read-doc-start',
        content: `Reading document "${document.title}"...`,
      });

      const documentContent = document.content || '';
      const lines = documentContent.split('\n');
      
      // Show document analysis
      dataStream.writeData({
        type: 'document-analysis',
        content: JSON.stringify({
          title: document.title,
          kind: document.kind,
          lineCount: lines.length,
          wordCount: documentContent.split(/\s+/).length,
          preview: documentContent.substring(0, 200) + (documentContent.length > 200 ? '...' : '')
        }),
      });

      if (action === 'read') {
        return {
          id: document.id,
          title: document.title,
          kind: document.kind,
          content: documentContent,
          analysis: {
            lineCount: lines.length,
            wordCount: documentContent.split(/\s+/).length,
            structure: analyzeDocumentStructure(documentContent, document.kind)
          }
        };
      }

      if (action === 'modify') {
        if (!instructions) {
          return {
            error: 'Instructions are required for modify action'
          };
        }

        // Show that we're processing modifications
        dataStream.writeData({
          type: 'applying-changes',
          content: `Analyzing changes needed: ${instructions}`,
        });

        let modifiedContent = '';

        // Use selectedChatModel if provided, fallback to artifact-model
        const modelToUse = selectedChatModel || 'artifact-model';

        const systemPrompt = `${diffFormatPrompt}

**🚨 CRITICAL CONTENT PRESERVATION RULES 🚨**
- NEVER replace the entire document with just modifications
- ALWAYS preserve ALL existing content when making changes
- INTEGRATE changes into the full existing document structure
- The result must be the COMPLETE document with modifications applied
- Think: "Add to" or "Update within" NOT "Replace with"

**CURRENT DOCUMENT CONTENT:**
\`\`\`
${documentContent}
\`\`\`

**DOCUMENT INFO:**
- Title: ${document.title}
- Type: ${document.kind}
- Lines: ${lines.length}

You have full access to the document content above. Use it to understand context and make precise changes.

**INSTRUCTIONS:** ${instructions}

Based on the document content and instructions, provide the COMPLETE modified document with ALL existing content preserved and the requested changes integrated. Use the exact diff format specified above when making changes. Always preserve the document's existing structure and style unless explicitly asked to change it.`;

        const { fullStream } = streamText({
          model: myProvider.languageModel(modelToUse),
          system: systemPrompt,
          experimental_transform: smoothStream({ chunking: 'word' }),
          prompt: `Please read the document content provided and apply the requested changes: ${instructions}`,
        });

        for await (const delta of fullStream) {
          const { type } = delta;

          if (type === 'text-delta') {
            const { textDelta } = delta;

            modifiedContent += textDelta;

            dataStream.writeData({
              type: 'text-delta',
              content: textDelta,
            });
          }
        }

        // Save the modified document
        if (session?.user?.id) {
          await saveDocument({
            id: document.id,
            title: document.title,
            content: modifiedContent,
            kind: document.kind,
            userId: session.user.id,
          });
        }

        dataStream.writeData({
          type: 'changes-applied',
          content: 'Document successfully updated with requested changes.',
        });

        return {
          id: document.id,
          title: document.title,
          kind: document.kind,
          content: modifiedContent,
          changes: 'Document has been successfully modified based on your instructions.',
        };
      }

      return {
        error: 'Invalid action specified'
      };
    },
  });

function analyzeDocumentStructure(content: string, kind: string) {
  const lines = content.split('\n');
  const structure: any = {
    totalLines: lines.length,
    emptyLines: lines.filter(line => line.trim() === '').length,
  };

  switch (kind) {
    case 'text':
      // Analyze markdown structure
      const headings = lines.filter(line => line.trim().startsWith('#'));
      const lists = lines.filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'));
      structure.headings = headings.length;
      structure.lists = lists.length;
      structure.headingLevels = [...new Set(headings.map(h => h.split(' ')[0].length))];
      break;
      
    case 'code':
      // Analyze code structure
      const functions = lines.filter(line => 
        line.includes('function ') || 
        line.includes('def ') || 
        line.includes('const ') ||
        line.includes('class ')
      );
      structure.codeBlocks = functions.length;
      break;
      
    case 'html':
      // Analyze HTML structure
      const tags = content.match(/<[^>]+>/g) || [];
      structure.totalTags = tags.length;
      structure.uniqueTags = [...new Set(tags.map(tag => tag.replace(/[<>\/]/g, '').split(' ')[0]))];
      break;
      
    default:
      structure.type = 'generic';
  }

  return structure;
}

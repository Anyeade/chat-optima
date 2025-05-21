import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { sandboxPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const sandboxDocumentHandler = createDocumentHandler<'sandbox'>({
  kind: 'sandbox',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: sandboxPrompt,
      prompt: title,
      schema: z.object({
        code: z.string(),
        metadata: z.object({
          description: z.string().optional(),
          framework: z.string().optional(),
          dependencies: z.record(z.string()).optional(),
          template: z.enum(['javascript', 'node', 'typescript', 'angular', 'react', 'vue']).optional(),
        }).optional(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { code, metadata } = object;

        if (code) {
          // Add metadata to the code if provided by the AI
          if (metadata) {
            const metadataStr = JSON.stringify(metadata, null, 2);
            const codeWithMetadata = `/** PROJECT_CONFIG */
${metadataStr}
/** END_PROJECT_CONFIG */

${code}`;
            
            dataStream.writeData({
              type: 'sandbox-delta',
              content: codeWithMetadata,
            });

            draftContent = codeWithMetadata;
          } else {
            dataStream.writeData({
              type: 'sandbox-delta',
              content: code,
            });

            draftContent = code;
          }
        }
      }
    }

    return draftContent;
  },  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    // Check if the description contains file modification instructions
    const isFileModification = /modify|update|change|add file|edit file|create file|new file/i.test(description);

    // If we're dealing with a file modification, adjust the schema to handle file operations
    const schema = isFileModification
      ? z.object({
          code: z.string(),
          fileOperations: z.array(z.object({
            path: z.string(),
            content: z.string().optional(),
            operation: z.enum(['create', 'update', 'delete']),
          })).optional(),
          metadata: z.object({
            description: z.string().optional(),
            dependencies: z.record(z.string()).optional(),
          }).optional(),
        })
      : z.object({
          code: z.string(),
          metadata: z.object({
            description: z.string().optional(),
            framework: z.string().optional(),
            dependencies: z.record(z.string()).optional(),
            template: z.enum(['javascript', 'node', 'typescript', 'angular', 'react', 'vue']).optional(),
          }).optional(),
        });

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'sandbox'),
      prompt: description,
      schema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { code, fileOperations, metadata } = object;

        // Handle file operations if provided
        if (fileOperations && Array.isArray(fileOperations) && fileOperations.length > 0) {
          // Format the code to include file operations that can be parsed by the client
          const fileOpsStr = JSON.stringify(fileOperations);
          const codeWithOps = `/** FILE_OPERATIONS */
${fileOpsStr}
/** END_FILE_OPERATIONS */

${code || document.content}`;

          dataStream.writeData({
            type: 'sandbox-delta',
            content: codeWithOps,
          });

          draftContent = codeWithOps;
        }
        // Handle metadata if provided
        else if (code && metadata) {
          const metadataStr = JSON.stringify(metadata, null, 2);
          const codeWithMetadata = `/** PROJECT_CONFIG */
${metadataStr}
/** END_PROJECT_CONFIG */

${code}`;
          
          dataStream.writeData({
            type: 'sandbox-delta',
            content: codeWithMetadata,
          });

          draftContent = codeWithMetadata;
        }
        // Default case - just update the code
        else if (code) {
          dataStream.writeData({
            type: 'sandbox-delta',
            content: code ?? '',
          });

          draftContent = code;
        }
      }
    }

    return draftContent;
  },
});

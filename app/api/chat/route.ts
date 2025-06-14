import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '@/app/chat/actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { readDoc } from '@/lib/ai/tools/read-doc';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { webSearch } from '@/lib/ai/tools/web-search';
import { webpageScreenshotApi as webpageScreenshot } from '@/lib/ai/tools/webpage-screenshot-api';
import { webScraper } from '@/lib/ai/tools/web-scraper';
import { pexelsSearch } from '@/lib/ai/tools/pexels-search';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import type { Chat } from '@/lib/db/schema';
import { differenceInSeconds } from 'date-fns';
import { ChatSDKError } from '@/lib/errors';

export const maxDuration = 300; // Increased to 5 minutes to support long AI streaming responses

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const { id, message, selectedChatModel: rawSelectedChatModel, selectedVisibilityType } =
      requestBody;

    // Decode URL-encoded model ID (fix %2F -> /)
    const selectedChatModel = decodeURIComponent(rawSelectedChatModel);

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }    const userType: UserType = session.user.type;    // Validate that the user has access to the selected model
    const userEntitlements = entitlementsByUserType[userType];
    if (!userEntitlements.availableChatModelIds.includes(selectedChatModel)) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });    const stream = createDataStream({
      execute: (dataStream) => {
        let modelToUse;
        try {
          modelToUse = myProvider.languageModel(selectedChatModel);
          console.log('✓ Successfully created model instance for:', selectedChatModel);
        } catch (error) {
          console.error('✗ Failed to create model instance for:', selectedChatModel, error);
          throw new Error(`Invalid model: ${selectedChatModel}`);
        }        // Check if this model doesn't work well with tools
        const isModelWithoutTools = selectedChatModel.includes('cerebras') || 
                                   selectedChatModel.includes('llama3.1-8b-cerebras') ||
                                   selectedChatModel.includes('llama-3.3-70b-cerebras');
                                   // Compound models removed from user selection        // Determine maxTokens based on model capabilities for long code generation
        function getMaxTokensForModel(modelId: string): number {
          // High-context models with 163k+ context windows (can generate longer responses)
          if (modelId.includes('deepseek') || modelId.includes('DeepSeek')) {
            return 32768; // 32k tokens for long code generation
          }
          
          // Groq models - Using EXACT limits from Groq documentation
          if (modelId === 'llama-3.3-70b-versatile') {
            return 32768; // 32k max completion tokens
          }
          if (modelId === 'meta-llama/llama-4-scout-17b-16e-instruct') {
            return 8192; // 8k max completion tokens
          }
          if (modelId === 'meta-llama/llama-4-maverick-17b-128e-instruct') {
            return 8192; // 8k max completion tokens
          }
          if (modelId === 'llama-3.1-8b-instant') {
            return 8192; // 8k max completion tokens
          }
          if (modelId === 'compound-beta' || modelId === 'compound-beta-mini') {
            return 8192; // 8k max completion tokens (preview systems)
          }
          if (modelId === 'qwen-qwq-32b' || modelId === 'qwen/qwen3-32b') {
            return 16384; // 16k max completion tokens for Qwen 3 32B
          }
          if (modelId === 'deepseek-r1-distill-llama-70b') {
            return 8192; // DeepSeek R1 distilled model
          }
          
          // Qwen models with large context windows
          if (modelId.includes('qwen') || modelId.includes('Qwen')) {
            return 16384; // 16k tokens
          }
          // Llama 4 models with extended context
          if (modelId.includes('llama-4') || modelId.includes('Llama-4')) {
            return 8192; // 8k tokens (corrected from Groq docs)
          }
          // Other Groq models - fallback
          if (modelId.includes('groq') || modelId.includes('llama3')) {
            return 8192; // 8k tokens for other Groq models
          }
          // Cohere Command models with 128k context
          if (modelId.includes('command')) {
            return 16384; // 16k tokens for Cohere Command series
          }
          // Together.ai models
          if (modelId.includes('meta-llama') && modelId.includes('Free')) {
            return 8192; // 8k tokens for Together.ai free models
          }
          // X.AI Grok models
          if (modelId.includes('grok')) {
            return 8192; // 8k tokens for Grok models
          }
          // Mistral models
          if (modelId.includes('mistral') || modelId.includes('pixtral') || modelId.includes('devstral')) {
            return 8192; // 8k tokens for Mistral models
          }
          // Requesty AI Router models
          if (modelId.includes('requesty') || modelId.includes('google/') || modelId.includes('gemma-3-27b-it-requesty')) {
            return 8192; // 8k tokens for Requesty Router models
          }
          // Claude models
          if (modelId.includes('claude')) {
            return 8192; // 8k tokens
          }
          // GPT models
          if (modelId.includes('gpt-4') || modelId.includes('gpt-3.5')) {
            return 8192; // 8k tokens
          }
          // Gemini models
          if (modelId.includes('gemini') || modelId.includes('gemma')) {
            return 8192; // 8k tokens
          }
          // Cerebras models - fast inference
          if (modelId.includes('cerebras')) {
            return 8192; // 8k tokens for Cerebras models
          }
          // Default for other models
          return 4096; // 4k tokens default
        }

        const maxTokens = getMaxTokensForModel(selectedChatModel);
        console.log(`🎯 Model: ${selectedChatModel} | MaxTokens: ${maxTokens}`);

        const streamTextConfig = {
          model: modelToUse,
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages,
          maxTokens, // Add dynamic maxTokens based on model capabilities
          maxSteps: 5,
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          onFinish: async ({ response }: any) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message: any) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        };        // Only add tools for models that support them properly
        if (!isModelWithoutTools) {
          Object.assign(streamTextConfig, {
            experimental_activeTools: [
              'getWeather',
              'createDocument',
              'updateDocument',
              'requestSuggestions',
              'readDoc',
              'webSearch',
              'webpageScreenshot',
              'webScraper',
              'pexelsSearch',
            ],
            tools: {
              getWeather,
              webSearch: webSearch({ dataStream }),
              webpageScreenshot: webpageScreenshot({ dataStream }),
              webScraper: webScraper({ dataStream }),
              pexelsSearch: pexelsSearch({ dataStream }),
              createDocument: createDocument({ session, dataStream, selectedChatModel }),
              updateDocument: updateDocument({ session, dataStream, selectedChatModel }),
              requestSuggestions: requestSuggestions({
                session,
                dataStream,
              }),
              readDoc: readDoc({ session, dataStream, selectedChatModel }),
            },
          });        } else {
          console.log('🚫 Model detected that doesn\'t work well with tools - disabling for compatibility');
          console.log(`   Model: ${selectedChatModel}`);
        }

        const result = streamText(streamTextConfig);

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () => stream),
      );
    } else {
      return new Response(stream);
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    
    console.error('Unexpected error in chat route:', error);
    
    // Handle specific AI API errors
    if (error && typeof error === 'object' && 'reason' in error) {
      if (error.reason === 'maxRetriesExceeded' && 'lastError' in error) {
        const lastError = error.lastError as any;
        if (lastError?.statusCode === 429) {
          return Response.json(
            { 
              code: 'rate_limit:chat', 
              message: 'The AI service is currently unavailable due to rate limits. Please try again later.' 
            },
            { status: 429 }
          );
        }
      }
    }
    
    return Response.json(
      { 
        code: 'internal_server_error:chat', 
        message: 'Something went wrong. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response(null, { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new ChatSDKError('not_found:stream').toResponse();
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  const stream = await streamContext.resumableStream(
    recentStreamId,
    () => emptyDataStream,
  );

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  if (!stream) {
    const messages = await getMessagesByChatId({ id: chatId });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream, { status: 200 });
    }

    if (mostRecentMessage.role !== 'assistant') {
      return new Response(emptyDataStream, { status: 200 });
    }    const messageCreatedAt = new Date(mostRecentMessage.createdAt);

    // Allow longer resume window for AI streaming responses (60 seconds instead of 15)
    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 60) {
      return new Response(emptyDataStream, { status: 200 });
    }

    const restoredStream = createDataStream({
      execute: (buffer) => {
        buffer.writeData({
          type: 'append-message',
          message: JSON.stringify(mostRecentMessage),
        });
      },
    });

    return new Response(restoredStream, { status: 200 });
  }

  return new Response(stream, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}

import type { ChatRequestOptions } from 'ai';

export type DataPart = { type: 'append-message'; message: string };

export interface ExtendedChatRequestOptions extends ChatRequestOptions {
  experimental_options?: {
    useWebSearch: boolean;
  };
}

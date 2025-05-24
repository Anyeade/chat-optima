'use client';

import type { Attachment, UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  // Handler for textarea input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  // Handler for keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        submitForm();
      }
    }
  };

  // Check if we can send the message
  const canSend = input.trim().length > 0 || attachments.length > 0;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttach = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e);
    }
  };

  const submitForm = useCallback(() => {
    // Check if the input exceeds the character limit (15000)
    if (input.length > 15000) {
      toast.error('Your message exceeds the maximum character limit of 15,000. Please shorten your message and try again.');
      return;
    }
    
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Create a form event-like object
    const formEvent = {
      preventDefault: () => {},
      currentTarget: {} as HTMLFormElement,
    } as React.FormEvent<HTMLFormElement>;

    handleSubmit(formEvent);

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  // Helper to process image files and handle uploads
  const processImageFile = useCallback(
    async (file: File) => {
      setUploadQueue(prev => [...prev, file.name]);
      
      try {
        // Show toast notification for pasted image
        if (file.name.startsWith('pasted-image')) {
          toast.success('Image pasted and uploading...');
        }
        
        const attachment = await uploadFile(file);
        if (attachment) {
          setAttachments(prev => [...prev, attachment]);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadQueue(prev => prev.filter(name => name !== file.name));
      }
    },
    [setAttachments],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  // State to track drag-and-drop operations
  const [isDragging, setIsDragging] = useState(false);

  // Drag and drop event handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const items = e.dataTransfer.items;
    if (!items) return;
    
    // Process dropped files
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && file.type.startsWith('image/')) {
          processImageFile(file);
        }
      }
    }
  }, [processImageFile]);

  // Helper function to get permission for clipboard read
  const requestClipboardPermission = useCallback(async () => {
    try {
      // Check if clipboard-read permission is already granted
      const permissionStatus = await navigator.permissions.query({ 
        name: 'clipboard-read' as PermissionName 
      });
      
      if (permissionStatus.state === 'granted') {
        return true;
      } else if (permissionStatus.state === 'prompt') {
        // We need to prompt the user by attempting to read the clipboard
        toast.info('Please allow clipboard access when prompted.');
        return true;
      } else {
        // Permission denied
        toast.error('Clipboard permission denied. Please enable in browser settings.');
        return false;
      }
    } catch (error) {
      console.error('Error checking clipboard permissions:', error);
      return true; // Try anyway in case permissions API is not supported
    }
  }, []);

  // Function to check clipboard for images on focus
  const checkClipboardForImages = useCallback(async () => {
    const hasPermission = await requestClipboardPermission();
    if (!hasPermission) return;
    
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            toast.info(
              'There is an image in your clipboard. Press Ctrl+V or Cmd+V to paste it.'
            );
            return; // Only show one notification
          }
        }
      }
    } catch (err) {
      // Silently fail as this is just a convenience feature
      // Most likely the clipboard is empty or contains non-image content
    }
  }, [requestClipboardPermission]);

  // Check for clipboard images when the component gets focus
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const handleFocus = () => {
      checkClipboardForImages();
    };
    
    textarea.addEventListener('focus', handleFocus);
    
    return () => {
      textarea.removeEventListener('focus', handleFocus);
    };
  }, [checkClipboardForImages]);

  return (
    <div className={cx('w-full flex flex-col', className)}>
      {attachments.length > 0 && (
        <div className="mb-2 flex items-center gap-2 flex-wrap touch-manipulation">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}
        </div>
      )}
      
      <form 
        className="relative flex w-full items-end gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) {
            submitForm();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* File input button with improved touch target */}
        <div className="relative">
          <input
            ref={fileInputRef}
            multiple
            disabled={status === 'streaming'}
            type="file"
            onChange={handleAttach}
            className="hidden"
          />
          <Button
            variant="ghost"
            className="rounded-full p-2 sm:p-3 h-auto touch-manipulation"
            disabled={status === 'streaming'}
            onClick={handleFileClick}
            title="Attach files"
            aria-label="Attach files"
            type="button"
          >
            <PaperclipIcon size={20} />
          </Button>
        </div>

        {/* Textarea with improved behavior on mobile */}
        <Textarea
          autoFocus
          tabIndex={0}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message"
          spellCheck={false}
          className="min-h-10 h-auto rounded-2xl resize-none bg-muted dark:placeholder:text-zinc-500 placeholder:text-zinc-400 focus-visible:border-zinc-200 dark:focus-visible:border-zinc-700 px-3 sm:px-4 py-2 sm:py-3"
          style={{
            height: textareaRef.current?.scrollHeight
              ? `${Math.min(textareaRef.current.scrollHeight, 200)}px`
              : 'auto',
          }}
          ref={textareaRef}
          rows={Math.min(
            Math.ceil((input.match(/\n/g)?.length || 0) + 1),
            5,
          )}
          enterKeyHint="send"
        />

        {/* Submit button with improved touch target */}
        <Button
          type="submit"
          disabled={!canSend}
          variant="ghost"
          className="rounded-full p-2 sm:p-3 h-auto absolute right-1 bottom-1 touch-manipulation"
          title={status === 'streaming' ? 'Stop generating' : 'Send message'}
          aria-label={status === 'streaming' ? 'Stop generating' : 'Send message'}
          data-testid="send-button"
          onClick={status === 'streaming' ? stop : undefined}
        >
          {status === 'streaming' ? (
            <StopIcon size={20} />
          ) : (
            <ArrowUpIcon size={20} />
          )}
        </Button>
      </form>

      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            onClick={() => scrollToBottom()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            aria-label="Scroll to bottom"
            className="z-10 flex items-center justify-center size-10 shadow-lg bg-background border border-zinc-200 dark:border-zinc-700 rounded-full absolute -top-14 right-2"
          >
            <ArrowDown className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
    
      {/* Display character count when approaching or exceeding limit */}
      {input.length > 10000 && (
        <div 
          className={`text-xs mt-1 text-right pr-14 ${
            input.length > 15000 ? 'text-red-500' : 'text-muted-foreground'
          }`}
          data-testid="char-counter"
        >
          {input.length}/15000
        </div>
      )}
      
      {messages.length > 0 && status !== 'streaming' && (
        <div className="w-full mt-4">
          <SuggestedActions
            chatId={chatId}
            append={append}
            selectedVisibilityType={selectedVisibilityType}
          />
        </div>
      )}

      {isDragging && (
        <div className="absolute inset-0 bg-zinc-500/20 dark:bg-zinc-800/30 rounded-lg border-2 border-dashed border-zinc-400 dark:border-zinc-600 flex items-center justify-center">
          <div className="text-zinc-600 dark:text-zinc-400 font-medium">
            Drop image here
          </div>
        </div>
      )}
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
if (prevProps.status !== nextProps.status) return false;
if (prevProps.input !== nextProps.input) return false;
if (prevProps.className !== nextProps.className) return false;
if (!equal(prevProps.attachments, nextProps.attachments)) return false;
if (!equal(prevProps.messages, nextProps.messages)) return false;

return true;
});

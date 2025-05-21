import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { Editor } from '@/components/text-editor';
import {
  ClockRewind,
  CopyIcon,
  DownloadIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { Suggestion } from '@/lib/db/schema';
import { toast } from 'sonner';
import { getSuggestions } from '../actions';

// Added for DOCX conversion
import { Document, Packer, Paragraph, TextRun } from 'docx';
// Added for PDF conversion
import { jsPDF } from 'jspdf';

interface TextArtifactMetadata {
  suggestions: Array<Suggestion>;
}

export const textArtifact = new Artifact<'text', TextArtifactMetadata>({
  kind: 'text',
  description: 'Useful for text content, like drafting essays and emails.',
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId });

    setMetadata({
      suggestions,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'suggestion') {
      setMetadata((metadata) => {
        return {
          suggestions: [
            ...metadata.suggestions,
            streamPart.content as Suggestion,
          ],
        };
      });
    }

    if (streamPart.type === 'text-delta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + (streamPart.content as string),
          isVisible:
            draftArtifact.status === 'streaming' &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: 'streaming',
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    return (
      <>
        <div className="flex flex-row py-8 md:p-20 px-4">
          <Editor
            content={content}
            suggestions={metadata ? metadata.suggestions : []}
            isCurrentVersion={isCurrentVersion}
            currentVersionIndex={currentVersionIndex}
            status={status}
            onSaveContent={onSaveContent}
          />

          {metadata &&
          metadata.suggestions &&
          metadata.suggestions.length > 0 ? (
            <div className="md:hidden h-dvh w-12 shrink-0" />
          ) : null}
        </div>
      </>
    );
  },
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: 'View changes',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('toggle');
      },
      isDisabled: ({ currentVersionIndex, setMetadata }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    // Download document options
    {
      icon: <DownloadIcon size={18} />,
      description: 'Download as DOCX',
      onClick: async ({ content }) => {
        try {
          // Create a new document
          const doc = new Document({
            sections: [{
              properties: {},
              children: content.split('\n').map(line => 
                new Paragraph({
                  children: [new TextRun(line)]
                })
              ),
            }],
          });
          
          // Generate and save the document
          const buffer = await Packer.toBuffer(doc);
          
          // Create a blob from the buffer
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          
          // Create a download link
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'document.docx';
          
          // Trigger the download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success('Downloaded as DOCX');
        } catch (error) {
          console.error('Error generating DOCX:', error);
          toast.error('Failed to generate DOCX');
        }
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      description: 'Download as PDF',
      onClick: ({ content }) => {
        try {
          // Create a PDF document
          const pdf = new jsPDF();
          
          // Split content by newlines and add to PDF
          const lines = content.split('\n');
          let y = 10;
          
          // Add each line
          for (const line of lines) {
            if (y > 280) { // Check if we need a new page
              pdf.addPage();
              y = 10;
            }
            
            pdf.text(line, 10, y);
            y += 7; // Increment Y position for next line
          }
          
          // Save the PDF
          pdf.save('document.pdf');
          
          toast.success('Downloaded as PDF');
        } catch (error) {
          console.error('Error generating PDF:', error);
          toast.error('Failed to generate PDF');
        }
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon />,
      description: 'Add final polish',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content:
            'Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.',
        });
      },
    },
    {
      icon: <MessageIcon />,
      description: 'Request suggestions',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content:
            'Please add suggestions you have that could improve the writing.',
        });
      },
    },
  ],
});

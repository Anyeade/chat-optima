import { DataStreamWriter, tool } from 'ai';
import { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById } from '@/lib/db/queries';

interface ReadDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
  selectedChatModel: string;
}

export const readDocument = ({ session, dataStream, selectedChatModel }: ReadDocumentProps) =>
  tool({
    description: 'Read and analyze the complete content of any document or artifact (HTML, CSS, JavaScript, Python, text files, code, etc.) to understand its structure before making precise changes. Perfect for getting context before using applyDiff or updateDocument tools.',
    parameters: z.object({
      id: z.string().describe('The ID of the document/artifact to read (works with ANY document type: HTML, CSS, JS, Python, text, etc.)'),
      focus: z.string().optional().describe('Optional: specific section, element, or aspect to focus on (e.g., "navigation area", "styling", "functions", "main content")'),
    }),
    execute: async ({ id, focus }) => {
      // Show loading indicator
      dataStream.writeData({
        type: 'text-delta',
        content: `<div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; margin: 8px 0;">
<div style="width: 16px; height: 16px; border: 2px solid #0ea5e9; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
<span style="color: #0369a1; font-weight: 500;">📖 Reading document...</span>
</div>
<style>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>\n`,
      });

      const selectedDocument = await getDocumentById({ id });

      if (!selectedDocument) {
        dataStream.writeData({
          type: 'text-delta',
          content: `<div style="padding: 8px 12px; background: #fef2f2; border: 1px solid #ef4444; border-radius: 6px; margin: 8px 0;">
<span style="color: #dc2626; font-weight: 500;">❌ Document not found</span>
</div>\n`,
        });
        
        dataStream.writeData({ type: 'finish', content: '' });
        
        return {
          error: 'Document not found',
        };
      }

      // Check if document has content
      if (selectedDocument.content === null || selectedDocument.content.trim() === '') {
        dataStream.writeData({
          type: 'text-delta',
          content: `<div style="padding: 8px 12px; background: #fef2f2; border: 1px solid #ef4444; border-radius: 6px; margin: 8px 0;">
<span style="color: #dc2626; font-weight: 500;">❌ Document is empty</span>
</div>\n`,
        });
        
        dataStream.writeData({ type: 'finish', content: '' });
        
        return {
          error: 'Document has no content to read',
        };
      }

      try {
        // Analyze the document content
        const content = selectedDocument.content;
        const analysis = analyzeDocumentContent(content, selectedDocument.kind, focus);

        // Show success indicator
        dataStream.writeData({
          type: 'text-delta',
          content: `<div style="padding: 8px 12px; background: #f0fdf4; border: 1px solid #22c55e; border-radius: 6px; margin: 8px 0;">
<span style="color: #15803d; font-weight: 500;">✅ Document read successfully</span>
</div>\n`,
        });

        // Show document analysis
        dataStream.writeData({
          type: 'text-delta',
          content: `**📋 Document Analysis: ${selectedDocument.title}**\n\n`,
        });

        dataStream.writeData({
          type: 'text-delta',
          content: analysis,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          id,
          title: selectedDocument.title,
          kind: selectedDocument.kind,
          content: content,
          analysis: analysis,
          summary: `Successfully read ${selectedDocument.title} (${selectedDocument.kind}). Ready for precise modifications using applyDiff tool.`,
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        dataStream.writeData({
          type: 'text-delta',
          content: `<div style="padding: 8px 12px; background: #fef2f2; border: 1px solid #ef4444; border-radius: 6px; margin: 8px 0;">
<span style="color: #dc2626; font-weight: 500;">❌ Error reading document: ${errorMessage}</span>
</div>\n`,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          error: `Failed to read document: ${errorMessage}`,
        };
      }
    },
  });

/**
 * Analyze document content and provide structured information
 */
function analyzeDocumentContent(content: string, kind: string, focus?: string): string {
  let analysis = '';

  // Basic metrics
  const lines = content.split('\n');
  const characters = content.length;
  const words = content.split(/\s+/).filter(word => word.length > 0).length;

  analysis += `**📊 Document Metrics:**\n`;
  analysis += `- Type: ${kind.toUpperCase()}\n`;
  analysis += `- Lines: ${lines.length}\n`;
  analysis += `- Characters: ${characters}\n`;
  analysis += `- Words: ${words}\n\n`;

  // Content-specific analysis based on document type
  if (kind === 'html') {
    analysis += analyzeHtmlContent(content);
  } else if (kind === 'code') {
    analysis += analyzeCodeContent(content);
  } else if (kind === 'text') {
    analysis += analyzeTextContent(content);
  } else {
    analysis += analyzeGenericContent(content);
  }

  // Focus-specific analysis
  if (focus) {
    analysis += `\n**🎯 Focus Analysis: "${focus}"**\n`;
    analysis += analyzeFocusArea(content, focus);
  }

  analysis += `\n**💡 Ready for precise edits using applyDiff tool**\n`;

  return analysis;
}

function analyzeHtmlContent(content: string): string {
  let analysis = '**🌐 HTML Structure:**\n';
  
  // Find key HTML elements
  const headMatch = content.match(/<head[^>]*>(.*?)<\/head>/s);
  const bodyMatch = content.match(/<body[^>]*>(.*?)<\/body>/s);
  const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/s);
  
  if (titleMatch) {
    analysis += `- Title: "${titleMatch[1].trim()}"\n`;
  }
  
  // Count major elements
  const headers = (content.match(/<h[1-6][^>]*>/g) || []).length;
  const divs = (content.match(/<div[^>]*>/g) || []).length;
  const sections = (content.match(/<section[^>]*>/g) || []).length;
  const navs = (content.match(/<nav[^>]*>/g) || []).length;
  const forms = (content.match(/<form[^>]*>/g) || []).length;
  
  analysis += `- Headers (h1-h6): ${headers}\n`;
  analysis += `- Divs: ${divs}\n`;
  analysis += `- Sections: ${sections}\n`;
  analysis += `- Navigation elements: ${navs}\n`;
  analysis += `- Forms: ${forms}\n`;
  
  // Check for CSS frameworks
  if (content.includes('tailwind') || content.includes('tw-')) {
    analysis += `- CSS Framework: Tailwind CSS detected\n`;
  }
  if (content.includes('bootstrap')) {
    analysis += `- CSS Framework: Bootstrap detected\n`;
  }
  
  // Find major structural areas
  analysis += `\n**📍 Key Areas for Modification:**\n`;
  if (content.includes('<header>')) analysis += `- Header section available\n`;
  if (content.includes('<nav>')) analysis += `- Navigation already present\n`;
  if (content.includes('<main>')) analysis += `- Main content area\n`;
  if (content.includes('<footer>')) analysis += `- Footer section\n`;
  if (!content.includes('<nav>')) analysis += `- ⚠️ No navigation menu found (good target for addition)\n`;
  
  return analysis;
}

function analyzeCodeContent(content: string): string {
  let analysis = '**💻 Code Structure:**\n';
  
  // Detect programming language
  let language = 'Unknown';
  if (content.includes('function ') || content.includes('=>') || content.includes('const ')) {
    language = 'JavaScript';
  } else if (content.includes('def ') || content.includes('import ')) {
    language = 'Python';
  } else if (content.includes('public class') || content.includes('private ')) {
    language = 'Java';
  } else if (content.includes('<?php')) {
    language = 'PHP';
  }
  
  analysis += `- Language: ${language}\n`;
  
  // Count functions/methods
  const functions = (content.match(/function\s+\w+|def\s+\w+|\w+\s*=\s*\(/g) || []).length;
  const classes = (content.match(/class\s+\w+|public class\s+\w+/g) || []).length;
  const imports = (content.match(/import\s+|from\s+.*import|#include|require/g) || []).length;
  
  analysis += `- Functions/Methods: ${functions}\n`;
  analysis += `- Classes: ${classes}\n`;
  analysis += `- Imports/Includes: ${imports}\n`;
  
  return analysis;
}

function analyzeTextContent(content: string): string {
  let analysis = '**📝 Text Structure:**\n';
  
  // Count sections and headings
  const markdownHeaders = (content.match(/^#+\s/gm) || []).length;
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0).length;
  
  analysis += `- Markdown headers: ${markdownHeaders}\n`;
  analysis += `- Paragraphs: ${paragraphs}\n`;
  
  // Check for common structures
  if (content.includes('## ')) analysis += `- Well-structured with headings\n`;
  if (content.includes('- ') || content.includes('* ')) analysis += `- Contains lists\n`;
  if (content.includes('```')) analysis += `- Contains code blocks\n`;
  
  return analysis;
}

function analyzeGenericContent(content: string): string {
  let analysis = '**📄 Content Overview:**\n';
  
  // Basic content analysis
  const hasStructure = content.includes('\n\n') || content.includes('<') || content.includes('{');
  analysis += `- Structure: ${hasStructure ? 'Structured' : 'Plain text'}\n`;
  
  return analysis;
}

function analyzeFocusArea(content: string, focus: string): string {
  const focusLower = focus.toLowerCase();
  let analysis = '';
  
  // Search for focus-related content
  const lines = content.split('\n');
  const relevantLines: string[] = [];
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(focusLower) || 
        (focusLower.includes('nav') && line.toLowerCase().includes('nav')) ||
        (focusLower.includes('menu') && line.toLowerCase().includes('menu')) ||
        (focusLower.includes('header') && line.toLowerCase().includes('header'))) {
      relevantLines.push(`Line ${index + 1}: ${line.trim()}`);
    }
  });
  
  if (relevantLines.length > 0) {
    analysis += `Found ${relevantLines.length} relevant line(s):\n`;
    relevantLines.slice(0, 5).forEach(line => {
      analysis += `- ${line}\n`;
    });
    if (relevantLines.length > 5) {
      analysis += `- ... and ${relevantLines.length - 5} more\n`;
    }
  } else {
    analysis += `No direct matches found for "${focus}". Consider using applyDiff to add this content.\n`;
  }
  
  return analysis;
}
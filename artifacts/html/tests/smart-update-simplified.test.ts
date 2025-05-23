/**
 * Unit tests for the HTML smart update feature
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const mockDataStream = {
  writeData: vi.fn()
};

const mockUpdateResult = "<!DOCTYPE html><html><body><h1>Hello Smart Update</h1></body></html>";

// Mock modules
vi.mock('../server', () => ({
  htmlDocumentHandler: {
    onUpdateDocument: vi.fn().mockImplementation(({ description }) => {
      // Simulate smart update detection and implementation
      if (description.includes('smart update')) {
        mockDataStream.writeData({
          type: 'html-smart-update',
          content: JSON.stringify({
            type: 'replace',
            search: '<h1>Hello World</h1>',
            replace: '<h1>Hello Smart Update</h1>'
          })
        });
        
        return Promise.resolve(mockUpdateResult);
      }
      
      return Promise.resolve("<!DOCTYPE html><html><body><h1>Regular Update</h1></body></html>");
    })
  }
}));

describe('HTML Smart Update Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect smart update requests and send appropriate events', async () => {
    // Arrange
    const mockDocument = { id: '123', content: '<h1>Hello World</h1>', kind: 'html' };
    const description = 'smart update: change the heading';
    
    // Act
    const { htmlDocumentHandler } = require('../server');
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    expect(mockDataStream.writeData).toHaveBeenCalledWith(expect.objectContaining({
      type: 'html-smart-update',
    }));
    expect(result).toBe(mockUpdateResult);
  });

  it('should handle regular updates differently from smart updates', async () => {
    // Arrange
    const mockDocument = { id: '123', content: '<h1>Hello World</h1>', kind: 'html' };
    const description = 'regular update: change the heading';
    
    // Act
    const { htmlDocumentHandler } = require('../server');
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    expect(mockDataStream.writeData).not.toHaveBeenCalledWith(expect.objectContaining({
      type: 'html-smart-update',
    }));
    expect(result).not.toBe(mockUpdateResult);
  });
});

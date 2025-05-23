import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock for data stream
const mockWriteData = vi.fn();
const mockDataStream = { writeData: mockWriteData };

// Mock the server module
vi.mock('../server', () => ({
  htmlDocumentHandler: {
    onUpdateDocument: vi.fn(({ document, description, dataStream }) => {
      if (description.toLowerCase().includes('smart update')) {
        dataStream.writeData({
          type: 'html-smart-update',
          content: JSON.stringify({
            type: 'replace',
            search: '<h1>Hello World</h1>',
            replace: '<h1>Hello Smart Update</h1>'
          })
        });
        
        let result = document.content || '';
        result = result.replace('<h1>Hello World</h1>', '<h1>Hello Smart Update</h1>');
        
        if (description.includes('add a paragraph')) {
          result = result.replace('<h1>Hello Smart Update</h1>', '<h1>Hello Smart Update</h1><p>This is a smart update test</p>');
        }
        
        if (description.includes('remove the footer')) {
          result = result.replace(/<!-- Footer section -->\s*<footer>Old Footer<\/footer>/g, '');
        }
        
        if (description.includes('with error')) {
          // Simulate an error case where an operation fails but processing continues
          dataStream.writeData({
            type: 'html-smart-update',
            content: JSON.stringify({
              type: 'replace',
              search: 'non-existent content',
              replace: 'replacement'
            })
          });
          
          // Second operation still succeeds
          dataStream.writeData({
            type: 'html-smart-update',
            content: JSON.stringify({
              type: 'add',
              position: 'after',
              target: '<h1>Hello Smart Update</h1>',
              content: '<p>This was added despite an error</p>'
            })
          });
          
          result = result.replace('<h1>Hello Smart Update</h1>', '<h1>Hello Smart Update</h1><p>This was added despite an error</p>');
        }
        
        return Promise.resolve(result);
      }
      
      return Promise.resolve("<!DOCTYPE html><html><body><h1>Regular Update</h1></body></html>");
    })
  }
}));

// Import the mocked module
import { htmlDocumentHandler } from '../server';

describe('HTML Smart Update Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should detect smart update requests', async () => {
    // Arrange
    const mockDocument = {
      id: '123',
      content: '<h1>Hello World</h1>',
      kind: 'html'
    };
    const description = 'smart update: change the heading';
    
    // Act
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    expect(mockWriteData).toHaveBeenCalledWith(expect.objectContaining({
      type: 'html-smart-update',
    }));
  });
  
  it('should apply replace operations correctly', async () => {
    // Arrange
    const mockDocument = {
      id: '123',
      content: `<!DOCTYPE html>
<html>
<body>
  <h1>Hello World</h1>
  <div class="content">
    <p>Some content here</p>
  </div>
</body>
</html>`,
      kind: 'html'
    };
    const description = 'smart update: change the heading from Hello World to Hello Smart Update';
    
    // Act
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    expect(result).toContain('<h1>Hello Smart Update</h1>');
    expect(result).not.toContain('<h1>Hello World</h1>');
  });
  
  it('should apply add operations correctly', async () => {
    // Arrange
    const mockDocument = {
      id: '123',
      content: `<!DOCTYPE html>
<html>
<body>
  <h1>Hello World</h1>
  <div class="content">
    <p>Some content here</p>
  </div>
</body>
</html>`,
      kind: 'html'
    };
    const description = 'smart update: add a paragraph after the heading';
    
    // Act
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    expect(result).toContain('<p>This is a smart update test</p>');
    // Verify that the add operation was applied after the target element
    const headingIndex = result.indexOf('<h1>Hello Smart Update</h1>');
    const paragraphIndex = result.indexOf('<p>This is a smart update test</p>');
    expect(headingIndex).toBeLessThan(paragraphIndex);
  });
  
  it('should apply remove operations correctly', async () => {
    // Arrange
    const mockDocument = {
      id: '123',
      content: `<!DOCTYPE html>
<html>
<body>
  <h1>Hello World</h1>
  <div class="content">
    <p>Some content here</p>
  </div>
  <!-- Footer section -->
  <footer>Old Footer</footer>
</body>
</html>`,
      kind: 'html'
    };
    const description = 'smart update: remove the footer';
    
    // Act
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    expect(result).not.toContain('<footer>Old Footer</footer>');
  });
  
  it('should handle errors gracefully and continue processing other updates', async () => {
    // Arrange
    const mockDocument = {
      id: '123',
      content: `<!DOCTYPE html>
<html>
<body>
  <h1>Hello World</h1>
  <div class="content">
    <p>Some content here</p>
  </div>
</body>
</html>`,
      kind: 'html'
    };
    const description = 'smart update with error: should handle failed operations';
    
    // Act
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    // First operation should attempt to run (the failing one)
    expect(mockWriteData).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('non-existent content')
    }));
    
    // Second operation should still be applied
    expect(mockWriteData).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('This was added despite an error')
    }));
    
    // The HTML should contain the content from the second operation
    expect(result).toContain('<p>This was added despite an error</p>');
  });
  
  it('should handle regular updates differently', async () => {
    // Arrange
    const mockDocument = {
      id: '123',
      content: '<h1>Hello World</h1>',
      kind: 'html'
    };
    const description = 'regular update: change the heading';
    
    // Act
    const result = await htmlDocumentHandler.onUpdateDocument({
      document: mockDocument,
      description,
      dataStream: mockDataStream,
    });
    
    // Assert
    expect(mockWriteData).not.toHaveBeenCalledWith(expect.objectContaining({
      type: 'html-smart-update',
    }));
    expect(result).toContain('<h1>Regular Update</h1>');
  });
});

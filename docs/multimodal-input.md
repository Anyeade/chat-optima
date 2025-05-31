# Multimodal Input Component

The multimodal input component in Chat Optima allows users to send messages along with file attachments, including images. The component supports a variety of input methods, making it highly flexible and user-friendly.

## Features

### Text Input
- Regular text message input with real-time character counting
- Character limit of 15,000 characters with visual indicator (turns red when approaching limit)
- Auto-expanding text area that grows with content
- Supports keyboard shortcuts for efficient communication

### Image and File Attachments
- **File uploads**: Click the paperclip icon to select files from your device
- **Image paste**: Paste images directly from clipboard (Ctrl+V / Cmd+V)
- **Drag and drop**: Drag image files into the input area with visual feedback
- **Screen captures**: Paste screenshots directly into the input
- **Automatic uploading**: Handles file conversion and uploading automatically

## How to Use

### Pasting Images
1. Copy an image to your clipboard (using screenshot tools or right-click copy on an image)
2. Click on the input field to focus it
3. Press Ctrl+V (Windows/Linux) or Cmd+V (Mac) to paste the image
4. The image will be automatically uploaded and added to your message

### Drag and Drop
1. Select an image file from your computer
2. Drag it into the chat input area
3. Drop it when you see the blue highlight
4. The image will be automatically uploaded and added to your message

### File Upload
1. Click the paperclip icon in the bottom left of the input
2. Select one or more files from your device
3. The files will be uploaded and added to your message

## Troubleshooting

### Clipboard Permissions
- Modern browsers require permission to access clipboard content
- If prompted, allow the application to access your clipboard
- If previously denied permission, you may need to update your browser settings
- The component will notify users when it detects an image in the clipboard

### File Types and Sizes
- Supported image formats: PNG, JPEG, GIF, WebP, and others
- Maximum file size: Varies by deployment configuration
- If an upload fails, an error toast notification will appear

### Keyboard Shortcuts
- **Ctrl+V / Cmd+V**: Paste from clipboard
- **Enter**: Send message
- **Shift+Enter**: Add a new line without sending

## Implementation Details

### Component Structure
- Built with React and TypeScript
- Uses the `ai` library types for compatibility with chat interfaces
- Implements proper keyboard accessibility
- Supports both light and dark themes

### Image Processing
- Automatically generates unique filenames for pasted images
- Provides visual feedback during upload process
- Handles MIME type detection for proper file handling
- Supports parallel uploads of multiple files

### User Experience Enhancements
- Visual indicators for drag-and-drop operations
- Character count with warning when approaching limits
- Toast notifications for important events
- Responsive design for mobile and desktop
- Focus management for keyboard users
- Clipboard permission handling

### Error Handling
- Graceful fallbacks for unsupported browsers
- Clear error messages for upload failures
- Retry mechanisms for transient errors
- Defensive coding to prevent crashes

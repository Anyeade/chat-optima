# HTML Smart Update Feature

The HTML Smart Update feature allows AI to make targeted changes to HTML documents using search and replace operations, rather than rewriting the entire document. This makes the update process more efficient and faster, especially for larger HTML documents.

## How It Works

When a user requests an update to an HTML document, the system checks if the request includes keywords like "smart update" or "search and replace". If it does, the system uses the smart update process:

1. The AI analyzes the current HTML document and the requested changes
2. It generates a series of targeted update operations (replace, add, remove)
3. The system applies these operations sequentially to the document
4. Each operation is applied and streamed to the client in real-time
5. The UI displays an indicator showing that smart update is being used

## Update Operations

The smart update feature supports three types of operations:

### 1. Replace Operation

Finds and replaces specific content within the document.

```json
{
  "type": "replace",
  "search": "<h1>Old Title</h1>",
  "replace": "<h1>New Title</h1>"
}
```

### 2. Add Operation

Adds new content at a specific position relative to a target element.

```json
{
  "type": "add",
  "position": "after", // Can be "before", "after", "start", or "end"
  "target": "<div class=\"header\">",
  "content": "<p>New content</p>"
}
```

Position options:
- `before`: Insert before the target element
- `after`: Insert after the target element
- `start`: Insert after the opening tag of the target element
- `end`: Insert before the closing tag of the target element

### 3. Remove Operation

Removes specific content from the document.

```json
{
  "type": "remove",
  "search": "<div class=\"unused-section\">Content to remove</div>"
}
```

## Usage

To use the smart update feature, include one of the following phrases in your update request:
- "smart update"
- "search and replace"
- "specific change"
- "targeted update"

Examples:
- "Smart update: change the navigation bar background color to blue"
- "Smart update: add a new list item to the features section"
- "Smart update: remove the contact form"

## Benefits

- **Performance**: Faster updates, especially for large HTML documents
- **Efficiency**: Only changes what's needed, not the entire document
- **Transparency**: Shows the user when smart updates are being used
- **Precision**: Makes targeted changes with minimal impact on the rest of the document

## Implementation Details

The feature is implemented across several files:
- `server.ts`: Contains the core logic for detecting and applying smart updates
- `client.tsx`: Handles UI indicators and user interactions
- `data-stream-handler.tsx`: Manages the event stream between server and client

The smart update logic uses a schema-based approach to validate operations and applies them sequentially to ensure consistency.

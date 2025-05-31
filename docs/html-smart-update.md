# HTML Smart Update Feature

The HTML Smart Update feature allows AI to make targeted changes to HTML documents using precise operations rather than rewriting the entire document. This makes the update process more efficient, faster, and more accurate, especially for larger HTML documents.

## How It Works

When a user requests an update to an HTML document, the system checks:
1. If the request includes keywords like "smart update" or "search and replace"
2. If the request involves common HTML elements like headers, footers, navigation, or sections

If either condition is met, the system uses the smart update process:

1. The AI analyzes the current HTML document and the requested changes
2. It generates a series of targeted update operations, preferring DOM-based operations with CSS selectors
3. The system applies these operations sequentially to the document
4. Each operation is applied and streamed to the client in real-time
5. The UI displays an indicator showing that smart update is being used

## Update Operations

The smart update feature supports two approaches for HTML updates: string-based operations (traditional) and DOM-based operations using CSS selectors (advanced).

## String-Based Operations (Traditional)

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

## DOM-Based Operations (Advanced)

These operations use a full HTML parser with CSS selectors for more precise targeting.

### 1. DOM-Based Replace Operation

Replaces content of elements matching a CSS selector.

```json
{
  "type": "replace",
  "selector": ".header h1",
  "replace": "New Title",
  "useParser": true
}
```

### 2. DOM-Based Add Operation

Adds content relative to elements matching a CSS selector.

```json
{
  "type": "add",
  "selector": ".features",
  "position": "end", // Can be "before", "after", "start", or "end"
  "content": "<li>New feature item</li>",
  "useParser": true
}
```

### 3. DOM-Based Remove Operation

Removes elements matching a CSS selector.

```json
{
  "type": "remove",
  "selector": ".contact-form",
  "useParser": true
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

## Best Practices and Common Issues

### Avoiding Duplicate Elements

The DOM-based operations help prevent common issues like duplicated elements. For example:

- When adding a footer using a CSS selector, the system first checks if a footer already exists
- If one exists, it will update that footer rather than creating a duplicate
- If no footer exists, it will create one in the appropriate position

### Handling Missing Elements

When targeting elements that don't exist yet, the smart update system now has special handling:

- For common structural elements (header, footer, nav, main), the system will create these if they don't exist
- The new element will be placed in a semantically appropriate position within the document
- For headers and navs, they're positioned at the top of the body
- For footers, they're positioned at the bottom of the body

### Preventing Accidental Removal

The DOM-based approach with CSS selectors provides more precise targeting for removal operations:

- Instead of removing based on text content which might match too broadly
- Elements are removed based on their structural position in the document
- Warnings are issued if a selector doesn't match any elements

## Troubleshooting

If you encounter issues with the smart update feature:

1. **Duplicated Elements**: Specify the element type more clearly in your request, like "Update the existing footer" instead of "Add a footer"

2. **Missing Elements**: If elements are not being targeted correctly, try including class or ID information in your request

3. **Unexpected Changes**: Review the update instructions for clarity and specificity

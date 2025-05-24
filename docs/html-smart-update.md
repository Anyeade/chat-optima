# HTML Smart Update Feature

The HTML Smart Update feature enables AI-powered intelligent editing of HTML documents through targeted updates and suggestions rather than complete document rewrites. This approach preserves document structure while allowing precise modifications exactly where needed.

## How It Works

When a user requests an update to an HTML document, the system uses AI analysis to:
1. Determine if the request is for targeted changes or a complete rewrite
2. Analyze the document structure and existing style patterns
3. Choose the most appropriate update approach based on the request context
4. Generate targeted suggestions that can be selectively applied

The system uses advanced AI to determine when smart update mode is appropriate:

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

## Smart Update Types

The system supports multiple types of targeted changes:

1. **Targeted Additions**: Add new HTML elements to specific locations
2. **Targeted Modifications**: Update existing elements with improved markup
3. **Improvement Suggestions**: General best-practice suggestions for elements
4. **Hybrid Approaches**: Combinations of the above when appropriate

Changes are categorized to help users understand their purpose:

- **Accessibility**: Improvements for screen readers and keyboard navigation
- **Performance**: Optimizations for faster loading and rendering
- **SEO**: Enhancements for better search engine visibility
- **Responsive**: Changes for better mobile and multi-device support
- **Semantic**: Structural improvements using proper HTML5 elements
- **Style**: Visual and layout improvements

## Usage

To activate Smart Update Mode:

1. Click the "HTML Smart Mode" button in the toolbar
2. Make specific requests like:
   - "Add a navigation bar with 5 menu items"
   - "Change the hero section background to blue"
   - "Make this page more accessible"
   - "Fix the form layout on mobile devices"

3. Review the generated suggestions by clicking the icons in the code editor
4. Apply suggestions selectively by clicking "Apply Change" on each suggestion

## Benefits

- **Preserve Structure**: Keep the existing document structure intact
- **Targeted Changes**: Make precise changes only where needed
- **Selective Control**: Review and apply only the changes you want
- **Intelligent Context**: System understands document patterns and maintains consistency
- **Improved Quality**: More focused, higher-quality updates compared to full rewrites
- **Performance**: Faster updates, especially for large HTML documents
- **Transparency**: Provides clear feedback about the update approach

## Implementation Details

The feature is implemented across several files:
- `server.ts`: Contains the AI-powered logic for analysis and smart updates
- `client.tsx`: Handles UI indicators and suggestion widgets
- `suggestion.tsx`: Renders interactive suggestion components
- `data-stream-handler.tsx`: Manages the event stream between server and client

The smart update system uses:
1. **AI-Based Analysis**: Determines the appropriate update approach based on request context and document structure
2. **DOM Parsing**: Uses JSDOM to analyze and manipulate the document structure
3. **Targeted Suggestions**: Generates specific, focused changes as interactive widgets
4. **Context-Aware Processing**: Considers existing style patterns and document structure

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

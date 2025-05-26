# HTML Smart Update Alternatives

This directory contains enhanced HTML update methods to address issues with the current smart update implementation.

## 🚨 Current Smart Update Issues

The existing smart update system has several problems:

1. **AI Model Inconsistency**: The AI doesn't always generate valid JSON operations
2. **DOM Serialization Issues**: JSDOM serialization can alter HTML formatting
3. **Complex Schema Validation**: The current schema is too complex and often fails
4. **Poor Error Handling**: Failed operations don't provide clear feedback
5. **Limited Fallback Options**: Only falls back to full document rewrite

## 🔧 Alternative Methods

I've created 5 alternative update methods that are more reliable:

### 1. **Regex-Based Updates** (`regex`)
- **Best for**: Title, heading, footer, header changes
- **Pros**: Fast, reliable, works with any HTML
- **Cons**: Limited to simple pattern matching
- **Use when**: Updating common HTML elements

```typescript
// Automatically triggered by keywords: title, heading, footer, header
"Change the title to 'New Title'"
"Update the footer text"
```

### 2. **String Manipulation** (`string`)
- **Best for**: Simple text replacements
- **Pros**: Fastest method, works with any content
- **Cons**: Limited to exact text matches
- **Use when**: Making simple text changes

```typescript
// Triggered by: simple, text only, quick, replace text
"Simple text change: replace 'old text' with 'new text'"
```

### 3. **Template-Based Updates** (`template`)
- **Best for**: Structural changes, adding sections
- **Pros**: Preserves document structure, good for complex changes
- **Cons**: Requires well-structured HTML
- **Use when**: Adding or modifying sections

```typescript
// Triggered by: section, template, structure, layout
"Add a new contact section with a form"
```

### 4. **Diff-Based Updates** (`diff`)
- **Best for**: Intelligent merging of changes
- **Pros**: Preserves unchanged content, smart merging
- **Cons**: More complex, slower
- **Use when**: Making multiple related changes

```typescript
// Triggered by: diff, merge, compare, intelligent
"Intelligently merge these navigation changes"
```

### 5. **Simplified Smart Update** (`smart`)
- **Best for**: Targeted changes with CSS selectors
- **Pros**: More reliable than original smart update
- **Cons**: Still depends on AI model
- **Use when**: You specifically want smart update behavior

```typescript
// Triggered by: smart update, targeted, precise, specific change
"Smart update: change the navigation background color"
```

## 🚀 Quick Start

### 1. Replace the Current Handler

```typescript
// Replace this import
import { htmlDocumentHandler } from './artifacts/html/server';

// With this
import { enhancedHtmlDocumentHandler } from './artifacts/html/server-enhanced';
```

### 2. Use the Enhanced Handler

```typescript
// In your document handler registration
export const htmlHandler = enhancedHtmlDocumentHandler;
```

### 3. Configure Update Method (Optional)

```typescript
import { getUpdateConfig } from './artifacts/html/update-config';

// Use a specific configuration
const config = getUpdateConfig('performance'); // or 'reliability', 'advanced', 'debug'
```

## 🔍 Diagnostics and Debugging

### Run Diagnostics

```typescript
import { diagnoseHtmlUpdate, logDiagnostics } from './artifacts/html/diagnostics';

const result = diagnoseHtmlUpdate(htmlContent, updateDescription);
logDiagnostics(result, updateDescription);
```

### Test the System

```typescript
import { runAllTests } from './artifacts/html/test-alternatives';

// Run comprehensive tests
runAllTests();
```

## 📋 Configuration Options

### Available Configurations

1. **Performance**: Fast string-based updates
2. **Reliability**: Regex-based with fallbacks
3. **Advanced**: Smart updates with enhanced features
4. **Debug**: Extensive logging and diagnostics

### Custom Configuration

```typescript
import { UpdateConfig } from './artifacts/html/update-config';

const customConfig: UpdateConfig = {
  primaryMethod: 'regex',
  fallbackMethods: ['string', 'smart'],
  enableDebug: true,
  enableClientNotifications: true,
  aiTimeout: 30000,
  maxContentSizeForSmartUpdate: 100000,
  methodTriggers: {
    regex: ['title', 'heading', 'footer'],
    string: ['simple', 'quick'],
    // ... other triggers
  }
};
```

## 🎯 Method Selection Guide

| Update Type | Recommended Method | Trigger Keywords |
|-------------|-------------------|------------------|
| Title changes | `regex` | "title", "heading" |
| Footer/Header | `regex` | "footer", "header" |
| Simple text | `string` | "simple", "replace" |
| Add sections | `template` | "section", "add" |
| Complex changes | `diff` | "restructure", "reorganize" |
| Precise targeting | `smart` | "smart update", "targeted" |

## 🐛 Troubleshooting

### Common Issues and Solutions

1. **No changes applied**
   - Check console logs for warnings
   - Use diagnostics to identify issues
   - Try a different update method

2. **Method not detected**
   - Include specific keywords in your request
   - Use explicit method triggers
   - Check the method triggers configuration

3. **Large content slow updates**
   - Use `performance` configuration
   - Break updates into smaller operations
   - Use string manipulation for simple changes

4. **Invalid HTML errors**
   - Use string-based methods instead of DOM operations
   - Check HTML validity before updates
   - Use regex for pattern-based changes

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const config = getUpdateConfig('debug');
// This will log detailed information about:
// - Method selection
// - Operation attempts
// - Success/failure status
// - Performance metrics
```

## 📊 Performance Comparison

| Method | Speed | Reliability | Complexity | Best Use Case |
|--------|-------|-------------|------------|---------------|
| String | ⚡⚡⚡ | ⭐⭐⭐ | ⭐ | Simple text changes |
| Regex | ⚡⚡ | ⭐⭐⭐ | ⭐⭐ | Pattern-based updates |
| Template | ⚡ | ⭐⭐ | ⭐⭐⭐ | Structural changes |
| Diff | ⚡ | ⭐⭐ | ⭐⭐⭐ | Complex merging |
| Smart | ⚡ | ⭐ | ⭐⭐⭐⭐ | Precise targeting |

## 🔄 Migration Guide

### From Current Smart Updates

1. **Backup your current implementation**
2. **Replace the handler import**
3. **Test with your existing HTML documents**
4. **Adjust configurations as needed**
5. **Monitor console logs for any issues**

### Gradual Migration

You can run both systems in parallel:

```typescript
// Keep the old handler as fallback
import { htmlDocumentHandler as oldHandler } from './artifacts/html/server';
import { enhancedHtmlDocumentHandler as newHandler } from './artifacts/html/server-enhanced';

// Use new handler with fallback to old
const handler = process.env.USE_ENHANCED_HTML === 'true' ? newHandler : oldHandler;
```

## 🤝 Contributing

To add new update methods or improve existing ones:

1. Add your method to `server-enhanced.ts`
2. Update the `UpdateMethod` enum
3. Add configuration options in `update-config.ts`
4. Add diagnostics support in `diagnostics.ts`
5. Create tests in `test-alternatives.ts`

## 📝 Examples

### Example 1: Simple Title Change
```typescript
// Input: "Change the title to 'My New Website'"
// Method: regex
// Result: Fast, reliable title update
```

### Example 2: Add Footer
```typescript
// Input: "Add a footer with copyright information"
// Method: template
// Result: New footer section added to document structure
```

### Example 3: Complex Navigation Update
```typescript
// Input: "Smart update: modify the navigation to include dropdown menus"
// Method: smart
// Result: Targeted navigation changes with CSS selector precision
```

## 🔗 Related Files

- `server-enhanced.ts` - Enhanced HTML document handler
- `update-config.ts` - Configuration options
- `diagnostics.ts` - Diagnostic tools
- `test-alternatives.ts` - Test suite
- `server.ts` - Original implementation (for reference)

---

**Need help?** Check the diagnostics output or run the test suite to identify the best method for your use case. 
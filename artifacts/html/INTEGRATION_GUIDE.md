# Integration Guide: Switching to Enhanced HTML Updates

This guide will help you migrate from the current smart update system to the new enhanced HTML update methods.

## 🎯 Why Switch?

Your current smart updates aren't working because:

1. **AI Model Issues**: The AI doesn't consistently generate valid JSON operations
2. **Complex Schema**: The current schema is too complex and often fails validation
3. **DOM Serialization**: JSDOM can alter HTML formatting unexpectedly
4. **Poor Error Handling**: Failed operations don't provide clear feedback

## 🚀 Quick Migration (5 minutes)

### Step 1: Update Your Server Handler

Find your current HTML document handler registration (likely in `artifacts/html/server.ts` or similar):

```typescript
// BEFORE (current implementation)
import { htmlDocumentHandler } from '@/artifacts/html/server';

// AFTER (enhanced implementation)
import { enhancedHtmlDocumentHandler as htmlDocumentHandler } from '@/artifacts/html/server-enhanced';
```

### Step 2: Test the New System

1. Start your development server
2. Create an HTML document
3. Try these test updates:

```
"Change the title to 'Test Title'"           // Should use regex method
"Simple text: replace 'old' with 'new'"      // Should use string method  
"Smart update: modify the footer"            // Should use smart method
```

### Step 3: Monitor Console Logs

The new system provides detailed logging:

```
Using update method: regex
Regex-based update method
Operation: title-update, success: true
```

## 🔧 Advanced Configuration

### Option 1: Use Performance Configuration

For fastest updates:

```typescript
import { enhancedHtmlDocumentHandler } from '@/artifacts/html/server-enhanced';
import { getUpdateConfig } from '@/artifacts/html/update-config';

// Configure for performance
const config = getUpdateConfig('performance');
// This prioritizes string manipulation and regex methods
```

### Option 2: Use Reliability Configuration

For most reliable updates:

```typescript
const config = getUpdateConfig('reliability');
// This prioritizes regex and string methods with multiple fallbacks
```

### Option 3: Custom Configuration

```typescript
import { UpdateConfig } from '@/artifacts/html/update-config';

const customConfig: UpdateConfig = {
  primaryMethod: 'auto',
  fallbackMethods: ['string', 'regex', 'smart'],
  enableDebug: true,
  enableClientNotifications: true,
  aiTimeout: 30000,
  maxContentSizeForSmartUpdate: 100000,
  methodTriggers: {
    regex: ['title', 'heading', 'footer', 'header'],
    string: ['simple', 'text', 'replace'],
    template: ['section', 'add', 'structure'],
    diff: ['merge', 'intelligent'],
    smart: ['smart update', 'targeted', 'precise']
  }
};
```

## 🔍 Troubleshooting Common Issues

### Issue 1: Updates Not Working

**Symptoms**: No changes applied to HTML document

**Solution**:
```typescript
import { diagnoseHtmlUpdate, logDiagnostics } from '@/artifacts/html/diagnostics';

// Add this to your update handler
const diagnostic = diagnoseHtmlUpdate(document.content, description);
logDiagnostics(diagnostic, description);
```

**Check for**:
- Invalid HTML content
- Missing trigger keywords
- Content size issues

### Issue 2: Wrong Method Selected

**Symptoms**: System uses wrong update method

**Solution**: Use explicit keywords in your update requests:

```typescript
// Instead of: "change footer"
// Use: "regex: change footer" or "simple: change footer"

// Or configure method triggers:
const config = getUpdateConfig('reliability'); // Prefers regex
```

### Issue 3: Slow Performance

**Symptoms**: Updates take too long

**Solution**: Use performance configuration:

```typescript
const config = getUpdateConfig('performance');
// This prioritizes fast string manipulation
```

### Issue 4: AI Model Errors

**Symptoms**: Smart updates fail with AI errors

**Solution**: The new system has better fallbacks:

```typescript
// If smart update fails, it automatically falls back to:
// 1. String manipulation
// 2. Regex patterns  
// 3. Regular full rewrite
```

## 📊 Method Selection Guide

Use this guide to choose the right method for your updates:

| Your Update Request | Best Method | Example Trigger |
|-------------------|-------------|-----------------|
| Change title/heading | `regex` | "Change the title to..." |
| Simple text replacement | `string` | "Replace 'old' with 'new'" |
| Add new section | `template` | "Add a contact section" |
| Complex restructuring | `diff` | "Reorganize the layout" |
| Precise targeting | `smart` | "Smart update: change nav color" |

## 🧪 Testing Your Migration

### Test 1: Basic Functionality

```typescript
// Test these update requests:
const testUpdates = [
  "Change the title to 'Migration Test'",
  "Update the footer text",
  "Simple: replace 'Hello' with 'Hi'",
  "Add a new section for testimonials"
];
```

### Test 2: Performance

```typescript
// Test with large HTML documents
const largeHtml = yourHtmlContent.repeat(10);
// Should automatically use string manipulation for better performance
```

### Test 3: Error Handling

```typescript
// Test with invalid requests
const invalidUpdates = [
  "Do something impossible",
  "Change non-existent element",
  ""  // Empty request
];
// Should gracefully fall back to regular updates
```

## 🔄 Rollback Plan

If you need to rollback to the original system:

### Step 1: Revert Import

```typescript
// Change back to:
import { htmlDocumentHandler } from '@/artifacts/html/server';
```

### Step 2: Remove Enhanced Files (Optional)

The enhanced files don't interfere with the original system, so you can keep them for future use.

## 📈 Monitoring and Metrics

### Enable Debug Logging

```typescript
const config = getUpdateConfig('debug');
// This provides detailed logs about:
// - Method selection reasoning
// - Operation success/failure
// - Performance timing
// - Fallback triggers
```

### Key Metrics to Monitor

1. **Update Success Rate**: Should be >95%
2. **Method Distribution**: Track which methods are used most
3. **Performance**: Average update time should be <2 seconds
4. **Fallback Rate**: Should be <10%

## 🎉 Success Indicators

You'll know the migration is successful when:

✅ **Updates work consistently** - No more failed smart updates  
✅ **Fast performance** - Updates complete in <2 seconds  
✅ **Clear feedback** - Console logs show what's happening  
✅ **Automatic fallbacks** - System handles edge cases gracefully  
✅ **Better user experience** - Users see reliable updates  

## 🆘 Need Help?

### Check Diagnostics

```typescript
import { runAllTests } from '@/artifacts/html/test-alternatives';
runAllTests(); // Comprehensive system test
```

### Common Solutions

1. **Enable debug mode** for detailed logging
2. **Use explicit method triggers** in update requests
3. **Check HTML validity** with diagnostics
4. **Try different configurations** (performance, reliability, etc.)

### Contact Points

- Check console logs for detailed error messages
- Use the diagnostic tools to identify issues
- Review the method selection logic in the logs
- Test with the provided examples

---

**Ready to migrate?** Start with the Quick Migration steps above and monitor the console logs for feedback! 
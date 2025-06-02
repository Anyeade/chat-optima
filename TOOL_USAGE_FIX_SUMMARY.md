# Tool Usage Fix Summary

## Problem Identified
The AI was trying to use `applyDiff` and `readDocument` tools for simple text responses and conversations, instead of only using them for document editing tasks. This was caused by overly aggressive tool usage instructions in the prompts.

## Root Cause
In `lib/ai/prompts.ts`, the `artifactsPrompt` section had:
- Line 22: `applyDiff: **PREFERRED** for all edits` (too broad)
- Missing clear distinction between regular responses vs. document editing
- No explicit guidance on when NOT to use tools

## Changes Made

### 1. Fixed `artifactsPrompt` (lines 20-44)
**Before:**
```
- `applyDiff`: **PREFERRED** for all edits - adding features, fixing bugs, styling updates, content changes
```

**After:**
```
- `applyDiff`: **PREFERRED** for editing existing documents - adding features, fixing bugs, styling updates
**⚠️ IMPORTANT: Use tools ONLY when editing existing documents or creating new artifacts**
**For simple questions, explanations, or text responses - respond normally without tools**
```

### 2. Enhanced `regularPrompt` (lines 97-119)
**Added:**
- **Regular Responses**: Answer questions, provide explanations, give advice (most common)
- **⚠️ TOOL USAGE GUIDELINES:** section with clear conditions
- **Never use editing tools for simple questions or explanations**

## Expected Behavior After Fix

### ✅ Should Use Tools:
- Creating new HTML websites, code projects, documents
- Editing existing artifacts (user says "update my website", "add navigation to the HTML")
- Modifying existing documents with specific requests

### ✅ Should NOT Use Tools (Regular Response):
- Answering questions ("What is React?")
- Providing explanations ("How does CSS work?")
- General conversation and advice
- Simple text responses without document creation/editing

## Verification

### Test Cases:
1. **Simple Question**: "What is JavaScript?" → Should respond normally ✅
2. **Create New**: "Create a website for a bakery" → Should use `createDocument` ✅  
3. **Edit Existing**: "Add a navigation menu to my HTML" → Should use `readDocument` + `applyDiff` ✅

### Files Modified:
- `lib/ai/prompts.ts` - Fixed tool usage instructions
- `test-document-tools.js` - Created comprehensive testing script

## Status: ✅ RESOLVED

The AI should now:
- Respond normally for questions and conversations
- Use tools only when appropriate for document creation/editing
- Follow the proper workflow: readDocument → applyDiff for existing document modifications

The original navigation menu addition issue should now work correctly with the enhanced `readDocument` + `applyDiff` workflow.
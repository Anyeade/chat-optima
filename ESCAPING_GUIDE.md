# 🔧 Code Block Escaping Guide - Avoiding JavaScript Parsing Errors

## 🎯 Purpose

This guide explains how to properly escape special characters in code block demos to prevent JavaScript parsing errors and ensure code examples display correctly.

## ⚠️ Common Issues

### 1. **Template Literal Conflicts**
When using template literals (backticks) inside template literals, you need proper escaping:

```typescript
// ❌ WRONG - Will cause parsing errors
const badExample = `
function example() {
  const template = `Hello ${name}`;
  return template;
}
`;

// ✅ CORRECT - Properly escaped
const goodExample = `
function example() {
  const template = \`Hello \${name}\`;
  return template;
}
`;
```

### 2. **JSX Expression Conflicts**
When showing JSX code inside JSX components:

```typescript
// ❌ WRONG - JSX parser will try to evaluate expressions
const badJSX = `
return (
  <div>
    <h1>{title}</h1>
    <p>{content}</p>
  </div>
);
`;

// ✅ CORRECT - Escaped JSX expressions
const goodJSX = `
return (
  <div>
    <h1>\{title\}</h1>
    <p>\{content\}</p>
  </div>
);
`;
```

## 🛠️ Escaping Rules

### 1. **Template Literals (`${}`)** 
```typescript
// Escape with backslash
const code = `const message = \`Hello \${name}\`;`;
```

### 2. **JSX Expressions (`{}`)** 
```typescript
// Escape with backslash
const jsx = `<div className=\{styles.container\}>Content</div>`;
```

### 3. **Backticks in Code Examples**
```typescript
// Escape backticks with backslash
const markdown = `
Use \`\`\`javascript
console.log('Hello');
\`\`\`
`;
```

### 4. **Quotes in Strings**
```typescript
// Use different quote types or escape
const code1 = `const message = "Hello 'World'";`;
const code2 = `const message = 'Hello "World"';`;
const code3 = `const message = "Hello \"World\"";`;
```

## 📝 Best Practices for Code Block Demo

### 1. **Use Template Literals for Multi-line Code**
```typescript
const sampleCode = `
// Multi-line code example
function processData(data) {
  const result = data.map(item => ({
    id: item.id,
    name: item.name.toUpperCase()
  }));
  return result;
}
`;
```

### 2. **Escape Template Expressions**
```typescript
const reactCode = `
const Component = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: \{count\}</p>
      <button onClick=\{() => setCount(count + 1)\}>
        Increment
      </button>
    </div>
  );
};
`;
```

### 3. **Handle Different Languages**

#### **JavaScript/TypeScript:**
```typescript
const jsCode = `
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(\`Failed to fetch: \${error.message}\`);
    throw error;
  }
};
`;
```

#### **Python:**
```typescript
const pythonCode = `
def process_data(data: Dict) -> str:
    """Process data and return formatted string"""
    template = f"Hello {data['name']}, you have {data['count']} items"
    return template
`;
```

#### **Shell/Bash:**
```typescript
const shellCode = `
#!/bin/bash
echo "Current directory: \$(pwd)"
echo "Files: \$(ls -la)"
`;
```

#### **SQL:**
```typescript
const sqlCode = `
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name;
`;
```

## 🔧 Inline Code Examples

### **Using Template Literals:**
```typescript
<CodeBlock node={null} inline={true} className="">
  {`const greeting = "Hello World";`}
</CodeBlock>
```

### **Complex Expressions:**
```typescript
<CodeBlock node={null} inline={true} className="">
  {`const data = \${JSON.stringify(obj)};`}
</CodeBlock>
```

### **Multiple Languages:**
```typescript
// JavaScript
{`const result = items.filter(item => item.active);`}

// Python  
{`result = [item for item in items if item.active]`}

// Shell
{`find . -name "*.js" -type f`}
```

## 🧪 Testing Your Escaping

### **Check for Common Issues:**

1. **Syntax Highlighting Works:** Code should be properly highlighted
2. **No JavaScript Errors:** Check browser console for parsing errors
3. **Copy Function Works:** Users should be able to copy the exact code
4. **Display Accuracy:** Code should display exactly as intended

### **Test Cases:**
```typescript
// Test template literals
const test1 = `console.log(\`Hello \${name}\`);`;

// Test JSX expressions  
const test2 = `<div className=\{styles.container\}>\{content\}</div>`;

// Test nested quotes
const test3 = `const message = "He said 'Hello' to me";`;

// Test backticks in markdown
const test4 = `Use \`\`\`javascript for code blocks\`\`\``;
```

## 🚨 Common Mistakes to Avoid

### 1. **Unescaped Template Literals**
```typescript
// ❌ Will break
const bad = `const msg = `Hello ${name}`;`;

// ✅ Correct
const good = `const msg = \`Hello \${name}\`;`;
```

### 2. **Unescaped JSX Expressions**
```typescript
// ❌ Will break
const bad = `<div>{content}</div>`;

// ✅ Correct  
const good = `<div>\{content\}</div>`;
```

### 3. **Mixed Quote Types**
```typescript
// ❌ Confusing
const bad = `const msg = 'He said "Hello" to me';`;

// ✅ Clear
const good = `const msg = "He said 'Hello' to me";`;
```

## 🎯 Summary

**Key Escaping Rules:**
- `${}` → `\${}`
- `{}` in JSX → `\{}`  
- Backticks → `\``
- Use consistent quote styles
- Test thoroughly in browser

**Best Practices:**
- Use template literals for multi-line code
- Escape all dynamic expressions
- Test copy functionality
- Verify syntax highlighting
- Check for console errors

Following these guidelines ensures your code block demos work perfectly without JavaScript parsing errors! 🎉 
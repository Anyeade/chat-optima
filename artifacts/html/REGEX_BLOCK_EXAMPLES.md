# 🧩 Regex Block Replace Method Examples

The **Regex Block Replace** method is perfect for complex pattern-based replacements and block-level modifications that go beyond simple string matching.

## 🎯 When to Use Regex Block Replace

Use this method when you need to:

- **Replace multiple similar elements** with different content
- **Modify complex HTML structures** with patterns
- **Update attributes across multiple elements**
- **Replace entire blocks** based on start/end patterns
- **Perform advanced text transformations** with capture groups

## 🔧 How It Works

The method uses two types of operations:

### 1. **Regex Replace** (`regex_replace`)
- Uses regex patterns with capture groups
- Perfect for attribute modifications, class changes, etc.
- Supports all regex flags (g, i, m, s)

### 2. **Block Replace** (`block_replace`)
- Finds content between start and end patterns
- Replaces entire blocks with new content
- Great for replacing sections, components, etc.

## 📝 Example Use Cases

### Example 1: Update All Button Classes

**Request**: `"Regex block: change all button classes from 'btn-old' to 'btn-new'"`

**What it does**:
```html
<!-- Before -->
<button class="btn-old primary">Click me</button>
<button class="btn-old secondary">Cancel</button>

<!-- After -->
<button class="btn-new primary">Click me</button>
<button class="btn-new secondary">Cancel</button>
```

### Example 2: Replace All Image Alt Text

**Request**: `"Regex replace: update all image alt attributes to include 'Updated: ' prefix"`

**What it does**:
```html
<!-- Before -->
<img src="photo1.jpg" alt="Beautiful sunset">
<img src="photo2.jpg" alt="Mountain view">

<!-- After -->
<img src="photo1.jpg" alt="Updated: Beautiful sunset">
<img src="photo2.jpg" alt="Updated: Mountain view">
```

### Example 3: Replace Navigation Block

**Request**: `"Block replace: replace the entire navigation section with a new menu"`

**What it does**:
```html
<!-- Before -->
<nav class="old-nav">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- After -->
<nav class="new-nav">
  <div class="menu-container">
    <a href="/home" class="nav-link">Home</a>
    <a href="/about" class="nav-link">About</a>
    <a href="/contact" class="nav-link">Contact</a>
  </div>
</nav>
```

### Example 4: Update All Links with Target Attribute

**Request**: `"Regex block: add target='_blank' to all external links"`

**What it does**:
```html
<!-- Before -->
<a href="https://example.com">External Link</a>
<a href="/internal">Internal Link</a>

<!-- After -->
<a href="https://example.com" target="_blank">External Link</a>
<a href="/internal">Internal Link</a>
```

## 🚀 Trigger Keywords

Use these phrases to activate the regex block replace method:

### Explicit Triggers
- `"Regex block: ..."`
- `"Block replace: ..."`
- `"Regex replace: ..."`

### Auto-Detection Triggers
- `"Complex: ..."`
- `"Advanced: ..."`
- `"Multiple: ..."`
- `"Replace all ..."`
- `"Change all ..."`
- `"Restructure ..."`
- `"Reorganize ..."`

## 💡 Pro Tips

### 1. **Be Specific with Patterns**
```
❌ "Change all buttons"
✅ "Regex block: change all buttons with class 'old-btn' to 'new-btn'"
```

### 2. **Use Descriptive Requests**
```
❌ "Update links"
✅ "Regex replace: add target='_blank' to all external links (starting with http)"
```

### 3. **Combine with Other Methods**
```
✅ "First regex block: update all images, then simple: change the title"
```

### 4. **Test Complex Patterns**
```
✅ "Regex block: replace all div elements with class containing 'card' with new structure"
```

## 🔍 What You'll See in Console

When using regex block replace, you'll see detailed feedback:

```
Using update method: regex_block
Using regex block replace update method
Operation: regex-replace, pattern: class="btn-old", description: Update button classes, success: true
Operation: block-replace, description: Replace navigation section, success: true
```

## ⚠️ Error Handling

If a regex pattern fails, the system will:

1. **Log the error** with details
2. **Continue with other operations**
3. **Fall back to other methods** if needed
4. **Provide clear feedback** about what went wrong

## 🎯 Performance

- **Fast** for pattern-based operations
- **Efficient** for multiple similar changes
- **Reliable** with proper error handling
- **Scalable** for large documents

---

**🧩 The Regex Block Replace method gives you powerful pattern-matching capabilities for complex HTML modifications!** 
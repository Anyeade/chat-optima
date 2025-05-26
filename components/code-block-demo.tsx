'use client';

import { useState } from 'react';
import { CodeBlock } from './code-block';

export function CodeBlockDemo() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const sampleCode = `// Enhanced Code Block with Dark/Light Mode Support
import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserComponent: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner">Loading...</div>;
  }

  return (
    <div className="user-list">
      <h2>Users ({users.length})</h2>
      {users.map(user => (
        <div key={user.id} className="user-card">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

export default UserComponent;`;

  const pythonCode = `# Python example with syntax highlighting
import asyncio
import aiohttp
from typing import List, Dict, Optional

class DataProcessor:
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_data(self, endpoint: str) -> Dict:
        """Fetch data from API endpoint"""
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        async with self.session.get(f"{self.api_url}/{endpoint}") as response:
            response.raise_for_status()
            return await response.json()
    
    async def process_batch(self, items: List[str]) -> List[Dict]:
        """Process multiple items concurrently"""
        tasks = [self.fetch_data(item) for item in items]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        return [r for r in results if not isinstance(r, Exception)]

# Usage example
async def main():
    async with DataProcessor("https://api.example.com") as processor:
        items = ["users", "posts", "comments"]
        results = await processor.process_batch(items)
        print(f"Processed {len(results)} items successfully")

if __name__ == "__main__":
    asyncio.run(main())`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Enhanced Code Block Demo
        </h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Features:
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>🎨 <strong>Reactive Theme Switching</strong> - Automatically detects and responds to theme changes</li>
          <li>🔄 <strong>Multiple Theme Detection</strong> - Supports class-based, data-attribute, and system preference detection</li>
          <li>🎯 <strong>Fallback Theme Support</strong> - Multiple theme options with graceful fallbacks</li>
          <li>⚡ <strong>Performance Optimized</strong> - Efficient re-highlighting and theme loading</li>
          <li>📱 <strong>Mobile Responsive</strong> - Optimized for mobile devices with proper text wrapping</li>
          <li>♿ <strong>Accessibility</strong> - Proper focus states and ARIA labels</li>
          <li>📋 <strong>Copy Functionality</strong> - One-click code copying with visual feedback</li>
        </ul>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            TypeScript/React Example:
          </h3>
          <CodeBlock
            node={null}
            inline={false}
            className="language-typescript"
          >
            {sampleCode}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            Python Example:
          </h3>
          <CodeBlock
            node={null}
            inline={false}
            className="language-python"
          >
            {pythonCode}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            Inline Code Examples:
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Here's some inline code: <CodeBlock node={null} inline={true} className="">const greeting = "Hello World";</CodeBlock> and 
            another example: <CodeBlock node={null} inline={true} className="">npm install react</CodeBlock>. 
            Notice how the inline code adapts to the current theme automatically.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
          Theme Detection Methods:
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>1. <code className="code-block-inline">document.documentElement.classList.contains('dark')</code></li>
          <li>2. <code className="code-block-inline">document.documentElement.getAttribute('data-theme')</code></li>
          <li>3. <code className="code-block-inline">window.matchMedia('(prefers-color-scheme: dark)')</code></li>
        </ul>
      </div>
    </div>
  );
} 
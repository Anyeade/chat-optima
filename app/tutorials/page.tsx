'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function TutorialsPage() {
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);

  const toggleTutorial = (tutorialId: string) => {
    setExpandedTutorial(expandedTutorial === tutorialId ? null : tutorialId);
  };

  const tutorialContent = {
    'getting-started': {
      title: 'Getting Started with Optima AI',
      duration: '10 min',
      level: 'Beginner',
      tech: 'Web Interface',
      description: 'Your first steps with Optima AI - from creating an account to your first AI conversation.',
      content: (
        <div className="space-y-6 text-gray-300">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 1: Create Your Account</h4>
            <p className="mb-2">Visit <span className="text-[#58a6ff]">app.optima-ai.com</span> and click &quot;Sign Up&quot;</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enter your email address</li>
              <li>Create a secure password</li>
              <li>Verify your email</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 2: Navigate the Interface</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Sidebar: Access chat history and settings</li>
              <li>Main area: Your conversation space</li>
              <li>Model selector: Choose your AI model</li>
              <li>Input area: Type your messages</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 3: Start Your First Chat</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <p className="text-green-400 text-sm">💡 Try this: &quot;Hello! Can you explain what you can help me with?&quot;</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 4: Explore Features</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Upload files by dragging and dropping</li>
              <li>Ask for code generation</li>
              <li>Request explanations and tutorials</li>
              <li>Save important conversations</li>
            </ul>
          </div>
        </div>
      )
    },
    'first-api-call': {
      title: 'Making Your First API Call',
      duration: '25 min',
      level: 'Intermediate',
      tech: 'JavaScript',
      description: 'Learn how to authenticate and make your first request to the Optima AI API.',
      content: (
        <div className="space-y-6 text-gray-300">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 1: Get Your API Key</h4>
            <p className="mb-2">Navigate to your account settings to generate an API key:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Go to Settings → API Keys</li>
              <li>Click &quot;Create New Key&quot;</li>
              <li>Copy and securely store your key</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 2: Set Up Your Environment</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm">
                {`# Install dependencies
npm install node-fetch

# Set environment variable
export OPTIMA_AI_API_KEY="your-api-key-here"`}
              </code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 3: Make Your First Request</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm whitespace-pre">
                {`const fetch = require('node-fetch');

async function callOptimaAI() {
  const response = await fetch('https://api.optima-ai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPTIMA_AI_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'user', content: 'Hello, world!' }
      ]
    })
  });
  
  const data = await response.json();
  console.log(data.choices[0].message.content);
}

callOptimaAI();`}
              </code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 4: Handle Errors</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm">
                {`if (!response.ok) {
  throw new Error(\`HTTP error! status: \${response.status}\`);
}`}
              </code>
            </div>
          </div>
        </div>
      )
    },
    'streaming-responses': {
      title: 'Implementing Streaming Responses',
      duration: '30 min',
      level: 'Intermediate',
      tech: 'JavaScript',
      description: 'Build real-time chat experiences with streaming API responses and proper error handling.',
      content: (
        <div className="space-y-6 text-gray-300">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Understanding Streaming</h4>
            <p className="mb-4">Streaming allows you to receive partial responses as they're generated, creating a more interactive experience.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 1: Enable Streaming</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm">
                {`const response = await fetch(&apos;https://api.optima-ai.com/v1/chat/completions&apos;, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: 'Tell me a story' }],
    stream: true  // Enable streaming
  })
});`}
              </code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 2: Process Streaming Data</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm whitespace-pre">
                {`const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          // Update UI with new content
          updateChatUI(content);
        }
      } catch (e) {
        // Handle parsing errors
      }
    }
  }
}`}
              </code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 3: Update UI in Real-time</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm">
                {`function updateChatUI(content) {
  const messageElement = document.getElementById('current-message');
  messageElement.textContent += content;
  
  // Auto-scroll to bottom
  messageElement.scrollIntoView({ behavior: 'smooth' });
}`}
              </code>
            </div>
          </div>
        </div>
      )
    },
    'python-cli': {
      title: 'Building a Python CLI Assistant',
      duration: '35 min',
      level: 'Intermediate',
      tech: 'Python',
      description: 'Create a command-line AI assistant using Python and the Optima AI SDK.',
      content: (
        <div className="space-y-6 text-gray-300">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 1: Project Setup</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm">
                {`# Create project directory
mkdir optima-cli-assistant
cd optima-cli-assistant

# Install dependencies
pip install requests click rich

# Create main file
touch cli_assistant.py`}
              </code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 2: Basic CLI Structure</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm whitespace-pre">
                {`import click
import requests
from rich.console import Console
from rich.markdown import Markdown

console = Console()

@click.command()
@click.option('--api-key', required=True, help='Your Optima AI API key')
@click.option('--model', default='gpt-4-turbo', help='AI model to use')
def chat(api_key, model):
    """Interactive CLI chat with Optima AI"""
    console.print("[bold blue]Optima AI CLI Assistant[/bold blue]")
    console.print("Type 'quit' to exit\\n")
    
    while True:
        user_input = console.input("[bold green]You: [/bold green]")
        if user_input.lower() == 'quit':
            break
            
        response = call_optima_ai(api_key, model, user_input)
        console.print(f"[bold blue]AI: [/bold blue]{response}")

if __name__ == '__main__':
    chat()`}
              </code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 3: API Integration</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm whitespace-pre">
                {`def call_optima_ai(api_key, model, message):
    url = 'https://api.optima-ai.com/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    data = {
        'model': model,
        'messages': [{'role': 'user', 'content': message}]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except requests.exceptions.RequestException as e:
        return f"Error: {e}"`}
              </code>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Step 4: Add Conversation Memory</h4>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <code className="text-green-400 text-sm">
                {`# Add conversation history
conversation_history = []

# In your chat loop:
conversation_history.append({'role': 'user', 'content': user_input})
response = call_optima_ai(api_key, model, conversation_history)
conversation_history.append({'role': 'assistant', 'content': response})`}
              </code>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-githubDark font-poppins text-white">
      {/* Particles Background */}
      <HeroParticles />
      
      {/* Header/Navigation */}
      <AuthAwareNavbar />
      
      {/* Scroll to top button */}
      <ScrollToTopButton />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
              Tutorials
            </span>
            <br />
            <span className="text-white">Learn by Doing</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Step-by-step tutorials to help you master Optima AI and build amazing AI-powered applications.
          </p>
        </div></div>
      </section>

      {/* Tutorial Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Quick Start</h3>
              <p className="text-gray-400 text-sm">Get up and running with Optima AI in minutes</p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Development</h3>
              <p className="text-gray-400 text-sm">Build applications with our APIs and SDKs</p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Advanced</h3>
              <p className="text-gray-400 text-sm">Master advanced features and best practices</p>
            </div>
          </div>          {/* Featured Tutorial */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Featured Tutorial</h2>
            <div className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div 
                className="p-8 cursor-pointer"
                onClick={() => toggleTutorial('featured')}
              >
                <div className="flex items-center mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-sm rounded-full">Featured</span>
                  <span className="ml-4 text-gray-400 text-sm">45 min read</span>
                  <div className="ml-auto">
                    <svg 
                      className={`w-5 h-5 text-[#58a6ff] transition-transform duration-200 ${
                        expandedTutorial === 'featured' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">
                  Building a Complete AI Chatbot with Optima AI API
                </h3>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  Learn how to build a full-featured AI chatbot from scratch using our REST API. This comprehensive tutorial 
                  covers everything from authentication to implementing streaming responses, file uploads, and conversation memory.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded">JavaScript</span>
                    <span className="px-3 py-1 bg-green-600 text-green-100 text-sm rounded">Beginner</span>
                    <span className="text-gray-400 text-sm">Updated Dec 13, 2024</span>
                  </div>
                  <span className="text-[#58a6ff] text-lg font-semibold">
                    {expandedTutorial === 'featured' ? 'Hide Tutorial ↑' : 'Start Tutorial →'}
                  </span>
                </div>
              </div>
              
              {expandedTutorial === 'featured' && (
                <div className="px-8 pb-8 border-t border-[#2f343c]">
                  <div className="pt-6 space-y-6 text-gray-300">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-4">What You'll Build</h4>
                      <p className="mb-4">A complete chatbot application with:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Real-time streaming responses</li>
                        <li>Conversation memory</li>
                        <li>File upload capabilities</li>
                        <li>Multiple AI model support</li>
                        <li>Professional UI/UX</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-4">Prerequisites</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Basic JavaScript knowledge</li>
                        <li>Familiarity with REST APIs</li>
                        <li>HTML/CSS basics</li>
                        <li>Optima AI account (free)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-4">Tutorial Outline</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-[#0f0f0f] rounded border border-gray-600">
                          <span>1. Project Setup & Authentication</span>
                          <span className="text-sm text-gray-400">10 min</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#0f0f0f] rounded border border-gray-600">
                          <span>2. Basic Chat Interface</span>
                          <span className="text-sm text-gray-400">15 min</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#0f0f0f] rounded border border-gray-600">
                          <span>3. Implementing Streaming</span>
                          <span className="text-sm text-gray-400">10 min</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#0f0f0f] rounded border border-gray-600">
                          <span>4. Adding Memory & Context</span>
                          <span className="text-sm text-gray-400">10 min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-600">
                      <div className="flex gap-4">
                        <button className="px-6 py-3 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                          Start Tutorial Now
                        </button>
                        <button className="px-6 py-3 border border-[#58a6ff] text-[#58a6ff] font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors">
                          Download Starter Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>{/* Interactive Tutorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(tutorialContent).map(([key, tutorial]) => (
              <div key={key} className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden">
                <div 
                  className="p-6 hover:border-[#58a6ff]/30 transition-colors cursor-pointer"
                  onClick={() => toggleTutorial(key)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        tutorial.level === 'Beginner' ? 'bg-green-600 text-green-100' :
                        tutorial.level === 'Intermediate' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-red-600 text-red-100'
                      }`}>
                        {tutorial.level}
                      </span>
                      <span className="text-gray-400 text-sm">{tutorial.duration}</span>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-[#58a6ff] transition-transform duration-200 ${
                        expandedTutorial === key ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {tutorial.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">
                      {tutorial.tech}
                    </span>
                    <span className="text-[#58a6ff] text-sm">
                      {expandedTutorial === key ? 'Hide Tutorial ↑' : 'Start Tutorial →'}
                    </span>
                  </div>
                </div>
                
                {expandedTutorial === key && (
                  <div className="px-6 pb-6 border-t border-[#2f343c]">
                    <div className="pt-4">
                      {tutorial.content}
                      <div className="mt-6 pt-4 border-t border-gray-600">
                        <div className="flex gap-4">
                          <button className="px-4 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white rounded hover:opacity-90 transition-opacity">
                            Try in Optima AI
                          </button>
                          <button className="px-4 py-2 border border-[#58a6ff] text-[#58a6ff] rounded hover:bg-[#58a6ff] hover:text-white transition-colors">
                            Download Code
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Tutorials */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8 text-white">More Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Static tutorials that don't expand */}
              <div className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] p-6 hover:border-[#58a6ff]/30 transition-colors">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-red-600 text-red-100 text-xs rounded">Advanced</span>
                  <span className="ml-2 text-gray-400 text-sm">50 min</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">File Upload and Processing</h3>
                <p className="text-gray-400 text-sm mb-4">Handle file uploads, image analysis, and document processing with multimodal AI models.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 bg-orange-600 text-orange-100 text-xs rounded">React</span>
                  <span className="text-[#58a6ff] text-sm">Free</span>
                </div>
                <button className="text-[#58a6ff] text-sm hover:underline">Coming Soon →</button>
              </div>

              <div className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] p-6 hover:border-[#58a6ff]/30 transition-colors">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">Intermediate</span>
                  <span className="ml-2 text-gray-400 text-sm">20 min</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Prompt Engineering Best Practices</h3>
                <p className="text-gray-400 text-sm mb-4">Master the art of crafting effective prompts to get better results from AI models.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 bg-gray-600 text-gray-100 text-xs rounded">Concepts</span>
                  <span className="text-[#58a6ff] text-sm">Free</span>
                </div>
                <button className="text-[#58a6ff] text-sm hover:underline">Coming Soon →</button>
              </div>

              <div className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] p-6 hover:border-[#58a6ff]/30 transition-colors">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">Intermediate</span>
                  <span className="ml-2 text-gray-400 text-sm">30 min</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Building VS Code Extension</h3>
                <p className="text-gray-400 text-sm mb-4">Create a VS Code extension that integrates Optima AI directly into your development environment.</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">TypeScript</span>
                  <span className="text-[#58a6ff] text-sm">Free</span>
                </div>
                <button className="text-[#58a6ff] text-sm hover:underline">Coming Soon →</button>
              </div>
            </div>
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 border border-[#58a6ff] text-[#58a6ff] font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors">
              Load More Tutorials
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to start building?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Pick a tutorial and start building amazing AI-powered applications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Optima AI
            </Link>
            <Link
              href="/api"
              className="inline-flex items-center px-8 py-4 border border-[#58a6ff] text-[#58a6ff] text-lg font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              View API Docs
            </Link>
          </div>
        </div>
      </section>
    
      {/* Footer */}
      <footer className="border-t border-[#2f343c] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">Optima AI</span>
              </Link>
              <p className="mt-2 text-xs text-gray-400">
                by Optima, Inc.
              </p>
              <p className="mt-4 text-gray-400">
                Next-generation AI chat platform for developers and teams.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Integrations</Link></li>
                <li><Link href="/roadmap" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-[#58a6ff] transition-colors">API Reference</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Blog</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Tutorials</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-[#58a6ff] transition-colors">About Optima, Inc.</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Contact</Link></li>
                <li><Link href="/legal" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Legal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#2f343c] flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Optima, Inc. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer></div>
  );
}

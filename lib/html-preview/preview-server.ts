import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';

export class HTMLPreviewServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private port: number;
  private previewContent: string = '';

  constructor(port: number = 3001) {
    this.port = port;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private setupMiddleware() {
    this.app.use(express.static('public'));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes() {
    // Serve the preview HTML
    this.app.get('/preview', (req, res) => {
      const previewHtml = this.generatePreviewHTML();
      res.setHeader('Content-Type', 'text/html');
      res.send(previewHtml);
    });

    // API endpoint to update preview content
    this.app.post('/api/update-preview', (req, res) => {
      const { content } = req.body;
      this.updatePreview(content);
      res.json({ success: true });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Preview client connected:', socket.id);

      // Send current content to newly connected client
      if (this.previewContent) {
        socket.emit('content-update', this.previewContent);
      }

      socket.on('disconnect', () => {
        console.log('Preview client disconnected:', socket.id);
      });
    });
  }

  private generatePreviewHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Preview - Live Reload</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #f5f5f5;
        }
        
        .preview-header {
            background: #2563eb;
            color: white;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        
        .preview-title {
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        
        .status-indicator.disconnected {
            background: #ef4444;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .preview-controls {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        .refresh-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        
        .refresh-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .preview-content {
            margin-top: 60px;
            min-height: calc(100vh - 60px);
            background: white;
        }
        
        .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: calc(100vh - 60px);
            flex-direction: column;
            color: #6b7280;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error-state {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            margin: 20px;
            color: #b91c1c;
        }
        
        .update-notification {
            position: fixed;
            top: 70px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1001;
        }
        
        .update-notification.show {
            transform: translateX(0);
        }
    </style>
</head>
<body>
    <div class="preview-header">
        <div class="preview-title">
            <div class="status-indicator" id="statusIndicator"></div>
            HTML Preview - Live Reload
        </div>
        <div class="preview-controls">
            <span id="lastUpdate">Never updated</span>
            <button class="refresh-btn" onclick="location.reload()">Refresh</button>
        </div>
    </div>
    
    <div class="update-notification" id="updateNotification">
        Content updated successfully!
    </div>
    
    <div class="preview-content" id="previewContent">
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Waiting for content...</p>
            <small>Start creating HTML artifacts to see live preview</small>
        </div>
    </div>

    <script>
        const socket = io();
        const statusIndicator = document.getElementById('statusIndicator');
        const previewContent = document.getElementById('previewContent');
        const lastUpdate = document.getElementById('lastUpdate');
        const updateNotification = document.getElementById('updateNotification');
        
        let isConnected = false;
        
        socket.on('connect', () => {
            console.log('Connected to preview server');
            isConnected = true;
            statusIndicator.classList.remove('disconnected');
            updateLastUpdate('Connected');
        });
        
        socket.on('disconnect', () => {
            console.log('Disconnected from preview server');
            isConnected = false;
            statusIndicator.classList.add('disconnected');
            updateLastUpdate('Disconnected');
        });
        
        socket.on('content-update', (content) => {
            console.log('Received content update');
            updatePreviewContent(content);
            showUpdateNotification();
            updateLastUpdate('Just now');
        });
        
        function updatePreviewContent(content) {
            try {
                // Create a safe iframe approach for complex HTML
                if (content.includes('<script>') || content.includes('<style>')) {
                    const iframe = document.createElement('iframe');
                    iframe.style.width = '100%';
                    iframe.style.height = '100vh';
                    iframe.style.border = 'none';
                    iframe.style.display = 'block';
                    
                    previewContent.innerHTML = '';
                    previewContent.appendChild(iframe);
                    
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(content);
                    iframeDoc.close();
                } else {
                    // Simple HTML can be inserted directly
                    previewContent.innerHTML = content;
                }
            } catch (error) {
                console.error('Error updating preview content:', error);
                previewContent.innerHTML = \`
                    <div class="error-state">
                        <h3>Preview Error</h3>
                        <p>Failed to render the HTML content: \${error.message}</p>
                        <details>
                            <summary>Raw Content</summary>
                            <pre>\${content}</pre>
                        </details>
                    </div>
                \`;
            }
        }
        
        function updateLastUpdate(text) {
            lastUpdate.textContent = text;
        }
        
        function showUpdateNotification() {
            updateNotification.classList.add('show');
            setTimeout(() => {
                updateNotification.classList.remove('show');
            }, 3000);
        }
        
        // Initialize with current content if any
        fetch('/api/current-content')
            .then(response => response.json())
            .then(data => {
                if (data.content) {
                    updatePreviewContent(data.content);
                    updateLastUpdate('Loaded');
                }
            })
            .catch(error => {
                console.log('No initial content available');
            });
    </script>
</body>
</html>`;
  }

  public updatePreview(content: string) {
    this.previewContent = content;
    this.io.emit('content-update', content);
    console.log('Preview content updated, broadcasted to all clients');
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`HTML Preview Server running on http://localhost:${this.port}`);
        console.log(`Preview URL: http://localhost:${this.port}/preview`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('HTML Preview Server stopped');
        resolve();
      });
    });
  }
}

// Export singleton instance
export const htmlPreviewServer = new HTMLPreviewServer();
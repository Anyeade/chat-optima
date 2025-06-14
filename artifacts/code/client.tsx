import { Artifact } from '@/components/create-artifact';
import { CodeEditor } from '@/components/code-editor';
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';
import {
  Console,
  type ConsoleOutput,
  type ConsoleOutputContent,
} from '@/components/console';

// 🚀 10/10 QUALITY ENHANCEMENTS

// Performance & Caching System
interface ExecutionCache {
  [key: string]: {
    result: any;
    timestamp: number;
    executionTime: number;
  };
}

const executionCache: ExecutionCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

// Security & Code Analysis
interface SecurityAnalysis {
  hasRiskyPatterns: boolean;
  warnings: string[];
  complexity: 'low' | 'medium' | 'high';
}

// Performance Monitoring
interface PerformanceMetrics {
  executionTime: number;
  memoryUsage?: number;
  apiResponseTime: number;
  cacheHit: boolean;
}

// Request Queue for Rate Limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval = 100; // Minimum 100ms between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
      }
      
      const request = this.queue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// 🔒 Security Analysis Functions
function analyzeCodeSecurity(code: string, language: string): SecurityAnalysis {
  const warnings: string[] = [];
  let hasRiskyPatterns = false;
  
  // Common risky patterns across languages
  const riskyPatterns = [
    { pattern: /eval\s*\(/gi, warning: 'eval() can execute arbitrary code - security risk' },
    { pattern: /exec\s*\(/gi, warning: 'exec() can execute system commands - security risk' },
    { pattern: /system\s*\(/gi, warning: 'system() calls can be dangerous' },
    { pattern: /shell_exec/gi, warning: 'shell_exec() can execute shell commands' },
    { pattern: /document\.write/gi, warning: 'document.write() can introduce XSS vulnerabilities' },
    { pattern: /innerHTML\s*=/gi, warning: 'innerHTML assignment can introduce XSS vulnerabilities' },
    { pattern: /fetch\s*\(/gi, warning: 'Network requests detected - ensure CORS and data validation' },
    { pattern: /XMLHttpRequest/gi, warning: 'AJAX requests detected - ensure proper error handling' },
  ];

  // Language-specific risky patterns
  if (language === 'python') {
    riskyPatterns.push(
      { pattern: /__import__/gi, warning: 'Dynamic imports can be risky' },
      { pattern: /subprocess/gi, warning: 'subprocess module can execute system commands' },
      { pattern: /os\.system/gi, warning: 'os.system() can execute shell commands' }
    );
  } else if (language === 'javascript') {
    riskyPatterns.push(
      { pattern: /new\s+Function/gi, warning: 'Function constructor can execute arbitrary code' },
      { pattern: /setTimeout\s*\(\s*["\'][^"\']*["\'].*\)/gi, warning: 'setTimeout with string can execute code' }
    );
  }

  riskyPatterns.forEach(({ pattern, warning }) => {
    if (pattern.test(code)) {
      warnings.push(warning);
      hasRiskyPatterns = true;
    }
  });

  // Code complexity analysis
  const lines = code.split('\n').filter(line => line.trim().length > 0);
  const complexity = lines.length > 100 ? 'high' : lines.length > 50 ? 'medium' : 'low';

  return { hasRiskyPatterns, warnings, complexity };
}

// 🧠 Enhanced Caching System
function getCacheKey(code: string, language: string): string {
  return `${language}_${btoa(code).slice(0, 50)}`;
}

function getCachedResult(cacheKey: string): any | null {
  const cached = executionCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached;
  }
  return null;
}

function setCacheResult(cacheKey: string, result: any, executionTime: number): void {
  // Clean old cache entries if we're at max size
  const cacheKeys = Object.keys(executionCache);
  if (cacheKeys.length >= MAX_CACHE_SIZE) {
    const oldestKey = cacheKeys.reduce((oldest, key) => 
      executionCache[key].timestamp < executionCache[oldest].timestamp ? key : oldest
    );
    delete executionCache[oldestKey];
  }

  executionCache[cacheKey] = {
    result,
    timestamp: Date.now(),
    executionTime
  };
}

// ⚡ Enhanced API Request with Retry Logic
async function makeApiRequest(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      // Increased timeout to 2 minutes for long-running AI operations
      const timeoutId = setTimeout(() => controller.abort(), 120000); 
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      if (attempt < retries && !error.name?.includes('AbortError')) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw lastError;
    }
  }
  
  throw lastError!;
}

// 📊 Performance Monitoring
function startPerformanceTimer(): { stop: () => number } {
  const start = performance.now();
  return {
    stop: () => performance.now() - start
  };
}

// 🎯 Code Validation
function validateCode(code: string, language: string): { isValid: boolean; suggestions: string[] } {
  const suggestions: string[] = [];
  const isValid = true;

  // Basic validation
  if (code.trim().length === 0) {
    return { isValid: false, suggestions: ['Code cannot be empty'] };
  }

  // Language-specific validation
  switch (language) {
    case 'python':
      if (!code.includes('print') && !code.includes('plt.') && !code.includes('return')) {
        suggestions.push('Consider adding print statements to see output');
      }
      break;
    case 'java':
      if (!code.includes('public class')) {
        suggestions.push('Java code should contain a public class');
      }
      if (!code.includes('public static void main')) {
        suggestions.push('Add a main method: public static void main(String[] args)');
      }
      break;
    case 'cpp':
      if (!code.includes('#include')) {
        suggestions.push('Consider adding necessary #include statements');
      }
      if (!code.includes('int main')) {
        suggestions.push('Add a main function: int main()');
      }
      break;
    case 'javascript':
      if (!code.includes('console.') && !code.includes('return') && !code.includes('document.')) {
        suggestions.push('Consider adding console.log() to see output');
      }
      break;
  }

  return { isValid, suggestions };
}

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  basic: `
    # Basic output capture setup
  `,
};

// 🚀 Enhanced JavaScript execution handler with 10/10 features
async function executeJavaScript(
  code: string, 
  outputContent: Array<ConsoleOutputContent>,
  onProgress?: (message: string) => void
): Promise<PerformanceMetrics> {
  const timer = startPerformanceTimer();
  const cacheKey = getCacheKey(code, 'javascript');
  
  // Check cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    outputContent.push({
      type: 'text',
      value: '⚡ Using cached result'
    });
    
    outputContent.push({
      type: 'text',
      value: cached.result.output || 'No output'
    });
    
    outputContent.push({
      type: 'text',
      value: `\n✓ JavaScript executed successfully (${cached.executionTime}ms, cached)`
    });
    
    return {
      executionTime: cached.executionTime,
      apiResponseTime: 0,
      cacheHit: true
    };
  }

  onProgress?.('Analyzing code security...');
  
  // Security analysis
  const security = analyzeCodeSecurity(code, 'javascript');
  if (security.hasRiskyPatterns) {
    outputContent.push({
      type: 'text',
      value: `🔒 Security Warning: ${security.warnings.join(', ')}`
    });
  }

  // Code validation
  const validation = validateCode(code, 'javascript');
  if (validation.suggestions.length > 0) {
    outputContent.push({
      type: 'text',
      value: `💡 Suggestions: ${validation.suggestions.join(', ')}`
    });
  }

  onProgress?.('Executing JavaScript code...');

  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };

  // Enhanced console capture with performance tracking
  const capturedLogs: Array<{type: string, args: any[], timestamp: number}> = [];
  const executionStart = performance.now();
  
  console.log = (...args) => {
    capturedLogs.push({type: 'log', args, timestamp: performance.now() - executionStart});
    originalConsole.log(...args);
  };
  
  console.error = (...args) => {
    capturedLogs.push({type: 'error', args, timestamp: performance.now() - executionStart});
    originalConsole.error(...args);
  };
  
  console.warn = (...args) => {
    capturedLogs.push({type: 'warn', args, timestamp: performance.now() - executionStart});
    originalConsole.warn(...args);
  };
  
  console.info = (...args) => {
    capturedLogs.push({type: 'info', args, timestamp: performance.now() - executionStart});
    originalConsole.info(...args);
  };

  try {
    // Memory usage tracking (if available)
    const memoryBefore = (performance as any).memory?.usedJSHeapSize;
    
    // Execute the JavaScript code with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout (30s)')), 30000);
    });
    
    const executionPromise = (async () => {
      const func = new Function(code);
      return await func();
    })();
    
    await Promise.race([executionPromise, timeoutPromise]);
    
    const memoryAfter = (performance as any).memory?.usedJSHeapSize;
    const memoryUsage = memoryAfter && memoryBefore ? memoryAfter - memoryBefore : undefined;
    
    // Process captured logs with timestamps
    if (capturedLogs.length === 0) {
      outputContent.push({
        type: 'text',
        value: 'Code executed successfully (no console output)'
      });
    } else {
      capturedLogs.forEach(log => {
        const message = log.args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        const icon = log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : log.type === 'info' ? 'ℹ️' : '📝';
        outputContent.push({
          type: 'text',
          value: `${icon} [${log.timestamp.toFixed(1)}ms] ${message}`
        });
      });
    }
    
    const executionTime = timer.stop();
    
    outputContent.push({
      type: 'text',
      value: `\n✅ JavaScript executed successfully (${executionTime.toFixed(1)}ms${memoryUsage ? `, ${(memoryUsage/1024).toFixed(1)}KB memory` : ''})`
    });

    // Cache the result
    const result = { output: capturedLogs.map(l => l.args.join(' ')).join('\n') };
    setCacheResult(cacheKey, result, executionTime);
    
    return {
      executionTime,
      memoryUsage,
      apiResponseTime: 0,
      cacheHit: false
    };
    
  } catch (error: any) {
    const executionTime = timer.stop();
    
    // Enhanced error categorization
    let errorCategory = 'Runtime Error';
    let helpfulTip = 'Check for syntax errors, undefined variables, or type issues.';
    
    if (error.name === 'SyntaxError') {
      errorCategory = 'Syntax Error';
      helpfulTip = 'Check your JavaScript syntax, missing brackets, or semicolons.';
    } else if (error.name === 'ReferenceError') {
      errorCategory = 'Reference Error';
      helpfulTip = 'Check for undefined variables or functions.';
    } else if (error.name === 'TypeError') {
      errorCategory = 'Type Error';
      helpfulTip = 'Check data types and method calls.';
    } else if (error.message.includes('timeout')) {
      errorCategory = 'Timeout Error';
      helpfulTip = 'Code took too long to execute. Consider optimizing or reducing complexity.';
    }
    
    outputContent.push({
      type: 'text',
      value: `❌ JavaScript ${errorCategory} (Native execution):\n${error.message}\n\n💡 Tip: ${helpfulTip}\n\n🔧 Execution time: ${executionTime.toFixed(1)}ms`
    });
    
    return {
      executionTime,
      apiResponseTime: 0,
      cacheHit: false
    };
  } finally {
    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }
}

// 🚀 Enhanced Java execution handler with 10/10 features
async function executeJava(
  code: string,
  outputContent: Array<ConsoleOutputContent>,
  onProgress?: (message: string) => void
): Promise<PerformanceMetrics> {
  const timer = startPerformanceTimer();
  const cacheKey = getCacheKey(code, 'java');
  
  // Check cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    outputContent.push({
      type: 'text',
      value: '⚡ Using cached result'
    });
    
    if (cached.result.stdout) {
      outputContent.push({
        type: 'text',
        value: cached.result.stdout
      });
    }
    
    outputContent.push({
      type: 'text',
      value: `\n✅ Java executed successfully (${cached.executionTime}ms, cached)`
    });
    
    return {
      executionTime: cached.executionTime,
      apiResponseTime: 0,
      cacheHit: true
    };
  }

  onProgress?.('Analyzing Java code security...');
  
  // Security analysis
  const security = analyzeCodeSecurity(code, 'java');
  if (security.hasRiskyPatterns) {
    outputContent.push({
      type: 'text',
      value: `🔒 Security Warning: ${security.warnings.join(', ')}`
    });
  }

  // Code validation
  const validation = validateCode(code, 'java');
  if (validation.suggestions.length > 0) {
    outputContent.push({
      type: 'text',
      value: `💡 Suggestions: ${validation.suggestions.join(', ')}`
    });
  }

  onProgress?.('Compiling and executing Java code via OneCompiler...');

  try {
    const apiStartTime = performance.now();
    
    // Use request queue for rate limiting
    const response = await requestQueue.add(() => 
      makeApiRequest('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
          'x-rapidapi-key': process.env.NEXT_PUBLIC_JUDGE0_API_KEY || 'e3bf149b39msh6db766854071669p1ef2d2jsn0cb217c9a1be'
        },
        body: JSON.stringify({
          language: 'java',
          stdin: '',
          files: [
            {
              name: 'Main.java',
              content: code
            }
          ]
        })
      })
    );

    const apiResponseTime = performance.now() - apiStartTime;
    const result = await response.json();

    onProgress?.('Processing execution results...');

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      } else {
        outputContent.push({
          type: 'text',
          value: '(No output produced)'
        });
      }
      
      const totalTime = timer.stop();
      outputContent.push({
        type: 'text',
        value: `\n✅ Java executed successfully (${totalTime.toFixed(1)}ms total, ${apiResponseTime.toFixed(1)}ms API, ${result.executionTime || 'N/A'}ms execution)`
      });

      // Cache successful result
      setCacheResult(cacheKey, result, totalTime);
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    } else {
      const totalTime = timer.stop();
      
      // Enhanced error categorization for Java
      let errorType = 'Compilation/Runtime Error';
      let specificTip = 'Check for syntax errors, missing imports, or incorrect class names.';
      
      if (result.exception) {
        if (result.exception.includes('cannot find symbol')) {
          errorType = 'Compilation Error (Symbol Not Found)';
          specificTip = 'Check variable names, method names, and import statements.';
        } else if (result.exception.includes('class') && result.exception.includes('public')) {
          errorType = 'Compilation Error (Class Declaration)';
          specificTip = 'Ensure your public class name matches the filename (Main.java).';
        } else if (result.exception.includes('NullPointerException')) {
          errorType = 'Runtime Error (Null Pointer)';
          specificTip = 'Check for null values before using objects or calling methods.';
        } else if (result.exception.includes('ArrayIndexOutOfBounds')) {
          errorType = 'Runtime Error (Array Index)';
          specificTip = 'Check array bounds and loop conditions.';
        }
        
        outputContent.push({
          type: 'text',
          value: `❌ Java ${errorType} (OneCompiler):\n${result.exception}\n\n💡 Tip: ${specificTip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `❌ Java Error (OneCompiler):\n${result.stderr}\n\n💡 Tip: Ensure your code follows Java syntax and naming conventions.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `❌ Java execution failed via OneCompiler API\n\n💡 Tip: Verify your code syntax and try again.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      }
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    }

  } catch (error: any) {
    const totalTime = timer.stop();
    
    let errorMessage = `OneCompiler API Error: ${error.message}`;
    let tip = 'Check your internet connection and try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout (30s)';
      tip = 'The request took too long. Try simplifying your code or check your connection.';
    } else if (error.message.includes('429')) {
      tip = 'Rate limit exceeded. Please wait a moment before trying again.';
    } else if (error.message.includes('403')) {
      tip = 'API authentication failed. Check your API key configuration.';
    }
    
    outputContent.push({
      type: 'text',
      value: `❌ ${errorMessage}\n\n💡 Tip: ${tip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
    });
    
    return {
      executionTime: totalTime,
      apiResponseTime: 0,
      cacheHit: false
    };
  }
}

// 🚀 Enhanced C++ execution handler with 10/10 features
async function executeCpp(
  code: string,
  outputContent: Array<ConsoleOutputContent>,
  onProgress?: (message: string) => void
): Promise<PerformanceMetrics> {
  const timer = startPerformanceTimer();
  const cacheKey = getCacheKey(code, 'cpp');
  
  // Check cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    outputContent.push({
      type: 'text',
      value: '⚡ Using cached result'
    });
    
    if (cached.result.stdout) {
      outputContent.push({
        type: 'text',
        value: cached.result.stdout
      });
    }
    
    outputContent.push({
      type: 'text',
      value: `\n✅ C++ executed successfully (${cached.executionTime}ms, cached)`
    });
    
    return {
      executionTime: cached.executionTime,
      apiResponseTime: 0,
      cacheHit: true
    };
  }

  onProgress?.('Analyzing C++ code security...');
  
  // Security analysis
  const security = analyzeCodeSecurity(code, 'cpp');
  if (security.hasRiskyPatterns) {
    outputContent.push({
      type: 'text',
      value: `🔒 Security Warning: ${security.warnings.join(', ')}`
    });
  }

  // Code validation
  const validation = validateCode(code, 'cpp');
  if (validation.suggestions.length > 0) {
    outputContent.push({
      type: 'text',
      value: `💡 Suggestions: ${validation.suggestions.join(', ')}`
    });
  }

  onProgress?.('Compiling and executing C++ code via OneCompiler...');

  try {
    const apiStartTime = performance.now();
    
    // Use request queue for rate limiting
    const response = await requestQueue.add(() => 
      makeApiRequest('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
          'x-rapidapi-key': process.env.NEXT_PUBLIC_JUDGE0_API_KEY || 'e3bf149b39msh6db766854071669p1ef2d2jsn0cb217c9a1be'
        },
        body: JSON.stringify({
          language: 'cpp',
          stdin: '',
          files: [
            {
              name: 'main.cpp',
              content: code
            }
          ]
        })
      })
    );

    const apiResponseTime = performance.now() - apiStartTime;
    const result = await response.json();

    onProgress?.('Processing execution results...');

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      } else {
        outputContent.push({
          type: 'text',
          value: '(No output produced)'
        });
      }
      
      const totalTime = timer.stop();
      outputContent.push({
        type: 'text',
        value: `\n✅ C++ executed successfully (${totalTime.toFixed(1)}ms total, ${apiResponseTime.toFixed(1)}ms API, ${result.executionTime || 'N/A'}ms execution)`
      });

      // Cache successful result
      setCacheResult(cacheKey, result, totalTime);
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    } else {
      const totalTime = timer.stop();
      
      // Enhanced error categorization for C++
      let errorType = 'Compilation/Runtime Error';
      let specificTip = 'Check for missing headers, syntax errors, or undefined variables.';
      
      if (result.exception) {
        if (result.exception.includes('undeclared')) {
          errorType = 'Compilation Error (Undeclared Identifier)';
          specificTip = 'Check variable/function names and ensure they are declared before use.';
        } else if (result.exception.includes('iostream') || result.exception.includes('include')) {
          errorType = 'Compilation Error (Missing Include)';
          specificTip = 'Add #include <iostream> for cout/cin or other necessary headers.';
        } else if (result.exception.includes('main')) {
          errorType = 'Compilation Error (Main Function)';
          specificTip = 'Ensure you have int main() function defined.';
        } else if (result.exception.includes('segmentation fault')) {
          errorType = 'Runtime Error (Segmentation Fault)';
          specificTip = 'Check for array bounds, null pointers, or memory access issues.';
        }
        
        outputContent.push({
          type: 'text',
          value: `❌ C++ ${errorType} (OneCompiler):\n${result.exception}\n\n💡 Tip: ${specificTip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `❌ C++ Error (OneCompiler):\n${result.stderr}\n\n💡 Tip: Ensure you have the correct #include statements and main() function.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `❌ C++ execution failed via OneCompiler API\n\n💡 Tip: Verify your code syntax and try again.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      }
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    }

  } catch (error: any) {
    const totalTime = timer.stop();
    
    let errorMessage = `OneCompiler API Error: ${error.message}`;
    let tip = 'Check your internet connection and try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout (30s)';
      tip = 'The request took too long. Try simplifying your code or check your connection.';
    } else if (error.message.includes('429')) {
      tip = 'Rate limit exceeded. Please wait a moment before trying again.';
    }
    
    outputContent.push({
      type: 'text',
      value: `❌ ${errorMessage}\n\n💡 Tip: ${tip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
    });
    
    return {
      executionTime: totalTime,
      apiResponseTime: 0,
      cacheHit: false
    };
  }
}

// 🚀 Enhanced C# execution handler with 10/10 features
async function executeCSharp(
  code: string,
  outputContent: Array<ConsoleOutputContent>,
  onProgress?: (message: string) => void
): Promise<PerformanceMetrics> {
  const timer = startPerformanceTimer();
  const cacheKey = getCacheKey(code, 'csharp');
  
  // Check cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    outputContent.push({
      type: 'text',
      value: '⚡ Using cached result'
    });
    
    if (cached.result.stdout) {
      outputContent.push({
        type: 'text',
        value: cached.result.stdout
      });
    }
    
    outputContent.push({
      type: 'text',
      value: `\n✅ C# executed successfully (${cached.executionTime}ms, cached)`
    });
    
    return {
      executionTime: cached.executionTime,
      apiResponseTime: 0,
      cacheHit: true
    };
  }

  onProgress?.('Analyzing C# code security...');
  
  // Security analysis
  const security = analyzeCodeSecurity(code, 'csharp');
  if (security.hasRiskyPatterns) {
    outputContent.push({
      type: 'text',
      value: `🔒 Security Warning: ${security.warnings.join(', ')}`
    });
  }

  // Code validation
  const validation = validateCode(code, 'csharp');
  if (validation.suggestions.length > 0) {
    outputContent.push({
      type: 'text',
      value: `💡 Suggestions: ${validation.suggestions.join(', ')}`
    });
  }

  onProgress?.('Compiling and executing C# code via OneCompiler...');

  try {
    const apiStartTime = performance.now();
    
    // Use request queue for rate limiting
    const response = await requestQueue.add(() => 
      makeApiRequest('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
          'x-rapidapi-key': process.env.NEXT_PUBLIC_JUDGE0_API_KEY || 'e3bf149b39msh6db766854071669p1ef2d2jsn0cb217c9a1be'
        },
        body: JSON.stringify({
          language: 'csharp',
          stdin: '',
          files: [
            {
              name: 'Program.cs',
              content: code
            }
          ]
        })
      })
    );

    const apiResponseTime = performance.now() - apiStartTime;
    const result = await response.json();

    onProgress?.('Processing execution results...');

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      } else {
        outputContent.push({
          type: 'text',
          value: '(No output produced)'
        });
      }
      
      const totalTime = timer.stop();
      outputContent.push({
        type: 'text',
        value: `\n✅ C# executed successfully (${totalTime.toFixed(1)}ms total, ${apiResponseTime.toFixed(1)}ms API, ${result.executionTime || 'N/A'}ms execution)`
      });

      // Cache successful result
      setCacheResult(cacheKey, result, totalTime);
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    } else {
      const totalTime = timer.stop();
      
      // Enhanced error categorization for C#
      let errorType = 'Compilation/Runtime Error';
      let specificTip = 'Check for missing using statements, syntax errors, or incorrect method signatures.';
      
      if (result.exception) {
        if (result.exception.includes('not exist in the current context')) {
          errorType = 'Compilation Error (Name Not Found)';
          specificTip = 'Check variable/method names and ensure using statements are included.';
        } else if (result.exception.includes('namespace')) {
          errorType = 'Compilation Error (Namespace)';
          specificTip = 'Ensure proper using statements, especially "using System;".';
        } else if (result.exception.includes('Main')) {
          errorType = 'Compilation Error (Entry Point)';
          specificTip = 'Ensure you have a proper Main method: static void Main(string[] args).';
        } else if (result.exception.includes('NullReferenceException')) {
          errorType = 'Runtime Error (Null Reference)';
          specificTip = 'Check for null values before accessing object members.';
        }
        
        outputContent.push({
          type: 'text',
          value: `❌ C# ${errorType} (OneCompiler):\n${result.exception}\n\n💡 Tip: ${specificTip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `❌ C# Error (OneCompiler):\n${result.stderr}\n\n💡 Tip: Ensure proper namespace, class structure, and Main method definition.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `❌ C# execution failed via OneCompiler API\n\n💡 Tip: Verify your code syntax and try again.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      }
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    }

  } catch (error: any) {
    const totalTime = timer.stop();
    
    let errorMessage = `OneCompiler API Error: ${error.message}`;
    let tip = 'Check your internet connection and try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout (30s)';
      tip = 'The request took too long. Try simplifying your code or check your connection.';
    } else if (error.message.includes('429')) {
      tip = 'Rate limit exceeded. Please wait a moment before trying again.';
    }
    
    outputContent.push({
      type: 'text',
      value: `❌ ${errorMessage}\n\n💡 Tip: ${tip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
    });
    
    return {
      executionTime: totalTime,
      apiResponseTime: 0,
      cacheHit: false
    };
  }
}

// 🚀 Enhanced PHP execution handler with 10/10 features
async function executePHP(
  code: string,
  outputContent: Array<ConsoleOutputContent>,
  onProgress?: (message: string) => void
): Promise<PerformanceMetrics> {
  const timer = startPerformanceTimer();
  const cacheKey = getCacheKey(code, 'php');
  
  // Check cache first
  const cached = getCachedResult(cacheKey);
  if (cached) {
    outputContent.push({
      type: 'text',
      value: '⚡ Using cached result'
    });
    
    if (cached.result.stdout) {
      outputContent.push({
        type: 'text',
        value: cached.result.stdout
      });
    }
    
    outputContent.push({
      type: 'text',
      value: `\n✅ PHP executed successfully (${cached.executionTime}ms, cached)`
    });
    
    return {
      executionTime: cached.executionTime,
      apiResponseTime: 0,
      cacheHit: true
    };
  }

  onProgress?.('Analyzing PHP code security...');
  
  // Security analysis
  const security = analyzeCodeSecurity(code, 'php');
  if (security.hasRiskyPatterns) {
    outputContent.push({
      type: 'text',
      value: `🔒 Security Warning: ${security.warnings.join(', ')}`
    });
  }

  // Code validation
  const validation = validateCode(code, 'php');
  if (validation.suggestions.length > 0) {
    outputContent.push({
      type: 'text',
      value: `💡 Suggestions: ${validation.suggestions.join(', ')}`
    });
  }

  onProgress?.('Executing PHP code via OneCompiler...');

  try {
    const apiStartTime = performance.now();
    
    // Use request queue for rate limiting
    const response = await requestQueue.add(() => 
      makeApiRequest('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
          'x-rapidapi-key': process.env.NEXT_PUBLIC_JUDGE0_API_KEY || 'e3bf149b39msh6db766854071669p1ef2d2jsn0cb217c9a1be'
        },
        body: JSON.stringify({
          language: 'php',
          stdin: '',
          files: [
            {
              name: 'index.php',
              content: code
            }
          ]
        })
      })
    );

    const apiResponseTime = performance.now() - apiStartTime;
    const result = await response.json();

    onProgress?.('Processing execution results...');

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      } else {
        outputContent.push({
          type: 'text',
          value: '(No output produced)'
        });
      }
      
      const totalTime = timer.stop();
      outputContent.push({
        type: 'text',
        value: `\n✅ PHP executed successfully (${totalTime.toFixed(1)}ms total, ${apiResponseTime.toFixed(1)}ms API, ${result.executionTime || 'N/A'}ms execution)`
      });

      // Cache successful result
      setCacheResult(cacheKey, result, totalTime);
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    } else {
      const totalTime = timer.stop();
      
      // Enhanced error categorization for PHP
      let errorType = 'Runtime Error';
      let specificTip = 'Check for syntax errors, undefined variables, or missing semicolons.';
      
      if (result.exception) {
        if (result.exception.includes('Parse error')) {
          errorType = 'Parse Error (Syntax)';
          specificTip = 'Check for missing semicolons, brackets, or quotes.';
        } else if (result.exception.includes('undefined variable')) {
          errorType = 'Runtime Error (Undefined Variable)';
          specificTip = 'Ensure variables are defined before use (e.g., $variable = value;).';
        } else if (result.exception.includes('undefined function')) {
          errorType = 'Runtime Error (Undefined Function)';
          specificTip = 'Check function names and ensure they exist or are included.';
        } else if (result.exception.includes('syntax error')) {
          errorType = 'Syntax Error';
          specificTip = 'Check PHP syntax, especially brackets, semicolons, and quotes.';
        }
        
        outputContent.push({
          type: 'text',
          value: `❌ PHP ${errorType} (OneCompiler):\n${result.exception}\n\n💡 Tip: ${specificTip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `❌ PHP Error (OneCompiler):\n${result.stderr}\n\n💡 Tip: Ensure proper PHP syntax and that variables are defined before use.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `❌ PHP execution failed via OneCompiler API\n\n💡 Tip: Verify your code syntax and try again.\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
        });
      }
      
      return {
        executionTime: totalTime,
        apiResponseTime,
        cacheHit: false
      };
    }

  } catch (error: any) {
    const totalTime = timer.stop();
    
    let errorMessage = `OneCompiler API Error: ${error.message}`;
    let tip = 'Check your internet connection and try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout (30s)';
      tip = 'The request took too long. Try simplifying your code or check your connection.';
    } else if (error.message.includes('429')) {
      tip = 'Rate limit exceeded. Please wait a moment before trying again.';
    }
    
    outputContent.push({
      type: 'text',
      value: `❌ ${errorMessage}\n\n💡 Tip: ${tip}\n\n🔧 Execution time: ${totalTime.toFixed(1)}ms`
    });
    
    return {
      executionTime: totalTime,
      apiResponseTime: 0,
      cacheHit: false
    };
  }
}

// Language detection utility
function detectLanguage(code: string): string {
  const trimmedCode = code.trim();
  const lowerCode = trimmedCode.toLowerCase();
  
  // Score-based detection for better accuracy
  const scores = {
    python: 0,
    javascript: 0,
    java: 0,
    cpp: 0,
    csharp: 0,
    php: 0
  };

  // Python patterns
  if (lowerCode.includes('def ')) scores.python += 3;
  if (lowerCode.includes('import ')) scores.python += 2;
  if (lowerCode.includes('print(')) scores.python += 2;
  if (lowerCode.includes('if __name__')) scores.python += 4;
  if (/^\s*#.*$/m.test(code)) scores.python += 1;
  if (lowerCode.includes('elif ')) scores.python += 2;
  if (lowerCode.includes('self.')) scores.python += 2;
  if (/^\s{4,}/.test(code)) scores.python += 1; // Indentation
  
  // JavaScript patterns
  if (lowerCode.includes('function ')) scores.javascript += 3;
  if (lowerCode.includes('console.log')) scores.javascript += 3;
  if (lowerCode.includes('const ')) scores.javascript += 2;
  if (lowerCode.includes('let ')) scores.javascript += 2;
  if (lowerCode.includes('var ')) scores.javascript += 1;
  if (lowerCode.includes('=>')) scores.javascript += 2;
  if (/\/\/.*$/m.test(code)) scores.javascript += 1;
  if (lowerCode.includes('document.')) scores.javascript += 2;
  if (lowerCode.includes('window.')) scores.javascript += 2;
  
  // Java patterns
  if (lowerCode.includes('public class')) scores.java += 4;
  if (lowerCode.includes('public static void main')) scores.java += 4;
  if (lowerCode.includes('system.out.println')) scores.java += 3;
  if (lowerCode.includes('import java')) scores.java += 3;
  if (lowerCode.includes('extends ')) scores.java += 2;
  if (lowerCode.includes('implements ')) scores.java += 2;
  if (lowerCode.includes('private ')) scores.java += 1;
  if (lowerCode.includes('protected ')) scores.java += 1;
  
  // C++ patterns
  if (lowerCode.includes('#include')) scores.cpp += 3;
  if (lowerCode.includes('using namespace std')) scores.cpp += 4;
  if (lowerCode.includes('int main()')) scores.cpp += 4;
  if (lowerCode.includes('cout')) scores.cpp += 3;
  if (lowerCode.includes('cin')) scores.cpp += 2;
  if (lowerCode.includes('endl')) scores.cpp += 2;
  if (lowerCode.includes('std::')) scores.cpp += 2;
  if (lowerCode.includes('#define')) scores.cpp += 1;
  
  // C# patterns
  if (lowerCode.includes('using system')) scores.csharp += 3;
  if (lowerCode.includes('console.writeline')) scores.csharp += 4;
  if (lowerCode.includes('namespace ')) scores.csharp += 3;
  if (lowerCode.includes('static void main')) scores.csharp += 3;
  if (lowerCode.includes('public static void main')) scores.csharp += 4;
  if (lowerCode.includes('string[] args')) scores.csharp += 2;
  if (lowerCode.includes('console.readline')) scores.csharp += 2;
  
  // PHP patterns
  if (lowerCode.includes('<?php')) scores.php += 4;
  if (lowerCode.includes('echo ')) scores.php += 3;
  if (lowerCode.includes('$')) scores.php += 2;
  if (lowerCode.includes('function ') && lowerCode.includes('$')) scores.php += 2;
  if (lowerCode.includes('array(')) scores.php += 2;
  if (lowerCode.includes('->')) scores.php += 2;
  if (lowerCode.includes('<?=')) scores.php += 3;
  if (lowerCode.includes('?>')) scores.php += 2;
  
  // Find language with highest score
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    return 'python'; // Default fallback
  }
  
  const detectedLanguage = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  return detectedLanguage || 'python';
}

// Supported languages for execution
const EXECUTABLE_LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'csharp', 'php'];

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ['basic'];

  if (code.includes('matplotlib') || code.includes('plt.')) {
    handlers.push('matplotlib');
  }

  return handlers;
}

interface Metadata {
  outputs: Array<ConsoleOutput>;
}

export const codeArtifact = new Artifact<'code', Metadata>({
  kind: 'code',
  description:
    'Advanced code editor with real-time execution. Supports 6 languages: Python (Pyodide), JavaScript (native), Java/C++/C#/PHP (OneCompiler API). Features syntax highlighting, error detection, and live console output.',
  initialize: async ({ setMetadata }) => {
    setMetadata({
      outputs: [],
    });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'code-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible:
          draftArtifact.status === 'streaming' &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 310
            ? true
            : draftArtifact.isVisible,
        status: 'streaming',
      }));
    }
  },
  content: ({ metadata, setMetadata, content, ...props }) => {
    const detectedLanguage = detectLanguage(content);
    const languageDisplay = {
      python: 'Python',
      javascript: 'JavaScript', 
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      php: 'PHP'
    }[detectedLanguage] || 'Unknown';

    const getExecutionMethod = (lang: string) => {
      switch(lang) {
        case 'python': return 'Pyodide';
        case 'javascript': return 'Native';
        case 'java':
        case 'cpp':
        case 'csharp':
        case 'php': return 'OneCompiler';
        default: return 'None';
      }
    };

    const executionMethod = getExecutionMethod(detectedLanguage);
    const isExecutable = EXECUTABLE_LANGUAGES.includes(detectedLanguage);

    return (
      <>
        <div className="px-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="text-xs text-muted-foreground">
              Detected language: <span className="font-medium text-foreground">{languageDisplay}</span>
              {isExecutable && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Executable via {executionMethod}
                </span>
              )}
              {!isExecutable && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  View Only
                </span>
              )}
            </div>
          </div>
          <CodeEditor {...props} content={content} />
        </div>

        {metadata?.outputs && (
          <Console
            consoleOutputs={metadata.outputs}
            setConsoleOutputs={() => {
              setMetadata({
                ...metadata,
                outputs: [],
              });
            }}
          />
        )}
      </>
    );
  },
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: 'Run',
      description: 'Execute code with real-time output (Python, JavaScript, Java, C++, C#, PHP)',
      onClick: async ({ content, setMetadata }) => {
        const detectedLanguage = detectLanguage(content);
        
        if (!EXECUTABLE_LANGUAGES.includes(detectedLanguage)) {
          toast.error(`Real-time execution not available for ${detectedLanguage}. Supported: Python (Pyodide), JavaScript (Native), Java/C++/C#/PHP (OneCompiler)`);
          return;
        }

        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs,
            {
              id: runId,
              contents: [],
              status: 'in_progress',
            },
          ],
        }));

        try {
          if (detectedLanguage === 'javascript') {
            await executeJavaScript(content, outputContent);
          } else if (detectedLanguage === 'java') {
            await executeJava(content, outputContent);
          } else if (detectedLanguage === 'cpp') {
            await executeCpp(content, outputContent);
          } else if (detectedLanguage === 'csharp') {
            await executeCSharp(content, outputContent);
          } else if (detectedLanguage === 'php') {
            await executePHP(content, outputContent);
          } else if (detectedLanguage === 'python') {
            // @ts-expect-error - loadPyodide is not defined
            const currentPyodideInstance = await globalThis.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
            });

            currentPyodideInstance.setStdout({
              batched: (output: string) => {
                outputContent.push({
                  type: output.startsWith('data:image/png;base64')
                    ? 'image'
                    : 'text',
                  value: output,
                });
              },
            });

            await currentPyodideInstance.loadPackagesFromImports(content, {
              messageCallback: (message: string) => {
                setMetadata((metadata) => ({
                  ...metadata,
                  outputs: [
                    ...metadata.outputs.filter((output) => output.id !== runId),
                    {
                      id: runId,
                      contents: [{ type: 'text', value: message }],
                      status: 'loading_packages',
                    },
                  ],
                }));
              },
            });

            const requiredHandlers = detectRequiredHandlers(content);
            for (const handler of requiredHandlers) {
              if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
                await currentPyodideInstance.runPythonAsync(
                  OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS],
                );

                if (handler === 'matplotlib') {
                  await currentPyodideInstance.runPythonAsync(
                    'setup_matplotlib_output()',
                  );
                }
              }
            }

            await currentPyodideInstance.runPythonAsync(content);
          } else {
            // Fallback for unsupported languages
            outputContent.push({
              type: 'text',
              value: `Execution not supported for ${detectedLanguage}.\n\nSupported languages:\n• Python (Pyodide)\n• JavaScript (Native)\n• Java, C++, C#, PHP (OneCompiler API)\n\n💡 Tip: Check your code syntax or use a supported language.`
            });
          }

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: 'completed',
              },
            ],
          }));
        } catch (error: any) {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [{ 
                  type: 'text', 
                  value: `Execution Error:\n${error.message}\n\n💡 Tip: Check the console for detailed error information and verify your code syntax.`
                }],
                status: 'failed',
              },
            ],
          }));
        }
      },
      isDisabled: ({ content }) => {
        const detectedLanguage = detectLanguage(content);
        return !EXECUTABLE_LANGUAGES.includes(detectedLanguage);
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy code to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: 'Add explanatory comments',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add detailed comments explaining how this code works, including the logic behind each step',
        });
      },
    },
    {
      icon: <LogsIcon />,
      description: 'Add debug logging',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add console/print statements to help debug and trace the execution flow of this code',
        });
      },
    },
  ],
});

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

// JavaScript execution handler
async function executeJavaScript(
  code: string, 
  outputContent: Array<ConsoleOutputContent>
): Promise<void> {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };

  // Capture console output
  const capturedLogs: Array<{type: string, args: any[]}> = [];
  
  console.log = (...args) => {
    capturedLogs.push({type: 'log', args});
    originalConsole.log(...args);
  };
  
  console.error = (...args) => {
    capturedLogs.push({type: 'error', args});
    originalConsole.error(...args);
  };
  
  console.warn = (...args) => {
    capturedLogs.push({type: 'warn', args});
    originalConsole.warn(...args);
  };
  
  console.info = (...args) => {
    capturedLogs.push({type: 'info', args});
    originalConsole.info(...args);
  };

  try {
    // Execute the JavaScript code
    const func = new Function(code);
    await func();
    
    // Process captured logs
    capturedLogs.forEach(log => {
      const message = log.args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      outputContent.push({
        type: 'text',
        value: `[${log.type}] ${message}`
      });
    });
    
  } catch (error: any) {
    outputContent.push({
      type: 'text',
      value: `Error: ${error.message}`
    });
  } finally {
    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }
}

// Java execution handler (using OneCompiler API)
async function executeJava(
  code: string,
  outputContent: Array<ConsoleOutputContent>
): Promise<void> {
  try {
    outputContent.push({
      type: 'text',
      value: 'Compiling and executing Java code...'
    });

    // Submit code to OneCompiler API via RapidAPI
    const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
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
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      }
      outputContent.push({
        type: 'text',
        value: `\n✓ Java code executed successfully (${result.executionTime}ms)`
      });
    } else {
      // Handle compilation or runtime errors
      if (result.exception) {
        outputContent.push({
          type: 'text',
          value: `Compilation/Runtime Error:\n${result.exception}`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `Error:\n${result.stderr}`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `Error: Code execution failed`
        });
      }
    }

  } catch (error: any) {
    outputContent.push({
      type: 'text',
      value: `API Error: ${error.message}`
    });
  }
}

// C++ execution handler (using OneCompiler API)
async function executeCpp(
  code: string,
  outputContent: Array<ConsoleOutputContent>
): Promise<void> {
  try {
    outputContent.push({
      type: 'text',
      value: 'Compiling and executing C++ code...'
    });

    // Submit code to OneCompiler API via RapidAPI
    const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
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
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      }
      outputContent.push({
        type: 'text',
        value: `\n✓ C++ code executed successfully (${result.executionTime}ms)`
      });
    } else {
      // Handle compilation or runtime errors
      if (result.exception) {
        outputContent.push({
          type: 'text',
          value: `Compilation/Runtime Error:\n${result.exception}`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `Error:\n${result.stderr}`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `Error: Code execution failed`
        });
      }
    }

  } catch (error: any) {
    outputContent.push({
      type: 'text',
      value: `API Error: ${error.message}`
    });
  }
}

// C# execution handler (using OneCompiler API)
async function executeCSharp(
  code: string,
  outputContent: Array<ConsoleOutputContent>
): Promise<void> {
  try {
    outputContent.push({
      type: 'text',
      value: 'Compiling and executing C# code...'
    });

    // Submit code to OneCompiler API via RapidAPI
    const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
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
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      }
      outputContent.push({
        type: 'text',
        value: `\n✓ C# code executed successfully (${result.executionTime}ms)`
      });
    } else {
      // Handle compilation or runtime errors
      if (result.exception) {
        outputContent.push({
          type: 'text',
          value: `Compilation/Runtime Error:\n${result.exception}`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `Error:\n${result.stderr}`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `Error: Code execution failed`
        });
      }
    }

  } catch (error: any) {
    outputContent.push({
      type: 'text',
      value: `API Error: ${error.message}`
    });
  }
}

// PHP execution handler (using OneCompiler API)
async function executePHP(
  code: string,
  outputContent: Array<ConsoleOutputContent>
): Promise<void> {
  try {
    outputContent.push({
      type: 'text',
      value: 'Executing PHP code...'
    });

    // Submit code to OneCompiler API via RapidAPI
    const response = await fetch('https://onecompiler-apis.p.rapidapi.com/api/v1/run', {
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
    });

    const result = await response.json();

    if (result.status === 'success') {
      if (result.stdout) {
        outputContent.push({
          type: 'text',
          value: result.stdout
        });
      }
      outputContent.push({
        type: 'text',
        value: `\n✓ PHP code executed successfully (${result.executionTime}ms)`
      });
    } else {
      // Handle execution errors
      if (result.exception) {
        outputContent.push({
          type: 'text',
          value: `PHP Error:\n${result.exception}`
        });
      } else if (result.stderr) {
        outputContent.push({
          type: 'text',
          value: `Error:\n${result.stderr}`
        });
      } else {
        outputContent.push({
          type: 'text',
          value: `Error: Code execution failed`
        });
      }
    }

  } catch (error: any) {
    outputContent.push({
      type: 'text',
      value: `API Error: ${error.message}`
    });
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
    'Useful for code generation in multiple programming languages. Full code execution available for Python, JavaScript, Java, C++, C#, and PHP using OneCompiler API.',
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

    return (
      <>
        <div className="px-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="text-xs text-muted-foreground">
              Detected language: <span className="font-medium text-foreground">{languageDisplay}</span>
              {EXECUTABLE_LANGUAGES.includes(detectedLanguage) && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Executable
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
      description: 'Run code (supports Python, JavaScript, Java, C++, C#, PHP)',
      onClick: async ({ content, setMetadata }) => {
        const detectedLanguage = detectLanguage(content);
        
        if (!EXECUTABLE_LANGUAGES.includes(detectedLanguage)) {
          toast.error(`Code execution is not supported for ${detectedLanguage}. Supported languages: Python, JavaScript, Java, C++, C#, PHP`);
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
              value: `Execution not supported for ${detectedLanguage}. Supported languages: Python, JavaScript, Java, C++, C#, PHP.`
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
                contents: [{ type: 'text', value: error.message }],
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
      description: 'Add comments',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add comments to the code snippet for understanding',
        });
      },
    },
    {
      icon: <LogsIcon />,
      description: 'Add logs',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Add logs to the code snippet for debugging',
        });
      },
    },
  ],
});

export interface UpdateConfig {
  // Primary update method to use
  primaryMethod: 'smart' | 'regex' | 'string' | 'template' | 'diff' | 'auto';
  
  // Fallback methods in order of preference
  fallbackMethods: Array<'smart' | 'regex' | 'string' | 'template' | 'diff'>;
  
  // Enable debugging and logging
  enableDebug: boolean;
  
  // Enable client notifications
  enableClientNotifications: boolean;
  
  // Timeout for AI operations (ms)
  aiTimeout: number;
  
  // Maximum content size for smart updates (bytes)
  maxContentSizeForSmartUpdate: number;
  
  // Keywords that trigger specific methods
  methodTriggers: {
    regex: string[];
    string: string[];
    template: string[];
    diff: string[];
    smart: string[];
  };
}

export const defaultUpdateConfig: UpdateConfig = {
  primaryMethod: 'auto',
  fallbackMethods: ['string', 'regex', 'smart', 'template', 'diff'],
  enableDebug: true,
  enableClientNotifications: true,
  aiTimeout: 30000,
  maxContentSizeForSmartUpdate: 100000, // 100KB
  methodTriggers: {
    regex: ['regex', 'pattern', 'title', 'heading', 'footer', 'header'],
    string: ['simple', 'text only', 'quick', 'replace text'],
    template: ['section', 'template', 'structure', 'layout'],
    diff: ['diff', 'merge', 'compare', 'intelligent'],
    smart: ['smart update', 'targeted', 'precise', 'specific change']
  }
};

// Alternative configurations for different scenarios
export const updateConfigs = {
  // Fast and simple updates
  performance: {
    ...defaultUpdateConfig,
    primaryMethod: 'string' as const,
    fallbackMethods: ['regex', 'smart'],
    maxContentSizeForSmartUpdate: 50000
  },
  
  // Most reliable updates
  reliability: {
    ...defaultUpdateConfig,
    primaryMethod: 'regex' as const,
    fallbackMethods: ['string', 'template', 'diff'],
    enableDebug: true
  },
  
  // Advanced smart updates
  advanced: {
    ...defaultUpdateConfig,
    primaryMethod: 'smart' as const,
    fallbackMethods: ['template', 'diff', 'regex', 'string'],
    maxContentSizeForSmartUpdate: 200000
  },
  
  // Debug mode with extensive logging
  debug: {
    ...defaultUpdateConfig,
    primaryMethod: 'auto' as const,
    enableDebug: true,
    enableClientNotifications: true,
    aiTimeout: 60000
  }
};

export function getUpdateConfig(configName?: keyof typeof updateConfigs): UpdateConfig {
  if (configName && updateConfigs[configName]) {
    return updateConfigs[configName];
  }
  return defaultUpdateConfig;
} 
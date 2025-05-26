import { JSDOM } from 'jsdom';

export interface DiagnosticResult {
  contentAnalysis: {
    size: number;
    hasValidHtml: boolean;
    hasBody: boolean;
    hasHead: boolean;
    elementCounts: Record<string, number>;
    commonElements: string[];
  };
  updateAnalysis: {
    requestType: string;
    detectedMethod: string;
    keywords: string[];
    complexity: 'simple' | 'medium' | 'complex';
    recommendedMethod: string;
  };
  potentialIssues: string[];
  recommendations: string[];
}

export function diagnoseHtmlUpdate(content: string, description: string): DiagnosticResult {
  const contentAnalysis = analyzeContent(content);
  const updateAnalysis = analyzeUpdateRequest(description, content);
  const potentialIssues = identifyPotentialIssues(contentAnalysis, updateAnalysis);
  const recommendations = generateRecommendations(contentAnalysis, updateAnalysis, potentialIssues);

  return {
    contentAnalysis,
    updateAnalysis,
    potentialIssues,
    recommendations
  };
}

function analyzeContent(content: string) {
  const analysis = {
    size: content.length,
    hasValidHtml: false,
    hasBody: false,
    hasHead: false,
    elementCounts: {} as Record<string, number>,
    commonElements: [] as string[]
  };

  try {
    // Check if content is valid HTML
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    analysis.hasValidHtml = true;
    analysis.hasBody = !!document.body;
    analysis.hasHead = !!document.head;

    // Count elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const tagName = el.tagName.toLowerCase();
      analysis.elementCounts[tagName] = (analysis.elementCounts[tagName] || 0) + 1;
    });

    // Identify common elements
    const commonTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'div', 'p', 'h1', 'h2', 'h3'];
    analysis.commonElements = commonTags.filter(tag => analysis.elementCounts[tag] > 0);

  } catch (error) {
    analysis.hasValidHtml = false;
  }

  return analysis;
}

function analyzeUpdateRequest(description: string, content: string) {
  const lowerDesc = description.toLowerCase();
  const words = lowerDesc.split(/\s+/);
  
  // Detect keywords
  const keywords = {
    smart: ['smart', 'targeted', 'precise', 'specific'],
    regex: ['title', 'heading', 'footer', 'header', 'pattern'],
    string: ['simple', 'text', 'replace', 'change'],
    template: ['section', 'template', 'structure', 'layout'],
    diff: ['diff', 'merge', 'compare', 'intelligent']
  };

  const detectedKeywords: string[] = [];
  let detectedMethod = 'unknown';
  
  for (const [method, methodKeywords] of Object.entries(keywords)) {
    const foundKeywords = methodKeywords.filter(keyword => lowerDesc.includes(keyword));
    if (foundKeywords.length > 0) {
      detectedKeywords.push(...foundKeywords);
      if (detectedMethod === 'unknown') {
        detectedMethod = method;
      }
    }
  }

  // Determine complexity
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  
  if (lowerDesc.includes('add') || lowerDesc.includes('insert') || lowerDesc.includes('create')) {
    complexity = 'medium';
  }
  
  if (lowerDesc.includes('restructure') || lowerDesc.includes('reorganize') || words.length > 20) {
    complexity = 'complex';
  }

  // Recommend method
  let recommendedMethod = 'string';
  
  if (content.length > 10000) {
    recommendedMethod = 'smart';
  } else if (detectedKeywords.some(k => ['title', 'heading', 'footer'].includes(k))) {
    recommendedMethod = 'regex';
  } else if (complexity === 'complex') {
    recommendedMethod = 'template';
  }

  return {
    requestType: detectRequestType(lowerDesc),
    detectedMethod,
    keywords: detectedKeywords,
    complexity,
    recommendedMethod
  };
}

function detectRequestType(description: string): string {
  if (description.includes('add') || description.includes('insert')) return 'addition';
  if (description.includes('remove') || description.includes('delete')) return 'removal';
  if (description.includes('change') || description.includes('update') || description.includes('modify')) return 'modification';
  if (description.includes('replace')) return 'replacement';
  return 'unknown';
}

function identifyPotentialIssues(contentAnalysis: any, updateAnalysis: any): string[] {
  const issues: string[] = [];

  if (!contentAnalysis.hasValidHtml) {
    issues.push('Content is not valid HTML - DOM-based operations will fail');
  }

  if (contentAnalysis.size > 100000) {
    issues.push('Content is very large - smart updates may be slow');
  }

  if (contentAnalysis.size < 100) {
    issues.push('Content is very small - smart updates may be overkill');
  }

  if (!contentAnalysis.hasBody) {
    issues.push('No body element found - some operations may fail');
  }

  if (updateAnalysis.detectedMethod === 'unknown') {
    issues.push('Could not detect appropriate update method from description');
  }

  if (updateAnalysis.complexity === 'complex' && contentAnalysis.commonElements.length < 3) {
    issues.push('Complex update requested but content has simple structure');
  }

  if (updateAnalysis.keywords.length === 0) {
    issues.push('No specific keywords detected - may fall back to full rewrite');
  }

  return issues;
}

function generateRecommendations(contentAnalysis: any, updateAnalysis: any, issues: string[]): string[] {
  const recommendations: string[] = [];

  if (issues.includes('Content is not valid HTML - DOM-based operations will fail')) {
    recommendations.push('Use string-based or regex-based updates instead of DOM operations');
  }

  if (issues.includes('Content is very large - smart updates may be slow')) {
    recommendations.push('Use regex or string manipulation for better performance');
    recommendations.push('Consider breaking the update into smaller operations');
  }

  if (issues.includes('Could not detect appropriate update method from description')) {
    recommendations.push('Be more specific in your update request');
    recommendations.push('Include keywords like "title", "footer", "heading" for better detection');
    recommendations.push('Use phrases like "smart update:" to force smart update mode');
  }

  if (updateAnalysis.complexity === 'simple' && contentAnalysis.size < 5000) {
    recommendations.push('Use string manipulation method for fastest results');
  }

  if (updateAnalysis.requestType === 'addition' && contentAnalysis.commonElements.includes('body')) {
    recommendations.push('Use template-based updates for adding new sections');
  }

  if (updateAnalysis.keywords.includes('footer') || updateAnalysis.keywords.includes('header')) {
    recommendations.push('Use regex-based updates for header/footer modifications');
  }

  // Always provide a fallback recommendation
  if (recommendations.length === 0) {
    recommendations.push(`Try using ${updateAnalysis.recommendedMethod} method for this type of update`);
  }

  return recommendations;
}

export function logDiagnostics(result: DiagnosticResult, description: string) {
  console.log('=== HTML Update Diagnostics ===');
  console.log('Request:', description);
  console.log('Content size:', result.contentAnalysis.size, 'bytes');
  console.log('Valid HTML:', result.contentAnalysis.hasValidHtml);
  console.log('Detected method:', result.updateAnalysis.detectedMethod);
  console.log('Recommended method:', result.updateAnalysis.recommendedMethod);
  console.log('Complexity:', result.updateAnalysis.complexity);
  
  if (result.potentialIssues.length > 0) {
    console.log('Potential issues:');
    result.potentialIssues.forEach(issue => console.log('  -', issue));
  }
  
  if (result.recommendations.length > 0) {
    console.log('Recommendations:');
    result.recommendations.forEach(rec => console.log('  -', rec));
  }
  
  console.log('================================');
} 
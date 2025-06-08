// Smart layout analysis system for dynamic component selection
// This prevents repetitive template generation and creates tailored layouts

export interface LayoutAnalysis {
  projectType: string;
  requiredSections: string[];
  optionalSections: string[];
  layoutStructure: 'single-page' | 'multi-section' | 'dashboard' | 'landing' | 'minimal';
  primaryPurpose: string;
  targetAudience: string;
  contentPriority: string[];
}

export interface ComponentNeed {
  component: string;
  necessity: 'required' | 'recommended' | 'optional' | 'avoid';
  reason: string;
  alternatives?: string[];
}

export class SmartLayoutAnalyzer {
  
  /**
   * Analyzes user prompt to determine exactly what components are needed
   * Avoids generic template repetition by understanding specific requirements
   */
  public analyzePromptForLayout(prompt: string): LayoutAnalysis {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detect project type and purpose
    const projectType = this.detectProjectType(lowerPrompt);
    const primaryPurpose = this.detectPrimaryPurpose(lowerPrompt);
    const targetAudience = this.detectTargetAudience(lowerPrompt);
    
    // Determine layout structure based on specific needs
    const layoutStructure = this.determineLayoutStructure(lowerPrompt, projectType);
    
    // Smart section analysis - only include what's actually needed
    const { requiredSections, optionalSections } = this.analyzeSectionNeeds(lowerPrompt, projectType, primaryPurpose);
    
    // Prioritize content based on user intent
    const contentPriority = this.determineContentPriority(lowerPrompt, requiredSections);
    
    return {
      projectType,
      requiredSections,
      optionalSections,
      layoutStructure,
      primaryPurpose,
      targetAudience,
      contentPriority
    };
  }

  /**
   * Determines specific component needs to avoid unnecessary repetition
   */
  public analyzeComponentNeeds(prompt: string, layoutAnalysis: LayoutAnalysis): ComponentNeed[] {
    const needs: ComponentNeed[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    // Navigation analysis
    needs.push(this.analyzeNavigationNeed(lowerPrompt, layoutAnalysis));
    
    // Header/Hero analysis
    needs.push(this.analyzeHeroNeed(lowerPrompt, layoutAnalysis));
    
    // Content sections analysis
    needs.push(...this.analyzeContentSectionNeeds(lowerPrompt, layoutAnalysis));
    
    // Footer analysis
    needs.push(this.analyzeFooterNeed(lowerPrompt, layoutAnalysis));
    
    // Interactive elements analysis
    needs.push(...this.analyzeInteractiveElementNeeds(lowerPrompt, layoutAnalysis));
    
    return needs.filter(need => need.necessity !== 'avoid');
  }

  private detectProjectType(prompt: string): string {
    const typeKeywords = {
      'portfolio': ['portfolio', 'showcase', 'personal site', 'my work', 'projects', 'gallery'],
      'business': ['business', 'company', 'corporate', 'professional', 'services'],
      'ecommerce': ['shop', 'store', 'ecommerce', 'sell', 'products', 'marketplace', 'cart'],
      'blog': ['blog', 'articles', 'posts', 'news', 'content', 'stories'],
      'saas': ['saas', 'software', 'platform', 'dashboard', 'app', 'tool'],
      'landing': ['landing', 'campaign', 'promotion', 'signup', 'conversion', 'marketing'],
      'event': ['event', 'conference', 'meetup', 'workshop', 'seminar', 'gathering'],
      'restaurant': ['restaurant', 'cafe', 'food', 'menu', 'dining', 'cuisine'],
      'nonprofit': ['nonprofit', 'charity', 'foundation', 'cause', 'donation', 'volunteer'],
      'education': ['education', 'course', 'school', 'learning', 'training', 'tutorial'],
      'creative': ['creative', 'art', 'design', 'photography', 'studio', 'artistic'],
      'minimal': ['simple', 'minimal', 'clean', 'basic', 'quick', 'one page']
    };

    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        return type;
      }
    }
    
    return 'general';
  }

  private detectPrimaryPurpose(prompt: string): string {
    const purposeKeywords = {
      'lead_generation': ['contact', 'leads', 'inquiries', 'get in touch', 'consultation'],
      'sales': ['buy', 'purchase', 'order', 'shop', 'pricing', 'plans'],
      'information': ['about', 'learn', 'information', 'details', 'explain'],
      'showcase': ['show', 'display', 'portfolio', 'gallery', 'examples'],
      'engagement': ['community', 'social', 'interact', 'engage', 'connect'],
      'conversion': ['signup', 'register', 'join', 'subscribe', 'download'],
      'support': ['help', 'support', 'faq', 'documentation', 'guide']
    };

    for (const [purpose, keywords] of Object.entries(purposeKeywords)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        return purpose;
      }
    }
    
    return 'general';
  }

  private detectTargetAudience(prompt: string): string {
    const audienceKeywords = {
      'business': ['b2b', 'business', 'enterprise', 'professional', 'corporate'],
      'consumer': ['b2c', 'customer', 'client', 'user', 'individual'],
      'developer': ['developer', 'programmer', 'tech', 'api', 'code'],
      'creative': ['designer', 'artist', 'creative', 'agency', 'studio'],
      'general': ['everyone', 'public', 'general', 'all', 'anyone']
    };

    for (const [audience, keywords] of Object.entries(audienceKeywords)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        return audience;
      }
    }
    
    return 'general';
  }

  private determineLayoutStructure(prompt: string, projectType: string): LayoutAnalysis['layoutStructure'] {
    if (prompt.includes('single page') || prompt.includes('one page') || projectType === 'minimal') {
      return 'single-page';
    }
    if (projectType === 'saas' || prompt.includes('dashboard')) {
      return 'dashboard';
    }
    if (projectType === 'landing' || prompt.includes('landing')) {
      return 'landing';
    }
    if (prompt.includes('simple') || prompt.includes('minimal') || prompt.includes('clean')) {
      return 'minimal';
    }
    
    return 'multi-section';
  }

  private analyzeSectionNeeds(prompt: string, projectType: string, purpose: string): { requiredSections: string[], optionalSections: string[] } {
    const allSections = {
      navigation: ['nav', 'menu', 'header'],
      hero: ['hero', 'banner', 'intro', 'welcome'],
      about: ['about', 'story', 'who we are', 'background'],
      services: ['services', 'what we do', 'offerings'],
      features: ['features', 'benefits', 'capabilities'],
      portfolio: ['portfolio', 'work', 'projects', 'gallery'],
      testimonials: ['testimonials', 'reviews', 'feedback', 'clients'],
      pricing: ['pricing', 'plans', 'cost', 'packages'],
      team: ['team', 'staff', 'people', 'members'],
      contact: ['contact', 'get in touch', 'reach out'],
      blog: ['blog', 'news', 'articles', 'posts'],
      faq: ['faq', 'questions', 'help'],
      footer: ['footer', 'bottom']
    };

    const requiredSections: string[] = [];
    const optionalSections: string[] = [];

    // Always need navigation and footer for multi-section sites
    if (projectType !== 'minimal') {
      requiredSections.push('navigation', 'footer');
    }

    // Analyze what sections are explicitly mentioned or implied
    for (const [section, keywords] of Object.entries(allSections)) {
      const isExplicitlyMentioned = keywords.some(keyword => prompt.includes(keyword));
      const isImpliedByType = this.isSectionImpliedByType(section, projectType, purpose);
      
      if (isExplicitlyMentioned) {
        if (!requiredSections.includes(section)) {
          requiredSections.push(section);
        }
      } else if (isImpliedByType) {
        if (!requiredSections.includes(section)) {
          optionalSections.push(section);
        }
      }
    }

    // Remove commonly overused sections unless specifically requested
    const overusedSections = ['testimonials', 'team', 'faq'];
    overusedSections.forEach(section => {
      if (!prompt.includes(section) && optionalSections.includes(section)) {
        const index = optionalSections.indexOf(section);
        optionalSections.splice(index, 1);
      }
    });

    return { requiredSections, optionalSections };
  }

  private isSectionImpliedByType(section: string, projectType: string, purpose: string): boolean {
    const implications: Record<string, string[]> = {
      portfolio: ['hero', 'portfolio', 'about'],
      business: ['hero', 'services', 'about', 'contact'],
      ecommerce: ['hero', 'features', 'pricing'],
      saas: ['hero', 'features', 'pricing'],
      landing: ['hero', 'features'],
      restaurant: ['hero', 'about', 'contact'],
      event: ['hero', 'about', 'contact'],
      minimal: ['hero']
    };

    return implications[projectType]?.includes(section) || false;
  }

  private determineContentPriority(prompt: string, requiredSections: string[]): string[] {
    // Prioritize based on what user emphasizes in prompt
    const priority: string[] = [];
    
    // Look for emphasis keywords
    const emphasisKeywords = {
      'main': ['main', 'primary', 'most important', 'key', 'focus'],
      'showcase': ['showcase', 'highlight', 'feature', 'display'],
      'convert': ['convert', 'sell', 'signup', 'action']
    };

    // Start with hero as it's usually primary
    if (requiredSections.includes('hero')) {
      priority.push('hero');
    }

    // Add sections based on prompt emphasis
    requiredSections.forEach(section => {
      if (!priority.includes(section)) {
        priority.push(section);
      }
    });

    return priority;
  }

  private analyzeNavigationNeed(prompt: string, analysis: LayoutAnalysis): ComponentNeed {
    if (analysis.layoutStructure === 'minimal' || analysis.layoutStructure === 'single-page') {
      return {
        component: 'navigation',
        necessity: 'optional',
        reason: 'Single page layout may not need complex navigation',
        alternatives: ['simple header', 'logo only']
      };
    }

    return {
      component: 'navigation',
      necessity: 'required',
      reason: 'Multi-section layout requires navigation for user orientation'
    };
  }

  private analyzeHeroNeed(prompt: string, analysis: LayoutAnalysis): ComponentNeed {
    if (prompt.includes('no hero') || prompt.includes('skip intro')) {
      return {
        component: 'hero',
        necessity: 'avoid',
        reason: 'User explicitly requested no hero section'
      };
    }

    return {
      component: 'hero',
      necessity: 'required',
      reason: 'Hero section provides essential first impression and context'
    };
  }

  private analyzeContentSectionNeeds(prompt: string, analysis: LayoutAnalysis): ComponentNeed[] {
    const needs: ComponentNeed[] = [];
    
    // Only analyze sections that are actually required or mentioned
    analysis.requiredSections.forEach(section => {
      if (!['navigation', 'hero', 'footer'].includes(section)) {
        needs.push({
          component: section,
          necessity: 'required',
          reason: `Required based on project type (${analysis.projectType}) and user request`
        });
      }
    });

    analysis.optionalSections.forEach(section => {
      needs.push({
        component: section,
        necessity: 'optional',
        reason: `Commonly included for ${analysis.projectType} projects but not essential`
      });
    });

    return needs;
  }

  private analyzeFooterNeed(prompt: string, analysis: LayoutAnalysis): ComponentNeed {
    if (analysis.layoutStructure === 'minimal') {
      return {
        component: 'footer',
        necessity: 'optional',
        reason: 'Minimal layouts may not need complex footers',
        alternatives: ['simple copyright', 'contact info only']
      };
    }

    return {
      component: 'footer',
      necessity: 'required',
      reason: 'Professional sites need footers for legal info and secondary navigation'
    };
  }

  private analyzeInteractiveElementNeeds(prompt: string, analysis: LayoutAnalysis): ComponentNeed[] {
    const needs: ComponentNeed[] = [];
    
    // Contact forms
    if (prompt.includes('contact') || analysis.primaryPurpose === 'lead_generation') {
      needs.push({
        component: 'contact-form',
        necessity: 'required',
        reason: 'Contact functionality explicitly requested or implied by purpose'
      });
    }

    // Newsletter signup
    if (prompt.includes('newsletter') || prompt.includes('subscribe')) {
      needs.push({
        component: 'newsletter-signup',
        necessity: 'required',
        reason: 'Newsletter functionality explicitly requested'
      });
    }

    // Search functionality
    if (prompt.includes('search') || analysis.projectType === 'blog' || analysis.projectType === 'ecommerce') {
      needs.push({
        component: 'search',
        necessity: analysis.projectType === 'ecommerce' ? 'required' : 'recommended',
        reason: 'Search improves user experience for content-heavy sites'
      });
    }

    return needs;
  }

  /**
   * Generates layout-specific prompt instructions to avoid repetitive templates
   */
  public generateLayoutPrompt(analysis: LayoutAnalysis, componentNeeds: ComponentNeed[]): string {
    const requiredComponents = componentNeeds.filter(need => need.necessity === 'required');
    const avoidComponents = componentNeeds.filter(need => need.necessity === 'avoid');
    
    let prompt = `Create a ${analysis.projectType} website with a ${analysis.layoutStructure} layout targeting ${analysis.targetAudience} users. `;
    prompt += `Primary purpose: ${analysis.primaryPurpose}. `;
    
    prompt += `\n\nREQUIRED SECTIONS (only include these):\n`;
    requiredComponents.forEach(component => {
      prompt += `- ${component.component}: ${component.reason}\n`;
    });
    
    if (avoidComponents.length > 0) {
      prompt += `\nDO NOT INCLUDE:\n`;
      avoidComponents.forEach(component => {
        prompt += `- ${component.component}: ${component.reason}\n`;
      });
    }
    
    prompt += `\nContent priority order: ${analysis.contentPriority.join(' -> ')}\n`;
    
    prompt += `\nImportant: Create a focused, purpose-driven layout. Avoid generic template sections that weren't specifically requested or needed for this project type.`;
    
    return prompt;
  }
}

export const smartLayoutAnalyzer = new SmartLayoutAnalyzer();
// Simplified video timing utilities for better synchronization
export interface TimingConfig {
  sceneDuration: number;
  textLength: number;
  wordsPerSecond: number; // Average speaking rate
}

export interface TextReveal {
  text: string;
  startTime: number;
  endTime: number;
  cumulativeText: string;
}

export class VideoTiming {
  private static readonly DEFAULT_WPM = 150; // Words per minute (natural speaking rate)
  private static readonly MIN_CHAR_DISPLAY_TIME = 0.03; // Minimum time per character (30ms)
  private static readonly MAX_CHAR_DISPLAY_TIME = 0.08; // Maximum time per character (80ms)

  /**
   * Calculate optimal text reveal timing based on scene duration and content
   */
  static calculateTextReveals(text: string, sceneDuration: number): TextReveal[] {
    if (!text || text.trim().length === 0) return [];

    const cleanText = text.trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const totalChars = cleanText.length;
    
    // Calculate speaking rate-based timing
    const wordsPerSecond = this.DEFAULT_WPM / 60;
    const estimatedSpeakingTime = words.length / wordsPerSecond;
    
    // Use 85% of scene duration for text, leaving buffer time
    const availableTime = sceneDuration * 0.85;
    const actualDuration = Math.min(estimatedSpeakingTime, availableTime);
    
    // Calculate time per character
    const timePerChar = Math.max(
      this.MIN_CHAR_DISPLAY_TIME,
      Math.min(this.MAX_CHAR_DISPLAY_TIME, actualDuration / totalChars)
    );

    const reveals: TextReveal[] = [];
    const chars = cleanText.split('');
    
    // Create smooth character-by-character reveals
    // Group characters to avoid too many filter operations
    const charsPerReveal = Math.max(1, Math.floor(totalChars / 30)); // Max 30 reveals per scene
    
    for (let i = 0; i < chars.length; i += charsPerReveal) {
      const endIndex = Math.min(i + charsPerReveal, chars.length);
      const cumulativeText = chars.slice(0, endIndex).join('');
      const startTime = i * timePerChar;
      const endTime = Math.min(endIndex * timePerChar, actualDuration);
      
      reveals.push({
        text: chars.slice(i, endIndex).join(''),
        startTime,
        endTime,
        cumulativeText
      });
    }

    return reveals;
  }

  /**
   * Create word-by-word reveals for better readability
   */
  static calculateWordReveals(text: string, sceneDuration: number): TextReveal[] {
    if (!text || text.trim().length === 0) return [];

    const cleanText = text.trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) return [];

    // Calculate speaking rate
    const wordsPerSecond = this.DEFAULT_WPM / 60;
    const estimatedSpeakingTime = words.length / wordsPerSecond;
    const availableTime = sceneDuration * 0.9; // Use 90% of scene duration
    const actualDuration = Math.min(estimatedSpeakingTime, availableTime);
    
    const timePerWord = actualDuration / words.length;
    const reveals: TextReveal[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const cumulativeText = words.slice(0, i + 1).join(' ');
      const startTime = i * timePerWord;
      const endTime = (i + 1) * timePerWord;
      
      reveals.push({
        text: words[i],
        startTime,
        endTime,
        cumulativeText
      });
    }

    return reveals;
  }

  /**
   * Generate FFmpeg drawtext filters for smooth typewriter effect
   */
  static generateTypewriterFilters(
    reveals: TextReveal[], 
    fontSize: number = 40,
    fontColor: string = 'white@0.9',
    position: { x: string; y: string } = { x: '(w-text_w)/2', y: 'h-100' },
    fps: number = 30
  ): string {
    if (reveals.length === 0) return '';

    let filters = '';
    
    for (const reveal of reveals) {
      const startFrame = Math.floor(reveal.startTime * fps);
      const endFrame = Math.floor(reveal.endTime * fps);
      
      // Escape text for FFmpeg
      const escapedText = reveal.cumulativeText
        .replace(/'/g, "\\'")
        .replace(/:/g, "\\:")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/,/g, "\\,")
        .replace(/"/g, '\\"')
        .replace(/;/g, "\\;");
      
      filters += `,drawtext=text='${escapedText}'` +
                 `:fontfile=roboto.ttf` +
                 `:fontsize=${fontSize}` +
                 `:fontcolor=${fontColor}` +
                 `:x=${position.x}` +
                 `:y=${position.y}` +
                 `:enable='between(n\\,${startFrame}\\,${endFrame})'` +
                 `:borderw=2` +
                 `:bordercolor=black@0.5`;
    }
    
    return filters;
  }

  /**
   * Calculate scene break points for better content flow
   */
  static calculateSceneBreaks(script: string, targetDuration: number): Array<{
    text: string;
    duration: number;
    estimatedWords: number;
  }> {
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalWords = script.split(/\s+/).filter(w => w.length > 0).length;
    const wordsPerSecond = this.DEFAULT_WPM / 60;
    const estimatedSpeakingTime = totalWords / wordsPerSecond;
    
    // Determine optimal scene count based on content and duration
    const sceneDuration = Math.min(30, targetDuration / 2); // Max 30s per scene
    const sceneCount = Math.max(2, Math.ceil(estimatedSpeakingTime / sceneDuration));
    
    const sentencesPerScene = Math.ceil(sentences.length / sceneCount);
    const scenes = [];
    
    for (let i = 0; i < sceneCount; i++) {
      const start = i * sentencesPerScene;
      const end = Math.min(start + sentencesPerScene, sentences.length);
      const sceneText = sentences.slice(start, end).join('. ').trim();
      const sceneWords = sceneText.split(/\s+/).filter(w => w.length > 0).length;
      const sceneDuration = Math.max(5, sceneWords / wordsPerSecond); // Min 5s per scene
      
      scenes.push({
        text: sceneText,
        duration: sceneDuration,
        estimatedWords: sceneWords
      });
    }
    
    return scenes;
  }
}
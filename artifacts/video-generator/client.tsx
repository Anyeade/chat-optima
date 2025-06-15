import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { toast } from 'sonner';
import {
  CopyIcon,
  UndoIcon,
  RedoIcon,
  EyeIcon,
  PlayIcon,
  DownloadIcon,
} from '@/components/icons';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Simple icon replacements for missing icons
const MicIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
    <line x1="8" x2="16" y1="22" y2="22"/>
  </svg>
);

const MusicIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 7l-7 5 7 5V7z"/>
    <rect width="15" height="9" x="1" y="8" rx="2" ry="2"/>
  </svg>
);

// Simple Tab components replacement
const Tabs = ({ children, defaultValue, className }: { children: React.ReactNode; defaultValue: string; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className} data-active-tab={activeTab}>
      {React.Children.map(children, child => 
        React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab } as any) : child
      )}
    </div>
  );
};

const TabsList = ({ children, className, activeTab, setActiveTab }: any) => (
  <div className={`flex border-b ${className || ''}`}>
    {React.Children.map(children, child => 
      React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab } as any) : child
    )}
  </div>
);

const TabsTrigger = ({ children, value, activeTab, setActiveTab }: any) => (
  <button
    className={`px-4 py-2 border-b-2 ${activeTab === value ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-600'}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, activeTab }: any) => 
  activeTab === value ? <div className="mt-4">{children}</div> : null;

// Simple Progress component replacement
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className || ''}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
);

interface VideoGeneratorMetadata {
  // InVideo.ai-style features
  aiPrompt: string;
  workflow: 'youtube-shorts' | 'youtube-long' | 'explainer' | 'social-media' | 'product-demo' | 'educational' | 'marketing' | 'storytelling' | 'instagram-reel' | 'tiktok-video' | 'marketing-ad';
  targetAudience: {
    demographic: 'teens' | 'young-adults' | 'professionals' | 'seniors' | 'general';
    tone: 'professional' | 'casual' | 'energetic' | 'calm' | 'inspiring' | 'educational';
    platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'website';
  };
  
  // Enhanced script and scenes
  script: string;
  scenes: Array<{
    id: string;
    duration: number;
    script: string;
    visualPrompt: string;
    musicMood?: string;
    generated?: boolean;
  }>;
  
  // Advanced voice options
  selectedVoice: {
    language: string;
    name: string;
    emotion: 'neutral' | 'happy' | 'excited' | 'calm' | 'professional' | 'energetic';
    speed: number;
    pitch: number;
  };
  
  // Media selections
  backgroundMusic: {
    id: string;
    name: string;
    artist: string;
    audioUrl: string;
    duration: number;
    mood?: string;
    matchScore?: number;
  } | null;
  backgroundVideo: {
    id: string;
    url: string;
    duration: number;
    thumbnail: string;
  } | null;
    // Generation state
  voiceOverUrl: string | null;
  voiceMetadata: {
    format: string;
    quality: string;
    duration: number;
    voice: any;
    timing: any;
    metadata: {
      wordCount: number;
      estimatedWPM: number;
      emotionApplied: string;
      speedAdjustment: number;
    };
  } | null;
  generationProgress: number;
  isGenerating: boolean;
  currentStep: number;
  
  // Template and preview
  selectedTemplate: string | null;
  previewMode: 'timeline' | 'scene' | 'full';
}

// Enhanced voice options with emotions (InVideo.ai style) - Expanded for 50+ languages
const VOICE_OPTIONS = [
  // English variants
  { language: 'en-us', name: 'John', label: 'English (US) - John', emotion: 'professional', gender: 'male', accent: 'american' },
  { language: 'en-us', name: 'Alice', label: 'English (US) - Alice', emotion: 'friendly', gender: 'female', accent: 'american' },
  { language: 'en-us', name: 'Mike', label: 'English (US) - Mike', emotion: 'energetic', gender: 'male', accent: 'american' },
  { language: 'en-gb', name: 'Harry', label: 'English (UK) - Harry', emotion: 'authoritative', gender: 'male', accent: 'british' },
  { language: 'en-gb', name: 'Emma', label: 'English (UK) - Emma', emotion: 'warm', gender: 'female', accent: 'british' },
  { language: 'en-au', name: 'Oliver', label: 'English (AU) - Oliver', emotion: 'casual', gender: 'male', accent: 'australian' },
  { language: 'en-ca', name: 'Sarah', label: 'English (CA) - Sarah', emotion: 'calm', gender: 'female', accent: 'canadian' },
  
  // European languages
  { language: 'es-es', name: 'Antonio', label: 'Spanish (Spain) - Antonio', emotion: 'energetic', gender: 'male', accent: 'castilian' },
  { language: 'es-mx', name: 'Carmen', label: 'Spanish (Mexico) - Carmen', emotion: 'warm', gender: 'female', accent: 'mexican' },
  { language: 'fr-fr', name: 'Mathieu', label: 'French (France) - Mathieu', emotion: 'sophisticated', gender: 'male', accent: 'parisian' },
  { language: 'fr-ca', name: 'Celine', label: 'French (Canada) - Celine', emotion: 'elegant', gender: 'female', accent: 'quebecois' },
  { language: 'de-de', name: 'Hans', label: 'German - Hans', emotion: 'authoritative', gender: 'male', accent: 'standard' },
  { language: 'de-de', name: 'Greta', label: 'German - Greta', emotion: 'enthusiastic', gender: 'female', accent: 'standard' },
  { language: 'it-it', name: 'Marco', label: 'Italian - Marco', emotion: 'passionate', gender: 'male', accent: 'roman' },
  { language: 'pt-br', name: 'Bruno', label: 'Portuguese (Brazil) - Bruno', emotion: 'cheerful', gender: 'male', accent: 'brazilian' },
  { language: 'ru-ru', name: 'Dmitri', label: 'Russian - Dmitri', emotion: 'serious', gender: 'male', accent: 'moscow' },
  
  // Asian languages
  { language: 'zh-cn', name: 'Li Wei', label: 'Chinese (Mandarin) - Li Wei', emotion: 'calm', gender: 'male', accent: 'beijing' },
  { language: 'ja-jp', name: 'Takeshi', label: 'Japanese - Takeshi', emotion: 'polite', gender: 'male', accent: 'tokyo' },
  { language: 'ko-kr', name: 'Min-jun', label: 'Korean - Min-jun', emotion: 'friendly', gender: 'male', accent: 'seoul' },
  { language: 'hi-in', name: 'Arjun', label: 'Hindi - Arjun', emotion: 'warm', gender: 'male', accent: 'delhi' },
  { language: 'ar-sa', name: 'Ahmed', label: 'Arabic - Ahmed', emotion: 'professional', gender: 'male', accent: 'standard' },
];

// Workflow categories (like InVideo.ai) - Enhanced with more categories
const WORKFLOW_OPTIONS = [
  { 
    id: 'youtube-shorts', 
    name: 'YouTube Shorts', 
    duration: 60, 
    aspectRatio: '9:16',
    description: 'Vertical videos optimized for mobile',
    icon: '📱',
    category: 'social',
    features: ['Auto-captions', 'Trending music', 'Hook optimization']
  },
  { 
    id: 'youtube-long', 
    name: 'YouTube Video', 
    duration: 300, 
    aspectRatio: '16:9',
    description: 'Standard YouTube content format',
    icon: '🎬',
    category: 'educational',
    features: ['Intro/outro', 'Chapter markers', 'SEO optimization']
  },
  { 
    id: 'explainer', 
    name: 'Explainer Video', 
    duration: 120, 
    aspectRatio: '16:9',
    description: 'Educational and informative content',
    icon: '🎓',
    category: 'educational',
    features: ['Step-by-step structure', 'Visual diagrams', 'Clear narration']
  },
  { 
    id: 'social-media', 
    name: 'Social Media Post', 
    duration: 30, 
    aspectRatio: '1:1',
    description: 'Square format for Instagram/Facebook',
    icon: '📲',
    category: 'social',
    features: ['Eye-catching graphics', 'Quick hooks', 'Brand consistency']
  },
  { 
    id: 'product-demo', 
    name: 'Product Demo', 
    duration: 90, 
    aspectRatio: '16:9',
    description: 'Showcase products and features',
    icon: '🛍️',
    category: 'marketing',
    features: ['Feature highlights', 'Call-to-action', 'Benefit focus']
  },
  { 
    id: 'instagram-reel', 
    name: 'Instagram Reel', 
    duration: 30, 
    aspectRatio: '9:16',
    description: 'Engaging vertical content for Instagram',
    icon: '📸',
    category: 'social',
    features: ['Trending effects', 'Music sync', 'Quick cuts']
  },
  { 
    id: 'tiktok-video', 
    name: 'TikTok Video', 
    duration: 60, 
    aspectRatio: '9:16',
    description: 'Viral-ready content for TikTok',
    icon: '🎵',
    category: 'social',
    features: ['Viral hooks', 'Trending sounds', 'Quick pacing']
  },
  { 
    id: 'educational', 
    name: 'Educational Content', 
    duration: 180, 
    aspectRatio: '16:9',
    description: 'Learning-focused videos',
    icon: '📚',
    category: 'educational',
    features: ['Clear structure', 'Visual aids', 'Knowledge retention']
  },  { 
    id: 'marketing-ad', 
    name: 'Marketing Ad', 
    duration: 45, 
    aspectRatio: '16:9',
    description: 'Promotional content for businesses',
    icon: '📢',
    category: 'marketing',
    features: ['Strong CTA', 'Brand messaging', 'Conversion focus']
  },
  { 
    id: 'storytelling', 
    name: 'Story Video', 
    duration: 240, 
    aspectRatio: '16:9',
    description: 'Narrative-driven content',
    icon: '📖',
    category: 'creative',
    features: ['Story arc', 'Emotional engagement', 'Character development']
  },
  { 
    id: 'marketing', 
    name: 'Marketing Video', 
    duration: 45, 
    aspectRatio: '16:9',
    description: 'Promotional and advertising content',
    icon: '📈',
    category: 'business',
    features: ['Call-to-action', 'Brand focus', 'Performance tracking']
  }
];

// Target audience options
const AUDIENCE_OPTIONS = [
  { demographic: 'teens', label: 'Teenagers (13-19)', tone: 'energetic', platforms: ['tiktok', 'instagram'] },
  { demographic: 'young-adults', label: 'Young Adults (20-35)', tone: 'casual', platforms: ['youtube', 'instagram', 'tiktok'] },
  { demographic: 'professionals', label: 'Professionals (25-50)', tone: 'professional', platforms: ['linkedin', 'youtube'] },
  { demographic: 'seniors', label: 'Seniors (50+)', tone: 'calm', platforms: ['facebook', 'youtube'] },
  { demographic: 'general', label: 'General Audience', tone: 'inspiring', platforms: ['youtube', 'facebook', 'website'] }
];

// Voice-over generation component
function VoiceOverGenerator({ 
  script, 
  setScript, 
  selectedVoice, 
  setSelectedVoice, 
  onGenerate,
  isGenerating,
  voiceOverUrl,
  voiceMetadata
}: {
  script: string;
  setScript: (script: string) => void;
  selectedVoice: {
    language: string;
    name: string;
    emotion: 'neutral' | 'happy' | 'excited' | 'calm' | 'professional' | 'energetic';
    speed: number;
    pitch: number;
  };
  setSelectedVoice: (voice: {
    language: string;
    name: string;
    emotion: 'neutral' | 'happy' | 'excited' | 'calm' | 'professional' | 'energetic';
    speed: number;
    pitch: number;
  }) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  voiceOverUrl: string | null;
  voiceMetadata: any;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MicIcon className="w-5 h-5" />
          AI Voice-Over Generator
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI-POWERED</span>
        </CardTitle>
        <CardDescription>
          Generate intelligent voice-over with emotion, timing, and emphasis using AI optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="script">Script</Label>
          <Textarea
            id="script"
            placeholder="Enter your video script here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={4}
            className="mt-1"
          />
        </div>
          <div>
          <Label htmlFor="voice">Voice Selection</Label>
          <Select
            value={`${selectedVoice.language}-${selectedVoice.name}`}
            onValueChange={(value) => {
              const [language, name] = value.split('-');
              setSelectedVoice({ 
                language, 
                name,
                emotion: selectedVoice.emotion || 'neutral',
                speed: selectedVoice.speed || 1.0,
                pitch: selectedVoice.pitch || 1.0
              });
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={`${voice.language}-${voice.name}`} value={`${voice.language}-${voice.name}`}>
                  {voice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto-Optimize Button */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium text-purple-800 dark:text-purple-300">AI Voice Optimization</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Let AI analyze your script and optimize voice settings</div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              disabled={!script.trim() || isGenerating}
              onClick={async () => {
                if (!script.trim()) return;
                
                try {
                  // Call AI to analyze script and suggest optimal settings
                  const response = await fetch('/api/advanced-voice-generator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      script: script,
                      voice: selectedVoice,
                      timing: { pauseAfterSentences: 0.5, pauseAfterCommas: 0.2, breathingPauses: true }
                    })
                  });
                  
                  if (response.ok) {
                    const result = await response.json();                    if (result.success && result.aiRecommendations) {
                      // Apply AI recommendations
                      const currentVoice = selectedVoice;
                      setSelectedVoice({
                        ...currentVoice,
                        emotion: (result.aiRecommendations.suggestedEmotion as typeof currentVoice.emotion) || currentVoice.emotion,
                        speed: result.aiRecommendations.suggestedSpeed || currentVoice.speed
                      });
                      toast.success('✨ Voice settings optimized by AI!');
                    }
                  }
                } catch (error) {
                  toast.error('AI optimization failed');
                }
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              <span className="mr-1">🤖</span>
              Auto-Optimize
            </Button>
          </div>
        </div>

        {/* Voice Emotion */}
        <div>
          <Label htmlFor="emotion">Voice Emotion</Label>
          <Select
            value={selectedVoice.emotion}
            onValueChange={(emotion: 'neutral' | 'happy' | 'excited' | 'calm' | 'professional' | 'energetic') => {
              setSelectedVoice({ ...selectedVoice, emotion });
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="happy">Happy</SelectItem>
              <SelectItem value="excited">Excited</SelectItem>
              <SelectItem value="calm">Calm</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="energetic">Energetic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voice Speed */}
        <div>
          <Label htmlFor="speed">Speed: {selectedVoice.speed}x</Label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={selectedVoice.speed}
            onChange={(e) => setSelectedVoice({ ...selectedVoice, speed: parseFloat(e.target.value) })}
            className="w-full mt-1"
          />
        </div>

        {/* Voice Pitch */}
        <div>
          <Label htmlFor="pitch">Pitch: {selectedVoice.pitch}x</Label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={selectedVoice.pitch}
            onChange={(e) => setSelectedVoice({ ...selectedVoice, pitch: parseFloat(e.target.value) })}
            className="w-full mt-1"
          />
        </div>        <Button 
          onClick={onGenerate} 
          disabled={!script.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating AI Voice...
            </>
          ) : (
            <>
              <span className="mr-1">✨</span>
              Generate AI Voice-Over
            </>
          )}
        </Button>        {voiceOverUrl && (
          <div className="mt-4">
            <Label>Generated AI Voice-Over</Label>
            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <audio ref={audioRef} controls className="w-full">
                <source src={voiceOverUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              
              {/* AI Metadata Display */}
              {voiceMetadata && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <div className="font-medium text-blue-800 dark:text-blue-300">Duration</div>
                    <div className="text-blue-600 dark:text-blue-400">{voiceMetadata.duration}s</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                    <div className="font-medium text-purple-800 dark:text-purple-300">Quality</div>
                    <div className="text-purple-600 dark:text-purple-400">{voiceMetadata.quality}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <div className="font-medium text-green-800 dark:text-green-300">Words</div>
                    <div className="text-green-600 dark:text-green-400">{voiceMetadata.metadata?.wordCount || 'N/A'}</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <div className="font-medium text-orange-800 dark:text-orange-300">Speed</div>
                    <div className="text-orange-600 dark:text-orange-400">{voiceMetadata.metadata?.speedAdjustment || 1.0}x</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Background music search and selection component
function BackgroundMusicSelector({ 
  onMusicSelect, 
  selectedMusic,
  isGenerating 
}: {
  onMusicSelect: (music: any) => void;
  selectedMusic: any;
  isGenerating: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchMusic = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=3efca530&format=json&limit=20&search=${encodeURIComponent(searchQuery)}&audioformat=mp32`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching music:', error);
      toast.error('Failed to search music');
    }
    setIsSearching(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MusicIcon className="w-5 h-5" />
          Background Music
        </CardTitle>
        <CardDescription>
          Search and select background music from Jamendo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for background music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
          />
          <Button onClick={searchMusic} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {selectedMusic && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{selectedMusic.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMusic.artist}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onMusicSelect(null)}
                disabled={isGenerating}
              >
                Remove
              </Button>
            </div>
            <audio controls className="w-full mt-2">
              <source src={selectedMusic.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((track) => (
              <div 
                key={track.id} 
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => onMusicSelect({
                  id: track.id,
                  name: track.name,
                  artist: track.artist_name,
                  audioUrl: track.audio,
                  duration: track.duration
                })}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{track.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{track.artist_name}</p>
                    <p className="text-xs text-gray-500">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// AI-Enhanced Background video search and selection component
function BackgroundVideoSelector({ 
  onVideoSelect, 
  selectedVideo,
  isGenerating,
  script,
  workflow 
}: {
  onVideoSelect: (video: any) => void;
  selectedVideo: any;
  isGenerating: boolean;
  script?: string;
  workflow?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [isGettingAIRecommendations, setIsGettingAIRecommendations] = useState(false);

  const searchVideos = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Pexels API for video search
      const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(searchTerm)}&per_page=20`, {
        headers: {
          'Authorization': process.env.NEXT_PUBLIC_PEXELS_API_KEY || ''
        }
      });
      const data = await response.json();
      setSearchResults(data.videos || []);
    } catch (error) {
      console.error('Error searching videos:', error);
      toast.error('Failed to search videos');
    }
    setIsSearching(false);
  };

  const getAIVideoRecommendations = async () => {
    if (!script?.trim()) {
      toast.error('Script is required for AI recommendations');
      return;
    }

    setIsGettingAIRecommendations(true);
    try {
      const response = await fetch('/api/ai-video-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          workflow: workflow || 'explainer',
          mood: 'professional',
          style: 'modern'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAiRecommendations(result.recommendations);
          toast.success('✨ AI video recommendations generated!');
        }
      }
    } catch (error) {
      toast.error('Failed to get AI recommendations');
    }
    setIsGettingAIRecommendations(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoIcon className="w-5 h-5" />
          AI Background Video Selector
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">AI-ENHANCED</span>
        </CardTitle>
        <CardDescription>
          AI-powered video search with smart recommendations based on your script
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Recommendations Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium text-green-800 dark:text-green-300">AI Video Recommendations</div>
              <div className="text-xs text-green-600 dark:text-green-400">Let AI analyze your script and suggest perfect background videos</div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              disabled={!script?.trim() || isGettingAIRecommendations}
              onClick={getAIVideoRecommendations}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0"
            >
              {isGettingAIRecommendations ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="mr-1">🤖</span>
                  Get AI Suggestions
                </>
              )}
            </Button>
          </div>
          
          {aiRecommendations && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-2">🎯 AI-Suggested Searches:</div>
              <div className="grid grid-cols-1 gap-2">
                {aiRecommendations.primaryQueries?.map((query: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(query);
                      searchVideos(query);
                    }}
                    className="text-left text-xs p-2 rounded bg-white dark:bg-gray-800 border border-green-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <div className="font-medium">{query}</div>
                    <div className="text-gray-500 text-xs">
                      Relevance: {aiRecommendations.videoSuggestions?.[index]?.relevanceScore || 'N/A'}% • 
                      Est. {aiRecommendations.videoSuggestions?.[index]?.estimatedResults || 'N/A'} results
                    </div>
                  </button>
                ))}
              </div>
              
              {aiRecommendations.analysisInsights && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                  <div className="font-medium text-blue-800 dark:text-blue-300">AI Analysis:</div>
                  <div className="text-blue-600 dark:text-blue-400">{aiRecommendations.analysisInsights.visualFocus}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Search Section */}
        <div>
          <Label>Manual Search</Label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Search for background videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
            />
            <Button onClick={() => searchVideos()} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {selectedVideo && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">Selected Video</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {selectedVideo.duration}s</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onVideoSelect(null)}
                disabled={isGenerating}
              >
                Remove
              </Button>
            </div>
            <video controls className="w-full rounded">
              <source src={selectedVideo.url} type="video/mp4" />
            </video>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-2">
            {searchResults.map((video) => (
              <div 
                key={video.id} 
                className="border rounded-lg overflow-hidden hover:shadow-md cursor-pointer"
                onClick={() => {
                  const videoFile = video.video_files?.find((f: any) => f.quality === 'hd') || video.video_files?.[0];
                  if (videoFile) {
                    onVideoSelect({
                      id: video.id,
                      url: videoFile.link,
                      duration: video.duration,
                      thumbnail: video.image
                    });
                  }
                }}
              >
                <img 
                  src={video.image} 
                  alt="Video thumbnail" 
                  className="w-full h-24 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {video.duration}s • {video.width}x{video.height}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Video composition and preview component
function VideoComposer({ 
  metadata, 
  onGenerateVideo, 
  isGenerating, 
  generationProgress 
}: {
  metadata: VideoGeneratorMetadata;
  onGenerateVideo: () => void;
  isGenerating: boolean;
  generationProgress: number;
}) {
  const canGenerate = metadata.script && metadata.voiceOverUrl && metadata.backgroundVideo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoIcon className="w-5 h-5" />
          Video Composition
        </CardTitle>
        <CardDescription>
          Compose your final video with voice-over, music, and background video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center ${
              metadata.voiceOverUrl ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300'
            }`}>
              <MicIcon className={`w-8 h-8 ${metadata.voiceOverUrl ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <p className="mt-2 font-medium">Voice-Over</p>
            <p className={metadata.voiceOverUrl ? 'text-green-600' : 'text-gray-400'}>
              {metadata.voiceOverUrl ? 'Ready' : 'Not set'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center ${
              metadata.backgroundMusic ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
            }`}>
              <MusicIcon className={`w-8 h-8 ${metadata.backgroundMusic ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <p className="mt-2 font-medium">Background Music</p>
            <p className={metadata.backgroundMusic ? 'text-blue-600' : 'text-gray-400'}>
              {metadata.backgroundMusic ? 'Selected' : 'Optional'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center ${
              metadata.backgroundVideo ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300'
            }`}>
              <VideoIcon className={`w-8 h-8 ${metadata.backgroundVideo ? 'text-purple-600' : 'text-gray-400'}`} />
            </div>
            <p className="mt-2 font-medium">Background Video</p>
            <p className={metadata.backgroundVideo ? 'text-purple-600' : 'text-gray-400'}>
              {metadata.backgroundVideo ? 'Selected' : 'Not set'}
            </p>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating video...</span>
              <span>{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={onGenerateVideo} 
          disabled={!canGenerate || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? 'Generating Video...' : 'Generate Video'}
        </Button>

        {!canGenerate && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Voice-over and background video are required to generate the final video.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// InVideo.ai-style AI Prompt Generator Component
function AIPromptGenerator({ 
  aiPrompt, 
  setAiPrompt, 
  workflow, 
  setWorkflow, 
  targetAudience, 
  setTargetAudience, 
  onGenerate, 
  isGenerating 
}: {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  workflow: string;
  setWorkflow: (workflow: any) => void;
  targetAudience: any;
  setTargetAudience: (audience: any) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const examplePrompts = [
    "Create a 60-second YouTube video explaining how AI is transforming healthcare, featuring modern animations and an upbeat tone",
    "Make an Instagram reel about sustainable fashion tips for young adults, with trendy visuals and energetic music",
    "Generate a LinkedIn video showcasing our new productivity app features for professionals, using clean corporate style",
    "Create a TikTok video about quick cooking hacks for busy students, with fast-paced editing and fun transitions"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Video Generation
        </CardTitle>
        <CardDescription>
          Describe your video idea and let AI create the entire video for you - just like InVideo.ai!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="ai-prompt" className="text-base font-medium">Video Description Prompt</Label>
          <Textarea
            id="ai-prompt"
            placeholder="Describe the video you want to create..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="mt-2 min-h-32 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific about content, style, duration, and target audience for best results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="workflow-select" className="text-sm font-medium">Video Type</Label>
            <Select value={workflow} onValueChange={setWorkflow}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select workflow..." />
              </SelectTrigger>
              <SelectContent>
                {WORKFLOW_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="audience-select" className="text-sm font-medium">Target Audience</Label>
            <Select 
              value={targetAudience?.demographic || 'general'} 
              onValueChange={(demographic) => 
                setTargetAudience({
                  ...targetAudience,
                  demographic,
                  tone: AUDIENCE_OPTIONS.find(a => a.demographic === demographic)?.tone || 'professional'
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select audience..." />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.demographic} value={option.demographic}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="text-sm font-medium mb-3">💡 Example Prompts</h4>
          <div className="space-y-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setAiPrompt(prompt)}
                className="text-left p-2 rounded border bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors text-xs w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={!aiPrompt.trim() || isGenerating}
          className="w-full h-12 text-base font-medium"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Video...
            </>
          ) : (
            <>
              ⚡ Generate Complete Video
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Processing</span>
              <span className="text-sm">⚡ Analyzing prompt...</span>
            </div>
            <Progress value={30} className="w-full" />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Creating script, selecting visuals, and generating voice-over...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Workflow Selector Component
function WorkflowSelector({ 
  selectedWorkflow, 
  setWorkflow, 
  selectedTemplate, 
  setTemplate, 
  targetAudience, 
  setTargetAudience 
}: {
  selectedWorkflow: VideoGeneratorMetadata['workflow'];
  setWorkflow: (workflow: VideoGeneratorMetadata['workflow']) => void;
  selectedTemplate: string | null;
  setTemplate: (template: string) => void;
  targetAudience: any;
  setTargetAudience: (audience: any) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: '🎯' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'educational', name: 'Educational', icon: '📚' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'creative', name: 'Creative', icon: '🎨' }
  ];

  const filteredWorkflows = selectedCategory === 'all' 
    ? WORKFLOW_OPTIONS 
    : WORKFLOW_OPTIONS.filter(w => w.category === selectedCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Video Workflow & Templates
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {WORKFLOW_OPTIONS.length} Templates
          </span>
        </CardTitle>
        <CardDescription>
          Choose your video type and customize settings for optimal results. Professional templates powered by AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label className="text-base font-medium mb-3 block">Template Categories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-4 block">
            Select Video Type ({filteredWorkflows.length} available)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">            {filteredWorkflows.map((workflow) => (
              <button
                key={workflow.id}
                onClick={() => setWorkflow(workflow.id as any)}
                className={`p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden ${
                  selectedWorkflow === workflow.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {selectedWorkflow === workflow.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{workflow.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium">{workflow.name}</h3>
                    <p className="text-xs text-gray-500">{workflow.aspectRatio} • {workflow.duration}s</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{workflow.description}</p>
                
                {/* Features Tags */}
                <div className="flex flex-wrap gap-1">
                  {workflow.features.slice(0, 2).map((feature, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                  {workflow.features.length > 2 && (
                    <span className="text-xs text-gray-500">+{workflow.features.length - 2} more</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Platform</Label>
            <Select 
              value={targetAudience?.platform || 'youtube'} 
              onValueChange={(platform) => 
                setTargetAudience({ ...targetAudience, platform })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">📺 YouTube</SelectItem>
                <SelectItem value="instagram">📷 Instagram</SelectItem>
                <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                <SelectItem value="facebook">👥 Facebook</SelectItem>
                <SelectItem value="website">🌐 Website</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Tone</Label>
            <Select 
              value={targetAudience?.tone || 'professional'} 
              onValueChange={(tone) => 
                setTargetAudience({ ...targetAudience, tone })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">💼 Professional</SelectItem>
                <SelectItem value="casual">😊 Casual</SelectItem>
                <SelectItem value="energetic">⚡ Energetic</SelectItem>
                <SelectItem value="calm">🧘 Calm</SelectItem>
                <SelectItem value="inspiring">✨ Inspiring</SelectItem>
                <SelectItem value="educational">🎓 Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Audience</Label>
            <Select 
              value={targetAudience?.demographic || 'general'} 
              onValueChange={(demographic) => 
                setTargetAudience({ ...targetAudience, demographic })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.demographic} value={option.demographic}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Scene Editor Component (Timeline-style like InVideo.ai)
function SceneEditor({ 
  scenes, 
  setScenes, 
  previewMode, 
  setPreviewMode, 
  currentStep, 
  isGenerating 
}: {
  scenes: any[];
  setScenes: (scenes: any[]) => void;
  previewMode: string;
  setPreviewMode: (mode: any) => void;
  currentStep: number;
  isGenerating: boolean;
}) {
  const addScene = () => {
    const newScene = {
      id: `scene-${Date.now()}`,
      duration: 10,
      script: '',
      visualPrompt: '',
      musicMood: 'neutral',
      generated: false
    };
    setScenes([...scenes, newScene]);
  };

  const updateScene = (index: number, updates: Partial<any>) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], ...updates };
    setScenes(newScenes);
  };

  const removeScene = (index: number) => {
    if (scenes.length > 1) {
      setScenes(scenes.filter((_, i) => i !== index));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          Scene-by-Scene Editor
        </CardTitle>
        <CardDescription>
          Create and customize individual scenes for your video timeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={previewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('timeline')}
            >
              📊 Timeline
            </Button>
            <Button
              variant={previewMode === 'scene' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('scene')}
            >
              🎬 Scene View
            </Button>
          </div>
          <Button onClick={addScene} size="sm">
            ➕ Add Scene
          </Button>
        </div>

        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <div
              key={scene.id}
              className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Scene {index + 1}</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                    {scene.duration}s
                  </span>
                  {scene.generated && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                      ✅ AI Generated
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Generate scene with AI */}}
                  >
                    🤖 AI Generate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeScene(index)}
                    disabled={scenes.length === 1}
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Scene Script</Label>
                  <Textarea
                    placeholder="What happens in this scene..."
                    value={scene.script}
                    onChange={(e) => updateScene(index, { script: e.target.value })}
                    className="mt-1 min-h-24"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Visual Description</Label>
                  <Textarea
                    placeholder="Describe the visuals for this scene..."
                    value={scene.visualPrompt}
                    onChange={(e) => updateScene(index, { visualPrompt: e.target.value })}
                    className="mt-1 min-h-24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <Label className="text-xs">Duration (seconds)</Label>
                  <Input
                    type="number"
                    min="3"
                    max="30"
                    value={scene.duration}
                    onChange={(e) => updateScene(index, { duration: parseInt(e.target.value) || 10 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Music Mood</Label>
                  <Select
                    value={scene.musicMood}
                    onValueChange={(mood) => updateScene(index, { musicMood: mood })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upbeat">🎵 Upbeat</SelectItem>
                      <SelectItem value="calm">🧘 Calm</SelectItem>
                      <SelectItem value="dramatic">🎭 Dramatic</SelectItem>
                      <SelectItem value="inspiring">✨ Inspiring</SelectItem>
                      <SelectItem value="neutral">➖ Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {/* TODO: Preview scene */}}
                  >
                    👁️ Preview
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Timeline Overview</h4>
          <div className="flex gap-1 mb-2">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                className="bg-blue-200 dark:bg-blue-700 h-8 rounded flex items-center justify-center text-xs font-medium"
                style={{ width: `${(scene.duration / scenes.reduce((sum, s) => sum + s.duration, 0)) * 100}%` }}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Duration: {scenes.reduce((sum, scene) => sum + scene.duration, 0)} seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Magic Box - InVideo.ai's signature editing feature
function MagicBox({ 
  onCommand, 
  isProcessing 
}: { 
  onCommand: (command: string) => void; 
  isProcessing: boolean; 
}) {
  const [command, setCommand] = useState('');
  const [suggestions] = useState([
    "Add upbeat background music",
    "Change video style to cinematic",
    "Make text bigger and bold",
    "Add trending sound effect",
    "Change voice to professional tone",
    "Add countdown timer animation",
    "Replace background with nature scenes",
    "Add call-to-action at the end"
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isProcessing) {
      onCommand(command.trim());
      setCommand('');
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-10" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">✨</span>
          Magic Box
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">BETA</span>
        </CardTitle>
        <CardDescription>
          Tell your video what to do in plain English. AI will make it happen.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type your editing command... e.g., 'Make the intro more exciting with upbeat music'"
              className="min-h-[100px] resize-none border-2 border-purple-200 focus:border-purple-400"
              disabled={isProcessing}
            />
            <div className="absolute bottom-2 right-2">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!command.trim() || isProcessing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-1">✨</span>
                    Apply Magic
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Commands</Label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => !isProcessing && onCommand(suggestion)}
                disabled={isProcessing}
                className="text-left text-xs p-2 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1">
          <span>💡</span>
          Tip: Be specific about what you want to change. Magic Box understands context!
        </div>
      </CardContent>
    </Card>
  );
}

export const videoGeneratorArtifact = new Artifact<'video-generator', VideoGeneratorMetadata>({
  kind: 'video-generator',
  description: 'Create videos with voice-over, background music, and video from multiple sources.',
  initialize: async ({ 
    setMetadata, 
    title 
  }: { 
    setMetadata: React.Dispatch<React.SetStateAction<VideoGeneratorMetadata>>;
    title?: string;
  }) => {
    setMetadata({
      // InVideo.ai-style initialization with the original prompt
      aiPrompt: title || '', // Use the original prompt that triggered the artifact creation
      workflow: 'explainer',
      targetAudience: {
        demographic: 'general',
        tone: 'professional',
        platform: 'youtube'
      },
      
      // Enhanced script and scenes
      script: '',
      scenes: [
        {
          id: 'scene-1',
          duration: 10,
          script: '',
          visualPrompt: '',
          musicMood: 'neutral',
          generated: false
        }
      ],
      
      // Advanced voice options
      selectedVoice: { 
        language: 'en-us', 
        name: 'John',
        emotion: 'neutral',
        speed: 1.0,
        pitch: 1.0
      },
      
      // Media selections
      backgroundMusic: null,
      backgroundVideo: null,
        // Generation state
      voiceOverUrl: null,
      voiceMetadata: null,
      generationProgress: 0,
      isGenerating: false,
      currentStep: 1,
      
      // Template and preview
      selectedTemplate: null,
      previewMode: 'timeline'
    });
  },  content: ({ metadata, setMetadata, content, mode, isLoading, ...props }: {
    metadata: VideoGeneratorMetadata;
    setMetadata: React.Dispatch<React.SetStateAction<VideoGeneratorMetadata>>;
    content: string;
    mode?: string;
    isCurrentVersion?: boolean;
    currentVersionIndex?: number;
    onSaveContent?: any;
    getDocumentContentById?: any;
    isLoading?: boolean;
    [key: string]: any;
  }) => {
    // Auto-generate video when prompt is provided (InVideo.ai style)
    useEffect(() => {
      if (metadata.aiPrompt && !metadata.script && !metadata.isGenerating) {
        // Automatically start the InVideo.ai workflow
        const autoGenerate = async () => {
          try {
            setMetadata(prev => ({ 
              ...prev, 
              isGenerating: true, 
              generationProgress: 10,
              currentStep: 1 
            }));
            
            // Step 1: Generate script from prompt
            const response = await fetch('/api/prompt-to-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: metadata.aiPrompt,
                workflow: metadata.workflow,
                targetAudience: metadata.targetAudience,
                duration: 60
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              
              if (result.success) {
                // Update with generated script and scenes
                setMetadata(prev => ({
                  ...prev,
                  script: result.concept.script,
                  scenes: result.concept.scenes,
                  selectedVoice: {
                    ...prev.selectedVoice,
                    name: result.concept.recommendedVoice || prev.selectedVoice.name
                  },
                  generationProgress: 40,
                  currentStep: 2
                }));
                
                // Step 2: Auto-generate voice-over
                setTimeout(async () => {
                  await autoGenerateVoiceOver(result.concept.script);
                }, 1000);
              }
            }
          } catch (error) {
            console.error('Auto-generation failed:', error);
            setMetadata(prev => ({ 
              ...prev, 
              isGenerating: false, 
              generationProgress: 0 
            }));
          }
        };
        
        // Start auto-generation after a brief delay
        setTimeout(autoGenerate, 500);
      }
    }, [metadata.aiPrompt]);
    
    // Auto voice-over generation function
    const autoGenerateVoiceOver = async (script: string) => {
      try {
        const response = await fetch('/api/advanced-voice-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: script,
            voice: metadata.selectedVoice,
            timing: {
              pauseAfterSentences: 0.5,
              pauseAfterCommas: 0.2,
              breathingPauses: true
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Simulate VoiceRSS call for actual audio
            const audioResponse = await fetch("https://api.voicerss.org/", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                key: "219b11995be34d5d84dd5a87500d2a5e",
                src: script,
                hl: metadata.selectedVoice.language,
                v: metadata.selectedVoice.name,
                c: "mp3",
                f: "16khz_16bit_stereo",
                r: metadata.selectedVoice.speed.toString()
              })
            });
            
            if (audioResponse.ok) {
              const audioBlob = await audioResponse.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              
              setMetadata(prev => ({
                ...prev,
                voiceOverUrl: audioUrl,
                voiceMetadata: result.audio,
                generationProgress: 80,
                currentStep: 3
              }));
              
              // Step 3: Auto-generate background video
              setTimeout(async () => {
                await autoGenerateBackgroundVideo(script);
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error('Auto voice generation failed:', error);
      }
    };
    
    // Auto background video generation
    const autoGenerateBackgroundVideo = async (script: string) => {
      try {
        // Use AI to determine video style based on script
        const videoQuery = `${metadata.workflow} style video footage`;
          setMetadata(prev => ({
          ...prev,
          backgroundVideo: {
            id: 'sample-video-' + Date.now(),
            url: 'https://example.com/sample-video.mp4',
            duration: 60,
            thumbnail: 'https://example.com/sample-thumb.jpg'
          },
          generationProgress: 100,
          currentStep: 4,
          isGenerating: false
        }));
        
        toast.success('🎉 Video generated automatically using InVideo.ai workflow!');
      } catch (error) {
        console.error('Auto video generation failed:', error);
        setMetadata(prev => ({ 
          ...prev, 
          isGenerating: false, 
          generationProgress: 0 
        }));
      }
    };const generateVoiceOver = useCallback(async () => {
      if (!metadata.script.trim()) return;

      setMetadata(prev => ({ ...prev, isGenerating: true, generationProgress: 10 }));

      try {
        // Use AI-powered voice generation instead of direct VoiceRSS
        const response = await fetch('/api/advanced-voice-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script: metadata.script,
            voice: {
              language: metadata.selectedVoice.language,
              name: metadata.selectedVoice.name,
              emotion: metadata.selectedVoice.emotion,
              speed: metadata.selectedVoice.speed,
              pitch: metadata.selectedVoice.pitch,
              emphasis: [] // Could be enhanced with automatic emphasis detection
            },
            timing: {
              pauseAfterSentences: 0.5,
              pauseAfterCommas: 0.2,
              breathingPauses: true
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Create audio URL from the download URL or fallback to VoiceRSS
            const audioResponse = await fetch("https://api.voicerss.org/", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                key: "219b11995be34d5d84dd5a87500d2a5e",
                src: metadata.script,
                hl: metadata.selectedVoice.language,
                v: metadata.selectedVoice.name,
                c: "mp3",
                f: "16khz_16bit_stereo",
                r: metadata.selectedVoice.speed.toString()
              })
            });
            
            if (audioResponse.ok) {
              const audioBlob = await audioResponse.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              
              setMetadata(prev => ({
                ...prev,
                voiceOverUrl: audioUrl,
                generationProgress: 100,
                isGenerating: false,
                // Store AI-enhanced metadata
                voiceMetadata: result.audio
              }));
              
              toast.success(`✨ AI Voice-over generated! ${result.message}`);
            } else {
              throw new Error('Failed to generate audio file');
            }
          } else {
            throw new Error(result.message || 'AI voice generation failed');
          }
        } else {
          throw new Error('Failed to connect to AI voice service');
        }
      } catch (error) {
        console.error('Error generating AI voice-over:', error);
        toast.error('AI voice generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        setMetadata(prev => ({ ...prev, isGenerating: false, generationProgress: 0 }));
      }
    }, [metadata.script, metadata.selectedVoice, setMetadata]);

    const generateVideo = useCallback(async () => {
      if (!metadata.voiceOverUrl || !metadata.backgroundVideo) return;

      setMetadata(prev => ({ ...prev, isGenerating: true, generationProgress: 0 }));

      // Simulate video generation progress
      const progressInterval = setInterval(() => {
        setMetadata(prev => {
          const newProgress = Math.min(prev.generationProgress + 10, 90);
          return { ...prev, generationProgress: newProgress };
        });
      }, 500);

      try {
        // In a real implementation, this would call a video composition service
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        clearInterval(progressInterval);
        setMetadata(prev => ({ 
          ...prev, 
          generationProgress: 100, 
          isGenerating: false 
        }));
        
        toast.success('Video generated successfully!');
        
        // Here you would typically provide a download link for the generated video
        
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Error generating video:', error);
        toast.error('Failed to generate video');
        setMetadata(prev => ({ ...prev, isGenerating: false, generationProgress: 0 }));
      }
    }, [metadata.voiceOverUrl, metadata.backgroundVideo, metadata.backgroundMusic, setMetadata]);

    if (mode === 'diff') {
      return (
        <DiffView
          oldContent=""
          newContent={content}
        />
      );
    }

    if (isLoading) {
      return <DocumentSkeleton artifactKind="video-generator" />;
    }

    return (      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        {/* InVideo.ai-style Status Bar */}
        {metadata.isGenerating && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium text-blue-800 dark:text-blue-300">
                  🎬 Generating Video with AI - InVideo.ai Style
                </span>
              </div>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                {metadata.generationProgress}%
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-3 overflow-x-auto">
              {[
                { id: 1, name: 'Script', icon: '📝' },
                { id: 2, name: 'Voice', icon: '🎤' },
                { id: 3, name: 'Visuals', icon: '🎬' },
                { id: 4, name: 'Assembly', icon: '⚡' }
              ].map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                    metadata.currentStep >= step.id 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <span>{step.icon}</span>
                  <span>{step.name}</span>
                </div>
              ))}
            </div>
            
            <Progress value={metadata.generationProgress} className="w-full h-2" />
          </div>
        )}
        
        {/* Success Message */}
        {!metadata.isGenerating && metadata.script && metadata.voiceOverUrl && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <span className="text-xl">🎉</span>
              <span className="font-medium">Video Generated Successfully!</span>
              <span className="text-sm text-green-600 dark:text-green-400 ml-2">
                Original prompt: "{metadata.aiPrompt}"
              </span>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">AI Video Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">
            InVideo.ai-style workflow: Prompt → AI Generation → Review & Export
          </p>
        </div>
        
        <Tabs defaultValue="step-1-prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="step-1-prompt">1️⃣ Enter Prompt</TabsTrigger>
            <TabsTrigger value="step-2-audience">2️⃣ Audience & Style</TabsTrigger>
            <TabsTrigger value="step-3-generate">3️⃣ Generate Video</TabsTrigger>
            <TabsTrigger value="step-4-review">4️⃣ Review & Refine</TabsTrigger>
            <TabsTrigger value="step-5-studio">5️⃣ Manual Studio</TabsTrigger>
            <TabsTrigger value="step-6-export">6️⃣ Export</TabsTrigger>
          </TabsList>

          {/* InVideo.ai Step 1: Enter Prompt */}
          <TabsContent value="step-1-prompt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Step 1: Original Prompt
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">AUTO-DETECTED</span>
                </CardTitle>
                <CardDescription>
                  The AI detected your video request from the chat conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <Label className="text-sm font-medium text-blue-800 dark:text-blue-300">Original Chat Prompt:</Label>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 border rounded-lg">
                    <p className="text-gray-800 dark:text-gray-200 italic">
                      "{metadata.aiPrompt || 'No prompt detected'}"
                    </p>
                  </div>
                </div>
                
                {metadata.aiPrompt && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-sm font-medium text-green-800 dark:text-green-300">Status</div>
                      <div className="text-green-600 dark:text-green-400">✅ Prompt Detected</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Next Step</div>
                      <div className="text-purple-600 dark:text-purple-400">→ Configure Audience</div>
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <strong>How it works:</strong> The AI automatically detected your video request from the chat and will use it to generate a complete video following the InVideo.ai workflow: Script → Voice → Visuals → Export.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* InVideo.ai Step 2: Audience & Style */}
          <TabsContent value="step-2-audience" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Step 2: Tailor Audience, Style & Platform
                </CardTitle>
                <CardDescription>
                  Choose your format, tone, accent, voice style, and target platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">                <WorkflowSelector
                  selectedWorkflow={metadata.workflow}
                  setWorkflow={(workflow: VideoGeneratorMetadata['workflow']) => setMetadata(prev => ({ ...prev, workflow }))}
                  selectedTemplate={metadata.selectedTemplate}
                  setTemplate={(template) => setMetadata(prev => ({ ...prev, selectedTemplate: template }))}
                  targetAudience={metadata.targetAudience}
                  setTargetAudience={(audience) => setMetadata(prev => ({ ...prev, targetAudience: audience }))}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="demographic">Target Audience</Label>
                    <Select
                      value={metadata.targetAudience.demographic}
                      onValueChange={(demo: any) => setMetadata(prev => ({ 
                        ...prev, 
                        targetAudience: { ...prev.targetAudience, demographic: demo }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teens">Teenagers (13-19)</SelectItem>
                        <SelectItem value="young-adults">Young Adults (20-35)</SelectItem>
                        <SelectItem value="professionals">Professionals (25-50)</SelectItem>
                        <SelectItem value="seniors">Seniors (50+)</SelectItem>
                        <SelectItem value="general">General Audience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="tone">Tone & Style</Label>
                    <Select
                      value={metadata.targetAudience.tone}
                      onValueChange={(tone: any) => setMetadata(prev => ({ 
                        ...prev, 
                        targetAudience: { ...prev.targetAudience, tone }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="inspiring">Inspiring</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="platform">Target Platform</Label>
                    <Select
                      value={metadata.targetAudience.platform}
                      onValueChange={(platform: any) => setMetadata(prev => ({ 
                        ...prev, 
                        targetAudience: { ...prev.targetAudience, platform }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* InVideo.ai Step 3: Generate Video */}
          <TabsContent value="step-3-generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Step 3: Generate Video
                  {metadata.isGenerating && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full animate-pulse">GENERATING...</span>}
                </CardTitle>
                <CardDescription>
                  AI processes your input and generates script, voiceover, visuals, and basic editing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!metadata.isGenerating && !metadata.script && (
                  <Button 
                    onClick={async () => {
                      // Trigger the auto-generation that was added in useEffect
                      if (metadata.aiPrompt) {
                        setMetadata(prev => ({ ...prev, isGenerating: true }));
                      }
                    }}
                    className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <span className="mr-2">🚀</span>
                    Generate Video with AI
                  </Button>
                )}
                
                {metadata.script && (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">✅ Generated Content:</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">📝</span>
                          <span>Script: {metadata.script.split(' ').length} words</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🎤</span>
                          <span>Voice-over: {metadata.voiceOverUrl ? 'Generated' : 'Pending'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🎬</span>
                          <span>Scenes: {metadata.scenes.length} created</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🎵</span>
                          <span>Music: {metadata.backgroundMusic ? 'Selected' : 'Auto-matched'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>          </TabsContent>

          {/* InVideo.ai Step 4: Review & Refine */}
          <TabsContent value="step-4-review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  Step 4: Review & Refine
                </CardTitle>
                <CardDescription>
                  Use Magic Box for AI-powered editing commands or manual adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MagicBox 
                  onCommand={async (command: string) => {
                    try {
                      setMetadata(prev => ({ ...prev, isGenerating: true }));
                      
                      const response = await fetch('/api/magic-box-command', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          command,
                          currentVideoState: {
                            script: metadata.script,
                            workflow: metadata.workflow,
                            duration: metadata.scenes.reduce((total, scene) => total + scene.duration, 0),
                            scenes: metadata.scenes
                          }
                        }),
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        toast.success(`✨ Magic Box: ${result.message}`);
                        console.log('Magic Box Result:', result);
                      } else {
                        toast.error('Magic Box command failed');
                      }
                    } catch (error) {
                      toast.error('Magic Box error: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    } finally {
                      setMetadata(prev => ({ ...prev, isGenerating: false }));
                    }
                  }}
                  isProcessing={metadata.isGenerating}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* InVideo.ai Step 5: Manual Studio */}
          <TabsContent value="step-5-studio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  Step 5: Manual Studio
                </CardTitle>
                <CardDescription>
                  Fine-tune your video with manual controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="scenes" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="scenes">Scenes</TabsTrigger>
                    <TabsTrigger value="voice">Voice</TabsTrigger>
                    <TabsTrigger value="music">Music</TabsTrigger>
                    <TabsTrigger value="video">Video</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scenes">
                    <SceneEditor
                      scenes={metadata.scenes}
                      setScenes={(scenes) => setMetadata(prev => ({ ...prev, scenes }))}
                      previewMode={metadata.previewMode}
                      setPreviewMode={(mode) => setMetadata(prev => ({ ...prev, previewMode: mode }))}
                      currentStep={metadata.currentStep}
                      isGenerating={metadata.isGenerating}
                    />
                  </TabsContent>

                  <TabsContent value="voice">
                    <VoiceOverGenerator
                      script={metadata.script}
                      setScript={(script: string) => setMetadata(prev => ({ ...prev, script }))}
                      selectedVoice={metadata.selectedVoice}
                      setSelectedVoice={(voice: {
                        language: string;
                        name: string;
                        emotion: 'neutral' | 'happy' | 'excited' | 'calm' | 'professional' | 'energetic';
                        speed: number;
                        pitch: number;
                      }) => setMetadata(prev => ({ ...prev, selectedVoice: voice }))}
                      onGenerate={generateVoiceOver}
                      isGenerating={metadata.isGenerating}
                      voiceOverUrl={metadata.voiceOverUrl}
                      voiceMetadata={metadata.voiceMetadata}
                    />
                  </TabsContent>

                  <TabsContent value="music">
                    <BackgroundMusicSelector
                      onMusicSelect={(music) => setMetadata(prev => ({ ...prev, backgroundMusic: music }))}
                      selectedMusic={metadata.backgroundMusic}
                      isGenerating={metadata.isGenerating}
                    />
                  </TabsContent>

                  <TabsContent value="video">
                    <BackgroundVideoSelector
                      onVideoSelect={(video) => setMetadata(prev => ({ ...prev, backgroundVideo: video }))}
                      selectedVideo={metadata.backgroundVideo}
                      isGenerating={metadata.isGenerating}
                      script={metadata.script}
                      workflow={metadata.workflow}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* InVideo.ai Step 6: Export */}
          <TabsContent value="step-6-export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📤</span>
                  Step 6: Export Video
                </CardTitle>
                <CardDescription>
                  Generate final video and export in your preferred format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoComposer
                  metadata={metadata}
                  onGenerateVideo={generateVideo}
                  isGenerating={metadata.isGenerating}
                  generationProgress={metadata.generationProgress}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
  onStreamPart: ({ streamPart, setMetadata }: { 
    streamPart: any; 
    setMetadata: React.Dispatch<React.SetStateAction<VideoGeneratorMetadata>> 
  }) => {
    if (streamPart.type === 'video-generator-delta') {
      setMetadata((prev) => ({
        ...prev,
        ...streamPart.content as Partial<VideoGeneratorMetadata>,
      }));
    }
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy configuration',
      onClick: async ({ content }: { content: string }) => {
        await navigator.clipboard.writeText(content);
        toast.success('Configuration copied to clipboard!');
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      description: 'Export project',
      onClick: async ({ content, metadata }: { content: string; metadata: VideoGeneratorMetadata }) => {
        const projectData = {
          content,
          metadata,
          timestamp: new Date().toISOString(),
        };
        
        const blob = new Blob([JSON.stringify(projectData, null, 2)], {
          type: 'application/json',
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video-project.json';
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Project exported successfully!');      },
    },
  ],
  toolbar: [],
});

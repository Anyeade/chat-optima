/**
 * Auto Pexels Image Selection Utility
 * Automatically selects 2 images per category from the pre-stored Pexels images JSON
 */

import * as fs from 'fs';
import * as path from 'path';

export interface PexelsImage {
  id: number;
  category: string;
  use_case: string;
  url: string;
  large_url: string;
  medium_url: string;
  small_url: string;
  tiny_url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  width: number;
  height: number;
  orientation: string;
  custom_id: string;
  category_sequence: number;
}

export interface PexelsImageData {
  total_images: number;
  use_cases: string[];
  categories: {
    [use_case: string]: string[];
  };
  fetched_at: string;
  images: PexelsImage[];
}

export interface SelectedImages {
  ecommerce: { [category: string]: PexelsImage[] };
  backgrounds: { [category: string]: PexelsImage[] };
  profiles: { [category: string]: PexelsImage[] };
  total_count: number;
  summary: string;
}

/**
 * Load and parse the Pexels images JSON file
 */
function loadPexelsImagesData(): PexelsImageData {
  const dataPath = path.join(process.cwd(), 'data', 'pexels-images.json');
  
  if (!fs.existsSync(dataPath)) {
    throw new Error('Pexels images data file not found. Please ensure data/pexels-images.json exists.');
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData) as PexelsImageData;
}

/**
 * Select 2 images per category from each use case
 */
export function selectAutoImages(): SelectedImages {
  const data = loadPexelsImagesData();
  const result: SelectedImages = {
    ecommerce: {},
    backgrounds: {},
    profiles: {},
    total_count: 0,
    summary: ''
  };

  // Process each use case
  data.use_cases.forEach(useCase => {
    const categories = data.categories[useCase] || [];
    
    categories.forEach(category => {
      // Find images for this category
      const categoryImages = data.images.filter(img => 
        img.use_case === useCase && img.category === category
      );
      
      // Select first 2 images from this category
      const selectedImages = categoryImages.slice(0, 2);
      
      if (selectedImages.length > 0) {
        if (useCase === 'ecommerce') {
          result.ecommerce[category] = selectedImages;
        } else if (useCase === 'backgrounds') {
          result.backgrounds[category] = selectedImages;
        } else if (useCase === 'profiles') {
          result.profiles[category] = selectedImages;
        }
        
        result.total_count += selectedImages.length;
      }
    });
  });

  // Generate summary
  const ecommerceCount = Object.keys(result.ecommerce).length * 2;
  const backgroundsCount = Object.keys(result.backgrounds).length * 2;
  const profilesCount = Object.keys(result.profiles).length * 2;
  
  result.summary = `Auto-selected ${result.total_count} Pexels images: ${ecommerceCount} ecommerce, ${backgroundsCount} backgrounds, ${profilesCount} profiles (2 per category)`;

  return result;
}

/**
 * Format images for AI prompt injection
 */
export function formatImagesForPrompt(selectedImages: SelectedImages): string {
  let prompt = `\n\n🖼️ **AUTO-ATTACHED PEXELS IMAGES LIBRARY** 📸\n\n`;
  prompt += `**🚨 CRITICAL: ${selectedImages.total_count} PROFESSIONAL IMAGES AUTO-SELECTED FOR YOUR USE 🚨**\n\n`;
  prompt += `**MANDATORY USAGE: You MUST use these images exclusively. NO external image services allowed!**\n\n`;

  // Ecommerce section
  if (Object.keys(selectedImages.ecommerce).length > 0) {
    prompt += `### 🛒 **ECOMMERCE IMAGES** (${Object.keys(selectedImages.ecommerce).length * 2} images)\n`;
    prompt += `**USE FOR: Product showcases, shopping sections, commercial content, feature highlights**\n`;
    Object.entries(selectedImages.ecommerce).forEach(([category, images]) => {
      prompt += `\n**${category.toUpperCase()} CATEGORY:**\n`;
      images.forEach((img, index) => {
        prompt += `• **Image ${index + 1}**: ${img.medium_url}\n`;
        prompt += `  - Alt: "${img.alt}"\n`;
        prompt += `  - Large: ${img.large_url}\n`;
        prompt += `  - Small: ${img.small_url}\n`;
      });
    });
    prompt += `\n`;
  }

  // Backgrounds section
  if (Object.keys(selectedImages.backgrounds).length > 0) {
    prompt += `### 🎨 **BACKGROUND IMAGES** (${Object.keys(selectedImages.backgrounds).length * 2} images)\n`;
    prompt += `**USE FOR: Hero backgrounds, section backgrounds, decorative elements, visual depth**\n`;
    Object.entries(selectedImages.backgrounds).forEach(([category, images]) => {
      prompt += `\n**${category.toUpperCase()} CATEGORY:**\n`;
      images.forEach((img, index) => {
        prompt += `• **Image ${index + 1}**: ${img.medium_url}\n`;
        prompt += `  - Alt: "${img.alt}"\n`;
        prompt += `  - Large: ${img.large_url}\n`;
        prompt += `  - Small: ${img.small_url}\n`;
      });
    });
    prompt += `\n`;
  }

  // Profiles section
  if (Object.keys(selectedImages.profiles).length > 0) {
    prompt += `### 👤 **PROFILE IMAGES** (${Object.keys(selectedImages.profiles).length * 2} images)\n`;
    prompt += `**USE FOR: Team sections, testimonials, user avatars, about pages, professional headshots**\n`;
    Object.entries(selectedImages.profiles).forEach(([category, images]) => {
      prompt += `\n**${category.toUpperCase()} CATEGORY:**\n`;
      images.forEach((img, index) => {
        prompt += `• **Image ${index + 1}**: ${img.medium_url}\n`;
        prompt += `  - Alt: "${img.alt}"\n`;
        prompt += `  - Large: ${img.large_url}\n`;
        prompt += `  - Small: ${img.small_url}\n`;
      });
    });
    prompt += `\n`;
  }

  prompt += `### 🎯 **MANDATORY IMPLEMENTATION GUIDE:**\n`;
  prompt += `\n**🚨 EXCLUSIVE SOURCE REQUIREMENT 🚨**\n`;
  prompt += `- **ONLY** use images from the library above - NO external services!\n`;
  prompt += `- **FORBIDDEN**: Picsum, Lorem Space, placeholder.com, or any other image sources\n`;
  prompt += `- **REQUIRED**: Every single image must come from the auto-attached collection\n\n`;

  prompt += `**📐 SIZE SELECTION STRATEGY:**\n`;
  prompt += `- **large_url**: For hero sections, feature banners, primary focal points\n`;
  prompt += `- **medium_url**: For standard content images, product displays, general use\n`;
  prompt += `- **small_url**: For thumbnails, avatars, compact layouts\n\n`;

  prompt += `**🎨 DESIGN INTEGRATION TACTICS:**\n`;
  prompt += `- **Hero Backgrounds**: Use abstract/minimalist backgrounds with text overlays\n`;
  prompt += `- **Product Showcases**: Use ecommerce images for authentic commercial appeal\n`;
  prompt += `- **Team/About Sections**: Use professional profile images for credibility\n`;
  prompt += `- **Visual Variety**: Mix categories to create rich, professional layouts\n`;
  prompt += `- **Performance**: Add loading="lazy" for images below the fold\n`;
  prompt += `- **Accessibility**: Use the provided alt text descriptions\n\n`;

  prompt += `**✅ QUALITY ASSURANCE CHECKLIST:**\n`;
  prompt += `- [ ] Every image source URL starts with images.pexels.com\n`;
  prompt += `- [ ] No placeholder or external image services used\n`;
  prompt += `- [ ] Images selected strategically match their section purpose\n`;
  prompt += `- [ ] Proper alt text included for accessibility\n`;
  prompt += `- [ ] Responsive design considerations implemented\n\n`;

  return prompt;
}

/**
 * Get a specific image by category and index
 */
export function getImageByCategory(selectedImages: SelectedImages, useCase: string, category: string, index: number = 0): PexelsImage | null {
  let categoryImages: PexelsImage[] = [];
  
  if (useCase === 'ecommerce' && selectedImages.ecommerce[category]) {
    categoryImages = selectedImages.ecommerce[category];
  } else if (useCase === 'backgrounds' && selectedImages.backgrounds[category]) {
    categoryImages = selectedImages.backgrounds[category];
  } else if (useCase === 'profiles' && selectedImages.profiles[category]) {
    categoryImages = selectedImages.profiles[category];
  }
  
  return categoryImages[index] || null;
}

/**
 * Get random image from any category
 */
export function getRandomImage(selectedImages: SelectedImages): PexelsImage | null {
  const allImages: PexelsImage[] = [];
  
  // Collect all images
  Object.values(selectedImages.ecommerce).forEach(images => allImages.push(...images));
  Object.values(selectedImages.backgrounds).forEach(images => allImages.push(...images));
  Object.values(selectedImages.profiles).forEach(images => allImages.push(...images));
  
  if (allImages.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * allImages.length);
  return allImages[randomIndex];
}

/**
 * Create JSON data for the data stream (to show in UI)
 */
export function createImageDataForStream(selectedImages: SelectedImages) {
  return {
    type: 'pexels-auto-images',
    content: JSON.stringify({
      message: selectedImages.summary,
      total_images: selectedImages.total_count,
      categories: {
        ecommerce: Object.keys(selectedImages.ecommerce).length,
        backgrounds: Object.keys(selectedImages.backgrounds).length,
        profiles: Object.keys(selectedImages.profiles).length
      },
      sample_images: {
        ecommerce: Object.entries(selectedImages.ecommerce).slice(0, 2).map(([cat, imgs]) => ({
          category: cat,
          image: imgs[0]
        })),
        backgrounds: Object.entries(selectedImages.backgrounds).slice(0, 2).map(([cat, imgs]) => ({
          category: cat,
          image: imgs[0]
        })),
        profiles: Object.entries(selectedImages.profiles).slice(0, 2).map(([cat, imgs]) => ({
          category: cat,
          image: imgs[0]
        }))
      }
    })
  };
}

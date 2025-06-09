import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PEXELS_API_KEY = 'sbelmCbU2CBEumLwvDAiTAEA5JyJJQWhaf4IXHdfeCHpNBjkUAjauGoC';

// Categories to fetch images for specific use cases
const imageCategories = {
  ecommerce: [
    'products',
    'shopping',
    'retail',
    'fashion',
    'electronics',
    'lifestyle products',
    'home decor',
    'accessories',
    'clothing',
    'gadgets'
  ],
  backgrounds: [
    'abstract',
    'minimalist',
    'texture',
    'gradient',
    'geometric',
    'nature landscape',
    'clean background',
    'solid color',
    'pattern',
    'smooth surface'
  ],
  profiles: [
    'business person',
    'professional headshot',
    'portrait',
    'avatar',
    'person smiling',
    'face',
    'professional',
    'user',
    'people portrait',
    'headshot'
  ]
};

// Function to make API request
function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
  });
}

// Function to fetch images for a category with specific orientation
async function fetchImagesForCategory(category, useCase, perPage = 10) {
  // Determine orientation based on use case
  let orientation = 'landscape';
  if (useCase === 'profiles') {
    orientation = 'portrait';
  } else if (useCase === 'backgrounds') {
    orientation = 'landscape';
  }
  
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(category)}&per_page=${perPage}&orientation=${orientation}`;
  const headers = {
    'Authorization': PEXELS_API_KEY
  };
  
  console.log(`Fetching ${useCase} images for: ${category} (${orientation})`);
  
  try {
    const response = await makeRequest(url, headers);
    
    if (response.photos && response.photos.length > 0) {
      return response.photos.map(photo => ({
        id: photo.id,
        category: category,
        use_case: useCase,
        url: photo.src.original,
        large_url: photo.src.large2x || photo.src.large,
        medium_url: photo.src.medium,
        small_url: photo.src.small,
        tiny_url: photo.src.tiny,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        alt: photo.alt || `${category} ${useCase} image`,
        width: photo.width,
        height: photo.height,
        orientation: orientation
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching ${useCase} images for ${category}:`, error.message);
    return [];
  }
}

// Main function
async function main() {
  console.log('Starting Pexels image fetch for e-commerce, backgrounds, and profile images...');
  
  const allImages = [];
  const categoryCounters = {}; // Track custom IDs per category
  let requestCount = 0;
  
  // Initialize counters for each category
  Object.values(imageCategories).flat().forEach(category => {
    categoryCounters[category] = 0;
  });
  
  // Fetch images for each use case
  for (const [useCase, categories] of Object.entries(imageCategories)) {
    console.log(`\n🔄 Fetching ${useCase} images...`);
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      try {
        // Adjust quantity based on use case
        let perPage = 20; // Default
        if (useCase === 'ecommerce') perPage = 25; // More variety for products
        if (useCase === 'backgrounds') perPage = 15; // Fewer but high quality
        if (useCase === 'profiles') perPage = 20; // Good selection of people
        
        const images = await fetchImagesForCategory(category, useCase, perPage);
        
        // Add custom sequential IDs for each category
        images.forEach(image => {
          categoryCounters[category]++;
          image.custom_id = `${category.replace(/\s+/g, '_').toLowerCase()}_${categoryCounters[category]}`;
          image.category_sequence = categoryCounters[category];
        });
        
        allImages.push(...images);
        
        console.log(`✅ Fetched ${images.length} ${useCase} images for "${category}" (IDs: ${category.replace(/\s+/g, '_').toLowerCase()}_1 to ${category.replace(/\s+/g, '_').toLowerCase()}_${categoryCounters[category]})`);
        requestCount++;
        
        // Add delay between requests to respect rate limits (1.5 seconds)
        if (requestCount % 5 === 0) {
          console.log('⏱️  Taking a longer break to respect rate limits...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } catch (error) {
        console.error(`❌ Failed to fetch ${useCase} images for ${category}:`, error.message);
      }
    }
  }
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to JSON file
  const outputFile = path.join(outputDir, 'pexels-images.json');
  const outputData = {
    total_images: allImages.length,
    use_cases: Object.keys(imageCategories),
    categories: imageCategories,
    fetched_at: new Date().toISOString(),
    images: allImages
  };
  
  try {
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`\n🎉 Successfully saved ${allImages.length} images to ${outputFile}`);
    
    // Print summary by use case
    console.log('\n📊 Summary by use case:');
    Object.keys(imageCategories).forEach(useCase => {
      const count = allImages.filter(img => img.use_case === useCase).length;
      console.log(`  ${useCase}: ${count} images`);
    });
    
    // Print summary by category
    console.log('\n📋 Detailed breakdown:');
    Object.entries(imageCategories).forEach(([useCase, categories]) => {
      console.log(`\n  ${useCase.toUpperCase()}:`);
      categories.forEach(category => {
        const count = allImages.filter(img => img.category === category && img.use_case === useCase).length;
        console.log(`    ${category}: ${count} images`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error writing to file:', error.message);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
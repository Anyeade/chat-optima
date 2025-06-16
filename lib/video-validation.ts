// Video validation utilities - matches the working logic from test-video-apis.cjs

export interface VideoValidationResult {
  valid: boolean;
  format?: string;
  reason?: string;
  headerHex?: string;
}

// Test if video file is valid MP4 - EXACT COPY from working test-video-apis.cjs
export function validateVideoFile(videoData: Uint8Array): VideoValidationResult {
  if (!videoData || videoData.byteLength < 1024) {
    return { valid: false, reason: 'File too small or empty' };
  }
  
  // Check for MP4 file signature (ftyp box)
  const header = Array.from(videoData.slice(0, 12));
  
  // MP4 files typically start with ftyp box at offset 4-7
  const hasMP4Header = (
    header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70
  );
  
  if (hasMP4Header) {
    return { valid: true, format: 'MP4' };
  }
  
  // Check for other video formats
  if (header[0] === 0x00 && header[1] === 0x00 && header[2] === 0x00 && header[3] >= 0x14) {
    return { valid: true, format: 'Possible MP4' };
  }
  
  return { 
    valid: false, 
    reason: 'Invalid video format',
    headerHex: header.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join(' ')
  };
}

// Enhanced validation that handles content-type issues - same logic as working test
export function validateVideoResponse(response: Response): void {
  const contentType = response.headers.get('content-type');
  
  // Many video services don't set content-type properly, so we'll be more lenient
  // We'll validate the actual file content instead (same as test-video-apis.cjs)
  console.log(`Video Content-Type: ${contentType || 'not set'} (proceeding with content validation)`);
  
  // Don't throw errors for missing content-type - let file validation handle it
}

// Video download validation that matches the working test exactly
export async function downloadAndValidateVideo(url: string): Promise<{
  success: boolean;
  videoData?: Uint8Array;
  error?: string;
  validation?: VideoValidationResult;
}> {
  try {
    const downloadResponse = await fetch(url);
    
    if (!downloadResponse.ok) {
      return {
        success: false,
        error: `Download failed: ${downloadResponse.status}`
      };
    }
    
    const contentType = downloadResponse.headers.get('content-type');
    const contentLength = downloadResponse.headers.get('content-length');
    
    console.log(`Content-Type: ${contentType}`);
    console.log(`Content-Length: ${contentLength} bytes`);
    
    // Use the same lenient validation as the working test
    validateVideoResponse(downloadResponse);
    
    // Download the video data
    const videoArrayBuffer = await downloadResponse.arrayBuffer();
    const videoData = new Uint8Array(videoArrayBuffer);
    
    const validation = validateVideoFile(videoData);
    
    if (validation.valid) {
      console.log(`✅ Valid ${validation.format} file (${videoData.byteLength} bytes downloaded)`);
      return {
        success: true,
        videoData,
        validation
      };
    } else {
      console.log(`❌ Invalid video: ${validation.reason}`);
      if (validation.headerHex) {
        console.log(`🔍 Header: ${validation.headerHex}`);
      }
      return {
        success: false,
        error: validation.reason,
        validation
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
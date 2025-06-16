import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { width: string; height: string } }
) {
  try {
    const { width, height } = params;
    
    // Parse dimensions
    const w = parseInt(width);
    const h = parseInt(height);
    
    if (isNaN(w) || isNaN(h) || w < 100 || h < 100 || w > 4096 || h > 4096) {
      return NextResponse.json(
        { error: 'Invalid dimensions. Width and height must be numbers between 100 and 4096' },
        { status: 400 }
      );
    }

    // Create a simple placeholder video using Canvas and MediaRecorder API
    // For now, return a redirect to a free stock video service as fallback
    
    // Option 1: Redirect to Pixabay video (free)
    const pixabayUrl = `https://pixabay.com/videos/download/video-${Math.floor(Math.random() * 100000)}_large.mp4`;
    
    // Option 2: Use a static placeholder video from public directory
    // Check if we have a placeholder video in public/videos/
    const placeholderVideoUrl = '/videos/placeholder.mp4';
    
    try {
      // Try to fetch from public directory first
      const publicVideoResponse = await fetch(new URL(placeholderVideoUrl, request.url));
      if (publicVideoResponse.ok) {
        // Redirect to our local placeholder video
        return NextResponse.redirect(new URL(placeholderVideoUrl, request.url));
      }
    } catch (err) {
      console.log('Local placeholder video not found');
    }

    // Option 3: Generate a simple colored video programmatically
    // For now, return a sample video URL from a reliable free source
    
    // Use Pexels Video API as fallback (they have free videos)
    const pexelsVideoIds = [
      '3045163', '2278095', '2792010', '2920748', '3571264', '2499611',
      '3045159', '2278095', '4827/download-UHD_3840_2160_30fps', '2920748'
    ];
    
    const randomVideoId = pexelsVideoIds[Math.floor(Math.random() * pexelsVideoIds.length)];
    const pexelsUrl = `https://player.vimeo.com/external/${randomVideoId}.hd.mp4?s=dummy`;
    
    // For development, return a simple HTML response that generates a video
    const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <title>Placeholder Video Generator</title>
</head>
<body>
    <canvas id="canvas" width="${w}" height="${h}"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, ${w}, ${h});
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ${w}, ${h});
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Placeholder Video', ${w}/2, ${h}/2);
        ctx.fillText('${w}x${h}', ${w}/2, ${h}/2 + 60);
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'placeholder-${w}x${h}.png';
            a.click();
        });
    </script>
</body>
</html>
    `;

    // Return 404 so the video generation system falls back to images
    return new NextResponse(null, {
      status: 404,
      statusText: 'Placeholder video not available'
    });

  } catch (error) {
    console.error('Placeholder video API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
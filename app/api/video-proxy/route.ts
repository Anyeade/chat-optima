import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL to prevent abuse
    try {
      const parsedUrl = new URL(url);
      const allowedHosts = [
        'videos.pexels.com',
        'player.vimeo.com',
        'pixabay.com',
        'cdn.pixabay.com'
      ];
      
      if (!allowedHosts.includes(parsedUrl.hostname)) {
        return NextResponse.json(
          { error: 'URL not allowed' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    console.log(`🎬 Proxying video: ${url}`);

    // Fetch the video from the external source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'video/mp4,video/*,*/*',
        'Accept-Encoding': 'identity', // Prevent compression issues
        'Range': request.headers.get('range') || 'bytes=0-' // Support range requests for video streaming
      }
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch video: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.status}` },
        { status: response.status }
      );
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges');
    const contentRange = response.headers.get('content-range');

    console.log(`✅ Video proxied successfully: ${contentType}, ${contentLength} bytes`);

    // Create response with proper headers for video streaming
    const videoResponse = new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || '',
        'Accept-Ranges': acceptRanges || 'bytes',
        'Content-Range': contentRange || '',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Range',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    });

    return videoResponse;

  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Range',
      'Access-Control-Max-Age': '86400'
    }
  });
}

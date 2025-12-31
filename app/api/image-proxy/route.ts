import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Validate that it's a Reverb image URL
  if (!imageUrl.includes('reverb.com') && !imageUrl.includes('rvb-img.reverb.com')) {
    return new NextResponse('Invalid image source', { status: 400 });
  }

  try {
    // Decode URL if needed
    const decodedUrl = decodeURIComponent(imageUrl);
    
    // Fetch the image from Reverb with proper headers
    const response = await fetch(decodedUrl, {
      headers: {
        'Referer': 'https://reverb.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Don't follow redirects that might cause issues
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText} for ${decodedUrl}`);
      return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error: any) {
    console.error('Error proxying image:', error.message, 'for URL:', imageUrl);
    return new NextResponse(`Error fetching image: ${error.message}`, { status: 500 });
  }
}


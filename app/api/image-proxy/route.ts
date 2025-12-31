import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Validate that it's a Reverb image URL (allow all reverb domains)
  const decodedUrl = decodeURIComponent(imageUrl);
  if (!decodedUrl.includes('reverb.com') && !decodedUrl.includes('rvb-img.reverb.com') && !decodedUrl.includes('img.reverb.com')) {
    console.error('Invalid image source:', decodedUrl);
    return new NextResponse('Invalid image source', { status: 400 });
  }

  try {
    // Retry logic for rate limiting
    let lastError: any = null;
    let response: Response | null = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      
      try {
        // Fetch the image from Reverb with proper headers to bypass 401
        response = await fetch(decodedUrl, {
          headers: {
            'Referer': 'https://reverb.com/',
            'Origin': 'https://reverb.com',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          redirect: 'follow',
          // Don't send credentials but mimic browser behavior
          credentials: 'omit',
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        // If it's a rate limit or unauthorized error, retry
        if (response.status === 429 || response.status === 401) {
          lastError = new Error(`${response.status === 429 ? 'Rate limited' : 'Unauthorized'} (${response.status}), attempt ${attempt + 1}/3`);
          continue;
        }
        
        // For other errors, don't retry
        console.error(`Failed to fetch image: ${response.status} ${response.statusText} for ${decodedUrl}`);
        return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
      } catch (fetchError: any) {
        lastError = fetchError;
        if (attempt === 2) {
          // Last attempt failed
          throw fetchError;
        }
      }
    }

    if (!response || !response.ok) {
      // If all retries failed with 401, return a redirect to the original URL
      // This allows the browser to fetch it directly (which might work)
      if (response?.status === 401) {
        console.warn(`401 Unauthorized for ${decodedUrl}, returning redirect to original URL`);
        return NextResponse.redirect(decodedUrl, { status: 302 });
      }
      
      console.error(`Failed to fetch image after retries: ${lastError?.message || 'Unknown error'} for ${decodedUrl}`);
      return new NextResponse(`Failed to fetch image: ${lastError?.message || 'Unknown error'}`, { status: response?.status || 500 });
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


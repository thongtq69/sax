/**
 * Get Reverb Images via their public listing API
 */
const fs = require('fs');
const path = require('path');

// Product URLs from your shop
const productUrls = [
  'https://reverb.com/item/93660207-no-tariffs-yamaha-yts-62-tenor-saxophone',
  'https://reverb.com/item/93221622-no-tariffs-vintage-yamaha-yas-62-alto-saxophone-purple-logo',
  'https://reverb.com/item/92940858-no-tariffs-yanagisawa-sc-992-curved-soprano-saxophone',
  'https://reverb.com/item/92204977-no-tariffs-yanagisawa-a-wo10-alto-saxophone',
  'https://reverb.com/item/92037908-no-tariffs-yanagisawa-s-6s-silver-soprano-saxophone',
  'https://reverb.com/item/91969125-no-tariffs-yanagisawa-s-901-soprano-saxophone',
  'https://reverb.com/item/91969046-no-tariffs-yamaha-yts-82z-tenor-saxophone',
  'https://reverb.com/item/91696205-no-tariffs-yanagisawa-a-901-alto-saxophone',
  'https://reverb.com/item/91570779-no-tariffs-yanagisawa-a-900u-alto-saxophone',
  'https://reverb.com/item/91157447-selmer-sa80-serie-2-alto-original-pads-set',
  'https://reverb.com/item/91157393-yamaha-yas-875ex-original-pads-set',
  'https://reverb.com/item/91157378-yamaha-yas-62-original-pads-set',
  'https://reverb.com/item/90566193-yamaha-original-pivot-screw-set',
  'https://reverb.com/item/90565883-yamaha-yts-62-original-spring-set',
  'https://reverb.com/item/90565753-yamaha-yts-62-original-pads-set',
  'https://reverb.com/item/90103647-no-tariffs-yamaha-yts-62ii-tenor-saxophone',
  'https://reverb.com/item/88596606-no-tariffs-selmer-reference-54-hummingbird-charlie-parker-alto-saxophone',
  'https://reverb.com/item/88197821-no-tariffs-yamaha-yts-82z-tenor-saxophone',
  'https://reverb.com/item/87418819-no-tariffs-yamaha-yts-62-tenor-saxophone-purple-logo',
  'https://reverb.com/item/86754326-no-tariffs-selmer-super-action-80-series-ii-alto-saxophone',
  'https://reverb.com/item/86130617-no-tariffs-yanagisawa-a-991-alto-saxophone',
  'https://reverb.com/item/86046556-no-tariffs-yamaha-yas-62s-silver-alto-saxophone-purple-logo',
  'https://reverb.com/item/85618577-no-tariffs-yanagisawa-a-990-elimona-alto-saxophone',
  'https://reverb.com/item/85416748-no-tariffs-yamaha-yts-82zii-v1-neck-tenor-saxophone',
  'https://reverb.com/item/85493698-no-tariffs-yanagisawa-a-900-alto-saxophone',
  'https://reverb.com/item/85493645-no-tariffs-yamaha-yts-62-tenor-saxophone-purple-logo',
  'https://reverb.com/item/84706326-no-tariffs-yamaha-yts-62ii-tenor-saxophone',
  'https://reverb.com/item/73795481-no-tariffs-yanagisawa-a-992-solid-silver-neck-alto-saxophone'
];

async function getImagesFromReverb() {
  console.log('🎷 Fetching images from Reverb API...\n');
  
  const results = [];
  
  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    const itemId = url.match(/item\/(\d+)/)?.[1];
    
    if (!itemId) {
      console.log(`[${i+1}] ✗ Could not extract ID from ${url}`);
      continue;
    }
    
    process.stdout.write(`[${i+1}/${productUrls.length}] Item ${itemId}... `);
    
    try {
      // Reverb has a public API endpoint for listings
      const apiUrl = `https://api.reverb.com/api/listings/${itemId}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/hal+json',
          'Accept-Version': '3.0',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract images
        const images = [];
        if (data.photos) {
          data.photos.forEach(photo => {
            if (photo._links?.large_crop?.href) {
              images.push(photo._links.large_crop.href);
            } else if (photo._links?.full?.href) {
              images.push(photo._links.full.href);
            }
          });
        }
        
        results.push({
          itemId,
          url,
          name: data.title || 'Unknown',
          price: data.price?.amount ? parseFloat(data.price.amount) : 0,
          description: data.description || '',
          condition: data.condition?.display_name || 'Excellent',
          images,
          make: data.make || '',
          model: data.model || '',
          year: data.year || ''
        });
        
        console.log(`✓ ${images.length} images`);
      } else {
        console.log(`✗ API error ${response.status}`);
        
        // Fallback: try to construct image URL from item ID
        results.push({
          itemId,
          url,
          images: []
        });
      }
      
    } catch (error) {
      console.log(`✗ ${error.message}`);
    }
    
    // Small delay
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Save results
  const outputPath = path.join(__dirname, '../data/reverb-images.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Done! Saved to ${outputPath}`);
  console.log(`📊 Got images for ${results.filter(r => r.images?.length > 0).length}/${results.length} products`);
  
  return results;
}

getImagesFromReverb();


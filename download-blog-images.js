// download-blog-images.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  { url: 'https://kesslerandsons.com/wp-content/uploads/signature-sax-logo.png', name: 'selmer-signature.png' },
  { url: 'https://kesslermusic.com/yanagisawa/wo/woseriessmall.jpg', name: 'yanagisawa-wo.jpg' },
  { url: 'https://kesslerandsons.com/wp-content/uploads/2016/11/buffet-prodige-premium-clarinets.jpg', name: 'buffet-prodige.jpg' },
  { url: 'https://kesslerandsons.com/wp-content/uploads/2016/05/yani_hero1.jpg', name: 'sax-finish.jpg' },
];

// Tạo thư mục nếu chưa có
const createDirectories = () => {
  const dirs = ['public/images/blog'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Download 1 file
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : require('http');
    const file = fs.createWriteStream(filepath);
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${filepath}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed: ${url} (Status: ${response.statusCode})`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

// Download tất cả
const downloadAll = async () => {
  createDirectories();
  
  console.log(`Starting download of ${images.length} blog images...\n`);
  
  for (const img of images) {
    const filepath = path.join('public', 'images', 'blog', img.name);
    try {
      await downloadImage(img.url, filepath);
    } catch (error) {
      console.error(`✗ Error: ${img.name}:`, error.message);
    }
  }
  
  console.log('\n✓ All downloads completed!');
};

downloadAll();

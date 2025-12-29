// download-images.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
    // Product 1
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030712_600x.jpg?v=1767032609', name: 'altus-1607-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7032540_600x.jpg?v=1767032609', name: 'altus-1607-hover.jpg', folder: 'products' },

    // Product 2
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030748_600x.jpg?v=1766987831', name: 'haynes-piccolo-a10751-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030747_600x.jpg?v=1766987831', name: 'haynes-piccolo-a10751-hover.jpg', folder: 'products' },

    // Product 3
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030733_600x.jpg?v=1766987434', name: 'haynes-piccolo-a10971-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030732_600x.jpg?v=1766987434', name: 'haynes-piccolo-a10971-hover.jpg', folder: 'products' },

    // Product 4
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030692_600x.jpg?v=1766973476', name: 'altus-1507-8163-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030691_600x.jpg?v=1766973476', name: 'altus-1507-8163-hover.jpg', folder: 'products' },

    // Product 5
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030671_600x.jpg?v=1766972738', name: 'altus-1507-13428-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030670_600x.jpg?v=1766972738', name: 'altus-1507-13428-hover.jpg', folder: 'products' },

    // Product 6
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030650_600x.jpg?v=1766972269', name: 'altus-1507-13974-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030649_600x.jpg?v=1766972270', name: 'altus-1507-13974-hover.jpg', folder: 'products' },

    // Product 7
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030629_600x.jpg?v=1766971550', name: 'altus-1607-12299-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030628_600x.jpg?v=1766971550', name: 'altus-1607-12299-hover.jpg', folder: 'products' },

    // Product 8
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030608_600x.jpg?v=1766971062', name: 'altus-1207-platinum-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030607_600x.jpg?v=1766971062', name: 'altus-1207-platinum-hover.jpg', folder: 'products' },

    // Product 9
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030587_600x.jpg?v=1766970282', name: 'altus-5207-gold-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030586_600x.jpg?v=1766970282', name: 'altus-5207-gold-hover.jpg', folder: 'products' },

    // Product 10
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030566_600x.jpg?v=1766970546', name: 'altus-1207-14k-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030565_600x.jpg?v=1766970546', name: 'altus-1207-14k-hover.jpg', folder: 'products' },

    // Product 11
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030544_600x.jpg?v=1766968462', name: 'altus-1507-13111-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030543_600x.jpg?v=1766968462', name: 'altus-1507-13111-hover.jpg', folder: 'products' },

    // Product 12
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030523_600x.jpg?v=1766967273', name: 'altus-1807-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030522_600x.jpg?v=1766967273', name: 'altus-1807-hover.jpg', folder: 'products' },

    // Product 13
    { url: 'https://www.brassandwinds.com/cdn/shop/files/6980292_600x.jpg?v=1766783646', name: 'selmer-sa80-alto-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/6980291_600x.jpg?v=1766783646', name: 'selmer-sa80-alto-hover.jpg', folder: 'products' },

    // Product 14
    { url: 'https://www.brassandwinds.com/cdn/shop/files/6984088_600x.jpg?v=1766783145', name: 'antigua-tenor-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/6984087_600x.jpg?v=1766783145', name: 'antigua-tenor-hover.jpg', folder: 'products' },

    // Product 15
    { url: 'https://www.brassandwinds.com/cdn/shop/files/6956931_600x.jpg?v=1766642411', name: 'selmer-sfl301-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/6956930_600x.jpg?v=1766642413', name: 'selmer-sfl301-hover.jpg', folder: 'products' },

    // Product 16
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030030_600x.jpg?v=1766637804', name: 'buffet-r13-main.jpg', folder: 'products' },
    { url: 'https://www.brassandwinds.com/cdn/shop/files/7030029_600x.jpg?v=1766637804', name: 'buffet-r13-hover.jpg', folder: 'products' },
];

// Tạo thư mục nếu chưa có
const createDirectories = () => {
    const dirs = ['public/images/products'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Download 1 file
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded: ${filepath}`);
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download: ${url} (Status: ${response.statusCode})`));
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};

// Download tất cả
const downloadAll = async () => {
    createDirectories();

    console.log(`Starting download of ${images.length} images...\n`);

    for (const img of images) {
        const filepath = path.join('public', 'images', img.folder, img.name);
        try {
            await downloadImage(img.url, filepath);
        } catch (error) {
            console.error(`✗ Error downloading ${img.name}:`, error.message);
        }
    }

    console.log('\n✓ All downloads completed!');
};

downloadAll();

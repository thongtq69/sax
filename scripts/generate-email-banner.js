const fs = require('fs');
const path = require('path');

const bannerPath = path.join(__dirname, '..', 'public', 'Banner.png');
const outputPath = path.join(__dirname, '..', 'lib', 'email-banner-base64.ts');

const bannerBuffer = fs.readFileSync(bannerPath);
const base64 = bannerBuffer.toString('base64');

const content = `// Auto-generated - DO NOT EDIT
// Run: node scripts/generate-email-banner.js
export const emailBannerBase64 = "data:image/png;base64,${base64}";
`;

fs.writeFileSync(outputPath, content);
console.log('Generated:', outputPath);
console.log('Base64 length:', base64.length);

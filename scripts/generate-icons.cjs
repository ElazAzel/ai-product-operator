const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const svg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function generate() {
  await sharp(svg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('PNG icons generated');
}

generate().catch(console.error);

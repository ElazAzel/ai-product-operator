const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const svg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function generateICO() {
  // Generate PNGs at required sizes
  const sizes = [16, 32, 48, 64, 128, 256];
  const buffers = {};
  for (const size of sizes) {
    buffers[size] = await sharp(svg).resize(size, size).png().toBuffer();
  }

  // Build ICO file
  const count = sizes.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataStart = headerSize + count * dirEntrySize;

  // Collect offsets and dir entries
  let offset = dataStart;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: 1 = icon
  header.writeUInt16LE(count, 4);  // count

  const dirEntries = [];
  const imageData = [];

  for (const size of sizes) {
    const buf = buffers[size];
    const dirEntry = Buffer.alloc(dirEntrySize);
    const w = size >= 256 ? 0 : size;
    const h = size >= 256 ? 0 : size;
    dirEntry.writeUInt8(w, 0);        // width
    dirEntry.writeUInt8(h, 1);        // height
    dirEntry.writeUInt8(0, 2);        // color count
    dirEntry.writeUInt8(0, 3);        // reserved
    dirEntry.writeUInt16LE(1, 4);     // planes
    dirEntry.writeUInt16LE(32, 6);    // bpp
    dirEntry.writeUInt32LE(buf.length, 8);   // size
    dirEntry.writeUInt32LE(offset, 12);      // offset
    offset += buf.length;

    dirEntries.push(dirEntry);
    imageData.push(buf);
  }

  const ico = Buffer.concat([header, ...dirEntries, ...imageData]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
  console.log(`favicon.ico generated (${ico.length} bytes, ${count} sizes)`);
}

generateICO().catch(console.error);

const fs = require('fs');
const path = require('path');

// A simple function to read JPG/PNG dimensions from binary headers
function getImageDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  
  if (filePath.endsWith('.png')) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    let offset = 2;
    while (offset < buffer.length) {
      const marker = buffer.readUInt16BE(offset);
      offset += 2;
      if (marker === 0xFFC0 || marker === 0xFFC2) {
        offset += 2; // skip size
        const height = buffer.readUInt16BE(offset + 1);
        const width = buffer.readUInt16BE(offset + 3);
        return { width, height };
      } else {
        const length = buffer.readUInt16BE(offset);
        offset += length;
      }
    }
  }
  return null;
}

const frontendDir = path.join(__dirname, '..', 'frontend');
['birthday_base.jpg', 'graduation_base.jpg', 'wedding_base.jpg'].forEach(name => {
  const p = path.join(frontendDir, name);
  console.log(`${name}:`, getImageDimensions(p));
});

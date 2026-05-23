const fs = require('fs');

function getPngDimensions(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 16); // IHDR width and height start at byte 16
  fs.closeSync(fd);
  const width = buffer.readUInt32BE(0);
  const height = buffer.readUInt32BE(4);
  return { width, height };
}

const dir = 'C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054';
console.log('media__1779353984236.png:', getPngDimensions(`${dir}/media__1779353984236.png`));
console.log('media__1779353106552.png:', getPngDimensions(`${dir}/media__1779353106552.png`));
console.log('media__1779353323265.png:', getPngDimensions(`${dir}/media__1779353323265.png`));

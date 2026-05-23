const { Jimp } = require('jimp');
const path = require('path');

async function test() {
  const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';
  const img = await Jimp.read(path.join(destDir, 'wedding_raw.png'));
  console.log('Image keys:', Object.keys(img));
  console.log('Image prototype keys:', Object.keys(Object.getPrototypeOf(img)));
}

test().catch(console.error);

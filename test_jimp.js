const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function test() {
  const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';
  const img = await Jimp.read(path.join(destDir, 'wedding_raw.png'));
  
  // Try setting quality
  // In modern Jimp (v1.x), quality can be set on write or via a helper
  // Let's try write with quality option
  // Wait, let's check what methods are on the Jimp instance or if img.quality works.
  console.log('img.quality is a function:', typeof img.quality);
  
  if (typeof img.quality === 'function') {
    img.quality(60);
    await img.write(path.join(destDir, 'test_out_60.jpg'));
    console.log('Output JPG 60 size:', fs.statSync(path.join(destDir, 'test_out_60.jpg')).size);
  }
}

test().catch(console.error);

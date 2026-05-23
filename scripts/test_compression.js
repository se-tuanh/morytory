const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function testCompress(fileName, quality) {
  const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';
  const img = await Jimp.read(path.join(destDir, fileName));
  const buffer = await img.getBuffer('image/jpeg', { quality });
  return buffer.length;
}

async function main() {
  const files = [
    'birthday_base.jpg',
    'birthday_father.jpg',
    'birthday_mother.jpg',
    'birthday_child.jpg',
    'graduation_base.jpg',
    'graduation_boy.jpg',
    'graduation_girl.jpg',
    'wedding_base.jpg',
    'wedding_groom.jpg',
    'wedding_bride.jpg'
  ];

  console.log('Testing size at Quality = 40:');
  let totalSize40 = 0;
  for (const f of files) {
    const size = await testCompress(f, 40);
    console.log(`- ${f}: ${size} bytes`);
    totalSize40 += size;
  }
  console.log(`Total size at Q=40: ${totalSize40} bytes (Base64 will be ~${Math.round(totalSize40 * 1.35)} bytes)\n`);

  console.log('Testing size at Quality = 30:');
  let totalSize30 = 0;
  for (const f of files) {
    const size = await testCompress(f, 30);
    console.log(`- ${f}: ${size} bytes`);
    totalSize30 += size;
  }
  console.log(`Total size at Q=30: ${totalSize30} bytes (Base64 will be ~${Math.round(totalSize30 * 1.35)} bytes)`);
}

main().catch(console.error);

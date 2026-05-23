const { Jimp } = require('jimp');
const path = require('path');

async function main() {
  const srcPath = 'C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054/media__1779353984236.png';
  const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';
  
  console.log('Loading image...');
  const image = await Jimp.read(srcPath);
  
  console.log('Cropping Birthday template...');
  // Birthday: y: 0 to 339, x: 0 to 555
  const birthday = image.clone().crop({ x: 0, y: 0, w: 555, h: 339 });
  await birthday.write(path.join(destDir, 'birthday_raw.png'));
  
  console.log('Cropping Graduation template...');
  // Graduation: y: 341 to 536 (height 195), x: 0 to 285 (width 285)
  const graduation = image.clone().crop({ x: 0, y: 341, w: 285, h: 195 });
  await graduation.write(path.join(destDir, 'graduation_raw.png'));
  
  console.log('Cropping Wedding template...');
  // Wedding: y: 341 to 536 (height 195), x: 288 to 555 (width 267)
  const wedding = image.clone().crop({ x: 288, y: 341, w: 267, h: 195 });
  await wedding.write(path.join(destDir, 'wedding_raw.png'));

  console.log('Cropping complete! Saved raw templates to project directory.');
}

main().catch(console.error);

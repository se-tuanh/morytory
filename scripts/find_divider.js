const { Jimp } = require('jimp');

async function main() {
  const image = await Jimp.read('C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054/media__1779353984236.png');
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const data = image.bitmap.data;
  console.log(`Image size: ${width}x${height}`);

  // Print colors at x = 100 for y from 300 to 360
  for (let y = 320; y < 350; y++) {
    const idx = (y * width + 100) * 4;
    const r = data[idx];
    const g = data[idx+1];
    const b = data[idx+2];
    console.log(`y=${y}: r=${r}, g=${g}, b=${b}`);
  }
}

main().catch(console.error);

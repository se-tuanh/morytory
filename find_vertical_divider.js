const { Jimp } = require('jimp');

async function main() {
  const image = await Jimp.read('C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054/media__1779353984236.png');
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const data = image.bitmap.data;

  // Print colors at y = 400 for x from 265 to 290
  for (let x = 265; x < 290; x++) {
    const idx = (400 * width + x) * 4;
    const r = data[idx];
    const g = data[idx+1];
    const b = data[idx+2];
    console.log(`x=${x}: r=${r}, g=${g}, b=${b}`);
  }
}

main().catch(console.error);

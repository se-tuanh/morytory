const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function drawGrid(imagePath, outPath) {
  const image = await Jimp.read(imagePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Let's draw horizontal lines every 50px, and vertical lines every 50px
  // We'll draw them as a semi-transparent or red/blue lines
  const gridColor = 0xff0000ff; // Red
  const majorColor = 0x0000ffff; // Blue for every 100px

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y % 100 === 0 || x % 100 === 0) {
        // Draw major grid line
        image.setPixelColor(majorColor, x, y);
      } else if (y % 20 === 0 || x % 20 === 0) {
        // Draw minor grid line
        image.setPixelColor(gridColor, x, y);
      }
    }
  }

  await image.write(outPath);
  console.log(`Saved grid image to ${outPath}`);
}

async function main() {
  const brainDir = 'C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054';
  
  await drawGrid(path.join(brainDir, 'media__1779356096332.jpg'), path.join(brainDir, 'wedding_grid.png'));
  await drawGrid(path.join(brainDir, 'media__1779356098794.jpg'), path.join(brainDir, 'graduation_grid.png'));
  await drawGrid(path.join(brainDir, 'media__1779356100762.jpg'), path.join(brainDir, 'birthday_grid.png'));
}

main().catch(console.error);

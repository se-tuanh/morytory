const { Jimp } = require('jimp');
const path = require('path');

function drawEllipse(image, cx, cy, rx, ry, colorHex = 0x0000FFFF) { // Blue color for clip path
  for (let y = cy - ry - 5; y <= cy + ry + 5; y++) {
    for (let x = cx - rx - 5; x <= cx + rx + 5; x++) {
      if (x < 0 || x >= image.bitmap.width || y < 0 || y >= image.bitmap.height) continue;
      const term1 = ((x - cx) / rx) ** 2;
      const term2 = ((y - cy) / ry) ** 2;
      const dist = term1 + term2;
      // Border width of about 1 pixel
      if (Math.abs(dist - 1) < 0.05) {
        image.setPixelColor(colorHex, x, y);
      }
    }
  }
}

async function main() {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  const brainDir = 'C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054';

  // 1. Birthday (1024x613)
  const birthday = await Jimp.read(path.join(frontendDir, 'birthday_base.jpg'));
  drawEllipse(birthday, 335 + 55, 190 + 70, 36, 46); // Father
  drawEllipse(birthday, 575 + 55, 210 + 68, 35, 45); // Mother
  drawEllipse(birthday, 717 + 40, 355 + 50, 26, 32); // Child
  await birthday.write(path.join(brainDir, 'birthday_clips_test.png'));

  // 2. Graduation (1024x683)
  const graduation = await Jimp.read(path.join(frontendDir, 'graduation_base.jpg'));
  drawEllipse(graduation, 325 + 50, 270 + 60, 32, 40); // Boy
  drawEllipse(graduation, 582 + 50, 280 + 60, 32, 40); // Girl
  await graduation.write(path.join(brainDir, 'graduation_clips_test.png'));

  // 3. Wedding (1024x683)
  const wedding = await Jimp.read(path.join(frontendDir, 'wedding_base.jpg'));
  drawEllipse(wedding, 327 + 50, 225 + 62, 32, 40); // Groom
  drawEllipse(wedding, 567 + 50, 230 + 62, 32, 40); // Bride
  await wedding.write(path.join(brainDir, 'wedding_clips_test.png'));

  console.log('Clip test images created.');
}

main().catch(console.error);

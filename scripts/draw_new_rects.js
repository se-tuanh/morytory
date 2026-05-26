const { Jimp } = require('jimp');
const path = require('path');

async function drawRect(image, x, y, w, h, colorHex = 0x00FF00FF) { // Green color for new coords
  // Draw top and bottom border
  for (let i = 0; i < w; i++) {
    image.setPixelColor(colorHex, x + i, y);
    image.setPixelColor(colorHex, x + i, y + h - 1);
  }
  // Draw left and right border
  for (let i = 0; i < h; i++) {
    image.setPixelColor(colorHex, x, y + i);
    image.setPixelColor(colorHex, x + w - 1, y + i);
  }
}

async function main() {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  const brainDir = 'C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054';

  // 1. Birthday (1024x613)
  const birthday = await Jimp.read(path.join(frontendDir, 'birthday_base.jpg'));
  await drawRect(birthday, 335, 190, 110, 130); // Father
  await drawRect(birthday, 575, 210, 110, 130); // Mother
  await drawRect(birthday, 717, 355, 80, 95);   // Child
  await birthday.write(path.join(brainDir, 'birthday_new_coords_test.png'));

  // 2. Graduation (1024x683)
  const graduation = await Jimp.read(path.join(frontendDir, 'graduation_base.jpg'));
  await drawRect(graduation, 325, 270, 100, 120); // Boy
  await drawRect(graduation, 582, 280, 100, 120); // Girl
  await graduation.write(path.join(brainDir, 'graduation_new_coords_test.png'));

  // 3. Wedding (1024x683)
  const wedding = await Jimp.read(path.join(frontendDir, 'wedding_base.jpg'));
  await drawRect(wedding, 327, 225, 100, 120); // Groom
  await drawRect(wedding, 567, 230, 100, 120); // Bride
  await wedding.write(path.join(brainDir, 'wedding_new_coords_test.png'));

  console.log('New coordinate test images created.');
}

main().catch(console.error);

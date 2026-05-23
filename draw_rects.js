const { Jimp } = require('jimp');
const path = require('path');

async function drawRect(image, x, y, w, h, colorHex = 0xFF0000FF) {
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
  const brainDir = 'C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054';

  // 1. Wedding (1024x683)
  // Groom head: x=340, y=245, w=75, h=85
  // Bride head: x=580, y=250, w=75, h=85
  const wedding = await Jimp.read(path.join(brainDir, 'media__1779356096332.jpg'));
  await drawRect(wedding, 340, 245, 75, 85);
  await drawRect(wedding, 580, 250, 75, 85);
  await wedding.write(path.join(brainDir, 'wedding_coords_test.png'));

  // 2. Graduation (1024x683)
  // Boy head: x=340, y=290, w=70, h=85
  // Girl head: x=595, y=300, w=75, h=80
  const graduation = await Jimp.read(path.join(brainDir, 'media__1779356098794.jpg'));
  await drawRect(graduation, 340, 290, 70, 85);
  await drawRect(graduation, 595, 300, 75, 80);
  await graduation.write(path.join(brainDir, 'graduation_coords_test.png'));

  // 3. Birthday (1024x613)
  // Father head: x=345, y=215, w=90, h=85
  // Mother head: x=585, y=235, w=90, h=85
  // Child head: x=725, y=375, w=65, h=65
  const birthday = await Jimp.read(path.join(brainDir, 'media__1779356100762.jpg'));
  await drawRect(birthday, 345, 215, 90, 85);
  await drawRect(birthday, 585, 235, 90, 85);
  await drawRect(birthday, 725, 375, 65, 65);
  await birthday.write(path.join(brainDir, 'birthday_coords_test.png'));

  console.log('Test coordinate images created.');
}

main().catch(console.error);

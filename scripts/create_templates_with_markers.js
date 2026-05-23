const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function main() {
  const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';
  const brainDir = 'C:/Users/AnhNT/.gemini/antigravity/brain/42e1d92d-37d1-4c3e-80ff-edede58bc054';

  // Load marker faces
  const maleFace = await Jimp.read(path.join(brainDir, 'male_marker_face_1779354447275.png'));
  const femaleFace = await Jimp.read(path.join(brainDir, 'female_marker_face_1779354469361.png'));
  const childFace = await Jimp.read(path.join(brainDir, 'child_marker_face_1779354494134.png'));

  // Helper to save Jimp image as JPEG with compression
  async function saveAsJpg(img, fileName, quality = 35) {
    const buffer = await img.getBuffer('image/jpeg', { quality });
    fs.writeFileSync(path.join(destDir, fileName), buffer);
    console.log(`Saved ${fileName} (${buffer.length} bytes)`);
  }

  // Helper to load raw template
  async function prepareTemplate(rawFileName) {
    const img = await Jimp.read(path.join(destDir, rawFileName));
    return img;
  }

  console.log('Generating Wedding templates...');
  // Wedding (1024x683)
  // Groom: x=340, y=245, w=75, h=85
  // Bride: x=580, y=250, w=75, h=85
  const weddingBase = await prepareTemplate('wedding_raw.jpg');
  await saveAsJpg(weddingBase, 'wedding_base.jpg');

  // Wedding Groom Template (Groom has face, Bride blank)
  const weddingGroom = weddingBase.clone();
  const groomFace = maleFace.clone().resize({ w: 75, h: 85 });
  weddingGroom.composite(groomFace, 340, 245);
  await saveAsJpg(weddingGroom, 'wedding_groom.jpg');

  // Wedding Bride Template (Bride has face, Groom blank)
  const weddingBride = weddingBase.clone();
  const brideFace = femaleFace.clone().resize({ w: 75, h: 85 });
  weddingBride.composite(brideFace, 580, 250);
  await saveAsJpg(weddingBride, 'wedding_bride.jpg');

  console.log('Generating Graduation templates...');
  // Graduation (1024x683)
  // Boy: x=340, y=290, w=70, h=85
  // Girl: x=595, y=300, w=75, h=80
  const graduationBase = await prepareTemplate('graduation_raw.jpg');
  await saveAsJpg(graduationBase, 'graduation_base.jpg');

  // Graduation Boy Template
  const graduationBoy = graduationBase.clone();
  const gradBoyFace = maleFace.clone().resize({ w: 70, h: 85 });
  graduationBoy.composite(gradBoyFace, 340, 290);
  await saveAsJpg(graduationBoy, 'graduation_boy.jpg');

  // Graduation Girl Template
  const graduationGirl = graduationBase.clone();
  const gradGirlFace = femaleFace.clone().resize({ w: 75, h: 80 });
  graduationGirl.composite(gradGirlFace, 595, 300);
  await saveAsJpg(graduationGirl, 'graduation_girl.jpg');

  console.log('Generating Birthday templates...');
  // Birthday (1024x613)
  // Father: x=345, y=215, w=90, h=85
  // Mother: x=585, y=235, w=90, h=85
  // Child: x=725, y=375, w=65, h=65
  const birthdayBase = await prepareTemplate('birthday_raw.jpg');
  await saveAsJpg(birthdayBase, 'birthday_base.jpg');

  // Birthday Father Template
  const birthdayFather = birthdayBase.clone();
  const bFatherFace = maleFace.clone().resize({ w: 90, h: 85 });
  birthdayFather.composite(bFatherFace, 345, 215);
  await saveAsJpg(birthdayFather, 'birthday_father.jpg');

  // Birthday Mother Template
  const birthdayMother = birthdayBase.clone();
  const bMotherFace = femaleFace.clone().resize({ w: 90, h: 85 });
  birthdayMother.composite(bMotherFace, 585, 235);
  await saveAsJpg(birthdayMother, 'birthday_mother.jpg');

  // Birthday Child Template
  const birthdayChild = birthdayBase.clone();
  const bChildFace = childFace.clone().resize({ w: 65, h: 65 });
  birthdayChild.composite(bChildFace, 725, 375);
  await saveAsJpg(birthdayChild, 'birthday_child.jpg');

  console.log('All 10 templates with marker faces generated successfully as JPEGs.');
}

main().catch(console.error);

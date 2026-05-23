const fs = require('fs');
const path = require('path');

const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';

const filesToUpload = [
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

async function uploadFile(fileName) {
  const filePath = path.join(destDir, fileName);
  const formData = new FormData();
  
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('file', fileBlob, fileName);

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`Upload failed for ${fileName}: ${res.statusText}`);
  }

  const result = await res.json();
  if (result.status === 'success' && result.data && result.data.url) {
    // Convert web URL to raw download URL by replacing tmpfiles.org/ with tmpfiles.org/dl/
    const downloadUrl = result.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
    return downloadUrl;
  } else {
    throw new Error(`Invalid response for ${fileName}`);
  }
}

async function main() {
  console.log('Starting upload of 10 JPEG templates to tmpfiles.org...');
  const urls = {};
  for (const file of filesToUpload) {
    try {
      console.log(`Uploading ${file}...`);
      const url = await uploadFile(file);
      urls[file.replace('.jpg', '')] = url;
      console.log(`Successfully uploaded ${file}: ${url}`);
      // Small delay
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }

  console.log('\n--- UPLOAD RESULT ---');
  console.log(JSON.stringify(urls, null, 2));

  fs.writeFileSync(path.join(destDir, 'template_urls.json'), JSON.stringify(urls, null, 2));
  console.log('\nSaved URLs to template_urls.json');
}

main().catch(console.error);

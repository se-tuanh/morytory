const { execSync } = require('child_process');
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
  
  // Use curl.exe directly to upload to Catbox (permanent)
  const cmd = `curl.exe -s -A "Mozilla/5.0" -F "reqtype=fileupload" -F "fileToUpload=@${filePath}" https://catbox.moe/user/api.php`;
  
  const stdout = execSync(cmd).toString().trim();
  if (stdout.startsWith('https://')) {
    return stdout;
  } else {
    throw new Error(`Upload returned invalid response: ${stdout}`);
  }
}

async function main() {
  const urlsPath = path.join(destDir, 'template_urls.json');
  let urls = {};

  console.log('Starting permanent upload of JPEG templates to Catbox...');
  for (const file of filesToUpload) {
    const key = file.replace('.jpg', '');
    try {
      console.log(`Uploading ${file} permanently to Catbox...`);
      const url = await uploadFile(file);
      urls[key] = url;
      console.log(`Successfully uploaded ${file}: ${url}`);
      // Sleep 500ms
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }

  console.log('\n--- PERMANENT UPLOAD RESULT ---');
  console.log(JSON.stringify(urls, null, 2));

  fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
  console.log('\nSaved updated permanent URLs to template_urls.json');
}

main().catch(console.error);

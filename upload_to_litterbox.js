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
  
  // Use curl.exe directly to bypass Node TLS issue
  const cmd = `curl.exe -s -A "Mozilla/5.0" -F "reqtype=fileupload" -F "time=72h" -F "fileToUpload=@${filePath}" https://litterbox.catbox.moe/resources/internals/api.php`;
  
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
  if (fs.existsSync(urlsPath)) {
    try {
      urls = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));
      console.log('Loaded existing template_urls.json:', urls);
    } catch (e) {
      console.error('Error parsing template_urls.json, starting fresh:', e.message);
    }
  }

  console.log('Starting upload of missing JPEG templates to Litterbox (72h)...');
  let changed = false;
  for (const file of filesToUpload) {
    const key = file.replace('.jpg', '');
    if (urls[key] && urls[key].startsWith('https://')) {
      console.log(`Skipping ${file} - already uploaded: ${urls[key]}`);
      continue;
    }
    try {
      console.log(`Uploading ${file}...`);
      const url = await uploadFile(file);
      urls[key] = url;
      changed = true;
      console.log(`Successfully uploaded ${file}: ${url}`);
      // Sleep 500ms
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }

  if (changed) {
    console.log('\n--- UPLOAD RESULT ---');
    console.log(JSON.stringify(urls, null, 2));

    fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 2));
    console.log('\nSaved updated URLs to template_urls.json');
  } else {
    console.log('\nAll files already uploaded, no changes saved.');
  }
}

main().catch(console.error);

const fs = require('fs');
const path = require('path');

const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';
const workerDir = path.join(destDir, 'worker');

const filesToEncode = [
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

function encodeFile(fileName) {
  const filePath = path.join(destDir, fileName);
  const data = fs.readFileSync(filePath);
  return data.toString('base64');
}

function main() {
  console.log('Encoding templates to base64 for Cloudflare Worker...');
  const templates = {};
  for (const file of filesToEncode) {
    const key = file.replace('.jpg', '');
    console.log(`Encoding ${file}...`);
    templates[key] = encodeFile(file);
  }
  
  // Load template URLs
  let urls = {};
  try {
    const urlsPath = path.join(destDir, 'template_urls.json');
    if (fs.existsSync(urlsPath)) {
      urls = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading template_urls.json:', err.message);
  }

  // Create JS file with filled TEMPLATES and filled TEMPLATE_URLS
  const jsContent = `// Tự động sinh bởi build_worker_assets.js
export const TEMPLATES = ${JSON.stringify(templates, null, 2)};
export const TEMPLATE_URLS = ${JSON.stringify(urls, null, 2)};
`;

  fs.writeFileSync(path.join(workerDir, 'templates_data.js'), jsContent);
  console.log('Worker assets built successfully in worker/templates_data.js!');
}

main();

const fs = require('fs');
const path = require('path');

async function test() {
  const destDir = 'C:/Users/AnhNT/.gemini/antigravity/scratch/MoryTory';
  const fileName = 'wedding_base.jpg';
  const filePath = path.join(destDir, fileName);
  
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('fileToUpload', fileBlob, fileName);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Body:', text);
}

test().catch(console.error);

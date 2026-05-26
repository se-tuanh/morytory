const fs = require('fs');
const path = require('path');
const vm = require('vm');

function checkFileSyntax(filePath) {
  console.log(`Checking syntax for: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error(`  File not found!`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`  File size: ${content.length} characters`);
  
  if (filePath.endsWith('.js')) {
    try {
      new vm.Script(content);
      console.log(`  ✓ JS Syntax OK`);
    } catch (e) {
      console.error(`  ✗ JS Syntax ERROR:`, e);
    }
    return;
  }
  
  // HTML file
  const scriptRegex = /(<script\b[^>]*>)([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    scriptCount++;
    const openingTag = match[1];
    const jsCode = match[2];
    // Check if it's an external script src
    if (openingTag.includes('src=')) {
      console.log(`  Skipping external Script #${scriptCount} (${openingTag})`);
      continue;
    }
    try {
      new vm.Script(jsCode, { filename: `${path.basename(filePath)} [Script #${scriptCount}]` });
      console.log(`  ✓ Script #${scriptCount} Syntax OK`);
    } catch (e) {
      console.error(`  ✗ Script #${scriptCount} Syntax ERROR:`, e);
    }
  }
  console.log(`  Found ${scriptCount} scripts`);
}

const frontendDir = path.join(__dirname, '..', 'frontend');
checkFileSyntax(path.join(frontendDir, 'cart.js'));
checkFileSyntax(path.join(frontendDir, 'index.html'));
checkFileSyntax(path.join(frontendDir, 'product_custom.html'));
checkFileSyntax(path.join(frontendDir, 'admin.html'));

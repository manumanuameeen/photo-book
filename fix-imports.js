const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Remove .ts extension from all import/export statements
  content = content.replace(
    /(from\s+["'])(.*?)\.ts(["'])/g,
    '$1$2$3'
  );
  content = content.replace(
    /(import\s+["'])(.*?)\.ts(["'])/g,
    '$1$2$3'
  );
  content = content.replace(
    /(export\s+.*?from\s+["'])(.*?)\.ts(["'])/g,
    '$1$2$3'
  );
  // Fix dynamic imports
  content = content.replace(
    /(import\(["'])(.*?)\.ts(["']\))/g,
    '$1$2$3'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
}

console.log('🔧 Starting import fix...');
const files = getAllFiles('./backend/src');
console.log(`Found ${files.length} TypeScript files`);
files.forEach(fixImports);
console.log('🎉 Done! All .ts extensions removed from imports');
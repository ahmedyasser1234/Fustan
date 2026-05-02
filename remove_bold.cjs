const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./client/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content.replace(/font-black/g, 'font-medium');
    // newContent = newContent.replace(/font-bold/g, 'font-medium');
    
    // Also reduce text-7xl, text-6xl, text-5xl
    newContent = newContent.replace(/text-7xl/g, 'text-4xl');
    newContent = newContent.replace(/text-6xl/g, 'text-3xl');
    newContent = newContent.replace(/text-5xl/g, 'text-3xl');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});

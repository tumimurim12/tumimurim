const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const output = path.join(root, 'public');
const staticFiles = [
  'index.html',
  'style.css',
  'script.js',
  'tumi.jpg',
  'carousel-1.jpg',
  'carousel-1.png',
  'carousel-2.jpg',
  'carousel-2.png',
  'carousel-3.jpg',
  'carousel-3.png'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of staticFiles) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

console.log(`Copied ${staticFiles.length} static files to public/`);

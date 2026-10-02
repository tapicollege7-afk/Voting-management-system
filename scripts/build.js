const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('🔄 [Build] Step 1: Restoring source index.html from frontend-website/index.html...');
const templatePath = fs.existsSync(path.join(rootDir, 'frontend-website', 'index.html'))
  ? path.join(rootDir, 'frontend-website', 'index.html')
  : path.join(rootDir, 'index.source.html');

if (fs.existsSync(templatePath)) {
  fs.copyFileSync(templatePath, path.join(rootDir, 'index.html'));
}

console.log('⚡ [Build] Step 2: Running Vite production build...');
execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

console.log('📦 [Build] Step 3: Syncing distribution assets to docs/ & root...');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');
const assetsDir = path.join(rootDir, 'assets');

// Sync dist -> docs
fs.cpSync(distDir, docsDir, { recursive: true });
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(docsDir, '404.html'));
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');

// Sync dist/assets -> root assets
if (fs.existsSync(path.join(distDir, 'assets'))) {
  fs.cpSync(path.join(distDir, 'assets'), assetsDir, { recursive: true });
}

// Sync dist/index.html to root for GitHub Pages root hosting
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(rootDir, '404.html'));
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(rootDir, 'index.html'));

// Fix manifest link in all target HTML files
const htmlFiles = [
  path.join(docsDir, 'index.html'),
  path.join(docsDir, '404.html'),
  path.join(distDir, 'index.html'),
  path.join(rootDir, 'index.html'),
  path.join(rootDir, '404.html'),
];

htmlFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /<link rel="manifest" href="\.\/.+?\.json">/,
      '<link rel="manifest" href="./manifest.json">'
    );
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('✅ [Build] Production build completely synced across dist, docs, assets, and root!');

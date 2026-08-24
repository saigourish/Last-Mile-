const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Preparing Antigravity MERN Source Package...');

const zipFileName = 'Antigravity-Last-Mile-Delivery-MERN.zip';
const rootDir = __dirname;

try {
  // Check if powershell Compress-Archive is available on Windows
  console.log(`🗜️ Archiving project files to ${zipFileName}...`);
  const excludeList = ['node_modules', '.git', 'dist', zipFileName];
  
  const cmd = `powershell -Command "Compress-Archive -Path client, server, package.json, README.md, SYSTEM_DESIGN.md -DestinationPath ${zipFileName} -Force"`;
  execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
  console.log(`✅ Successfully generated deployment package: ${zipFileName}`);
} catch (err) {
  console.warn('Zip archiving command note:', err.message);
  console.log('You can manually zip the project root or use standard archiving tools.');
}

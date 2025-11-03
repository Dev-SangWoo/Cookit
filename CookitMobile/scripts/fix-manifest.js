const fs = require('fs');
const path = require('path');

const debugManifestPath = path.join(__dirname, '../android/app/src/debug/AndroidManifest.xml');
const mainManifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

// Debug Manifest 수정
if (fs.existsSync(debugManifestPath)) {
  let content = fs.readFileSync(debugManifestPath, 'utf8');
  if (!content.includes('tools:replace="android:usesCleartextTraffic,android:appComponentFactory"')) {
    content = content.replace(
      'tools:replace="android:usesCleartextTraffic"',
      'tools:replace="android:usesCleartextTraffic,android:appComponentFactory"'
    );
    fs.writeFileSync(debugManifestPath, content, 'utf8');
    console.log('✅ Fixed debug AndroidManifest.xml');
  }
}

// Main Manifest 수정
if (fs.existsSync(mainManifestPath)) {
  let content = fs.readFileSync(mainManifestPath, 'utf8');
  if (!content.includes('tools:replace="android:appComponentFactory"')) {
    content = content.replace(
      '<application',
      '<application tools:replace="android:appComponentFactory"'
    );
    fs.writeFileSync(mainManifestPath, content, 'utf8');
    console.log('✅ Fixed main AndroidManifest.xml');
  }
}

console.log('✅ AndroidManifest fix script completed');


const fs = require('fs');
const path = require('path');

/**
 * List all photos in photos.js
 */

const photosFile = path.join(__dirname, 'photos.js');

if (!fs.existsSync(photosFile)) {
    console.log('No photos found (photos.js does not exist)');
    process.exit(0);
}

try {
    const fileContent = fs.readFileSync(photosFile, 'utf8');
    const match = fileContent.match(/const FOLDER_PHOTOS = \[([\s\S]*)\];/);
    
    if (!match) {
        console.log('No photos found');
        process.exit(0);
    }
    
    // Remove comments from JSON
    let jsonStr = '[' + match[1] + ']';
    jsonStr = jsonStr.replace(/\/\/.*?\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '');
    const photos = JSON.parse(jsonStr);
    
    if (photos.length === 0) {
        console.log('No photos stored');
    } else {
        console.log(`Stored Photos (${photos.length} total):\n`);
        photos.forEach((p, i) => {
            const size = Math.round(p.dataUrl.length / 1024);
            const date = new Date(p.timestamp).toLocaleString();
            console.log(`  [${i}] ${p.name}`);
            console.log(`      Size: ${size} KB`);
            console.log(`      Added: ${date}\n`);
        });
    }
} catch (error) {
    console.error('Error reading photos.js:', error.message);
    process.exit(1);
}

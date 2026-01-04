const fs = require('fs');
const path = require('path');

/**
 * CLI tool to remove photos from photos.js
 * Usage: node remove-photo.js <photo-name-or-index>
 */

if (process.argv.length < 3) {
    console.log('Usage: node remove-photo.js <photo-name-or-index>');
    console.log('Example: node remove-photo.js image.jpg');
    console.log('Example: node remove-photo.js 0');
    console.log('\nPhotos:');
    listPhotos();
    process.exit(1);
}

const photosFile = path.join(__dirname, 'photos.js');
const target = process.argv[2];

// Load existing photos
let photos = [];
if (fs.existsSync(photosFile)) {
    try {
        const fileContent = fs.readFileSync(photosFile, 'utf8');
        const match = fileContent.match(/const FOLDER_PHOTOS = \[([\s\S]*)\];/);
        if (match) {
            // Remove comments from JSON
            let jsonStr = '[' + match[1] + ']';
            jsonStr = jsonStr.replace(/\/\/.*?\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '');
            photos = JSON.parse(jsonStr);
        }
    } catch (error) {
        console.error('Error: Could not parse photos.js');
        process.exit(1);
    }
}

if (photos.length === 0) {
    console.log('No photos found.');
    process.exit(1);
}

// Find photo to remove
let indexToRemove = -1;

// Check if target is a number (index)
if (!isNaN(target)) {
    indexToRemove = parseInt(target);
} else {
    // Find by name
    indexToRemove = photos.findIndex(p => p.name === target);
}

if (indexToRemove < 0 || indexToRemove >= photos.length) {
    console.error(`Error: Photo not found: ${target}`);
    console.log('\nAvailable photos:');
    listPhotos();
    process.exit(1);
}

const removedPhoto = photos[indexToRemove];
photos.splice(indexToRemove, 1);

// Save to photos.js
if (photos.length === 0) {
    const content = `// Auto-generated photos file
// Do not edit manually - use CLI tools instead

const FOLDER_PHOTOS = [];
`;
    fs.writeFileSync(photosFile, content);
} else {
    const content = `// Auto-generated photos file
// Do not edit manually - use CLI tools instead

const FOLDER_PHOTOS = [
${photos.map(p => `    {
        "name": ${JSON.stringify(p.name)},
        "dataUrl": ${JSON.stringify(p.dataUrl)},
        "timestamp": ${p.timestamp}
    }`).join(',\n')}
];
`;
    fs.writeFileSync(photosFile, content);
}

console.log(`✓ Removed: ${removedPhoto.name}`);
console.log(`  Remaining photos: ${photos.length}`);

function listPhotos() {
    if (fs.existsSync(photosFile)) {
        try {
            const fileContent = fs.readFileSync(photosFile, 'utf8');
            const match = fileContent.match(/const FOLDER_PHOTOS = \[([\s\S]*)\];/);
            if (match) {
                // Remove comments from JSON
                let jsonStr = '[' + match[1] + ']';
                jsonStr = jsonStr.replace(/\/\/.*?\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '');
                const photos = JSON.parse(jsonStr);
                if (photos.length === 0) {
                    console.log('  (none)');
                } else {
                    photos.forEach((p, i) => {
                        console.log(`  [${i}] ${p.name}`);
                    });
                }
            }
        } catch (error) {
            console.log('  (unable to read)');
        }
    } else {
        console.log('  (none)');
    }
}

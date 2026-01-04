const fs = require('fs');
const path = require('path');

/**
 * CLI tool to add photos to photos.js
 * Usage: node add-photo.js ./path/to/image.jpg
 */

if (process.argv.length < 3) {
    console.log('Usage: node add-photo.js <image-file-path>');
    console.log('Example: node add-photo.js ./my-photo.jpg');
    process.exit(1);
}

const imagePath = process.argv[2];
const photosFile = path.join(__dirname, 'photos.js');

// Check if file exists
if (!fs.existsSync(imagePath)) {
    console.error(`Error: File not found: ${imagePath}`);
    process.exit(1);
}

// Check if it's an image file
const ext = path.extname(imagePath).toLowerCase();
const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
if (!validExts.includes(ext)) {
    console.error(`Error: Invalid image format. Supported: ${validExts.join(', ')}`);
    process.exit(1);
}

// Read image file
const imageBuffer = fs.readFileSync(imagePath);
const base64Data = imageBuffer.toString('base64');
const fileName = path.basename(imagePath);
const mimeType = getMimeType(ext);

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
        console.warn('Warning: Could not parse existing photos.js');
    }
}

// Add new photo
photos.push({
    name: fileName,
    dataUrl: `data:${mimeType};base64,${base64Data}`,
    timestamp: Date.now()
});

// Save to photos.js
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
console.log(`✓ Added: ${fileName}`);
console.log(`  Total photos: ${photos.length}`);

function getMimeType(ext) {
    const mimeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
    };
    return mimeMap[ext] || 'image/jpeg';
}

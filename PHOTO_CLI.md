# Photo Management CLI

The focus-display application uses a CLI-based photo management system. Photos are stored as base64-encoded data in `photos.js` and displayed in rotation with Trello cards.

## Adding Photos

Add a photo to the rotation:

```bash
node add-photo.js ./path/to/image.jpg
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`

Example:
```bash
node add-photo.js ~/Pictures/sunset.png
node add-photo.js ./screenshot.jpg
```

## Listing Photos

View all stored photos:

```bash
node list-photos.js
```

Output shows:
- Photo index (for removal by index)
- Photo filename
- Size in KB
- Date added

Example output:
```
Stored Photos (3 total):

  [0] vacation.jpg
      Size: 245 KB
      Added: 1/4/2026, 8:05:31 AM

  [1] sunset.png
      Size: 189 KB
      Added: 1/4/2026, 8:07:12 AM

  [2] screenshot.jpg
      Size: 156 KB
      Added: 1/4/2026, 8:09:44 AM
```

## Removing Photos

Remove a photo by name:

```bash
node remove-photo.js sunset.png
```

Or by index:

```bash
node remove-photo.js 1
```

## How It Works

1. **Add**: When you run `node add-photo.js <file>`, the script:
   - Reads the image file
   - Converts it to base64 encoding
   - Appends it to `photos.js` as a JavaScript object

2. **Storage**: Photos are stored in `photos.js` as a global `FOLDER_PHOTOS` array with:
   - `name`: Original filename
   - `dataUrl`: Base64-encoded image with MIME type
   - `timestamp`: When the photo was added

3. **Display**: The HTML page loads `photos.js` before `script.js`, so the `FOLDER_PHOTOS` variable is available globally. Photos rotate with Trello cards automatically.

## File Size Note

Base64 encoding increases file size by approximately 33%. A 100 KB image becomes ~133 KB in `photos.js`. This is acceptable for display purposes and avoids the need for an HTTP server.

## No Browser Storage

Unlike the previous localStorage approach, this system stores photos in `photos.js` directly in the filesystem:
- ✅ No browser storage limitations
- ✅ Can store large images
- ✅ Works when opening HTML file directly (`file://`)
- ✅ Managed entirely via CLI

## Integration with Display

Edit `index.html` to use your Trello list or simple goals:

**For Trello:**
```
?listId=YOUR_LIST_ID&apiKey=YOUR_API_KEY&token=YOUR_TOKEN
```

**For Simple Goals:**
```
?goals=Goal1|Goal2|Goal3
```

Photos added via CLI will automatically rotate with whatever cards/goals you've set up.

# Focus Display - CLI Photo System Setup Complete

## ✅ What's Fixed

The corrupted `script.js` has been replaced with a clean version that:
1. Properly loads photos from the global `FOLDER_PHOTOS` variable in `photos.js`
2. Alternates between Trello cards and photos during rotation
3. Displays photos with full-screen background and centered text overlay
4. Auto-refreshes Trello cards every 5 minutes
5. Supports keyboard navigation (arrows, spacebar)

## 📸 Photo Management System

### CLI Tools Available

**Add a photo:**
```bash
node add-photo.js ./my-photo.jpg
```

**List all photos:**
```bash
node list-photos.js
```

**Remove a photo:**
```bash
node remove-photo.js my-photo.jpg    # By name
node remove-photo.js 0               # By index
```

### How It Works

1. CLI tools read image files and convert them to base64
2. Photos are stored in `photos.js` as a JavaScript object array
3. `index.html` loads `photos.js` before `script.js` to make `FOLDER_PHOTOS` globally available
4. `script.js` reads `FOLDER_PHOTOS` and rotates photos with cards

### Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main display page (loads photos.js before script.js) |
| `script.js` | Display logic, rotation control, Trello integration |
| `photos.js` | Auto-generated - stores base64-encoded photos |
| `add-photo.js` | CLI tool to add photos |
| `remove-photo.js` | CLI tool to remove photos |
| `list-photos.js` | CLI tool to list all photos |
| `PHOTO_CLI.md` | Detailed photo management documentation |

## 🚀 Quick Start

### 1. Add Some Photos
```bash
node add-photo.js ~/Pictures/photo1.jpg
node add-photo.js ~/Pictures/photo2.png
```

### 2. Verify Photos Are Stored
```bash
node list-photos.js
```

### 3. Open the Display
- Open `index.html` in a browser (directly via `file://`)
- Or serve with a simple HTTP server if accessing remotely

### 4. Configure Trello or Goals
Add to the URL:
- **Trello**: `?listId=XXX&apiKey=XXX&token=XXX`
- **Simple Goals**: `?goals=Goal1|Goal2|Goal3`

### 5. Photos Will Rotate
Photos and cards will automatically rotate every 10 seconds.

## 📋 Features

✅ CLI-based photo management (no UI needed)
✅ Base64-encoded photos (no server required)
✅ Works with `file://` protocol directly
✅ Supports large images (base64 ~33% larger)
✅ Trello card integration
✅ Simple goal text support
✅ Auto-refresh of Trello cards (5 min interval)
✅ Keyboard navigation (arrows, spacebar)
✅ GMT+7 timezone with Islamic calendar

## 🔧 Technical Details

### Photo Data Structure
Each photo in `photos.js`:
```javascript
{
    "name": "photo.jpg",
    "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "timestamp": 1704328800000
}
```

### Rotation Logic
- Photos and cards alternate in display queue
- Each item shown for 10 seconds
- Arrow keys navigate manually
- Spacebar refreshes Trello data
- Queue rebuilds when photos change

### No Storage Limitations
Unlike localStorage:
- ✅ Can store unlimited large images
- ✅ Works in `file://` protocol
- ✅ Survives browser restarts
- ✅ Easy CLI management

## 📝 Notes

- Test image ('test.png') has been removed; start fresh with your own photos
- Photos are displayed at full screen size with centered filename overlay
- Use dark theme with semi-transparent overlay for readability
- Base64 encoding adds ~33% file size overhead but eliminates server complexity

## 🎯 Next Steps

1. Add your photos: `node add-photo.js <path-to-image>`
2. Configure Trello/goals in the URL
3. Open `index.html` in browser
4. Enjoy the rotating display!

For detailed photo management documentation, see [PHOTO_CLI.md](PHOTO_CLI.md)

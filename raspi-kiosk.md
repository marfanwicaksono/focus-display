# Raspberry Pi 3: Bookworm Lite to Auto-Launch Browser

Complete guide to set up Raspberry Pi OS Lite (Bookworm) with minimal GUI that auto-launches Chromium browser on boot.

## Prerequisites

- Raspberry Pi 3
- Raspberry Pi OS Lite (Bookworm) installed
- Internet connection
- Keyboard and mouse connected
- Monitor connected

## Step 1: Update System
```bash
sudo apt update
sudo apt upgrade -y
```

## Step 2: Install Minimal GUI Components

Install X server, window manager, and Chromium browser:
```bash
sudo apt install -y --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
sudo apt install -y --no-install-recommends chromium
```

**Optional: Install unclutter to hide cursor**
```bash
sudo apt install -y unclutter
```

**What this installs:**
- `xserver-xorg` - X Window System server
- `x11-xserver-utils` - X server utilities (including xset)
- `xinit` - X server initialization tools
- `openbox` - Lightweight window manager
- `chromium` - Chromium web browser
- `unclutter` - (Optional) Hides mouse cursor after inactivity

## Step 3: Configure Auto-Login

Enable auto-login to console:
```bash
sudo raspi-config
```

Navigate:
1. Select **1 System Options**
2. Select **S5 Boot / Auto Login**
3. Select **B2 Console Autologin**
4. Select **Finish**

Don't reboot yet.

## Step 4: Auto-Start X Server on Login

Edit the `.bashrc` file:
```bash
nano ~/.bashrc
```

Add environment variable if required. For example:
```
export TRELLO_API_KEY="your-key"
export TRELLO_TOKEN="your-token"
export TRELLO_LIST_ID="your-list-id"
```

Add this at the **end** of the file:
```bash
# Auto-start X server on tty1
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ] && [ -z "$STARTX_RAN" ]; then
  export STARTX_RAN=1
  startx
fi
```

**What this does:**
- Checks if X is not already running (`-z "$DISPLAY"`)
- Checks if you're on the first terminal (`/dev/tty1`)
- Prevents multiple X sessions (`-z "$STARTX_RAN"`)
- Starts X server automatically

Save and exit: `Ctrl+O`, `Enter`, `Ctrl+X`

## Step 5: Configure Openbox Autostart

Create Openbox configuration directory:
```bash
mkdir -p ~/.config/openbox
```

Create the autostart file:
```bash
nano ~/.config/openbox/autostart
```

Add the following content:
```bash
# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide cursor after inactivity (optional - uncomment if installed)
# unclutter -idle 0.5 -root &

# Start Chromium browser
chromium --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  https://www.google.com
```

**Chromium options you can customize:**
```bash
# Option 1: Fullscreen mode with crash recovery disabled (Recommended)
chromium --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  https://your-url-here.com

# Option 2: Maximized window
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --start-maximized \
  https://your-url-here.com

# Option 3: Normal window
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  https://your-url-here.com

# Option 4: Fullscreen + Incognito mode
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  --incognito \
  https://your-url-here.com

# Option 5: Fullscreen + Incognito mode + params from environment variables
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  --incognito \
  "https://marfanwicaksono.github.io/focus-display?listId=${TRELLO_LIST_ID}&apiKey=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}"
```

**Important flags to prevent crash messages:**
- `--noerrdialogs` - Suppresses error dialogs
- `--disable-session-crashed-bubble` - Prevents "Chrome didn't shut down correctly" message
- `--disable-infobars` - Hides notification bars

Save and exit: `Ctrl+O`, `Enter`, `Ctrl+X`

## Step 6: Reboot
```bash
sudo reboot
```

## What Happens After Reboot

1. Pi boots up
2. Auto-login to console as `pi` user
3. `.bashrc` runs and executes `startx`
4. X server starts
5. Openbox window manager launches
6. Openbox reads `~/.config/openbox/autostart`
7. Chromium browser opens in fullscreen (without crash message)

## Customization Options

### Hide Mouse Cursor

**Option 1: Hide after inactivity (Recommended)**

Make sure unclutter is installed:
```bash
sudo apt install -y unclutter
```

Edit autostart:
```bash
nano ~/.config/openbox/autostart
```

Uncomment the unclutter line:
```bash
# Hide cursor after 0.5 seconds of inactivity
unclutter -idle 0.5 -root &
```

**Option 2: Hide cursor completely at X server level**

Edit `.bashrc`:
```bash
nano ~/.bashrc
```

Change the startx line to:
```bash
startx -- -nocursor
```

Complete section:
```bash
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ] && [ -z "$STARTX_RAN" ]; then
  export STARTX_RAN=1
  startx -- -nocursor
fi
```

**Option 3: Combine both methods for maximum reliability**

Use both `-nocursor` in startx AND unclutter in autostart.

### Change Homepage URL

Edit the autostart file:
```bash
nano ~/.config/openbox/autostart
```

Change the URL in the chromium command:
```bash
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  https://your-website.com
```

### Disable Screen Blanking (Already Configured)

The `xset` commands in the autostart file prevent:
- Screen saver activation
- Display power management (screen turning off)
- Screen blanking

### Add Multiple Browser Windows
```bash
nano ~/.config/openbox/autostart
```

Add multiple chromium commands:
```bash
xset s off
xset -dpms
xset s noblank

chromium --noerrdialogs --disable-session-crashed-bubble --new-window https://site1.com &
sleep 2
chromium --noerrdialogs --disable-session-crashed-bubble --new-window https://site2.com &
```

### Rotate Display (for Vertical Monitors)

Add to autostart file before chromium:
```bash
# Rotate display 90 degrees clockwise
xrandr --output HDMI-1 --rotate right
```

Options: `normal`, `left`, `right`, `inverted`

## Troubleshooting

### "Chrome didn't shut down correctly" Message Still Appears

This happens when Chromium doesn't exit cleanly. Additional fixes:

**Solution 1: Add more flags**
```bash
nano ~/.config/openbox/autostart
```

Update chromium command:
```bash
chromium --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --check-for-update-interval=31536000 \
  --start-fullscreen \
  https://www.google.com
```

**Solution 2: Clear Chromium cache on startup**

Add to autostart before chromium launches:
```bash
# Remove Chromium crash flags
rm -rf ~/.config/chromium/Singleton* 2>/dev/null
rm -rf ~/.config/chromium/Default/Preferences.bak 2>/dev/null
```

Complete autostart example:
```bash
xset s off
xset -dpms
xset s noblank

# Clear crash flags
rm -rf ~/.config/chromium/Singleton* 2>/dev/null

chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  https://www.google.com
```

**Solution 3: Use incognito mode (no session to restore)**
```bash
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --incognito \
  --start-fullscreen \
  https://www.google.com
```

### Black Screen After Boot

1. Press `Ctrl+Alt+F2` to switch to another terminal
2. Login manually
3. Check logs:
```bash
   cat ~/.local/share/xorg/Xorg.0.log
```

### Chromium Doesn't Start

Check if chromium is installed:
```bash
which chromium
```

Test manually:
```bash
DISPLAY=:0 chromium
```

### Cursor Still Visible with unclutter

Check if unclutter is running:
```bash
ps aux | grep unclutter
```

Try different unclutter settings:
```bash
# More aggressive hiding
unclutter -idle 0.1 -root &

# Or hide immediately
unclutter -idle 0 -root &
```

### Want to Access Terminal

**Option 1:** Press `Ctrl+Alt+F2` (switch to tty2)
- Login with your credentials
- Return to GUI: `Ctrl+Alt+F1`

**Option 2:** Right-click on desktop (if Openbox menu is enabled)

**Option 3:** SSH into the Pi from another computer

### Disable Auto-Start Temporarily

Comment out the startx code in `.bashrc`:
```bash
nano ~/.bashrc
```

Add `#` before the if statement:
```bash
# if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ] && [ -z "$STARTX_RAN" ]; then
#   export STARTX_RAN=1
#   startx
# fi
```

## System Resources

**Disk space used:** ~500MB (vs ~2GB for full Raspberry Pi OS Desktop)

**RAM usage at idle:**
- X server + Openbox: ~100-150MB
- Chromium (1 tab): ~200-300MB
- **Total:** ~300-450MB

## Additional Features

### Enable On-Screen Keyboard (for Touchscreens)
```bash
sudo apt install -y matchbox-keyboard
```

Add to autostart:
```bash
nano ~/.config/openbox/autostart
```

Add before chromium line:
```bash
matchbox-keyboard &
```

### Auto-Reload Page Every Hour

Add to autostart after chromium:
```bash
sudo apt install -y xdotool

# Then add to autostart:
(
  while true; do
    sleep 3600  # 3600 seconds = 1 hour
    DISPLAY=:0 xdotool search --class chromium key F5
  done
) &
```

### Set Fixed Resolution

Add to autostart before chromium:
```bash
xrandr --output HDMI-1 --mode 1920x1080
```

Check available modes:
```bash
xrandr
```

## Security Notes

- This setup auto-logs in as the `pi` user
- Consider changing the default password: `passwd`
- For public kiosks, consider additional restrictions
- Users can access terminal with `Ctrl+Alt+F2`

## Reverting to CLI Only

If you want to remove the GUI:
```bash
# Remove autostart from .bashrc
nano ~/.bashrc
# Delete or comment out the startx lines

# Optionally remove packages
sudo apt remove --purge -y chromium openbox xserver-xorg x11-xserver-utils xinit unclutter
sudo apt autoremove -y
```

## Complete File Reference

### ~/.bashrc (end of file)

**With visible cursor:**
```bash
# Auto-start X server on tty1
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ] && [ -z "$STARTX_RAN" ]; then
  export STARTX_RAN=1
  startx
fi
```

**With hidden cursor:**
```bash
# Auto-start X server on tty1 with hidden cursor
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ] && [ -z "$STARTX_RAN" ]; then
  export STARTX_RAN=1
  startx -- -nocursor
fi
```

### ~/.config/openbox/autostart

**Full-featured browser (cursor visible):**
```bash
# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Clear Chromium crash flags
rm -rf ~/.config/chromium/Singleton* 2>/dev/null

# Start Chromium browser
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  https://www.google.com
```

**Full-featured browser (cursor hidden after inactivity):**
```bash
# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide cursor after 0.5 seconds of inactivity
unclutter -idle 0.5 -root &

# Clear Chromium crash flags
rm -rf ~/.config/chromium/Singleton* 2>/dev/null

# Start Chromium browser
chromium --noerrdialogs \
  --disable-session-crashed-bubble \
  --start-fullscreen \
  https://www.google.com
```

**Kiosk mode (locked to specific site, cursor hidden):**
```bash
# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide cursor
unclutter -idle 0.5 -root &

# Start Chromium in kiosk mode
chromium --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --incognito \
  --disable-session-crashed-bubble \
  https://your-url-here.com
```

---

**Your Raspberry Pi is now ready!** It will automatically boot into a fullscreen browser on every startup without the crash recovery message.
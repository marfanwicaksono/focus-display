# Raspberry Pi GPIO Button to Keyboard Mapper

This guide shows you how to map physical buttons connected to Raspberry Pi GPIO pins to keyboard keys using uinput.

## Overview

- **GPIO 17** → Left Arrow Key (click mode)
- **GPIO 22** → Right Arrow Key (click mode)
- **GPIO 27** → Spacebar Key (hold mode - supports continuous press for auto-refresh)

**Mode Explanation:**
- **Click mode**: Single press and release event (good for navigation)
- **Hold mode**: Key stays pressed while button is held (good for toggles, continuous actions)

## Prerequisites

- Raspberry Pi 3 (or any Raspberry Pi model)
- Raspbian/Raspberry Pi OS installed
- Three push buttons
- Jumper wires

## Hardware Setup

### Wiring the Buttons

1. **Left Button (GPIO 17)**
   - Connect one side to GPIO 17 (Physical Pin 11)
   - Connect other side to GND (Physical Pin 9 or any GND pin)

2. **Right Button (GPIO 22)**
   - Connect one side to GPIO 22 (Physical Pin 15)
   - Connect other side to GND (Physical Pin 14 or any GND pin)

3. **Refresh Button (GPIO 27)**
   - Connect one side to GPIO 27 (Physical Pin 13)
   - Connect other side to GND (Physical Pin 14 or any GND pin)

### GPIO Pin Reference

| GPIO | Physical Pin | Function |
|------|--------------|----------|
| 17   | 11           | Left Button |
| 22   | 15           | Right Button |
| 27   | 13           | Refresh Button (Spacebar) |
| GND  | 9, 14, etc.  | Ground |

## Software Setup

### Step 1: Install Required Packages
```bash
# Update system
sudo apt-get update

# Install python-uinput
sudo apt-get install python3-uinput -y

# Install RPi.GPIO (usually pre-installed)
sudo apt-get install python3-rpi.gpio -y
```

### Step 2: Load uinput Kernel Module
```bash
# Load the module immediately
sudo modprobe uinput

# Make it load automatically on boot
echo "uinput" | sudo tee -a /etc/modules
```

### Step 3: Set Permissions (Optional but Recommended)

To run without sudo:
```bash
# Create udev rule
sudo bash -c 'echo "KERNEL==\"uinput\", MODE=\"0660\", GROUP=\"input\"" > /etc/udev/rules.d/99-input.rules'

# Add your user to input group
sudo usermod -a -G input $USER

# Reboot for changes to take effect
sudo reboot
```

### Step 4: Create the Python Script

Create the script file:
```bash
mkdir /home/pi/button-keys
nano /home/pi/button-keys/button_keys.py
```

Add this code:
```python
import RPi.GPIO as GPIO
import uinput
import time

# Setup GPIO pins
LEFT_BUTTON_PIN = 17   # GPIO 17 for left arrow
RIGHT_BUTTON_PIN = 22  # GPIO 22 for right arrow
REFRESH_BUTTON_PIN = 27  # GPIO 27 for spacebar (refresh)

# Button mode configuration: 'click' or 'hold'
BUTTON_MODES = {
    LEFT_BUTTON_PIN: 'click',      # Press and release
    RIGHT_BUTTON_PIN: 'click',     # Press and release
    REFRESH_BUTTON_PIN: 'hold'     # Hold while button is pressed
}

# Key mapping for each button
BUTTON_KEYS = {
    LEFT_BUTTON_PIN: uinput.KEY_LEFT,
    RIGHT_BUTTON_PIN: uinput.KEY_RIGHT,
    REFRESH_BUTTON_PIN: uinput.KEY_SPACE
}

GPIO.setmode(GPIO.BCM)
GPIO.setup(LEFT_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(RIGHT_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(REFRESH_BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Create virtual keyboard device with left, right arrow keys and spacebar
device = uinput.Device([
    uinput.KEY_LEFT,
    uinput.KEY_RIGHT,
    uinput.KEY_SPACE
])

print("Virtual keyboard created")
print("GPIO 17 -> Left Arrow (click mode)")
print("GPIO 22 -> Right Arrow (click mode)")
print("GPIO 27 -> Spacebar (hold mode - auto-refresh toggle)")
print("Listening for button presses...")

try:
    button_state = {
        LEFT_BUTTON_PIN: False,
        RIGHT_BUTTON_PIN: False,
        REFRESH_BUTTON_PIN: False
    }

    while True:
        for pin in [LEFT_BUTTON_PIN, RIGHT_BUTTON_PIN, REFRESH_BUTTON_PIN]:
            button_pressed = GPIO.input(pin) == GPIO.LOW
            key = BUTTON_KEYS[pin]
            mode = BUTTON_MODES[pin]

            if button_pressed and not button_state[pin]:
                # Button just pressed
                if mode == 'click':
                    device.emit_click(key)
                    print(f"Button GPIO {pin}: Single click")
                else:  # hold mode
                    device.emit(key, 1)  # Press and hold
                    print(f"Button GPIO {pin}: Key pressed (holding)")
                button_state[pin] = True
                time.sleep(0.05)  # Debounce delay

            elif not button_pressed and button_state[pin]:
                # Button just released
                if mode == 'hold':
                    device.emit(key, 0)  # Release key
                    print(f"Button GPIO {pin}: Key released")
                button_state[pin] = False

        time.sleep(0.01)  # Polling delay

except KeyboardInterrupt:
    print("\nCleaning up...")
    # Release any held keys
    for pin in [LEFT_BUTTON_PIN, RIGHT_BUTTON_PIN, REFRESH_BUTTON_PIN]:
        if button_state[pin] and BUTTON_MODES[pin] == 'hold':
            device.emit(BUTTON_KEYS[pin], 0)
    GPIO.cleanup()
```

Save the file (`Ctrl+O`, `Enter`, `Ctrl+X`).

Make it executable:
```bash
chmod +x /home/pi/button-keys/button_keys.py
```

### Step 5: Test the Script

Run manually to test:
```bash
# If you set up permissions:
python3 /home/pi/button_keyboard.py

# Or with sudo:
sudo python3 /home/pi/button_keyboard.py
```

Press the buttons to test. You should see messages in the terminal and the arrow keys should work.

Press `Ctrl+C` to stop.

## Auto-Start on Boot (systemd Service)

### Step 1: Create Systemd Service File
```bash
sudo nano /etc/systemd/system/button-keyboard.service
```

Add this content:
```ini
[Unit]
Description=GPIO Button to Keyboard Mapper
After=multi-user.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /home/pi/button-keys/button_keys.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Step 2: Enable and Start the Service
```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable button-keyboard.service

# Start the service now
sudo systemctl start button-keyboard.service

# Check service status
sudo systemctl status button-keyboard.service
```

If status shows "active (running)" in green, it's working!

### Step 3: Reboot and Test
```bash
sudo reboot
```

After reboot, the service should start automatically. Test by pressing the buttons.

## Service Management Commands
```bash
# Check service status
sudo systemctl status button-keyboard.service

# Start service
sudo systemctl start button-keyboard.service

# Stop service
sudo systemctl stop button-keyboard.service

# Restart service
sudo systemctl restart button-keyboard.service

# Disable auto-start on boot
sudo systemctl disable button-keyboard.service

# Enable auto-start on boot
sudo systemctl enable button-keyboard.service

# View real-time logs
sudo journalctl -u button-keyboard.service -f

# View last 50 log entries
sudo journalctl -u button-keyboard.service -n 50

# View logs since last boot
sudo journalctl -u button-keyboard.service -b
```

## Troubleshooting

### Hold mode not working

If keys aren't staying pressed when buttons are held:

1. Verify button mode is set to 'hold':
```python
BUTTON_MODES = {
    YOUR_PIN: 'hold'  # Must be exactly 'hold', not 'click'
}
```

2. Check that the receiving application accepts held keys (some apps ignore continued key presses)

3. Test with a text editor - hold a button and you should see repeated characters

### Click mode not working

If single clicks aren't being detected:

1. Verify debounce delay isn't too long:
```python
time.sleep(0.05)  # Decrease this value if clicks are missed
```

2. Check button bouncing - try increasing debounce:
```python
time.sleep(0.1)  # Increase if you're getting double clicks
```

### Service won't start
```bash
# Check for errors
sudo journalctl -u button-keyboard.service -n 50

# Check if uinput module is loaded
lsmod | grep uinput

# Load uinput module manually
sudo modprobe uinput
```

### Buttons not responding

1. Check wiring connections
2. Test GPIO pins manually:
```bash
# Install gpio tools
sudo apt-get install raspi-gpio

# Check pin status
raspi-gpio get 17
raspi-gpio get 22
```

3. Check service logs for errors

### Permission errors

If you see permission errors:
```bash
# Run with sudo
sudo python3 /home/pi/button_keyboard.py

# Or ensure udev rules are set up correctly
sudo cat /etc/udev/rules.d/99-input.rules

# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

## Customization

### Change GPIO Pins

Edit the script and modify these lines:
```python
LEFT_BUTTON_PIN = 17   # Change to your desired GPIO
RIGHT_BUTTON_PIN = 22  # Change to your desired GPIO
REFRESH_BUTTON_PIN = 27  # Change to your desired GPIO
```

### Change Keyboard Keys

Edit the uinput device creation and emit_click calls. Available keys include:
```python
uinput.KEY_UP
uinput.KEY_DOWN
uinput.KEY_LEFT
uinput.KEY_RIGHT
uinput.KEY_ENTER
uinput.KEY_SPACE
uinput.KEY_ESC
uinput.KEY_A  # through KEY_Z
uinput.KEY_0  # through KEY_9
# And many more...
```

Example for Enter and Space:
```python
device = uinput.Device([
    uinput.KEY_ENTER,
    uinput.KEY_SPACE
])

# In the loop:
device.emit_click(uinput.KEY_ENTER)
device.emit_click(uinput.KEY_SPACE)
```

### Adjust Debounce Timing

Modify the sleep values in the script:
```python
time.sleep(0.05)  # Debounce delay (increase if buttons are too sensitive)
time.sleep(0.01)  # Polling delay (decrease for faster response)
```

### Enable Hold Mode for Specific Buttons

To enable hold mode for a button (e.g., spacebar for auto-refresh toggle), modify the `BUTTON_MODES` dictionary:

```python
BUTTON_MODES = {
    LEFT_BUTTON_PIN: 'click',      # Single press and release
    RIGHT_BUTTON_PIN: 'click',     # Single press and release
    REFRESH_BUTTON_PIN: 'hold'     # Key stays pressed while button held
}
```

**Click mode** uses `emit_click()` - sends instant press and release.

**Hold mode** uses:
- `emit(key, 1)` - Press and hold the key
- `emit(key, 0)` - Release the key

This allows the key to stay active for as long as the physical button is held, enabling:
- Continuous scrolling with arrow keys
- Auto-refresh toggle with spacebar
- Holding modifier keys

**Example: Hold mode for left arrow (continuous scroll left)**
```python
BUTTON_MODES = {
    LEFT_BUTTON_PIN: 'hold',       # Hold to scroll continuously
    RIGHT_BUTTON_PIN: 'click',
    REFRESH_BUTTON_PIN: 'hold'
}
```

## Additional Notes

- **Pull-up resistors**: The script uses internal pull-up resistors, so buttons should connect GPIO to GND
- **Headless operation**: Works without X11/GUI, perfect for kiosk setups
- **Multiple buttons**: You can easily add more buttons by following the same pattern
- **Root requirement**: The service runs as root to access uinput without permission issues
- **Hold mode**: Best for continuous actions (auto-refresh, continuous scrolling)
- **Click mode**: Best for single events (navigation, entering)
- **Key release cleanup**: The script automatically releases held keys on exit (KeyboardInterrupt)

## Complete Uninstall

To remove everything:
```bash
# Stop and disable service
sudo systemctl stop button-keyboard.service
sudo systemctl disable button-keyboard.service

# Remove service file
sudo rm /etc/systemd/system/button-keyboard.service

# Reload systemd
sudo systemctl daemon-reload

# Remove script
rm /home/pi/button_keyboard.py

# Remove udev rule (optional)
sudo rm /etc/udev/rules.d/99-input.rules

# Remove uinput from auto-load (optional)
sudo sed -i '/uinput/d' /etc/modules
```

## References

- [RPi.GPIO Documentation](https://sourceforge.net/p/raspberry-gpio-python/wiki/Home/)
- [python-uinput on GitHub](https://github.com/tuomasjjrasanen/python-uinput)
- [Raspberry Pi GPIO Pinout](https://pinout.xyz/)

---

**Author**: Arfan  
**Date**: December 2025  
**License**: MIT
# Focus Display

A beautiful, full-screen task display that rotates through your goals and tasks to keep you focused throughout the day. Perfect for teams who want to visualize their priorities on a shared screen or monitor.

![Focus Display Preview](https://img.shields.io/badge/status-active-brightgreen)

## Features

### Current Features
- **Rotating Display** - Automatically cycles through tasks every 5 seconds
- **Clean Interface** - Minimal, distraction-free design with gradient background
- **Manual Navigation** - Previous/Next buttons to manually browse tasks
- **Pause/Resume** - Control the automatic rotation
- **Fullscreen Mode** - Immersive display for dedicated monitors
- **Progress Bar** - Visual indicator showing time until next task
- **Keyboard Shortcuts** - Quick controls without using the mouse
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### Coming Soon
- **Trello Integration** - Sync tasks directly from your Trello boards
- **Local Storage** - Save your tasks for persistence
- **Custom Timing** - Adjust rotation speed
- **Theme Options** - Customize colors and styles
- **Task Management UI** - Add/edit/remove tasks without URL editing

## Quick Start

### Basic Usage

1. Open `index.html` in your web browser
2. Add tasks using URL parameters:

```
index.html?goals=Complete project proposal|Review team feedback|Update documentation|Plan sprint meeting
```

Use the pipe character `|` to separate multiple tasks.

### Example URLs

**Single Task:**
```
index.html?goals=Focus on deep work
```

**Multiple Tasks:**
```
index.html?goals=Morning standup at 9 AM|Code review session|Lunch break|Afternoon focus block|Team sync at 4 PM
```

**Real-World Example:**
```
index.html?goals=Deploy v2.0 to production|Review pull requests|Update API documentation|Team retrospective|Plan next sprint
```

## Controls

### Mouse/Touch Controls
- **Previous Button** - Go to previous task
- **Next Button** - Go to next task
- **Pause Button** - Pause/resume automatic rotation
- **Fullscreen Button** - Enter/exit fullscreen mode

### Keyboard Shortcuts
- `←` (Left Arrow) - Previous task
- `→` (Right Arrow) - Next task
- `Space` - Pause/Resume
- `F` - Toggle fullscreen

## Setup for Team Display

### Option 1: Shared Monitor/TV
1. Open the application on a computer connected to a shared display
2. Enter fullscreen mode (press `F` or click Fullscreen button)
3. Let it rotate through team priorities automatically

### Option 2: Kiosk Mode
For Chrome-based browsers:
```bash
google-chrome --kiosk --app="file:///path/to/focus-display/index.html?goals=task1|task2|task3"
```

For Firefox:
```bash
firefox --kiosk "file:///path/to/focus-display/index.html?goals=task1|task2|task3"
```

### Option 3: Web Server
Host the `index.html` file on any web server and share the URL with your team:
```
http://yourserver.com/focus-display/index.html?goals=task1|task2|task3
```

## Planned Trello Integration

We're working on direct Trello integration to automatically sync your team's tasks!

### How It Will Work

1. **Connect Your Trello Account** - One-click OAuth authentication
2. **Select Board & List** - Choose which Trello board/list to display
3. **Auto-Sync** - Tasks automatically update from Trello
4. **Real-Time Updates** - See new tasks as they're added
5. **Mark Complete** - Check off tasks directly from the display

### Why Trello?

- **Team Collaboration** - Unlike personal task managers, Trello is built for teams
- **Easy API** - Straightforward integration
- **Free Tier** - Generous free plan for most teams
- **Widely Used** - Chances are your team already uses it
- **Flexible** - Works for any workflow (Kanban, Scrum, custom)

### Getting Ready for Trello Integration

To prepare for the upcoming Trello integration:

1. **Create a Trello account** at [trello.com](https://trello.com) (if you don't have one)
2. **Set up your team board** with your tasks
3. **Organize lists** - We'll support syncing specific lists (e.g., "Today", "In Progress", "Priority")
4. Stay tuned for the integration release!

## Technical Details

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### No Dependencies
This is a single HTML file with no external dependencies. Just open and use!

### Offline Support
Currently works offline with URL parameters. Trello integration will require internet connection for syncing.

## Customization

### Rotation Speed
Currently set to 5 seconds per task. This will be customizable in a future update.

### Display Size
The text size automatically adjusts based on screen size:
- Desktop: 4rem
- Tablet: 2.5rem
- Mobile: 1.8rem
- Fullscreen: 5rem

## Use Cases

### Development Teams
- Sprint goals
- Daily standup reminders
- Code review priorities
- Deployment checklists

### Marketing Teams
- Campaign deadlines
- Content calendar
- Social media schedule
- Launch checklists

### General Office
- Team OKRs
- Daily priorities
- Meeting schedules
- Important announcements

### Personal Use
- Daily affirmations
- Study goals
- Workout routines
- Habit reminders

## Contributing

We welcome contributions! Some ideas:
- Additional integrations (Asana, Linear, Notion)
- Theme customization options
- Sound notifications
- Timer features (Pomodoro)
- Task completion tracking

## Roadmap

### v1.1 (Current)
- ✅ Basic task rotation
- ✅ Keyboard controls
- ✅ Fullscreen mode
- ✅ Progress indicator

### v1.2 (In Progress)
- 📝 README documentation
- 🎯 Trello integration planning

### v2.0 (Planned)
- 🔄 Trello API integration
- 💾 Local storage for tasks
- ⚙️ Settings panel
- 🎨 Theme customization
- ⏱️ Custom rotation timing
- ✅ Task completion tracking

### v3.0 (Future)
- 📊 Analytics dashboard
- 🔔 Notifications
- 👥 Multiple integration support
- 🌐 Web hosting service
- 📱 Mobile app

## License

Open source - feel free to use, modify, and distribute.

## Questions or Feedback?

Found a bug? Have a feature request? Want to contribute?

Open an issue or submit a pull request!

---

**Built with ❤️ for teams who want to stay focused on what matters most.**

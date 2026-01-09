# 📋 Corporate Productivity Suite

A modern, responsive web application for managing contacts, todos, notes, documents, and calendar events with offline support.

## 🚀 Features
### 📇 Contacts Manager

- Alphabetical Organization: Contacts automatically sorted and grouped by first letter

- Corporate Design: Clean, professional interface with contact avatars

- Offline Support: Works without API connection (stores changes locally)

- Search & Filter: Quickly find contacts by name, email, or phone

- Edit/Delete: Full CRUD operations for contact management

### 📝 Todo Manager
- Task Management: Create, update, and delete tasks

- Completion Tracking: Mark tasks as complete/incomplete

- Offline First: Local storage with API sync when available

- Clean Interface: Simple, intuitive task management

- Real-time Updates: Immediate feedback on all actions

### 📓 Notes Manager
- Rich Text Notes: Create notes with titles and detailed content

- Grid Layout: Responsive card-based display

- Edit in Place: Quick editing without page reloads

- Offline Storage: Notes saved locally and synced to API

- Search Functionality: Find notes by title or content

### 📄 Document Editor
- Rich Text Editing: Powered by TinyMCE with full toolbar

- Multiple Formats: Import/Export DOCX, HTML, TXT, RTF files

- File Support: Open existing documents in various formats

- Auto-save: Automatic saving of work in progress

- Document Stats: Word count, character count, and file size

- Professional Templates: Corporate document styling

### 📅 Calendar Manager
- Multiple Views: Month, Week, and Day views

- Event Types: Color-coded events (Meetings, Tasks, Reminders, etc.)

- Drag & Drop: Intuitive event creation and editing

- Offline Mode: Calendar events stored locally

- Responsive Design: Works on desktop and mobile

- Event Details: Click events for detailed view and editing

## 🛠️ Technology Stack
### Frontend
- React 18: Modern component-based architecture

- CSS3: Custom corporate styling with responsive design

- TinyMCE: Rich text editor for document editing

- Mammoth.js: DOCX file parsing

- LocalStorage: Offline data persistence

- Axios: HTTP client for API communication

## Backend (Optional)
- Node.js/Express: REST API server

- MongoDB: Database for data persistence

- JWT: Authentication and authorization

## 📁 Project Structure
```text
corporate-productivity-suite/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Contacts/
│   │   │   ├── Contacts.jsx
│   │   │   └── Contacts.css
│   │   ├── Todo/
│   │   │   ├── Todo.jsx
│   │   │   └── Todo.css
│   │   ├── Notes/
│   │   │   ├── Note.jsx
│   │   │   └── Note.css
│   │   ├── TextEditor/
│   │   │   ├── TextEditor.jsx
│   │   │   └── TextEditor.css
│   │   ├── Calendar/
│   │   │   ├── Calendar.jsx
│   │   │   └── Calendar.css
│   │   └── App.jsx
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── README.md
└── .gitignore
```

## 🚀 Getting Started
### Prerequisites
- Node.js 16+ and npm/yarn

### Installation
- Clone the repository

```
bash
git clone <repository-url>
cd corporate-productivity-suite
Install dependencies
```
```
bash
npm install
```
#### or
```
yarn install
```
- Set up environment variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TINYMCE_API_KEY=your_tinymce_api_key_here
```
- Run the development server
```
npm start
```

#### or
```
yarn start
```

### 🔧 Configuration
#### TinyMCE API Key
- Get a free API key from TinyMCE

- Add it to your .env file:

```
REACT_APP_TINYMCE_API_KEY=your_api_key_here
```
#### Backend API
Update the API URL in your components if using a different backend:

```
// In each component, update the API_URL constant
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```
## 📱 Usage Guide
### Contacts
- Click "Add Contact" or use the form at the top

- Fill in name, email, and phone

- Contacts automatically sort alphabetically

- Click edit/delete buttons on contact cards

### Todos
- Enter task in the input field

- Press Enter or click "Add Todo"

- Click "Done" to mark complete

- Use edit/delete buttons for management

### Notes
- Enter title and content in the form

- Click "Add Note" to create

- Notes display in a responsive grid

- Edit or delete notes as needed

### Document Editor
- Use the toolbar for formatting

- Type or paste content

- Open existing files with "Open" button

- Export as DOCX, HTML, or TXT

- Auto-save preserves your work

### Calendar
- Switch between Month, Week, and Day views

- Click "+ Create Event" to add new events

- Click events to view details

- Drag events to reschedule

- Use navigation buttons to move through time

## 🔒 Offline Mode

The application features built-in offline support:

- Local Storage: All data persists in browser storage

- API Sync: Automatically syncs when connection is restored

- Status Indicator: Shows online/offline status

- Graceful Degradation: Full functionality without internet

## 🎨 Design System
### Color Palette
- Primary: #6366f1 (Indigo) - Buttons, active states

- Success: #10b981 (Emerald) - Add/confirm actions

- Warning: #f59e0b (Amber) - Warnings, offline mode

- Error: #ef4444 (Red) - Delete/cancel actions

- Background: #f9fafb (Gray 50) - App background

- Cards: #ffffff (White) - Content containers

### Typography
- Font Family: Inter, -apple-system, sans-serif

- Headers: 1.875rem (30px), bold

- Body: 0.875rem (14px), regular

- Small Text: 0.75rem (12px), regular

### Spacing
- Base Unit: 0.25rem (4px)

- Padding: 1rem (16px) standard, 1.5rem (24px) for cards

- Margin: 1rem (16px) between sections

- Border Radius: 0.75rem (12px) for cards, 0.5rem (8px) for buttons

## 📱 Responsive Design
- Desktop: Full-width layouts with side navigation

- Tablet: Adjusted spacing and font sizes

- Mobile: Stacked layouts, touch-friendly buttons

### Breakpoints:

- Mobile: < 640px

- Tablet: 640px - 1024px

- Desktop: > 1024px

## 🔄 API Integration

```
GET    /api/contacts     - Get all contacts
POST   /api/contacts     - Create new contact
PUT    /api/contacts/:id - Update contact
DELETE /api/contacts/:id - Delete contact

GET    /api/todos        - Get all todos
POST   /api/todos        - Create new todo
PUT    /api/todos/:id    - Update todo
DELETE /api/todos/:id    - Delete todo

GET    /api/notes        - Get all notes
POST   /api/notes        - Create new note
PUT    /api/notes/:id    - Update note
DELETE /api/notes/:id    - Delete note

GET    /api/events       - Get all events
POST   /api/events       - Create new event
PUT    /api/events/:id   - Update event
DELETE /api/events/:id   - Delete event
```
## Data Models
```
// Contact
{
  _id: string,
  name: string,
  email: string,
  phone: string,
  createdAt: Date
}

// Todo
{
  _id: string,
  task: string,
  completed: boolean,
  createdAt: Date
}

// Note
{
  _id: string,
  title: string,
  content: string,
  createdAt: Date
}

// Event
{
  _id: string,
  title: string,
  description: string,
  datetime: Date,
  endDatetime: Date,
  location: string,
  type: string,
  createdAt: Date
}
```
## 🧪 Testing

Run the test suite:

```
npm test
```
#### or
```yarn test
```
### Test Coverage
- Component rendering

- User interactions

- Form validation

- API integration

- Offline functionality

## 🐛 Troubleshooting
### Common Issues
#### API Connection Failed

- Check backend server is running

- Verify API URL in environment variables

- App will fall back to offline mode

#### TinyMCE Not Loading

- Verify API key in .env file

- Check internet connection

- Editor will show fallback textarea

#### Local Storage Not Persisting

- Check browser storage permissions

- Clear browser cache and reload

- Ensure no browser extensions blocking storage

#### Date Display Issues

- Events showing on wrong day due to timezone

- Use the provided date helper functions

- Check system timezone settings

### Debug Mode
Enable debug logging in the browser console:

```
localStorage.setItem('debug', 'true');
```
## 📈 Performance
- Code Splitting: Components load on demand

- Lazy Loading: Images and heavy components

- Memoization: React.memo for expensive components

- Bundle Optimization: Tree shaking and minification

- Caching: LocalStorage and service workers

## 🔒 Security
- Input Validation: All user inputs are sanitized

- XSS Protection: React's built-in protection

- HTTPS: Recommended for production

- CORS: Configured for API security

- Environment Variables: Sensitive data stored securely

## 🌐 Browser Support
- Chrome 90+

- Firefox 88+

- Safari 14+

- Edge 90+

- Mobile Safari 14+

- Chrome for Android 90+

## 📄 License
- MIT License - see LICENSE file for details

## 👥 Contributing
- Fork the repository

- Create a feature branch

- Commit changes

- Push to the branch

- Open a Pull Request

### Development Guidelines
- Follow existing code style

- Add tests for new features

- Update documentation

- Use descriptive commit messages

## 🤝 Support
For support, please:

- Check the troubleshooting section

- Search existing issues

- Create a new issue with details

## 🏆 Credits
- Design System: Custom corporate design

- Icons: Emoji and custom CSS icons

- Text Editor: TinyMCE

- DOCX Parsing: Mammoth.js

- Date Handling: Native JavaScript Date

## 🔮 Roadmap
### Planned Features
- User authentication and profiles

- Team collaboration features

- Advanced search and filtering

- Data export/import (CSV, JSON)

- Notifications and reminders

- Dark mode

- Keyboard shortcuts

- Voice commands

- Mobile apps (React Native)

## In Progress
- Performance optimizations

- Enhanced offline capabilities

- Additional file format support

## Demo

https://personal-desktop-assistant-xugx.onrender.com


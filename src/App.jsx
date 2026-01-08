import { Routes, Route, Link } from 'react-router-dom';
import Calendar from './calendar/Calendar';
import TextEditor from './editor/TextEditor';
import Note from './notes/Note';
import Todo from './todo/Todo';
import Contacts from './contacts/Contacts';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2 className="sidebar-title">
          Personal Desktop Assistant
        </h2>
        <ul className="nav-links">
          <li><Link to="/todo">Todo</Link></li>
          <li><Link to="/notes">Notes</Link></li>
          <li><Link to="/contacts">Contacts</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/editor">Text Editor</Link></li>      
        </ul>
      </nav>

      <div className="main-content">
        <Routes>
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/editor" element={<TextEditor />} />
          <Route path="/notes" element={<Note />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/" element={<Todo />} />
        </Routes>
      
        {/* Footer */}
        <footer className="footer">
          &copy; {new Date().getFullYear()} Mahen Mahindaratne | All rights reserved
        </footer>
      </div>
    </div>
  );
}
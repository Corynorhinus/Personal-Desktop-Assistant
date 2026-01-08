import React, { useState, useEffect } from 'react';
import "./Note.css";
import "../App.css";

const STORAGE_KEY = 'notes_data';

export default function Note() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      // Try API first
      const res = await fetch('/api/notes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setApiOnline(true);
      } else {
        throw new Error('API not available');
      }
    } catch (err) {
      // Fallback to localStorage
      setApiOnline(false);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    if (editingId) {
      // Update note
      const updatedNotes = notes.map((note) =>
        note._id === editingId ? { _id: editingId, title, content } : note
      );
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      // Try to sync with API if online
      if (apiOnline) {
        try {
          await fetch(`/api/notes/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
          });
        } catch (err) {
          setApiOnline(false);
        }
      }
    } else {
      // Add new note
      const newId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNote = { _id: newId, title, content };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      // Try to sync with API if online
      if (apiOnline) {
        try {
          await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
          });
        } catch (err) {
          setApiOnline(false);
        }
      }
    }

    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const updatedNotes = notes.filter((note) => note._id !== id);
    setNotes(updatedNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
    
    // Try to sync with API if online
    if (apiOnline) {
      try {
        await fetch(`/api/notes/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        setApiOnline(false);
      }
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note._id);
  };

  const cancelEdit = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  return (
    <div className="note-container">
      <h2 className="note-header">
        {editingId ? 'Edit Note' : 'Add Note'}
      </h2>

      {!apiOnline && (
        <div className="note-error">
          🔄 Offline mode: changes stored locally
        </div>
      )}

      <form onSubmit={handleSubmit} className="note-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="note-input"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
          rows={4}
          className="note-textarea"
        />
        <div className="note-actions">
          <button type="submit" className="note-add-btn">
            {editingId ? 'Update Note' : 'Add Note'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="note-cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="notes-list">
        {notes.length === 0 && <p className="note-empty">No notes yet.</p>}
        {notes.map((note) => (
          <div key={note._id} className="note-item">
            <h4>🗒️ {note.title}</h4>
            <p>{note.content}</p>
            <div className="note-actions">
              <button
                className="note-edit-btn"
                onClick={() => handleEdit(note)}
              >
              ✏️ Edit
              </button>
              <button
                className="note-delete-btn"
                onClick={() => handleDelete(note._id)}
              >
              🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Contacts.css";
import "../App.css";

const API_URL = 'http://localhost:5000/api/contacts';

export default function Contacts () {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);
  const [tempIdCounter, setTempIdCounter] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL);
      const sorted = res.data.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
      setContacts(sorted);
      setError(null);
      setApiOnline(true);
    } catch (err) {
      console.warn('Offline mode: changes stored in memory only');
      setError('Offline mode: changes stored in memory only');
      setApiOnline(false);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiOnline) {
      if (editingId) {
        setContacts((prev) =>
          prev.map((c) => (c._id === editingId ? { ...form, _id: editingId } : c))
        );
      } else {
        const tempId = `temp-${tempIdCounter}`;
        setContacts((prev) => [...prev, { ...form, _id: tempId }]);
        setTempIdCounter((c) => c + 1);
      }
      setForm({ name: '', email: '', phone: '' });
      setEditingId(null);
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({ name: '', email: '', phone: '' });
      setEditingId(null);
      fetchContacts();
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit. API might be offline.');
      setApiOnline(false);
    }
  };

  const handleEdit = (contact) => {
    setForm(contact);
    setEditingId(contact._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    if (!apiOnline) {
      setContacts((prev) => prev.filter((c) => c._id !== id));
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('Failed to delete contact.');
      setApiOnline(false);
    }
  };

  const groupedContacts = contacts.reduce((acc, contact) => {
    const letter = contact.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="contact-container">
        <div className="contact-header-container">
          <h2 className="contact-header">👥 Contacts</h2>
          <div className="status-indicator">
            <span className={`status-dot ${apiOnline ? 'online' : 'offline'}`}></span>
          </div>
        </div>

        {error && (
          <div className="contact-error">
            <div className="error-icon">⚠️</div>
            <div>{error}</div>
          </div>
        )}

        <div className="contact-form-card">
          <h3 className="form-title">
            {editingId ? '📝 Edit Contact' : '➕ Add New Contact'}
          </h3>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              className="form-input-sophisticated"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              className="form-input-sophisticated"
              name="email"
              type="email"
              placeholder="Professional Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className="form-input-sophisticated"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <div className="form-actions">
              <button type="submit" className="contact-add-btn">
                {editingId ? '📤 Update Contact' : '➕ Add Contact'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="contact-edit-btn"
                  onClick={() => {
                    setForm({ name: '', email: '', phone: '' });
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {contacts.length === 0 ? (
          <div className="contact-empty corporate-card">
            <div className="empty-icon">📇</div>
            <h3>No Contacts Found</h3>
            <p>Start by adding your first contact above.</p>
          </div>
        ) : (
          <div className="contact-directory">
            {Object.keys(groupedContacts)
              .sort()
              .map((letter) => (
                <div key={letter} className="contact-group corporate-card">
                  <div className="contact-letter-header">
                    <span className="contact-letter">{letter}</span>
                    <span className="letter-count">
                      {groupedContacts[letter].length} contact{groupedContacts[letter].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="contact-list">
                    {groupedContacts[letter].map((contact) => (
                      <div key={contact._id} className="contact-item corporate-card">
                        <div className="contact-avatar">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="contact-details">
                          <div className="contact-name">{contact.name}</div>
                          <div className="contact-info">
                            <span className="info-icon">📧</span>
                            <span className="info-value">{contact.email}</span>
                          </div>
                          <div className="contact-info">
                            <span className="info-icon">📞</span>
                            <span className="info-value">{contact.phone}</span>
                          </div>
                          {contact._id && contact._id.startsWith('temp-') && (
                            <div className="offline-indicator">
                              ⚠️ Offline (not synced)
                            </div>
                          )}
                        </div>
                        <div className="contact-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(contact)}
                            title="Edit Contact"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(contact._id)}
                            title="Delete Contact"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

}

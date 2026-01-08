import React, { useState, useEffect } from 'react';
import "./Calendar.css";
import "../App.css";

// Store events in localStorage for persistence
const STORAGE_KEY = 'calendar_events';

const eventTypes = [
  { value: 'meeting', label: 'Meeting', color: 'event-meeting', textColor: 'text-blue-700' },
  { value: 'reminder', label: 'Reminder', color: 'event-reminder', textColor: 'text-green-700' },
  { value: 'task', label: 'Task', color: 'event-task', textColor: 'text-yellow-700' },
  { value: 'event', label: 'Event', color: 'event-event', textColor: 'text-purple-700' },
  { value: 'personal', label: 'Personal', color: 'event-personal', textColor: 'text-pink-700' }
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

// Helper function to get date string in YYYY-MM-DD format
const getDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get date object without time component
const getDateWithoutTime = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [apiOnline, setApiOnline] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: getDateString(new Date()), // Use helper function
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    type: 'meeting'
  });

  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    type: 'meeting'
  });

  // Load events from localStorage on initial load
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Try to fetch from API first
        const API_BASE = 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE}/events`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setApiOnline(true);
          setError('');
        } else {
          throw new Error('API not available');
        }
      } catch (err) {
        // Fallback to localStorage
        setApiOnline(false);
        const storedEvents = localStorage.getItem(STORAGE_KEY);
        if (storedEvents) {
          setEvents(JSON.parse(storedEvents));
        }
        setError('Offline mode: changes stored locally');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0 || events.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events]);

  // Create new event
  const createEvent = async () => {
    if (!newEvent.title.trim()) return;
    
    const newId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Create datetime with proper timezone handling
    const eventDateTime = new Date(`${newEvent.date}T${newEvent.startTime}:00`);
    const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}:00`);
    
    const eventData = {
      _id: newId,
      title: newEvent.title,
      description: newEvent.description,
      datetime: eventDateTime.toISOString(),
      endDatetime: endDateTime.toISOString(),
      location: newEvent.location,
      type: newEvent.type,
      category: newEvent.type,
      name: newEvent.title,
      createdAt: new Date().toISOString()
    };
    
    const updatedEvents = [...events, eventData];
    setEvents(updatedEvents);
    setNewEvent({
      title: '',
      description: '',
      date: getDateString(new Date()),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      type: 'meeting'
    });
    setShowCreateForm(false);
    
    // Try to sync with API if online
    if (apiOnline) {
      try {
        await fetch('http://localhost:3001/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });
      } catch (err) {
        setApiOnline(false);
      }
    }
  };

  // Update event
  const updateEvent = async (id) => {
    const eventDateTime = new Date(`${editEvent.date}T${editEvent.startTime}:00`);
    const endDateTime = new Date(`${editEvent.date}T${editEvent.endTime}:00`);
    
    const updatedEvents = events.map(event => {
      if (event._id === id) {
        return {
          ...event,
          title: editEvent.title,
          description: editEvent.description,
          datetime: eventDateTime.toISOString(),
          endDatetime: endDateTime.toISOString(),
          location: editEvent.location,
          type: editEvent.type,
          category: editEvent.type,
          name: editEvent.title
        };
      }
      return event;
    });
    
    setEvents(updatedEvents);
    setEditingId(null);
    setEditEvent({
      title: '',
      description: '',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      type: 'meeting'
    });
    
    // Try to sync with API if online
    if (apiOnline) {
      try {
        const updatedEvent = updatedEvents.find(e => e._id === id);
        await fetch(`http://localhost:3001/api/events/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEvent)
        });
      } catch (err) {
        setApiOnline(false);
      }
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    const updatedEvents = events.filter(event => event._id !== id);
    setEvents(updatedEvents);
    
    // Try to sync with API if online
    if (apiOnline) {
      try {
        await fetch(`http://localhost:3001/api/events/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        setApiOnline(false);
      }
    }
  };

  // Start editing - for week/day view
  const startEdit = (event) => {
    const eventDate = new Date(event.datetime || event.createdAt);
    const endDate = event.endDatetime ? new Date(event.endDatetime) : new Date(eventDate.getTime() + 60 * 60 * 1000);
    
    setEditingId(event._id);
    setEditEvent({
      title: event.title || event.name || '',
      description: event.description || '',
      date: getDateString(eventDate), // Use helper function
      startTime: eventDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      location: event.location || '',
      type: event.type || event.category || 'meeting'
    });
  };

  // View event details - for month view
  const viewEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    
    // Also prepare for editing if needed
    const eventDate = new Date(event.datetime || event.createdAt);
    const endDate = event.endDatetime ? new Date(event.endDatetime) : new Date(eventDate.getTime() + 60 * 60 * 1000);
    
    setEditEvent({
      title: event.title || event.name || '',
      description: event.description || '',
      date: getDateString(eventDate), // Use helper function
      startTime: eventDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      location: event.location || '',
      type: event.type || event.category || 'meeting'
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditEvent({
      title: '',
      description: '',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      type: 'meeting'
    });
  };

  // Calendar navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date - FIXED VERSION
  const getEventsForDate = (date) => {
    // Create date object without time component for comparison
    const targetDate = getDateWithoutTime(date);
    const targetDateStr = getDateString(targetDate);
    
    return events.filter(event => {
      let eventDate;
      if (event.datetime) {
        eventDate = new Date(event.datetime);
      } else if (event.createdAt) {
        eventDate = new Date(event.createdAt);
      } else {
        return false;
      }
      
      // Compare dates without time component
      const eventDateStr = getDateString(eventDate);
      return eventDateStr === targetDateStr;
    });
  };

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventTypeInfo = (type) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      ...(viewMode === 'day' && { day: 'numeric' })
    });
  };

  // Format date for display in event details
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading calendar events...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header-container">
        <h2 className="calendar-header">
          📅 Corporate Calendar
        </h2>
        <div className="status-indicator">
          <span className={`status-dot ${apiOnline ? 'online' : 'offline'}`}></span>
          <span>{apiOnline ? 'API Online' : 'API Offline'}</span>
        </div>
      </div>

      {error && (
        <div className="calendar-error">
          <div className="error-icon">⚠️</div>
          <div>{error}</div>
        </div>
      )}
      
      {/* Calendar Controls */}
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button onClick={goToToday} className="today-btn">
            📍 Today
          </button>
          <div className="navigation-buttons">
            <button
              onClick={() => viewMode === 'month' ? navigateMonth(-1) : viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)}
              className="nav-btn"
              aria-label="Previous"
            >
              ←
            </button>
            <h3 className="current-month">
              {formatDateForDisplay(currentDate)}
            </h3>
            <button
              onClick={() => viewMode === 'month' ? navigateMonth(1) : viewMode === 'week' ? navigateWeek(1) : navigateDay(1)}
              className="nav-btn"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="view-toggle">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                aria-label={`${mode} view`}
                aria-pressed={viewMode === mode}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="create-event-btn"
            aria-label="Create new event"
          >
            ➕ Create Event
          </button>
        </div>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="month-view-container">
          <div className="weekdays-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {generateCalendarDays().map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const isToday = getDateString(day.date) === getDateString(new Date());

              return (
                <div
                  key={index}
                  className={`day-cell ${!day.isCurrentMonth ? 'not-current-month' : ''} ${isToday ? 'today' : ''}`}
                  aria-label={`${day.date.toLocaleDateString()}, ${dayEvents.length} events`}
                >
                  <div className="day-number">
                    {day.date.getDate()}
                  </div>
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map(event => {
                      const typeInfo = getEventTypeInfo(event.type || event.category);
                      const eventDate = new Date(event.datetime || event.createdAt);
                      return (
                        <div
                          key={event._id}
                          className={`day-event ${typeInfo.color}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            viewEventDetails(event);
                          }}
                          title={`${event.title || event.name} - ${formatTime(eventDate.toTimeString().slice(0, 5))}`}
                          aria-label={`${event.title || event.name}, ${typeInfo.label} event`}
                          style={{ cursor: 'pointer' }}
                        >
                          {event.title || event.name}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div 
                        className="event-count" 
                        onClick={() => alert(`View all ${dayEvents.length} events`)}
                        style={{ cursor: 'pointer' }}
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week/Day View */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="list-view-container">
          <div className="events-list">
            {events
              .filter(event => {
                const eventDate = new Date(event.datetime || event.createdAt);
                const eventDateStr = getDateString(eventDate);
                
                if (viewMode === 'day') {
                  const currentDateStr = getDateString(currentDate);
                  return eventDateStr === currentDateStr;
                } else {
                  // Week view - check if event is in current week
                  const weekStart = new Date(currentDate);
                  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                  weekStart.setHours(0, 0, 0, 0);
                  
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  weekEnd.setHours(23, 59, 59, 999);
                  
                  return eventDate >= weekStart && eventDate <= weekEnd;
                }
              })
              .sort((a, b) => new Date(a.datetime || a.createdAt) - new Date(b.datetime || b.createdAt))
              .map(event => {
                const typeInfo = getEventTypeInfo(event.type || event.category);
                const eventDate = new Date(event.datetime || event.createdAt);
                const endDate = event.endDatetime ? new Date(event.endDatetime) : null;

                return (
                  <div key={event._id} className="event-card corporate-card">
                    {editingId === event._id ? (
                      // Edit Mode
                      <div className="event-edit-form">
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label form-label-required">Event Title</label>
                            <input
                              type="text"
                              placeholder="Enter event title"
                              value={editEvent.title}
                              onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                              className="form-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label form-label-required">Date</label>
                            <input
                              type="date"
                              value={editEvent.date}
                              onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                              className="form-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label form-label-required">Start Time</label>
                            <select
                              value={editEvent.startTime}
                              onChange={(e) => setEditEvent({ ...editEvent, startTime: e.target.value })}
                              className="form-input"
                              required
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{formatTime(time)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label form-label-required">End Time</label>
                            <select
                              value={editEvent.endTime}
                              onChange={(e) => setEditEvent({ ...editEvent, endTime: e.target.value })}
                              className="form-input"
                              required
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{formatTime(time)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                              type="text"
                              placeholder="Enter location (optional)"
                              value={editEvent.location}
                              onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label form-label-required">Event Type</label>
                            <select
                              value={editEvent.type}
                              onChange={(e) => setEditEvent({ ...editEvent, type: e.target.value })}
                              className="form-input"
                              required
                            >
                              {eventTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea
                            placeholder="Enter event description (optional)"
                            value={editEvent.description}
                            onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                            className="form-textarea"
                            rows={3}
                          />
                        </div>
                        <div className="form-actions">
                          <button
                            onClick={() => updateEvent(event._id)}
                            className="save-btn"
                            disabled={!editEvent.title.trim()}
                          >
                            💾 Update Event
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="cancel-btn"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="event-view-content">
                        <div className="event-header">
                          <div className="event-title-container">
                            <div className="event-title">
                              <span className="event-title-text">
                                {event.title || event.name}
                              </span>
                              <span className={`event-type-badge ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </div>
                          </div>
                          <div className="event-actions">
                            <button
                              onClick={() => startEdit(event)}
                              className="event-action-btn edit"
                              title="Edit Event"
                              aria-label="Edit event"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteEvent(event._id)}
                              className="event-action-btn delete"
                              title="Delete Event"
                              aria-label="Delete event"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="event-details">
                          <div className="event-detail">
                            <span className="event-detail-icon">📅</span>
                            <span className="event-detail-text">
                              {formatEventDate(event.datetime || event.createdAt)} • {formatTime(new Date(event.datetime || event.createdAt).toTimeString().slice(0, 5))}
                              {endDate && ` - ${formatTime(endDate.toTimeString().slice(0, 5))}`}
                            </span>
                          </div>

                          {event.location && (
                            <div className="event-detail">
                              <span className="event-detail-icon">📍</span>
                              <span className="event-detail-text">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <div className="event-description">
                            {event.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {((viewMode === 'day' && !events.some(e => getDateString(new Date(e.datetime || e.createdAt)) === getDateString(currentDate))) ||
              (viewMode === 'week' && !events.some(e => {
                const eventDate = new Date(e.datetime || e.createdAt);
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                weekStart.setHours(0, 0, 0, 0);
                
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                
                return eventDate >= weekStart && eventDate <= weekEnd;
              }))) && (
              <div className="empty-state corporate-card">
                <div className="empty-state-icon">📅</div>
                <h3>No Events Scheduled</h3>
                <p>This {viewMode} is clear. Create a new event to get started!</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="create-event-btn"
                  style={{ marginTop: '1.5rem', maxWidth: '200px', marginLeft: 'auto', marginRight: 'auto' }}
                >
                  ➕ Create Your First Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Details Modal for Month View */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                📅 Event Details
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="modal-close-btn"
                title="Close"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <div className="event-detail-value">
                  {selectedEvent.title || selectedEvent.name}
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <div className="event-detail-value">
                    {formatEventDate(selectedEvent.datetime || selectedEvent.createdAt)}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <div className="event-detail-value">
                    <span className={`event-type-badge ${getEventTypeInfo(selectedEvent.type || selectedEvent.category).color}`}>
                      {getEventTypeInfo(selectedEvent.type || selectedEvent.category).label}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <div className="event-detail-value">
                    {formatTime(new Date(selectedEvent.datetime || selectedEvent.createdAt).toTimeString().slice(0, 5))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <div className="event-detail-value">
                    {selectedEvent.endDatetime ? 
                      formatTime(new Date(selectedEvent.endDatetime).toTimeString().slice(0, 5)) : 
                      'Not specified'}
                  </div>
                </div>
                {selectedEvent.location && (
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <div className="event-detail-value">
                      {selectedEvent.location}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <div className="event-description-view">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  startEdit(selectedEvent);
                  setViewMode('day');
                }}
                className="create-btn-primary"
              >
                ✏️ Edit Event
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this event?')) {
                    deleteEvent(selectedEvent._id);
                    setShowEventModal(false);
                  }
                }}
                className="create-btn-secondary"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none' }}
              >
                🗑️ Delete Event
              </button>
              <button
                onClick={() => setShowEventModal(false)}
                className="create-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                ➕ Create New Event
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="modal-close-btn"
                title="Close"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label form-label-required">Event Title</label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Start Time</label>
                  <select
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="form-input"
                    required
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">End Time</label>
                  <select
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="form-input"
                    required
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    placeholder="Enter location (optional)"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="form-input"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Enter event description (optional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="form-textarea"
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowCreateForm(false)}
                className="create-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                className="create-btn-primary"
                disabled={!newEvent.title.trim()}
              >
                ➕ Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import "./Todo.css";
import "../App.css";

const STORAGE_KEY = 'todos_data';

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      // Try API first
      const res = await fetch('/api/todos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
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
        setTodos(JSON.parse(stored));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    if (editingId) {
      // Update todo
      const updatedTodos = todos.map((todo) =>
        todo._id === editingId ? { ...todo, task } : todo
      );
      setTodos(updatedTodos);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      
      // Try to sync with API if online
      if (apiOnline) {
        try {
          await fetch(`/api/todos/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task })
          });
        } catch (err) {
          setApiOnline(false);
        }
      }
    } else {
      // Add new todo
      const newId = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTodo = { _id: newId, task, completed: false };
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      
      // Try to sync with API if online
      if (apiOnline) {
        try {
          await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task, completed: false })
          });
        } catch (err) {
          setApiOnline(false);
        }
      }
    }

    setTask('');
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const updatedTodos = todos.filter((todo) => todo._id !== id);
    setTodos(updatedTodos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
    
    // Try to sync with API if online
    if (apiOnline) {
      try {
        await fetch(`/api/todos/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        setApiOnline(false);
      }
    }
  };

  const handleToggleComplete = async (todo) => {
    const updatedTodo = { ...todo, completed: !todo.completed };
    const updatedTodos = todos.map((t) => (t._id === todo._id ? updatedTodo : t));
    setTodos(updatedTodos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
    
    // Try to sync with API if online
    if (apiOnline) {
      try {
        await fetch(`/api/todos/${todo._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: todo.task, completed: !todo.completed })
        });
      } catch (err) {
        setApiOnline(false);
      }
    }
  };

  const handleEdit = (todo) => {
    setTask(todo.task);
    setEditingId(todo._id);
  };

  const cancelEdit = () => {
    setTask('');
    setEditingId(null);
  };

  return (
    <div className="todo-container">
      <h2 className="todo-header">{editingId ? 'Edit Todo' : 'Add Todo'}</h2>

      {!apiOnline && (
        <div className="todo-error">
          🔄 Offline mode: changes stored locally
        </div>
      )}

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter task"
          required
          className="todo-input"
        />
        <div className="todo-actions">
          <button type="submit" className="todo-add-btn">
            {editingId ? 'Update Todo' : 'Add Todo'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="todo-cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="todo-subheader">Todo List</h3>
      {todos.length === 0 && <p className="todo-empty">No todos yet.</p>}

      <div className="todo-list">
        {todos.map((todo) => (
          <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <span className={`todo-task ${todo.completed ? 'todo-done' : ''}`}>
              📋 {todo.task}
            </span>
            <div className="todo-actions">
              <button
                onClick={() => handleToggleComplete(todo)}
                className={`todo-done-btn ${todo.completed ? 'todo-undo-btn' : ''}`}
              >
                {todo.completed ? 'Undo' : 'Done'}
              </button>
              <button
                onClick={() => handleEdit(todo)}
                className="todo-edit-btn"
              >
              ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(todo._id)}
                className="todo-delete-btn"
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
import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import * as mammoth from 'mammoth';
import "./TextEditor.css";
import "../App.css";

export default function TextEditor ({
  apiKey = 'YOUR TINYMCE_API_KEY',
  initialContent = '',
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [currentFileName, setCurrentFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [documentContent, setDocumentContent] = useState(initialContent);

  // Handle file opening
  const handleFileOpen = () => {
    fileInputRef.current?.click();
  };

  // Process selected file
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setCurrentFileName(file.name);

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      let content = '';

      switch (fileExtension) {
        case 'docx':
          content = await readDocxFile(file);
          break;
        case 'doc':
          content = await readDocFile(file);
          break;
        case 'txt':
          content = await readTextFile(file);
          break;
        case 'html':
        case 'htm':
          content = await readHtmlFile(file);
          break;
        case 'rtf':
          content = await readRtfFile(file);
          break;
        default:
          // Try to read as plain text
          content = await readTextFile(file);
      }

      // Set content in editor
      if (editorRef.current) {
        editorRef.current.setContent(content);
        setDocumentContent(content);
      }

      // Update word count
      updateWordCount(content);

    } catch (error) {
      console.error('Error reading file:', error);
      alert(`Error opening file: ${error.message}`);
    } finally {
      setIsLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Read DOCX files using mammoth
  const readDocxFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to read DOCX file. Please ensure it\'s a valid document.');
    }
  };

  // Read DOC files (legacy format)
  const readDocFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      return result.value;
    } catch (error) {
      // Fallback: try to read as text
      return await readTextFile(file);
    }
  };

  // Read plain text files
  const readTextFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        // Convert plain text to HTML with line breaks
        const htmlContent = text.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        resolve(htmlContent);
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Read HTML files
  const readHtmlFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let html = e.target.result;
        
        // Extract body content if it's a complete HTML document
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          html = bodyMatch[1];
        }
        
        // Remove script tags for security
        html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
        
        resolve(html);
      };
      reader.onerror = () => reject(new Error('Failed to read HTML file'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Read RTF files (basic conversion)
  const readRtfFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let rtfContent = e.target.result;
        
        // Basic RTF to HTML conversion (simplified)
        rtfContent = rtfContent.replace(/\\par\s*/g, '<br>');
        rtfContent = rtfContent.replace(/\\b\s*(.*?)\\b0/g, '<strong>$1</strong>');
        rtfContent = rtfContent.replace(/\\i\s*(.*?)\\i0/g, '<em>$1</em>');
        rtfContent = rtfContent.replace(/\\ul\s*(.*?)\\ul0/g, '<u>$1</u>');
        
        // Remove RTF control codes
        rtfContent = rtfContent.replace(/\\[a-z]+\d*/g, '');
        rtfContent = rtfContent.replace(/[{}]/g, '');
        
        resolve(rtfContent);
      };
      reader.onerror = () => reject(new Error('Failed to read RTF file'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Create DOCX file using a simple alternative method
  const createDocxFile = (content) => {
    // Simple alternative: create HTML file with .docx extension
    // Note: This creates an HTML file but with .docx extension
    // For production, you might want to use a proper DOCX library
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Document</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1, h2, h3, h4, h5, h6 { color: #2c3e50; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    
    return new Blob([html], { type: 'application/msword' });
  };

  // Handle DOCX download (alternative implementation)
  const handleDownloadDocx = (e) => {
    e.preventDefault();
    const content = editorRef.current?.getContent() || documentContent || '';
    const blob = createDocxFile(content);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentFileName ? 
      currentFileName.replace(/\.[^/.]+$/, '.docx') : 
      'document.docx';
    link.click();
    URL.revokeObjectURL(link.href);
    setLastSaved(new Date());
  };

  // Handle new document
  const handleNewDocument = () => {
    if (editorRef.current) {
      const hasContent = editorRef.current.getContent().trim() !== '';
      if (hasContent && !window.confirm('Are you sure you want to create a new document? Unsaved changes will be lost.')) {
        return;
      }
      editorRef.current.setContent('');
      setDocumentContent('');
      setCurrentFileName('');
      setWordCount(0);
      setCharacterCount(0);
    }
  };

  // Handle save as HTML
  const handleSaveAsHtml = () => {
    const content = editorRef.current?.getContent() || documentContent || '';
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Document</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1, h2, h3, h4, h5, h6 { color: #2c3e50; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentFileName ? 
      currentFileName.replace(/\.[^/.]+$/, '.html') : 
      'document.html';
    link.click();
    URL.revokeObjectURL(link.href);
    setLastSaved(new Date());
  };

  // Handle save as plain text
  const handleSaveAsText = () => {
    const content = editorRef.current?.getContent() || documentContent || '';
    // Convert HTML to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const blob = new Blob([plainText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentFileName ? 
      currentFileName.replace(/\.[^/.]+$/, '.txt') : 
      'document.txt';
    link.click();
    URL.revokeObjectURL(link.href);
    setLastSaved(new Date());
  };

  // Update word count
  const updateWordCount = (content) => {
    const plainContent = content.replace(/<[^>]*>/g, '');
    const wordArray = plainContent.split(/\s+/).filter(word => word.length > 0);
    setWordCount(wordArray.length);
    setCharacterCount(plainContent.length);
  };

  // Handle editor change
  const handleEditorChange = (content) => {
    setDocumentContent(content);
    updateWordCount(content);
    
    // Auto-save if enabled
    if (autoSave) {
      localStorage.setItem('document_autosave', content);
    }
  };

  // Load auto-saved content
  useEffect(() => {
    const savedContent = localStorage.getItem('document_autosave');
    if (savedContent && autoSave) {
      setDocumentContent(savedContent);
      updateWordCount(savedContent);
    }
  }, [autoSave]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="main-content">
      <div className="text-editor-container">
        <div className="editor-header-container">
          <h2 className="text-editor-header">✏️ Corporate Document Editor</h2>
          <div className="editor-status-bar">
            <div className="status-indicator">
              <span className="status-dot online"></span>
              <span className="status-text">Editor Ready</span>
              {currentFileName && (
                <span className="current-file">
                  📄 {currentFileName}
                </span>
              )}
              <div className="document-stats">
                <span className="stat-item">
                  📝 {wordCount} words
                </span>
                <span className="stat-item">
                  🔤 {characterCount} chars
                </span>
                {lastSaved && (
                  <span className="stat-item">
                    💾 {formatDate(lastSaved)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading document...</p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".txt,.html,.htm,.docx,.doc,.rtf"
          style={{ display: 'none' }}
        />

        <div className="editor-toolbar corporate-card">
          <div className="toolbar-section">
            <h4 className="section-title">📁 File</h4>
            <div className="toolbar-buttons">
              <button 
                type="button" 
                className="toolbar-button-new-open"
                onClick={handleNewDocument}
                title="New Document"
              >
                <span className="btn-icon">📄</span>
                New
              </button>
              <button 
                type="button" 
                className="toolbar-button-new-open"
                onClick={handleFileOpen}
                title="Open File"
              >
                <span className="btn-icon">📂</span>
                Open
              </button>
            </div>
          </div>
          
          <div className="toolbar-section">
            <h4 className="section-title">💾 Export</h4>
            <div className="toolbar-buttons">
              <button 
                type="button" 
                className="toolbar-button-save"
                onClick={handleDownloadDocx}
                title="Save as DOCX (HTML-based)"
              >
                <span className="btn-icon">📋</span>
                DOCX
              </button>
              <button 
                type="button" 
                className="toolbar-button-save"
                onClick={handleSaveAsHtml}
                title="Save as HTML"
              >
                <span className="btn-icon">🌐</span>
                HTML
              </button>
              <button 
                type="button" 
                className="toolbar-button-save"
                onClick={handleSaveAsText}
                title="Save as Text"
              >
                <span className="btn-icon">📝</span>
                TXT
              </button>
            </div>
          </div>

          <div className="toolbar-section">
            <h4 className="section-title">⚙️ Settings</h4>
            <div className="toolbar-settings">
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Auto-save
              </label>
            </div>
          </div>
        </div>

        <div className="editor-container corporate-card">
          <Editor
            id="editor"
            apiKey={apiKey}
            onInit={(evt, editor) => {
              editorRef.current = editor;
              // Set initial content
              if (documentContent) {
                editor.setContent(documentContent);
              }
            }}
            onEditorChange={handleEditorChange}
            initialValue={documentContent}
            init={{
              height: 600,
              menubar: true,
              branding: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                'emoticons', 'autosave', 'save'
              ],
              toolbar: 'undo redo | styles | bold italic underline strikethrough | ' +
                'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | link image media table | ' +
                'emoticons charmap | code fullscreen preview | help',
              content_style: `
                body { 
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                  font-size: 11pt; 
                  line-height: 1.6; 
                  color: #1e293b;
                  padding: 20px;
                }
                h1 { 
                  color: #0f172a; 
                  font-size: 24pt; 
                  font-weight: 700; 
                  margin-top: 24px; 
                  margin-bottom: 16px;
                  border-bottom: 2px solid #e2e8f0;
                  padding-bottom: 8px;
                }
                h2 { 
                  color: #1e293b; 
                  font-size: 20pt; 
                  font-weight: 600; 
                  margin-top: 20px; 
                  margin-bottom: 12px;
                }
                h3 { 
                  color: #334155; 
                  font-size: 16pt; 
                  font-weight: 600; 
                  margin-top: 16px; 
                  margin-bottom: 8px;
                }
                p { 
                  margin-bottom: 16px; 
                  text-align: justify;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 16px 0;
                }
                table, th, td {
                  border: 1px solid #cbd5e1;
                }
                th, td {
                  padding: 8px 12px;
                  text-align: left;
                }
                th {
                  background: #f8fafc;
                  font-weight: 600;
                }
                blockquote {
                  border-left: 4px solid #3b82f6;
                  margin: 16px 0;
                  padding-left: 16px;
                  color: #475569;
                  font-style: italic;
                }
                code {
                  background: #f1f5f9;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-family: 'Courier New', monospace;
                  font-size: 0.9em;
                }
              `,
              paste_data_images: true,
              automatic_uploads: false,
              file_picker_types: 'image',
              contextmenu: 'link image table',
              autoresize_bottom_margin: 50,
              menubar: 'file edit view insert format tools table help',
              statusbar: true,
              toolbar_mode: 'sliding',
              skin: 'oxide',
              content_css: 'default'
            }}
          />
        </div>

        <div className="editor-footer corporate-card">
          <div className="footer-stats">
            <div className="stat-group">
              <span className="stat-label">Document Stats:</span>
              <span className="stat-item">
                <strong>Words:</strong> {wordCount}
              </span>
              <span className="stat-item">
                <strong>Characters:</strong> {characterCount}
              </span>
              <span className="stat-item">
                <strong>Size:</strong> {formatFileSize(characterCount)}
              </span>
            </div>
            <div className="stat-group">
              <span className="stat-label">Status:</span>
              <span className="stat-item">
                <strong>Auto-save:</strong> {autoSave ? 'On' : 'Off'}
              </span>
              <span className="stat-item">
                <strong>Last saved:</strong> {formatDate(lastSaved)}
              </span>
            </div>
          </div>
          <div className="footer-actions">
            <button 
              className="quick-save-btn"
              onClick={handleDownloadDocx}
            >
              💾 Save Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      } else {
        alert("Please upload a valid image file.");
      }
      e.dataTransfer.clearData();
    }
  }, [onUpload]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  };

  return (
    <div 
      className="card animate-fade-in"
      style={{
        width: '100%',
        maxWidth: '700px',
        padding: '64px 40px',
        textAlign: 'center',
        border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border)',
        backgroundColor: isDragging ? 'var(--primary-light)' : 'var(--surface)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: 'var(--primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        color: 'var(--primary)',
        boxShadow: '0 4px 12px rgba(0,77,64,0.05)'
      }}>
        {isDragging ? <UploadCloud size={36} /> : <ImageIcon size={36} />}
      </div>
      
      <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Upload your X-Ray</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto 32px' }}>
        Drag and drop your DICOM, JPEG, or PNG files to instantly generate AI findings.
      </p>

      <label className="btn" style={{ fontSize: '1.05rem', padding: '14px 32px' }}>
        Select File
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          style={{ display: 'none' }} 
        />
      </label>
      
      <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Privacy Notice: Images are processed locally and are not stored.
      </div>
    </div>
  );
}

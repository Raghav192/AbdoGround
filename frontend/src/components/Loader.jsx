import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="card animate-fade-in" style={{
      width: '100%',
      maxWidth: '500px',
      marginTop: '60px',
      padding: '64px 48px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        background: 'var(--primary-light)',
        borderRadius: '24px'
      }}>
        <Loader2 
          size={36} 
          color="var(--primary)" 
          style={{ animation: 'spin 1.5s linear infinite' }} 
        />
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Processing</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{message}</p>
      </div>
    </div>
  );
}

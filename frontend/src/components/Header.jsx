import React from 'react';
import { Activity } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
      width: '100%',
      padding: '24px 48px',
      display: 'flex',
      alignItems: 'center',
      background: 'transparent',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'var(--primary)',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <Activity size={20} />
        </div>
        <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
          AbdoGround
        </h1>
      </div>
      
      <nav style={{ marginLeft: '60px', display: 'flex', gap: '32px', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>
        <a href="#technology" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--primary)'} onMouseOut={e=>e.target.style.color='inherit'}>Technology</a>
        <a href="#architecture" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--primary)'} onMouseOut={e=>e.target.style.color='inherit'}>Architecture</a>
        <a href="#metrics" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--primary)'} onMouseOut={e=>e.target.style.color='inherit'}>Metrics</a>
      </nav>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
        <a href="#tool" className="btn" style={{ textDecoration: 'none', padding: '10px 24px', fontSize: '0.95rem' }}>Try Tool</a>
      </div>
    </header>
  );
}

// Logo.jsx
// Composant d'affichage du logo principal de l'application
import React from 'react';

/**
 * Composant d'affichage du logo principal de l'application.
 */
export default function Logo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <span style={{
        color: '#0a4a8a',
        fontWeight: 700,
        fontSize: '3rem',
        letterSpacing: '-2px',
        verticalAlign: 'middle'
      }}>
        <span style={{
          display: 'inline-block',
          width: 12,
          height: 12,
          background: '#f5b335',
          borderRadius: 2,
          marginRight: 8,
          marginBottom: 4
        }} />
        talent
      </span>
      <span style={{
        color: '#f5b335',
        fontWeight: 700,
        fontSize: '3rem',
        letterSpacing: '-2px',
        verticalAlign: 'middle'
      }}>
        xpo
      </span>
    </div>
  );
}
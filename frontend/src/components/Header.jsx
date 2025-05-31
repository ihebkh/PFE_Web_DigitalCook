import React from 'react';
import logoTalentxpo from '../assets/logo-talentxpo.png';

export default function Header() {
  return (
    <header style={{
      height: 64,
      background: 'F5C065',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <img src={logoTalentxpo} alt="talentxpo" style={{ height: 40, objectFit: 'contain' }} />
      </div>
    </header>
  );
} 
import React from 'react';
import logoTalentxpo from '../assets/logo-talentxpo.png';

export default function Header() {
  const user = JSON.parse(localStorage.getItem('user'));
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
      <div>
        <span style={{ marginRight: 16 }}>
          {user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
        </span>
        <span style={{
          background: '#f5b335',
          color: '#0a4a8a',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700
        }}>{user ? user.prenom?.[0] : 'U'}</span>
      </div>
    </header>
  );
} 
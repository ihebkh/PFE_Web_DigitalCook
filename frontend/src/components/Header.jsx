import React from 'react';
import logoTalentxpo from '../assets/logo-talentxpo.png';
import { FaEllipsisV, FaPowerOff, FaUserEdit, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast.info('Déconnexion réussie.');
    navigate('/');
  };

  return (
    <header style={{
      height: 64,
      background: '#0D52CE',
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
      <div style={{ position: 'relative' }}>
        {user && (
          <button
            onClick={() => setShowLogout(!showLogout)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 500,
              padding: '8px 12px',
              borderRadius: 8,
              transition: 'background 0.2s',
            }}
          >
            <FaUserCircle size={22} />
            <span>
              {user.prenom} {user.nom}
            </span>
            <FaEllipsisV size={22} />
          </button>
        )}

        {showLogout && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 5,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              minWidth: '150px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => {
                navigate('/profile');
                setShowLogout(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                padding: '10px 15px',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <FaUserEdit size={18} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                color: 'red',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                padding: '10px 15px',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              <FaPowerOff size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
} 
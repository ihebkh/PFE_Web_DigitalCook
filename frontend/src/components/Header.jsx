import React from 'react';
import logoTalentxpo from '../assets/logo-talentxpo.png';
import { FaEllipsisV, FaPowerOff, FaUserEdit, FaUserCircle, FaSun, FaMoon, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../context/themeContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = React.useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.info('Déconnexion réussie.');
    navigate('/');
  };

  const getPhotoSrc = (url) => {
    if (!url) return 'https://i.pravatar.cc/150?u=default';
    if (url.startsWith('/uploads/')) return 'http://localhost:8000' + url;
    return url;
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
            {user.photo_url ? (
              <img src={getPhotoSrc(user.photo_url)} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
            ) : (
              <FaUserCircle size={22} />
            )}
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
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: 8,
              minWidth: 180,
              zIndex: 101,
              padding: '8px 0',
            }}
          >
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                '&:hover': { background: '#f0f0f0' },
              }}
            >
              <FaUserEdit size={18} />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={() => navigate('/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                '&:hover': { background: '#f0f0f0' },
              }}
            >
              <FaUsers size={18} />
              <span>Utilisateurs</span>
            </button>
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                '&:hover': { background: '#f0f0f0' },
              }}
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                color: '#d32f2f',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                '&:hover': { background: '#ffebee' },
              }}
            >
              <FaPowerOff size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {showLogout && (
          <div
            onClick={() => setShowLogout(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
            }}
          />
        )}
      </div>
    </header>
  );
} 
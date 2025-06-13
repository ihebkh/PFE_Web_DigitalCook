import React from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { FaBriefcase } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import menuIcon from '../assets/menu.png';
import { FaTachometerAlt, FaClipboardList, FaBuilding, FaStore, FaCog, FaHandshake } from 'react-icons/fa';

const sidebarItems = [
  { label: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
  { label: 'Talentxpo', icon: <FaBriefcase />, path: '/cv-parsing' },
  { label: 'Activités', icon: <FaClipboardList />, path: '' },
  { label: 'Affaires', icon: <FaBuilding />, path: '' },
  { label: 'Marketplace', icon: <FaStore />, path: '' },
  { label: 'Paramètres', icon: <FaCog />, path: '' },
  { label: 'Parrainage', icon: <FaHandshake />, path: '' },
];

export default function Sidebar({ collapsed, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const iconSize = collapsed ? 28 : 20;

  return (
    <aside
      style={{
        width: collapsed ? 60 : 220,
        background: '#fff',
        height: '100vh',
        position: 'fixed',
        top: 64,
        left: 0,
        borderRight: '1px solid #eee',
        paddingTop: 24,
        zIndex: 99,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: collapsed ? 'center' : 'flex-start',
        transition: 'width 0.2s',
        minHeight: 0,
      }}
    >
      <button
        onClick={toggleSidebar}
        style={{
          alignSelf: 'flex-start',
          margin: '0 8px 16px 8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={collapsed ? 'Développer la barre latérale' : 'Réduire la barre latérale'}
      >
        {collapsed ? (
          <img src={menuIcon} alt="menu" style={{ width: 28, height: 28 }} />
        ) : (
          <FaChevronLeft size={28} />
        )}
      </button>

      {sidebarItems.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '12px 24px',
            height: 48,
            width: collapsed ? 48 : '100%',
            minWidth: collapsed ? 48 : undefined,
            maxWidth: collapsed ? 48 : undefined,
            background: location.pathname === item.path ? '#0D52CE' : 'transparent',
            color: location.pathname === item.path ? '#fff' : '#0a4a8a',
            border: 'none',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, width 0.2s',
            margin: '0 8px',
            marginBottom: 4,
          }}
        >
          {React.cloneElement(item.icon, { size: iconSize })}
          {!collapsed && <span style={{ marginLeft: 12 }}>{item.label}</span>}
        </button>
      ))}
      <div style={{ width: '100%' }}>
        {/* Remove user display and logout button */}
        {/*
        {user && (
          <button
            onClick={() => setShowLogout(!showLogout)}
            style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '12px 24px',
            height: 48,
            width: collapsed ? 48 : '100%',
            minWidth: collapsed ? 48 : undefined,
            maxWidth: collapsed ? 48 : undefined,
            background:'transparent',
            color: '#0a4a8a',
            border: 'none',
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, width 0.2s',
            margin: '0 8px',
            marginBottom: 4,
          }}
          >
            
            <FaUserCircle size={iconSize} style={{ flexShrink: 0, width: 22, height: 22 }} />
            {!collapsed && (
              <span style={{ marginLeft: 9, lineHeight: '48px' }}>
                {user.prenom} {user.nom}
              </span>
            )}
          </button>
        )}

        {showLogout && !collapsed && (
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              justifyContent: 'flex-start',
              padding: '10px 24px',
              background: 'transparent',
              color: 'red',
              border: 'none',
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 16,
              cursor: 'pointer',
              width: '100%',
              marginTop: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              boxSizing: 'border-box',
              lineHeight: '28px',
            }}
          >
            <FaPowerOff size={iconSize} style={{ flexShrink: 0, marginLeft: 9, lineHeight: '48px' }} />
            <span>Déconnexion</span>
          </button>
        )}
        */}
      </div>
    </aside>
  );
}

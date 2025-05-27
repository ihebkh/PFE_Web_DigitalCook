import React from 'react';
import { FaClipboardList, FaBriefcase, FaStore, FaCog, FaHandshake, FaPowerOff, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import menuIcon from '../assets/menu.png';
import { FaTachometerAlt } from 'react-icons/fa';

const sidebarItems = [
  { label: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
  { label: 'Affaires', icon: <FaBriefcase />, path: '/affaires' },
  { label: 'Marketplace', icon: <FaStore />, path: '/marketplace' },
  { label: 'Paramètres', icon: <FaCog />, path: '/parametres' },
  { label: 'parrainage', icon: <FaHandshake />, path: '/parrainage' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const iconSize = collapsed ? 28 : 20;

  return (
    <aside style={{
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
    }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
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
        {collapsed
          ? <img src={menuIcon} alt="menu" style={{ width: 28, height: 28 }} />
          : <FaChevronLeft size={28} />
        }
      </button>
      {sidebarItems.map(item => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '12px 24px',
            height: collapsed ? 48 : 'auto',
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
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '12px 24px',
          height: collapsed ? 48 : 'auto',
          width: collapsed ? 48 : '100%',
          minWidth: collapsed ? 48 : undefined,
          maxWidth: collapsed ? 48 : undefined,
          background: 'transparent',
          color: 'red',
          border: 'none',
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 16,
          cursor: 'pointer',
          margin: '0 8px',
          marginTop: 32,
          transition: 'width 0.2s',
        }}
      >
        <FaPowerOff size={iconSize} />
        {!collapsed && <span style={{ marginLeft: 12 }}>Déconnexion</span>}
      </button>
    </aside>
  );
} 
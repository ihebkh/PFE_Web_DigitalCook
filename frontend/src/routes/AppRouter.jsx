import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
// import CVparsing from '../components/cv-parsing';
import Sidebar from '../components/Sidebar';
import CommRecuSidebar from '../components/CommRecuSidebar';
import Header from '../components/Header';
import CommRecuHeader from '../components/CommRecuHeader';
import EditProfile from '../components/EditProfile';
import UserList from '../components/UserList';
import Commercial from '../components/Commercial';
import Recruteur from '../components/Recruteur';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import CvAnalyse from '../components/CvAnalyse';

function DarkModeWrapper({ children }) {
  const { isDarkMode } = useTheme();
  const mainStyle = {
    backgroundColor: isDarkMode ? '#1E2B45' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };
  return <div style={mainStyle}>{children}</div>;
}

export default function AppRouter() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Fonction pour déterminer la page de destination selon le type d'utilisateur
  const getDefaultRoute = () => {
    if (!user) return "/";
    if (user.role === "commercial") return "/commercial";
    if (["influenceur", "agence", "apporteur", "topApporteur"].includes(user.role)) return "/user-dashboard";
    return "/dashboard";
  };

  // Fonction pour déterminer quelle sidebar afficher
  const getSidebarComponent = () => {
    if (!user) return null;
    if (user.role === "TopAdmin") return <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />;
    if (["commercial", "influenceur", "agence", "apporteur", "topApporteur"].includes(user.role)) {
      return <CommRecuSidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />;
    }
    return null;
  };

  // Fonction pour déterminer quel header afficher
  const getHeaderComponent = () => {
    if (!user) return null;
    if (user.role === "TopAdmin") return <Header />;
    if (["commercial", "influenceur", "agence", "apporteur", "topApporteur"].includes(user.role)) {
      return <CommRecuHeader />;
    }
    return null;
  };

  // Afficher un écran de chargement pendant la vérification de session
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      {getHeaderComponent()}
      {getSidebarComponent()}
      <DarkModeWrapper>
        <Routes>
          <Route path="/" element={user ? <Navigate to={getDefaultRoute()} /> : <Login />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard collapsed={collapsed} /> : <Navigate to="/" />}
          />
          {/* <Route path="/cv-parsing" element={user ? <CVparsing collapsed={collapsed} /> : <Navigate to="/" />} /> */}
          <Route
            path="/profile"
            element={user ? <EditProfile collapsed={collapsed} /> : <Navigate to="/" />}
          />
          <Route path="/users" element={user ? <UserList collapsed={collapsed} /> : <Navigate to="/" />} />
          <Route path="/commercial" element={user ? <Commercial collapsed={collapsed} /> : <Navigate to="/" />} />
          <Route path="/user-dashboard" element={user ? <Recruteur collapsed={collapsed} /> : <Navigate to="/" />} />
          <Route path="/activities" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/affaires" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/marketplace" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/settings" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/referral" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/analyse-cv" element={user ? <CvAnalyse /> : <Navigate to="/" />} />
        </Routes>
      </DarkModeWrapper>
    </BrowserRouter>
  );
}

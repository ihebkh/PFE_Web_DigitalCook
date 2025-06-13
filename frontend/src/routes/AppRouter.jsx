import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import CVparsing from '../components/cv-parsing';
import Sidebar from '../components/Sidebar';
import EditProfile from '../components/EditProfile';
import { useAuth } from '../context/authContext';

export default function AppRouter() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <BrowserRouter>
      {user && <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard collapsed={collapsed} /> : <Navigate to="/" />}
        />
        <Route path="/cv-parsing" element={user ? <CVparsing collapsed={collapsed} /> : <Navigate to="/" />} />
        <Route
          path="/profile"
          element={user ? <EditProfile collapsed={collapsed} /> : <Navigate to="/" />}
        />
        <Route path="/activities" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/affaires" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/marketplace" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/settings" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/referral" element={user ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

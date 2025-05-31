import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../components/Dashboard';
import CVparsing from '../components/cv-parsing';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cv-parsing" element={<CVparsing />} />
      </Routes>
    </BrowserRouter>
  );
}
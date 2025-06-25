import styled from 'styled-components';
import React from 'react';
import logoTalentxpo from '../assets/Talentxpo-full-logo-ffa0fdc2.jpg'; // adapte le chemin et l'extension si besoin
import { useTheme } from '../context/themeContext';

const Background = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ isDarkMode }) => isDarkMode ? '#1E2B45' : 'radial-gradient(circle, #0a4a8a 0%, #0a0a3a 100%)'};
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  transition: background 0.3s;
`;

const Card = styled.div`
  background: ${({ isDarkMode }) => isDarkMode ? '#2A354D' : '#fff'};
  padding: 2.5rem 2rem;
  border-radius: 20px;
  box-shadow: ${({ isDarkMode }) => isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)'};
  min-width: 400px;
  transition: background 0.3s, box-shadow 0.3s;
`;

const Logo = ({ isDarkMode }) => (
  <div style={{ textAlign: 'center', marginBottom: 32 }}>
    <img
      src={logoTalentxpo}
      alt="talentxpo"
      style={{ width: 200, height: 'auto', objectFit: 'contain' }}
    />
    {/* If you have text based logo, you can adapt its color here */}
  </div>
);

export default function AuthLayout({ children }) {
  const { isDarkMode } = useTheme();
  return (
    <Background isDarkMode={isDarkMode}>
      <Card isDarkMode={isDarkMode}>
        <Logo isDarkMode={isDarkMode} />
        {children}
      </Card>
    </Background>
  );
}
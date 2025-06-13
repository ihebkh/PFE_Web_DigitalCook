import styled from 'styled-components';
import React from 'react';
import logoTalentxpo from '../assets/Talentxpo-full-logo-ffa0fdc2.jpg'; // adapte le chemin et l'extension si besoin

const Background = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #0a4a8a 0%, #0a0a3a 100%);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
`;

const Card = styled.div`
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  min-width: 400px;
`;

const Logo = () => (
  <div style={{ textAlign: 'center', marginBottom: 32 }}>
    <img
      src={logoTalentxpo}
      alt="talentxpo"
      style={{ width: 200, height: 'auto', objectFit: 'contain' }}
    />
  </div>
);

export default function AuthLayout({ children }) {
  return (
    <Background>
      <Card>
        <Logo />
        {children}
      </Card>
    </Background>
  );
}
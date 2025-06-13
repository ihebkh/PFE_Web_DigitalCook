
import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      toast.success('Authentification réussie !');
      navigate('/dashboard');
    } else {
      toast.error("Échec de l'authentification. Vérifiez vos identifiants.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 18 }}>
        <label>Email *</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 6 }}
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label>Mot de passe *</label>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 6 }}
        />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px 0',
          background: '#f5b335',
          color: '#fff',
          fontSize: '1.2rem',
          border: 'none',
          borderRadius: 10,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Connexion en cours...' : 'se connecter'}
      </button>
    </form>
  );
}

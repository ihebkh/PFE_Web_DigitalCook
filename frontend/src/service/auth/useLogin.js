import { useState } from 'react';
import { login as loginService } from './authService';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const res = await loginService(email, password);
      if (res.status === 'valide') {
        localStorage.setItem('user', JSON.stringify({ nom: res.nom, prenom: res.prenom, email: res.email }));
        return true;
      } else {
        setError("Échec de l'authentification. Vérifiez vos identifiants.");
        return false;
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
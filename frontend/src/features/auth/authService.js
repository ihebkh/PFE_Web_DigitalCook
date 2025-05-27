import axios from 'axios';

export async function login(email, password) {
  try {
    const res = await axios.post('http://localhost:8000/auth/login', { email, password });
    // Stocke le token si besoin : localStorage.setItem('token', res.data.access_token);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Erreur serveur');
  }
}
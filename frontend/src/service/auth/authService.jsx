import axios from 'axios';

const api_url = 'http://localhost:8000';

export async function login(email, password) {
  try {
    const res = await axios.post(`${api_url}/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Erreur serveur');
  }
}

import axios from 'axios';

const api_url = 'http://localhost:8000';

export async function login(email, password) {
  try {
    const res = await axios.post(`${api_url}/auth/login`, { email, password }, {withCredentials: true});
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Erreur serveur');
  }
}

export async function getCurrentUser() {
  try {
    const res = await axios.get(`${api_url}/auth/current_user`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function logout() {
  try {
    const res = await axios.get(`${api_url}/auth/logout`, { withCredentials: true });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Erreur lors de la déconnexion');
  }
}

export async function updateUserProfile(userData) {
  try {
    const res = await axios.put(`${api_url}/auth/profile`, userData, { withCredentials: true });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Erreur lors de la mise à jour du profil');
  }
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${api_url}/auth/upload_photo`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.photo_url;
}

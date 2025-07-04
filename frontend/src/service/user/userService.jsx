// userService.jsx
// Service pour la gestion des utilisateurs (CRUD, privilèges, upload photo, etc.)
import axios from 'axios';

const api_url = 'http://localhost:8000/auth';

/**
 * Récupère la liste des utilisateurs.
 */
export async function getUsers() {
  const res = await axios.get(`${api_url}/users`, { withCredentials: true });
  return res.data;
}

/**
 * Récupère la liste des privilèges.
 */
export async function getPrivileges() {
  const res = await axios.get(`${api_url}/privileges`, { withCredentials: true });
  return res.data;
}

/**
 * Crée un utilisateur (et upload la photo si fournie).
 */
export async function createUser(user, photoFile) {
  // Créer l'utilisateur sans photo
  const res = await axios.post(`${api_url}/users`, user, { withCredentials: true });
  let createdUser = res.data;
  // Si une photo est fournie, uploader la photo pour cet utilisateur
  if (photoFile && createdUser.id) {
    const photoUrl = await uploadUserPhotoForId(createdUser.id, photoFile);
    createdUser = { ...createdUser, photo_url: photoUrl };
  }
  return createdUser;
}

/**
 * Upload une photo pour un utilisateur existant (par ID).
 */
export async function uploadUserPhotoForId(userId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${api_url}/users/${userId}/upload_photo`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.photo_url;
}

/**
 * Upload une photo pour l'utilisateur courant (à ne plus utiliser pour la création).
 */
export async function uploadUserPhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${api_url}/upload_photo`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.photo_url;
}

/**
 * Met à jour un utilisateur (par ID).
 */
export async function updateUser(userId, data) {
  const res = await axios.put(`${api_url}/users/${userId}`, data, { withCredentials: true });
  return res.data;
}

/**
 * Supprime un utilisateur (par ID).
 */
export async function deleteUser(userId) {
  const res = await axios.delete(`${api_url}/users/${userId}`, { withCredentials: true });
  return res.data;
}

/**
 * Active/désactive un utilisateur.
 */
export async function toggleUserStatus(user) {
  const isEnabled = user.status === 'enabled' || user.enabled === true;
  const res = await axios.put(`${api_url}/users/${user.id}`, {
    ...user,
    status: isEnabled ? 'disabled' : 'enabled',
    enabled: !isEnabled
  }, { withCredentials: true });
  return res.data;
} 
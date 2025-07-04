// EditProfile.jsx
// Composant d'édition du profil utilisateur (infos, mot de passe, photo)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import { uploadProfilePhoto } from '../service/auth/authService';

/**
 * Composant permettant à l'utilisateur de modifier son profil (nom, email, mot de passe, photo).
 */
export default function EditProfile({ collapsed }) {
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  // États principaux
  const [firstName, setFirstName] = useState(user?.prenom || '');
  const [lastName, setLastName] = useState(user?.nom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [internalLoading, setInternalLoading] = useState(false);
  const [showPasswordChangeFields, setShowPasswordChangeFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    setPhotoUrl(user?.photo_url || '');
  }, [user?.photo_url]);
  
  const fileInputRef = React.useRef();

  // Déterminer la marge selon le type d'utilisateur et l'état de la sidebar
  const getMarginLeft = () => {
    if (!user) return 0;
    if (user.role === "TopAdmin" || ["commercial", "influenceur", "agence", "apporteur", "topApporteur"].includes(user.role)) {
      return collapsed ? 90 : 270;
    }
    return 0;
  };
  const marginLeft = getMarginLeft();

  // Met à jour le profil utilisateur
  const handleUpdate = async () => {
    setInternalLoading(true);
    setMessage('');
    try {
      const updateData = {
        name: firstName,
        last_name: lastName,
        email: email,
        photo_url: photoUrl
      };
      if (showPasswordChangeFields) {
        if (newPassword !== confirmNewPassword) {
          setMessage('Les mots de passe ne correspondent pas');
          return;
        }
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
      }
      const success = await updateUser(updateData);
      if (success) {
        setMessage('Profil mis à jour avec succès');
        setShowPasswordChangeFields(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil');
    } finally {
      setInternalLoading(false);
    }
  };

  // Upload et mise à jour de la photo de profil
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadedUrl = await uploadProfilePhoto(file);
      setPhotoUrl(uploadedUrl);
      await updateUser({ photo_url: uploadedUrl });
      setMessage('Photo mise à jour avec succès');
    } catch (err) {
      setMessage("Erreur lors de l'upload de la photo de profil");
    }
  };

  // Retourne l'URL de la photo (gère le cas local/uploads)
  const getPhotoSrc = (url) => {
    if (!url) return 'https://i.pravatar.cc/150?u=default';
    if (url.startsWith('/uploads/')) return 'http://localhost:8000' + url;
    return url;
  };

  // Styles principaux
  const containerStyle = {
    marginLeft: marginLeft,
    marginTop: 64,
    padding: 32,
    transition: 'margin-left 0.2s',
    width: marginLeft > 0 ? `calc(100% - ${marginLeft}px)` : '100%',
    height: 'calc(100vh - 64px)',
    overflow: 'auto',
    background: isDarkMode ? '#1E2B45' : '#fff',
    color: isDarkMode ? '#F0F0F0' : '#333',
  };
  const cardStyle = {
    background: isDarkMode ? '#2A354D' : '#fff',
    border: `1px solid ${isDarkMode ? '#404B60' : '#eee'}`,
    borderRadius: 8,
    padding: 24,
    maxWidth: 800,
    margin: '0 auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${isDarkMode ? '#404B60' : '#ccc'}`,
    borderRadius: 4,
    background: isDarkMode ? '#1E2B45' : '#fff',
    color: isDarkMode ? '#F0F0F0' : '#333',
    fontSize: 16,
    marginBottom: 16,
  };
  const buttonStyle = {
    background: '#0D52CE',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 4,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 16,
  };
  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 500,
    color: isDarkMode ? '#F0F0F0' : '#333',
  };

  // Rendu principal
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: 24, color: isDarkMode ? '#F0F0F0' : '#333' }}>
          Modifier le profil
        </h2>

        {/* Message de succès ou d'erreur */}
        {message && (
          <div style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 4,
            background: message.includes('succès') ? '#4caf50' : '#f44336',
            color: '#fff',
          }}>
            {message}
          </div>
        )}

        {/* Champs de saisie du profil */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Photo de profil */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={getPhotoSrc(photoUrl)}
              alt="Profil"
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                objectFit: 'cover',
                cursor: 'pointer',
                border: `2px solid ${isDarkMode ? '#404B60' : '#1976d2'}`,
              }}
              onClick={() => fileInputRef.current.click()}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handlePhotoChange}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#fff',
              borderRadius: '50%',
              padding: 4,
              cursor: 'pointer',
            }}>
              📷
            </div>
          </div>
        </div>

        {/* Checkbox pour afficher les champs de changement de mot de passe */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPasswordChangeFields}
              onChange={(e) => setShowPasswordChangeFields(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Changer le mot de passe
          </label>
        </div>

        {/* Champs de changement de mot de passe */}
        {showPasswordChangeFields && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Mot de passe actuel</label>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              style={{ marginLeft: 8, padding: '4px 8px' }}
            >
              {showCurrentPassword ? 'Masquer' : 'Afficher'}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ marginLeft: 8, padding: '4px 8px' }}
                >
                  {showNewPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <div>
                <label style={labelStyle}>Confirmer le mot de passe</label>
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  style={{ marginLeft: 8, padding: '4px 8px' }}
                >
                  {showConfirmNewPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bouton d'enregistrement */}
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleUpdate}
            disabled={internalLoading}
            style={{
              ...buttonStyle,
              opacity: internalLoading ? 0.7 : 1,
            }}
          >
            {internalLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
} 
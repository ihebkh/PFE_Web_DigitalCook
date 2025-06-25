import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import Header from './Header';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, PhotoCamera } from '@mui/icons-material';
import { uploadProfilePhoto } from '../service/auth/authService';

export default function EditProfile({ collapsed }) {
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [firstName, setFirstName] = useState(user?.prenom || '');
  const [lastName, setLastName] = useState(user?.nom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [internalLoading, setInternalLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [showPasswordChangeFields, setShowPasswordChangeFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  useEffect(() => {
    setPhotoUrl(user?.photo_url || '');
  }, [user?.photo_url]);
  const fileInputRef = React.useRef();

  const marginLeft = collapsed ? 90 : 270;

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirmUpdate = async () => {
    setInternalLoading(true);
    try {
      const updateData = {
        prenom: firstName,
        nom: lastName,
        email: email,
        photo_url: photoUrl
      };

      if (showPasswordChangeFields) {
        if (newPassword !== confirmNewPassword) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const success = await updateUser(updateData);
      if (success) {
        alert('Profil mis à jour avec succès');
        setShowPasswordChangeFields(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setInternalLoading(false);
      setOpenConfirmDialog(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadedUrl = await uploadProfilePhoto(file);
      setPhotoUrl(uploadedUrl);
      await updateUser({ photo_url: uploadedUrl });
    } catch (err) {
      alert("Erreur lors de l'upload de la photo de profil");
    }
  };

  const getPhotoSrc = (url) => {
    if (!url) return 'https://i.pravatar.cc/150?u=default';
    if (url.startsWith('/uploads/')) return 'http://localhost:8000' + url;
    return url;
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: isDarkMode ? '#404B60' : '#ccc',
      },
      '&:hover fieldset': {
        borderColor: isDarkMode ? '#666' : '#333',
      },
      '&.Mui-focused fieldset': {
        borderColor: isDarkMode ? '#666' : '#333',
      },
    },
    '& .MuiInputLabel-root': {
      color: isDarkMode ? '#F0F0F0' : '#333',
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? '#F0F0F0' : '#333',
    },
  };

  return (
    <div>
      <Header />
      <main style={{
        marginLeft: marginLeft,
        marginTop: 64,
        padding: 32,
        transition: 'margin-left 0.2s',
        width: `calc(100% - ${marginLeft}px)`,
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
        background: isDarkMode ? '#1E2B45' : '#fff',
        color: isDarkMode ? '#F0F0F0' : '#333',
      }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 4, color: isDarkMode ? '#F0F0F0' : '#333' }}>
            Modifier le profil
          </Typography>

          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              background: isDarkMode ? '#2A354D' : '#fff',
              border: `1px solid ${isDarkMode ? '#404B60' : '#eee'}`,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prénom"
                  fullWidth
                  margin="normal"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom"
                  fullWidth
                  margin="normal"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} sm={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <img
                    src={getPhotoSrc(photoUrl)}
                    alt="Profil"
                    style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: `2px solid ${isDarkMode ? '#404B60' : '#1976d2'}` }}
                    onClick={() => fileInputRef.current.click()}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                  />
                  <PhotoCamera style={{ position: 'absolute', bottom: 0, right: 0, color: isDarkMode ? '#F0F0F0' : '#1976d2', background: '#fff', borderRadius: '50%', padding: 2 }} />
                </div>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPasswordChangeFields}
                    onChange={(e) => setShowPasswordChangeFields(e.target.checked)}
                    sx={{
                      color: isDarkMode ? '#F0F0F0' : '#333',
                      '&.Mui-checked': {
                        color: isDarkMode ? '#F0F0F0' : '#333',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
                    Changer le mot de passe
                  </Typography>
                }
              />
            </Box>

            {showPasswordChangeFields && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Mot de passe actuel"
                    type={showCurrentPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    sx={textFieldStyle}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nouveau mot de passe"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={textFieldStyle}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirmer le mot de passe"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    sx={textFieldStyle}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}
                          >
                            {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleOpenConfirmDialog}
                disabled={internalLoading}
                sx={{
                  bgcolor: isDarkMode ? '#404B60' : '#1976d2',
                  color: '#F0F0F0',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#555' : '#1565c0',
                  },
                }}
              >
                {internalLoading ? <CircularProgress size={24} /> : 'Enregistrer les modifications'}
              </Button>
            </Box>
          </Paper>
        </Box>

        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirmDialog}
          PaperProps={{
            sx: {
              background: isDarkMode ? '#2A354D' : '#fff',
              color: isDarkMode ? '#F0F0F0' : '#333',
            }
          }}
        >
          <DialogTitle sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Confirmer les modifications</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
              Êtes-vous sûr de vouloir enregistrer ces modifications ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseConfirmDialog}
              sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmUpdate}
              variant="contained"
              sx={{
                bgcolor: isDarkMode ? '#404B60' : '#1976d2',
                color: '#F0F0F0',
                '&:hover': {
                  bgcolor: isDarkMode ? '#555' : '#1565c0',
                },
              }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
} 
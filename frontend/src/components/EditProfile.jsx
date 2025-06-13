import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import Header from './Header';
// Sidebar is rendered in AppRouter, so no need to import here
// import Sidebar from './Sidebar';

export default function EditProfile({ collapsed }) {
  const { user, updateUser, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState(user?.prenom || '');
  const [lastName, setLastName] = useState(user?.nom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordChangeFields, setShowPasswordChangeFields] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // States for toggling password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.prenom || '');
      setLastName(user.nom || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirmUpdate = async () => {
    handleCloseConfirmDialog(); // Close dialog immediately
    setLoading(true);

    if (showPasswordChangeFields) {
      if (newPassword && newPassword !== confirmNewPassword) {
        toast.error('Les nouveaux mots de passe ne correspondent pas.');
        setLoading(false);
        return;
      }

      if (!newPassword && (currentPassword || confirmNewPassword)) {
        toast.error('Veuillez entrer le nouveau mot de passe si vous souhaitez le changer.');
        setLoading(false);
        return;
      }

      if (newPassword && !currentPassword) {
        toast.error('Le mot de passe actuel est requis pour changer le mot de passe.');
        setLoading(false);
        return;
      }
    }

    try {
      const updatedData = {
        name: firstName,
        last_name: lastName,
        email: email,
      };

      if (showPasswordChangeFields && newPassword) {
        updatedData.current_password = currentPassword;
        updatedData.new_password = newPassword;
      }

      const success = await updateUser(updatedData);
      if (success) {
        toast.success('Profil mis à jour avec succès !');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordChangeFields(false);
        // Reset password visibility states
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
      } else {
        toast.error('Échec de la mise à jour du profil. Veuillez vérifier les informations.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const marginLeft = collapsed ? 90 : 270;

  return (
    <div>
      <Header />
      <Box sx={{
        marginLeft: `${marginLeft}px`,
        p: 3,
        flexGrow: 1,
        transition: 'margin-left 0.2s',
        width: `calc(100% - ${marginLeft}px)`,
        minHeight: 'calc(100vh - 64px - 64px)',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'white',
        flexDirection: 'column',
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#333', mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
          Modification du profil
        </Typography>
        <Paper sx={{ p: 4, maxWidth: 1200, background: 'white', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleOpenConfirmDialog(); }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Prénom"
                  fullWidth
                  margin="normal"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: '#333' } }}
                  InputProps={{ style: { color: '#333' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Nom"
                  fullWidth
                  margin="normal"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: '#333' } }}
                  InputProps={{ style: { color: '#333' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: '#333' } }}
                  InputProps={{ style: { color: '#333' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 3, mb: 2 }}>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showPasswordChangeFields}
                      onChange={(e) => setShowPasswordChangeFields(e.target.checked)}
                      name="changePassword"
                      sx={{ color: '#333' }}
                    />
                  }
                  label={<Typography sx={{ color: '#333' }}>Changer votre mot de passe ?</Typography>}
                />
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ background: '#48bb78', '&:hover': { background: '#38a169' } }}
                  disabled={loading || authLoading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'MODIFIER'}
                </Button>
              </Grid>
            </Grid>

            {showPasswordChangeFields && (
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Mot de passe actuel"
                    type={showCurrentPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required={showPasswordChangeFields && !!newPassword}
                    disabled={!showPasswordChangeFields}
                    InputLabelProps={{ style: { color: '#333' } }}
                    InputProps={{
                      style: { color: '#333' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{ color: '#333' }}
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Nouveau mot de passe"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputLabelProps={{ style: { color: '#333' } }}
                    InputProps={{
                      style: { color: '#333' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{ color: '#333' }}
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Confirmer le nouveau mot de passe"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    InputLabelProps={{ style: { color: '#333' } }}
                    InputProps={{
                      style: { color: '#333' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{ color: '#333' }}
                          >
                            {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                  />
                </Grid>
              </Grid>
            )}
          </form>
        </Paper>
      </Box>
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmer la mise à jour du profil"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir mettre à jour votre profil avec les nouvelles informations ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} sx={{ color: '#333' }}>Annuler</Button>
          <Button onClick={handleConfirmUpdate} autoFocus sx={{ background: '#48bb78', color: '#fff', '&:hover': { background: '#38a169' } }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 
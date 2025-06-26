import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../context/themeContext';
import Header from './Header';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, CircularProgress, Dialog, 
  DialogActions, DialogContent, DialogTitle, Button, IconButton, TextField,
  FormControl, InputLabel, Select, MenuItem, DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const UserList = ({ collapsed }) => {
  const [users, setUsers] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const marginLeft = collapsed ? 90 : 270;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const fileInputRef = useRef(null);
  const [confirmPhotoDialogOpen, setConfirmPhotoDialogOpen] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [confirmEditDialogOpen, setConfirmEditDialogOpen] = useState(false);
  const [successDeleteDialogOpen, setSuccessDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, privilegesRes] = await Promise.all([
          axios.get('http://localhost:8000/auth/users', { withCredentials: true }),
          axios.get('http://localhost:8000/auth/privileges', { withCredentials: true })
        ]);
        setUsers(usersRes.data);
        setPrivileges(privilegesRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(`http://localhost:8000/auth/users/${selectedUser.id}`, { withCredentials: true });
      setUsers(users.filter(user => user.id !== selectedUser.id));
      closeDeleteDialog();
      setSuccessDeleteDialogOpen(true);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditedUser(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    if (!e.target.files[0]) return;
    setPendingPhotoFile(e.target.files[0]);
    setEditedUser(prev => ({ ...prev, photo_url: URL.createObjectURL(e.target.files[0]) }));
  };

  const handleSaveChanges = () => {
    setConfirmEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!editedUser) return;
    const { id, name, last_name, email, privilege } = editedUser;
    let newPhotoUrl = editedUser.photo_url;
    if (pendingPhotoFile) {
      const formData = new FormData();
      formData.append('file', pendingPhotoFile);
      try {
        const response = await axios.post(`http://localhost:8000/auth/users/${id}/upload_photo`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newPhotoUrl = response.data.photo_url;
      } catch (error) {
        console.error("Erreur lors de l'upload de la photo:", error);
      }
    }
    try {
      const response = await axios.put(`http://localhost:8000/auth/users/${id}`, 
        { name, last_name, email, privilege, photo_url: newPhotoUrl }, 
        { withCredentials: true }
      );
      setUsers(users.map(user => (user.id === id ? response.data : user)));
      closeEditDialog();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    } finally {
      setConfirmEditDialogOpen(false);
      setPendingPhotoFile(null);
    }
  };

  const cancelEdit = () => {
    setConfirmEditDialogOpen(false);
  };

  const getPhotoSrc = (url) => {
    if (!url) return 'https://i.pravatar.cc/150?u=default';
    if (url.startsWith('/uploads/')) return `http://localhost:8000${url}`;
    return url;
  };

  const tableCellHeaderStyle = {
    backgroundColor: isDarkMode ? '#3E4A5B' : '#F4F6F8',
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontWeight: 'bold',
  };

  const tableCellStyle = {
    color: isDarkMode ? '#FFFFFF' : '#000000',
  };

  return (
    <div>
      <Header />
      <Box sx={{
        marginLeft: `${marginLeft}px`,
        p: 3,
        flexGrow: 1,
        transition: 'margin-left 0.2s',
        width: `calc(100% - ${marginLeft}px)`,
        minHeight: 'calc(100vh - 64px)',
        overflow: 'auto',
        background: isDarkMode ? '#1E2B45' : '#FFFFFF',
        color: isDarkMode ? '#F0F0F0' : '#333',
      }}>
        <br /><br /><br />
        <Typography variant="h4" gutterBottom>Liste des utilisateurs</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ background: isDarkMode ? '#2A354D' : '#FFFFFF' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableCellHeaderStyle}>Photo</TableCell>
                  <TableCell sx={tableCellHeaderStyle}>Prénom</TableCell>
                  <TableCell sx={tableCellHeaderStyle}>Nom</TableCell>
                  <TableCell sx={tableCellHeaderStyle}>Email</TableCell>
                  <TableCell sx={tableCellHeaderStyle}>Privilège</TableCell>
                  <TableCell sx={tableCellHeaderStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell sx={tableCellStyle}><Avatar src={getPhotoSrc(user.photo_url)} /></TableCell>
                    <TableCell sx={tableCellStyle}>{user.name}</TableCell>
                    <TableCell sx={tableCellStyle}>{user.last_name}</TableCell>
                    <TableCell sx={tableCellStyle}>{user.email}</TableCell>
                    <TableCell sx={tableCellStyle}>{user.privilege || 'N/A'}</TableCell>
                    <TableCell sx={tableCellStyle}>
                       <IconButton onClick={() => openEditDialog(user)} color="primary" aria-label="Modifier l'utilisateur">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => openDeleteDialog(user)} color="error" aria-label="Supprimer l'utilisateur">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Annuler</Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      {editedUser && (
        <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="sm">
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              <IconButton onClick={() => fileInputRef.current && fileInputRef.current.click()} sx={{ p: 0 }}>
                <Avatar
                  src={getPhotoSrc(editedUser.photo_url)}
                  sx={{ width: 100, height: 100 }}
                />
                <PhotoCamera sx={{
                  position: 'absolute', bottom: 5, right: 5, color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', p: '4px'
                }}/>
              </IconButton>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Prénom"
              type="text"
              fullWidth
              variant="outlined"
              value={editedUser.name}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="last_name"
              label="Nom"
              type="text"
              fullWidth
              variant="outlined"
              value={editedUser.last_name}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={editedUser.email}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Privilège</InputLabel>
              <Select
                name="privilege"
                value={editedUser.privilege || ''}
                label="Privilège"
                onChange={handleEditChange}
              >
                {privileges.map((p) => (
                  <MenuItem key={p.id} value={p.label}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog}>Annuler</Button>
            <Button onClick={handleSaveChanges}>Enregistrer</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirmation dialog for photo upload */}
      <Dialog open={confirmPhotoDialogOpen} onClose={() => setConfirmPhotoDialogOpen(false)}>
        <DialogTitle>Confirmer le changement de photo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir changer la photo de cet utilisateur ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPhotoDialogOpen(false)}>Annuler</Button>
          <Button onClick={() => setConfirmPhotoDialogOpen(false)} color="primary">Confirmer</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for edit */}
      <Dialog open={confirmEditDialogOpen} onClose={cancelEdit}>
        <DialogTitle>Confirmer la modification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir enregistrer les modifications de cet utilisateur ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>Annuler</Button>
          <Button onClick={confirmEdit} color="primary">Confirmer</Button>
        </DialogActions>
      </Dialog>

      {/* Success Delete Dialog */}
      <Dialog open={successDeleteDialogOpen} onClose={() => setSuccessDeleteDialogOpen(false)}>
        <DialogTitle>Suppression réussie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            L'utilisateur a bien été supprimé.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDeleteDialogOpen(false)} color="primary">OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList; 
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
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getUsers, getPrivileges, createUser, uploadUserPhoto, updateUser, deleteUser as deleteUserApi, toggleUserStatus } from '../service/user/userService';

/**
 * Composant principal pour la gestion des utilisateurs (affichage, création, édition, suppression, upload photo, etc.)
 */
const UserList = ({ collapsed }) => {
  // État principal
  const [users, setUsers] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const marginLeft = collapsed ? 90 : 270;

  // Dialogs & états associés
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const fileInputRef = useRef(null);
  const [confirmPhotoDialogOpen, setConfirmPhotoDialogOpen] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [confirmEditDialogOpen, setConfirmEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', last_name: '', email: '', privilege: '', photo_url: '' });
  const [pendingCreatePhotoFile, setPendingCreatePhotoFile] = useState(null);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [confirmCreateDialogOpen, setConfirmCreateDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Chargement initial des utilisateurs et privilèges
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, privilegesRes] = await Promise.all([
          getUsers(),
          getPrivileges()
        ]);
        setUsers(usersRes);
        setPrivileges(privilegesRes);
      } catch (error) {
        // Erreur lors de la récupération des données
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Ouvre la boîte de dialogue de suppression
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  // Ferme la boîte de dialogue de suppression
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  // Supprime un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUserApi(selectedUser.id);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      closeDeleteDialog();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };

  // Ouvre la boîte de dialogue d'édition
  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setEditDialogOpen(true);
  };
  // Ferme la boîte de dialogue d'édition
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditedUser(null);
  };
  // Gère la modification des champs d'édition
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };
  // Gère l'upload de photo lors de l'édition
  const handlePhotoUpload = (e) => {
    if (!e.target.files[0]) return;
    setPendingPhotoFile(e.target.files[0]);
    setEditedUser(prev => ({ ...prev, photo_url: URL.createObjectURL(e.target.files[0]) }));
  };
  // Ouvre la confirmation d'enregistrement des modifications
  const handleSaveChanges = () => {
    setConfirmEditDialogOpen(true);
  };
  // Confirme l'édition d'un utilisateur
  const confirmEdit = async () => {
    if (!editedUser) return;
    const { id, name, last_name, email, privilege } = editedUser;
    let newPhotoUrl = editedUser.photo_url;
    if (pendingPhotoFile) {
      try {
        newPhotoUrl = await uploadUserPhoto(pendingPhotoFile);
      } catch (error) {
        console.error("Erreur lors de l'upload de la photo:", error);
      }
    }
    try {
      const response = await updateUser(id, { name, last_name, email, privilege, photo_url: newPhotoUrl });
      setUsers(users.map(user => (user.id === id ? response : user)));
      closeEditDialog();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    } finally {
      setConfirmEditDialogOpen(false);
      setPendingPhotoFile(null);
    }
  };
  // Annule la confirmation d'édition
  const cancelEdit = () => {
    setConfirmEditDialogOpen(false);
  };

  // Retourne l'URL de la photo (gère le cas local/uploads)
  const getPhotoSrc = (url) => {
    if (!url) return 'https://i.pravatar.cc/150?u=default';
    if (url.startsWith('/uploads/')) return `http://localhost:8000${url}`;
    return url;
  };

  // Styles pour le tableau
  const tableCellHeaderStyle = {
    backgroundColor: isDarkMode ? '#3E4A5B' : '#F4F6F8',
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontWeight: 'bold',
  };
  const tableCellStyle = {
    color: isDarkMode ? '#FFFFFF' : '#000000',
  };

  // Active/désactive un utilisateur
  const handleToggleStatus = async (user) => {
    try {
      const response = await toggleUserStatus(user);
      setUsers(users.map(u => u.id === user.id ? response : u));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  // Rendu principal
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
        mt: 8,
      }}>
        {/* Barre de recherche et bouton d'ajout */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%' }}>
          <Typography variant="h4" gutterBottom>Liste des utilisateurs</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />, sx: { background: isDarkMode ? '#2A354D' : '#fff', borderRadius: 2 }
              }}
              sx={{ minWidth: 250 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
              title="Ajouter un utilisateur"
              sx={{ minWidth: 48, minHeight: 48, p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <AddIcon sx={{ fontSize: 28 }} />
            </Button>
          </Box>
        </Box>
        {createError && <Typography color="error" sx={{ mb: 1 }}>{createError}</Typography>}
        {createSuccess && <Typography color="success.main" sx={{ mb: 1 }}>{createSuccess}</Typography>}
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
                  <TableCell sx={tableCellHeaderStyle}>Statut</TableCell>
                  <TableCell sx={tableCellHeaderStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.filter(user => {
                  const q = search.toLowerCase();
                  return (
                    user.name?.toLowerCase().includes(q) ||
                    user.last_name?.toLowerCase().includes(q) ||
                    user.email?.toLowerCase().includes(q)
                  );
                }).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell sx={tableCellStyle}><Avatar src={getPhotoSrc(user.photo_url)} /></TableCell>
                    <TableCell sx={tableCellStyle}>{user.name}</TableCell>
                    <TableCell sx={tableCellStyle}>{user.last_name}</TableCell>
                    <TableCell sx={tableCellStyle}>{user.email}</TableCell>
                    <TableCell sx={tableCellStyle}>{user.privilege || 'N/A'}</TableCell>
                    <TableCell sx={tableCellStyle}>
                      <IconButton
                        onClick={() => handleToggleStatus(user)}
                        aria-label={user.status === 'enabled' || user.enabled === true ? 'Désactiver' : 'Activer'}
                        sx={{
                          color: user.status === 'enabled' || user.enabled === true ? '#4caf50' : '#f44336',
                          marginRight: 2
                        }}
                      >
                        {user.status === 'enabled' || user.enabled === true ? <ToggleOnIcon fontSize="large" /> : <ToggleOffIcon fontSize="large" />}
                      </IconButton>
                    </TableCell>
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

      {/* Dialogs de confirmation, édition, création, succès */}
      {/* Suppression */}
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

      {/* Édition */}
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

      {/* Confirmation d'édition */}
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

      {/* Création d'utilisateur */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Créer un utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={e => {
                if (!e.target.files[0]) return;
                setPendingCreatePhotoFile(e.target.files[0]);
                setNewUser(prev => ({ ...prev, photo_url: URL.createObjectURL(e.target.files[0]) }));
              }}
            />
            <IconButton onClick={() => fileInputRef.current && fileInputRef.current.click()} sx={{ p: 0 }}>
              <Avatar
                src={newUser.photo_url || 'https://i.pravatar.cc/150?u=default'}
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
            value={newUser.name}
            onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="last_name"
            label="Nom"
            type="text"
            fullWidth
            variant="outlined"
            value={newUser.last_name}
            onChange={e => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Privilège</InputLabel>
            <Select
              name="privilege"
              value={newUser.privilege || ''}
              label="Privilège"
              onChange={e => setNewUser(prev => ({ ...prev, privilege: e.target.value }))}
            >
              {privileges.map((p) => (
                <MenuItem key={p.id} value={p.label}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={() => {
            setCreateError("");
            setCreateSuccess("");
            if (!newUser.name || !newUser.last_name || !newUser.email || !newUser.privilege) {
              setCreateError("Tous les champs sont obligatoires.");
              return;
            }
            setConfirmCreateDialogOpen(true);
          }} color="primary">Créer</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation création */}
      <Dialog open={confirmCreateDialogOpen} onClose={() => setConfirmCreateDialogOpen(false)}>
        <DialogTitle>Confirmer l'ajout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir ajouter cet utilisateur ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={async () => {
            setConfirmCreateDialogOpen(false);
            setCreateError("");
            setCreateSuccess("");
            try {
              const response = await createUser(
                { ...newUser },
                pendingCreatePhotoFile
              );
              // Ajoute un paramètre unique à l'URL de la photo pour forcer le rafraîchissement
              const userWithPhoto = response.photo_url ? { ...response, photo_url: response.photo_url + '?t=' + Date.now() } : response;
              setUsers(prev => [...prev, userWithPhoto]);
              setCreateDialogOpen(false);
              setNewUser({ name: '', last_name: '', email: '', privilege: '', photo_url: '' });
              setPendingCreatePhotoFile(null);
              setCreateSuccess("Utilisateur ajouté avec succès.");
            } catch (error) {
              setCreateError(error.response?.data?.detail || "Erreur lors de la création de l'utilisateur.");
            }
          }} color="primary">Confirmer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList; 
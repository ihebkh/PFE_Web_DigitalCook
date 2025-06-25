import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from './Header';
import { Box, Typography, Paper, Button, CircularProgress, Grid } from '@mui/material';
import { useTheme } from '../context/themeContext';

const CVParsing = ({ collapsed }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const marginLeft = collapsed ? 90 : 270;
  const { isDarkMode } = useTheme();

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setLoading(true);
    // Simuler un délai de traitement
    setTimeout(() => {
      setLoading(false);
      // Simuler des résultats
      setMatches([
        {
          cvName: "CV_John_Doe.pdf",
          offers: [
            {
              offre_id: 1,
              titre: "Développeur Full Stack",
              minSalaireFormat: "45K€",
              maxSalaireFormat: "65K€",
              ville: "Paris",
              pays: "France",
              typeContrat: "CDI",
              tempsDeTravail: "Temps plein",
              onSiteOrRemote: "Hybride",
              societe: "Tech Corp",
              lieuSociete: "Paris"
            }
          ]
        }
      ]);
    }, 2000);
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
        minHeight: 'calc(100vh - 64px - 64px)',
        overflow: 'auto',
        background: isDarkMode ? '#1E2B45' : '#fff',
        color: isDarkMode ? '#F0F0F0' : '#333',
      }}>

        <br></br>
        <br></br>
        <br></br>

        <Paper sx={{ p: 3, mb: 3, background: isDarkMode ? '#2A354D' : '#fff', color: isDarkMode ? '#F0F0F0' : '#333' }}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : (isDarkMode ? '#404B60' : 'grey.300'),
              borderRadius: 1,
              p: 3,
              mb: selectedFiles.length > 0 ? 2 : 0,
              textAlign: 'center',
              backgroundColor: isDragActive ? 'action.hover' : (isDarkMode ? '#2A354D' : 'background.paper'),
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: isDragActive ? 'action.hover' : (isDarkMode ? '#404B60' : 'action.hover')
              }
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Déposez les fichiers ici...</Typography>
            ) : (
              <Typography sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
                Glissez-déposez des fichiers PDF ici
              </Typography>
            )}
          </Box>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
                Fichiers sélectionnés ({selectedFiles.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isDarkMode ? '#2A354D' : '#fff',
                      color: isDarkMode ? '#F0F0F0' : '#333',
                      border: `1px solid ${isDarkMode ? '#404B60' : '#eee'}`,
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
                      {file.name}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeFile(index)}
                      sx={{ color: isDarkMode ? '#F0F0F0' : 'error.main' }}
                    >
                      Supprimer
                    </Button>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: selectedFiles.length > 0 ? 2 : 0 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading || selectedFiles.length === 0}
              sx={{
                bgcolor: isDarkMode ? '#404B60' : '#1976d2',
                color: isDarkMode ? '#F0F0F0' : '#fff',
                '&:hover': {
                  bgcolor: isDarkMode ? '#555' : '#1565c0',
                },
              }}
            >
              Analyser les CV
            </Button>
          </Box>

        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress size={50} sx={{ color: isDarkMode ? '#F0F0F0' : '#1976d2' }} />
          </Box>
        )}

        {matches && matches.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
              Résultats de Correspondance
            </Typography>
            <Grid container spacing={3} sx={{ width: '100%', flexDirection: 'column' }}>
                {matches.map(({ cvName, offers }) => (
                    <Grid item xs={12} key={cvName}>
                        <Typography variant="h6" gutterBottom sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>{cvName}</Typography>
                        <Grid container spacing={2}>
                            {offers.map((match) => (
                                <Grid item xs={12} md={4} key={match.offre_id}>
                                    <Paper
                                        sx={{
                                            border: `1px solid ${isDarkMode ? '#404B60' : 'grey'}`,
                                            borderRadius: 1,
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                            height: '100%',
                                            background: isDarkMode ? '#2A354D' : '#fff',
                                            color: isDarkMode ? '#F0F0F0' : '#333',
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>{match.titre}</Typography>
                                        <Typography variant="body2" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Salaire: {match.minSalaireFormat} - {match.maxSalaireFormat}</Typography>
                                        <Typography variant="body2" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Localisation: {match.ville}, {match.pays}</Typography>
                                        <Typography variant="body2" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Type de contrat: {match.typeContrat}</Typography>
                                        <Typography variant="body2" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Temps de travail: {match.tempsDeTravail}</Typography>
                                        <Typography variant="body2" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Mode de travail: {match.onSiteOrRemote}</Typography>
                                        <Typography variant="body2" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Société: {match.societe}</Typography>
                                        <Typography variant="body2" sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Lieu de la société: {match.lieuSociete}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default CVParsing; 
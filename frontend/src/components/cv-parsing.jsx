import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { cvParsingService } from '../service/cv/cv-parsing';
import Header from './Header';
import { useDropzone } from 'react-dropzone';

const CVParsing = ({ collapsed }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier CV');
      return;
    }

    setLoading(true);
    setMatches(null);
    try {
      const result = await cvParsingService.analyzeCVs(selectedFiles);
      const groupedMatches = new Map();
      result.offres_matchees.forEach(match => {
          const cvName = match.matched_cv;
          if (!groupedMatches.has(cvName)) {
              groupedMatches.set(cvName, []);
          }
          groupedMatches.get(cvName).push(match);
      });
      const groupedMatchesArray = Array.from(groupedMatches.entries()).map(([cvName, offers]) => ({
          cvName,
          offers
      }));

      setMatches(groupedMatchesArray);
      toast.success('Analyse des CV terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'analyse des CV:', error);
      toast.error(error.message || 'Erreur lors de l\'analyse des CV');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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
        overflow: 'auto'
      }}>

        <br></br>
        <br></br>
        <br></br>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              mb: selectedFiles.length > 0 ? 2 : 0,
              textAlign: 'center',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography>Déposez les fichiers ici...</Typography>
            ) : (
              <Typography>
                Glissez-déposez des fichiers PDF ici
              </Typography>
            )}
          </Box>

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
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
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeFile(index)}
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
            >
              Analyser les CV
            </Button>
          </Box>

        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress size={50} />
          </Box>
        )}

        {matches && matches.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Résultats de Correspondance
            </Typography>
            <Grid container spacing={3} sx={{ width: '100%', flexDirection: 'column' }}>
                {matches.map(({ cvName, offers }) => (
                    <Grid item xs={12} key={cvName}>
                        <Typography variant="h6" gutterBottom>{cvName}</Typography>
                        <Grid container spacing={2}>
                            {offers.map((match) => (
                                <Grid item xs={12} md={4} key={match.offre_id}>
                                    <Paper
                                        sx={{
                                            border: '1px solid grey',
                                            borderRadius: 1,
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                            height: '100%'
                                        }}
                                    >
                                        <Typography variant="subtitle1">{match.titre}</Typography>
                                        <Typography variant="body2">Salaire: {match.minSalaireFormat} - {match.maxSalaireFormat}</Typography>
                                        <Typography variant="body2">Localisation: {match.ville}, {match.pays}</Typography>
                                        <Typography variant="body2">Type de contrat: {match.typeContrat}</Typography>
                                        <Typography variant="body2">Temps de travail: {match.tempsDeTravail}</Typography>
                                        <Typography variant="body2">Mode de travail: {match.onSiteOrRemote}</Typography>
                                        <Typography variant="body2">Société: {match.societe}</Typography>
                                        <Typography variant="body2">Lieu de la société: {match.lieuSociete}</Typography>
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
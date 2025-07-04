// CvAnalyse.jsx
// Composant d'analyse de CV (upload PDF, affichage résultats, UX optimisée)
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button, CircularProgress, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import { FaFilePdf, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/themeContext';
import Header from './Header';
import { analyseCv } from '../service/cv/cvAnalyseService';

/**
 * Composant principal pour l'analyse de CV (upload PDF, affichage des résultats d'analyse)
 */
const CvAnalyse = ({ collapsed }) => {
  // États principaux
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();
  const marginLeft = collapsed ? 90 : 270;

  // Gestion du drag & drop de fichiers
  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    setResult(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  // Supprime un fichier sélectionné
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Lance l'analyse du CV
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyseCv(selectedFiles[0]);
      setResult(data);
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Rendu principal
  return (
    <div>
      <Header />
      <main style={{
        marginLeft: marginLeft,
        marginTop: 64,
        padding: 32,
        transition: 'margin-left 0.2s',
        width: `calc(100% - ${marginLeft}px)` ,
        minHeight: 'calc(100vh - 64px - 64px)',
        overflow: 'auto',
        background: isDarkMode ? '#1E2B45' : '#fff',
        color: isDarkMode ? '#F0F0F0' : '#333',
      }}>
        <Typography variant="h4" gutterBottom>Analyse de CV</Typography>
        {/* Zone de drop et sélection de fichier */}
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
              <Typography sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>Déposez le fichier ici...</Typography>
            ) : (
              <Typography sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
                Glissez-déposez un fichier PDF ici ou cliquez pour sélectionner
              </Typography>
            )}
          </Box>

          {/* Affichage du fichier sélectionné */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
                Fichier sélectionné :
              </Typography>
              <Paper
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaFilePdf className="text-red-600" size={22} />
                  <Typography variant="body2" noWrap sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
                    {selectedFiles[0].name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeFile(0)}
                  sx={{ color: isDarkMode ? '#F0F0F0' : 'error.main' }}
                >
                  <FaTimes />
                </IconButton>
              </Paper>
            </Box>
          )}

          {/* Bouton d'analyse */}
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
              Analyser le CV
            </Button>
          </Box>
        </Paper>

        {/* Loader */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress size={50} sx={{ color: isDarkMode ? '#F0F0F0' : '#1976d2' }} />
          </Box>
        )}

        {/* Affichage erreur */}
        {error && (
          <Box sx={{ color: 'red', mt: 2, textAlign: 'center' }}>{error}</Box>
        )}

        {/* Résultats d'analyse */}
        {result && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: isDarkMode ? '#F0F0F0' : '#333' }}>
              Résultats d'analyse
            </Typography>
            <Paper sx={{ p: 2, mb: 2, background: isDarkMode ? '#2A354D' : '#fff' }}>
              {/* Compétences détectées */}
              <Typography variant="subtitle1" sx={{ mb: 1 }}><b>Compétences détectées</b></Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {result.competences && result.competences.map((c, i) => (
                  <Paper key={i} sx={{ p: 0.5, px: 1, m: 0.2, bgcolor: '#e3f2fd', fontSize: 13 }}>{c}</Paper>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* Expériences */}
              <Typography variant="subtitle1" sx={{ mb: 1 }}><b>Expériences</b></Typography>
              <ul style={{ marginBottom: 16 }}>
                {result.experiences && result.experiences.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
              <Divider sx={{ my: 2 }} />
              {/* Pays détectés */}
              <Typography variant="subtitle1" sx={{ mb: 1 }}><b>Pays détectés</b></Typography>
              <Typography sx={{ mb: 2 }}>{result.pays && result.pays.join(", ")}</Typography>
              {/* Durée d'expérience */}
              <Typography variant="subtitle1" sx={{ mb: 1 }}><b>Durée d'expérience</b></Typography>
              <Typography sx={{ mb: 2 }}>{result.duree_experience}</Typography>
              <Divider sx={{ my: 2 }} />
              {/* Offres correspondantes */}
              <Typography variant="subtitle1" sx={{ mb: 1 }}><b>Offres correspondantes</b></Typography>
              {result.matches && result.matches.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2, background: isDarkMode ? '#22304a' : '#fff' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>N°</TableCell>
                        <TableCell>Titre</TableCell>
                        <TableCell>Société</TableCell>
                        <TableCell>Ville</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Compétences communes</TableCell>
                        <TableCell>Langues communes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.matches
                        .sort((a, b) => b.global_score - a.global_score)
                        .map((m, i) => {
                          const offre = m.offre;
                          return (
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{offre.titre}</TableCell>
                              <TableCell>{offre.societe}</TableCell>
                              <TableCell>{offre.lieuSociete || offre.ville}</TableCell>
                              <TableCell>{m.global_score.toFixed(2)}</TableCell>
                              <TableCell>{m.matching_skills && m.matching_skills.length > 0 ? m.matching_skills.join(", ") : 'Aucune'}</TableCell>
                              <TableCell>{m.matching_languages && m.matching_languages.length > 0 ? m.matching_languages.join(", ") : 'Aucune'}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ mt: 2 }}>Aucune offre ne correspond au seuil.</Typography>
              )}
            </Paper>
          </Box>
        )}
      </main>
    </div>
  );
};

export default CvAnalyse; 
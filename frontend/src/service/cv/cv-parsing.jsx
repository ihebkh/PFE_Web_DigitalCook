import axios from 'axios';

const API_URL = 'http://localhost:8000/cv';

export const cvParsingService = {
  /**
   * Envoie les fichiers CV pour analyse et matching avec les offres
   * @param {File[]} files - Liste des fichiers CV à analyser
   * @returns {Promise<Object>} - Résultat de l'analyse avec les offres correspondantes
   */
  analyzeCVs: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('cv_files', file);
    });

    try {
      const response = await axios.post(`${API_URL}/match-offres/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'analyse des CV');
    }
  }
}; 
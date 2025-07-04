// LoadingSpinner.jsx
// Composant d'affichage d'un écran de chargement animé
import React from 'react';

/**
 * Composant de spinner animé pour indiquer un chargement global.
 */
const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #1E2B45 0%, #2A354D 100%)',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Spinner animé */}
      <div style={{
        width: 60,
        height: 60,
        border: '4px solid rgba(255, 255, 255, 0.1)',
        borderTop: '4px solid #0D52CE',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 20
      }}></div>
      
      {/* Texte de chargement avec animation de points */}
      <div style={{
        fontSize: '18px',
        fontWeight: '500',
        letterSpacing: '1px'
      }}>
        Chargement
        <span style={{
          animation: 'dots 1.5s infinite',
          display: 'inline-block',
          width: '20px',
          textAlign: 'left'
        }}>...</span>
      </div>
      
      {/* Barre de progression animée */}
      <div style={{
        width: 200,
        height: 4,
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        marginTop: 20,
        overflow: 'hidden'
      }}>
        <div style={{
          width: '30%',
          height: '100%',
          background: 'linear-gradient(90deg, #0D52CE, #4A90E2)',
          borderRadius: 2,
          animation: 'progress 2s ease-in-out infinite'
        }}></div>
      </div>

      {/* Styles d'animation CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
          }
          
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(200%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner; 
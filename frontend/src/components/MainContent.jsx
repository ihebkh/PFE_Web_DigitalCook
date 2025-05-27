import React from 'react';

export default function MainContent() {
  return (
    <main style={{ marginLeft: 220, marginTop: 64, padding: 32 }}>
      <h2>Bienvenue sur le dashboard !</h2>
      <iframe 
  width="100%" 
  height="800" 
  src="https://app.powerbi.com/reportEmbed?reportId=8a548be8-682a-456a-8c76-a8849eccb6d6&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730" 
  frameborder="0" 
  allowFullScreen="true">
</iframe>

      {/* Ajoutez ici d'autres widgets ou composants */}
    </main>
  );
} 
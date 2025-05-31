import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Dashboard() {
  return (
    <div>
      <Header />
      <Sidebar />

      <main style={{ marginLeft: 220, marginTop: 64, padding: 32 }}>
        <iframe 
          width="100%" 
          height="800" 
          src="https://app.powerbi.com/reportEmbed?reportId=8a548be8-682a-456a-8c76-a8849eccb6d6&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730" 
          frameBorder="0" 
          allowFullScreen={true}
          title="Description du contenu de l'iframe"
        ></iframe>
      </main>
    </div>
  );
}

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
          title="Dashboard" 
          width="1100" 
          height="700" 
          src="https://app.powerbi.com/reportEmbed?reportId=65d99be3-92af-4c86-b4b5-24981f6a0508&pageName=ReportSection&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&navContentPaneEnabled=false&filterPaneEnabled=false" 
          frameBorder="0" 
          allowFullScreen="true"
        ></iframe>
      </main>
    </div>
  );
}

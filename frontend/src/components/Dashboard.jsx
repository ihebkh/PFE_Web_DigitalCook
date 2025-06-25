import React from 'react';
import Header from './Header';
import { useTheme } from '../context/themeContext';

export default function Dashboard({ collapsed }) {
  const marginLeft = collapsed ? 90 : 270;
  const { isDarkMode } = useTheme();

  return (
    <div>
      <Header />

      <main style={{
        marginLeft: marginLeft,
        marginTop: 64,
        padding: 32,
        transition: 'margin-left 0.2s',
        width: `calc(100% - ${marginLeft}px)`,
        height: 'calc(100vh - 64px - 64px)',
        overflow: 'auto',
        background: isDarkMode ? '#1E2B45' : '#fff',
        color: isDarkMode ? '#F0F0F0' : '#333',
      }}>
        <iframe 
          title="Dashboard" 
          style={{ width: '100%', height: '100%' }}
          src="https://app.powerbi.com/reportEmbed?reportId=65d99be3-92af-4c86-b4b5-24981f6a0508&pageName=ReportSection&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&navContentPaneEnabled=false&filterPaneEnabled=false" 
          frameBorder="0" 
          allowFullScreen="true"
        ></iframe>
      </main>
    </div>
  );
}


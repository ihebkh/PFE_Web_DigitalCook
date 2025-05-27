import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

export default function Dashboard() {
  return (
    <div>
      <Header />
      <Sidebar />
      <MainContent />
    </div>
  );
}
import React from 'react';

const Commercial = ({ collapsed }) => {
  return (
    <div className={`flex-1 p-6 ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Commerciale
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Bienvenue sur votre tableau de bord commercial
          </p>
        </div>
      </div>
    </div>
  );
};

export default Commercial; 
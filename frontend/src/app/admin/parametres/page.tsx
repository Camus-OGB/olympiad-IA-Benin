'use client';

import React from 'react';

export default function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-2">Configuration de la plateforme</p>
      </div>

      <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500">Paramètres à venir...</p>
      </div>
    </div>
  );
}

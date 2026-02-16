'use client';

import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const CURRENT_EDITION = {
  year: '2026',
  title: 'Édition 2026 — Sélection nationale',
  aoaiLocation: 'Sousse, Tunisie',
  aoaiDates: '9 - 12 Avril 2026',
} as const;

export default function EditionsManager() {

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">
            Édition en cours
          </h1>
          <p className="text-gray-500 mt-2">
            Cette page affiche uniquement les informations de l&apos;édition actuelle.
            Pour la mise à jour du contenu détaillé, utilisez les sections Phases et FAQ ci‑dessous.
          </p>
        </div>
      </div>

      {/* Carte unique pour l'édition en cours */}
      <div className="bg-white p-6 rounded-2xl border-2 border-ioai-green shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{CURRENT_EDITION.title}</h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                En cours
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} className="text-ioai-blue" />
                <span className="font-medium">{CURRENT_EDITION.aoaiDates}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-ioai-blue" />
                <span className="font-medium">{CURRENT_EDITION.aoaiLocation}</span>
              </div>
            </div>
          </div>

          {/* Aucun contrôle d'édition ici : la modification de l'édition se fait côté technique */}
          <div className="ml-4 text-xs text-gray-400 italic">
            Paramètres généraux de l&apos;édition figés dans le code.
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <a
            href={`/admin/contenu/editions/${CURRENT_EDITION.year}/phases`}
            className="text-sm font-medium text-ioai-blue hover:underline"
          >
            Gérer les phases →
          </a>
          <a
            href={`/admin/contenu/editions/${CURRENT_EDITION.year}/faqs`}
            className="text-sm font-medium text-ioai-blue hover:underline"
          >
            Gérer les FAQs →
          </a>
        </div>
      </div>
    </div>
  );
}

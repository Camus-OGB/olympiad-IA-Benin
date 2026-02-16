'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

interface TimelineEvent {
  id: string;
  order: number;
  date: string;
  title: string;
  description: string;
}

export default function GererTimeline() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      order: 1,
      date: "Fév — Mars 2025",
      title: "Appel à candidatures",
      description: "Plus de 700 inscrits."
    },
    {
      id: '2',
      order: 2,
      date: "15 Mars 2025",
      title: "Test de présélection",
      description: "Épreuve théorique en ligne."
    },
    {
      id: '3',
      order: 3,
      date: "Avr — Juil 2025",
      title: "Formation Intensive",
      description: "Bootcamps à Sèmè City."
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    date: '',
    title: '',
    description: ''
  });

  const handleAdd = () => {
    setIsEditing(true);
    setEditingEvent(null);
    setFormData({ date: '', title: '', description: '' });
  };

  const handleEdit = (event: TimelineEvent) => {
    setIsEditing(true);
    setEditingEvent(event);
    setFormData(event);
  };

  const handleSave = () => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...formData, id: e.id, order: e.order } as TimelineEvent : e));
    } else {
      const newEvent: TimelineEvent = {
        ...formData,
        id: Date.now().toString(),
        order: events.length + 1
      } as TimelineEvent;
      setEvents([...events, newEvent]);
    }
    setIsEditing(false);
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const moveEvent = (index: number, direction: 'up' | 'down') => {
    const newEvents = [...events];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= events.length) return;

    [newEvents[index], newEvents[targetIndex]] = [newEvents[targetIndex], newEvents[index]];
    newEvents.forEach((event, idx) => event.order = idx + 1);

    setEvents(newEvents);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour au bilan
          </button>
          <h1 className="text-3xl font-display font-black text-gray-900">Timeline - {slug}</h1>
          <p className="text-gray-500 mt-2">Chronologie du parcours de la sélection à la compétition</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Ajouter un événement
        </button>
      </div>

      {/* Formulaire */}
      {isEditing && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date ou période *
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="15 Mars 2025 ou Fév — Mars 2025"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'événement *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Test de présélection"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description courte</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brève description de l'événement..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all"
            >
              <Save size={20} />
              Enregistrer
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              <X size={20} />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Timeline visuelle */}
      <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-8">Aperçu de la timeline</h2>

        <div className="space-y-6">
          {events.sort((a, b) => a.order - b.order).map((event, index) => (
            <div key={event.id} className="flex gap-6">
              {/* Ligne verticale et numéro */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ioai-blue to-ioai-green flex items-center justify-center text-white font-bold shadow-lg">
                  {event.order}
                </div>
                {index < events.length - 1 && (
                  <div className="w-1 flex-1 bg-gradient-to-b from-ioai-blue to-ioai-green mt-2 mb-2 min-h-[40px]"></div>
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-ioai-green transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ioai-blue mb-2">{event.date}</p>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveEvent(index, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveEvent(index, 'down')}
                        disabled={index === events.length - 1}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && !isEditing && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucun événement dans la timeline. Ajoutez-en un pour commencer.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">📅 Conseil pour la timeline</h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          Organisez les événements chronologiquement, de l'appel à candidatures jusqu'au retour de la compétition internationale.
          Typiquement : Inscriptions → Pré-sélection → Formations → Finale nationale → Bootcamp → Compétition IOAI → Retour.
        </p>
      </div>
    </div>
  );
}

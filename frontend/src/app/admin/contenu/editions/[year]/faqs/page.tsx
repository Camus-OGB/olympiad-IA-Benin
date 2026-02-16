'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface FAQ {
  id: string;
  order: number;
  question: string;
  answer: string;
}

export default function FAQsManager() {
  const params = useParams();
  const router = useRouter();
  const year = params?.year as string;

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      order: 1,
      question: "Qui peut participer ?",
      answer: "Tout élève inscrit dans un établissement secondaire au Bénin, né après le 1er janvier 2007."
    },
    {
      id: '2',
      order: 2,
      question: "Faut-il savoir coder ?",
      answer: "Non, pas pour la première phase. La curiosité et un bon niveau en logique suffisent."
    },
    {
      id: '3',
      order: 3,
      question: "L'inscription est-elle payante ?",
      answer: "Non, la participation est entièrement gratuite."
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: '',
    answer: ''
  });

  const handleAdd = () => {
    setIsEditing(true);
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
  };

  const handleEdit = (faq: FAQ) => {
    setIsEditing(true);
    setEditingFaq(faq);
    setFormData(faq);
  };

  const handleSave = () => {
    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === editingFaq.id ? { ...formData, id: f.id, order: f.order } as FAQ : f));
    } else {
      const newFaq: FAQ = {
        ...formData,
        id: Date.now().toString(),
        order: faqs.length + 1
      } as FAQ;
      setFaqs([...faqs, newFaq]);
    }
    setIsEditing(false);
    setEditingFaq(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      setFaqs(faqs.filter(f => f.id !== id));
    }
  };

  const moveFaq = (index: number, direction: 'up' | 'down') => {
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
    newFaqs.forEach((faq, idx) => faq.order = idx + 1);

    setFaqs(newFaqs);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingFaq(null);
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
            Retour aux éditions
          </button>
          <h1 className="text-3xl font-display font-black text-gray-900">FAQs de l'édition {year}</h1>
          <p className="text-gray-500 mt-2">Gérez les questions fréquentes des candidats</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nouvelle FAQ
        </button>
      </div>

      {/* Formulaire */}
      {isEditing && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingFaq ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <HelpCircle className="inline w-4 h-4 mr-1" />
                Question *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Qui peut participer ?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Réponse *</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Réponse détaillée à la question..."
                rows={5}
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

      {/* Liste des FAQs */}
      <div className="space-y-4">
        {faqs.sort((a, b) => a.order - b.order).map((faq, index) => (
          <div
            key={faq.id}
            className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-lg font-bold text-gray-400 mt-1">#{faq.order}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => moveFaq(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={20} />
                  </button>
                  <button
                    onClick={() => moveFaq(index, 'down')}
                    disabled={index === faqs.length - 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={20} />
                  </button>
                </div>
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && !isEditing && (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center">
            <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune FAQ créée pour cette édition.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, HelpCircle, ArrowUp, ArrowDown, Loader2, Eye, EyeOff } from 'lucide-react';
import { contentApi, FAQItem, FAQCreate, FAQUpdate } from '@/lib/api/content';

export default function FAQsManager() {
  const params = useParams();
  const router = useRouter();
  const year = params?.year as string;

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState<FAQCreate>({
    question: '',
    answer: '',
    category: '',
    isPublished: true,
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await contentApi.getFAQ({ publishedOnly: false });
      setFaqs([...data].sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Erreur lors du chargement des FAQs:', error);
      alert('Erreur lors du chargement des FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: '',
      isPublished: true,
    });
  };

  const handleEdit = (faq: FAQItem) => {
    setIsEditing(true);
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      isPublished: faq.isPublished,
    });
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('La question et la réponse sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      if (editingFaq) {
        const update: FAQUpdate = {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category?.trim() || undefined,
          isPublished: formData.isPublished,
        };
        await contentApi.updateFAQ(editingFaq.id, update);
      } else {
        const create: FAQCreate = {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category?.trim() || undefined,
          order: faqs.length + 1,
          isPublished: formData.isPublished,
        };
        await contentApi.createFAQ(create);
      }
      await loadFAQs();
      setIsEditing(false);
      setEditingFaq(null);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error?.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      try {
        await contentApi.deleteFAQ(id);
        await loadFAQs();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        alert(error?.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const handleTogglePublished = async (faq: FAQItem) => {
    try {
      await contentApi.updateFAQ(faq.id, { isPublished: !faq.isPublished });
      await loadFAQs();
    } catch (error: any) {
      console.error('Erreur:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingFaq(null);
  };

  const moveFaq = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const withNewOrders = reordered.map((f, i) => ({ ...f, order: i + 1 }));
    setFaqs(withNewOrders);

    try {
      await Promise.all(
        withNewOrders.map(f => contentApi.updateFAQ(f.id, { order: f.order }))
      );
    } catch (error) {
      console.error('Erreur lors du réordonnancement:', error);
      await loadFAQs();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement des FAQs...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-500 mt-2">{faqs.length} question{faqs.length !== 1 ? 's' : ''} — visible sur toutes les éditions</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Catégorie <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Inscription, Épreuves, Résultats..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded accent-ioai-green"
                  />
                  <span className="text-sm font-bold text-gray-700">Publié (visible sur le site)</span>
                </label>
              </div>
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
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Enregistrer
                </>
              )}
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
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className={`bg-white p-6 rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all ${
              faq.isPublished ? 'border-gray-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-lg font-bold text-gray-400 mt-1">#{faq.order}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                      {faq.category && (
                        <span className="px-2 py-0.5 bg-ioai-blue/10 text-ioai-blue text-xs font-semibold rounded-full">
                          {faq.category}
                        </span>
                      )}
                      {!faq.isPublished && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                          Non publié
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
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
                  onClick={() => handleTogglePublished(faq)}
                  className={`p-2 rounded-lg transition-colors ${
                    faq.isPublished
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={faq.isPublished ? 'Dépublier' : 'Publier'}
                >
                  {faq.isPublished ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
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
            <p className="text-gray-500">Aucune FAQ créée pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

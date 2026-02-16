'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { qcmApi, QuestionCreate } from '@/lib/api/qcm';

export default function NewQuestion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<QuestionCreate>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'easy',
    category: '',
    explanation: '',
    points: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'correctAnswer' || name === 'points' ? parseInt(value) : value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.question.trim()) {
      setError('La question est requise');
      return;
    }

    if (formData.options.some(opt => !opt.trim())) {
      setError('Toutes les options doivent être remplies');
      return;
    }

    if (!formData.category.trim()) {
      setError('La catégorie est requise');
      return;
    }

    try {
      setLoading(true);
      await qcmApi.createQuestion(formData);
      router.push('/admin/qcm');
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la création de la question');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/qcm"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Nouvelle Question</h1>
          <p className="text-gray-500 mt-1">Créez une nouvelle question pour la banque QCM</p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Catégorie et Difficulté */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Ex: Mathématiques, IA, Logique..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Difficulté <span className="text-red-500">*</span>
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                required
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Points
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
              />
            </div>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              rows={3}
              placeholder="Posez votre question ici..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue resize-none"
              required
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Options de réponse <span className="text-red-500">*</span>
            </label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  checked={formData.correctAnswer === index}
                  onChange={handleChange}
                  className="w-5 h-5 text-ioai-green focus:ring-ioai-green"
                />
                <span className="w-8 text-sm font-medium text-gray-600">
                  {String.fromCharCode(65 + index)}.
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue ${
                    formData.correctAnswer === index
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Sélectionnez le bouton radio pour marquer la bonne réponse
            </p>
          </div>

          {/* Explication */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Explication (optionnel)
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={2}
              placeholder="Expliquez pourquoi cette réponse est correcte..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/qcm"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Création...
              </>
            ) : (
              <>
                <Save size={18} />
                Créer la question
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

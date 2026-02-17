'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Trash2, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import CategorySelector from '@/components/CategorySelector';

// Types pour le nouveau format flexible
interface QuestionOption {
  text: string;
  id: number;
}

interface FlexibleQuestionCreate {
  question: string;
  options: QuestionOption[];
  correctAnswers: number[];  // Liste d'index
  isMultipleAnswer: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryId: string | null;
  explanation: string;
  points: number;
}

export default function NewQuestionFlexible() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FlexibleQuestionCreate>({
    question: '',
    options: [
      { text: '', id: 0 },
      { text: '', id: 1 },
    ],
    correctAnswers: [],
    isMultipleAnswer: false,
    difficulty: 'easy',
    categoryId: null,
    explanation: '',
    points: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) || 1 : value,
    }));
  };

  const handleOptionChange = (id: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === id ? { ...opt, text: value } : opt
      )
    }));
  };

  const addOption = () => {
    if (formData.options.length >= 6) {
      alert('Maximum 6 réponses possibles');
      return;
    }
    const newId = formData.options.length;
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', id: newId }]
    }));
  };

  const removeOption = (id: number) => {
    if (formData.options.length <= 2) {
      alert('Minimum 2 réponses requises');
      return;
    }

    // Retirer l'option et réajuster les IDs
    const newOptions = formData.options
      .filter(opt => opt.id !== id)
      .map((opt, index) => ({ ...opt, id: index }));

    // Ajuster correctAnswers
    const newCorrectAnswers = formData.correctAnswers
      .filter(idx => idx !== id)
      .map(idx => idx > id ? idx - 1 : idx);

    setFormData(prev => ({
      ...prev,
      options: newOptions,
      correctAnswers: newCorrectAnswers
    }));
  };

  const toggleCorrectAnswer = (id: number) => {
    if (formData.isMultipleAnswer) {
      // Mode multi: toggle
      setFormData(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers.includes(id)
          ? prev.correctAnswers.filter(idx => idx !== id)
          : [...prev.correctAnswers, id]
      }));
    } else {
      // Mode simple: une seule réponse
      setFormData(prev => ({
        ...prev,
        correctAnswers: [id]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.question.trim()) {
      setError('La question est requise');
      return;
    }

    if (formData.options.some(opt => !opt.text.trim())) {
      setError('Toutes les options doivent être remplies');
      return;
    }

    if (formData.correctAnswers.length === 0) {
      setError('Sélectionnez au moins une bonne réponse');
      return;
    }

    if (!formData.categoryId) {
      setError('La catégorie est requise');
      return;
    }

    try {
      setLoading(true);
      // Appel API avec le nouveau format
      const response = await fetch('/api/v1/qcm/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: formData.question,
          options: formData.options,
          correct_answers: formData.correctAnswers,
          is_multiple_answer: formData.isMultipleAnswer,
          difficulty: formData.difficulty,
          category_id: formData.categoryId,
          explanation: formData.explanation || undefined,
          points: formData.points
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erreur lors de la création');
      }

      router.push('/admin/qcm/questions');
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la création de la question');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/qcm/questions"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Nouvelle Question</h1>
          <p className="text-gray-500 mt-1">Créez une question flexible (2-6 réponses, simple ou multiple)</p>
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
              placeholder="Énoncé de la question..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Type de réponse */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <input
              type="checkbox"
              id="isMultipleAnswer"
              checked={formData.isMultipleAnswer}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  isMultipleAnswer: e.target.checked,
                  correctAnswers: e.target.checked ? prev.correctAnswers : prev.correctAnswers.slice(0, 1)
                }));
              }}
              className="w-4 h-4 text-ioai-blue focus:ring-ioai-blue border-gray-300 rounded"
            />
            <label htmlFor="isMultipleAnswer" className="flex items-center gap-2 text-sm font-medium text-blue-900 cursor-pointer">
              <CheckSquare size={16} />
              Question à choix multiples (plusieurs bonnes réponses)
            </label>
          </div>

          {/* Options de réponse */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Réponses ({formData.options.length}/6) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addOption}
                disabled={formData.options.length >= 6}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ioai-blue hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Ajouter une réponse
              </button>
            </div>

            {formData.options.map((option) => (
              <div key={option.id} className="flex items-center gap-3">
                {/* Checkbox/Radio pour réponse correcte */}
                <div className="flex-shrink-0">
                  {formData.isMultipleAnswer ? (
                    <input
                      type="checkbox"
                      checked={formData.correctAnswers.includes(option.id)}
                      onChange={() => toggleCorrectAnswer(option.id)}
                      className="w-5 h-5 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                    />
                  ) : (
                    <input
                      type="radio"
                      checked={formData.correctAnswers.includes(option.id)}
                      onChange={() => toggleCorrectAnswer(option.id)}
                      className="w-5 h-5 text-green-500 focus:ring-green-500 border-gray-300"
                    />
                  )}
                </div>

                {/* Texte de l'option */}
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${option.id + 1}`}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent ${
                    formData.correctAnswers.includes(option.id)
                      ? 'bg-green-50 border-green-300'
                      : 'border-gray-300'
                  }`}
                  required
                />

                {/* Bouton suppression */}
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  disabled={formData.options.length <= 2}
                  className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <p className="text-xs text-gray-500">
              {formData.isMultipleAnswer
                ? '✓ Cochez toutes les bonnes réponses'
                : '✓ Sélectionnez la bonne réponse avec le bouton radio'
              }
            </p>
          </div>

          {/* Catégorie avec sélecteur inline */}
          <CategorySelector
            value={formData.categoryId}
            onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId }))}
            error={!formData.categoryId && error ? 'La catégorie est requise' : undefined}
          />

          {/* Difficulté et Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Difficulté <span className="text-red-500">*</span>
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent"
                required
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Points <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min={1}
                max={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Explication */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Explication (optionnelle)
            </label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={3}
              placeholder="Explication de la bonne réponse..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Création...
              </>
            ) : (
              <>
                <Save size={20} />
                Créer la question
              </>
            )}
          </button>

          <Link
            href="/admin/qcm/questions"
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

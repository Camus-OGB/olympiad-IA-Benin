'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Circle, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { qcmApi, QuestionOption } from '@/lib/api/qcm';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' },
];

const DEFAULT_OPTIONS: QuestionOption[] = [
  { id: 0, text: '' },
  { id: 1, text: '' },
  { id: 2, text: '' },
  { id: 3, text: '' },
];

export default function NewQuestion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>(DEFAULT_OPTIONS);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([0]);
  const [isMultipleAnswer, setIsMultipleAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState('');
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(1);

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions(prev => [...prev, { id: prev.length, text: '' }]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    const newOptions = options
      .filter((_, i) => i !== idx)
      .map((opt, i) => ({ ...opt, id: i }));
    const newCorrect = correctAnswers
      .filter(ci => ci !== idx)
      .map(ci => (ci > idx ? ci - 1 : ci));
    setOptions(newOptions);
    setCorrectAnswers(newCorrect.length > 0 ? newCorrect : [0]);
  };

  const updateOption = (idx: number, text: string) => {
    setOptions(prev => prev.map((opt, i) => (i === idx ? { ...opt, text } : opt)));
  };

  const toggleCorrectAnswer = (idx: number) => {
    if (isMultipleAnswer) {
      setCorrectAnswers(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      setCorrectAnswers([idx]);
    }
  };

  const toggleMultipleAnswer = (val: boolean) => {
    setIsMultipleAnswer(val);
    if (!val) setCorrectAnswers(correctAnswers.length > 0 ? [correctAnswers[0]] : [0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!questionText.trim()) { setError('La question est requise'); return; }
    if (options.some(opt => !opt.text.trim())) { setError('Toutes les options doivent être remplies'); return; }
    if (correctAnswers.length === 0) { setError('Sélectionnez au moins une bonne réponse'); return; }
    if (!category.trim()) { setError('La catégorie est requise'); return; }

    try {
      setLoading(true);
      await qcmApi.createQuestion({
        question: questionText,
        options,
        correctAnswers,
        isMultipleAnswer,
        difficulty,
        category,
        explanation: explanation || undefined,
        points,
      });
      router.push('/admin/qcm');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création de la question');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/qcm" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Nouvelle Question</h1>
          <p className="text-gray-500 mt-1">Créez une nouvelle question pour la banque QCM</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Métadonnées */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ex: Mathématiques, IA, Logique..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Difficulté</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue text-sm"
              >
                {DIFFICULTY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Points</label>
              <input
                type="number"
                value={points}
                onChange={e => setPoints(parseInt(e.target.value) || 1)}
                min={1} max={10}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue text-sm"
              />
            </div>
          </div>
        </div>

        {/* Texte de la question */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">
            Question <span className="text-red-500">*</span>
          </h2>
          <textarea
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            rows={3}
            placeholder="Posez votre question ici..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue resize-none text-sm"
          />
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              Options
              <span className="ml-2 text-sm font-normal text-gray-400">{options.length} / 6 max</span>
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMultipleAnswer}
                onChange={e => toggleMultipleAnswer(e.target.checked)}
                className="w-4 h-4 text-ioai-green rounded"
              />
              Réponses multiples
            </label>
          </div>

          <div className="space-y-3">
            {options.map((opt, idx) => {
              const isCorrect = correctAnswers.includes(idx);
              return (
                <div key={opt.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCorrectAnswer(idx)}
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCorrect
                        ? 'bg-ioai-green border-ioai-green text-white'
                        : 'border-gray-300 text-gray-300 hover:border-ioai-green'
                    }`}
                  >
                    {isMultipleAnswer ? <CheckSquare size={13} /> : <Circle size={13} />}
                  </button>
                  <span className={`shrink-0 w-6 text-sm font-bold ${isCorrect ? 'text-ioai-green' : 'text-gray-400'}`}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => updateOption(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-ioai-blue transition-colors ${
                      isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-200'
                    }`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {isMultipleAnswer
                ? 'Sélectionnez toutes les bonnes réponses'
                : 'Sélectionnez une seule bonne réponse'}
            </p>
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1.5 text-sm text-ioai-blue hover:text-blue-700 font-medium"
              >
                <Plus size={15} />
                Ajouter une option
              </button>
            )}
          </div>
        </div>

        {/* Explication */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">
            Explication <span className="text-sm font-normal text-gray-400">(optionnel)</span>
          </h2>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            rows={2}
            placeholder="Expliquez pourquoi cette réponse est correcte..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/qcm"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Création...</>
            ) : (
              <><Save size={18} />Créer la question</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

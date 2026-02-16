'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { qcmApi, SessionCreate, QuestionWithAnswer } from '@/lib/api/qcm';

export default function NewSession() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [useDistribution, setUseDistribution] = useState(false);

  const [formData, setFormData] = useState<SessionCreate>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalQuestions: 20,
    timePerQuestion: 2,
    passingScore: 60,
    categories: [],
    difficulties: [],
    distributionByDifficulty: undefined,
  });

  const [distribution, setDistribution] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Charger les questions pour afficher les stats
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await qcmApi.getAllQuestions();
        setQuestions(data);
      } catch (err) {
        console.error('Erreur chargement questions:', err);
      }
    };
    fetchQuestions();
  }, []);

  // Statistiques des questions disponibles
  const questionStats = {
    total: questions.length,
    byDifficulty: {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    },
    categories: Array.from(new Set(questions.map(q => q.category).filter(Boolean))),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['totalQuestions', 'timePerQuestion', 'passingScore'].includes(name)
        ? parseInt(value)
        : value,
    }));
  };

  const handleDistributionChange = (difficulty: 'easy' | 'medium' | 'hard', value: string) => {
    const newDist = { ...distribution, [difficulty]: parseInt(value) || 0 };
    setDistribution(newDist);

    // Mettre à jour totalQuestions automatiquement
    const total = newDist.easy + newDist.medium + newDist.hard;
    setFormData(prev => ({
      ...prev,
      totalQuestions: total,
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...(prev.categories || []), category],
    }));
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setFormData(prev => ({
      ...prev,
      difficulties: prev.difficulties?.includes(difficulty)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...(prev.difficulties || []), difficulty],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Les dates sont requises');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    if (formData.totalQuestions < 1 || formData.totalQuestions > 100) {
      setError('Le nombre de questions doit être entre 1 et 100');
      return;
    }

    if (useDistribution) {
      const total = distribution.easy + distribution.medium + distribution.hard;
      if (total !== formData.totalQuestions) {
        setError(`La somme de la distribution (${total}) doit égaler le nombre total de questions (${formData.totalQuestions})`);
        return;
      }
    }

    try {
      setLoading(true);

      const payload: SessionCreate = {
        ...formData,
        categories: formData.categories && formData.categories.length > 0 ? formData.categories : undefined,
        difficulties: formData.difficulties && formData.difficulties.length > 0 ? formData.difficulties : undefined,
        distributionByDifficulty: useDistribution && (distribution.easy + distribution.medium + distribution.hard > 0)
          ? distribution
          : undefined,
      };

      await qcmApi.createSession(payload);
      router.push('/admin/qcm?tab=sessions');
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la création de la session');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/qcm"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Nouvelle Session QCM</h1>
          <p className="text-gray-500 mt-1">Créez une session d'examen avec tirage aléatoire des questions</p>
        </div>
      </div>

      {/* Statistiques banque de questions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 shrink-0" size={20} />
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-2">Banque de questions disponibles</p>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-bold text-gray-900">{questionStats.total} questions</span>
              </div>
              <div>
                <span className="text-green-600">Facile:</span>
                <span className="ml-2 font-bold text-gray-900">{questionStats.byDifficulty.easy}</span>
              </div>
              <div>
                <span className="text-yellow-600">Moyen:</span>
                <span className="ml-2 font-bold text-gray-900">{questionStats.byDifficulty.medium}</span>
              </div>
              <div>
                <span className="text-red-600">Difficile:</span>
                <span className="ml-2 font-bold text-gray-900">{questionStats.byDifficulty.hard}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Informations générales */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Informations générales</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Titre de la session <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: QCM Régional 2026"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez cette session QCM..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                required
              />
            </div>
          </div>
        </div>

        {/* Configuration des questions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Configuration des questions</h2>

          {/* Toggle distribution */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="useDistribution"
              checked={useDistribution}
              onChange={(e) => setUseDistribution(e.target.checked)}
              className="w-5 h-5 text-ioai-blue rounded focus:ring-ioai-blue"
            />
            <label htmlFor="useDistribution" className="text-sm font-medium text-gray-700 cursor-pointer">
              Définir une distribution par niveau de difficulté
            </label>
          </div>

          {!useDistribution ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nombre total de questions <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalQuestions"
                  value={formData.totalQuestions}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Temps par question (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="timePerQuestion"
                  value={formData.timePerQuestion}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                  required
                />
                <p className="text-xs text-gray-500">
                  Durée totale: {formData.totalQuestions * formData.timePerQuestion} minutes
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Définissez le nombre de questions pour chaque niveau de difficulté
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-600">
                    Questions faciles
                  </label>
                  <input
                    type="number"
                    value={distribution.easy}
                    onChange={(e) => handleDistributionChange('easy', e.target.value)}
                    min="0"
                    max={questionStats.byDifficulty.easy}
                    className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500">Disponibles: {questionStats.byDifficulty.easy}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-yellow-600">
                    Questions moyennes
                  </label>
                  <input
                    type="number"
                    value={distribution.medium}
                    onChange={(e) => handleDistributionChange('medium', e.target.value)}
                    min="0"
                    max={questionStats.byDifficulty.medium}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="text-xs text-gray-500">Disponibles: {questionStats.byDifficulty.medium}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-red-600">
                    Questions difficiles
                  </label>
                  <input
                    type="number"
                    value={distribution.hard}
                    onChange={(e) => handleDistributionChange('hard', e.target.value)}
                    min="0"
                    max={questionStats.byDifficulty.hard}
                    className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500">Disponibles: {questionStats.byDifficulty.hard}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  Total: <span className="text-ioai-blue text-lg font-bold">{distribution.easy + distribution.medium + distribution.hard}</span> questions
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Temps par question (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="timePerQuestion"
                  value={formData.timePerQuestion}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                  required
                />
                <p className="text-xs text-gray-500">
                  Durée totale: {formData.totalQuestions * formData.timePerQuestion} minutes
                </p>
              </div>
            </div>
          )}

          {/* Score de passage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Score de passage (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="passingScore"
              value={formData.passingScore}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
              required
            />
          </div>
        </div>

        {/* Filtres optionnels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Filtres optionnels</h2>
          <p className="text-sm text-gray-600">
            Limitez le tirage aléatoire à certaines catégories ou difficultés (laissez vide pour toutes)
          </p>

          {/* Catégories */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Catégories</label>
            <div className="flex flex-wrap gap-2">
              {questionStats.categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.categories?.includes(category)
                      ? 'bg-ioai-blue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Difficultés */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Niveaux de difficulté</label>
            <div className="flex gap-2">
              {[
                { value: 'easy', label: 'Facile', color: 'green' },
                { value: 'medium', label: 'Moyen', color: 'yellow' },
                { value: 'hard', label: 'Difficile', color: 'red' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleDifficultyToggle(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.difficulties?.includes(value)
                      ? `bg-${color}-500 text-white`
                      : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-8">
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
                Créer la session
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

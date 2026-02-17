'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, AlertCircle, Loader2, Plus, X, Circle, CheckSquare } from 'lucide-react';
import { qcmApi, QuestionOption, QuestionWithAnswer } from '@/lib/api/qcm';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' },
];

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Champs du formulaire
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([0]);
  const [isMultipleAnswer, setIsMultipleAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('');
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(1);

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const questions = await qcmApi.getAllQuestions();
      const q = questions.find(q => q.id === questionId);
      if (!q) { setError('Question non trouvée'); return; }

      setQuestionText(q.question);
      setDifficulty(q.difficulty);
      setCategory(q.category || '');
      setExplanation(q.explanation || '');
      setPoints(q.points);
      setIsMultipleAnswer(q.isMultipleAnswer || false);
      setCorrectAnswers(q.correctAnswers || [0]);

      // Normaliser les options au format {id, text}
      const normalized: QuestionOption[] = (q.options || []).map((opt, i) =>
        typeof opt === 'object' && 'text' in opt
          ? { id: i, text: (opt as QuestionOption).text }
          : { id: i, text: String(opt) }
      );
      setOptions(normalized.length >= 2 ? normalized : [{ id: 0, text: '' }, { id: 1, text: '' }]);
    } catch {
      setError('Erreur lors du chargement de la question');
    } finally {
      setLoading(false);
    }
  };

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
    setError(''); setSuccess('');

    if (!questionText.trim()) { setError('La question est requise'); return; }
    if (options.some(opt => !opt.text.trim())) { setError('Toutes les options doivent être remplies'); return; }
    if (correctAnswers.length === 0) { setError('Sélectionnez au moins une bonne réponse'); return; }

    try {
      setSaving(true);
      await qcmApi.updateQuestion(questionId, {
        question: questionText,
        options,
        correctAnswers,
        isMultipleAnswer,
        difficulty,
        category,
        explanation: explanation || undefined,
        points,
      });
      setSuccess('Question mise à jour avec succès !');
      setTimeout(() => router.push('/admin/qcm'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette question ? Cette action est irréversible.')) return;
    try {
      setDeleting(true);
      await qcmApi.deleteQuestion(questionId);
      router.push('/admin/qcm');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-ioai-green" />
      </div>
    );
  }

  if (error && options.length === 0) {
    return (
      <div className="max-w-3xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          <AlertCircle className="h-5 w-5 inline mr-2" />{error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/qcm')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Modifier la question</h1>
          <p className="text-gray-400 text-xs mt-1 font-mono">{questionId}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          <AlertCircle className="h-4 w-4 inline mr-2" />{error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Métadonnées */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Catégorie</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ex: Mathématiques, IA..."
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
          <h2 className="font-bold text-gray-900 mb-3">Question <span className="text-red-500">*</span></h2>
          <textarea
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            rows={3}
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
              {isMultipleAnswer ? 'Sélectionnez toutes les bonnes réponses' : 'Sélectionnez une seule bonne réponse'}
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
            placeholder="Explication de la réponse correcte..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Supprimer
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

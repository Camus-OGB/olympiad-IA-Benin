'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, Clock, Eye, FileText, List, Search, Filter, Download, Upload, BarChart2 } from 'lucide-react';
import { qcmApi, QCMSessionResponse, QuestionWithAnswer } from '@/lib/api/qcm';
import Link from 'next/link';

type Tab = 'questions' | 'sessions';

export default function QcmManager() {
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [sessions, setSessions] = useState<QCMSessionResponse[]>([]);
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres pour questions
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === 'sessions') {
          const data = await qcmApi.getAllSessions();
          setSessions(data);
        } else {
          const params: any = {};
          if (filterCategory) params.category = filterCategory;
          if (filterDifficulty) params.difficulty = filterDifficulty;

          const data = await qcmApi.getAllQuestions(params);
          setQuestions(data);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, filterCategory, filterDifficulty]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session QCM ?')) {
      return;
    }

    try {
      await qcmApi.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de la session');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      return;
    }

    try {
      await qcmApi.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression de la question');
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  // Filtrer les questions par recherche
  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Extraire les catégories uniques
  const categories = Array.from(new Set(questions.map(q => q.category).filter(Boolean)));

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Erreur de chargement</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-ioai-green text-white rounded-lg hover:bg-green-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Gestion QCM</h1>
          <p className="text-gray-500 mt-2">Gérez les questions et les sessions d'examens</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/qcm/statistiques"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <BarChart2 size={18} />
            Statistiques
          </Link>
        {activeTab === 'questions' ? (
          <div className="flex gap-3">
            <Link
              href="/admin/qcm/importer"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload size={18} />
              Importer
            </Link>
            <Link
              href="/admin/qcm/questions/nouveau"
              className="px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Nouvelle Question
            </Link>
          </div>
        ) : (
          <Link
            href="/admin/qcm/sessions/nouveau"
            className="px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Nouvelle Session
          </Link>
        )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} /> Questions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List size={16} /> Sessions ({sessions.length})
        </button>
      </div>

      {/* Content Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Filtres et recherche */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher une question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                >
                  <option value="">Toutes catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-ioai-blue"
                >
                  <option value="">Toutes difficultés</option>
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des questions */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Aucune question trouvée</p>
              <Link
                href="/admin/qcm/questions/nouveau"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600"
              >
                <Plus size={20} />
                Créer la première question
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyLabel(question.difficulty)}
                        </span>
                        {question.category && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            {question.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{question.points} point{question.points > 1 ? 's' : ''}</span>
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {question.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-2 rounded-lg ${
                              idx === question.correctAnswer
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/qcm/questions/${question.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Aucune session QCM créée</p>
              <Link
                href="/admin/qcm/sessions/nouveau"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600"
              >
                <Plus size={20} />
                Créer la première session
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sessions.map((session) => (
                <div key={session.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          session.isActive ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {session.isActive ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{session.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Questions</p>
                          <p className="text-lg font-bold text-gray-900">{session.totalQuestions}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Durée</p>
                          <p className="text-lg font-bold text-gray-900">{formatDuration(session.duration)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Score min</p>
                          <p className="text-lg font-bold text-gray-900">{session.passingScore}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Catégories</p>
                          <p className="text-sm font-medium text-gray-900">
                            {session.categories?.length || 'Toutes'}
                          </p>
                        </div>
                      </div>

                      {session.distributionByDifficulty && (
                        <div className="flex gap-2 mb-3">
                          <span className="text-xs text-gray-500">Distribution:</span>
                          {session.distributionByDifficulty.easy && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                              Facile: {session.distributionByDifficulty.easy}
                            </span>
                          )}
                          {session.distributionByDifficulty.medium && (
                            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
                              Moyen: {session.distributionByDifficulty.medium}
                            </span>
                          )}
                          {session.distributionByDifficulty.hard && (
                            <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                              Difficile: {session.distributionByDifficulty.hard}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        Du {new Date(session.startDate).toLocaleDateString('fr-FR')} au {new Date(session.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/qcm/sessions/${session.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit size={20} />
                      </Link>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

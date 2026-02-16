'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Award, BarChart3, Clock, CheckCircle, Target, ChevronDown, ChevronUp, Calendar, Star, Loader2, AlertCircle } from 'lucide-react';
import { qcmApi, type QCMAttempt, type SessionForCandidate } from '@/lib/api/qcm';

interface AttemptWithSession extends QCMAttempt {
  session?: SessionForCandidate;
}

export default function Results() {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<AttemptWithSession[]>([]);
  const [sessions, setSessions] = useState<SessionForCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les résultats
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        // Récupérer les attempts et les sessions
        const [attemptsData, sessionsData] = await Promise.all([
          qcmApi.getResults(),
          qcmApi.getCandidateSessions()
        ]);

        // Associer chaque attempt à sa session
        const attemptsWithSessions = attemptsData.map(attempt => ({
          ...attempt,
          session: sessionsData.find(s => s.id === attempt.sessionId)
        }));

        setAttempts(attemptsWithSessions);
        setSessions(sessionsData);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur chargement résultats:', err);
        setError('Impossible de charger les résultats');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Calculer les statistiques
  const completedAttempts = attempts.filter(a => a.score !== null && a.score !== undefined);
  const averageScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / completedAttempts.length)
    : 0;
  const bestScore = completedAttempts.length > 0
    ? Math.max(...completedAttempts.map(a => a.score || 0))
    : 0;

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (completedAttempts.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900">Mes Résultats</h1>
          <p className="text-gray-500 text-sm">Suivez votre progression et vos performances</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun résultat pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">Complétez un QCM pour voir vos résultats ici</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-black text-gray-900">Mes Résultats</h1>
        <p className="text-gray-500 text-sm">Suivez votre progression et vos performances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-ioai-blue to-blue-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-black">{completedAttempts.length}</p>
          <p className="text-blue-100 text-sm">QCM complétés</p>
        </div>

        <div className="bg-gradient-to-br from-ioai-green to-emerald-500 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <Target size={24} />
          </div>
          <p className="text-3xl font-black">{averageScore}%</p>
          <p className="text-green-100 text-sm">Score moyen</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <Star size={24} />
          </div>
          <p className="text-3xl font-black">{bestScore}%</p>
          <p className="text-purple-100 text-sm">Meilleur score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Résultats détaillés */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-gray-900">Résultats par épreuve</h2>
          
          <div className="space-y-3">
            {completedAttempts.map((attempt) => {
              const score = attempt.score || 0;
              const completedDate = attempt.completedAt ? new Date(attempt.completedAt) : null;
              const startDate = new Date(attempt.startedAt);
              const duration = completedDate
                ? Math.round((completedDate.getTime() - startDate.getTime()) / 1000 / 60)
                : 0;

              return (
                <div key={attempt.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedResult(expandedResult === attempt.id ? null : attempt.id)}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      score >= 80 ? 'bg-green-50 text-ioai-green' :
                      score >= 60 ? 'bg-yellow-50 text-benin-yellow' :
                      'bg-red-50 text-red-500'
                    }`}>
                      <CheckCircle size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{attempt.session?.title || 'QCM'}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        {completedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {completedDate.toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {duration} min
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`text-2xl font-black ${
                          score >= 80 ? 'text-ioai-green' :
                          score >= 60 ? 'text-benin-yellow' :
                          'text-red-500'
                        }`}>
                          {Math.round(score)}%
                        </p>
                      </div>
                      {expandedResult === attempt.id ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedResult === attempt.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-lg font-black text-gray-900">{Math.round(score)}%</p>
                          <p className="text-xs text-gray-500">Score final</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-lg font-black text-gray-900">{duration} min</p>
                          <p className="text-xs text-gray-500">Temps utilisé</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Score</span>
                          <span>{Math.round(score)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              score >= 80 ? 'bg-ioai-green' :
                              score >= 60 ? 'bg-benin-yellow' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>

                      {attempt.session && score >= attempt.session.passingScore && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                          <p className="text-xs text-green-700 font-medium">
                            ✅ Réussi (Seuil: {attempt.session.passingScore}%)
                          </p>
                        </div>
                      )}
                      {attempt.session && score < attempt.session.passingScore && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                          <p className="text-xs text-red-700 font-medium">
                            ❌ Non réussi (Seuil: {attempt.session.passingScore}%)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistiques globales */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} /> Statistiques
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">QCM complétés</span>
                  <span className="font-bold text-gray-900">{completedAttempts.length}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-ioai-blue rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Score moyen</span>
                  <span className="font-bold text-ioai-green">{averageScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-ioai-green rounded-full" style={{ width: `${averageScore}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Meilleur score</span>
                  <span className="font-bold text-gray-900">{bestScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${bestScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={18} /> Badges obtenus
            </h3>
            <div className="flex flex-wrap gap-2">
              {completedAttempts.length >= 1 && (
                <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star size={12} /> Premier QCM
                </span>
              )}
              {bestScore >= 90 && (
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> Score 90%+
                </span>
              )}
              {completedAttempts.length >= 5 && (
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <TrendingUp size={12} /> 5 QCM complétés
                </span>
              )}
              {averageScore >= 80 && (
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Target size={12} /> Moyenne 80%+
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

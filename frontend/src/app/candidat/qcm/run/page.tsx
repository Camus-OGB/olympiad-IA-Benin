'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, XCircle, Maximize, Eye, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { qcmApi, type Question, type QCMAttempt, type SessionForCandidate } from '@/lib/api/qcm';

interface QuestionWithDifficulty extends Question {
  difficulty?: string;
}

export default function QcmRun() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  // États pour les données du backend
  const [session, setSession] = useState<SessionForCandidate | null>(null);
  const [attempt, setAttempt] = useState<QCMAttempt | null>(null);
  const [questions, setQuestions] = useState<QuestionWithDifficulty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour l'interface
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startTime] = useState(Date.now());

  // Charger la session et démarrer l'attempt
  useEffect(() => {
    const initQCM = async () => {
      if (!sessionId) {
        setError('Aucune session sélectionnée');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Démarrer l'attempt
        const attemptData = await qcmApi.startAttempt(sessionId);
        setAttempt(attemptData);

        // Charger les questions
        const questionsData = await qcmApi.getQuestions(attemptData.id);
        setQuestions(questionsData as QuestionWithDifficulty[]);
        setAnswers(new Array(questionsData.length).fill(null));

        // Récupérer les infos de la session pour la durée
        const sessions = await qcmApi.getCandidateSessions();
        const currentSession = sessions.find(s => s.id === sessionId);
        if (currentSession) {
          setSession(currentSession);
          setTimeLeft(currentSession.duration * 60); // Convertir minutes en secondes
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Erreur chargement QCM:', err);
        setError(err.response?.data?.detail || 'Impossible de charger le QCM');
        setLoading(false);
      }
    };

    initQCM();
  }, [sessionId]);

  // Chronomètre
  useEffect(() => {
    if (isSubmitted || loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, loading, questions.length]);

  // Détection changement d'onglet (anti-triche)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitchCount(prev => prev + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted]);

  // Gestion plein écran
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (isSubmitted || !attempt) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    // Soumettre la réponse au backend
    try {
      await qcmApi.submitAnswer(
        attempt.id,
        questions[currentQuestion].id,
        answerIndex
      );
    } catch (err) {
      console.error('Erreur soumission réponse:', err);
    }
  };

  const handleSubmit = async () => {
    if (!attempt) return;

    try {
      // Terminer l'attempt
      const result = await qcmApi.completeAttempt(attempt.id);
      setScore(result.score || 0);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Erreur soumission QCM:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la soumission');
    }
  };

  const answeredCount = answers.filter(a => a !== null).length;
  const timeUsed = Math.floor((Date.now() - startTime) / 1000);

  // Écran de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Préparation du QCM...</p>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/candidat/qcm')}
            className="px-6 py-3 bg-ioai-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retour aux QCM
          </button>
        </div>
      </div>
    );
  }

  // Écran de résultat
  if (isSubmitted && score !== null && session) {
    const percentage = Math.round(score);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${percentage >= 60 ? 'bg-green-100' : 'bg-red-100'}`}>
            {percentage >= 60 ? (
              <CheckCircle size={48} className="text-green-600" />
            ) : (
              <XCircle size={48} className="text-red-600" />
            )}
          </div>
          
          <h1 className="text-3xl font-display font-black text-gray-900 mb-2">
            {percentage >= 60 ? 'Félicitations !' : 'Test terminé'}
          </h1>
          <p className="text-gray-500 mb-8">Voici vos résultats</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-3xl font-black text-ioai-green">{percentage}%</p>
              <p className="text-sm text-gray-500">Score obtenu</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-3xl font-black text-benin-yellow">{formatTime(timeUsed)}</p>
              <p className="text-sm text-gray-500">Temps utilisé</p>
            </div>
          </div>

          {percentage >= session.passingScore && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 text-center font-medium">
                ✅ Vous avez réussi ! (Seuil requis: {session.passingScore}%)
              </p>
            </div>
          )}
          {percentage < session.passingScore && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700 text-center font-medium">
                ❌ Score insuffisant (Seuil requis: {session.passingScore}%)
              </p>
            </div>
          )}

          {tabSwitchCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-yellow-700 flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                {tabSwitchCount} changement(s) d'onglet détecté(s) pendant le test
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push('/candidat/qcm')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Retour aux QCM
            </button>
            <button 
              onClick={() => router.push('/candidat/resultats')}
              className="px-6 py-3 bg-ioai-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Voir mes résultats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Attention !</h2>
            <p className="text-gray-600 mb-4">
              Vous avez quitté l'onglet du test. Cette action a été enregistrée.
              {tabSwitchCount >= 3 && " Après 3 avertissements, votre test sera automatiquement soumis."}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Nombre d'avertissements : {tabSwitchCount}/3
            </p>
            <button 
              onClick={() => setShowWarning(false)}
              className="px-6 py-3 bg-ioai-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Continuer le test
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{session?.title || 'QCM'}</h1>
            <p className="text-gray-500 text-sm">Question {currentQuestion + 1} sur {questions.length}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mode plein écran"
            >
              <Maximize size={20} />
            </button>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
              timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-ioai-blue'
            }`}>
              <Clock size={20} />
              <span className="tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-ioai-green h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Navigator */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {questions.map((q, idx) => (
            <button
              key={`question-nav-${q.id || idx}`}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                idx === currentQuestion
                  ? 'bg-ioai-blue text-white'
                  : answers[idx] !== null
                  ? 'bg-ioai-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        {questions[currentQuestion]?.difficulty && (
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              questions[currentQuestion].difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              questions[currentQuestion].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {questions[currentQuestion].difficulty === 'easy' ? 'Facile' :
               questions[currentQuestion].difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {questions[currentQuestion]?.question}
        </h2>

        <div className="space-y-3">
          {questions[currentQuestion]?.options.map((option, index) => (
            <button
              key={`option-${questions[currentQuestion]?.id}-${index}`}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                answers[currentQuestion] === index
                  ? 'border-ioai-green bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-3 font-bold ${
                answers[currentQuestion] === index
                  ? 'bg-ioai-green text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft size={20} className="mr-2" /> Précédent
          </button>

          <div className="text-sm text-gray-500">
            {answeredCount}/{questions.length} répondu(s)
          </div>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-6 py-3 bg-ioai-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center"
            >
              Suivant <ChevronRight size={20} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length}
              className="px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Soumettre ({answeredCount}/{questions.length})
            </button>
          )}
        </div>
      </div>

      {/* Anti-triche indicator */}
      {tabSwitchCount > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Eye size={20} className="text-yellow-600" />
          <p className="text-sm text-yellow-700">
            {tabSwitchCount} changement(s) d'onglet détecté(s). Restez sur cette page.
          </p>
        </div>
      )}
    </div>
  );
}

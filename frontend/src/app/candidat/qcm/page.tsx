'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Lock, Play, BookOpen, Target, AlertCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { qcmApi, type SessionForCandidate } from '@/lib/api/qcm';
import { candidateApi, type CandidateProfile } from '@/lib/api/candidate';

type SessionStatus = 'available' | 'locked' | 'completed';

export default function QcmList() {
  const [filter, setFilter] = useState<'all' | SessionStatus>('all');
  const [sessions, setSessions] = useState<SessionForCandidate[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // Charger le profil et les sessions QCM
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Vérifier d'abord le profil
        const profileData = await candidateApi.getMyProfile();
        setProfile(profileData);

        // Vérifier si le profil est validé (statut >= qcm_pending)
        const allowedStatuses = ['qcm_pending', 'qcm_completed', 'regional_selected', 'bootcamp_selected', 'national_finalist'];
        if (!allowedStatuses.includes(profileData.status)) {
          setProfileIncomplete(true);
          setLoading(false);
          return;
        }

        // Charger les sessions si le profil est validé
        const sessionsData = await qcmApi.getCandidateSessions();
        setSessions(sessionsData);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur chargement données:', err);
        setError('Impossible de charger les sessions QCM');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  if (profileIncomplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profil incomplet</h2>
          <p className="text-gray-600 mb-6">
            Vous devez compléter et faire valider votre profil avant de pouvoir passer les QCM.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Statut actuel : <span className="font-bold text-orange-600">{profile?.status}</span>
          </p>
          <Link
            href="/candidat/profil"
            className="inline-flex items-center px-6 py-3 bg-ioai-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Compléter mon profil
          </Link>
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

  const filteredSessions = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const availableCount = sessions.filter(s => s.status === 'available').length;
  const lockedCount = sessions.filter(s => s.status === 'locked').length;

  const completedSessions = sessions.filter(s => s.status === 'completed' && s.score !== null);
  const averageScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions.length)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900">Examens & QCM</h1>
          <p className="text-gray-500 text-sm">Testez vos connaissances et validez vos compétences</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-ioai-green" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{completedCount}/{sessions.length}</p>
              <p className="text-xs text-gray-500">Complétés</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Target size={20} className="text-ioai-blue" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{averageScore}%</p>
              <p className="text-xs text-gray-500">Score moyen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Play size={20} className="text-benin-yellow" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{availableCount}</p>
              <p className="text-xs text-gray-500">Disponible(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for available QCM */}
      {availableCount > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-ioai-blue flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Nouveau test disponible</p>
            <p className="text-sm text-gray-600">Vous avez {availableCount} QCM en attente. Complétez-le pour avancer dans la sélection.</p>
          </div>
          <Link href="/candidat/qcm/run" className="px-4 py-2 bg-ioai-blue text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-colors shrink-0">
            Commencer
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Tous', count: sessions.length },
          { key: 'available', label: 'Disponibles', count: availableCount },
          { key: 'completed', label: 'Complétés', count: completedCount },
          { key: 'locked', label: 'Verrouillés', count: lockedCount },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key 
                ? 'bg-ioai-blue text-white' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* QCM List */}
      <div className="space-y-3">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white rounded-xl border p-4 transition-all ${
              session.status === 'available' ? 'border-ioai-blue shadow-sm' :
              session.status === 'locked' ? 'border-gray-100 opacity-60' :
              'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                session.status === 'completed' ? 'bg-green-50 text-ioai-green' :
                session.status === 'available' ? 'bg-blue-50 text-ioai-blue' :
                'bg-gray-100 text-gray-400'
              }`}>
                {session.status === 'completed' ? <CheckCircle size={24} /> :
                 session.status === 'available' ? <Play size={24} /> :
                 <Lock size={20} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{session.title}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{session.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {session.duration} min</span>
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {session.totalQuestions} questions</span>
                  <span className="flex items-center gap-1"><Target size={12} /> {session.passingScore}% requis</span>
                </div>
              </div>

              {/* Action */}
              <div className="text-right shrink-0">
                {session.status === 'completed' && session.score !== null && session.score !== undefined && (
                  <div>
                    <p className={`text-2xl font-black ${session.score >= 80 ? 'text-ioai-green' : session.score >= 60 ? 'text-benin-yellow' : 'text-red-500'}`}>
                      {Math.round(session.score)}%
                    </p>
                    {session.completedAt && (
                      <p className="text-[10px] text-gray-400">
                        {new Date(session.completedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                )}
                {session.status === 'available' && (
                  <Link href={`/candidat/qcm/run?session=${session.id}`} className="px-4 py-2 bg-ioai-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm inline-flex items-center gap-1">
                    <Play size={14} /> Commencer
                  </Link>
                )}
                {session.status === 'locked' && (
                  <span className="text-xs text-gray-400">Verrouillé</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500">Aucun QCM dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}

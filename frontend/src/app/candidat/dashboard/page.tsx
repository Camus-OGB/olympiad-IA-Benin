'use client';

import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Clock, TrendingUp, Bell, ArrowRight, CheckCircle, AlertCircle, FileText, Calendar, Target, Users, MessageSquare, Download, ExternalLink, ChevronRight, Play, Lock, Zap, Star, Trophy, BarChart3, GraduationCap, Sparkles, Loader2, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { candidateApi, type CandidateDashboard } from '@/lib/api/candidate';
import { qcmApi, type SessionForCandidate } from '@/lib/api/qcm';
import { contentApi, type NewsItem, type CalendarEvent } from '@/lib/api/content';
import { resourcesApi, type Resource } from '@/lib/api/resources';
import { useAuthStore } from '@/store/authStore';

// Note: Les ressources pédagogiques pourraient être ajoutées au backend plus tard
// Pour l'instant, on garde quelques ressources de base
const resources = [
  { id: 1, title: 'Guide de préparation QCM', description: 'Conseils et stratégies pour réussir', type: 'PDF', size: '2.4 MB', url: '#', category: 'Guide' },
  { id: 2, title: 'Cours Python - Les bases', description: 'Introduction à la programmation Python', type: 'Vidéo', duration: '45 min', url: '#', category: 'Cours' },
  { id: 3, title: 'Exercices de logique', description: '50 exercices avec corrections', type: 'PDF', size: '1.8 MB', url: '#', category: 'Exercices' },
  { id: 4, title: 'Introduction à l\'IA', description: 'Concepts fondamentaux de l\'IA', type: 'Vidéo', duration: '1h 20min', url: '#', category: 'Cours' },
];

// Helper pour calculer les jours restants à partir d'une date
const getDaysLeft = (dateStr: string): number => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Helper pour formater une date
const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Helper pour le temps relatif
const getRelativeTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffD < 7) return `Il y a ${diffD} jour${diffD > 1 ? 's' : ''}`;
    return formatDate(dateStr);
  } catch {
    return '';
  }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'qcm' | 'resources'>('qcm');
  const { user } = useAuthStore();

  // États pour les données du backend
  const [dashboard, setDashboard] = useState<CandidateDashboard | null>(null);
  const [sessions, setSessions] = useState<SessionForCandidate[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [timelinePhases, setTimelinePhases] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les données du dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardData, sessionsData] = await Promise.all([
          candidateApi.getMyDashboard(),
          qcmApi.getCandidateSessions()
        ]);
        setDashboard(dashboardData);
        setSessions(sessionsData);

        // Charger les actualités, événements, phases et ressources (non bloquant)
        try {
          const [news, edition, resourcesData] = await Promise.all([
            contentApi.getNews({ limit: 5, publishedOnly: true }),
            contentApi.getActiveEdition(),
            resourcesApi.getAll()
          ]);
          if (news) setNewsItems(news);
          if (resourcesData) setResources(resourcesData);
          if (edition) {
            // Timeline phases triées par ordre
            if (edition.timelinePhases) {
              const sortedPhases = [...edition.timelinePhases].sort((a, b) => a.phaseOrder - b.phaseOrder);
              setTimelinePhases(sortedPhases);
            }
            // Événements futurs
            if (edition.calendarEvents) {
              const futureEvents = edition.calendarEvents
                .filter(e => new Date(e.eventDate) >= new Date())
                .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                .slice(0, 5);
              setCalendarEvents(futureEvents);
            }
          }
        } catch (contentErr) {
          console.warn('Impossible de charger les actualités/événements:', contentErr);
          // Non bloquant - le dashboard s'affiche quand même
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Erreur chargement dashboard:', err);
        setError('Impossible de charger le dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Calculer les statistiques
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const availableSessions = sessions.filter(s => s.status === 'available');
  const averageScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions.length)
    : 0;
  const bestScore = completedSessions.length > 0
    ? Math.max(...completedSessions.map(s => s.score || 0))
    : 0;

  // Déterminer le statut d'une phase basé sur ses dates
  const getPhaseStatus = (phase: any, index: number, allPhases: any[]): 'completed' | 'current' | 'locked' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset l'heure pour comparer uniquement les dates

    const startDate = phase.startDate ? new Date(phase.startDate) : null;
    const endDate = phase.endDate ? new Date(phase.endDate) : null;

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);

    // Si la phase a isCurrent = true, elle est forcément actuelle
    if (phase.isCurrent) {
      return 'current';
    }

    // Si pas de dates, on se base sur l'ordre
    if (!startDate) {
      // Les phases sans date sont verrouillées par défaut
      return 'locked';
    }

    // Si la date de début est dans le futur → verrouillée
    if (startDate > today) {
      return 'locked';
    }

    // Si la date de fin est passée → complétée
    if (endDate && endDate < today) {
      return 'completed';
    }

    // Si on est entre startDate et endDate (ou pas de endDate) → actuelle
    if (startDate <= today && (!endDate || today <= endDate)) {
      return 'current';
    }

    // Par défaut, verrouillée
    return 'locked';
  };

  // Mapper les timelinePhases du backend avec le statut basé sur les dates
  const phasesWithStatus = timelinePhases.length > 0
    ? timelinePhases.map((phase, index) => {
        const status = getPhaseStatus(phase, index, timelinePhases);

        return {
          id: phase.id,
          phaseOrder: phase.phaseOrder,
          name: phase.title,
          status,
          date: phase.startDate ? formatDate(phase.startDate) : '',
          description: phase.description || '',
          startDate: phase.startDate,
          endDate: phase.endDate,
        };
      })
    : [
        // Fallback si aucune phase du backend
        { id: '1', phaseOrder: 1, name: 'Inscription', status: 'completed' as const, date: '', description: '', startDate: null, endDate: null },
        { id: '2', phaseOrder: 2, name: 'Profil', status: 'current' as const, date: '', description: '', startDate: null, endDate: null },
        { id: '3', phaseOrder: 3, name: 'QCM', status: 'locked' as const, date: '', description: '', startDate: null, endDate: null },
        { id: '4', phaseOrder: 4, name: 'Sélection', status: 'locked' as const, date: '', description: '', startDate: null, endDate: null },
      ];

  // Calculer la phase actuelle et la progression
  const currentPhaseIndex = phasesWithStatus.findIndex(p => p.status === 'current');
  const completedPhasesCount = phasesWithStatus.filter(p => p.status === 'completed').length;
  const currentPhase = currentPhaseIndex !== -1 ? currentPhaseIndex + 1 : completedPhasesCount;
  const totalPhases = phasesWithStatus.length;
  const progressPercent = totalPhases > 0 ? (completedPhasesCount / totalPhases) * 100 + (currentPhaseIndex !== -1 ? 50 / totalPhases : 0) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header simple */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm">Bienvenue,</p>
          <h1 className="text-2xl md:text-3xl font-display font-black text-gray-900">{dashboard.user.firstName} {dashboard.user.lastName}</h1>
        </div>
      </div>

      {/* Statut actuel - Alerte importante */}
      {dashboard.profileCompletion < 100 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Action requise : Complétez votre profil</h3>
            <p className="text-sm text-gray-600">Votre profil est complété à {dashboard.profileCompletion}%. Ajoutez vos bulletins scolaires pour valider votre candidature.</p>
          </div>
          <Link href="/candidat/profil" className="px-4 py-2 bg-benin-yellow text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors shrink-0">
            Compléter
          </Link>
        </div>
      )}

      {/* Timeline des phases - Version compacte */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900">Parcours de Sélection</h2>
            <span className="px-2 py-1 bg-ioai-blue/10 text-ioai-blue text-xs font-bold rounded-lg flex items-center gap-1">
              <Zap size={12} /> Phase {currentPhase}
            </span>
          </div>
          <span className="text-sm font-bold text-ioai-green">{Math.round(progressPercent)}%</span>
        </div>

        {/* Progress bar avec étapes intégrées */}
        <div className="relative">
          <div className="overflow-hidden h-2 rounded-full bg-gray-100">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-ioai-green to-emerald-400 rounded-full transition-all duration-500"
            ></div>
          </div>

          {/* Étapes sur la barre */}
          <div className="flex justify-between mt-2">
            {phasesWithStatus.map((phase) => (
              <div key={phase.id} className="flex flex-col items-center" style={{ width: `${100 / phasesWithStatus.length}%` }}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold -mt-5 border-2 border-white ${phase.status === 'completed' ? 'bg-ioai-green text-white' :
                    phase.status === 'current' ? 'bg-ioai-blue text-white ring-2 ring-ioai-blue/30' :
                      'bg-gray-200 text-gray-400'
                  }`}>
                  {phase.status === 'completed' ? <CheckCircle size={12} /> :
                    phase.status === 'locked' ? <Lock size={10} /> : phase.phaseOrder}
                </div>
                <span className={`text-[10px] mt-1 text-center leading-tight ${phase.status === 'current' ? 'text-ioai-blue font-bold' :
                    phase.status === 'completed' ? 'text-ioai-green' : 'text-gray-400'
                  }`}>
                  {phase.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layout principal - Stats + Actualités/Événements sur la même ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stats Grid - Colonne 2/3 */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen size={20} className="text-ioai-blue" />
              </div>
              <span className="text-xs font-bold text-ioai-blue bg-blue-50 px-2 py-1 rounded-lg">
                {completedSessions.length}/{sessions.length}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900">{completedSessions.length}</p>
            <p className="text-sm text-gray-500">QCM complétés</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-ioai-blue h-1.5 rounded-full" style={{ width: `${sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Award size={20} className="text-ioai-green" />
              </div>
              <span className="text-xs font-bold text-ioai-green bg-green-50 px-2 py-1 rounded-lg">Moyenne</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{averageScore}<span className="text-lg text-gray-400">%</span></p>
            <p className="text-sm text-gray-500">Score moyen</p>
            <p className="text-xs text-ioai-green mt-2 flex items-center">
              <TrendingUp size={12} className="mr-1" /> Meilleur : {bestScore}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Target size={20} className="text-orange-500" />
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">{dashboard.profileCompletion}%</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{dashboard.profileCompletion}%</p>
            <p className="text-sm text-gray-500">Profil complété</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${dashboard.profileCompletion}%` }}></div>
            </div>
          </div>
        </div>

        {/* Actualités - Colonne 1/3 (remontée) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Newspaper size={18} /> Actualités
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {newsItems.length > 0 ? (
              newsItems.slice(0, 3).map(news => (
                <div key={news.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-ioai-blue">
                      <Bell size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{news.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{news.excerpt || news.content?.substring(0, 80)}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {news.publishedAt ? getRelativeTime(news.publishedAt) : getRelativeTime(news.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : dashboard.notifications.length > 0 ? (
              dashboard.notifications.slice(0, 3).map((notifText, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-yellow-100 text-yellow-600">
                      <AlertCircle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 line-clamp-2">{notifText}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">
                Aucune actualité pour le moment
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section principale - QCM/Ressources + À venir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne principale - QCM et ressources (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('qcm')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'qcm' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <FileText size={16} /> Mes QCM
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'resources' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <GraduationCap size={16} /> Ressources
            </button>
          </div>

          {/* Tab Content - QCM */}
          {activeTab === 'qcm' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Tests disponibles</h3>
                <Link href="/candidat/qcm" className="text-sm text-ioai-blue font-medium hover:underline flex items-center gap-1">
                  Voir tous <ArrowRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {sessions.slice(0, 5).map(qcm => (
                  <div
                    key={qcm.id}
                    className={`bg-white rounded-xl border p-4 transition-all ${qcm.status === 'available' ? 'border-ioai-blue shadow-sm hover:shadow-md cursor-pointer' :
                        qcm.status === 'completed' ? 'border-gray-100' :
                          'border-gray-100 opacity-60'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${qcm.status === 'completed' ? 'bg-green-50 text-ioai-green' :
                          qcm.status === 'available' ? 'bg-blue-50 text-ioai-blue' :
                            'bg-gray-100 text-gray-400'
                        }`}>
                        {qcm.status === 'completed' ? <CheckCircle size={24} /> :
                          qcm.status === 'available' ? <Play size={24} /> :
                            <Lock size={20} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{qcm.title}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={14} /> {qcm.duration} min</span>
                          <span>{qcm.totalQuestions} questions</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {qcm.status === 'completed' && qcm.score !== null && qcm.score !== undefined && (
                          <div>
                            <p className={`text-2xl font-black ${qcm.score >= 80 ? 'text-ioai-green' : qcm.score >= 60 ? 'text-benin-yellow' : 'text-red-500'}`}>
                              {Math.round(qcm.score)}%
                            </p>
                            <p className="text-xs text-gray-400">Score obtenu</p>
                          </div>
                        )}
                        {qcm.status === 'available' && (
                          <Link href={`/candidat/qcm/run?session=${qcm.id}`} className="px-4 py-2 bg-ioai-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Commencer
                          </Link>
                        )}
                        {qcm.status === 'locked' && (
                          <span className="text-xs text-gray-400">Verrouillé</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content - Resources */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Ressources de préparation</h3>
                <span className="text-sm text-gray-500">{resources.length} ressources</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.length > 0 ? resources.map(resource => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-ioai-blue/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        resource.type === 'pdf' ? 'bg-red-50 text-red-500' :
                        resource.type === 'video' ? 'bg-purple-50 text-purple-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {resource.type === 'pdf' ? <FileText size={24} /> :
                         resource.type === 'video' ? <Play size={24} /> :
                         <ExternalLink size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-gray-400 uppercase">{resource.category}</span>
                        <h4 className="font-bold text-gray-900 group-hover:text-ioai-blue transition-colors">{resource.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{resource.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {resource.type.toUpperCase()} • {resource.fileSize || resource.duration || 'En ligne'}
                        </p>
                      </div>
                    </div>
                  </a>
                )) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune ressource disponible pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar droite (1/3) - Événements à venir */}
        <div className="space-y-6">

          {/* Événements à venir */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={18} /> À venir
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {calendarEvents.length > 0 ? (
                calendarEvents.map(event => {
                  const daysLeft = getDaysLeft(event.eventDate);
                  const eventType = event.eventType?.toLowerCase() || 'event';
                  return (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${eventType === 'deadline' || eventType === 'date_limite' ? 'bg-red-50 text-red-500' :
                          eventType === 'event' || eventType === 'webinaire' ? 'bg-purple-50 text-purple-600' :
                            'bg-blue-50 text-ioai-blue'
                        }`}>
                        {daysLeft}j
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{event.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.eventDate)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 text-sm py-4">
                  Aucun événement à venir
                </div>
              )}
            </div>
          </div>

          {/* Notifications système */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Bell size={18} /> Notifications
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {dashboard.notifications.length > 0 ? (
                dashboard.notifications.map((notification, idx) => {
                  // Déterminer le type de notification basé sur le contenu
                  const isWarning = notification.toLowerCase().includes('attention') ||
                                   notification.toLowerCase().includes('important') ||
                                   notification.toLowerCase().includes('requis');
                  const isSuccess = notification.toLowerCase().includes('validé') ||
                                   notification.toLowerCase().includes('approuvé') ||
                                   notification.toLowerCase().includes('succès');
                  const isInfo = !isWarning && !isSuccess;

                  return (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSuccess ? 'bg-green-100 text-green-600' :
                          isWarning ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-ioai-blue'
                        }`}>
                          {isSuccess ? <CheckCircle size={16} /> :
                           isWarning ? <AlertCircle size={16} /> :
                           <Bell size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{notification}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              )}
            </div>
            {dashboard.notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button className="w-full text-sm text-ioai-blue font-medium hover:underline flex items-center justify-center gap-1">
                  Tout marquer comme lu <CheckCircle size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

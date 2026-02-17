'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, FileText, CheckCircle, Clock, TrendingUp, TrendingDown,
  AlertCircle, ArrowRight, MapPin, Calendar, Award, Target,
  UserCheck, Download, BarChart3, Activity,
  Shield, ChevronRight
} from 'lucide-react';
import { adminApi, DashboardStats, CandidateListItem, AuditLogEntry } from '@/lib/api/admin';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<CandidateListItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [trendData, setTrendData] = useState<Array<{ date: string; inscriptions: number }>>([]);

  // Charger les statistiques et les données récentes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les stats, les 10 derniers candidats et les logs d'audit en parallèle
        const [overview, candidates, logs] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getCandidates({ limit: 10, sortBy: 'created_at', order: 'desc' }),
          adminApi.getAuditLogs({ limit: 10 }),
        ]);

        setStats(overview);
        setRecentCandidates(candidates);
        setAuditLogs(logs);

        // Générer les données de tendance (simulation basée sur les inscriptions récentes)
        generateTrendData(candidates);
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Générer les données de tendance pour le graphique
  const generateTrendData = (candidates: CandidateListItem[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        inscriptions: 0
      };
    });

    // Compter les inscriptions par jour (basé sur les candidats récents)
    candidates.forEach(candidate => {
      const candidateDate = new Date(candidate.createdAt);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 30 && diffDays >= 0) {
        const index = 29 - diffDays;
        if (last30Days[index]) {
          last30Days[index].inscriptions++;
        }
      }
    });

    setTrendData(last30Days);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500">Vue d'ensemble de la plateforme AOAI 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {period === 'today' ? "Aujourd'hui" : period === 'week' ? 'Cette semaine' : 'Ce mois'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-ioai-green text-white font-medium rounded-lg hover:bg-green-600 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-ioai-blue" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.totalCandidates ?? 0}</p>
          <p className="text-sm text-gray-500">Candidats inscrits</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <UserCheck size={20} className="text-ioai-green" />
            </div>
            <span className="text-xs font-bold text-gray-400">
              {stats?.totalCandidates ? Math.round((stats.verifiedCandidates / stats.totalCandidates) * 100) : 0}%
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.verifiedCandidates ?? 0}</p>
          <p className="text-sm text-gray-500">Emails confirmés</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.recentRegistrations ?? 0}</p>
          <p className="text-sm text-gray-500">Inscrits (7j)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-benin-yellow" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats?.qcmCompleted ?? 0}</p>
          <p className="text-sm text-gray-500">QCM complétés</p>
        </div>
      </div>

      {/* Actions urgentes */}
      {(stats?.candidatesByStatus?.registered ?? 0) > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={20} className="text-red-500" />
            <h3 className="font-bold text-red-700">Actions requises</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/candidatures?status=pending"
              className="flex items-center justify-between p-3 rounded-lg transition-colors bg-red-100 hover:bg-red-200"
            >
              <div>
                <p className="font-medium text-sm text-red-700">Profils en attente de validation</p>
                <p className="text-2xl font-black text-red-600">{stats?.candidatesByStatus?.registered ?? 0}</p>
              </div>
              <ArrowRight size={18} className="text-red-400" />
            </Link>
          </div>
        </div>
      )}

      {/* Graphique de tendance + Funnel de conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendance des inscriptions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tendance des inscriptions</h3>
              <p className="text-sm text-gray-500">30 derniers jours</p>
            </div>
            <TrendingUp size={20} className="text-ioai-green" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="inscriptions"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorInscriptions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel de conversion */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Funnel de conversion</h3>
              <p className="text-sm text-gray-500">Parcours candidat</p>
            </div>
            <Target size={20} className="text-purple-500" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Inscrits', count: stats?.totalCandidates ?? 0, color: 'bg-blue-500', width: '100%' },
              { label: 'Emails confirmés', count: stats?.verifiedCandidates ?? 0, color: 'bg-green-500', width: stats?.totalCandidates ? `${(stats.verifiedCandidates / stats.totalCandidates * 100)}%` : '0%' },
              { label: 'QCM complétés', count: stats?.qcmCompleted ?? 0, color: 'bg-purple-500', width: stats?.totalCandidates ? `${(stats.qcmCompleted / stats.totalCandidates * 100)}%` : '0%' },
              { label: 'Sélectionnés', count: stats?.candidatesByStatus?.regional_selected ?? 0, color: 'bg-yellow-500', width: stats?.totalCandidates ? `${((stats?.candidatesByStatus?.regional_selected ?? 0) / stats.totalCandidates * 100)}%` : '0%' },
            ].map((step, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{step.label}</span>
                  <span className="text-sm font-bold text-gray-900">{step.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: step.width }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition par statut */}
{/*       {stats?.candidatesByStatus && Object.entries(stats.candidatesByStatus).length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Répartition par statut</h3>
              <p className="text-sm text-gray-500">État du pipeline de sélection</p>
            </div>
            <BarChart3 size={20} className="text-ioai-blue" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(stats.candidatesByStatus)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const labels: Record<string, { label: string; color: string; bg: string }> = {
                  registered:        { label: 'Inscrits',          color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
                  qcm_pending:       { label: 'QCM en attente',    color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
                  qcm_completed:     { label: 'QCM complétés',     color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
                  regional_selected: { label: 'Sél. régionale',    color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
                  bootcamp_selected: { label: 'Bootcamp',          color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
                  national_finalist: { label: 'Finalistes',        color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
                  rejected:          { label: 'Non retenus',       color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200' },
                };
                const cfg = labels[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
                return (
                  <div key={status} className={`p-3 rounded-xl border ${cfg.bg} text-center`}>
                    <p className={`text-2xl font-black ${cfg.color}`}>{count}</p>
                    <p className={`text-xs font-medium mt-0.5 ${cfg.color}`}>{cfg.label}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
 */}
      {/* Timeline d'activité + Journal d'audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline d'activité récente */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Activité récente</h3>
              <p className="text-sm text-gray-500">Dernières inscriptions</p>
            </div>
            <Activity size={20} className="text-ioai-blue" />
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentCandidates.length > 0 ? (
              recentCandidates.map((candidate, index) => (
                <div key={candidate.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    candidate.isVerified ? 'bg-green-500' :
                    candidate.status === 'qcm_completed' ? 'bg-purple-500' :
                    'bg-gray-300'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{candidate.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{candidate.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/candidatures/${candidate.id}`}
                    className="text-ioai-blue hover:text-ioai-green transition-colors"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </div>

        {/* Journal d'audit */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Journal d&apos;audit</h3>
              <p className="text-sm text-gray-500">Suivi des actions sur la plateforme</p>
            </div>
            <Shield size={20} className="text-benin-yellow" />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => {
                const actionLabels: Record<string, { label: string; icon: string; color: string }> = {
                  update_candidate_status: { label: 'Statut candidat modifié', icon: '🔄', color: 'text-blue-600' },
                  bulk_update_status:      { label: 'Mise à jour en masse',    icon: '📋', color: 'text-indigo-600' },
                  delete_candidate:        { label: 'Candidat supprimé',       icon: '🗑️', color: 'text-red-600' },
                  create_user:             { label: 'Utilisateur créé',         icon: '👤', color: 'text-green-600' },
                  update_user:             { label: 'Utilisateur modifié',      icon: '✏️', color: 'text-yellow-600' },
                  toggle_user_status:      { label: 'Statut utilisateur',       icon: '🔒', color: 'text-orange-600' },
                  delete_user:             { label: 'Utilisateur supprimé',     icon: '🗑️', color: 'text-red-600' },
                  create_news:             { label: 'Actualité créée',           icon: '📰', color: 'text-teal-600' },
                  update_news:             { label: 'Actualité modifiée',        icon: '📝', color: 'text-teal-500' },
                  delete_news:             { label: 'Actualité supprimée',       icon: '🗑️', color: 'text-red-500' },
                  create_edition:          { label: 'Édition créée',             icon: '🗓️', color: 'text-purple-600' },
                  update_edition:          { label: 'Édition modifiée',          icon: '🗓️', color: 'text-purple-500' },
                  create_past_edition:     { label: 'Bilan créé',                icon: '📚', color: 'text-gray-600' },
                  update_past_edition:     { label: 'Bilan modifié',             icon: '📚', color: 'text-gray-500' },
                };
                const evt = actionLabels[log.action] || { label: log.action, icon: '•', color: 'text-gray-500' };
                return (
                  <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-base flex-shrink-0 mt-0.5">{evt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${evt.color}`}>{evt.label}</p>
                      <p className="text-sm text-gray-800 truncate">{log.resourceLabel || log.resourceId || '—'}</p>
                      <p className="text-xs text-gray-400 truncate">{log.adminEmail}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Aucune action enregistrée</p>
            )}
          </div>
        </div>
      </div>

      {/* Lien vers statistiques détaillées */}
      <div className="bg-gradient-to-r from-ioai-blue to-ioai-green rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Statistiques Détaillées</h3>
            <p className="text-white/90">Consultez les analyses complètes par région, genre, et performance</p>
          </div>
          <Link
            href="/admin/statistiques"
            className="flex items-center gap-2 px-6 py-3 bg-white text-ioai-blue font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Voir les statistiques
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Raccourcis rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/candidatures" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-ioai-blue transition-all group">
          <Users size={24} className="text-ioai-blue mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-gray-900">Gérer les candidatures</p>
          <p className="text-xs text-gray-500">Valider, rejeter, exporter</p>
        </Link>
        <Link href="/admin/qcm/questions" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-ioai-green transition-all group">
          <FileText size={24} className="text-ioai-green mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-gray-900">Banque de questions</p>
          <p className="text-xs text-gray-500">Gérer les questions</p>
        </Link>
        <Link href="/admin/statistiques" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-500 transition-all group">
          <BarChart3 size={24} className="text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-gray-900">Statistiques</p>
          <p className="text-xs text-gray-500">Rapports et analyses</p>
        </Link>
        <Link href="/admin/contenu/blog" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-benin-yellow transition-all group">
          <Calendar size={24} className="text-benin-yellow mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-gray-900">Contenu & CMS</p>
          <p className="text-xs text-gray-500">Blog, actualités</p>
        </Link>
      </div>
    </div>
  );
}

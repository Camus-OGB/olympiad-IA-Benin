'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, MapPin, Download, School, Award, Target, Calendar, FileText, AlertTriangle, CheckCircle, Clock, XCircle, GraduationCap } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { adminApi, DashboardStats } from '@/lib/api/admin';

interface CandidateListItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  schoolName?: string;
  schoolRegion?: string;
  grade?: string;
  gender?: 'male' | 'female';
  status: string;
  qcmScore?: number | null;
  createdAt: string;
  isVerified: boolean;
}

const StatsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données de l'API
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);

  // Charger toutes les statistiques depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, candidatesData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getCandidates({ limit: 10000 }) // Augmenté à 10000 pour avoir toutes les données
        ]);

        setStats(statsData);
        setCandidates(candidatesData);
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
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

  // Calculer les statistiques additionnelles
  const filteredCandidates = (() => {
    if (selectedPeriod === 'all') return candidates;
    const now = Date.now();
    const days = selectedPeriod === 'week' ? 7 : 30;
    const threshold = now - days * 24 * 60 * 60 * 1000;
    return candidates.filter((c) => {
      const t = Date.parse(c.createdAt);
      return Number.isFinite(t) ? t >= threshold : true;
    });
  })();

  // Utiliser les statistiques de genre du backend (plus fiable)
  const genderStats = stats?.candidatesByGender || {
    male: filteredCandidates.filter(c => c.gender === 'male').length,
    female: filteredCandidates.filter(c => c.gender === 'female').length,
    unspecified: filteredCandidates.filter(c => !c.gender).length,
  };

  const gradeStats = filteredCandidates.reduce((acc, c) => {
    const grade = c.grade || 'Non renseigné';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const schoolStats = filteredCandidates.reduce((acc, c) => {
    const school = c.schoolName || 'Non renseigné';
    acc[school] = (acc[school] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSchools = Object.entries(schoolStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const qcmScores = filteredCandidates
    .filter(c => c.qcmScore != null)
    .map(c => c.qcmScore!);

  const scoreDistribution = {
    '0-20': qcmScores.filter(s => s < 20).length,
    '20-40': qcmScores.filter(s => s >= 20 && s < 40).length,
    '40-60': qcmScores.filter(s => s >= 40 && s < 60).length,
    '60-80': qcmScores.filter(s => s >= 60 && s < 80).length,
    '80-100': qcmScores.filter(s => s >= 80).length,
  };

  const validationRate = stats?.totalCandidates
    ? ((stats.verifiedCandidates / stats.totalCandidates) * 100).toFixed(1)
    : '0';

  const completionRate = stats?.totalCandidates
    ? (((stats.totalCandidates - (stats.candidatesByStatus?.registered || 0)) / stats.totalCandidates) * 100).toFixed(1)
    : '0';

  const PERIOD_LABELS: Record<typeof selectedPeriod, string> = {
    week: '7 derniers jours',
    month: '30 derniers jours',
    all: 'Tout',
  };

  const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316', '#64748B'];

  const gradePieData = Object.entries(gradeStats)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  const scoreBarData = Object.entries(scoreDistribution).map(([range, value]) => ({ range, value }));

  const regionBarData = Object.entries(stats?.candidatesByRegion || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name: name || 'Non renseigné', value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900">Statistiques & Rapports</h1>
          <p className="text-gray-500">Analysez les performances et la progression de AOAI 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {PERIOD_LABELS[period]}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-ioai-green text-white font-medium rounded-lg hover:bg-green-600 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Vue d'ensemble rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Users size={28} />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Total</span>
          </div>
          <p className="text-4xl font-black mb-1">{stats?.totalCandidates ?? 0}</p>
          <p className="text-blue-100">Candidats inscrits</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle size={28} />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{validationRate}%</span>
          </div>
          <p className="text-4xl font-black mb-1">{stats?.verifiedCandidates ?? 0}</p>
          <p className="text-green-100">Profils validés</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Award size={28} />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {stats?.qcmAverageScore != null ? `${stats.qcmAverageScore.toFixed(0)}%` : '-'}
            </span>
          </div>
          <p className="text-4xl font-black mb-1">{stats?.qcmCompleted ?? 0}</p>
          <p className="text-purple-100">QCM complétés</p>
        </div>
      </div>

      {/* Indicateurs clés de performance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">En attente</p>
              <p className="text-2xl font-black text-gray-900">{stats?.candidatesByStatus?.registered ?? 0}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full"
              style={{
                width: `${stats?.totalCandidates ? ((stats.candidatesByStatus?.registered || 0) / stats.totalCandidates) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-ioai-blue" />
            </div>
            <div>
              <p className="text-xs text-gray-500">QCM en attente</p>
              <p className="text-2xl font-black text-gray-900">{stats?.candidatesByStatus?.qcm_pending ?? 0}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full"
              style={{
                width: `${stats?.totalCandidates ? ((stats.candidatesByStatus?.qcm_pending || 0) / stats.totalCandidates) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Récents (7j)</p>
              <p className="text-2xl font-black text-gray-900">{stats?.recentRegistrations ?? 0}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.recentRegistrations && stats?.totalCandidates
              ? `${((stats.recentRegistrations / stats.totalCandidates) * 100).toFixed(0)}% du total`
              : '-'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Rejetés</p>
              <p className="text-2xl font-black text-gray-900">{stats?.candidatesByStatus?.rejected ?? 0}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.candidatesByStatus?.rejected && stats?.totalCandidates
              ? `${((stats.candidatesByStatus.rejected / stats.totalCandidates) * 100).toFixed(1)}% du total`
              : '-'}
          </p>
        </div>
      </div>

      {/* Statistiques par genre - Graphique circulaire */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-gray-400" />
            Répartition par genre
          </h3>
          <span className="text-sm text-gray-500">Total: {stats?.totalCandidates ?? 0} candidats</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique circulaire */}
          <div className="flex items-center justify-center">
            {(genderStats.male ?? 0) + (genderStats.female ?? 0) > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Garçons', value: genderStats.male ?? 0, color: '#3B82F6' },
                        { name: 'Filles', value: genderStats.female ?? 0, color: '#EC4899' }
                      ].filter(item => item.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={true}
                    >
                      {[
                        { name: 'Garçons', value: genderStats.male ?? 0, color: '#3B82F6' },
                        { name: 'Filles', value: genderStats.female ?? 0, color: '#EC4899' }
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => {
                        const percentage = stats?.totalCandidates ? ((entry.payload.value / stats.totalCandidates) * 100).toFixed(1) : '0';
                        return `${value} (${percentage}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Users size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune donnée de genre disponible</p>
              </div>
            )}
          </div>

          {/* Statistiques détaillées */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🚹</span>
                  </div>
                  <span className="font-medium">Garçons</span>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-bold">
                  {stats?.totalCandidates ? (((genderStats.male ?? 0) / stats.totalCandidates) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <p className="text-4xl font-black mb-1">{genderStats.male ?? 0}</p>
              <p className="text-sm text-blue-100">candidats masculins</p>
            </div>

            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🚺</span>
                  </div>
                  <span className="font-medium">Filles</span>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-bold">
                  {stats?.totalCandidates ? (((genderStats.female ?? 0) / stats.totalCandidates) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <p className="text-4xl font-black mb-1">{genderStats.female ?? 0}</p>
              <p className="text-sm text-pink-100">candidates féminines</p>
            </div>

            {/* Indicateur de parité */}
            {(genderStats.male ?? 0) + (genderStats.female ?? 0) > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl border border-blue-100">
                <p className="text-sm font-bold text-gray-700 mb-3">Ratio Filles / Garçons</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-pink-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                        style={{
                          width: `${((genderStats.female ?? 0) / ((genderStats.male ?? 0) + (genderStats.female ?? 0))) * 100}%`
                        }}
                      >
                        {(genderStats.female ?? 0) > 0 && (
                          <span className="px-2">
                            {(((genderStats.female ?? 0) / ((genderStats.male ?? 0) + (genderStats.female ?? 0))) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div
                        className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                        style={{
                          width: `${((genderStats.male ?? 0) / ((genderStats.male ?? 0) + (genderStats.female ?? 0))) * 100}%`
                        }}
                      >
                        {(genderStats.male ?? 0) > 0 && (
                          <span className="px-2">
                            {(((genderStats.male ?? 0) / ((genderStats.male ?? 0) + (genderStats.female ?? 0))) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs font-medium text-gray-600">
                  <span>🚺 {genderStats.female ?? 0} filles</span>
                  <span>🚹 {genderStats.male ?? 0} garçons</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par région */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              Répartition par département
            </h3>
            <span className="text-sm font-bold text-ioai-blue">{Object.keys(stats?.candidatesByRegion || {}).length} départements</span>
          </div>
          {regionBarData.length > 0 ? (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionBarData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={110} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                    {regionBarData.map((_, idx) => (
                      <Cell key={`cell-region-${idx}`} fill={CHART_COLORS[(idx + 1) % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <MapPin size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune donnée régionale</p>
            </div>
          )}
        </div>

        {/* Top 5 écoles */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <School size={18} className="text-gray-400" />
              Top 5 établissements
            </h3>
            <span className="text-sm font-bold text-ioai-green">{Object.keys(schoolStats).length} écoles</span>
          </div>
          <div className="space-y-4">
            {topSchools.map(([school, count], index) => {
              const total = stats?.totalCandidates || 1;
              const percentage = ((count / total) * 100).toFixed(1);
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={`school-${index}-${school}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">{medals[index] || '🏅'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{school}</p>
                    <p className="text-xs text-gray-500">{percentage}% du total</p>
                  </div>
                  <span className="text-xl font-black text-ioai-blue">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des scores QCM */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 size={18} className="text-gray-400" />
              Distribution des scores QCM
            </h3>
            <span className="text-sm text-gray-500">{qcmScores.length} complétés</span>
          </div>
          {qcmScores.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreBarData} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <p className="text-sm text-gray-600 mb-1">Score moyen</p>
                <p className="text-4xl font-black text-purple-600">{stats?.qcmAverageScore?.toFixed(1) ?? 0}%</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Award size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun QCM complété pour le moment</p>
            </div>
          )}
        </div>

        {/* Répartition par classe */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap size={18} className="text-gray-400" />
              Répartition par classe
            </h3>
          </div>
          {gradePieData.length > 0 ? (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradePieData} dataKey="value" nameKey="name" outerRadius={120} paddingAngle={2}>
                    {gradePieData.map((_, idx) => (
                      <Cell key={`cell-grade-${idx}`} fill={CHART_COLORS[(idx + 2) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <GraduationCap size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune donnée de classe</p>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline de sélection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Target size={18} className="text-gray-400" />
            Pipeline de sélection
          </h3>
          <span className="text-sm text-gray-500">Progression des candidats</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {stats?.candidatesByStatus && Object.entries(stats.candidatesByStatus).map(([status, count], idx) => {
            const colors: Record<string, string> = {
              registered: 'border-yellow-300 bg-yellow-50',
              qcm_pending: 'border-orange-300 bg-orange-50',
              qcm_completed: 'border-green-300 bg-green-50',
              regional_selected: 'border-blue-300 bg-blue-50',
              bootcamp_selected: 'border-purple-300 bg-purple-50',
              national_finalist: 'border-indigo-300 bg-indigo-50',
              rejected: 'border-red-300 bg-red-50',
            };
            const textColors: Record<string, string> = {
              registered: 'text-yellow-600',
              qcm_pending: 'text-orange-600',
              qcm_completed: 'text-green-600',
              regional_selected: 'text-blue-600',
              bootcamp_selected: 'text-purple-600',
              national_finalist: 'text-indigo-600',
              rejected: 'text-red-600',
            };
            const labels: Record<string, string> = {
              registered: 'Inscrits',
              qcm_pending: 'QCM',
              qcm_completed: 'Complétés',
              regional_selected: 'Régional',
              bootcamp_selected: 'Bootcamp',
              national_finalist: 'Finalistes',
              rejected: 'Rejetés',
            };
            const icons: Record<string, React.ReactNode> = {
              registered: <Clock size={20} />,
              qcm_pending: <FileText size={20} />,
              qcm_completed: <CheckCircle size={20} />,
              regional_selected: <MapPin size={20} />,
              bootcamp_selected: <Award size={20} />,
              national_finalist: <TrendingUp size={20} />,
              rejected: <XCircle size={20} />,
            };
            const colorClass = colors[status] || 'border-gray-300 bg-gray-50';
            const textColor = textColors[status] || 'text-gray-600';
            const percentage = stats.totalCandidates > 0 ? ((count / stats.totalCandidates) * 100).toFixed(1) : '0';
            return (
              <div key={`status-${idx}-${status}`} className={`border-2 ${colorClass} rounded-xl p-4 text-center`}>
                <div className={`flex justify-center mb-2 ${textColor}`}>
                  {icons[status]}
                </div>
                <p className={`text-3xl font-black ${textColor} mb-1`}>{count}</p>
                <p className="text-xs font-medium text-gray-600 mb-1">{labels[status] || status}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message de fin */}
      <div className="bg-gradient-to-r from-ioai-blue to-ioai-green rounded-xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">Statistiques en temps réel</h3>
        <p className="text-white/90">Les données sont mises à jour automatiquement depuis la base de données</p>
      </div>
    </div>
  );
};

export default StatsPage;

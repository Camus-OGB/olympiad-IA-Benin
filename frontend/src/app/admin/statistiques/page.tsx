'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Download,
  School,
  Award,
  Target,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  GraduationCap,
  Filter,
  RefreshCw,
  ChevronRight,
  Activity,
  Percent,
  BarChart3
} from 'lucide-react';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

const StatsPageV2: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Données de l'API
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);

  // Charger toutes les statistiques depuis l'API
  const fetchStats = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [statsData, candidatesData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getCandidates({ limit: 10000 })
      ]);

      setStats(statsData);
      setCandidates(candidatesData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
  }, []);

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-ioai-green mx-auto mb-4"></div>
            <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-ioai-green" size={28} />
          </div>
          <p className="text-gray-600 font-medium">Analyse des données en cours...</p>
          <p className="text-gray-400 text-sm mt-1">Préparation des graphiques et métriques</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 font-medium transition-all hover:shadow-lg"
            >
              <RefreshCw size={18} className="inline mr-2" />
              Réessayer
            </button>
          </div>
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
    .slice(0, 10);

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

  const qcmCompletionRate = stats?.totalCandidates
    ? (((stats.qcmCompleted || 0) / stats.totalCandidates) * 100).toFixed(1)
    : '0';

  // Calculer la croissance hebdomadaire
  const lastWeekCandidates = candidates.filter(c => {
    const t = Date.parse(c.createdAt);
    return Number.isFinite(t) && t >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;

  const previousWeekCandidates = candidates.filter(c => {
    const t = Date.parse(c.createdAt);
    return Number.isFinite(t) && t >= Date.now() - 14 * 24 * 60 * 60 * 1000 && t < Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;

  const weeklyGrowth = previousWeekCandidates > 0
    ? (((lastWeekCandidates - previousWeekCandidates) / previousWeekCandidates) * 100).toFixed(1)
    : '0';

  const PERIOD_LABELS: Record<typeof selectedPeriod, string> = {
    week: '7 derniers jours',
    month: '30 derniers jours',
    all: 'Toutes les données',
  };

  const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316', '#64748B'];

  const gradePieData = Object.entries(gradeStats)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  const scoreBarData = Object.entries(scoreDistribution).map(([range, value]) => ({ range, value }));

  const regionBarData = Object.entries(stats?.candidatesByRegion || {})
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name: name || 'Non renseigné', value }));

  // Données pour le graphique d'évolution temporelle
  const timelineData = (() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map(date => {
      const dayStart = date.setHours(0, 0, 0, 0);
      const dayEnd = date.setHours(23, 59, 59, 999);
      const count = candidates.filter(c => {
        const t = Date.parse(c.createdAt);
        return Number.isFinite(t) && t >= dayStart && t <= dayEnd;
      }).length;

      return {
        date: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date),
        inscriptions: count
      };
    });
  })();

  // Performance par région (Radar chart)
  const performanceData = Object.entries(stats?.candidatesByRegion || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([region, count]) => ({
      region: region || 'Autre',
      candidats: count,
      verifies: Math.floor(count * (parseFloat(validationRate) / 100))
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sticky Header avec glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-black bg-gradient-to-r from-ioai-blue to-ioai-green bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Vue complète des métriques AOAI 2026 • {filteredCandidates.length} candidats analysés
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Sélecteur de période */}
              <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
                {(['week', 'month', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      selectedPeriod === period
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {PERIOD_LABELS[period]}
                  </button>
                ))}
              </div>

              {/* Bouton Refresh */}
              <button
                onClick={fetchStats}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>

              {/* Bouton Export */}
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-ioai-green to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                <Download size={18} />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* KPIs principaux - Design moderne avec gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Candidats */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 opacity-10">
              <Users size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  {parseFloat(weeklyGrowth) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {weeklyGrowth}%
                </div>
              </div>
              <p className="text-5xl font-black mb-2">{stats?.totalCandidates?.toLocaleString() ?? 0}</p>
              <p className="text-blue-100 font-medium">Candidats inscrits</p>
              <p className="text-blue-200 text-xs mt-2">+{lastWeekCandidates} cette semaine</p>
            </div>
          </div>

          {/* Profils validés */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 opacity-10">
              <CheckCircle size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  <Percent size={14} />
                  {validationRate}%
                </div>
              </div>
              <p className="text-5xl font-black mb-2">{stats?.verifiedCandidates?.toLocaleString() ?? 0}</p>
              <p className="text-green-100 font-medium">Profils validés</p>
              <p className="text-green-200 text-xs mt-2">Taux de validation</p>
            </div>
          </div>

          {/* QCM Complétés */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 opacity-10">
              <Award size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  {stats?.qcmAverageScore != null ? `${stats.qcmAverageScore.toFixed(0)}%` : '-'}
                </div>
              </div>
              <p className="text-5xl font-black mb-2">{stats?.qcmCompleted?.toLocaleString() ?? 0}</p>
              <p className="text-purple-100 font-medium">QCM complétés</p>
              <p className="text-purple-200 text-xs mt-2">Score moyen: {stats?.qcmAverageScore?.toFixed(1) ?? 0}%</p>
            </div>
          </div>

          {/* Taux de complétion */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 opacity-10">
              <Activity size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  <Percent size={14} />
                  {qcmCompletionRate}%
                </div>
              </div>
              <p className="text-5xl font-black mb-2">{Object.keys(stats?.candidatesByRegion || {}).length}</p>
              <p className="text-orange-100 font-medium">Départements actifs</p>
              <p className="text-orange-200 text-xs mt-2">Couverture nationale</p>
            </div>
          </div>
        </div>

        {/* Évolution temporelle - Grand graphique */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                Évolution des inscriptions
              </h3>
              <p className="text-gray-500 text-sm mt-1">Tendance sur les 30 derniers jours</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-blue-600">{lastWeekCandidates}</p>
              <p className="text-sm text-gray-500">inscriptions (7j)</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inscriptions"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorInscriptions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grille de métriques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Répartition par genre - Version améliorée */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-white" />
                </div>
                Par genre
              </h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {((genderStats.male ?? 0) + (genderStats.female ?? 0)).toLocaleString()}
              </span>
            </div>

            {(genderStats.male ?? 0) + (genderStats.female ?? 0) > 0 ? (
              <div className="space-y-6">
                <div className="h-[220px]">
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
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {[
                          { name: 'Garçons', value: genderStats.male ?? 0, color: '#3B82F6' },
                          { name: 'Filles', value: genderStats.female ?? 0, color: '#EC4899' }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🚹</span>
                      <span className="text-xs font-semibold text-blue-700">Garçons</span>
                    </div>
                    <p className="text-2xl font-black text-blue-600">{genderStats.male ?? 0}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {stats?.totalCandidates ? (((genderStats.male ?? 0) / stats.totalCandidates) * 100).toFixed(1) : 0}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🚺</span>
                      <span className="text-xs font-semibold text-pink-700">Filles</span>
                    </div>
                    <p className="text-2xl font-black text-pink-600">{genderStats.female ?? 0}</p>
                    <p className="text-xs text-pink-600 mt-1">
                      {stats?.totalCandidates ? (((genderStats.female ?? 0) / stats.totalCandidates) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Users size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Distribution des scores */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                Scores QCM
              </h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {qcmScores.length} tests
              </span>
            </div>

            {qcmScores.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-semibold mb-1">Score moyen</p>
                      <p className="text-3xl font-black text-purple-600">
                        {stats?.qcmAverageScore?.toFixed(1) ?? 0}%
                      </p>
                    </div>
                    <Award size={40} className="text-purple-300" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Award size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucun QCM complété</p>
              </div>
            )}
          </div>

          {/* Répartition par classe */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                Par classe
              </h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {gradePieData.length} niveaux
              </span>
            </div>

            {gradePieData.length > 0 ? (
              <div className="h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {gradePieData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={CHART_COLORS[(idx + 2) % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <GraduationCap size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Analyses géographiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carte des départements */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-white" />
                  </div>
                  Couverture géographique
                </h3>
                <p className="text-gray-500 text-sm mt-1">Répartition par département</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-green-600">{Object.keys(stats?.candidatesByRegion || {}).length}</p>
                <p className="text-sm text-gray-500">départements</p>
              </div>
            </div>

            {regionBarData.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {regionBarData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Top établissements */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <School size={20} className="text-white" />
                  </div>
                  Top 10 établissements
                </h3>
                <p className="text-gray-500 text-sm mt-1">Classement par nombre de candidats</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-blue-600">{Object.keys(schoolStats).length}</p>
                <p className="text-sm text-gray-500">écoles</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {topSchools.map(([school, count], index) => {
                const total = stats?.totalCandidates || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                const medals = ['🥇', '🥈', '🥉'];

                return (
                  <div
                    key={`school-${index}`}
                    className="group flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-3xl">{medals[index] || '🏅'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{school}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 font-semibold">{percentage}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-blue-600">{count}</p>
                      <p className="text-xs text-gray-500">candidats</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pipeline de sélection - Version améliorée */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Target size={20} className="text-white" />
                </div>
                Pipeline de sélection
              </h3>
              <p className="text-gray-500 text-sm mt-1">Suivi de la progression des candidats</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {stats?.candidatesByStatus && Object.entries(stats.candidatesByStatus).map(([status, count], idx) => {
              const configs: Record<string, { label: string; icon: React.ReactNode; gradient: string; ring: string }> = {
                registered: {
                  label: 'Inscrits',
                  icon: <Clock size={22} />,
                  gradient: 'from-yellow-400 to-orange-500',
                  ring: 'ring-yellow-200'
                },
                qcm_pending: {
                  label: 'QCM en attente',
                  icon: <FileText size={22} />,
                  gradient: 'from-orange-400 to-red-500',
                  ring: 'ring-orange-200'
                },
                qcm_completed: {
                  label: 'QCM complétés',
                  icon: <CheckCircle size={22} />,
                  gradient: 'from-green-400 to-emerald-500',
                  ring: 'ring-green-200'
                },
                regional_selected: {
                  label: 'Sélection régionale',
                  icon: <MapPin size={22} />,
                  gradient: 'from-blue-400 to-cyan-500',
                  ring: 'ring-blue-200'
                },
                bootcamp_selected: {
                  label: 'Bootcamp',
                  icon: <Award size={22} />,
                  gradient: 'from-purple-400 to-pink-500',
                  ring: 'ring-purple-200'
                },
                national_finalist: {
                  label: 'Finalistes',
                  icon: <TrendingUp size={22} />,
                  gradient: 'from-indigo-400 to-purple-500',
                  ring: 'ring-indigo-200'
                },
                rejected: {
                  label: 'Non retenus',
                  icon: <XCircle size={22} />,
                  gradient: 'from-gray-400 to-gray-500',
                  ring: 'ring-gray-200'
                },
              };

              const config = configs[status] || {
                label: status,
                icon: <Activity size={22} />,
                gradient: 'from-gray-400 to-gray-500',
                ring: 'ring-gray-200'
              };
              const percentage = stats.totalCandidates > 0 ? ((count / stats.totalCandidates) * 100).toFixed(1) : '0';

              return (
                <div
                  key={`status-${idx}`}
                  className={`group relative bg-gradient-to-br ${config.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 ring-4 ${config.ring}`}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-4xl font-black mb-1">{count.toLocaleString()}</p>
                      <p className="text-xs font-semibold opacity-90">{config.label}</p>
                      <p className="text-xs opacity-75 mt-1">{percentage}%</p>
                    </div>
                  </div>
                  {idx < 6 && (
                    <ChevronRight className="absolute -right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hidden lg:block" size={20} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance radar (bonus) */}
        {performanceData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                Performance par région (Top 6)
              </h3>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="region" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                  <Radar name="Candidats" dataKey="candidats" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                  <Radar name="Vérifiés" dataKey="verifies" stroke="#10B981" fill="#10B981" fillOpacity={0.5} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Footer message */}
        <div className="bg-gradient-to-r from-ioai-blue via-purple-600 to-ioai-green rounded-2xl p-8 text-white text-center shadow-xl">
          <Activity size={48} className="mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-black mb-2">Données mises à jour en temps réel</h3>
          <p className="text-white/90 max-w-2xl mx-auto">
            Ce tableau de bord affiche les statistiques complètes de {stats?.totalCandidates?.toLocaleString() ?? 0} candidats.
            Toutes les métriques sont calculées dynamiquement depuis la base de données.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPageV2;

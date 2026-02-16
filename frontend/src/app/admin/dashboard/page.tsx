'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, FileText, CheckCircle, Clock, TrendingUp, TrendingDown,
  AlertCircle, ArrowRight, MapPin, Calendar, Award, Target,
  UserCheck, UserX, Eye, Download, BarChart3, PieChart
} from 'lucide-react';
import { adminApi, DashboardStats } from '@/lib/api/admin';

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Charger uniquement les statistiques de base pour le dashboard
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const overview = await adminApi.getDashboardStats();
        setStats(overview);
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
          <p className="text-sm text-gray-500">Profils vérifiés</p>
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

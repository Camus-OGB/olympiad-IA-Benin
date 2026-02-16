'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Users, CheckCircle, Clock, Award, BarChart3, PieChart, Activity, AlertCircle, Download, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { qcmApi, AdminQCMStats } from '@/lib/api/qcm'

export default function QCMStatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<AdminQCMStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await qcmApi.getAdminStats()
      setStats(data)
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err)
      setError(err.response?.data?.detail || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (!stats) return

    const csv = [
      'Type,Catégorie,Valeur',
      `Statistiques Générales,Total Questions,${stats.totalQuestions}`,
      `Statistiques Générales,Total Sessions,${stats.totalSessions}`,
      `Statistiques Générales,Total Tentatives,${stats.totalAttempts}`,
      `Statistiques Générales,Tentatives Complétées,${stats.completedAttempts}`,
      `Statistiques Générales,Score Moyen,${stats.averageScore !== null ? Math.round(stats.averageScore) : 'N/A'}%`,
      `Statistiques Générales,Taux de Réussite,${stats.passRate !== null ? Math.round(stats.passRate) : 'N/A'}%`,
      '',
      'Type,Difficulté,Nombre de Questions',
      ...Object.entries(stats.questionsByDifficulty).map(([difficulty, count]) =>
        `Questions par Difficulté,${difficulty},${count}`
      ),
      '',
      'Type,Catégorie,Nombre de Questions',
      ...Object.entries(stats.questionsByCategory).map(([category, count]) =>
        `Questions par Catégorie,${category},${count}`
      ),
      '',
      'Type,Session,Nombre de Tentatives',
      ...Object.entries(stats.attemptsBySession).map(([session, count]) =>
        `Tentatives par Session,${session},${count}`
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `statistiques_qcm_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error || 'Erreur lors du chargement'}
        </div>
      </div>
    )
  }

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  }

  const difficultyLabels = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          .print-only { display: block !important; }
        }
      `}</style>

    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/qcm')}
          className="flex items-center text-gray-600 hover:text-ioai-green mb-4 no-print"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à la gestion QCM
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Statistiques QCM</h1>
            <p className="text-gray-600 mt-2">Vue d'ensemble des performances et de l'activité</p>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-ioai-green text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimer PDF
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Questions</p>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.totalQuestions}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Sessions Créées</p>
            <Clock className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.totalSessions}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Tentatives</p>
            <Users className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.totalAttempts}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.completedAttempts} complétées
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Score Moyen</p>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">
            {stats.averageScore !== null ? Math.round(stats.averageScore) : '-'}%
          </p>
          {stats.passRate !== null && (
            <p className="text-xs text-gray-500 mt-1">
              Taux de réussite: {Math.round(stats.passRate)}%
            </p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions by Difficulty */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-500" />
            Questions par Difficulté
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.questionsByDifficulty).map(([difficulty, count]) => {
              const total = Object.values(stats.questionsByDifficulty).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? (count / total) * 100 : 0

              return (
                <div key={difficulty}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {difficultyLabels[difficulty as keyof typeof difficultyLabels] || difficulty}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Questions by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Questions par Catégorie
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.questionsByCategory).slice(0, 5).map(([category, count]) => {
              const total = Object.values(stats.questionsByCategory).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? (count / total) * 100 : 0

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Attempts by Session */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-orange-500" />
          Tentatives par Session
        </h2>
        <div className="space-y-3">
          {Object.entries(stats.attemptsBySession).map(([sessionTitle, count]) => (
            <div key={sessionTitle} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{sessionTitle}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {count} tentative{count > 1 ? 's' : ''}
              </span>
            </div>
          ))}
          {Object.keys(stats.attemptsBySession).length === 0 && (
            <p className="text-center text-gray-500 py-4">Aucune tentative enregistrée</p>
          )}
        </div>
      </div>

      {/* Top Performers & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Top 10 Performances
          </h2>
          <div className="space-y-2">
            {stats.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-transparent rounded-lg border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  } font-bold text-sm`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.candidateName}</p>
                    <p className="text-xs text-gray-500">{performer.sessionTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">{Math.round(performer.score)}%</p>
                  {performer.completedAt && (
                    <p className="text-xs text-gray-400">
                      {new Date(performer.completedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {stats.topPerformers.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune performance enregistrée</p>
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Tentatives Récentes
          </h2>
          <div className="space-y-2">
            {stats.recentAttempts.map((attempt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{attempt.candidateName}</p>
                  <p className="text-xs text-gray-500">{attempt.sessionTitle}</p>
                  {attempt.startedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(attempt.startedAt).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {attempt.completed ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 inline mr-1" />
                      {attempt.score !== null && (
                        <span className="font-bold text-gray-900">{Math.round(attempt.score)}%</span>
                      )}
                    </>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                      En cours
                    </span>
                  )}
                </div>
              </div>
            ))}
            {stats.recentAttempts.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune tentative récente</p>
            )}
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="text-center text-sm text-gray-500 mt-8 print-only" style={{ display: 'none' }}>
        <p>Généré le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} - Olympiades IA Bénin 2026</p>
      </div>
    </div>
    </>
  )
}

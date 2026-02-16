'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2, AlertCircle, Loader2, Calendar, Clock } from 'lucide-react'
import { qcmApi, QCMSessionResponse } from '@/lib/api/qcm'

const CATEGORIES = ['Mathématiques', 'IA & ML', 'Programmation', 'Logique', 'Sciences', 'Autre']

export default function EditSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [session, setSession] = useState<QCMSessionResponse | null>(null)
  const [useDistribution, setUseDistribution] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalQuestions: 20,
    timePerQuestion: 2,
    categories: [] as string[],
    passingScore: 60,
    distribution: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
  })

  useEffect(() => {
    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      setLoading(true)
      const sessions = await qcmApi.getAllSessions()
      const foundSession = sessions.find(s => s.id === sessionId)

      if (!foundSession) {
        setError('Session non trouvée')
        return
      }

      setSession(foundSession)

      // Convertir les dates ISO en format datetime-local
      const startDate = foundSession.startDate ? new Date(foundSession.startDate).toISOString().slice(0, 16) : ''
      const endDate = foundSession.endDate ? new Date(foundSession.endDate).toISOString().slice(0, 16) : ''

      const hasDistribution = !!(foundSession.distributionByDifficulty &&
        Object.keys(foundSession.distributionByDifficulty).length > 0)

      setUseDistribution(hasDistribution)

      setFormData({
        title: foundSession.title,
        description: foundSession.description,
        startDate,
        endDate,
        totalQuestions: foundSession.totalQuestions,
        timePerQuestion: foundSession.timePerQuestion,
        categories: foundSession.categories || [],
        passingScore: foundSession.passingScore,
        distribution: hasDistribution ? {
          easy: foundSession.distributionByDifficulty?.easy || 0,
          medium: foundSession.distributionByDifficulty?.medium || 0,
          hard: foundSession.distributionByDifficulty?.hard || 0,
        } : {
          easy: 0,
          medium: 0,
          hard: 0,
        },
      })
    } catch (err: any) {
      setError('Erreur lors du chargement de la session')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.title.trim()) {
      setError('Le titre est requis')
      return
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Les dates sont requises')
      return
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('La date de fin doit être après la date de début')
      return
    }

    if (useDistribution) {
      const total = formData.distribution.easy + formData.distribution.medium + formData.distribution.hard
      if (total === 0) {
        setError('Veuillez définir au moins une question dans la distribution')
        return
      }
    }

    try {
      setSaving(true)

      const payload: any = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        totalQuestions: useDistribution
          ? formData.distribution.easy + formData.distribution.medium + formData.distribution.hard
          : formData.totalQuestions,
        timePerQuestion: formData.timePerQuestion,
        categories: formData.categories.length > 0 ? formData.categories : undefined,
        passingScore: formData.passingScore,
      }

      if (useDistribution) {
        payload.distributionByDifficulty = formData.distribution
      }

      await qcmApi.updateSession(sessionId, payload)
      setSuccess('Session mise à jour avec succès !')
      setTimeout(() => {
        router.push('/admin/qcm')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.')) {
      return
    }

    try {
      setDeleting(true)
      await qcmApi.deleteSession(sessionId)
      router.push('/admin/qcm')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const totalDistribution = formData.distribution.easy + formData.distribution.medium + formData.distribution.hard
  const totalDuration = useDistribution
    ? totalDistribution * formData.timePerQuestion
    : formData.totalQuestions * formData.timePerQuestion

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-ioai-green" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          Session non trouvée
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/qcm')}
          className="flex items-center text-gray-600 hover:text-ioai-green mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour aux sessions
        </button>
        <h1 className="text-3xl font-black text-gray-900">Modifier la session</h1>
        <p className="text-gray-600 mt-2">ID: {sessionId}</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✓ {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-black text-gray-900">Informations générales</h2>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date de début *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date de fin *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Questions Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-black text-gray-900">Configuration des questions</h2>

          {/* Distribution Toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="useDistribution"
              checked={useDistribution}
              onChange={(e) => setUseDistribution(e.target.checked)}
              className="w-4 h-4 text-ioai-green rounded"
            />
            <label htmlFor="useDistribution" className="text-sm font-medium text-gray-700">
              Utiliser une distribution par difficulté
            </label>
          </div>

          {!useDistribution ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre de questions *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Temps par question (min)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={formData.timePerQuestion}
                  onChange={(e) => setFormData({ ...formData, timePerQuestion: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>
                    Facile
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.distribution.easy}
                    onChange={(e) => setFormData({
                      ...formData,
                      distribution: { ...formData.distribution, easy: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-1"></span>
                    Moyen
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.distribution.medium}
                    onChange={(e) => setFormData({
                      ...formData,
                      distribution: { ...formData.distribution, medium: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span>
                    Difficile
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.distribution.hard}
                    onChange={(e) => setFormData({
                      ...formData,
                      distribution: { ...formData.distribution, hard: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Temps par question (min)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={formData.timePerQuestion}
                  onChange={(e) => setFormData({ ...formData, timePerQuestion: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                />
              </div>

              <p className="text-sm text-gray-600 mt-2">
                Total: <span className="font-bold">{totalDistribution} questions</span>
                {' • '}
                Durée: <span className="font-bold">{totalDuration} minutes</span>
              </p>
            </div>
          )}

          {/* Categories */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Catégories (optionnel)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <label
                  key={cat}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.categories.includes(cat)
                      ? 'border-ioai-green bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-4 h-4 text-ioai-green rounded"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Passing Score */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Score de passage (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.passingScore}
              onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
            />
          </div>

          {/* Duration Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <Clock className="h-4 w-4 inline mr-1" />
              <strong>Durée totale:</strong> {totalDuration} minutes
              {' • '}
              <strong>Questions:</strong> {useDistribution ? totalDistribution : formData.totalQuestions}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            Supprimer
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}

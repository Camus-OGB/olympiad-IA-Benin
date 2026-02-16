'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { qcmApi, QuestionWithAnswer } from '@/lib/api/qcm'

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Facile', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Difficile', color: 'bg-red-100 text-red-800' },
]

const CATEGORIES = ['Mathématiques', 'IA & ML', 'Programmation', 'Logique', 'Sciences', 'Autre']

export default function EditQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const questionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [question, setQuestion] = useState<QuestionWithAnswer | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium',
    category: '',
    explanation: '',
    points: 1,
  })

  useEffect(() => {
    loadQuestion()
  }, [questionId])

  const loadQuestion = async () => {
    try {
      setLoading(true)
      const questions = await qcmApi.getAllQuestions()
      const foundQuestion = questions.find(q => q.id === questionId)

      if (!foundQuestion) {
        setError('Question non trouvée')
        return
      }

      setQuestion(foundQuestion)
      setFormData({
        question: foundQuestion.question,
        options: foundQuestion.options,
        correctAnswer: foundQuestion.correctAnswer || 0,
        difficulty: foundQuestion.difficulty,
        category: foundQuestion.category,
        explanation: foundQuestion.explanation || '',
        points: foundQuestion.points,
      })
    } catch (err: any) {
      setError('Erreur lors du chargement de la question')
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
    if (!formData.question.trim()) {
      setError('La question est requise')
      return
    }

    if (formData.options.some(opt => !opt.trim())) {
      setError('Toutes les options doivent être remplies')
      return
    }

    if (!formData.category) {
      setError('La catégorie est requise')
      return
    }

    try {
      setSaving(true)
      await qcmApi.updateQuestion(questionId, formData)
      setSuccess('Question mise à jour avec succès !')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.')) {
      return
    }

    try {
      setDeleting(true)
      await qcmApi.deleteQuestion(questionId)
      router.push('/admin/qcm')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-ioai-green" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          Question non trouvée
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
          Retour aux questions
        </button>
        <h1 className="text-3xl font-black text-gray-900">Modifier la question</h1>
        <p className="text-gray-600 mt-2">ID: {questionId}</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Question *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              required
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Options de réponse *
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({ ...formData, correctAnswer: index })}
                    className="w-4 h-4 text-ioai-green"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options]
                      newOptions[index] = e.target.value
                      setFormData({ ...formData, options: newOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                    required
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Sélectionnez la bonne réponse en cochant le bouton radio
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Difficulté *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                required
              >
                {DIFFICULTY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                required
              >
                <option value="">Sélectionner...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Explication (optionnel)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={3}
              placeholder="Explication de la réponse correcte..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
            />
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

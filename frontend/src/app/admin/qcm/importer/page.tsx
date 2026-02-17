'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle, Download, Info } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { QuestionCreate } from '@/lib/api/qcm'

export default function ImportQuestionsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    createdCount?: number
    errorCount?: number
    errors?: any[]
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (extension === 'json' || extension === 'csv') {
        setFile(selectedFile)
        setResult(null)
      } else {
        alert('Format de fichier non supporté. Veuillez utiliser un fichier JSON ou CSV.')
      }
    }
  }

  const parseCSV = (text: string): QuestionCreate[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())

    // Vérifier que les en-têtes requis sont présents
    const requiredHeaders = ['question', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'difficulty', 'category']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

    if (missingHeaders.length > 0) {
      throw new Error(`En-têtes manquants: ${missingHeaders.join(', ')}`)
    }

    const questions: QuestionCreate[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: Record<string, string> = {}

      headers.forEach((header, idx) => {
        row[header] = values[idx] || ''
      })

      questions.push({
        question: row.question,
        options: [row.option1, row.option2, row.option3, row.option4].map((text, id) => ({ text, id })),
        correctAnswers: [parseInt(row.correctAnswer)],
        isMultipleAnswer: false,
        difficulty: row.difficulty,
        category: row.category,
        explanation: row.explanation || undefined,
        points: parseInt(row.points) || 1,
      })
    }

    return questions
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setImporting(true)
      setResult(null)

      const text = await file.text()
      let questions: QuestionCreate[]

      if (file.name.endsWith('.json')) {
        // Parse JSON
        const data = JSON.parse(text)
        questions = Array.isArray(data) ? data : [data]
      } else {
        // Parse CSV
        questions = parseCSV(text)
      }

      // Valider les questions
      if (questions.length === 0) {
        throw new Error('Aucune question trouvée dans le fichier')
      }

      // Envoyer au backend
      const { data } = await apiClient.post('/qcm/admin/questions/bulk', questions)

      setResult({
        success: true,
        message: data.message,
        createdCount: data.createdCount,
        errorCount: data.errorCount,
        errors: data.errors,
      })
    } catch (err: any) {
      console.error('Erreur lors de l\'import:', err)
      setResult({
        success: false,
        message: err.response?.data?.detail || err.message || 'Erreur lors de l\'import',
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const template = [
        {
          question: "Quelle est la capitale de la France?",
          options: ["Paris", "Londres", "Berlin", "Madrid"],
          correctAnswer: 0,
          difficulty: "easy",
          category: "Géographie",
          explanation: "Paris est la capitale de la France depuis le Moyen Âge.",
          points: 1
        },
        {
          question: "Qu'est-ce que le machine learning?",
          options: [
            "Un type d'apprentissage automatique",
            "Un langage de programmation",
            "Un système d'exploitation",
            "Un framework web"
          ],
          correctAnswer: 0,
          difficulty: "medium",
          category: "IA & ML",
          explanation: "Le machine learning est une branche de l'IA qui permet aux machines d'apprendre à partir de données.",
          points: 2
        }
      ]

      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'questions_template.json'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const csv = `question,option1,option2,option3,option4,correctAnswer,difficulty,category,explanation,points
"Quelle est la capitale de la France?","Paris","Londres","Berlin","Madrid",0,easy,Géographie,"Paris est la capitale de la France depuis le Moyen Âge.",1
"Qu'est-ce que le machine learning?","Un type d'apprentissage automatique","Un langage de programmation","Un système d'exploitation","Un framework web",0,medium,IA & ML,"Le machine learning est une branche de l'IA qui permet aux machines d'apprendre à partir de données.",2`

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'questions_template.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
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
          Retour à la gestion QCM
        </button>
        <h1 className="text-3xl font-black text-gray-900">Importer des questions</h1>
        <p className="text-gray-600 mt-2">Importez plusieurs questions en une seule fois via CSV ou JSON</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Formats supportés :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>JSON :</strong> Format structuré, recommandé pour les imports complexes</li>
              <li><strong>CSV :</strong> Format tableur, facile à éditer avec Excel/Google Sheets</li>
            </ul>
            <p className="mt-3">
              <strong>Champs requis :</strong> question, option1-4, correctAnswer (0-3), difficulty (easy/medium/hard), category
            </p>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">Télécharger un modèle</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => downloadTemplate('json')}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-ioai-green hover:bg-green-50 transition-colors"
          >
            <FileJson className="h-8 w-8 text-blue-500" />
            <div className="text-left">
              <p className="font-bold text-gray-900">Modèle JSON</p>
              <p className="text-sm text-gray-500">Format structuré</p>
            </div>
            <Download className="h-5 w-5 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => downloadTemplate('csv')}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-ioai-green hover:bg-green-50 transition-colors"
          >
            <FileSpreadsheet className="h-8 w-8 text-green-500" />
            <div className="text-left">
              <p className="font-bold text-gray-900">Modèle CSV</p>
              <p className="text-sm text-gray-500">Format tableur</p>
            </div>
            <Download className="h-5 w-5 text-gray-400 ml-auto" />
          </button>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">Importer un fichier</h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-ioai-green transition-colors">
          <input
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              Cliquez pour sélectionner un fichier
            </p>
            <p className="text-sm text-gray-500">
              Formats supportés : JSON, CSV
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              {file.name.endsWith('.json') ? (
                <FileJson className="h-6 w-6 text-blue-500" />
              ) : (
                <FileSpreadsheet className="h-6 w-6 text-green-500" />
              )}
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Supprimer
            </button>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full mt-6 px-6 py-3 bg-ioai-green text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Importation en cours...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Importer les questions
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-6 ${
          result.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.message}
              </p>
              {result.createdCount !== undefined && (
                <p className="text-sm text-gray-600 mt-1">
                  {result.createdCount} question(s) créée(s)
                  {result.errorCount && result.errorCount > 0 && ` • ${result.errorCount} erreur(s)`}
                </p>
              )}
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-red-200">
              <p className="font-semibold text-red-900 mb-2">Erreurs détaillées :</p>
              <ul className="space-y-2 text-sm">
                {result.errors.map((error, idx) => (
                  <li key={idx} className="text-red-700">
                    <strong>Ligne {error.index + 1}:</strong> {error.question} - {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.success && result.createdCount && result.createdCount > 0 && (
            <button
              onClick={() => router.push('/admin/qcm')}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Voir les questions
            </button>
          )}
        </div>
      )}
    </div>
  )
}

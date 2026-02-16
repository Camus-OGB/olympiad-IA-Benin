'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, FileText, Play, ExternalLink, AlertCircle, Loader2, Save, X, Upload } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { AlertDialog, ConfirmDialog } from '@/components/ui/Dialog'

type ResourceType = 'pdf' | 'video' | 'link' | 'document'
type ResourceCategory = 'guide' | 'cours' | 'exercices' | 'tutoriel' | 'autre'

interface Resource {
  id: string
  title: string
  description?: string
  type: ResourceType
  category: ResourceCategory
  url: string
  fileSize?: string
  duration?: string
  isActive: boolean
  orderIndex: number
  createdAt: string
}

export default function ResourcesManagementPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // États pour les dialogues
  const [alert, setAlert] = useState<{ show: boolean; title: string; message: string; type: 'error' | 'success' | 'warning' | 'info' }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  })
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; resourceId: string | null }>({
    show: false,
    resourceId: null
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as ResourceType,
    category: 'guide' as ResourceCategory,
    url: '',
    fileSize: '',
    duration: '',
  })

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/resources/')
      setResources(data)
    } catch (err: any) {
      console.error('Erreur chargement ressources:', err)
      setError(err.response?.data?.detail || 'Erreur lors du chargement des ressources')
      // Données de fallback pour développement
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setUploading(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const { data } = await apiClient.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Mettre à jour l'URL avec le chemin du fichier uploadé
      setFormData({
        ...formData,
        url: data.url,
        fileSize: data.size || formatFileSize(file.size)
      })
    } catch (err: any) {
      setAlert({
        show: true,
        title: 'Erreur d\'upload',
        message: err.response?.data?.detail || 'Erreur lors de l\'upload du fichier',
        type: 'error'
      })
      setUploadedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: vérifier qu'une URL existe pour les nouvelles ressources
    if (!editingResource && !formData.url) {
      setAlert({
        show: true,
        title: 'Validation',
        message: 'Veuillez uploader un fichier ou saisir une URL',
        type: 'warning'
      })
      return
    }

    setSubmitting(true)

    try {
      if (editingResource) {
        await apiClient.put(`/resources/${editingResource.id}/`, formData)
      } else {
        await apiClient.post('/resources/', formData)
      }
      await loadResources()
      handleCloseModal()
      setAlert({
        show: true,
        title: 'Succès',
        message: `Ressource ${editingResource ? 'modifiée' : 'créée'} avec succès`,
        type: 'success'
      })
    } catch (err: any) {
      setAlert({
        show: true,
        title: 'Erreur',
        message: err.response?.data?.detail || 'Erreur lors de la sauvegarde',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setConfirmDelete({ show: true, resourceId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.resourceId) return

    try {
      await apiClient.delete(`/resources/${confirmDelete.resourceId}/`)
      await loadResources()
      setAlert({
        show: true,
        title: 'Succès',
        message: 'Ressource supprimée avec succès',
        type: 'success'
      })
    } catch (err: any) {
      setAlert({
        show: true,
        title: 'Erreur',
        message: err.response?.data?.detail || 'Erreur lors de la suppression',
        type: 'error'
      })
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      category: resource.category,
      url: resource.url,
      fileSize: resource.fileSize || '',
      duration: resource.duration || '',
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingResource(null)
    setUploadedFile(null)
    setFormData({
      title: '',
      description: '',
      type: 'pdf',
      category: 'guide',
      url: '',
      fileSize: '',
      duration: '',
    })
  }

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5" />
      case 'video':
        return <Play className="h-5 w-5" />
      case 'link':
        return <ExternalLink className="h-5 w-5" />
    }
  }

  const getCategoryLabel = (cat: ResourceCategory) => {
    const labels = {
      guide: 'Guide',
      cours: 'Cours',
      exercices: 'Exercices',
      tutoriel: 'Tutoriel',
      autre: 'Autre'
    }
    return labels[cat]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-ioai-green" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Gestion des Ressources</h1>
          <p className="text-gray-600 mt-2">Ressources pédagogiques pour les candidats</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouvelle Ressource
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
          <p className="text-sm mt-2">
            Note: Assurez-vous que le backend est démarré et que la table <code>resources</code> existe.
          </p>
        </div>
      )}

      {/* Resources List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Ressources ({resources.length})
          </h2>

          {resources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucune ressource créée</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-ioai-green text-white rounded-lg hover:bg-green-600"
              >
                Créer la première ressource
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      resource.type === 'pdf' ? 'bg-red-100 text-red-600' :
                      resource.type === 'video' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-400 uppercase">
                        {getCategoryLabel(resource.category)}
                      </span>
                      <h3 className="font-bold text-gray-900 truncate">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {resource.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {resource.type.toUpperCase()} • {resource.fileSize || resource.duration || 'En ligne'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Voir
                    </a>
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(resource.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">
                {editingResource ? 'Modifier' : 'Nouvelle'} Ressource
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                    required
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Vidéo</option>
                    <option value="document">Document</option>
                    <option value="link">Lien</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ResourceCategory })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                    required
                  >
                    <option value="guide">Guide</option>
                    <option value="cours">Cours</option>
                    <option value="exercices">Exercices</option>
                    <option value="tutoriel">Tutoriel</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Champ URL ou Upload selon le type */}
              {(formData.type === 'video' || formData.type === 'link') ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'video' ? 'Lien YouTube, Vimeo, etc.' : 'Lien vers une ressource externe'}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fichier {formData.type.toUpperCase()} {!editingResource && '*'}
                  </label>
                  <div className="space-y-3">
                    {/* Afficher le fichier existant en mode édition */}
                    {editingResource && formData.url && !uploadedFile && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Fichier actuel</p>
                          <p className="text-xs text-gray-500">{formData.url}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-ioai-green hover:bg-green-50 transition-colors">
                          <Upload className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            {uploadedFile ? (
                              <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                            ) : (
                              <p className="text-sm text-gray-600">
                                {editingResource ? 'Cliquez pour remplacer le fichier' : `Cliquez pour sélectionner un fichier ${formData.type === 'pdf' ? 'PDF' : ''}`}
                              </p>
                            )}
                            {uploading && (
                              <p className="text-xs text-ioai-green mt-1 flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Upload en cours...
                              </p>
                            )}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept={formData.type === 'pdf' ? '.pdf' : '.doc,.docx,.txt'}
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {uploadedFile && formData.url && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Nouveau fichier uploadé avec succès
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'pdf' ? 'Format accepté: PDF' : 'Formats acceptés: DOC, DOCX, TXT'}
                    {editingResource && ' • Optionnel en mode édition'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Taille (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="Ex: 2.4 MB"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Durée (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ex: 45 min"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-green focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-ioai-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingResource ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, resourceId: null })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la ressource"
        message="Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Calendar,
  Tag, Newspaper, Save, X, Image as ImageIcon, ExternalLink, Loader2, AlertCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { contentApi, type NewsItem, type NewsCreate, type NewsUpdate } from '@/lib/api/content';

// Charger l'éditeur WYSIWYG uniquement côté client
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  ),
});

const categories = ['Annonce', 'Résultats', 'Presse', 'Formation', 'Analyse', 'Interview'] as const;

// Helper pour générer un slug (pour affichage uniquement)
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function BlogCMS() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    category: string;
    isPublished: boolean;
  }>({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    category: 'Annonce',
    isPublished: false,
  });

  // Charger les articles au montage du composant
  useEffect(() => {
    loadArticles();
  }, []);

  // Filtrer les articles quand la recherche ou la catégorie change
  useEffect(() => {
    filterArticles();
  }, [searchQuery, selectedCategory, articles]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contentApi.getNews({ publishedOnly: false, limit: 50 });
      setArticles(data);
    } catch (err: any) {
      console.error('Erreur chargement articles:', err);
      setError('Impossible de charger les articles. Vérifiez que le backend est en marche.');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filtrer par catégorie
    if (selectedCategory !== 'Tout') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt || '').toLowerCase().includes(query) ||
        (article.author || '').toLowerCase().includes(query)
      );
    }

    setFilteredArticles(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.excerpt || !formData.content) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      if (editingArticle) {
        // Mise à jour
        const updateData: NewsUpdate = {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          imageUrl: formData.imageUrl || undefined,
          category: formData.category,
          isPublished: formData.isPublished,
        };
        await contentApi.updateNews(editingArticle.id, updateData);
      } else {
        // Création
        const createData: NewsCreate = {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          imageUrl: formData.imageUrl || undefined,
          category: formData.category,
          isPublished: formData.isPublished,
        };
        await contentApi.createNews(createData);
      }

      await loadArticles();
      closeModal();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert(err?.response?.data?.detail || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await contentApi.deleteNews(id);
        await loadArticles();
      } catch (err: any) {
        console.error('Erreur suppression:', err);
        alert(err?.response?.data?.detail || 'Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (article: NewsItem) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      imageUrl: article.imageUrl || '',
      category: article.category || 'Annonce',
      isPublished: article.isPublished,
    });
    setShowModal(true);
  };

  const togglePublish = async (article: NewsItem) => {
    try {
      await contentApi.updateNews(article.id, { isPublished: !article.isPublished });
      await loadArticles();
    } catch (err: any) {
      console.error('Erreur publication:', err);
      alert(err?.response?.data?.detail || 'Erreur lors du changement de statut');
    }
  };

  const openNewArticleModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      category: 'Annonce',
      isPublished: false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      category: 'Annonce',
      isPublished: false,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Blog & Actualités</h1>
          <p className="text-gray-500 mt-2">Gérez les articles, annonces et actualités du site</p>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadArticles}
              className="px-6 py-3 bg-ioai-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">
            Blog & Actualités
          </h1>
          <p className="text-gray-500 mt-2">
            Gérez les articles, annonces et actualités du site
          </p>
        </div>
        <button
          onClick={openNewArticleModal}
          className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nouvel Article
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Total</p>
              <p className="text-3xl font-black text-ioai-blue mt-1">{articles.length}</p>
            </div>
            <Newspaper className="w-10 h-10 text-ioai-blue opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Publiés</p>
              <p className="text-3xl font-black text-green-600 mt-1">
                {articles.filter(a => a.isPublished).length}
              </p>
            </div>
            <Eye className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Brouillons</p>
              <p className="text-3xl font-black text-orange-600 mt-1">
                {articles.filter(a => !a.isPublished).length}
              </p>
            </div>
            <EyeOff className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Catégories</p>
              <p className="text-3xl font-black text-purple-600 mt-1">{categories.length}</p>
            </div>
            <Tag className="w-10 h-10 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:bg-white focus:ring-2 focus:ring-ioai-green/20 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['Tout', ...categories].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === category
                    ? 'bg-ioai-green text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border-2 border-dashed border-gray-200 text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory !== 'Tout'
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par créer votre premier article'}
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-ioai-green/30 transition-all"
            >
              <div className="flex items-start gap-6">
                {/* Image */}
                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {article.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${article.isPublished
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                            }`}
                        >
                          {article.isPublished ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {article.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {article.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {article.author && (
                        <span className="font-semibold">{article.author}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(article)}
                        className={`p-2 rounded-lg transition-colors ${article.isPublished
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        title={article.isPublished ? 'Dépublier' : 'Publier'}
                      >
                        {article.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-green/20 outline-none"
                  placeholder="Titre de l'article"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Slug: {formData.title ? generateSlug(formData.title) : '...'}
                </p>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-green/20 outline-none"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-green/20 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2 w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Extrait */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Extrait *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-green/20 outline-none"
                  rows={3}
                  placeholder="Résumé court de l'article (affiché sur les cartes)"
                  required
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Contenu complet * (Éditeur WYSIWYG)
                </label>
                <RichTextEditor
                  content={formData.content || ''}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Commencez à rédiger le contenu de votre article..."
                />
              </div>

              {/* Publié */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 text-ioai-green focus:ring-ioai-green rounded"
                />
                <label htmlFor="published" className="font-bold text-gray-700 cursor-pointer">
                  Publier cet article immédiatement
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, X, Check } from 'lucide-react';
import { qcmCategoriesApi, QCMCategory, QCMCategoryWithStats } from '@/lib/api/qcm-categories';

interface CategorySelectorProps {
  value?: string | null;  // ID de la catégorie sélectionnée
  onChange: (categoryId: string | null) => void;
  error?: string;
}

/**
 * Composant de sélection de catégorie avec création inline
 * Permet de choisir une catégorie existante ou d'en créer une nouvelle
 */
export default function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  const [categories, setCategories] = useState<QCMCategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state pour nouvelle catégorie
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: 'Tag'
  });

  // Charger les catégories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await qcmCategoriesApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-générer le slug depuis le nom
  const handleNameChange = (name: string) => {
    setNewCategory({
      ...newCategory,
      name,
      slug: name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      setCreating(true);
      const created = await qcmCategoriesApi.createCategory({
        name: newCategory.name.trim(),
        slug: newCategory.slug,
        description: newCategory.description.trim() || undefined,
        color: newCategory.color,
        icon: newCategory.icon,
        isActive: true
      });

      // Ajouter à la liste
      setCategories([...categories, { ...created, questionCount: 0 }]);

      // Sélectionner automatiquement
      onChange(created.id);

      // Reset form
      setNewCategory({
        name: '',
        slug: '',
        description: '',
        color: '#3B82F6',
        icon: 'Tag'
      });
      setShowCreateForm(false);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 h-10 rounded-lg"></div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Dropdown de sélection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Aucune catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.questionCount} questions)
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Bouton pour afficher le formulaire de création */}
      {!showCreateForm && (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 text-sm text-ioai-blue hover:text-ioai-green transition-colors font-medium"
        >
          <Plus size={16} />
          Créer une nouvelle catégorie
        </button>
      )}

      {/* Formulaire inline de création */}
      {showCreateForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Tag size={16} className="text-ioai-blue" />
              Nouvelle catégorie
            </h4>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Mathématiques, Intelligence Artificielle..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent text-sm"
              required
            />
          </div>

          {/* Slug (auto-généré, éditable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              value={newCategory.slug}
              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              placeholder="mathematiques"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent text-sm font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Questions de mathématiques et logique..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Couleur */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            {/* Icône */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône Lucide
              </label>
              <input
                type="text"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                placeholder="Calculator, Brain, Code..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ioai-blue focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCategory.name.trim() || creating}
              className="flex items-center gap-2 px-4 py-2 bg-ioai-green text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Création...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Créer et sélectionner
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              disabled={creating}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

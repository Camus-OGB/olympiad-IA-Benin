'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash, Grid, List, X, Save, AlertTriangle } from 'lucide-react';
import { qcmApi } from '@/lib/api/qcm';

interface Question {
  id: number;
  type: 'QCM' | 'Texte';
  category: string;
  text: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  sessions: number;
  choices?: string[];
  correctAnswer?: number;
}

export default function QcmQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Charger les questions depuis l'API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await qcmApi.getAllQuestions();
        
        // Mapper les données de l'API au format attendu
        const mappedQuestions: Question[] = data.map((q: any) => ({
          id: parseInt(q.id) || 0,
          type: 'QCM',
          category: q.category || 'Non catégorisé',
          text: q.question,
          difficulty: q.difficulty === 'easy' ? 'Facile' : q.difficulty === 'medium' ? 'Moyen' : 'Difficile',
          sessions: 0,
          choices: q.options || [],
          correctAnswer: q.correctAnswer || 0,
        }));
        
        setQuestions(mappedQuestions);
      } catch (err: any) {
        console.error('Erreur lors du chargement des questions:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement des questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Question>>({
    type: 'QCM',
    category: '',
    text: '',
    difficulty: 'Facile',
    choices: ['', '', '', ''],
    correctAnswer: 0
  });

  const handleAddQuestion = async () => {
    try {
      // Convertir les données du formulaire au format backend
      const questionData = {
        question: formData.text || '',
        options: formData.choices || [],
        correctAnswer: formData.correctAnswer || 0,
        difficulty: formData.difficulty === 'Facile' ? 'easy' : formData.difficulty === 'Moyen' ? 'medium' : 'hard',
        category: formData.category || '',
        points: formData.difficulty === 'Facile' ? 1 : formData.difficulty === 'Moyen' ? 2 : 3,
      };

      // Appeler l'API backend
      const createdQuestion = await qcmApi.createQuestion(questionData);

      // Mapper la question créée au format UI
      const newQuestion: Question = {
        id: parseInt(createdQuestion.id) || 0,
        type: 'QCM',
        category: createdQuestion.category,
        text: createdQuestion.question,
        difficulty: createdQuestion.difficulty === 'easy' ? 'Facile' : createdQuestion.difficulty === 'medium' ? 'Moyen' : 'Difficile',
        sessions: 0,
        choices: createdQuestion.options,
        correctAnswer: createdQuestion.correctAnswer || 0,
      };

      setQuestions([...questions, newQuestion]);
      setIsAdding(false);
      setFormData({
        type: 'QCM',
        category: '',
        text: '',
        difficulty: 'Facile',
        choices: ['', '', '', ''],
        correctAnswer: 0
      });
    } catch (err: any) {
      console.error('Erreur lors de la création de la question:', err);
      alert('Erreur lors de la création de la question: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await qcmApi.deleteQuestion(String(id));
        setQuestions(questions.filter(q => q.id !== id));
      } catch (err: any) {
        console.error('Erreur lors de la suppression de la question:', err);
        alert('Erreur lors de la suppression: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toString().includes(searchQuery);
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = Array.from(new Set(questions.map(q => q.category)));

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des questions...</p>
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Banque de Questions</h1>
          <p className="text-gray-500 mt-2">{filteredQuestions.length} question{filteredQuestions.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border-2 font-bold rounded-lg transition-colors ${
              showFilters
                ? 'border-ioai-blue bg-blue-50 text-ioai-blue'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" /> Filtrer
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-ioai-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-sm"
          >
            <Plus size={18} className="mr-2" /> Ajouter Question
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filtres avancés</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Difficulté</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green"
              >
                <option value="all">Toutes</option>
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green"
              >
                <option value="all">Toutes</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDifficultyFilter('all');
                  setCategoryFilter('all');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout */}
      {isAdding && (
        <div className="bg-white p-8 rounded-2xl border-2 border-ioai-green shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle question</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'QCM' | 'Texte' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green"
                >
                  <option value="QCM">QCM</option>
                  <option value="Texte">Texte libre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Maths - Algèbre"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Question *</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Énoncé de la question..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green"
              />
            </div>

            {formData.type === 'QCM' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Choix de réponses</label>
                <div className="space-y-3">
                  {formData.choices?.map((choice, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="radio"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                        className="mt-3"
                      />
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => {
                          const newChoices = [...(formData.choices || [])];
                          newChoices[index] = e.target.value;
                          setFormData({ ...formData, choices: newChoices });
                        }}
                        placeholder={`Choix ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Difficulté *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Question['difficulty'] })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ioai-green"
              >
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all"
            >
              <Save size={20} />
              Enregistrer
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              <X size={20} />
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par texte, ID ou catégorie..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-transparent focus:bg-white focus:ring-2 focus:ring-ioai-green focus:border-transparent outline-none transition-all placeholder-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider self-center mr-2">Vue :</span>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded ${viewMode === 'table' ? 'bg-ioai-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-ioai-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredQuestions.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-16">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Question</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Difficulté</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{q.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 line-clamp-1">{q.text}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">{q.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{q.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                        q.difficulty === 'Facile' ? 'bg-green-400' :
                        q.difficulty === 'Moyen' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></span>
                      <span className="text-sm text-gray-600">{q.difficulty}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => alert(`Modifier question #${q.id}`)}
                        className="p-2 text-gray-400 hover:text-ioai-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune question trouvée.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-ioai-green hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-mono text-gray-400">#{q.id}</span>
                <span className={`inline-block w-3 h-3 rounded-full ${
                  q.difficulty === 'Facile' ? 'bg-green-400' :
                  q.difficulty === 'Moyen' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></span>
              </div>
              <p className="font-medium text-gray-900 mb-3 line-clamp-2">{q.text}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{q.category}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">{q.type}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Modifier question #${q.id}`)}
                  className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune question trouvée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

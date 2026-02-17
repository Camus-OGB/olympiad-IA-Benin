'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Search, Tag, Newspaper, ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { contentApi, NewsItem } from '@/lib/api/content';

const NewsPage: React.FC = () => {
    const [articles, setArticles] = useState<NewsItem[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<NewsItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tout');
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['Tout']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // Charger les actualités depuis l'API
        const fetchNews = async () => {
            try {
                const newsData = await contentApi.getNews({
                    publishedOnly: true
                });
                setArticles(newsData);
                setFilteredArticles(newsData);

                // Extraire les catégories uniques
                const uniqueCategories = Array.from(
                    new Set(newsData.map(n => n.category).filter(Boolean))
                ) as string[];
                setCategories(['Tout', ...uniqueCategories]);
            } catch (error) {
                console.error('Erreur lors du chargement des actualités:', error);
                setArticles([]);
                setFilteredArticles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    useEffect(() => {
        // Filtrer les articles selon la catégorie et la recherche
        let filtered = articles;

        if (selectedCategory !== 'Tout') {
            filtered = filtered.filter(a => a.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.content.toLowerCase().includes(query) ||
                (a.excerpt && a.excerpt.toLowerCase().includes(query))
            );
        }

        setFilteredArticles(filtered);
    }, [searchQuery, selectedCategory, articles]);

    // Fermer le dropdown quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);
    return (
        <div className="bg-[#f8f9fc] min-h-screen pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-ioai-green font-bold text-xs uppercase tracking-[0.2em] mb-3 block flex items-center justify-center gap-2">
                        <Newspaper size={14} /> Blog &amp; Presse
                    </span>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">Actualités</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Restez informés sur la compétition, les résultats et l&apos;actualité de l&apos;IA au Bénin et en Afrique.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="card rounded-2xl p-4 mb-12 flex flex-col md:flex-row gap-3 justify-between items-center shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher un article..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-ioai-green/20 outline-none text-sm transition-all"
                        />
                    </div>

                    {/* Dropdown des catégories */}
                    <div className="relative w-full md:w-48 dropdown-container">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-ioai-green/30 transition-all flex items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-ioai-green" />
                                {selectedCategory}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                                            selectedCategory === category
                                                ? 'bg-ioai-green text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="col-span-full text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ioai-green mx-auto mb-4"></div>
                        <p className="text-gray-500">Chargement des actualités...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.length === 0 ? (
                            <div className="col-span-full text-center py-16">
                                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400 mb-2">
                                    Aucun article trouvé
                                </h3>
                                <p className="text-gray-400">
                                    {searchQuery || selectedCategory !== 'Tout'
                                        ? 'Essayez de modifier vos filtres'
                                        : 'Aucune actualité disponible pour le moment'}
                                </p>
                            </div>
                        ) : (
                            filteredArticles.map((article) => {
                                // Formater la date
                                const date = article.publishedAt || article.createdAt;
                                const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });

                                // Si lien externe → ouvrir dans un nouvel onglet, sinon page interne
                                const isExternal = !!article.externalUrl;
                                const cardHref = isExternal ? article.externalUrl! : `/actualites/${article.id}`;

                                const cardContent = (
                                    <article className="card overflow-hidden group hover:shadow-xl transition-all duration-300 h-full">
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={article.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1920&auto=format&fit=crop'}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                                {article.category && (
                                                    <span className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-white/50">
                                                        <Tag className="w-3 h-3 text-ioai-green" /> {article.category}
                                                    </span>
                                                )}
                                                {isExternal && (
                                                    <span className="bg-blue-600/90 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <ExternalLink className="w-3 h-3" /> Presse
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-7">
                                            <div className="flex items-center text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">
                                                <Calendar className="w-3.5 h-3.5 mr-2 text-ioai-green" /> {formattedDate}
                                            </div>
                                            <h2 className="text-xl font-display font-bold text-gray-900 mb-3 leading-tight group-hover:text-ioai-green transition-colors">
                                                {article.title}
                                            </h2>
                                            <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                                {article.excerpt || article.content.substring(0, 150) + '...'}
                                            </p>
                                            <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                                                <span className="text-gray-900 font-bold text-sm flex items-center group/btn">
                                                    {isExternal ? (
                                                        <>Lire l&apos;article original <ExternalLink className="w-4 h-4 ml-2" /></>
                                                    ) : (
                                                        <>Lire l&apos;article <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );

                                return isExternal ? (
                                    <a
                                        key={article.id}
                                        href={cardHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        {cardContent}
                                    </a>
                                ) : (
                                    <Link
                                        key={article.id}
                                        href={cardHref}
                                        className="block"
                                    >
                                        {cardContent}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;

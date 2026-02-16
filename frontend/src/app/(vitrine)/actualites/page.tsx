'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Search, Tag, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { type BlogArticle, getPublishedArticles, getArticlesByCategory, searchArticles } from '@/lib/api/blog';

const NewsPage: React.FC = () => {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<BlogArticle[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tout');

    useEffect(() => {
        // Charger les articles publiés
        const loadedArticles = getPublishedArticles();
        setArticles(loadedArticles);
        setFilteredArticles(loadedArticles);
    }, []);

    useEffect(() => {
        // Filtrer les articles selon la catégorie et la recherche
        let filtered = articles;

        if (selectedCategory !== 'Tout') {
            filtered = getArticlesByCategory(selectedCategory);
        }

        if (searchQuery) {
            filtered = searchArticles(searchQuery);
            if (selectedCategory !== 'Tout') {
                filtered = filtered.filter(a => a.category === selectedCategory);
            }
        }

        setFilteredArticles(filtered);
    }, [searchQuery, selectedCategory, articles]);
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
                <div className="card rounded-2xl p-4 mb-12 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
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
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {['Tout', 'Annonce', 'Résultats', 'Formation', 'Presse', 'Analyse', 'Interview'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedCategory(tag)}
                                className={`px-5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === tag
                                    ? 'bg-ioai-green text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-ioai-green/30 hover:text-ioai-green'
                                }`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
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
                        filteredArticles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/actualites/${article.slug}`}
                                className="block"
                            >
                                <article className="card overflow-hidden group hover:shadow-xl transition-all duration-300 h-full">
                                    <div className="relative h-56 overflow-hidden">
                                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-white/50">
                                            <Tag className="w-3 h-3 text-ioai-green" /> {article.category}
                                        </span>
                                    </div>
                                    <div className="p-7">
                                        <div className="flex items-center text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">
                                            <Calendar className="w-3.5 h-3.5 mr-2 text-ioai-green" /> {article.date}
                                        </div>
                                        <h2 className="text-xl font-display font-bold text-gray-900 mb-3 leading-tight group-hover:text-ioai-green transition-colors">
                                            {article.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                                        <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-gray-900 font-bold text-sm flex items-center group/btn">
                                                Lire l'article <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsPage;

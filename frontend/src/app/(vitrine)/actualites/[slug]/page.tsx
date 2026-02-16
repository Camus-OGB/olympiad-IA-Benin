'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Tag, ArrowLeft, Share2, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { type BlogArticle, getArticleBySlug } from '@/lib/api/blog';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const foundArticle = getArticleBySlug(slug);
      setArticle(foundArticle);
      setLoading(false);
    }
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-white min-h-screen pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="py-16">
            <h1 className="text-4xl font-display font-black text-gray-900 mb-4">
              Article non trouvé
            </h1>
            <p className="text-gray-600 mb-8">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour aux actualités
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculer le temps de lecture estimé (environ 200 mots par minute)
  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="bg-white min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bouton retour */}
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-ioai-green font-semibold mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour aux actualités
        </Link>

        {/* En-tête de l'article */}
        <article>
          {/* Catégorie */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-ioai-green/10 text-ioai-green rounded-lg font-bold text-sm border border-ioai-green/20">
              <Tag size={16} />
              {article.category}
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-ioai-green" />
              <span className="font-semibold">{article.date}</span>
            </div>

            {article.author && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-ioai-green" />
                <span className="font-semibold">{article.author}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-ioai-green" />
              <span className="font-semibold">{readingTime} min de lecture</span>
            </div>

            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              <Share2 size={16} />
              Partager
            </button>
          </div>

          {/* Image principale */}
          {article.image && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Extrait */}
          <div className="mb-8 p-6 bg-gray-50 border-l-4 border-ioai-green rounded-r-xl">
            <p className="text-lg text-gray-700 leading-relaxed font-medium italic">
              {article.excerpt}
            </p>
          </div>

          {/* Contenu principal */}
          <div className="prose prose-lg max-w-none mb-12">
            <div
              className="ProseMirror"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-12 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Mots-clés
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:border-ioai-green hover:text-ioai-green transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-8 border-t border-gray-200">
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ioai-green text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={20} />
              Voir toutes les actualités
            </Link>
          </div>
        </article>

      </div>
    </div>
  );
}

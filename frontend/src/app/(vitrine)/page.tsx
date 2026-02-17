'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Trophy, Users, Brain, MapPin, Sparkles, Zap, Target, ChevronRight, Quote, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { contentApi, NextDeadline, NewsItem, Testimonial } from '@/lib/api/content';

// Pas de données par défaut - on utilise uniquement les vraies données de la base

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1920&auto=format&fit=crop",
    title: "Compétition Nationale",
    
  },
  {
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop",
    title: "Formation Intensive",
    
  },
  {
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1920&auto=format&fit=crop",
    title: "Finale Internationale",
    
  },
  {
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1920&auto=format&fit=crop",
    title: "Lauréats 2025",
    
  }
];

const Home: React.FC = () => {
  const [candidateCount, setCandidateCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [nextDeadline, setNextDeadline] = useState<NextDeadline | null>(null);
  const [deadlineLoading, setDeadlineLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<GeneralTestimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestPastEditionId, setLatestPastEditionId] = useState<string | null>(null);

  // Charger la dernière édition passée pour le lien dynamique
  useEffect(() => {
    contentApi.getPastEditions()
      .then(data => {
        if (data.length > 0) {
          const latest = [...data].sort((a, b) => b.year - a.year)[0];
          setLatestPastEditionId(latest.id);
        }
      })
      .catch(() => {});
  }, []);

  // Charger les statistiques publiques (nombre de candidats)
  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const stats = await contentApi.getPublicStats();
        setCandidateCount(stats.totalCandidates);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Garder la valeur par défaut 0
      }
    };

    fetchPublicStats();

    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchPublicStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Charger les actualités depuis l'API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await contentApi.getNews({
          publishedOnly: true,
          limit: 3
        });
        setNews(newsData);
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Charger les partenaires depuis l'API
  // Charger les témoignages depuis l'API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const testimonialsData = await contentApi.getAllTestimonials();
        // Filtrer les témoignages avec contenu valide
        setTestimonials(testimonialsData.filter(t => t.content?.trim() && t.authorName?.trim()));
      } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Charger la prochaine deadline depuis l'API
  useEffect(() => {
    const fetchNextDeadline = async () => {
      try {
        const deadline = await contentApi.getNextDeadline();
        setNextDeadline(deadline);
      } catch (error) {
        console.error('Erreur lors du chargement de la prochaine deadline:', error);
      } finally {
        setDeadlineLoading(false);
      }
    };

    fetchNextDeadline();
  }, []);

  // Compte à rebours dynamique basé sur nextDeadline
  useEffect(() => {
    if (!nextDeadline?.targetDate) {
      return;
    }

    const targetDate = new Date(nextDeadline.targetDate).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextDeadline]);

  // Auto-scroll des témoignages
  useEffect(() => {
    if (testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials]);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative w-full min-h-[90vh] lg:min-h-[85vh] overflow-hidden">
        {/* Dynamic Background Slideshow */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === heroSlideIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-ioai-blue/60 via-ioai-blue/60 to-ioai-blue/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {heroSlides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setHeroSlideIndex(index)}
              className={`group flex items-center gap-2 transition-all duration-300 ${
                index === heroSlideIndex ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
            >
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                index === heroSlideIndex ? 'w-8 bg-white' : 'w-3 bg-white/50'
              }`}></div>
            </button>
          ))}
        </div>



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-24 lg:pt-40 lg:pb-32">
          <div className="flex flex-col items-center text-center">

            {/* Hero Content - Centré */}
            <div className="max-w-4xl">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-tight">
                Olympiades d&apos;Intelligence Artificielle
                <span className="block text-ioai-green mt-2">Bénin 2026</span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto">
                Participez aux sélections nationales et représentez le Bénin à l&apos;Olympiade Africaine d&apos;IA à Sousse, Tunisie.
              </p>

              <div className="flex flex-wrap gap-4 mb-10 justify-center">
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/20">
                  <Users className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">{candidateCount}</div>
                    <div className="text-xs text-white/70">Candidats inscrits</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/20">
                  <Trophy className="w-6 h-6 text-benin-yellow" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">4</div>
                    <div className="text-xs text-white/70">Places en finale</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/20">
                  <Calendar className="w-6 h-6 text-ioai-green" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
                    <div className="text-xs text-white/70">Jours restants</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/inscription" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-ioai-green hover:bg-green-600 text-white font-bold text-lg shadow-xl shadow-ioai-green/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                  S&apos;inscrire maintenant
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
                <Link href="/edition/2026" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white font-bold text-lg transition-all">
                  Découvrir l&apos;édition
                  <ChevronRight className="ml-2 w-6 h-6" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== COUNTDOWN DYNAMIQUE ==================== */}
      {!deadlineLoading && nextDeadline && (
        <section className="py-12 bg-ioai-blue">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                {/* Badge de statut */}
                <div className="inline-flex items-center gap-2 mb-3">
                  {nextDeadline.targetType === 'start' && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-bold rounded-full border border-blue-400/30">
                      ⏳ À venir
                    </span>
                  )}
                  {nextDeadline.targetType === 'end' && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-200 text-xs font-bold rounded-full border border-red-400/30">
                      🔥 En cours
                    </span>
                  )}
                </div>

                {/* Titre dynamique */}
                <h3 className="text-xl sm:text-2xl font-display font-black text-white">
                  {nextDeadline.targetType === 'start'
                    ? `${nextDeadline.phaseTitle.toUpperCase()} DANS`
                    : `CLÔTURE ${nextDeadline.phaseTitle.toUpperCase()} DANS`
                  }
                </h3>

                {/* Description */}
                {nextDeadline.phaseDescription && (
                  <p className="text-white/70 text-sm mt-2">{nextDeadline.phaseDescription}</p>
                )}

                {/* Phase en cours (si différente) */}
                {nextDeadline.currentPhase && (
                  <p className="text-white/60 text-xs mt-2">
                    🔴 En cours : {nextDeadline.currentPhase.title}
                  </p>
                )}
              </div>

              {/* Compte à rebours */}
              <div className="flex justify-center gap-3">
                {[
                  { val: timeLeft.days, label: 'Jours' },
                  { val: timeLeft.hours, label: 'Heures' },
                  { val: timeLeft.minutes, label: 'Min' },
                  { val: timeLeft.seconds, label: 'Sec' }
                ].map((t, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-4 min-w-[70px] text-center">
                    <span className="block font-bold text-3xl text-white">{String(t.val).padStart(2, '0')}</span>
                    <span className="text-xs text-white/70 mt-1 block">{t.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA adapté selon la phase */}
              {nextDeadline.phaseTitle.toLowerCase().includes('inscription') && nextDeadline.targetType === 'end' && (
                <Link href="/auth/inscription" className="inline-flex items-center px-6 py-3 bg-white text-ioai-blue font-bold rounded-lg hover:bg-gray-100 transition-colors">
                  S&apos;inscrire maintenant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Message si aucune deadline */}
      {!deadlineLoading && !nextDeadline && (
        <section className="py-12 bg-ioai-blue">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-white/80 text-lg">
              📅 Restez connectés pour la prochaine édition !
            </p>
          </div>
        </section>
      )}

      {/* ==================== PARCOURS 2026 - TIMELINE ==================== */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ioai-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ioai-blue/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ioai-blue/10 text-ioai-blue font-bold text-sm mb-4 border border-ioai-blue/20">
              <Trophy className="w-4 h-4" />
              Prochains objectifs
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-ioai-blue mb-4">
              Après les sélections nationales
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Les meilleurs candidats représenteront le Bénin sur la scène africaine puis mondiale
            </p>
          </div>

          {/* Grille des olympiades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

            {/* Olympiade Africaine */}
            <div className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              {/* Image de fond sur toute la carte - Sousse, Tunisie */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585137019279-e37c152a2e7f?w=1200')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white/95"></div>
              </div>

              {/* Header avec gradient et pattern */}
              <div className="relative h-48 bg-gradient-to-br from-ioai-blue via-blue-600 to-blue-800 overflow-hidden z-10">
                {/* Image de fond du header - Méditerranée et architecture tunisienne */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585137019279-e37c152a2e7f?w=1200')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity duration-500"></div>

                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>

                {/* Icône principale */}
                <div className="relative h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/40 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="relative p-8 z-10">
                <h3 className="text-3xl font-black text-ioai-blue mb-6">Olympiade Africaine</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-ioai-blue/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-ioai-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Lieu</p>
                      <p className="text-lg font-bold text-gray-900">Sousse, Tunisie 🇹🇳</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-ioai-blue/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-ioai-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Date</p>
                      <p className="text-lg font-bold text-gray-900">9 - 12 Avril 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Olympiade Mondiale */}
            <div className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              {/* Image de fond sur toute la carte - Abu Dhabi */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white/95"></div>
              </div>

              {/* Badge */}
              <div className="absolute top-6 right-6 z-20 bg-ioai-blue text-white px-4 py-2 rounded-full text-xs font-black uppercase shadow-lg flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Objectif final
              </div>

              {/* Header avec gradient et pattern */}
              <div className="relative h-48 bg-gradient-to-br from-benin-yellow via-yellow-500 to-yellow-600 overflow-hidden z-10">
                {/* Image de fond du header - Skyline d'Abu Dhabi */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200')] bg-cover bg-center mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity duration-500"></div>

                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>

                {/* Icône principale */}
                <div className="relative h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Trophy className="w-14 h-14 text-white" />
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="relative p-8 z-10">
                <h3 className="text-3xl font-black text-gray-900 mb-6">Olympiade Mondiale</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-benin-yellow/10 hover:bg-benin-yellow/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-benin-yellow/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Lieu</p>
                      <p className="text-lg font-bold text-gray-900">Abu Dhabi, UAE 🇦🇪</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-benin-yellow/10 hover:bg-benin-yellow/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-benin-yellow/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Date</p>
                      <p className="text-lg font-bold text-gray-900">2 - 8 Août 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/edition/2026"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-ioai-blue to-blue-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              Voir le calendrier complet
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== ACCÈS RAPIDES ==================== */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ioai-green/10 text-ioai-green font-bold text-xs uppercase tracking-wider mb-4 border border-ioai-green/20">
              <Target className="w-3.5 h-3.5" />
              Navigation Rapide
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-ioai-blue mb-4">Accès rapides</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Trouvez rapidement l&apos;information que vous cherchez.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <Link
              href="/auth/inscription"
              className="group relative bg-white rounded-2xl p-8 text-center shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:shadow-ioai-green/10 border border-gray-100 hover:border-ioai-green/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ioai-green via-teal-400 to-ioai-green"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-ioai-green/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-ioai-green to-teal-500 flex items-center justify-center shadow-lg shadow-ioai-green/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ioai-blue mb-3">Inscription</h3>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                  Créez votre compte et rejoignez la compétition nationale
                </p>
                <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ioai-green to-teal-500 text-white font-bold rounded-xl shadow-md shadow-ioai-green/20 group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all">
                  S&apos;inscrire <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link
              href="/bilan"
              className="group relative bg-white rounded-2xl p-8 text-center shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:shadow-benin-yellow/10 border border-gray-100 hover:border-benin-yellow/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-benin-yellow via-yellow-400 to-benin-yellow"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-benin-yellow/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-benin-yellow to-yellow-500 flex items-center justify-center shadow-lg shadow-benin-yellow/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ioai-blue mb-3">Résultats 2025</h3>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                  Consultez les performances de notre équipe à Beijing
                </p>
                <span className="inline-flex items-center text-benin-yellow font-bold group-hover:text-yellow-600 transition-colors">
                  Voir les résultats <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link
              href="/faq"
              className="group relative bg-white rounded-2xl p-8 text-center shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:shadow-ioai-blue/10 border border-gray-100 hover:border-ioai-blue/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ioai-blue via-blue-400 to-ioai-blue"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-ioai-blue/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-ioai-blue to-blue-600 flex items-center justify-center shadow-lg shadow-ioai-blue/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ioai-blue mb-3">FAQ</h3>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                  Réponses aux questions fréquemment posées
                </p>
                <span className="inline-flex items-center text-ioai-blue font-bold group-hover:text-blue-600 transition-colors">
                  Consulter la FAQ <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== ACTUALITÉS ==================== */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-benin-red/10 text-benin-red font-bold text-xs uppercase tracking-wider mb-3 border border-benin-red/20">
                <Sparkles className="w-3.5 h-3.5" />
                Actualités
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-black text-ioai-blue">Dernières nouvelles</h2>
            </div>
            <Link href="/actualites" className="group inline-flex items-center px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-ioai-blue font-semibold text-sm hover:border-ioai-green hover:text-ioai-green shadow-sm hover:shadow-md transition-all">
              Voir toutes les actualités <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {newsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des actualités...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Aucune actualité pour le moment</p>
              <p className="text-gray-500 text-sm mt-2">Revenez bientôt pour découvrir nos dernières nouvelles !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {news.map((newsItem, index) => {
                // Formater la date pour l'affichage
                const displayDate = newsItem.publishedAt
                  ? new Date(newsItem.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date(newsItem.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

                return (
                  <article key={newsItem.id} className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-100/50 hover:shadow-2xl border border-gray-100 hover:border-ioai-green/20 transition-all duration-300 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                    <div className={`relative overflow-hidden ${index === 0 ? 'h-64 md:h-full' : 'h-48'}`}>
                      <img
                        src={newsItem.imageUrl || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop'}
                        alt={newsItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <span className="absolute top-4 left-4 bg-gradient-to-r from-ioai-green to-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-lg">
                        {newsItem.category || 'Actualité'}
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <div className="flex items-center text-xs text-white/80 font-medium mb-2">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" /> {displayDate}
                        </div>
                        <h3 className={`font-bold text-white mb-2 leading-snug group-hover:text-ioai-green transition-colors ${index === 0 ? 'text-xl md:text-2xl' : 'text-base'}`}>
                          {newsItem.title}
                        </h3>
                        {index === 0 && newsItem.excerpt && (
                          <p className="text-sm text-white/80 line-clamp-2 hidden md:block">{newsItem.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ==================== TÉMOIGNAGES ==================== */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ioai-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ioai-blue/5 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block text-ioai-green font-bold text-sm uppercase tracking-wider mb-3">
              Témoignages
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-ioai-blue mb-4">
              Ils ont vécu l&apos;expérience
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Les lauréats 2025 partagent leur parcours inspirant à Beijing.
            </p>
          </div>

          {/* Slider principal */}
          {testimonialsLoading ? (
            <div className="card relative overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className="px-6 sm:px-10 py-10 sm:py-12 relative z-10 text-center">
                <p className="text-gray-500">Chargement des témoignages...</p>
              </div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="card relative overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className="px-6 sm:px-10 py-10 sm:py-12 relative z-10 text-center">
                <p className="text-gray-500">Aucun témoignage disponible pour le moment.</p>
              </div>
            </div>
          ) : (
            <div className="card relative overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-ioai-green/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-ioai-blue/5 rounded-full blur-2xl" />

              <div className="px-6 sm:px-10 py-10 sm:py-12 relative z-10">
                <Quote className="w-10 h-10 text-ioai-green/15 mb-6" />

                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-8 italic">
                  &ldquo;{testimonials[currentIndex].content}&rdquo;
                </p>

                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-ioai-green/40 shadow-md">
                        <img
                          src={testimonials[currentIndex].photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop'}
                          alt={testimonials[currentIndex].authorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ioai-green flex items-center justify-center shadow-md">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-ioai-blue text-lg">
                        {testimonials[currentIndex].authorName}
                      </h4>
                      <p className="text-sm text-ioai-green font-semibold">
                        {testimonials[currentIndex].authorRole || 'Participant'}
                      </p>
                      {testimonials[currentIndex].organization && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {testimonials[currentIndex].organization}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contrôles slider */}
                  <div className="flex flex-col items-center gap-3 sm:items-end">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Témoignage précédent"
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev === 0 ? testimonials.length - 1 : prev - 1
                          )
                        }
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-ioai-blue hover:bg-ioai-blue hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Témoignage suivant"
                        onClick={() =>
                          setCurrentIndex((prev) => (prev + 1) % testimonials.length)
                        }
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-ioai-blue hover:bg-ioai-blue hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {testimonials.map((t, index) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCurrentIndex(index)}
                          className={`h-2.5 rounded-full transition-all ${
                            index === currentIndex
                              ? 'w-7 bg-ioai-blue'
                              : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Afficher le témoignage de ${t.authorName}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photo de groupe des lauréats */}
          <div className="card overflow-hidden hover:shadow-2xl transition-all duration-500 group mt-10">
            <div className="relative h-64">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop"
                alt="Équipe des lauréats 2025"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ioai-blue/80 via-ioai-blue/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-display font-black mb-1">
                      Équipe Bénin 2025
                    </h3>
                    <p className="text-white/90 text-sm">
                      4 talents représentant le Bénin à Beijing
                    </p>
                  </div>
                  <Link
                    href={latestPastEditionId ? `/bilan/${latestPastEditionId}` : '/bilan'}
                    className="inline-flex items-center px-6 py-3 bg-white text-ioai-blue font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group/btn"
                  >
                    Découvrir l&apos;équipe
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-ioai-blue via-blue-700 to-ioai-blue"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-ioai-green/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-benin-yellow/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="neural-grid"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 font-bold text-sm mb-6 border border-white/20 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-benin-yellow" />
            Inscriptions ouvertes
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-black mb-6 leading-tight">
            Prêt à rejoindre<br />
            <span className="bg-gradient-to-r from-ioai-green via-teal-300 to-benin-yellow bg-clip-text text-transparent">l&apos;aventure IA ?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Les inscriptions pour l&apos;édition 2026 sont ouvertes. Ne manquez pas cette opportunité unique de représenter le Bénin sur la scène internationale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/inscription" className="group inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-gradient-to-r from-benin-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg shadow-2xl shadow-benin-red/30 hover:shadow-3xl hover:-translate-y-1 transition-all">
              <Zap className="w-5 h-5 mr-2" />
              S&apos;inscrire maintenant
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/edition/2026" className="group inline-flex items-center justify-center px-8 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all">
              En savoir plus
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

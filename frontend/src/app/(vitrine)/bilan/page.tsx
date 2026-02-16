'use client';

import React from 'react';
import { Trophy, Users, Award, TrendingUp, Calendar, MapPin, ArrowRight, BarChart3, Star, Globe, Flag, Sparkles, ChevronRight, Play, Quote } from 'lucide-react';
import Link from 'next/link';

const editions = [
  {
    year: '2025',
    title: 'IOAI 2025 - Beijing',
    subtitle: 'Première participation aux Internationales',
    location: 'Beijing, Chine',
    flag: '🇨🇳',
    date: 'Août 2025',
    participants: '700+',
    finalists: '4',
    ranking: '30ème / 87',
    medals: '1 Mention Honorable',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800&auto=format&fit=crop',
    status: 'completed',
    slug: '2025',
    type: 'IOAI',
    highlights: ['Première participation du Bénin à l\'IOAI', 'Mention Honorable obtenue', '30ème sur 87 pays']
  },
];

const globalStats = {
  totalParticipants: '700+',
  editions: '1',
  medals: '1',
  bestRanking: '30ème',
  countries: '87'
};

// Statistiques comparatives par édition
const comparativeStats = [
  { metric: 'Candidats inscrits', '2025': '700+', evolution: null },
  { metric: 'Finalistes sélectionnés', '2025': '4', evolution: null },
  { metric: 'Classement mondial', '2025': '30ème / 87', evolution: null },
  { metric: 'Médailles obtenues', '2025': '1', evolution: null },
  { metric: 'Taux de réussite QCM', '2025': '12%', evolution: null },
];

// Témoignages des participants
const testimonials = [
  {
    name: 'Merveille Agbossaga',
    role: 'Lauréate IOAI 2025 — Mention Honorable',
    edition: '2025',
    quote: 'Cette expérience à Beijing a complètement changé ma vision de l\'IA. J\'ai compris que nous, jeunes Africains, pouvons créer des solutions innovantes pour notre continent.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop',
    videoUrl: null
  },
  {
    name: 'Dona Ahouansou',
    role: 'Finaliste IOAI 2025',
    edition: '2025',
    quote: 'Le bootcamp à Sèmè City était intense mais incroyable. En deux semaines, j\'ai appris plus qu\'en une année entière. C\'est là que tout s\'est joué.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
    videoUrl: 'https://youtube.com/watch?v=example1'
  },
  {
    name: 'Déreck M\'po Yeti',
    role: 'Finaliste IOAI 2025',
    edition: '2025',
    quote: 'Représenter le Bénin à Beijing était un honneur immense. Le code est un langage universel, et cette compétition n\'est que le début de notre parcours.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    videoUrl: null
  },
  {
    name: 'Sarah Koudjo',
    role: 'Finaliste IOAI 2025',
    edition: '2025',
    quote: 'Les filles peuvent exceller en IA ! J\'encourage toutes les lycéennes béninoises à tenter leur chance. Cette aventure m\'a ouvert des portes incroyables.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    videoUrl: 'https://youtube.com/watch?v=example2'
  }
];

const BilanPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-ioai-blue"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
              Bilan des Éditions
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
              Découvrez l&apos;histoire des Olympiades d&apos;Intelligence Artificielle du Bénin à travers nos participations internationales.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                { value: globalStats.totalParticipants, label: 'Participants' },
                { value: globalStats.editions, label: 'Édition IOAI' },
                { value: globalStats.medals, label: 'Médaille' },
                { value: globalStats.bestRanking, label: 'Meilleur rang' },
                { value: globalStats.countries, label: 'Pays' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Toutes les Éditions */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
              Toutes les Éditions
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explorez chaque édition pour découvrir les résultats et les moments forts.
            </p>
          </div>

          {/* Éditions passées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {editions.map((edition, idx) => (
              <Link
                key={idx}
                href={`/edition/${edition.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 h-full">
                  {/* Image Header */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={edition.image}
                      alt={edition.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 bg-ioai-green text-white text-xs font-bold rounded-lg">
                        ✓ {edition.type}
                      </span>
                      <span className="text-2xl">{edition.flag}</span>
                    </div>
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white/70 text-sm font-medium mb-1">{edition.subtitle}</p>
                      <h3 className="text-white font-display font-black text-2xl">{edition.title}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Location & Date */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-ioai-green" />
                        <span className="font-medium">{edition.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-ioai-blue" />
                        <span className="font-medium">{edition.date}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-gray-900">{edition.participants}</div>
                        <div className="text-xs text-gray-500">Candidats</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-gray-900">{edition.finalists}</div>
                        <div className="text-xs text-gray-500">Finalistes</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-gray-900">30è</div>
                        <div className="text-xs text-gray-500">Rang</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-gray-900">1</div>
                        <div className="text-xs text-gray-500">Médaille</div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2 mb-6">
                      {edition.highlights.map((highlight: string, hIdx: number) => (
                        <div key={hIdx} className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-benin-yellow" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-ioai-green">
                        Voir les détails
                      </span>
                      <ArrowRight className="w-4 h-4 text-ioai-green" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            <Link href="/edition/2026" className="group block">
              <div className="bg-ioai-blue rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="p-8 h-full flex flex-col justify-center text-center min-h-[400px]">
                  
                  <h3 className="text-3xl font-display font-black text-white mb-3">Édition 2026</h3>
                  <p className="text-white/80 text-sm mb-2">Première Olympiade Africaine d&apos;IA</p>
                  <p className="text-white/70 mb-2">🇹🇳 Sousse, Tunisie</p>
                  <p className="text-white/60 text-sm mb-6">9 - 12 Avril 2026</p>
                  
                  <span className="inline-flex items-center justify-center px-6 py-3 bg-white text-ioai-blue font-bold rounded-lg group-hover:bg-gray-100 transition-colors mx-auto">
                    Découvrir l&apos;édition
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
              Notre parcours
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              De notre première participation à l&apos;IOAI 2025 à Beijing jusqu&apos;à l&apos;AOAI 2026 en Tunisie.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-ioai-blue via-ioai-green to-benin-yellow rounded-full hidden md:block"></div>
            
            <div className="space-y-12">
              {/* 2025 - IOAI Beijing */}
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 md:text-right md:pr-12">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <p className="text-ioai-blue font-bold text-sm mb-2">Août 2025</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">IOAI 2025 — Beijing, Chine</h3>
                    <p className="text-gray-600 text-sm">Première participation historique du Bénin aux Olympiades Internationales d&apos;IA. 30ème sur 87 pays avec une Mention Honorable.</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-ioai-blue rounded-full flex items-center justify-center text-white font-bold shadow-lg hidden md:flex ring-4 ring-ioai-blue/20">
                  🇨🇳
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* 2026 - AOAI Tunisie */}
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-ioai-green rounded-full flex items-center justify-center text-white font-bold shadow-lg hidden md:flex ring-4 ring-ioai-green/20">
                  🇹🇳
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <p className="text-ioai-green font-bold text-sm mb-2">Avril 2026</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">1ère AOAI — Sousse, Tunisie</h3>
                    <p className="text-gray-600 text-sm">Première édition de l&apos;Olympiade Africaine d&apos;IA. Le Bénin envoie ses 4 meilleurs talents.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques comparatives */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
              Statistiques par édition
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Évolution des performances du Bénin aux Olympiades d&apos;IA.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-ioai-blue text-white">
                  <th className="px-6 py-4 text-left font-bold">Métrique</th>
                  <th className="px-6 py-4 text-center font-bold">IOAI 2025</th>
                </tr>
              </thead>
              <tbody>
                {comparativeStats.map((stat, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-gray-900">{stat.metric}</td>
                    <td className="px-6 py-4 text-center font-bold text-ioai-blue">{stat['2025']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Les données de l&apos;AOAI 2026 seront ajoutées après la compétition.
          </p>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
              Témoignages des participants
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez les retours d&apos;expérience de nos champions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-ioai-blue">{testimonial.role}</p>
                  </div>
                </div>
                
                <blockquote className="text-gray-600 italic mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {testimonial.videoUrl && (
                  <a 
                    href={testimonial.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-ioai-green hover:text-green-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Voir le témoignage vidéo
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-ioai-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-black text-white mb-4">
            Prêt à participer ?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Inscrivez-vous aux sélections nationales pour représenter le Bénin à l&apos;AOAI 2026.
          </p>
          <Link
            href="/auth/inscription"
            className="inline-flex items-center px-6 py-3 bg-white text-ioai-blue font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            S&apos;inscrire <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default BilanPage;

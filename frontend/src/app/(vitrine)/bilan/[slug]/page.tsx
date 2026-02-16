'use client';

import React from 'react';
import { Medal, Award, ChevronRight, Quote, Calendar, Trophy, Sparkles, MapPin, Users, Target } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data pour les différentes éditions
const editionsData: Record<string, {
  year: string;
  title: string;
  location: string;
  date: string;
  participants: string;
  finalists: string;
  ranking: string;
  medals: string;
  totalCountries: string;
  teamMembers: Array<{
    name: string;
    school: string;
    role: string;
    quote: string;
    image: string;
  }>;
  timeline: Array<{
    date: string;
    title: string;
    desc: string;
  }>;
  images: {
    hero: string;
    gallery: string[];
  };
}> = {
  'edition-2025': {
    year: '2025',
    title: 'Édition 2025 - Beijing',
    location: 'Beijing, Chine',
    date: 'Août 2025',
    participants: '700+',
    finalists: '4',
    ranking: '30ème',
    medals: '1 Mention Honorable',
    totalCountries: '87',
    teamMembers: [
      {
        name: "Merveille Agbossaga",
        school: "Lycée Militaire de Jeunes Filles",
        role: "Mention Honorable",
        quote: "Représenter le Bénin à Beijing m'a prouvé que nous avons notre place.",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop"
      },
      {
        name: "Dona Ch. Ahouansou",
        school: "Collège Père Aupiais",
        role: "Finaliste National",
        quote: "Une aventure humaine et scientifique inoubliable.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop"
      },
      {
        name: "Déreck M'po Yeti",
        school: "Lycée Technique Coulibaly",
        role: "Finaliste National",
        quote: "Le code est un langage universel. Beijing n'était que le début.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
      },
      {
        name: "Ami-Odayé E. D. Koba",
        school: "Collège Notre Dame",
        role: "Finaliste National",
        quote: "J'ai appris plus en 3 mois de préparation qu'en une année entière.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
      }
    ],
    timeline: [
      { date: "Fév — Mars 2025", title: "Appel à candidatures", desc: "Plus de 700 inscrits." },
      { date: "15 Mars 2025", title: "Test de présélection", desc: "Épreuve théorique en ligne." },
      { date: "Avr — Juil 2025", title: "Formation Intensive", desc: "Bootcamps à Sèmè City." },
      { date: "Août 2025", title: "IOAI Beijing", desc: "Compétition mondiale en Chine." },
      { date: "Sept 2025", title: "Retour Triomphal", desc: "30ème mondial, 1 Mention Honorable." }
    ],
    images: {
      hero: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1920&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1547989453-11e67f438a31?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop"
      ]
    }
  }
  // Vous pouvez ajouter d'autres éditions ici avec la même structure
};

const EditionDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;

  // Récupérer les données de l'édition
  const edition = editionsData[slug];

  // Si l'édition n'existe pas, afficher une erreur
  if (!edition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-28">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black text-ioai-blue mb-4">Édition introuvable</h1>
          <p className="text-text-secondary mb-8">Cette édition n&apos;existe pas ou n&apos;a pas encore été ajoutée.</p>
          <Link href="/bilan" className="inline-flex items-center px-6 py-3 bg-ioai-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
            Retour aux archives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-ioai-dark-blue via-[#0d1830] to-black">
        <div className="absolute inset-0 opacity-10">
          <img
            src={edition.images.hero}
            alt={edition.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="neural-grid opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 font-bold text-sm mb-6 border border-white/20 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-benin-yellow" />
              Édition {edition.year}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
              {edition.location.split(',')[0]} {edition.year}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              {edition.year === '2025'
                ? "La première participation historique du Bénin aux Olympiades Internationales d'Intelligence Artificielle"
                : `Participation du Bénin à l'édition ${edition.year} des Olympiades Internationales d'Intelligence Artificielle`
              }
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-black text-white mb-1">{edition.participants}</div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Candidats</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-black text-white mb-1">{edition.finalists}</div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Finalistes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-black text-benin-yellow mb-1">{edition.ranking}</div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Mondial / {edition.totalCountries}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-black text-benin-yellow mb-1">{edition.medals.split(' ')[0]}</div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{edition.medals.split(' ').slice(1).join(' ')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informations Clés */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <MapPin className="w-12 h-12 text-ioai-blue mx-auto mb-4" />
              <h3 className="font-bold text-lg text-ioai-blue mb-2">Lieu</h3>
              <p className="text-text-secondary font-semibold">{edition.location}</p>
            </div>
            <div className="card p-6 text-center">
              <Calendar className="w-12 h-12 text-ioai-green mx-auto mb-4" />
              <h3 className="font-bold text-lg text-ioai-blue mb-2">Date</h3>
              <p className="text-text-secondary font-semibold">{edition.date}</p>
            </div>
            <div className="card p-6 text-center">
              <Users className="w-12 h-12 text-benin-yellow mx-auto mb-4" />
              <h3 className="font-bold text-lg text-ioai-blue mb-2">Participants</h3>
              <p className="text-text-secondary font-semibold">{edition.totalCountries} pays</p>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Globale */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-ioai-blue mb-4">
              {edition.year === '2025' ? 'Une première historique' : `Résultats ${edition.year}`}
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Le Bénin a marqué sa participation avec brio, se classant {edition.ranking} mondial et décrochant {edition.medals.toLowerCase()}.
            </p>
          </div>

          <div className="card p-8 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Résultats remarquables</h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  En {edition.year}, le Bénin a participé à l&apos;IOAI à {edition.location}. Plus de <strong className="text-gray-900">{edition.participants} jeunes</strong> ont répondu à l&apos;appel, et {edition.finalists} lycéens d&apos;exception ont représenté le pays avec fierté.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-ioai-green mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">{edition.ranking} position mondiale</div>
                      <div className="text-sm text-gray-500">Sur {edition.totalCountries} pays participants</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Medal className="w-5 h-5 text-benin-yellow mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">{edition.medals}</div>
                      <div className="text-sm text-gray-500">{edition.teamMembers[0]?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-ioai-blue mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">Performance exceptionnelle</div>
                      <div className="text-sm text-gray-500">{edition.year === '2025' ? 'Pour une première participation' : `Édition ${edition.year}`}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: edition.participants, label: "Candidats", accent: "card-accent-green" },
                  { value: edition.finalists, label: "Lauréats", accent: "card-accent-blue" },
                  { value: `${edition.ranking} / ${edition.totalCountries}`, label: "Mondial", accent: "card-accent-yellow" },
                  { value: edition.medals.split(' ')[0], label: edition.medals.split(' ').slice(1).join(' '), accent: "card-accent-red" }
                ].map((stat, i) => (
                  <div key={i} className={`card ${stat.accent} rounded-xl p-5 text-center`}>
                    <span className="stat-number text-gray-900">{stat.value}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1830] to-[#0a1628]"></div>
        <div className="neural-grid opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <span className="text-ioai-green font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Champions</span>
            <h2 className="text-3xl font-display font-bold text-white mb-3">L&apos;Équipe Bénin {edition.year}</h2>
            <p className="text-gray-400">Ils ont porté les couleurs du pays jusqu&apos;en {edition.location.split(',')[0]}.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {edition.teamMembers.map((m, idx) => (
              <div key={idx} className="card-dark rounded-xl p-6 text-center group">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <img src={m.image} alt={m.name} className="w-full h-full object-cover rounded-xl border-2 border-white/10 shadow-lg" />
                  {idx === 0 && edition.medals.includes('Mention') && (
                    <div className="absolute -bottom-1 -right-1 bg-benin-yellow text-white p-1.5 rounded-md shadow" title="Mention Honorable">
                      <Medal size={12} />
                    </div>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-0.5">{m.name}</h3>
                <p className="text-ioai-green text-[10px] font-bold uppercase tracking-wider mb-1">{m.role}</p>
                <p className="text-gray-500 text-[11px] mb-3">{m.school}</p>
                <div className="bg-white/5 rounded-lg p-3 relative">
                  <Quote className="w-3 h-3 text-white/15 absolute top-2 left-2" />
                  <p className="text-xs text-gray-400 italic">&ldquo;{m.quote}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Chronologie</span>
            <h2 className="text-3xl font-display font-bold text-gray-900">Le Parcours {edition.year}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-ioai-green/30 via-ioai-blue/20 to-gray-100"></div>
            {edition.timeline.map((event, i) => (
              <div key={i} className={`relative flex items-center justify-between mb-8 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className="w-5/12"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className="timeline-dot"></div>
                </div>
                <div className={`w-5/12 card p-5 rounded-xl ${i % 2 === 0 ? 'text-right' : ''}`}>
                  <span className="text-ioai-green font-bold text-xs uppercase mb-1 block tracking-wider">{event.date}</span>
                  <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-label">Galerie</span>
            <h2 className="text-3xl font-display font-bold text-gray-900">Souvenirs de {edition.location.split(',')[0]}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96">
            <div className="col-span-2 row-span-2 rounded-xl overflow-hidden relative group shadow-md">
              <img src={edition.images.gallery[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cérémonie" />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white font-bold text-sm">Cérémonie d&apos;ouverture</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-md group">
              <img src={edition.images.gallery[1]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Team" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md group">
              <img src={edition.images.gallery[2]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Coding" />
            </div>
            <div className="col-span-2 rounded-xl overflow-hidden relative shadow-md group">
              <img src={edition.images.gallery[3]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Award" />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white font-bold text-sm">Remise des prix</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="card-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-8 h-8 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl font-display font-black text-white mb-3">Suivre leurs traces en 2026</h2>
          <p className="text-white/70 mb-8 text-lg">Rejoignez la prochaine sélection nationale et représentez le Bénin</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/inscription" className="inline-flex items-center justify-center px-8 py-4 bg-white text-ioai-green font-bold rounded-lg shadow-lg hover:shadow-xl transition-all group">
              S&apos;inscrire maintenant <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/bilan" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-all">
              Voir toutes les éditions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EditionDetailPage;

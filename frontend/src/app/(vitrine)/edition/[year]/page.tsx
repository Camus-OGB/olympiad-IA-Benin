'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Sparkles, Brain, Users, Trophy, Globe, Target, Clock, Flag, Star, Zap, BookOpen, Award, Image, Newspaper, ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';

// Mock data pour les éditions
const editionsData: Record<string, any> = {
   '2026': {
      year: '2026',
      title: 'Édition 2026 — Sélection nationale',
      status: 'current',
      aoaiLocation: 'Sousse, Tunisie',
      aoaiDates: '9 - 12 Avril 2026',
      heroImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1920&auto=format&fit=crop',
      description: 'Première édition de l\'Olympiade Africaine d\'Intelligence Artificielle (AOAI). Le Bénin sélectionne ses meilleurs talents pour représenter le pays à Sousse !',
      stats: {
         participants: '500+',
         regions: '12',
         places: '4',
         countries: '40+'
      },
      phases: [
         { id: 1, title: "Inscriptions & Sensibilisation", date: "Janvier - Février 2026", description: "Lancement de la plateforme, tournées dans les lycées, et enregistrement des candidats.", status: "current", criteria: ["Être élève en 2nde, 1ère ou Terminale", "Moins de 20 ans"], icon: "Users" },
         { id: 2, title: "Phase 1 : Pré-sélection (QCM)", date: "15 Mars 2026", description: "Test de logique, mathématiques et culture numérique chronométré.", status: "upcoming", criteria: ["Note supérieure à 14/20", "Classement national"], icon: "Target" },
         { id: 3, title: "Phase 2 : Formation Régionale", date: "Avril 2026", description: "Sélection des 100 meilleurs pour des ateliers pratiques.", status: "upcoming", criteria: ["Assiduité aux formations", "Réussite aux mini-projets Python"], icon: "BookOpen" },
         { id: 4, title: "Phase 3 : Demi-finale Nationale", date: "Mai 2026", description: "Hackathon d'une journée à Cotonou.", status: "upcoming", criteria: ["Résolution de problèmes en équipe", "Créativité"], icon: "Zap" },
         { id: 5, title: "Bootcamp d'Excellence", date: "Juin 2026", description: "2 semaines d'immersion à Sèmè City.", status: "upcoming", criteria: ["Niveau avancé en Mathématiques", "Anglais technique"], icon: "Brain" },
         { id: 6, title: "Sélection Finale", date: "Juillet 2026", description: "Désignation de l'équipe de 4 élèves.", status: "upcoming", criteria: ["Classement final bootcamp", "Leadership"], icon: "Trophy" }
      ],
      highlights: [
         { title: "Formation gratuite", description: "Accès à des cours Python, ML et IA", icon: "BookOpen" },
         { title: "Mentorat personnalisé", description: "Accompagnement par des experts", icon: "Users" },
         { title: "Voyage international", description: "Représenter le Bénin en Tunisie", icon: "Globe" },
         { title: "Certificat officiel", description: "Reconnaissance nationale", icon: "Award" }
      ],
      faqs: [
         { q: "Qui peut participer ?", a: "Tout élève inscrit dans un établissement secondaire au Bénin, né après le 1er janvier 2007." },
         { q: "Faut-il savoir coder ?", a: "Non, pas pour la première phase. La curiosité et un bon niveau en logique suffisent." },
         { q: "L'inscription est-elle payante ?", a: "Non, la participation est entièrement gratuite." },
         { q: "Quel est le niveau d'anglais requis ?", a: "Un niveau scolaire suffit. Des cours de renforcement sont prévus." }
      ]
   },
   '2025': {
      year: '2025',
      title: 'Édition 2025 — IOAI Beijing',
      status: 'completed',
      aoaiLocation: 'Beijing, Chine',
      aoaiDates: 'Août 2025',
      heroImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1920&auto=format&fit=crop',
      description: 'Première participation historique du Bénin aux Olympiades Internationales d\'Intelligence Artificielle (IOAI). Une aventure inoubliable qui a marqué le début d\'une nouvelle ère.',
      stats: {
         participants: '700+',
         ranking: '30ème',
         countries: '87',
         medals: '1'
      },
      results: {
         ranking: '30ème / 87 pays',
         medal: 'Mention Honorable',
         team: [
            { name: 'Merveille Agbossaga', role: 'Mention Honorable', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop' },
            { name: 'Dona Ahouansou', role: 'Finaliste', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop' },
            { name: 'Déreck M\'po Yeti', role: 'Finaliste', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
            { name: 'Sarah Koudjo', role: 'Finaliste', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop' }
         ]
      },
      phases: [
         { id: 1, title: "Sélection Nationale", date: "Mars 2025", description: "Plus de 700 candidats ont participé à la phase de présélection.", status: "completed", criteria: ["Test QCM", "Entretiens"], icon: "Users" },
         { id: 2, title: "Bootcamp Sèmè City", date: "Juin 2025", description: "Formation intensive de 2 semaines pour les 20 finalistes.", status: "completed", criteria: ["Python", "Machine Learning"], icon: "Brain" },
         { id: 3, title: "Finale Internationale", date: "Août 2025", description: "Participation à l'IOAI à Beijing avec 87 pays.", status: "completed", criteria: ["Épreuves pratiques", "Projets IA"], icon: "Trophy" }
      ],
      gallery: [
         { image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop', caption: 'Cérémonie d\'ouverture IOAI 2025' },
         { image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop', caption: 'L\'équipe béninoise en compétition' },
         { image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop', caption: 'Session de travail en équipe' },
         { image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=600&auto=format&fit=crop', caption: 'Remise des prix' },
         { image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop', caption: 'Bootcamp Sèmè City' },
         { image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop', caption: 'Formation intensive' }
      ],
      pressLinks: [
         { title: 'Le Bénin brille aux Olympiades Internationales d\'IA', source: 'La Nation', date: 'Août 2025', url: '#' },
         { title: 'Mention Honorable pour Merveille Agbossaga à Beijing', source: 'Fraternité', date: 'Août 2025', url: '#' },
         { title: 'Retour triomphal de l\'équipe nationale d\'IA', source: 'Le Matinal', date: 'Septembre 2025', url: '#' },
         { title: 'IOAI 2025 : Le Bénin se classe 30ème mondial', source: 'Bénin Web TV', date: 'Août 2025', url: '#' }
      ],
      testimonials: [
         { name: 'Merveille Agbossaga', role: 'Mention Honorable', quote: 'Cette expérience à Beijing a complètement changé ma vision de l\'IA. J\'ai compris que nous, jeunes Africains, pouvons créer des solutions innovantes pour notre continent.', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop', videoUrl: null },
         { name: 'Dona Ahouansou', role: 'Finaliste', quote: 'Le bootcamp à Sèmè City était intense mais incroyable. En deux semaines, j\'ai appris plus qu\'en une année entière.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop', videoUrl: 'https://youtube.com/watch?v=example1' },
         { name: 'Déreck M\'po Yeti', role: 'Finaliste', quote: 'Représenter le Bénin à Beijing était un honneur immense. Le code est un langage universel.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', videoUrl: null },
         { name: 'Sarah Koudjo', role: 'Finaliste', quote: 'Les filles peuvent exceller en IA ! J\'encourage toutes les lycéennes béninoises à tenter leur chance.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop', videoUrl: 'https://youtube.com/watch?v=example2' }
      ]
   }
};

const iconMap: Record<string, any> = {
   Users, Trophy, Globe, Target, Clock, Flag, Star, Zap, BookOpen, Award, Brain
};

const EditionPage: React.FC = () => {
   const params = useParams();
   const year = params?.year as string;
   const edition = editionsData[year];

   const [openFaq, setOpenFaq] = useState<number | null>(0);
   const [visiblePhases, setVisiblePhases] = useState<number[]>([]);
   const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

   if (!edition) {
      notFound();
   }

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  const index = phaseRefs.current.findIndex((ref) => ref === entry.target);
                  if (index !== -1 && !visiblePhases.includes(index)) {
                     setVisiblePhases((prev) => [...prev, index]);
                  }
               }
            });
         },
         { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      phaseRefs.current.forEach((ref) => {
         if (ref) observer.observe(ref);
      });

      return () => observer.disconnect();
   }, [visiblePhases]);

   const inscriptionStatus = edition.status === 'current' ? 'Ouvertes' : edition.status === 'upcoming' ? 'Prochainement' : 'Terminée';
   const isCompleted = edition.status === 'completed';

   return (
      <div className="bg-white min-h-screen overflow-hidden">

         {/* Hero Section avec image de fond */}
         <section className="relative min-h-[70vh] flex items-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
               <img 
                  src={edition.heroImage} 
                  alt={edition.title}
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-ioai-blue/95 via-ioai-blue/85 to-ioai-blue/70"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-32">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <div>
                     <div className="mb-6">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                           isCompleted 
                              ? 'bg-benin-yellow text-white' 
                              : 'bg-ioai-green text-white'
                        }`}>
                           {isCompleted ? 'Édition terminée' : `Inscriptions ${inscriptionStatus}`}
                        </span>
                     </div>

                     <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
                        {edition.title}
                     </h1>

                     <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
                        {edition.description}
                     </p>

                     <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-lg">
                           <MapPin className="w-4 h-4 text-white" />
                           <span className="text-white">{edition.aoaiLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-lg">
                           <Calendar className="w-4 h-4 text-white" />
                           <span className="text-white">{edition.aoaiDates}</span>
                        </div>
                     </div>

                     {!isCompleted && (
                        <div className="flex flex-wrap gap-4">
                           <Link 
                              href="/auth/inscription" 
                              className="inline-flex items-center px-6 py-3 bg-ioai-green hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
                           >
                              S&apos;inscrire maintenant
                              <ArrowRight className="w-5 h-5 ml-2" />
                           </Link>
                           <Link 
                              href="#parcours" 
                              className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors"
                           >
                              Voir le parcours
                           </Link>
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {edition.stats && Object.entries(edition.stats).map(([key, value]) => {
                        const labels: Record<string, string> = {
                           participants: 'Participants',
                           regions: 'Régions',
                           places: 'Places en finale',
                           countries: 'Pays participants',
                           ranking: 'Classement',
                           medals: 'Médailles'
                        };
                        return (
                           <div key={key} className="bg-white/10 rounded-xl p-5 text-center">
                              <div className="text-3xl font-bold text-white mb-1">{value as string}</div>
                              <div className="text-sm text-white/70">{labels[key] || key}</div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
         </section>

         {/* Timeline */}
         <section id="parcours" className="py-20 bg-gradient-to-b from-white to-gray-50/50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
               <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ioai-green/10 text-ioai-green font-bold text-sm mb-4 border border-ioai-green/20">
                  <Target className="w-4 h-4" />
                  {isCompleted ? 'Parcours réalisé' : 'Parcours de sélection'}
               </span>
               <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
                  {isCompleted ? 'Les étapes de l\'édition' : 'Votre chemin vers la finale'}
               </h2>
               <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  {isCompleted 
                     ? `Retour sur les ${edition.phases.length} phases qui ont mené nos champions à ${edition.aoaiLocation}.`
                     : `${edition.phases.length} phases de janvier à juillet ${edition.year} pour sélectionner l'équipe nationale.`
                  }
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {edition.phases.map((phase: any, index: number) => (
                  <div
                     key={phase.id}
                     ref={(el) => { phaseRefs.current[index] = el; }}
                     className={`card rounded-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                        phase.status === 'current' ? 'ring-2 ring-ioai-green border-ioai-green/20 shadow-lg shadow-ioai-green/10' : ''
                     } ${
                        visiblePhases.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                     }`}
                     style={{
                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        transitionDelay: `${index * 100}ms`
                     }}
                  >
                     <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                           phase.status === 'current'
                              ? 'bg-gradient-to-br from-ioai-green to-teal-500 text-white shadow-lg shadow-ioai-green/30 scale-110'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}>
                           {phase.id}
                        </div>
                        {phase.status === 'current' && (
                           <span className="inline-flex items-center px-3 py-1 bg-ioai-green/10 text-ioai-green text-xs font-bold rounded-full border border-ioai-green/20 animate-pulse">
                              <Sparkles className="w-3 h-3 mr-1 animate-spin" style={{ animationDuration: '3s' }} /> En cours
                           </span>
                        )}
                     </div>

                     <div className="text-xs font-bold text-ioai-green uppercase tracking-wider mb-3">
                        {phase.date}
                     </div>

                     <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight">{phase.title}</h3>

                     <p className="text-gray-600 text-sm mb-4 leading-relaxed">{phase.description}</p>

                     <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Critères</p>
                        <ul className="space-y-2">
                           {phase.criteria.map((c: string, i: number) => (
                              <li key={i} className="text-xs text-gray-600 flex items-start">
                                 <CheckCircle className="w-3.5 h-3.5 text-ioai-green mr-2 mt-0.5 shrink-0" />
                                 <span>{c}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               ))}
            </div>
         </div>
         </section>

         {/* Section Avantages (pour édition en cours) */}
         {edition.highlights && !isCompleted && (
            <section id="avantages" className="py-20 bg-white">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                     <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-benin-yellow/10 text-benin-yellow font-bold text-sm mb-4 border border-benin-yellow/20">
                        <Star className="w-4 h-4" />
                        Pourquoi participer ?
                     </span>
                     <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
                        Les avantages de la compétition
                     </h2>
                     <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Bien plus qu&apos;une compétition, une opportunité unique de développement personnel et professionnel.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {edition.highlights.map((highlight: any, idx: number) => {
                        const IconComp = iconMap[highlight.icon] || Star;
                        const colors = ['ioai-green', 'ioai-blue', 'benin-yellow', 'benin-red'];
                        const color = colors[idx % colors.length];
                        return (
                           <div 
                              key={idx}
                              className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                           >
                              <div className={`w-14 h-14 rounded-2xl bg-${color}/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                 <IconComp className={`w-7 h-7 text-${color}`} />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{highlight.title}</h3>
                              <p className="text-gray-600 text-sm leading-relaxed">{highlight.description}</p>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </section>
         )}

         {/* Section Résultats (pour édition terminée) */}
         {edition.results && isCompleted && (
            <section id="resultats" className="py-20 bg-gradient-to-b from-gray-50 to-white">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                     <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-benin-yellow/10 text-benin-yellow font-bold text-sm mb-4 border border-benin-yellow/20">
                        <Trophy className="w-4 h-4" />
                        Résultats officiels
                     </span>
                     <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
                        Performance du Bénin
                     </h2>
                     <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Une première participation historique couronnée de succès.
                     </p>
                  </div>

                  {/* Résultats principaux */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                     <div className="bg-gradient-to-br from-ioai-blue to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                           <Award className="w-12 h-12 mb-4 text-benin-yellow" />
                           <div className="text-4xl font-black mb-2">{edition.results.ranking}</div>
                           <p className="text-white/80">Classement mondial</p>
                        </div>
                     </div>
                     <div className="bg-gradient-to-br from-benin-yellow to-yellow-500 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                           <Star className="w-12 h-12 mb-4" />
                           <div className="text-4xl font-black mb-2">{edition.results.medal}</div>
                           <p className="text-white/80">Récompense obtenue</p>
                        </div>
                     </div>
                  </div>

                  {/* Équipe */}
                  <div className="mb-8">
                     <h3 className="text-2xl font-display font-bold text-gray-900 mb-8 text-center">L&apos;équipe nationale {edition.year}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {edition.results.team.map((member: any, idx: number) => (
                           <div key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                              <div className="relative h-48 overflow-hidden">
                                 <img 
                                    src={member.image} 
                                    alt={member.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                 {member.role.includes('Mention') && (
                                    <div className="absolute top-3 right-3 bg-benin-yellow text-white text-xs font-bold px-3 py-1 rounded-full">
                                       🏅 {member.role}
                                    </div>
                                 )}
                              </div>
                              <div className="p-5">
                                 <h4 className="font-bold text-gray-900 text-lg">{member.name}</h4>
                                 <p className="text-sm text-ioai-green font-medium">{member.role}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </section>
         )}

         {/* CTA */}
         {edition.status === 'current' && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
               <div className="card-gradient rounded-2xl p-10 text-center text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                  <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
                  <div className="relative z-10">
                     <div className="w-16 h-16 mx-auto mb-6 bg-white/15 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Brain className="w-8 h-8 group-hover:animate-pulse" />
                     </div>
                     <h3 className="text-2xl font-display font-black mb-4">Prêt à commencer ?</h3>
                     <p className="text-white/80 text-base mb-6 max-w-xl mx-auto">
                        Les inscriptions sont ouvertes jusqu&apos;à fin février {edition.year}.
                     </p>
                     <Link
                        href="/auth/inscription"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-ioai-green font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-105 group/btn"
                     >
                        S&apos;inscrire maintenant <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-2 transition-transform duration-300" />
                     </Link>
                  </div>
               </div>
            </div>
         )}

         {/* FAQ - Seulement pour éditions en cours */}
         {edition.faqs && !isCompleted && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20" id="faq">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-display font-black text-gray-900 mb-3">Questions Fréquentes</h2>
                  <p className="text-gray-600 text-lg">Tout ce que vous devez savoir</p>
               </div>

               <div className="space-y-3">
                  {edition.faqs.map((faq: any, index: number) => (
                     <div key={index} className="card rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                        <button
                           onClick={() => setOpenFaq(openFaq === index ? null : index)}
                           className="w-full text-left p-6 flex justify-between items-start gap-4 group"
                        >
                           <h3 className="font-bold text-base text-gray-900 group-hover:text-ioai-green transition-colors duration-300 flex-1">
                              {faq.q}
                           </h3>
                           <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                              openFaq === index ? 'bg-gradient-to-br from-ioai-green to-teal-500 text-white rotate-180 scale-110 shadow-lg shadow-ioai-green/30' : 'bg-gray-100 text-gray-400 group-hover:bg-ioai-green/10 group-hover:text-ioai-green'
                           }`}>
                              {openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                           </div>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <div className="px-6 pb-6 pt-0">
                              <div className="border-t border-gray-100 pt-4">
                                 <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Ressources - Seulement pour éditions en cours */}
         {!isCompleted && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20" id="ressources">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="card p-8 hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 group">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-ioai-green/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                           <Brain className="w-6 h-6 text-ioai-green" />
                        </div>
                        <h3 className="text-xl font-bold text-ioai-blue">Ressources de préparation</h3>
                     </div>
                     <p className="text-gray-600 mb-6">Pour vous préparer efficacement :</p>
                     <ul className="space-y-3">
                        <li className="flex items-start text-gray-600">
                           <CheckCircle className="w-5 h-5 text-ioai-green mr-3 mt-0.5 shrink-0" />
                           <span><strong>Tutoriels Python</strong> — Cours gratuits</span>
                        </li>
                        <li className="flex items-start text-gray-600">
                           <CheckCircle className="w-5 h-5 text-ioai-green mr-3 mt-0.5 shrink-0" />
                           <span><strong>Exercices de logique</strong> — Problèmes types</span>
                        </li>
                        <li className="flex items-start text-gray-600">
                           <CheckCircle className="w-5 h-5 text-ioai-green mr-3 mt-0.5 shrink-0" />
                           <span><strong>Webinaires</strong> — Sessions avec experts</span>
                        </li>
                     </ul>
                  </div>

                  <div className="card p-8 bg-gradient-to-br from-ioai-blue/5 to-ioai-green/5 hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-ioai-blue/10 flex items-center justify-center">
                           <Sparkles className="w-6 h-6 text-ioai-blue" />
                        </div>
                        <h3 className="text-xl font-bold text-ioai-blue">Accompagnement personnalisé</h3>
                     </div>
                     <p className="text-gray-600 mb-6">Support tout au long du parcours :</p>
                     <ul className="space-y-3">
                        <li className="flex items-start text-gray-600">
                           <CheckCircle className="w-5 h-5 text-ioai-blue mr-3 mt-0.5 shrink-0" />
                           <span><strong>Mentorat</strong> — Un mentor dédié</span>
                        </li>
                        <li className="flex items-start text-gray-600">
                           <CheckCircle className="w-5 h-5 text-ioai-blue mr-3 mt-0.5 shrink-0" />
                           <span><strong>Groupes d'étude</strong> — Sessions collaboratives</span>
                        </li>
                        <li className="flex items-start text-gray-600">
                           <CheckCircle className="w-5 h-5 text-ioai-blue mr-3 mt-0.5 shrink-0" />
                           <span><strong>Support 7j/7</strong> — Assistance disponible</span>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
         )}

         {/* Galerie - Seulement pour éditions terminées */}
         {edition.gallery && isCompleted && (
            <section id="galerie" className="py-20 bg-gray-50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                     <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ioai-blue/10 text-ioai-blue font-bold text-sm mb-4 border border-ioai-blue/20">
                        <Image className="w-4 h-4" />
                        Souvenirs
                     </span>
                     <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
                        Galerie photos
                     </h2>
                     <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Les moments forts de notre participation à l&apos;IOAI {edition.year}.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {edition.gallery.map((item: any, idx: number) => (
                        <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                           <div className="aspect-[4/3] overflow-hidden">
                              <img 
                                 src={item.image} 
                                 alt={item.caption}
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                           <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-white font-medium text-sm">{item.caption}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>
         )}

         {/* Communiqués de presse - Seulement pour éditions terminées */}
         {edition.pressLinks && isCompleted && (
            <section id="presse" className="py-20 bg-white">
               <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                     <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-benin-yellow/10 text-benin-yellow font-bold text-sm mb-4 border border-benin-yellow/20">
                        <Newspaper className="w-4 h-4" />
                        Revue de presse
                     </span>
                     <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
                        Dans les médias
                     </h2>
                     <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Retrouvez les articles et reportages sur notre participation.
                     </p>
                  </div>

                  <div className="space-y-4">
                     {edition.pressLinks.map((link: any, idx: number) => (
                        <a 
                           key={idx}
                           href={link.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="group flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-ioai-green/30 transition-all duration-300"
                        >
                           <div className="flex-1">
                              <h3 className="font-bold text-gray-900 group-hover:text-ioai-green transition-colors mb-1">
                                 {link.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                 <span className="font-medium text-ioai-blue">{link.source}</span>
                                 <span>•</span>
                                 <span>{link.date}</span>
                              </div>
                           </div>
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-ioai-green group-hover:text-white transition-all">
                              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white" />
                           </div>
                        </a>
                     ))}
                  </div>
               </div>
            </section>
         )}

         {/* Témoignages - Seulement pour éditions terminées */}
         {edition.testimonials && isCompleted && (
            <section id="temoignages" className="py-20 bg-gray-50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                     <h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-3">
                        Témoignages des participants
                     </h2>
                     <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Découvrez les retours d&apos;expérience de notre équipe.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {edition.testimonials.map((testimonial: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                           <div className="flex items-start gap-4 mb-4">
                              <img 
                                 src={testimonial.image} 
                                 alt={testimonial.name}
                                 className="w-14 h-14 rounded-full object-cover"
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
         )}

      </div>
   );
};

export default EditionPage;

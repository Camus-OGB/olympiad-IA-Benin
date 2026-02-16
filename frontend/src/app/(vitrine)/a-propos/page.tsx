'use client';

import React from 'react';
import { Globe, Lightbulb, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const allPartners = [
   { name: 'Sèmè City', role: 'Organisateur Principal', desc: "Cité internationale de l'innovation.", logo: "https://semecity.bj/wp-content/uploads/2021/09/Logo-Seme-City.png" },
   { name: 'Ministère du Numérique', role: 'Institutionnel', desc: "Stratégie numérique nationale.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png" },
   { name: 'Ministère Ens. Supérieur', role: 'Académique', desc: "Recherche et Innovation.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png" },
   { name: 'Ministère Ens. Secondaire', role: 'Éducatif', desc: "Mobilisation des lycées.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png" },
   { name: 'IOAI', role: 'International', desc: "International Olympiad in AI.", logo: "https://ioai-official.org/wp-content/uploads/2024/03/cropped-IOAI_Logo_Horizontal_Color.png" },
   { name: 'MND', role: 'Sponsor Gold', desc: "Soutien logistique.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png" }
];

const About: React.FC = () => {
   return (
      <div className="bg-[#f8f9fc] min-h-screen">
         {/* Hero — Image background */}
         <div className="relative pt-80 pb-64 overflow-hidden">
            <div className="absolute inset-0">
               <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop" alt="Team" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/85 to-[#0a1628]/75"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
               <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-5 leading-tight">
                  À propos des Olympiades d&apos;IA
               </h1>
               <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Positionner le Bénin comme un hub de compétences en intelligence artificielle en Afrique.
               </p>
            </div>
         </div>

         {/* Values — Cards with colored accent tops */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                  { icon: Globe, title: "Excellence", text: "Viser les standards mondiaux.", accent: "card-accent-green", color: "ioai-green" },
                  { icon: Heart, title: "Inclusion", text: "Ouvert à tous, public et privé.", accent: "card-accent-red", color: "benin-red" },
                  { icon: ShieldCheck, title: "Transparence", text: "Sélection rigoureuse et équitable.", accent: "card-accent-blue", color: "ioai-blue" },
                  { icon: Lightbulb, title: "Innovation", text: "Créer des solutions pour demain.", accent: "card-accent-yellow", color: "benin-yellow" },
               ].map((v, i) => (
                  <div key={i} className={`card ${v.accent} p-7 text-center group`}>
                     <div className={`w-12 h-12 bg-${v.color}/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <v.icon className={`w-6 h-6 text-${v.color}`} />
                     </div>
                     <h3 className="font-bold text-lg text-gray-900 mb-2">{v.title}</h3>
                     <p className="text-gray-500 text-sm">{v.text}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Mission & Vision */}
         <div className="py-16 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                     <span className="section-label">Notre Raison d&apos;être</span>
                     <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Préparer l&apos;élite de demain</h2>
                     <p className="text-gray-500 leading-relaxed mb-4">
                        Les Olympiades d&apos;Intelligence Artificielle du Bénin ne sont pas qu&apos;une compétition. C&apos;est un programme éducatif complet visant à démystifier l&apos;IA auprès de la jeunesse et à détecter les talents précoces.
                     </p>
                     <p className="text-gray-500 leading-relaxed">
                        Notre vision est de créer un vivier de compétences capable de répondre aux défis technologiques du continent africain.
                     </p>
                  </div>
                  <div>
                     <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" alt="Teamwork" className="rounded-xl shadow-lg" />
                  </div>
               </div>
            </div>
         </div>

         {/* Team */}
         <div className="py-16 bg-[#f8f9fc]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-10">
                  <span className="section-label">Leadership</span>
                  <h2 className="text-3xl font-display font-bold text-gray-900">L&apos;Équipe Organisatrice</h2>
               </div>
               <div className="card rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=400&auto=format&fit=crop" alt="Mahuna Akplogan" className="w-28 h-28 rounded-xl object-cover shadow-md" />
                  <div className="text-center sm:text-left">
                     <h3 className="text-xl font-bold text-gray-900">Mahuna Akplogan</h3>
                     <p className="text-ioai-green font-bold text-sm mb-2">Membre du Board AOAI &amp; Coordinateur Sèmè City</p>
                     <p className="text-gray-500 text-sm leading-relaxed">
                        Expert en IA, il porte la voix du Bénin au sein des instances internationales et supervise le programme de sélection.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* ==================== PARTENAIRES (SIMPLE GRID) ==================== */}
         <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
               <span className="section-label">Écosystème & Soutiens</span>
               <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Nos Partenaires</h2>
               <p className="text-gray-500 max-w-2xl mx-auto">
                  La réussite de cette initiative nationale repose sur l&apos;engagement de nos partenaires institutionnels et académiques.
               </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allPartners.map((p, i) => (
                     <div key={i} className="group card p-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-white border border-gray-100">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-ioai-green/5 transition-colors"></div>

                        {/* Logo Container */}
                        <div className="h-20 w-full flex items-center justify-center mb-6 relative z-10">
                           <img src={p.logo} alt={p.name} className="max-h-full max-w-[180px] object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 w-full border-t border-gray-50 pt-6">
                           <h4 className="font-bold text-lg text-gray-900 mb-1">{p.name}</h4>
                           <span className="inline-block text-xs font-bold text-ioai-green uppercase tracking-wider mb-2">{p.role}</span>
                           <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* CTA */}
               <div className="mt-20 text-center">
                  <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                     Devenir Partenaire <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
               </div>

            </div>
         </section>
      </div>
   );
};

export default About;

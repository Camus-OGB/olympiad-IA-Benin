'use client';

import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const partners = [
    {
        category: "Organisateur Principal",
        items: [
            { name: "Sèmè City", desc: "Cité internationale de l'innovation et du savoir.", logo: "https://semecity.bj/wp-content/uploads/2021/09/Logo-Seme-City.png", url: "https://semecity.bj" }
        ]
    },
    {
        category: "Partenaires Institutionnels",
        items: [
            { name: "Ministère du Numérique", desc: "Digitalisation et services publics.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png", url: "#" },
            { name: "Ministère Ens. Supérieur", desc: "Recherche scientifique.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png", url: "#" },
            { name: "Ministère Ens. Secondaire", desc: "Enseignement technique et pro.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png", url: "#" }
        ]
    },
    {
        category: "Partenaires Techniques & Académiques",
        items: [
            { name: "IOAI", desc: "International Olympiad in AI.", logo: "https://ioai-official.org/wp-content/uploads/2024/03/cropped-IOAI_Logo_Horizontal_Color.png", url: "https://ioai-official.org" },
            { name: "Université d'Abomey-Calavi", desc: "Formation et recherche.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Coat_of_arms_of_Benin.svg/150px-Coat_of_arms_of_Benin.svg.png", url: "#" }
        ]
    }
];

const PartnersPage: React.FC = () => {
    return (
        <div className="bg-[#f8f9fc] min-h-screen pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-ioai-green font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Écosystème</span>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">Nos Partenaires</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Ils s'engagent à nos côtés pour propulser la jeunesse béninoise vers l'excellence en Intelligence Artificielle.
                    </p>
                </div>

                {/* Partners Grid */}
                <div className="space-y-16">
                    {partners.map((section, idx) => (
                        <div key={idx}>
                            <h2 className="text-2xl font-display font-bold text-gray-900 mb-8 border-l-4 border-ioai-green pl-4">
                                {section.category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {section.items.map((partner, pIdx) => (
                                    <div key={pIdx} className="card rounded-xl p-8 flex flex-col items-center text-center group hover:border-ioai-green/30 transition-all">
                                        <div className="h-20 w-full flex items-center justify-center mb-6 p-4 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                            <img src={partner.logo} alt={partner.name} className="h-full object-contain max-w-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{partner.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6 flex-grow">{partner.desc}</p>
                                        <a href={partner.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-ioai-green font-bold text-sm hover:underline">
                                            Visiter le site <ExternalLink className="w-3 h-3 ml-1.5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-20 card-gradient rounded-2xl p-10 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-display font-bold mb-4">Devenez Partenaire Officiel</h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                            Associez votre image à l'excellence et soutenez la nouvelle génération de talents technologiques.
                        </p>
                        <Link href="/contact" className="inline-flex items-center px-8 py-3 bg-white text-ioai-green font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            Nous contacter <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                    <div className="neural-grid opacity-10"></div>
                </div>

            </div>
        </div>
    );
};

export default PartnersPage;

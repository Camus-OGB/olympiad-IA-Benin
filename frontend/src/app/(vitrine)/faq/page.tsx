'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, MessageCircle, HelpCircle, Sparkles, Users, BookOpen, Laptop, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const faqs = [
    {
        category: "Inscription",
        icon: Users,
        color: "ioai-green",
        items: [
            { q: "Qui peut s'inscrire aux Olympiades ?", a: "Tout élève inscrit dans un établissement secondaire au Bénin, né après le 1er janvier 2007, et ayant un intérêt pour les sciences et le numérique." },
            { q: "Quels sont les frais de participation ?", a: "La participation est entièrement gratuite. Tous les frais liés aux bootcamps et déplacements sont pris en charge par l'organisation." },
            { q: "Comment se déroule l'inscription ?", a: "L'inscription se fait exclusivement en ligne via ce site web. Vous devrez créer un compte, remplir le formulaire et valider votre email." },
        ]
    },
    {
        category: "Déroulement",
        icon: BookOpen,
        color: "ioai-blue",
        items: [
            { q: "Faut-il savoir coder pour participer ?", a: "Non, pas pour la première phase de sélection. Elle évalue la logique, les mathématiques et la culture numérique. La programmation (Python) sera enseignée lors des formations ultérieures." },
            { q: "Quel est le niveau d'anglais requis ?", a: "Un niveau scolaire suffit pour commencer. Cependant, l'anglais technique étant la langue de l'IA, des cours de renforcement seront dispensés aux finalistes." },
            { q: "Où se déroulent les épreuves ?", a: "La première phase est en ligne. Les phases suivantes (formations régionales, demi-finale, bootcamp) se dérouleront en présentiel, principalement à Cotonou (Sèmè City)." },
        ]
    },
    {
        category: "Matériel & Technique",
        icon: Laptop,
        color: "benin-yellow",
        items: [
            { q: "Ai-je besoin d'un ordinateur personnel ?", a: "C'est recommandé mais pas obligatoire pour la première phase (faisable sur tablette/smartphone). Pour les phases pratiques, des ordinateurs seront mis à disposition par les partenaires si nécessaire." },
            { q: "Que faire si j'ai oublié mon mot de passe ?", a: "Utilisez la fonction 'Mot de passe oublié' sur la page de connexion. Un lien de réinitialisation vous sera envoyé par email." },
        ]
    }
];

const FaqPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<{ cat: number, item: number } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggle = (catIdx: number, itemIdx: number) => {
        if (openIndex?.cat === catIdx && openIndex?.item === itemIdx) {
            setOpenIndex(null);
        } else {
            setOpenIndex({ cat: catIdx, item: itemIdx });
        }
    };

    const filteredFaqs = faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="bg-gradient-to-b from-white via-gray-50/50 to-white min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-ioai-green/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-10 w-96 h-96 bg-ioai-blue/10 rounded-full blur-3xl"></div>
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ioai-green/10 text-ioai-green font-bold text-sm mb-6 border border-ioai-green/20">
                            <HelpCircle className="w-4 h-4" />
                            Centre d&apos;aide
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 mb-6">
                            Questions <span className="bg-gradient-to-r from-ioai-green to-ioai-blue bg-clip-text text-transparent">Fréquentes</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
                            Retrouvez les réponses aux questions les plus courantes sur les Olympiades IA du Bénin.
                        </p>

                        {/* Search */}
                        <div className="relative max-w-xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher une question..."
                                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 focus:ring-2 focus:ring-ioai-green/20 focus:border-ioai-green outline-none transition-all placeholder-gray-400 text-gray-900 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((category, catIdx) => {
                                const IconComponent = category.icon;
                                return (
                                    <div key={catIdx} className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
                                        {/* Category Header */}
                                        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl bg-${category.color}/10 flex items-center justify-center`}>
                                                <IconComponent className={`w-5 h-5 text-${category.color}`} />
                                            </div>
                                            <h2 className="font-display font-bold text-lg text-gray-900">{category.category}</h2>
                                            <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                                {category.items.length} questions
                                            </span>
                                        </div>
                                        
                                        {/* Questions */}
                                        <div className="divide-y divide-gray-100">
                                            {category.items.map((item, itemIdx) => {
                                                const isOpen = openIndex?.cat === catIdx && openIndex?.item === itemIdx;
                                                return (
                                                    <div key={itemIdx} className="group">
                                                        <button
                                                            onClick={() => toggle(catIdx, itemIdx)}
                                                            className={`w-full px-6 py-5 flex justify-between items-center text-left transition-colors focus:outline-none ${isOpen ? 'bg-ioai-green/5' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <span className={`font-semibold text-base pr-8 transition-colors ${isOpen ? 'text-ioai-green' : 'text-gray-700'}`}>
                                                                {item.q}
                                                            </span>
                                                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-ioai-green text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                                                                <ChevronDown size={18} />
                                                            </div>
                                                        </button>
                                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                            <div className="px-6 pb-6">
                                                                <div className="bg-gradient-to-r from-ioai-green/5 to-transparent rounded-xl p-5 border-l-4 border-ioai-green">
                                                                    <p className="text-gray-600 leading-relaxed">
                                                                        {item.a}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-lg">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun résultat</h3>
                                <p className="text-gray-500">Aucune question trouvée pour &quot;{searchTerm}&quot;</p>
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 text-ioai-green font-semibold hover:underline"
                                >
                                    Effacer la recherche
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-16">
                        <div className="bg-gradient-to-r from-ioai-blue to-blue-600 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-ioai-green/20 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm border border-white/20">
                                    <MessageCircle className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-display font-black text-white mb-3">
                                    Vous ne trouvez pas votre réponse ?
                                </h3>
                                <p className="text-blue-100 mb-6 max-w-md mx-auto">
                                    Notre équipe est disponible pour répondre à toutes vos questions.
                                </p>
                                <Link 
                                    href="/contact" 
                                    className="inline-flex items-center px-8 py-4 bg-white text-ioai-blue font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                                >
                                    Contactez-nous
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FaqPage;

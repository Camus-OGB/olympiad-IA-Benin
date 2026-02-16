'use client';

import React, { useState } from 'react';
import { Mail, MapPin, Send, Facebook, Linkedin, Twitter, MessageCircle, Phone, ArrowRight, HelpCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Message envoyé avec succès !');
      setFormState({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const faqs = [
    { question: "Les inscriptions sont-elles gratuites ?", answer: "Oui, la participation aux Olympiades est entièrement gratuite pour tous les élèves béninois éligibles." },
    { question: "Puis-je participer si je suis en Terminale ?", answer: "Absolument. Le concours est ouvert aux élèves de la Seconde à la Terminale âgés de 16 à 20 ans." },
    { question: "Où se déroule la phase finale ?", answer: "La sélection nationale se fait en ligne et en présentiel à Cotonou. La finale internationale aura lieu à Sousse, en Tunisie." },
  ];

  return (
    <div className="bg-[#f8f9fc] min-h-screen">

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative w-full pt-32 pb-48 lg:pt-40 lg:pb-64 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1628]">
          <div className="absolute inset-0 bg-gradient-to-br from-ioai-dark-blue via-[#0d1830] to-black opacity-90"></div>
          {/* Abstract Grid */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          {/* Accents */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ioai-green/10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-ioai-blue/10 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-ioai-green animate-pulse"></span>
            Support 24/7
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
            Parlons de <span className="text-transparent bg-clip-text bg-gradient-to-r from-ioai-green to-ioai-blue">l'avenir</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Vous avez des questions sur le déroulement des épreuves, les critères d&apos;éligibilité ou les partenariats ? Notre équipe est là pour vous accompagner.
          </p>
        </div>
      </section>

      {/* ==================== CONTENT SECTION (Overlapping Hero) ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">

            {/* Main Info Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="w-5 h-5 mr-3 text-ioai-green" />
                Coordonnées
              </h3>

              <div className="space-y-8">
                <div className="flex group">
                  <div className="w-12 h-12 rounded-xl bg-ioai-blue/10 text-ioai-blue flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="ml-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <a href="mailto:contact@olympiades-ia.bj" className="text-gray-900 font-medium hover:text-ioai-blue transition-colors text-lg">
                      contact@olympiades-ia.bj
                    </a>
                    <p className="text-sm text-gray-400 mt-1">Réponse sous 24h ouvrées</p>
                  </div>
                </div>

                <div className="flex group">
                  <div className="w-12 h-12 rounded-xl bg-ioai-green/10 text-ioai-green flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="ml-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Téléphone</p>
                    <a href="tel:+22900000000" className="text-gray-900 font-medium hover:text-ioai-green transition-colors text-lg">
                      +229 00 00 00 00
                    </a>
                    <p className="text-sm text-gray-400 mt-1">Lun-Ven, 9h - 18h</p>
                  </div>
                </div>

                <div className="flex group">
                  <div className="w-12 h-12 rounded-xl bg-benin-yellow/10 text-benin-yellow flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="ml-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Siège Social</p>
                    <p className="text-gray-900 font-medium text-lg">Sèmè City</p>
                    <p className="text-sm text-gray-400 mt-1">Cotonou, Bénin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Socials Card */}
            <div className="bg-[#0a1628] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-ioai-green/20 rounded-full blur-[50px] transform translate-x-1/2 -translate-y-1/2"></div>
              <h3 className="text-lg font-bold mb-6 relative z-10">Suivez l&apos;actualité</h3>
              <div className="flex gap-4 relative z-10">
                {[
                  { icon: Linkedin, href: '#' },
                  { icon: Facebook, href: '#' },
                  { icon: Twitter, href: '#' }
                ].map((s, i) => (
                  <a key={i} href={s.href} className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:-translate-y-1 backdrop-blur-md border border-white/5">
                    <s.icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-ioai-green p-8 md:p-10 relative">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Envoyez-nous un message</h3>
              <p className="text-gray-500 mb-8">Remplissez le formulaire ci-dessous et nous vous recontacterons dans les plus brefs délais.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-ioai-green focus:ring-4 focus:ring-ioai-green/10 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Email professionnel</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-ioai-green focus:ring-4 focus:ring-ioai-green/10 outline-none transition-all placeholder:text-gray-400"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Sujet</label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-ioai-green focus:ring-4 focus:ring-ioai-green/10 outline-none transition-all text-gray-600 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Sélectionnez un sujet...</option>
                    <option value="candidature">Problème d&apos;inscription / Candidature</option>
                    <option value="partenariat">Proposition de partenariat</option>
                    <option value="presse">Presse &amp; Médias</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">Message</label>
                  <textarea
                    rows={5}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-ioai-green focus:ring-4 focus:ring-ioai-green/10 outline-none transition-all placeholder:text-gray-400 resize-none"
                    placeholder="Détaillez votre demande ici..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-ioai-green to-[#00a651] text-white font-bold py-4 px-8 rounded-lg shadow-lg shadow-ioai-green/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Envoi en cours...' : (
                    <>
                      Envoyer le message <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FAQ QUICK ACCESS ==================== */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-benin-yellow/10 text-benin-yellow mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">Questions Fréquentes</h2>

          <div className="space-y-4 text-left">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden hover:border-ioai-green/30 transition-colors">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-white transition-colors text-left"
                >
                  <span className="font-bold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`bg-white px-5 overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/faq" className="text-ioai-green font-bold text-sm hover:underline inline-flex items-center">
              Voir toute la FAQ <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;

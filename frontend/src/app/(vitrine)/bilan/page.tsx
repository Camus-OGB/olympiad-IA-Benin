'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Users, Award, Calendar, MapPin, ArrowRight, Star, Quote, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { contentApi, type PastEdition } from '@/lib/api/content';

const BilanPage: React.FC = () => {
  const [editions, setEditions] = useState<PastEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const data = await contentApi.getPastEditions();
        // Trier par année décroissante
        const sorted = [...data].sort((a, b) => b.year - a.year);
        setEditions(sorted);
      } catch (err) {
        console.error('Erreur chargement éditions passées:', err);
        setError('Impossible de charger les éditions.');
      } finally {
        setLoading(false);
      }
    };
    fetchEditions();
  }, []);

  // Statistiques globales calculées depuis les éditions
  const totalStudents = editions.reduce((acc, e) => acc + (e.numStudents || 0), 0);
  const totalMedals = editions.reduce((acc, e) =>
    acc + e.achievements.filter(a => a.category === 'medal').length, 0);

  return (
    <div className="bg-white min-h-screen overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-ioai-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
              Bilan des Éditions
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
              Découvrez l&apos;histoire des Olympiades d&apos;Intelligence Artificielle du Bénin à travers nos participations internationales.
            </p>

            {!loading && editions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { value: totalStudents > 0 ? `${totalStudents}+` : '—', label: 'Participants' },
                  { value: editions.length.toString(), label: editions.length > 1 ? 'Éditions' : 'Édition' },
                  { value: totalMedals > 0 ? totalMedals.toString() : '—', label: 'Médailles' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg px-5 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Liste des éditions */}
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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
                <p className="text-gray-500">Chargement des éditions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {editions.length === 0 ? (
                <div className="col-span-2 text-center py-16">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aucune édition passée disponible pour le moment.</p>
                </div>
              ) : (
                editions.map((edition) => (
                  <Link
                    key={edition.id}
                    href={`/bilan/${edition.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 h-full">
                      {/* Image / Header */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-ioai-blue to-ioai-green">
                        {edition.galleryImages?.length > 0 ? (() => {
                            const cover = [...edition.galleryImages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
                            return cover ? (
                              <img
                                src={cover.imageUrl}
                                alt={`Édition ${edition.year}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                              />
                            ) : null;
                          })() : null}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-6xl font-display font-black opacity-80">{edition.year}</div>
                            {edition.hostCountry && (
                              <p className="text-white/80 text-sm mt-1">{edition.hostCountry}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex flex-wrap gap-4 mb-5">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 text-ioai-green" />
                            <span className="font-medium">{edition.year}</span>
                          </div>
                          {edition.hostCountry && (
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <MapPin className="w-4 h-4 text-ioai-blue" />
                              <span className="font-medium">{edition.hostCountry}</span>
                            </div>
                          )}
                          {edition.numStudents && (
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Users className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">{edition.numStudents} candidats</span>
                            </div>
                          )}
                        </div>

                        {/* Achievements */}
                        {edition.achievements.length > 0 && (
                          <div className="space-y-2 mb-5">
                            {edition.achievements.slice(0, 3).map((achievement, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-benin-yellow flex-shrink-0" />
                                <span>{achievement.title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        {edition.editionStats.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-5">
                            {edition.editionStats.slice(0, 3).map((stat, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-2 text-center">
                                <div className="text-base font-bold text-gray-900">
                                  {stat.metricValue}{stat.metricUnit || ''}
                                </div>
                                <div className="text-xs text-gray-500 leading-tight">{stat.metricName}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-sm font-medium text-ioai-green">Voir les détails</span>
                          <ArrowRight className="w-4 h-4 text-ioai-green" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}

              {/* Carte édition en cours */}
              <Link href="/edition/2026" className="group block">
                <div className="bg-ioai-blue rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full">
                  <div className="p-8 h-full flex flex-col justify-center text-center min-h-[300px]">
                    <div className="text-4xl font-display font-black text-white/20 mb-2">2026</div>
                    <h3 className="text-3xl font-display font-black text-white mb-3">Édition 2026</h3>
                    <p className="text-white/80 text-sm mb-2">1ère Olympiade Africaine d&apos;IA</p>
                    <p className="text-white/70 mb-6">🇹🇳 Sousse, Tunisie — Avril 2026</p>
                    <span className="inline-flex items-center justify-center px-6 py-3 bg-white text-ioai-blue font-bold rounded-lg group-hover:bg-gray-100 transition-colors mx-auto">
                      Découvrir l&apos;édition
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Témoignages des dernières éditions */}
      {!loading && editions.length > 0 && editions[0].testimonials.length > 0 && (
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
              {editions[0].testimonials.filter(t => t.quote?.trim() && t.studentName?.trim()).slice(0, 4).map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <Quote className="w-8 h-8 text-ioai-green/30 mb-3" />
                  <p className="text-gray-700 italic mb-5 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.imageUrl ? (
                      <img
                        src={testimonial.imageUrl}
                        alt={testimonial.studentName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ioai-blue to-ioai-green flex items-center justify-center text-white font-bold">
                        {testimonial.studentName?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.studentName}</p>
                      {testimonial.role && (
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BilanPage;

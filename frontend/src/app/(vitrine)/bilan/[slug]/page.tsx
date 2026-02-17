'use client';

import React, { useEffect, useState } from 'react';
import { Medal, Award, ChevronRight, Quote, Calendar, Trophy, Sparkles, MapPin, Users, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { contentApi, type PastEdition } from '@/lib/api/content';

const EditionDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.slug as string;

  const [edition, setEdition] = useState<PastEdition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchEdition = async () => {
      try {
        const data = await contentApi.getPastEdition(id);
        setEdition(data);
      } catch (err) {
        console.error('Erreur chargement édition:', err);
        setError('Cette édition est introuvable.');
      } finally {
        setLoading(false);
      }
    };
    fetchEdition();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-28">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-500">Chargement de l&apos;édition...</p>
        </div>
      </div>
    );
  }

  if (error || !edition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-28">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black text-ioai-blue mb-4">Édition introuvable</h1>
          <p className="text-text-secondary mb-8">{error || 'Cette édition n&apos;existe pas ou n&apos;a pas encore été ajoutée.'}</p>
          <Link href="/bilan" className="inline-flex items-center px-6 py-3 bg-ioai-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
            Retour aux archives
          </Link>
        </div>
      </div>
    );
  }

  // Stats calculées
  const medals = edition.achievements.filter(a => a.category === 'medal');
  const sortedGallery = [...(edition.galleryImages || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const heroImage = sortedGallery[0]?.imageUrl;
  const galleryImages = sortedGallery;
  const numStudents = edition.numStudents;

  return (
    <div className="bg-white min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-ioai-dark-blue via-[#0d1830] to-black">
        {heroImage && (
          <div className="absolute inset-0 opacity-10">
            <img
              src={heroImage}
              alt={`Édition ${edition.year}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="neural-grid opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 font-bold text-sm mb-6 border border-white/20 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-benin-yellow" />
              Édition {edition.year}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight">
              {edition.hostCountry ? `${edition.hostCountry.split(',')[0]} ${edition.year}` : `Édition ${edition.year}`}
            </h1>
            {edition.hostCountry && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Participation du Bénin à l&apos;édition {edition.year} des Olympiades Internationales d&apos;Intelligence Artificielle
              </p>
            )}

            {/* Stats depuis editionStats ou numStudents */}
            {edition.editionStats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {edition.editionStats.slice(0, 4).map((stat, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-black text-white mb-1">
                      {stat.metricValue}{stat.metricUnit || ''}
                    </div>
                    <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{stat.metricName}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback si pas de stats mais numStudents */}
            {edition.editionStats.length === 0 && numStudents && (
              <div className="flex justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-black text-white mb-1">{numStudents}+</div>
                  <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Candidats</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Informations Clés */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {edition.hostCountry && (
              <div className="card p-6 text-center">
                <MapPin className="w-12 h-12 text-ioai-blue mx-auto mb-4" />
                <h3 className="font-bold text-lg text-ioai-blue mb-2">Lieu</h3>
                <p className="text-text-secondary font-semibold">{edition.hostCountry}</p>
              </div>
            )}
            <div className="card p-6 text-center">
              <Calendar className="w-12 h-12 text-ioai-green mx-auto mb-4" />
              <h3 className="font-bold text-lg text-ioai-blue mb-2">Année</h3>
              <p className="text-text-secondary font-semibold">{edition.year}</p>
            </div>
            {numStudents && (
              <div className="card p-6 text-center">
                <Users className="w-12 h-12 text-benin-yellow mx-auto mb-4" />
                <h3 className="font-bold text-lg text-ioai-blue mb-2">Candidats</h3>
                <p className="text-text-secondary font-semibold">{numStudents} participants</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Achievements / Résultats */}
      {edition.achievements.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-ioai-blue mb-4">
                Résultats {edition.year}
              </h2>
            </div>

            <div className="card p-8 rounded-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Palmarès et distinctions</h3>
                  <div className="space-y-4">
                    {edition.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {achievement.category === 'medal' ? (
                          <Medal className="w-5 h-5 text-benin-yellow mt-0.5 flex-shrink-0" />
                        ) : (
                          <Award className="w-5 h-5 text-ioai-green mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{achievement.title}</div>
                          {achievement.description && (
                            <div className="text-sm text-gray-500">{achievement.description}</div>
                          )}
                          {achievement.rank && (
                            <div className="text-sm text-ioai-blue font-medium">Rang #{achievement.rank}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {edition.editionStats.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {edition.editionStats.slice(0, 4).map((stat, i) => (
                      <div key={i} className="card rounded-xl p-5 text-center">
                        <span className="text-3xl font-black text-gray-900 block mb-1">
                          {stat.metricValue}{stat.metricUnit || ''}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.metricName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Équipe / Témoignages */}
      {edition.testimonials.length > 0 && (
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1830] to-[#0a1628]"></div>
          <div className="neural-grid opacity-20"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-14">
              <span className="text-ioai-green font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Champions</span>
              <h2 className="text-3xl font-display font-bold text-white mb-3">
                L&apos;Équipe Bénin {edition.year}
              </h2>
              {edition.hostCountry && (
                <p className="text-gray-400">
                  Ils ont porté les couleurs du pays jusqu&apos;en {edition.hostCountry.split(',')[0]}.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {edition.testimonials.map((t, idx) => (
                <div key={idx} className="card-dark rounded-xl p-6 text-center group">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    {t.imageUrl ? (
                      <img
                        src={t.imageUrl}
                        alt={t.studentName}
                        className="w-full h-full object-cover rounded-xl border-2 border-white/10 shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl border-2 border-white/10 bg-gradient-to-br from-ioai-blue to-ioai-green flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {t.studentName?.[0]}
                      </div>
                    )}
                    {idx === 0 && medals.length > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-benin-yellow text-white p-1.5 rounded-md shadow" title="Médaillé">
                        <Medal size={12} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-0.5">{t.studentName}</h3>
                  {t.role && (
                    <p className="text-ioai-green text-[10px] font-bold uppercase tracking-wider mb-1">{t.role}</p>
                  )}
                  {t.school && (
                    <p className="text-gray-500 text-[11px] mb-3">{t.school}</p>
                  )}
                  <div className="bg-white/5 rounded-lg p-3 relative">
                    <Quote className="w-3 h-3 text-white/15 absolute top-2 left-2" />
                    <p className="text-xs text-gray-400 italic">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {edition.pastTimelinePhases.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="section-label">Chronologie</span>
              <h2 className="text-3xl font-display font-bold text-gray-900">Le Parcours {edition.year}</h2>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-ioai-green/30 via-ioai-blue/20 to-gray-100"></div>
              {edition.pastTimelinePhases
                .sort((a, b) => a.phaseOrder - b.phaseOrder)
                .map((phase, i) => (
                  <div key={i} className={`relative flex items-center justify-between mb-8 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-5/12"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                      <div className="timeline-dot"></div>
                    </div>
                    <div className={`w-5/12 card p-5 rounded-xl ${i % 2 === 0 ? 'text-right' : ''}`}>
                      {phase.date && (
                        <span className="text-ioai-green font-bold text-xs uppercase mb-1 block tracking-wider">{phase.date}</span>
                      )}
                      <h3 className="font-bold text-gray-900 mb-1">{phase.title}</h3>
                      {phase.description && (
                        <p className="text-sm text-gray-500">{phase.description}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Galerie */}
      {galleryImages.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="section-label">Galerie</span>
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Souvenirs {edition.hostCountry ? `de ${edition.hostCountry.split(',')[0]}` : `de l'édition ${edition.year}`}
              </h2>
            </div>

            {galleryImages.length === 1 ? (
              <div className="rounded-xl overflow-hidden h-80 shadow-md">
                <img
                  src={galleryImages[0].imageUrl}
                  alt={galleryImages[0].caption || `Édition ${edition.year}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : galleryImages.length === 2 ? (
              <div className="grid grid-cols-2 gap-4 h-80">
                {galleryImages.map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden shadow-md group relative">
                    <img src={img.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={img.caption || ''} />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white font-bold text-sm">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96">
                {/* Grande image à gauche */}
                <div className="col-span-2 row-span-2 rounded-xl overflow-hidden relative group shadow-md">
                  <img
                    src={galleryImages[0].imageUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={galleryImages[0].caption || ''}
                  />
                  {galleryImages[0].caption && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white font-bold text-sm">{galleryImages[0].caption}</p>
                    </div>
                  )}
                </div>
                {/* Petites images à droite */}
                {galleryImages.slice(1, 3).map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden shadow-md group">
                    <img src={img.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={img.caption || ''} />
                  </div>
                ))}
                {/* Bas à droite si 4+ images */}
                {galleryImages.length >= 4 && (
                  <div className="col-span-2 rounded-xl overflow-hidden relative shadow-md group">
                    <img
                      src={galleryImages[3].imageUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={galleryImages[3].caption || ''}
                    />
                    {galleryImages[3].caption && (
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white font-bold text-sm">{galleryImages[3].caption}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Articles de presse */}
      {edition.pressReleases.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display font-bold text-gray-900">Revue de presse</h2>
            </div>
            <div className="space-y-4">
              {edition.pressReleases.map((pr, idx) => (
                <div key={idx} className="card p-5 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{pr.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {pr.source && <span>{pr.source}</span>}
                      {pr.publishedAt && (
                        <span>{new Date(pr.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  {pr.url && (
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-ioai-blue text-white text-sm font-medium rounded-lg hover:bg-ioai-blue/90 transition-colors"
                    >
                      Lire <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

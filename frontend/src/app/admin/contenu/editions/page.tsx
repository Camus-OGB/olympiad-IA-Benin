'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Loader2, AlertCircle, Plus, Save, Edit2, X,
  CheckCircle, Clock, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';
import { contentApi, Edition, TimelinePhase, TimelinePhaseCreate, SelectionCriterion } from '@/lib/api/content';

export default function EditionsManager() {
  // ── État édition ──
  const [edition, setEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingEdition, setEditingEdition] = useState(false);
  const [creatingEdition, setCreatingEdition] = useState(false);
  const [editionSaving, setEditionSaving] = useState(false);
  const [editionError, setEditionError] = useState<string | null>(null);
  const [editionTitle, setEditionTitle] = useState('');
  const [editionYear, setEditionYear] = useState(new Date().getFullYear());
  const [editionDescription, setEditionDescription] = useState('');

  // ── État phases ──
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [criteria, setCriteria] = useState<SelectionCriterion[]>([]);
  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TimelinePhase | null>(null);
  const [phaseTitle, setPhaseTitle] = useState('');
  const [phaseOrder, setPhaseOrder] = useState(1);
  const [phaseDescription, setPhaseDescription] = useState('');
  const [phaseStartDate, setPhaseStartDate] = useState('');
  const [phaseEndDate, setPhaseEndDate] = useState('');
  const [phaseIsCurrent, setPhaseIsCurrent] = useState(false);
  const [phaseCriteria, setPhaseCriteria] = useState<string[]>([]);
  const [phaseSaving, setPhaseSaving] = useState(false);
  const [phaseError, setPhaseError] = useState<string | null>(null);
  const [deletingPhaseId, setDeletingPhaseId] = useState<string | null>(null);
  const [allEditions, setAllEditions] = useState<Edition[]>([]);
  const [activating, setActivating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [activeResult, allResult] = await Promise.allSettled([
        contentApi.getActiveEdition(),
        contentApi.getEditions(),
      ]);
      const active = activeResult.status === 'fulfilled' ? activeResult.value : null;
      setEdition(active);
      setAllEditions(allResult.status === 'fulfilled' ? allResult.value : []);
      if (active) {
        const sorted = [...(active.timelinePhases || [])].sort((a, b) => a.phaseOrder - b.phaseOrder);
        setPhases(sorted);
        setCriteria(active.selectionCriteria || []);
      } else {
        setPhases([]);
        setCriteria([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivateEdition = async (ed: Edition) => {
    setActivating(ed.id);
    try {
      await contentApi.updateEdition(ed.id, { isActive: true });
      load();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Erreur lors de l\'activation');
    } finally {
      setActivating(null);
    }
  };

  useEffect(() => { load(); }, []);

  // ════════════════════════════════════════════
  // GESTION ÉDITION
  // ════════════════════════════════════════════
  const startNewEdition = () => {
    setEditionTitle('');
    setEditionYear(new Date().getFullYear());
    setEditionDescription('');
    setEditionError(null);
    setCreatingEdition(true);
  };

  const startEditEdition = () => {
    if (!edition) return;
    setEditionTitle(edition.title);
    setEditionYear(edition.year);
    setEditionDescription(edition.description || '');
    setEditionError(null);
    setEditingEdition(true);
  };

  const cancelEditionForm = () => {
    setCreatingEdition(false);
    setEditingEdition(false);
    setEditionError(null);
  };

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditionSaving(true);
    setEditionError(null);
    try {
      await contentApi.createEdition({
        title: editionTitle,
        year: editionYear,
        description: editionDescription || undefined,
        isActive: true,
      });
      setCreatingEdition(false);
      load();
    } catch (err: any) {
      setEditionError(err?.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setEditionSaving(false);
    }
  };

  const handleUpdateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edition) return;
    setEditionSaving(true);
    setEditionError(null);
    try {
      await contentApi.updateEdition(edition.id, {
        title: editionTitle,
        year: editionYear,
        description: editionDescription || undefined,
      });
      setEditingEdition(false);
      load();
    } catch (err: any) {
      setEditionError(err?.response?.data?.detail || 'Erreur lors de la modification');
    } finally {
      setEditionSaving(false);
    }
  };

  // ════════════════════════════════════════════
  // GESTION PHASES
  // ════════════════════════════════════════════
  const openNewPhase = () => {
    setEditingPhase(null);
    setPhaseTitle('');
    setPhaseOrder(phases.length + 1);
    setPhaseDescription('');
    setPhaseStartDate('');
    setPhaseEndDate('');
    setPhaseIsCurrent(false);
    setPhaseCriteria([]);
    setPhaseError(null);
    setPhaseFormOpen(true);
  };

  const openEditPhase = (phase: TimelinePhase) => {
    setEditingPhase(phase);
    setPhaseTitle(phase.title);
    setPhaseOrder(phase.phaseOrder);
    setPhaseDescription(phase.description || '');
    setPhaseStartDate(phase.startDate || '');
    setPhaseEndDate(phase.endDate || '');
    setPhaseIsCurrent(phase.isCurrent);
    // Charger les critères existants pour cette phase (stageOrder = phaseOrder)
    const existing = criteria
      .filter(c => c.stageOrder === phase.phaseOrder)
      .map(c => c.criterion);
    setPhaseCriteria(existing);
    setPhaseError(null);
    setPhaseFormOpen(true);
  };

  const cancelPhaseForm = () => {
    setPhaseFormOpen(false);
    setEditingPhase(null);
    setPhaseCriteria([]);
    setPhaseError(null);
  };

  const handleSavePhase = async () => {
    if (!edition) return;
    if (!phaseTitle.trim()) { setPhaseError('Le titre est obligatoire'); return; }
    setPhaseSaving(true);
    setPhaseError(null);
    try {
      const payload: TimelinePhaseCreate = {
        phaseOrder,
        title: phaseTitle.trim(),
        description: phaseDescription.trim() || undefined,
        startDate: phaseStartDate || undefined,
        endDate: phaseEndDate || undefined,
        isCurrent: phaseIsCurrent,
      };
      if (editingPhase) {
        await contentApi.updateEditionPhase(edition.id, editingPhase.id, payload);
      } else {
        await contentApi.createEditionPhase(edition.id, payload);
      }

      // Synchroniser les critères : supprimer les anciens pour ce stageOrder, recréer
      const existingForOrder = criteria.filter(c => c.stageOrder === phaseOrder);
      await Promise.all(existingForOrder.map(c => contentApi.deleteEditionCriterion(edition.id, c.id)));
      const validCriteria = phaseCriteria.map(s => s.trim()).filter(Boolean);
      await Promise.all(validCriteria.map((text) =>
        contentApi.createEditionCriterion(edition.id, {
          stage: phaseTitle.trim(),
          stageOrder: phaseOrder,
          criterion: text,
        })
      ));

      setPhaseFormOpen(false);
      setEditingPhase(null);
      setPhaseCriteria([]);
      load();
    } catch (err: any) {
      setPhaseError(err?.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setPhaseSaving(false);
    }
  };

  const handleDeletePhase = async (phase: TimelinePhase) => {
    if (!edition) return;
    if (!confirm(`Supprimer la phase "${phase.title}" ?`)) return;
    setDeletingPhaseId(phase.id);
    try {
      await contentApi.deleteEditionPhase(edition.id, phase.id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setDeletingPhaseId(null);
    }
  };

  const movePhase = async (index: number, direction: 'up' | 'down') => {
    if (!edition) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= phases.length) return;

    const sorted = [...phases];
    [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];
    const reordered = sorted.map((p, i) => ({ ...p, phaseOrder: i + 1 }));
    setPhases(reordered);

    try {
      await Promise.all(
        reordered.map(p =>
          contentApi.updateEditionPhase(edition.id, p.id, {
            phaseOrder: p.phaseOrder,
            title: p.title,
            description: p.description,
            startDate: p.startDate,
            endDate: p.endDate,
            isCurrent: p.isCurrent,
          })
        )
      );
    } catch {
      load();
    }
  };

  // ════════════════════════════════════════════
  // RENDU
  // ════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-ioai-blue mx-auto mb-3" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // ── Aucune édition active ──
  if (!edition) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Édition en cours</h1>
          <p className="text-gray-500 mt-2">Gérez l&apos;édition active et ses phases de sélection</p>
        </div>

        {!creatingEdition ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center space-y-4">
              <AlertCircle size={36} className="text-amber-500 mx-auto" />
              <div>
                <p className="font-bold text-amber-700 text-lg">Aucune édition active</p>
                <p className="text-amber-600 text-sm mt-1">Activez une édition existante ou créez-en une nouvelle.</p>
              </div>
              <button
                onClick={startNewEdition}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ioai-blue text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                <Plus size={18} />
                Créer une nouvelle édition
              </button>
            </div>

            {/* Éditions existantes inactives */}
            {allEditions.filter(e => !e.isActive).length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Éditions existantes (inactives)</h3>
                <div className="space-y-2">
                  {allEditions.filter(e => !e.isActive).map(ed => (
                    <div key={ed.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{ed.title}</span>
                        <span className="text-xs text-gray-400 ml-2">({ed.year})</span>
                      </div>
                      <button
                        onClick={() => handleActivateEdition(ed)}
                        disabled={activating === ed.id}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-ioai-green text-white rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-60 transition-all"
                      >
                        {activating === ed.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        Activer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-ioai-blue p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nouvelle édition active</h2>
            <form onSubmit={handleCreateEdition} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
                  <input
                    type="text"
                    required
                    value={editionTitle}
                    onChange={e => setEditionTitle(e.target.value)}
                    placeholder="Ex: AOAI 2026 – Bénin"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-ioai-blue focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Année *</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2100}
                    value={editionYear}
                    onChange={e => setEditionYear(parseInt(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-ioai-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={editionDescription}
                  onChange={e => setEditionDescription(e.target.value)}
                  placeholder="Description courte de l'édition..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-ioai-blue focus:outline-none transition-colors resize-none"
                />
              </div>
              {editionError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{editionError}</p>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={editionSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-ioai-blue text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all">
                  {editionSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Créer et activer
                </button>
                <button type="button" onClick={cancelEditionForm}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                  <X size={16} className="inline mr-1" />Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ── Édition active trouvée ──
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Édition en cours</h1>
          <p className="text-gray-500 mt-1">Gérez l&apos;édition active et ses phases de sélection</p>
        </div>
        <Link href="/admin/contenu/faqs"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-semibold">
          FAQ globale →
        </Link>
      </div>

      {/* ── Carte / formulaire édition ── */}
      {editingEdition ? (
        <div className="bg-white rounded-2xl border-2 border-ioai-blue p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Modifier l&apos;édition</h2>
          <form onSubmit={handleUpdateEdition} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
                <input
                  type="text"
                  required
                  value={editionTitle}
                  onChange={e => setEditionTitle(e.target.value)}
                  placeholder="Ex: AOAI 2026 – Bénin"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-ioai-blue focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Année *</label>
                <input
                  type="number"
                  required
                  min={2020}
                  max={2100}
                  value={editionYear}
                  onChange={e => setEditionYear(parseInt(e.target.value))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-ioai-blue focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={editionDescription}
                onChange={e => setEditionDescription(e.target.value)}
                placeholder="Description courte de l'édition..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-ioai-blue focus:outline-none transition-colors resize-none"
              />
            </div>
            {editionError && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{editionError}</p>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={editionSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-ioai-blue text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all">
                {editionSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Enregistrer
              </button>
              <button type="button" onClick={cancelEditionForm}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                <X size={16} className="inline mr-1" />Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-2xl border-2 border-ioai-green shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{edition.title}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
              </div>
              {edition.description && <p className="text-gray-500 text-sm mb-2">{edition.description}</p>}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} className="text-ioai-blue" />
                <span>Année {edition.year}</span>
                <span className="text-gray-300">•</span>
                <CheckCircle size={14} className="text-ioai-green" />
                <span>{phases.length} phase{phases.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <button onClick={startEditEdition}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-semibold flex-shrink-0">
              <Edit2 size={14} />Modifier
            </button>
          </div>
        </div>
      )}

      {/* ── Phases de sélection ── */}
      <div className="bg-white rounded-2xl border-2 border-gray-200">
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Phases de sélection</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {phases.length === 0
                ? 'Aucune phase — le compte à rebours sera masqué sur le site.'
                : `${phases.length} phase${phases.length !== 1 ? 's' : ''} — la phase "En cours" alimente le compte à rebours.`}
            </p>
          </div>
          {!phaseFormOpen && (
            <button onClick={openNewPhase}
              className="flex items-center gap-2 px-4 py-2 bg-ioai-blue text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold shadow-sm">
              <Plus size={16} />Nouvelle phase
            </button>
          )}
        </div>

        {/* Formulaire phase */}
        {phaseFormOpen && (
          <div className="p-5 bg-blue-50 border-b border-blue-100">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              {editingPhase ? `Modifier : ${editingPhase.title}` : 'Nouvelle phase'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ordre</label>
                  <input
                    type="number"
                    min={1}
                    value={phaseOrder}
                    onChange={e => setPhaseOrder(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-ioai-blue focus:outline-none bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={phaseTitle}
                    onChange={e => setPhaseTitle(e.target.value)}
                    placeholder="Phase 1 : Pré-sélection (QCM)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-ioai-blue focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={phaseDescription}
                  onChange={e => setPhaseDescription(e.target.value)}
                  placeholder="Description de la phase..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-ioai-blue focus:outline-none resize-none bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={phaseStartDate}
                    onChange={e => setPhaseStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-ioai-blue focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={phaseEndDate}
                    onChange={e => setPhaseEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-ioai-blue focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="phaseIsCurrent"
                  checked={phaseIsCurrent}
                  onChange={e => setPhaseIsCurrent(e.target.checked)}
                  className="w-4 h-4 rounded accent-ioai-blue"
                />
                <label htmlFor="phaseIsCurrent" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Phase en cours <span className="text-gray-400 font-normal">(alimente le compte à rebours)</span>
                </label>
              </div>

              {/* Critères de sélection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-600">Critères de sélection</label>
                  <button
                    type="button"
                    onClick={() => setPhaseCriteria(prev => [...prev, ''])}
                    className="flex items-center gap-1 px-2 py-1 bg-ioai-blue text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all"
                  >
                    <Plus size={11} />Ajouter
                  </button>
                </div>
                {phaseCriteria.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Aucun critère — la section critères sera masquée sur le site.</p>
                )}
                <div className="space-y-2">
                  {phaseCriteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c}
                        onChange={e => setPhaseCriteria(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                        placeholder="Ex: Note supérieure à 14/20"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-ioai-blue focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setPhaseCriteria(prev => prev.filter((_, j) => j !== i))}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {phaseError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{phaseError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSavePhase}
                  disabled={phaseSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-ioai-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all"
                >
                  {phaseSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingPhase ? 'Enregistrer' : 'Ajouter la phase'}
                </button>
                <button
                  type="button"
                  onClick={cancelPhaseForm}
                  className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  <X size={14} className="inline mr-1" />Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste phases */}
        <div className="p-5">
          {phases.length === 0 && !phaseFormOpen ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Clock size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">Aucune phase créée.</p>
              <p className="text-gray-400 text-xs mt-1">La section &quot;Parcours de sélection&quot; sera masquée sur le site vitrine.</p>
              <button onClick={openNewPhase}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-ioai-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                <Plus size={14} />Ajouter la première phase
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    phase.isCurrent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                >
                  {/* Réordonner */}
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => movePhase(index, 'up')} disabled={index === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors">
                      <ArrowUp size={12} />
                    </button>
                    <span className="text-xs font-bold text-gray-400 w-5 text-center">{phase.phaseOrder}</span>
                    <button onClick={() => movePhase(index, 'down')} disabled={index === phases.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors">
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{phase.title}</span>
                      {phase.isCurrent && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                          ⏱ En cours
                        </span>
                      )}
                    </div>
                    {(phase.startDate || phase.endDate) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {phase.startDate && new Date(phase.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {phase.startDate && phase.endDate && ' → '}
                        {phase.endDate && new Date(phase.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {phase.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{phase.description}</p>
                    )}
                    {(() => {
                      const count = criteria.filter(c => c.stageOrder === phase.phaseOrder).length;
                      return count > 0 ? (
                        <p className="text-xs text-ioai-green mt-0.5">{count} critère{count > 1 ? 's' : ''}</p>
                      ) : null;
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEditPhase(phase)} title="Modifier"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDeletePhase(phase)} disabled={deletingPhaseId === phase.id} title="Supprimer"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                      {deletingPhaseId === phase.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              {!phaseFormOpen && (
                <button onClick={openNewPhase}
                  className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-ioai-blue hover:text-ioai-blue transition-all mt-2">
                  <Plus size={14} />Ajouter une phase
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── FAQ globale ── */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">FAQ globale</h2>
            <p className="text-xs text-gray-500 mt-0.5">Questions fréquentes affichées sur le site vitrine.</p>
          </div>
          <Link href="/admin/contenu/faqs"
            className="flex items-center gap-2 px-4 py-2 bg-ioai-green text-white rounded-xl hover:bg-green-600 transition-all text-sm font-semibold">
            Gérer les FAQs →
          </Link>
        </div>
      </div>
    </div>
  );
}

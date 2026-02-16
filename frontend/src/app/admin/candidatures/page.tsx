'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, X, Eye, CheckCircle, XCircle, UserCheck, UserX, Mail, MapPin, Phone, Calendar, ChevronLeft, ChevronRight, AlertTriangle, MoreHorizontal, User, School, Heart, FileText, ExternalLink, BookOpen } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';

interface Document {
  id: number;
  name: string;
  type: 'bulletin' | 'photo' | 'cni' | 'autre';
  url: string;
  uploadedAt: string;
}

interface Candidate {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: 'M' | 'F';
  school: string;
  schoolRegion: string;
  score: number | null;
  status: 'validated' | 'pending' | 'rejected';
  email: string;
  phone: string;
  address: string;
  region: string;
  grade: string;
  serie: string;
  registeredAt: string;
  profileComplete: number;
  qcmCompleted: boolean;
  flagged: boolean;
  moyenneT1: string;
  moyenneT2: string;
  moyenneT3: string;
  noteMaths: string;
  noteSciences: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentRelation: string;
  documents: Document[];
  photo: string | null;
}

const regions = ['Tous', 'Atlantique', 'Littoral', 'Ouémé', 'Borgou', 'Zou', 'Alibori', 'Collines', 'Couffo', 'Donga', 'Mono', 'Plateau'];

export default function CandidateList() {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'validated' | 'pending' | 'rejected'>('all');
  const [regionFilter, setRegionFilter] = useState('Tous');
  const [qcmFilter, setQcmFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Charger les candidats depuis l'API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construire les paramètres de filtre
        const params: any = {};
        if (statusFilter !== 'all') {
          params.status = statusFilter === 'validated' ? 'approved' : statusFilter;
        }
        if (regionFilter !== 'Tous') {
          params.region = regionFilter;
        }

        const data = await adminApi.getCandidates(params);

        // Mapper les données de l'API (CandidateListItem) au format attendu par le frontend
        // Les champs sont déjà en camelCase grâce à l'intercepteur du client API
        const mappedCandidates: Candidate[] = data.map((c: any) => {
          return {
            id: c.id,
            name: c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            firstName: c.fullName?.split(' ')[0] || '',
            lastName: c.fullName?.split(' ').slice(1).join(' ') || '',
            birthdate: '',
            gender: (c.gender === 'female' ? 'F' : 'M') as 'M' | 'F',
            school: c.schoolName || '',
            schoolRegion: c.schoolRegion || '',
            score: c.qcmScore ?? null,
            status: c.status === 'registered' ? 'pending' as const :
              c.status === 'rejected' ? 'rejected' as const : 'validated' as const,
            email: c.email,
            phone: '',
            address: '',
            region: c.schoolRegion || '',
            grade: c.grade || '',
            serie: '',
            registeredAt: c.createdAt,
            profileComplete: c.profileCompletion || 0,  // Utilise le pourcentage du backend
            qcmCompleted: c.qcmScore !== null && c.qcmScore !== undefined,
            flagged: false,
            moyenneT1: '',
            moyenneT2: '',
            moyenneT3: '',
            noteMaths: '',
            noteSciences: '',
            parentName: '',
            parentPhone: '',
            parentEmail: '',
            parentRelation: '',
            documents: [],
            photo: null,
          };
        });

        setCandidates(mappedCandidates);
      } catch (err: any) {
        console.error('Erreur lors du chargement des candidats:', err);
        setError(err.response?.data?.detail || 'Erreur lors du chargement des candidats');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [statusFilter, regionFilter]);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesRegion = regionFilter === 'Tous' || c.region === regionFilter;
    const matchesQcm = qcmFilter === 'all' ||
      (qcmFilter === 'completed' && c.qcmCompleted) ||
      (qcmFilter === 'pending' && !c.qcmCompleted);
    return matchesSearch && matchesStatus && matchesRegion && matchesQcm;
  });

  const calculateProfileCompletion = (profile: any): number => {
    const fields = [
      profile.dateOfBirth,
      profile.gender,
      profile.phone,
      profile.address,
      profile.photoUrl,
      profile.schoolId,
      profile.grade,
      profile.parentContact?.name,
      profile.parentContact?.phone,
      profile.academicRecords?.length > 0,
      profile.subjectScores?.length > 0,
      profile.bulletins?.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleViewCandidate = async (candidate: Candidate) => {
    try {
      setLoadingDetails(true);
      // Charger les détails complets du candidat depuis l'API
      const detailedData = await adminApi.getCandidate(candidate.id);

      // Mapper les données complètes au format Candidate
      const fullCandidate: Candidate = {
        ...candidate,
        birthdate: detailedData.profile.dateOfBirth || '',
        gender: (detailedData.profile.gender as 'M' | 'F') || 'M',
        phone: detailedData.profile.phone || '',
        address: detailedData.profile.address || '',
        photo: detailedData.profile.photoUrl || null,
        moyenneT1: detailedData.profile.academicRecords?.find((r: any) => r.trimester === 1)?.average?.toString() || '',
        moyenneT2: detailedData.profile.academicRecords?.find((r: any) => r.trimester === 2)?.average?.toString() || '',
        moyenneT3: detailedData.profile.academicRecords?.find((r: any) => r.trimester === 3)?.average?.toString() || '',
        noteMaths: detailedData.profile.subjectScores?.find((s: any) => s.subject.toLowerCase().includes('math'))?.score?.toString() || '',
        noteSciences: detailedData.profile.subjectScores?.find((s: any) => s.subject.toLowerCase().includes('science') || s.subject.toLowerCase().includes('pc') || s.subject.toLowerCase().includes('svt'))?.score?.toString() || '',
        parentName: detailedData.profile.parentContact?.name || '',
        parentPhone: detailedData.profile.parentContact?.phone || '',
        parentEmail: detailedData.profile.parentContact?.email || '',
        parentRelation: 'Parent', // Vous pouvez ajouter ce champ dans le backend si nécessaire
        documents: detailedData.profile.bulletins?.map((b: any, index: number) => ({
          id: index + 1,
          name: `Bulletin T${b.trimester || ''}.pdf`,
          type: 'bulletin' as const,
          url: b.fileUrl,
          uploadedAt: detailedData.profile.createdAt,
        })) || [],
        profileComplete: calculateProfileCompletion(detailedData.profile),
      };

      setViewingCandidate(fullCandidate);
    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      showError('Erreur lors du chargement des détails du candidat');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Nom', 'Établissement', 'Région', 'Classe', 'Score', 'Statut', 'Email', 'Téléphone', 'Date inscription'];
    const csvData = filteredCandidates.map(c => [
      c.id, c.name, c.school, c.region, c.grade, c.score ?? '-',
      c.status === 'validated' ? 'Validé' : c.status === 'pending' ? 'En attente' : 'Rejeté',
      c.email, c.phone, c.registeredAt
    ]);
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatures_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleValidate = async (id: string) => {
    try {
      const candidate = candidates.find(c => c.id === id);
      if (!candidate) return;

      // Appeler l'API backend pour changer le statut
      await adminApi.updateCandidateStatus(
        id,
        'qcm_pending', // statut qui permet l'accès aux QCM
        'Profil validé par l\'administrateur',
        true // envoyer notification
      );

      // Mettre à jour l'état local
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'validated' as const } : c));
      success('Candidat validé avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la validation:', err);
      showError('Erreur lors de la validation du candidat: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleReject = async (id: string) => {
    try {
      const candidate = candidates.find(c => c.id === id);
      if (!candidate) return;

      // Appeler l'API backend pour changer le statut
      await adminApi.updateCandidateStatus(
        id,
        'rejected',
        'Candidature rejetée par l\'administrateur',
        true // envoyer notification
      );

      // Mettre à jour l'état local
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' as const } : c));
      success('Candidat rejeté');
    } catch (err: any) {
      console.error('Erreur lors du rejet:', err);
      showError('Erreur lors du rejet du candidat: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleBulkAction = async (action: 'validate' | 'reject') => {
    try {
      const newStatus = action === 'validate' ? 'qcm_pending' : 'rejected';

      // Appeler l'API backend pour mise à jour en masse
      await adminApi.bulkUpdateStatus(
        selectedCandidates,
        newStatus as any,
        true // envoyer notification
      );

      // Mettre à jour l'état local
      setCandidates(prev => prev.map(c =>
        selectedCandidates.includes(c.id)
          ? { ...c, status: action === 'validate' ? 'validated' as const : 'rejected' as const }
          : c
      ));
      setSelectedCandidates([]);
      success(`${selectedCandidates.length} candidat(s) ${action === 'validate' ? 'validé(s)' : 'rejeté(s)'}`);
    } catch (err: any) {
      console.error('Erreur lors de l\'action groupée:', err);
      showError('Erreur lors de l\'action groupée: ' + (err.response?.data?.detail || err.message));
    }
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const statusCounts = {
    all: candidates.length,
    validated: candidates.filter(c => c.status === 'validated').length,
    pending: candidates.filter(c => c.status === 'pending').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
  };

  // État de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Erreur de chargement</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-ioai-green text-white rounded-lg hover:bg-green-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900">Gestion des candidatures</h1>
          <p className="text-gray-500">{filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* Tabs de statut */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {[
          { key: 'all', label: 'Tous', count: statusCounts.all },
          { key: 'pending', label: 'En attente', count: statusCounts.pending },
          { key: 'validated', label: 'Validés', count: statusCounts.validated },
          { key: 'rejected', label: 'Rejetés', count: statusCounts.rejected },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as typeof statusFilter)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${statusFilter === tab.key
                ? 'bg-white border-b-2 border-ioai-blue text-ioai-blue'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label} <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, établissement, email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ioai-blue/20 focus:border-ioai-blue"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 border rounded-lg font-medium transition-colors flex items-center gap-2 ${showFilters ? 'border-ioai-blue bg-blue-50 text-ioai-blue' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
        >
          <Filter size={18} />
          Filtres
          {(regionFilter !== 'Tous' || qcmFilter !== 'all') && (
            <span className="w-2 h-2 bg-ioai-blue rounded-full"></span>
          )}
        </button>
      </div>

      {/* Panel de filtres */}
      {showFilters && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filtres avancés</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue/20"
              >
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QCM</label>
              <select
                value={qcmFilter}
                onChange={(e) => setQcmFilter(e.target.value as typeof qcmFilter)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ioai-blue/20"
              >
                <option value="all">Tous</option>
                <option value="completed">QCM complété</option>
                <option value="pending">QCM non complété</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setRegionFilter('Tous'); setQcmFilter('all'); setSearchQuery(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions groupées */}
      {selectedCandidates.length > 0 && (
        <div className="bg-ioai-blue/10 border border-ioai-blue/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-ioai-blue font-medium">{selectedCandidates.length} candidat(s) sélectionné(s)</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('validate')} className="px-4 py-2 bg-ioai-green text-white font-medium rounded-lg hover:bg-green-600 flex items-center gap-2">
              <UserCheck size={18} /> Valider
            </button>
            <button onClick={() => handleBulkAction('reject')} className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 flex items-center gap-2">
              <UserX size={18} /> Rejeter
            </button>
            <button onClick={() => setSelectedCandidates([])} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-ioai-blue focus:ring-ioai-blue"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Candidat</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Établissement</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Région</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Profil</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className={`hover:bg-gray-50 transition-colors ${candidate.flagged ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleSelect(candidate.id)}
                        className="w-4 h-4 rounded border-gray-300 text-ioai-blue focus:ring-ioai-blue"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ioai-blue to-ioai-dark-blue text-white flex items-center justify-center font-bold text-xs">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            {candidate.name}
                            {candidate.flagged && <AlertTriangle size={14} className="text-red-500" />}
                          </p>
                          <p className="text-xs text-gray-500">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{candidate.school}</p>
                      <p className="text-xs text-gray-500">{candidate.grade}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{candidate.region}</td>
                    <td className="px-4 py-3">
                      {candidate.score !== null ? (
                        <span className={`font-bold ${candidate.score >= 80 ? 'text-ioai-green' : candidate.score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {candidate.score}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${candidate.profileComplete === 100 ? 'bg-ioai-green' : 'bg-yellow-400'}`} style={{ width: `${candidate.profileComplete}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{candidate.profileComplete}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${candidate.status === 'validated' ? 'bg-green-100 text-green-700' :
                          candidate.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {candidate.status === 'validated' ? 'Validé' : candidate.status === 'pending' ? 'En attente' : 'Rejeté'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleViewCandidate(candidate)} className="p-2 text-gray-500 hover:text-ioai-blue hover:bg-blue-50 rounded-lg" title="Voir">
                          <Eye size={16} />
                        </button>
                        {candidate.status === 'pending' && (
                          <>
                            <button onClick={() => handleValidate(candidate.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Valider">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => handleReject(candidate.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Rejeter">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun candidat ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

      {/* Modal de visualisation complète */}
      {viewingCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingCandidate(null)}>
          {loadingDetails ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des détails...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-ioai-blue to-ioai-dark-blue text-white">
              <div className="flex items-center gap-4">
                {viewingCandidate.photo ? (
                  <img
                    src={viewingCandidate.photo}
                    alt={viewingCandidate.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-2xl">
                    {viewingCandidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{viewingCandidate.name}</h2>
                  <p className="text-white/80">{viewingCandidate.grade} {viewingCandidate.serie} • {viewingCandidate.school}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${viewingCandidate.status === 'validated' ? 'bg-green-500 text-white' :
                    viewingCandidate.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                      'bg-red-500 text-white'
                  }`}>
                  {viewingCandidate.status === 'validated' ? 'Validé' : viewingCandidate.status === 'pending' ? 'En attente' : 'Rejeté'}
                </span>
                <button onClick={() => setViewingCandidate(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-gray-900">{viewingCandidate.score ?? '-'}{viewingCandidate.score !== null && '%'}</p>
                  <p className="text-xs text-gray-500">Score QCM</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-gray-900">{viewingCandidate.profileComplete}%</p>
                  <p className="text-xs text-gray-500">Profil complété</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-ioai-blue">{viewingCandidate.documents.length}</p>
                  <p className="text-xs text-gray-500">Documents</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-gray-900">{viewingCandidate.qcmCompleted ? '✓' : '✗'}</p>
                  <p className="text-xs text-gray-500">QCM passé</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={18} className="text-ioai-blue" />
                    Informations personnelles
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nom complet</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date de naissance</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.birthdate ? new Date(viewingCandidate.birthdate).toLocaleDateString('fr-FR') : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Genre</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.gender ? (viewingCandidate.gender === 'M' ? 'Masculin' : 'Féminin') : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Téléphone</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Adresse</span>
                      <span className="font-medium text-gray-900 text-right max-w-[200px]">{viewingCandidate.address || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Département</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inscrit le</span>
                      <span className="font-medium text-gray-900">{new Date(viewingCandidate.registeredAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                {/* Scolarité */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <School size={18} className="text-benin-yellow" />
                    Scolarité
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Établissement</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.school}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Département école</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.schoolRegion || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Classe</span>
                      <span className="font-medium text-gray-900">{viewingCandidate.grade} {viewingCandidate.serie || ''}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <p className="text-gray-500 mb-2 flex items-center gap-1"><BookOpen size={14} /> Moyennes trimestrielles</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                          <p className="text-lg font-bold text-gray-900">{viewingCandidate.moyenneT1 || '-'}</p>
                          <p className="text-xs text-gray-400">T1</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                          <p className="text-lg font-bold text-gray-900">{viewingCandidate.moyenneT2 || '-'}</p>
                          <p className="text-xs text-gray-400">T2</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                          <p className="text-lg font-bold text-gray-900">{viewingCandidate.moyenneT3 || '-'}</p>
                          <p className="text-xs text-gray-400">T3</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-gray-500 mb-2">Notes spécifiques</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg text-center">
                          <p className="text-lg font-bold text-ioai-blue">{viewingCandidate.noteMaths || '-'}</p>
                          <p className="text-xs text-gray-500">Maths</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg text-center">
                          <p className="text-lg font-bold text-ioai-green">{viewingCandidate.noteSciences || '-'}</p>
                          <p className="text-xs text-gray-500">Sciences</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Responsable légal */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart size={18} className="text-benin-red" />
                    Responsable légal
                  </h3>
                  {viewingCandidate.parentName ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nom</span>
                        <span className="font-medium text-gray-900">{viewingCandidate.parentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Lien</span>
                        <span className="font-medium text-gray-900">{viewingCandidate.parentRelation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Téléphone</span>
                        <span className="font-medium text-gray-900">{viewingCandidate.parentPhone || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900">{viewingCandidate.parentEmail || '-'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <Heart size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Non renseigné</p>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-purple-600" />
                    Documents fournis
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">{viewingCandidate.documents.length}</span>
                  </h3>
                  {viewingCandidate.documents.length > 0 ? (
                    <div className="space-y-2">
                      {viewingCandidate.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.type === 'bulletin' ? 'bg-blue-100 text-blue-600' :
                                doc.type === 'photo' ? 'bg-green-100 text-green-600' :
                                  doc.type === 'cni' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-gray-100 text-gray-600'
                              }`}>
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-400">Ajouté le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-ioai-blue hover:bg-blue-50 rounded-lg transition-colors" title="Voir le document">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucun document fourni</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Alerte si flagged */}
              {viewingCandidate.flagged && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-700">Candidat signalé</p>
                    <p className="text-sm text-red-600">Ce candidat a été signalé pour suspicion de triche ou comportement suspect.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer avec actions */}
            {viewingCandidate.status === 'pending' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <button onClick={() => { handleValidate(viewingCandidate.id); setViewingCandidate(null); }} className="flex-1 py-3 bg-ioai-green text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 transition-colors">
                  <UserCheck size={18} /> Valider la candidature
                </button>
                <button onClick={() => { handleReject(viewingCandidate.id); setViewingCandidate(null); }} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 flex items-center justify-center gap-2 transition-colors">
                  <UserX size={18} /> Rejeter la candidature
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

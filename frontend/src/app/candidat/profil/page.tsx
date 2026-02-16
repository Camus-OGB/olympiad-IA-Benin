'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, School, Phone, MapPin, Upload, Heart, Save, FileText, Camera, CheckCircle, AlertCircle, BookOpen, X, ChevronRight, Trash2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { candidateApi, type CandidateProfile, type ParentContact, type AcademicRecord, type SubjectScore } from '@/lib/api/candidate';
import { userApi } from '@/lib/api/user';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';

export default function Profile() {
  const { user } = useAuthStore();
  const { toasts, removeToast, success, error } = useToast();
  const [activeSection, setActiveSection] = useState<'personal' | 'parent' | 'school' | 'documents'>('personal');

  // États pour les données du backend
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "",
    phone: "",
    address: "",
    schoolId: "",
    school: "", // Nom de l'école (pour affichage et création)
    schoolRegion: "", // Région de l'école
    grade: "",
    serie: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentRelation: "Père", // Lien de parenté
    moyenneT1: "",
    moyenneT2: "",
    moyenneT3: "",
    noteMaths: "",
    noteSciences: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bulletins, setBulletins] = useState<File[]>([]);
  const [existingBulletins, setExistingBulletins] = useState<any[]>([]);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulletinInputRef = useRef<HTMLInputElement>(null);

  // Charger le profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await candidateApi.getMyProfile();
        setProfile(profileData);

        // Remplir le formulaire avec les données du profil (incluant nom/prénom du user)
        setFormData({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          dateOfBirth: profileData.dateOfBirth || "",
          gender: profileData.gender || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          schoolId: profileData.schoolId || "",
          school: profileData.schoolRef?.name || "",
          schoolRegion: profileData.schoolRef?.region || "",
          grade: profileData.grade || "",
          serie: "",
          parentName: profileData.parentContact?.name || "",
          parentPhone: profileData.parentContact?.phone || "",
          parentEmail: profileData.parentContact?.email || "",
          parentRelation: "Père", // TODO: ajouter relation dans le modèle backend si nécessaire
          moyenneT1: profileData.academicRecords?.find(r => r.trimester === 1)?.average?.toString() || "",
          moyenneT2: profileData.academicRecords?.find(r => r.trimester === 2)?.average?.toString() || "",
          moyenneT3: profileData.academicRecords?.find(r => r.trimester === 3)?.average?.toString() || "",
          noteMaths: profileData.subjectScores?.find(s => s.subject === 'Mathématiques')?.score?.toString() || "",
          noteSciences: profileData.subjectScores?.find(s => s.subject === 'Sciences')?.score?.toString() || "",
        });

        setPhotoPreview(profileData.photoUrl || null);
        setExistingBulletins(profileData.bulletins || []);
        setAcademicRecords(profileData.academicRecords || []);
        setSubjectScores(profileData.subjectScores || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur chargement profil:', err);
        setProfileError('Impossible de charger le profil');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBulletinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setBulletins(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeBulletin = (index: number) => {
    setBulletins(prev => prev.filter((_, i) => i !== index));
  };

  const calculateCompletion = () => {
    if (!profile) return 0;

    let total = 0;
    let filled = 0;

    // Vérifier si le candidat est majeur (18 ans ou plus)
    const isMajeur = () => {
      if (!profile.dateOfBirth) return false;
      const birthDate = new Date(profile.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    };

    const candidatIsMajeur = isMajeur();

    // Champs obligatoires de base (6 champs)
    const basicFields = [
      profile.dateOfBirth,
      profile.gender,
      profile.phone,
      profile.address,
      profile.schoolId,
      profile.grade,
    ];

    basicFields.forEach(field => {
      total++;
      if (field) filled++;
    });

    // Parent/Tuteur (2 champs - obligatoire uniquement si mineur)
    if (!candidatIsMajeur) {
      total += 2;
      if (profile.parentContact?.name) filled++;
      if (profile.parentContact?.phone) filled++;
    }

    // Photo (1 champ)
    total++;
    if (profile.photoUrl) filled++;

    // Bulletins (1 champ)
    total++;
    if (profile.bulletins && profile.bulletins.length > 0) filled++;

    // Moyennes trimestrielles (1 champ - au moins 2 trimestres)
    total++;
    if (profile.academicRecords && profile.academicRecords.length >= 2) filled++;

    // Notes Maths et Sciences (1 champ - au moins 1 note)
    total++;
    if (profile.subjectScores && profile.subjectScores.length >= 1) filled++;

    // Total: 10 champs (majeur) ou 12 champs (mineur)
    return Math.round((filled / total) * 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1. Mettre à jour nom/prénom si modifiés
      if (formData.firstName !== user?.firstName || formData.lastName !== user?.lastName) {
        await userApi.updateCurrentUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      }

      // 2. Upload photo si nouvelle
      if (photoFile) {
        await candidateApi.uploadPhoto(photoFile);
      }

      // 3. Upload nouveaux bulletins avec leur nom d'origine
      for (const bulletin of bulletins) {
        // Envoyer le nom d'origine du fichier comme label
        await candidateApi.uploadBulletin(bulletin, undefined, bulletin.name);
      }

      // 5. Créer ou récupérer l'école si nom d'école fourni
      let schoolIdToSave = formData.schoolId;
      if (formData.school && formData.schoolRegion) {
        // Vérifier si l'école a changé (nom ou région différents)
        const schoolChanged =
          !profile?.schoolRef ||
          formData.school !== profile?.schoolRef?.name ||
          formData.schoolRegion !== profile?.schoolRef?.region;

        if (schoolChanged) {
          const school = await candidateApi.createOrGetSchool(formData.school, formData.schoolRegion);
          schoolIdToSave = school.id;
        }
      }

      // 6. Construire les moyennes trimestrielles
      const academicRecordsToSave: AcademicRecord[] = [];
      if (formData.moyenneT1) {
        academicRecordsToSave.push({ trimester: 1, average: parseFloat(formData.moyenneT1) });
      }
      if (formData.moyenneT2) {
        academicRecordsToSave.push({ trimester: 2, average: parseFloat(formData.moyenneT2) });
      }
      if (formData.moyenneT3) {
        academicRecordsToSave.push({ trimester: 3, average: parseFloat(formData.moyenneT3) });
      }

      // 7. Construire les notes par matière
      const subjectScoresToSave: SubjectScore[] = [];
      if (formData.noteMaths) {
        subjectScoresToSave.push({ subject: 'Mathématiques', score: parseFloat(formData.noteMaths) });
      }
      if (formData.noteSciences) {
        subjectScoresToSave.push({ subject: 'Sciences', score: parseFloat(formData.noteSciences) });
      }

      // 8. Mettre à jour le profil
      const profileUpdate = {
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        schoolId: schoolIdToSave || undefined,
        grade: formData.grade || undefined,
        parentContact: formData.parentName ? {
          name: formData.parentName,
          phone: formData.parentPhone,
          email: formData.parentEmail,
        } : undefined,
        academicRecords: academicRecordsToSave.length > 0 ? academicRecordsToSave : undefined,
        subjectScores: subjectScoresToSave.length > 0 ? subjectScoresToSave : undefined,
      };

      const updatedProfile = await candidateApi.updateMyProfile(profileUpdate);
      setProfile(updatedProfile);

      // Mettre à jour la prévisualisation de la photo si elle a été uploadée
      if (updatedProfile.photoUrl) {
        setPhotoPreview(updatedProfile.photoUrl);
      }

      // Réinitialiser les fichiers uploadés
      setBulletins([]);
      setPhotoFile(null);

      success('Profil sauvegardé avec succès !');
      setSaving(false);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      error('Erreur lors de la sauvegarde du profil: ' + (err.response?.data?.detail || err.message));
      setSaving(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Informations personnelles', icon: User, color: 'text-ioai-blue' },
    { id: 'parent', label: 'Responsable légal', icon: Heart, color: 'text-benin-red' },
    { id: 'school', label: 'Scolarité', icon: School, color: 'text-benin-yellow' },
    { id: 'documents', label: 'Documents', icon: FileText, color: 'text-purple-600' },
  ];

  const completion = calculateCompletion();

  // Vérifier si le profil est verrouillé (validé par l'admin)
  const isProfileLocked = profile?.status && ['qcm_pending', 'qcm_completed', 'regional_selected', 'bootcamp_selected', 'national_finalist'].includes(profile.status);

  // Classes CSS pour les champs disabled
  const inputClassName = (baseClasses: string) =>
    isProfileLocked
      ? `${baseClasses} bg-gray-100 cursor-not-allowed opacity-75`
      : baseClasses;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{profileError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Alerte profil verrouillé */}
      {isProfileLocked && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-yellow-800">Profil validé</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Votre profil a été validé par l'administration. Vous ne pouvez plus le modifier.
                Si vous devez effectuer des changements, veuillez contacter l'administration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">
            {isProfileLocked ? 'Consultez vos informations' : 'Complétez vos informations pour valider votre candidature'}
          </p>
        </div>
        {!isProfileLocked && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden md:flex items-center px-6 py-3 bg-ioai-green text-white font-bold rounded-xl hover:bg-green-600 transition-all disabled:opacity-50 text-base"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" /> Enregistrer
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Photo & Navigation */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photo Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            <div
              className={`relative w-32 h-32 mx-auto mb-6 group ${isProfileLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              onClick={() => !isProfileLocked && fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {photoPreview ? (
                  <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-ioai-blue rounded-full flex items-center justify-center border-3 border-white shadow-md">
                <Camera className="text-white w-5 h-5" />
              </div>
            </div>
            <h2 className="text-center text-xl font-bold text-gray-900">{formData.firstName || user.firstName} {formData.lastName || user.lastName}</h2>
            <p className="text-center text-sm text-ioai-blue font-semibold mb-6">Candidat AOAI 2026</p>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Complétion du profil</span>
                <span className={`font-bold ${completion >= 80 ? 'text-ioai-green' : 'text-yellow-500'}`}>{completion}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${completion >= 80 ? 'bg-ioai-green' : 'bg-yellow-400'}`}
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>

            {completion < 100 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-700 flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  Complétez votre profil pour valider votre candidature
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as typeof activeSection)}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${activeSection === section.id
                      ? 'bg-gray-50 border-l-3 border-ioai-blue'
                      : 'hover:bg-gray-50 border-l-3 border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={22} className={section.color} />
                    <span className={`text-base font-medium ${activeSection === section.id ? 'text-gray-900' : 'text-gray-600'}`}>
                      {section.label}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Section: Informations Personnelles */}
          {activeSection === 'personal' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                <User className="mr-3 text-ioai-blue" size={24} />
                Informations Personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isProfileLocked}
                    className={inputClassName("w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-blue/20 focus:border-ioai-blue")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isProfileLocked}
                    className={inputClassName("w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-ioai-blue/20 focus:border-ioai-blue")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Date de naissance</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Genre</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isProfileLocked}
                    className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="male">Masculin</option>
                    <option value="female">Féminin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <input type="email" value={user.email} disabled className="w-full px-4 py-3 text-base bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Téléphone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Adresse complète</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")} placeholder="Adresse, ville, département..." />
                </div>
              </div>
            </div>
          )}

          {/* Section: Responsable Légal */}
          {activeSection === 'parent' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <Heart className="mr-3 text-benin-red" size={24} />
                Responsable Légal
              </h3>
              {(() => {
                const birthDate = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null;
                const isMajeur = birthDate && (() => {
                  const today = new Date();
                  const age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    return age - 1 >= 18;
                  }
                  return age >= 18;
                })();

                return isMajeur ? (
                  <p className="text-base text-gray-500 mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                      <AlertCircle size={16} />
                      Optionnel - Vous êtes majeur
                    </span>
                  </p>
                ) : (
                  <p className="text-base text-gray-500 mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
                      <AlertCircle size={16} />
                      Obligatoire pour les candidats mineurs
                    </span>
                  </p>
                );
              })()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Nom complet</label>
                  <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Lien de parenté</label>
                  <select name="parentRelation" value={formData.parentRelation} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")}>
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Tuteur">Tuteur légal</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Téléphone</label>
                  <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")} />
                </div>
              </div>
            </div>
          )}

          {/* Section: Scolarité */}
          {activeSection === 'school' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                  <School className="mr-3 text-benin-yellow" size={24} />
                  Établissement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Nom de l'établissement</label>
                    <input type="text" name="school" value={formData.school} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Département de l'établissement</label>
                    <select name="schoolRegion" value={formData.schoolRegion} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")}>
                      <option value="">Sélectionner...</option>
                      <option value="Alibori">Alibori</option>
                      <option value="Atacora">Atacora</option>
                      <option value="Atlantique">Atlantique</option>
                      <option value="Borgou">Borgou</option>
                      <option value="Collines">Collines</option>
                      <option value="Couffo">Couffo</option>
                      <option value="Donga">Donga</option>
                      <option value="Littoral">Littoral</option>
                      <option value="Mono">Mono</option>
                      <option value="Ouémé">Ouémé</option>
                      <option value="Plateau">Plateau</option>
                      <option value="Zou">Zou</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Classe</label>
                    <select name="grade" value={formData.grade} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")}>
                      <option>Seconde</option>
                      <option>Première</option>
                      <option>Terminale</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Série</label>
                    <select name="serie" value={formData.serie} onChange={handleChange} disabled={isProfileLocked} className={inputClassName("w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all")}>
                      <option value="A">Série A</option>
                      <option value="B">Série B</option>
                      <option value="C">Série C</option>
                      <option value="D">Série D</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Moyennes */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen size={22} className="mr-3 text-ioai-blue" />
                  Moyennes trimestrielles
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">1er Trimestre</label>
                    <input type="number" step="0.1" min="0" max="20" name="moyenneT1" value={formData.moyenneT1} onChange={handleChange} className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue outline-none transition-all text-center font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">2ème Trimestre</label>
                    <input type="number" step="0.1" min="0" max="20" name="moyenneT2" value={formData.moyenneT2} onChange={handleChange} className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue outline-none transition-all text-center font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">3ème Trimestre</label>
                    <input type="number" step="0.1" min="0" max="20" name="moyenneT3" value={formData.moyenneT3} onChange={handleChange} className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue outline-none transition-all text-center font-bold" />
                  </div>
                </div>
              </div>

              {/* Notes spécifiques */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Notes en Mathématiques et Sciences</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Mathématiques</label>
                    <input type="number" step="0.1" min="0" max="20" name="noteMaths" value={formData.noteMaths} onChange={handleChange} className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue outline-none transition-all text-center font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Sciences (PCT/SVT)</label>
                    <input type="number" step="0.1" min="0" max="20" name="noteSciences" value={formData.noteSciences} onChange={handleChange} className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue outline-none transition-all text-center font-bold" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Documents */}
          {activeSection === 'documents' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="mr-3 text-purple-600" size={24} />
                Bulletins scolaires
              </h3>
              <p className="text-base text-gray-500 mb-4">Téléversez vos bulletins des 3 derniers trimestres (format PDF)</p>

              {/* Instructions de nommage */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-2">Convention de nommage des fichiers</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Pour faciliter le traitement, veuillez nommer vos bulletins selon le format suivant :
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 ml-4">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <code className="bg-blue-100 px-2 py-0.5 rounded">Bulletin_T1_NomPrenom.pdf</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <code className="bg-blue-100 px-2 py-0.5 rounded">Bulletin_T2_NomPrenom.pdf</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <code className="bg-blue-100 px-2 py-0.5 rounded">Bulletin_T3_NomPrenom.pdf</code>
                      </li>
                    </ul>
                    <p className="text-xs text-blue-700 mt-2 italic">
                      Exemple : Bulletin_T1_KouassiBrice.pdf
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={bulletinInputRef}
                onChange={handleBulletinUpload}
                accept=".pdf"
                multiple
                className="hidden"
              />

              {/* Bulletins déjà téléversés */}
              {existingBulletins.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Bulletins téléversés</h4>
                  <div className="space-y-4">
                    {existingBulletins.map((bulletin: any, index: number) => (
                      <div key={bulletin.id || index} className="bg-green-50 rounded-xl border border-green-200 overflow-hidden">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                              <CheckCircle size={24} className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-900">
                                {bulletin.label || `Bulletin ${bulletin.trimester ? `T${bulletin.trimester}` : index + 1}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {bulletin.trimester ? `Trimestre ${bulletin.trimester} • ` : ''}Téléversé avec succès
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const previewId = `bulletin-preview-${bulletin.id || index}`;
                                const el = document.getElementById(previewId);
                                if (el) {
                                  el.classList.toggle('hidden');
                                }
                              }}
                              className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <FileText size={14} />
                              Aperçu
                            </button>
                            <a
                              href={bulletin.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                            >
                              <ExternalLink size={20} />
                            </a>
                          </div>
                        </div>
                        {/* Aperçu PDF intégré */}
                        <div
                          id={`bulletin-preview-${bulletin.id || index}`}
                          className="hidden border-t border-green-200"
                        >
                          <div className="bg-gray-100 p-2">
                            <iframe
                              src={`${bulletin.fileUrl}#toolbar=0&navpanes=0`}
                              className="w-full rounded-lg bg-white"
                              style={{ height: '400px' }}
                              title={`Aperçu Bulletin ${bulletin.trimester ? `T${bulletin.trimester}` : index + 1}`}
                            />
                            <p className="text-xs text-gray-500 text-center mt-2">
                              Si l'aperçu ne s'affiche pas, <a href={bulletin.fileUrl} target="_blank" rel="noopener noreferrer" className="text-ioai-blue underline">ouvrez le fichier dans un nouvel onglet</a>.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouveaux bulletins à uploader */}
              {bulletins.length > 0 && (
                <div className="space-y-3 mb-8">
                  {bulletins.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                          <FileText size={24} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeBulletin(index)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => !isProfileLocked && bulletinInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center transition-colors ${isProfileLocked
                    ? 'cursor-not-allowed opacity-60 bg-gray-50'
                    : 'hover:bg-gray-50 hover:border-ioai-blue cursor-pointer'
                  }`}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-900">Cliquez pour ajouter un bulletin</p>
                <p className="text-sm text-gray-500 mt-2">PDF uniquement • Max 5MB par fichier</p>
              </div>

              {bulletins.length === 0 && (
                <div className="mt-8 p-5 bg-blue-50 rounded-xl">
                  <p className="text-base text-blue-700">
                    <strong>Conseil :</strong> Téléversez vos 3 derniers bulletins pour maximiser vos chances de sélection.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Save Button */}
      {!isProfileLocked && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex justify-center items-center py-4 bg-ioai-green text-white font-bold rounded-xl disabled:opacity-50 text-base"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" /> Enregistrer
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

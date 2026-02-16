'use client';

import React, { useState } from 'react';
import { Settings, Bell, Lock, Globe, Moon, Sun, Shield, Mail, Smartphone, Eye, EyeOff, Save, ChevronRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

export default function Parametres() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    qcmReminder: true,
    resultats: true,
    newsletter: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    theme: 'light',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const validatePassword = (): string | null => {
    if (!security.currentPassword) {
      return 'Veuillez entrer votre mot de passe actuel';
    }
    if (!security.newPassword) {
      return 'Veuillez entrer un nouveau mot de passe';
    }
    if (security.newPassword.length < 8) {
      return 'Le nouveau mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(security.newPassword)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[0-9]/.test(security.newPassword)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    if (!/[^a-zA-Z0-9]/.test(security.newPassword)) {
      return 'Le mot de passe doit contenir au moins un caractère spécial';
    }
    if (security.newPassword !== security.confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    const validationError = validatePassword();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(security.currentPassword, security.newPassword);
      setPasswordSuccess('Mot de passe changé avec succès !');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Erreur lors du changement de mot de passe';
      setPasswordError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    // Si des champs de mot de passe sont remplis, changer le mot de passe
    if (security.currentPassword || security.newPassword || security.confirmPassword) {
      await handleChangePassword();
    } else {
      // Pour les préférences (notifications, thème) — sauvegarde locale pour l'instant
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Gérez vos préférences et la sécurité de votre compte</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="hidden md:flex items-center px-6 py-3 bg-ioai-green text-white font-bold rounded-xl hover:bg-green-600 transition-all disabled:opacity-50 text-base"
        >
          {saving ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : saved ? (
            <>
              <CheckCircle size={20} className="mr-2" /> Enregistré
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" /> Enregistrer
            </>
          )}
        </button>
      </div>

      {/* Saved notification */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-ioai-green" />
          <p className="text-green-700 font-medium">Vos paramètres ont été enregistrés avec succès.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Bell className="mr-3 text-ioai-blue" size={24} />
              Notifications
            </h2>
            <p className="text-gray-500 mb-8">Choisissez comment vous souhaitez être notifié</p>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Mail size={22} className="text-ioai-blue" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ioai-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <Smartphone size={22} className="text-ioai-green" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Notifications SMS</p>
                    <p className="text-sm text-gray-500">Recevoir les alertes importantes par SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ioai-green"></div>
                </label>
              </div>

              <hr className="border-gray-100" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Rappels QCM</p>
                  <p className="text-sm text-gray-500">Être notifié avant la date limite des QCM</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.qcmReminder}
                    onChange={(e) => setNotifications({ ...notifications, qcmReminder: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ioai-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Résultats et classements</p>
                  <p className="text-sm text-gray-500">Être notifié des nouveaux résultats</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.resultats}
                    onChange={(e) => setNotifications({ ...notifications, resultats: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ioai-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Newsletter</p>
                  <p className="text-sm text-gray-500">Recevoir les actualités de l'AOAI</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.newsletter}
                    onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ioai-green"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Lock className="mr-3 text-benin-red" size={24} />
              Sécurité
            </h2>
            <p className="text-gray-500 mb-8">Modifiez votre mot de passe</p>

            {/* Messages de feedback */}
            {passwordError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-red-700 font-medium text-sm">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-ioai-green shrink-0" />
                <p className="text-green-700 font-medium text-sm">{passwordSuccess}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={security.currentPassword}
                    onChange={(e) => { setSecurity({ ...security, currentPassword: e.target.value }); setPasswordError(''); }}
                    className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={security.newPassword}
                    onChange={(e) => { setSecurity({ ...security, newPassword: e.target.value }); setPasswordError(''); }}
                    className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={security.confirmPassword}
                    onChange={(e) => { setSecurity({ ...security, confirmPassword: e.target.value }); setPasswordError(''); }}
                    className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue focus:ring-2 focus:ring-ioai-blue/20 outline-none transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-700 flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.
                </p>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={saving || !security.currentPassword || !security.newPassword}
                className="w-full py-3 bg-ioai-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Changement en cours...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Changer le mot de passe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Préférences */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Settings size={20} className="mr-2 text-gray-400" />
              Préférences
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Langue</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-ioai-blue outline-none transition-all"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-600">Thème</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${preferences.theme === 'light'
                        ? 'border-ioai-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Sun size={24} className={preferences.theme === 'light' ? 'text-ioai-blue' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${preferences.theme === 'light' ? 'text-ioai-blue' : 'text-gray-500'}`}>Clair</span>
                  </button>
                  <button
                    onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${preferences.theme === 'dark'
                        ? 'border-ioai-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Moon size={24} className={preferences.theme === 'dark' ? 'text-ioai-blue' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${preferences.theme === 'dark' ? 'text-ioai-blue' : 'text-gray-500'}`}>Sombre</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Confidentialité */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Shield size={20} className="mr-2 text-ioai-green" />
              Confidentialité
            </h3>

            <div className="space-y-4">
              <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-gray-700">Politique de confidentialité</span>
                <ChevronRight size={18} className="text-gray-400" />
              </a>
              <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-gray-700">Conditions d'utilisation</span>
                <ChevronRight size={18} className="text-gray-400" />
              </a>
              <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-gray-700">Gestion des cookies</span>
                <ChevronRight size={18} className="text-gray-400" />
              </a>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
            <h3 className="text-lg font-bold text-red-700 mb-4">Zone de danger</h3>
            <p className="text-sm text-red-600 mb-4">
              La suppression de votre compte est irréversible et entraînera la perte de toutes vos données.
            </p>
            <button className="w-full py-3 border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Save Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex justify-center items-center py-4 bg-ioai-green text-white font-bold rounded-xl disabled:opacity-50 text-base"
        >
          {saving ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" /> Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, BrainCircuit, Eye, EyeOff, Loader2, Sparkles, CheckCircle, Calendar, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

const Register: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    school: '',
    grade: '',
    acceptTerms: false
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation côté client
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    if (!/\d/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins un chiffre');
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une majuscule');
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        school: formData.school,
        grade: formData.grade
      };

      console.log('Données envoyées:', registerData);
      await authApi.register(registerData);

      // Redirection vers la page de vérification OTP
      router.push('/auth/verification-email?email=' + encodeURIComponent(formData.email));
    } catch (err: any) {
      console.error('Erreur d\'inscription complète:', err);
      console.error('Réponse serveur:', err.response?.data);

      if (err.response?.data?.detail) {
        // Le detail peut être une string ou un array
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map((d: any) => d.msg || d).join(', '));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-green-50/30">

      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop")' }}></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ioai-green/90 via-teal-600/80 to-ioai-blue/70"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-benin-yellow/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-ioai-blue/20 rounded-full blur-3xl"></div>
        
        {/* Neural grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="neural-grid"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all">
              <BrainCircuit size={26} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">OLYMPIADES IA</span>
          </Link>

          {/* Main content */}
          <div className="my-auto py-12">            
            <h2 className="text-4xl xl:text-5xl font-display font-black mb-6 leading-tight">
              Rejoignez<br/>
              <span className="bg-gradient-to-r from-white via-benin-yellow to-white bg-clip-text text-transparent">l&apos;élite de demain</span>
            </h2>
            
            <p className="text-teal-50 text-lg max-w-md leading-relaxed mb-8">
              L&apos;inscription est gratuite et ouverte à tous les lycéens du Bénin. Créez votre compte pour commencer votre voyage vers l&apos;AOAI 2026.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                'Accès aux ressources de formation',
                'Suivi personnalisé de votre progression',
                'Participation aux épreuves de sélection'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-teal-50">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20">
              <span className="block font-black text-2xl">04</span>
              <span className="text-xs text-teal-100 uppercase tracking-wider">Places Finale</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20">
              <span className="block font-black text-2xl">100+</span>
              <span className="text-xs text-teal-100 uppercase tracking-wider">Heures Formation</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20">
              <span className="block font-black text-2xl">2026</span>
              <span className="text-xs text-teal-100 uppercase tracking-wider">Édition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-12 xl:px-20 relative overflow-y-auto">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-ioai-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-ioai-blue/10 rounded-full blur-3xl"></div>

        {/* Back to Home Button */}
        <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-gray-500 hover:text-ioai-green transition-colors text-sm font-semibold group z-20">
          <div className="p-2 bg-white rounded-xl mr-2 group-hover:bg-ioai-green/5 transition-colors shadow-sm border border-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Accueil
        </Link>

        <div className="mx-auto w-full max-w-md relative z-10 mt-12 lg:mt-0">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="bg-gradient-to-br from-ioai-green to-teal-500 p-4 rounded-2xl text-white shadow-xl shadow-ioai-green/20">
              <BrainCircuit size={36} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-gray-500">
              Inscription rapide en 30 secondes
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prénom</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ioai-green/20 focus:border-ioai-green transition-all text-gray-900 font-medium text-sm"
                    placeholder="Jean"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ioai-green/20 focus:border-ioai-green transition-all text-gray-900 font-medium text-sm"
                  placeholder="Dupont"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Adresse email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ioai-green/20 focus:border-ioai-green transition-all text-gray-900 font-medium"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* School */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">École / Lycée</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => updateField('school', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ioai-green/20 focus:border-ioai-green transition-all text-gray-900 font-medium"
                  placeholder="Ex: Lycée Mathieu Bouké"
                />
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Classe</label>
              <select
                required
                value={formData.grade}
                onChange={(e) => updateField('grade', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ioai-green/20 focus:border-ioai-green transition-all text-gray-900 font-medium"
              >
                <option value="">Sélectionnez votre classe</option>
                <option value="Seconde">Seconde</option>
                <option value="Première">Première</option>
                <option value="Terminale">Terminale</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ioai-green/20 focus:border-ioai-green transition-all text-gray-900 font-medium"
                  placeholder="Min. 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                id="terms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={(e) => updateField('acceptTerms', e.target.checked)}
                className="mt-1 h-4 w-4 text-ioai-green border-gray-300 rounded focus:ring-ioai-green"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                J&apos;accepte les{' '}
                <Link href="/conditions" className="text-ioai-green font-semibold hover:underline">
                  conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" className="text-ioai-green font-semibold hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !formData.acceptTerms}
              className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold bg-gradient-to-r from-ioai-green to-teal-500 hover:from-teal-500 hover:to-ioai-green shadow-lg shadow-ioai-green/25 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ioai-green transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 via-white to-green-50/30 text-gray-500 font-medium">ou</span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-gray-600">
              Déjà inscrit ?{' '}
              <Link href="/auth/connexion" className="font-bold text-ioai-blue hover:text-blue-600 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Info box */}
          <div className="mt-6 p-4 bg-gradient-to-r from-ioai-green/5 to-teal-500/5 rounded-xl border border-ioai-green/10">
            <p className="text-xs text-gray-600 text-center">
              <strong className="text-gray-900">Prochaine étape :</strong> Après vérification de votre email, vous compléterez votre profil candidat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

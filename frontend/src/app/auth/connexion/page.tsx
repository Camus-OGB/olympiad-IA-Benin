'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, BrainCircuit, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

const Login: React.FC = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      });

      // Stocker l'utilisateur dans le store
      setUser(response.user);

      // Redirection selon le rôle
      if (response.user.role === 'admin' || response.user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/candidat/dashboard');
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1920&auto=format&fit=crop")' }}></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ioai-blue/90 via-blue-600/80 to-ioai-green/70"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-benin-yellow/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-ioai-green/20 rounded-full blur-3xl"></div>

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
              Bienvenue sur<br/>
              <span className="bg-gradient-to-r from-white via-benin-yellow to-white bg-clip-text text-transparent">votre plateforme</span>
            </h2>

            <p className="text-blue-50 text-lg max-w-md leading-relaxed mb-8">
              Connectez-vous pour accéder à votre espace candidat, suivre votre progression et participer aux épreuves de sélection.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                'Tableau de bord personnalisé',
                'Accès aux QCM et ressources',
                'Suivi de votre progression'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-blue-50">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20">
              <span className="block font-black text-2xl">2026</span>
              <span className="text-xs text-blue-100 uppercase tracking-wider">Édition</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20">
              <span className="block font-black text-2xl">24/7</span>
              <span className="text-xs text-blue-100 uppercase tracking-wider">Accès</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 xl:px-20 relative">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-ioai-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-ioai-green/10 rounded-full blur-3xl"></div>

        {/* Back to Home Button */}
        <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-gray-500 hover:text-ioai-blue transition-colors text-sm font-semibold group z-20">
          <div className="p-2 bg-white rounded-xl mr-2 group-hover:bg-ioai-blue/5 transition-colors shadow-sm border border-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Accueil
        </Link>

        <div className="mx-auto w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-gradient-to-br from-ioai-blue to-blue-500 p-4 rounded-2xl text-white shadow-xl shadow-ioai-blue/20">
              <BrainCircuit size={36} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-500">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
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
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ioai-blue/20 focus:border-ioai-blue transition-all text-gray-900 font-medium"
                  placeholder="votre@email.com"
                  disabled={loading}
                />
              </div>
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
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ioai-blue/20 focus:border-ioai-blue transition-all text-gray-900 font-medium"
                  placeholder="Votre mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link href="/auth/mot-de-passe-oublie" className="text-sm font-semibold text-ioai-blue hover:text-blue-600 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold bg-gradient-to-r from-ioai-blue to-blue-500 hover:from-blue-500 hover:to-ioai-blue shadow-lg shadow-ioai-blue/25 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ioai-blue transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-gray-500 font-medium">ou</span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link href="/auth/inscription" className="font-bold text-ioai-green hover:text-teal-600 transition-colors">
                S&apos;inscrire
              </Link>
            </p>
          </div>

          {/* Info box */}
          <div className="mt-8 p-4 bg-gradient-to-r from-ioai-blue/5 to-blue-500/5 rounded-xl border border-ioai-blue/10">
            <p className="text-xs text-gray-600 text-center">
              <strong className="text-gray-900">Besoin d&apos;aide ?</strong> Contactez-nous à{' '}
              <a href="mailto:support@olympiades-ia.bj" className="text-ioai-blue font-semibold hover:underline">
                support@olympiades-ia.bj
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

'use client';

import React from 'react';
import { Lock, ArrowRight, BrainCircuit, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ResetPassword: React.FC = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/connexion');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
         <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop")' }}></div>
         <div className="absolute inset-0 bg-gradient-to-tr from-ioai-green/80 to-ioai-blue/80"></div>
         <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
            <Link href="/" className="flex items-center space-x-3">
               <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
                 <BrainCircuit size={28} />
               </div>
               <span className="font-display font-bold text-xl tracking-tight">OLYMPIADES IA</span>
            </Link>
            <div className="mb-20">
              <h2 className="text-3xl font-display font-black mb-4">Nouveau départ.</h2>
              <p className="text-white/90">Choisissez un mot de passe sécurisé pour protéger votre avancement.</p>
            </div>
         </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative bg-slate-50">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-ioai-dark-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-ioai-dark-blue">
               <Lock size={32} />
             </div>
             <h2 className="text-2xl font-display font-black text-gray-900">Réinitialisation</h2>
             <p className="mt-2 text-sm text-gray-600">
               Créez votre nouveau mot de passe.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-bold text-gray-700">Nouveau mot de passe</label>
              <div className="mt-2 relative">
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-ioai-green focus:border-ioai-green sm:text-sm bg-white focus:bg-white transition-all"
                  placeholder="Minimum 8 caractères"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-700">Confirmer le mot de passe</label>
              <div className="mt-2 relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-ioai-green focus:border-ioai-green sm:text-sm bg-white focus:bg-white transition-all"
                  placeholder="Répétez le mot de passe"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-ioai-dark-blue hover:bg-ioai-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ioai-blue transition-all"
            >
              Confirmer <CheckCircle className="ml-2 w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

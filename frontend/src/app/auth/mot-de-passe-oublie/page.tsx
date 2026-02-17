'use client';

import React from 'react';
import { Mail, ArrowRight, ArrowLeft, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ForgotPassword: React.FC = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/verification-otp');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
         <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1920&auto=format&fit=crop")' }}></div>
         <div className="absolute inset-0 bg-gradient-to-r from-ioai-dark-blue/90 to-ioai-blue/60"></div>
         <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
            <Link href="/" className="flex items-center space-x-3">
               <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
                 <BrainCircuit size={28} />
               </div>
               <span className="font-display font-bold text-xl tracking-tight">OLYMPIADES IA</span>
            </Link>
            <div className="mb-20">
              <h2 className="text-3xl font-display font-black mb-4">Ne perdez pas le fil.</h2>
              <p className="text-blue-100">Nous vous aiderons à récupérer l'accès à votre espace en quelques secondes.</p>
            </div>
         </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative bg-slate-50">
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-8 inline-flex items-center text-gray-500 hover:text-ioai-dark-blue transition-colors text-sm font-bold group"
        >
           <div className="p-2 bg-white rounded-full mr-3 group-hover:bg-gray-100 transition-colors shadow-sm">
             <ArrowLeft className="w-4 h-4" />
           </div>
           Retour
        </button>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-ioai-blue">
               <Mail size={32} />
             </div>
             <h2 className="text-2xl font-display font-black text-gray-900">Mot de passe oublié ?</h2>
             <p className="mt-2 text-sm text-gray-600">
               Entrez votre email et nous vous enverrons un code de réinitialisation.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-ioai-green focus:border-ioai-green sm:text-sm bg-white focus:bg-white transition-all"
                  placeholder="exemple@ecole.bj"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-ioai-dark-blue hover:bg-ioai-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ioai-blue transition-all"
            >
              Envoyer le code <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

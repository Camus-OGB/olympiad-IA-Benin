'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, ShieldCheck, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const VerifyOtp: React.FC = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/reinitialisation-mot-de-passe');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
         <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1563206767-5b1d972e8136?q=80&w=1920&auto=format&fit=crop")' }}></div>
         <div className="absolute inset-0 bg-gradient-to-r from-ioai-dark-blue/90 to-ioai-green/60"></div>
         <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
            <Link href="/" className="flex items-center space-x-3">
               <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
                 <BrainCircuit size={28} />
               </div>
               <span className="font-display font-bold text-xl tracking-tight">OLYMPIADES IA</span>
            </Link>
            <div className="mb-20">
              <h2 className="text-3xl font-display font-black mb-4">Sécurité avant tout.</h2>
              <p className="text-green-50">La protection de vos données et de votre compte est notre priorité.</p>
            </div>
         </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative bg-slate-50">
        <Link href="/mot-de-passe-oublie" className="absolute top-8 left-8 inline-flex items-center text-gray-500 hover:text-ioai-dark-blue transition-colors text-sm font-bold group">
           <div className="p-2 bg-white rounded-full mr-3 group-hover:bg-gray-100 transition-colors shadow-sm">
             <ArrowLeft className="w-4 h-4" />
           </div>
           Retour
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-ioai-green">
               <ShieldCheck size={32} />
             </div>
             <h2 className="text-2xl font-display font-black text-gray-900">Vérification</h2>
             <p className="mt-2 text-sm text-gray-600">
               Nous avons envoyé un code à <strong>e***@ecole.bj</strong>.
               <br/>Entrez-le ci-dessous.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ioai-green focus:border-ioai-green transition-all bg-white"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-ioai-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ioai-green transition-all"
            >
              Vérifier le code
            </button>

            <div className="text-center">
              <button type="button" className="text-sm text-gray-500 hover:text-ioai-blue font-semibold">
                Renvoyer le code
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

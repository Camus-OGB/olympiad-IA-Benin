'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, MailCheck, BrainCircuit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

const VerifyEmailClient: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError(''); // Clear error when user types

        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Veuillez entrer les 6 chiffres du code');
            return;
        }

        if (!email) {
            setError('Email manquant. Veuillez recommencer l\'inscription.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authApi.verifyOtp(email, otpCode);

            // Redirection vers la page de connexion après vérification
            router.push('/auth/connexion?verified=true');
        } catch (err: any) {
            console.error('Erreur de vérification:', err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Code invalide ou expiré');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError('Email manquant');
            return;
        }

        setResendLoading(true);
        setError('');
        setResendSuccess(false);

        try {
            await authApi.resendOtp(email);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 3000);
        } catch (err: any) {
            console.error('Erreur lors du renvoi:', err);
            setError('Impossible de renvoyer le code');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Visual Side */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1563206767-5b1d972e8136?q=80&w=1920&auto=format&fit=crop")' }}></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-ioai-green/80 to-ioai-blue/60"></div>
                <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
                            <BrainCircuit size={28} />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight">OLYMPIADES IA</span>
                    </Link>
                    <div className="mb-20">
                        <h2 className="text-3xl font-display font-black mb-4 leading-tight">Vérifiez votre<br />adresse email.</h2>
                        <p className="text-white/80 text-lg">Dernière étape avant de rejoindre la communauté.</p>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative bg-slate-50">
                <Link href="/auth/inscription" className="absolute top-8 left-8 inline-flex items-center text-gray-500 hover:text-ioai-green transition-colors text-sm font-bold group">
                    <div className="p-2 bg-white rounded-full mr-3 group-hover:bg-green-50 transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Retour
                </Link>

                <div className="mx-auto w-full max-w-sm lg:w-96 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-ioai-green animate-bounce-slow">
                        <MailCheck size={40} />
                    </div>

                    <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Code de vérification</h2>
                    <p className="text-gray-600 mb-8">
                        Nous avons envoyé un code à 6 chiffres à<br />
                        <strong className="text-gray-900">{email || 'votre email'}</strong>.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {resendSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm text-green-600 text-center font-medium">Code renvoyé avec succès !</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex justify-center gap-2 sm:gap-4">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!/^\d*$/.test(val)) return;
                                        handleChange(index, val);
                                    }}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-ioai-green focus:ring-4 focus:ring-ioai-green/10 outline-none transition-all bg-white text-gray-800"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full py-4 px-4 bg-ioai-green hover:bg-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Valider mon compte'
                            )}
                        </button>

                        <div className="text-sm text-gray-500">
                            Vous n&apos;avez rien reçu ?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="font-bold text-ioai-blue hover:text-ioai-dark-blue underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailClient;

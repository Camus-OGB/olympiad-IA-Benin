'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Edit, Trash, Play, AlertTriangle } from 'lucide-react';
import { qcmApi } from '@/lib/api/qcm';

export default function QcmSessions() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les sessions depuis l'API
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await qcmApi.getAllSessions();
                setSessions(data);
            } catch (err: any) {
                console.error('Erreur lors du chargement des sessions:', err);
                setError(err.response?.data?.detail || 'Erreur lors du chargement des sessions');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // État de chargement
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ioai-green mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des sessions...</p>
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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900">Sessions QCM</h1>
                    <p className="text-gray-500 mt-2">Gérez les examens et leur planification. {sessions.length} session{sessions.length > 1 ? 's' : ''}</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-ioai-green text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
                    <Plus size={18} className="mr-2" /> Nouvelle Session
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nom de la session</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date & Durée</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Participants</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Statut</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sessions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Aucune session QCM disponible. Créez-en une pour commencer.
                                </td>
                            </tr>
                        ) : (
                            sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 block">{session.title}</span>
                                        <span className="text-xs text-gray-400">ID: #{session.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-600 mb-1">
                                            <Calendar size={14} className="mr-2 text-gray-400" /> 
                                            {new Date(session.startDate).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock size={14} className="mr-2 text-gray-400" /> {session.duration} min
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">0</span>
                                        <span className="text-xs text-gray-400 ml-1">inscrits</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            session.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {session.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-ioai-blue hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

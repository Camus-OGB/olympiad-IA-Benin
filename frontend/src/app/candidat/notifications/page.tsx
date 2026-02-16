'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Check, Loader2, AlertCircle, Calendar, Newspaper, Award, FileText } from 'lucide-react';
import { candidateApi } from '@/lib/api/candidate';
import { contentApi, type NewsItem } from '@/lib/api/content';

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning';
    title: string;
    message: string;
    date: string;
    read: boolean;
    source: 'dashboard' | 'news' | 'system';
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const allNotifications: Notification[] = [];

                // 1. Récupérer les notifications du dashboard (backend)
                try {
                    const dashboard = await candidateApi.getMyDashboard();

                    if (dashboard.notifications && dashboard.notifications.length > 0) {
                        dashboard.notifications.forEach((notif: string, index: number) => {
                            allNotifications.push({
                                id: `dashboard-${index}`,
                                type: notif.toLowerCase().includes('complét') || notif.toLowerCase().includes('validé') || notif.toLowerCase().includes('succès')
                                    ? 'success'
                                    : notif.toLowerCase().includes('attention') || notif.toLowerCase().includes('manqu')
                                        ? 'warning'
                                        : 'info',
                                title: notif.length > 60 ? notif.substring(0, 57) + '...' : notif,
                                message: notif,
                                date: 'Maintenant',
                                read: false,
                                source: 'dashboard',
                            });
                        });
                    }

                    // 2. Ajouter des notifications basées sur le profil
                    if (dashboard.profileCompletion < 100) {
                        allNotifications.push({
                            id: 'profile-incomplete',
                            type: 'warning',
                            title: 'Profil incomplet',
                            message: `Votre profil est complété à ${Math.round(dashboard.profileCompletion)}%. Complétez-le pour accéder à toutes les fonctionnalités.`,
                            date: 'Maintenant',
                            read: false,
                            source: 'system',
                        });
                    }

                    // Status-based notifications
                    const statusMessages: Record<string, { title: string; message: string; type: 'info' | 'success' | 'warning' }> = {
                        'registered': {
                            title: 'Inscription confirmée',
                            message: 'Votre inscription a bien été prise en compte. Complétez votre profil pour la suite.',
                            type: 'info',
                        },
                        'qcm_pending': {
                            title: 'QCM disponible !',
                            message: 'Un QCM est disponible pour vous. Passez-le avant la date limite !',
                            type: 'warning',
                        },
                        'qcm_completed': {
                            title: 'QCM complété',
                            message: 'Vous avez terminé votre QCM. Les résultats seront annoncés prochainement.',
                            type: 'success',
                        },
                        'regional_selected': {
                            title: '🎉 Sélectionné pour la formation régionale',
                            message: 'Félicitations ! Vous avez été sélectionné pour participer à la formation régionale.',
                            type: 'success',
                        },
                        'bootcamp_selected': {
                            title: '🏆 Sélectionné pour le bootcamp',
                            message: 'Bravo ! Vous faites partie des candidats sélectionnés pour le bootcamp national.',
                            type: 'success',
                        },
                        'national_finalist': {
                            title: '🥇 Finaliste national',
                            message: 'Félicitations ! Vous êtes finaliste national et représenterez le Bénin à l\'IOAI.',
                            type: 'success',
                        },
                    };

                    const status = dashboard.profile?.status;
                    if (status && statusMessages[status]) {
                        const msg = statusMessages[status];
                        allNotifications.push({
                            id: `status-${status}`,
                            type: msg.type,
                            title: msg.title,
                            message: msg.message,
                            date: 'Récent',
                            read: true,
                            source: 'system',
                        });
                    }
                } catch (err) {
                    console.warn('Erreur dashboard pour notifications:', err);
                }

                // 3. Récupérer les actualités récentes comme notifications
                try {
                    const news = await contentApi.getNews({ limit: 3, publishedOnly: true });
                    news.forEach((item: NewsItem) => {
                        const publishedDate = item.publishedAt ? new Date(item.publishedAt) : new Date(item.createdAt);
                        const now = new Date();
                        const diffDays = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));

                        let dateLabel = '';
                        if (diffDays === 0) dateLabel = "Aujourd'hui";
                        else if (diffDays === 1) dateLabel = 'Hier';
                        else if (diffDays < 7) dateLabel = `Il y a ${diffDays} jours`;
                        else if (diffDays < 30) dateLabel = `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
                        else dateLabel = publishedDate.toLocaleDateString('fr-FR');

                        allNotifications.push({
                            id: `news-${item.id}`,
                            type: 'info',
                            title: item.title,
                            message: item.excerpt || item.content?.substring(0, 150) || '',
                            date: dateLabel,
                            read: true,
                            source: 'news',
                        });
                    });
                } catch (err) {
                    console.warn('Erreur récupération news pour notifications:', err);
                }

                // Si aucune notification, ajouter un message par défaut
                if (allNotifications.length === 0) {
                    allNotifications.push({
                        id: 'welcome',
                        type: 'info',
                        title: 'Bienvenue',
                        message: "Bienvenue sur la plateforme des Olympiades IA Bénin 2026. Vous recevrez ici les notifications importantes.",
                        date: 'Maintenant',
                        read: true,
                        source: 'system',
                    });
                }

                setNotifications(allNotifications);
                setLoading(false);
            } catch (err: any) {
                console.error('Erreur chargement notifications:', err);
                setError('Impossible de charger les notifications');
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-ioai-blue mx-auto mb-4" />
                    <p className="text-gray-600">Chargement des notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const getNotifIcon = (notif: Notification) => {
        if (notif.source === 'news') return <Newspaper size={24} />;
        if (notif.type === 'success') return <CheckCircle size={24} />;
        if (notif.type === 'warning') return <AlertTriangle size={24} />;
        return <Info size={24} />;
    };

    const getNotifColors = (notif: Notification) => {
        if (notif.source === 'news') return 'bg-purple-100 text-purple-600';
        if (notif.type === 'success') return 'bg-green-100 text-green-600';
        if (notif.type === 'warning') return 'bg-yellow-100 text-yellow-600';
        return 'bg-blue-100 text-blue-600';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900">Notifications</h1>
                    <p className="text-gray-500 mt-2">
                        Restez informé des dernières nouvelles.
                        {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-ioai-blue text-white">
                                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-ioai-blue hover:underline flex items-center gap-1"
                    >
                        <Check size={16} />
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div key={notif.id} className={`bg-white rounded-2xl p-6 border transition-all hover:bg-gray-50 flex gap-5 ${notif.read ? 'border-gray-100 opacity-80' : 'border-blue-100 shadow-sm'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getNotifColors(notif)}`}>
                            {getNotifIcon(notif)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-bold text-lg ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                                    {notif.source === 'news' && (
                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">Actualité</span>
                                    )}
                                </div>
                                {!notif.read && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></span>}
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-3">{notif.message}</p>
                            <div className="flex items-center text-xs text-gray-400 font-medium">
                                <Clock size={12} className="mr-1.5" /> {notif.date}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

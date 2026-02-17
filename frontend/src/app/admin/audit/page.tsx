'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Shield, Loader2, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { adminApi, AuditLogEntry } from '@/lib/api/admin';

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  update_candidate_status: { label: 'Statut candidat modifié', icon: '🔄', color: 'text-blue-700', bg: 'bg-blue-50' },
  bulk_update_status:      { label: 'Mise à jour en masse',    icon: '📋', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  delete_candidate:        { label: 'Candidat supprimé',       icon: '🗑️', color: 'text-red-700', bg: 'bg-red-50' },
  create_user:             { label: 'Utilisateur créé',         icon: '👤', color: 'text-green-700', bg: 'bg-green-50' },
  update_user:             { label: 'Utilisateur modifié',      icon: '✏️', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  toggle_user_status:      { label: 'Statut utilisateur',       icon: '🔒', color: 'text-orange-700', bg: 'bg-orange-50' },
  delete_user:             { label: 'Utilisateur supprimé',     icon: '🗑️', color: 'text-red-700', bg: 'bg-red-50' },
  create_news:             { label: 'Actualité créée',           icon: '📰', color: 'text-teal-700', bg: 'bg-teal-50' },
  update_news:             { label: 'Actualité modifiée',        icon: '📝', color: 'text-teal-700', bg: 'bg-teal-50' },
  delete_news:             { label: 'Actualité supprimée',       icon: '🗑️', color: 'text-red-700', bg: 'bg-red-50' },
  create_edition:          { label: 'Édition créée',             icon: '🗓️', color: 'text-purple-700', bg: 'bg-purple-50' },
  update_edition:          { label: 'Édition modifiée',          icon: '🗓️', color: 'text-purple-700', bg: 'bg-purple-50' },
  create_past_edition:     { label: 'Bilan créé',                icon: '📚', color: 'text-gray-700', bg: 'bg-gray-50' },
  update_past_edition:     { label: 'Bilan modifié',             icon: '📚', color: 'text-gray-700', bg: 'bg-gray-50' },
};

const RESOURCE_TYPES = [
  { value: '', label: 'Toutes les ressources' },
  { value: 'candidate', label: 'Candidats' },
  { value: 'user', label: 'Utilisateurs' },
  { value: 'edition', label: 'Éditions' },
  { value: 'past_edition', label: 'Bilans' },
  { value: 'news', label: 'Actualités' },
];

const PAGE_SIZE = 50;

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterResourceType, setFilterResourceType] = useState('');

  const fetchLogs = useCallback(async (pageNum: number, resourceType: string) => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs({
        skip: pageNum * PAGE_SIZE,
        limit: PAGE_SIZE,
        resourceType: resourceType || undefined,
      });
      setLogs(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page, filterResourceType);
  }, [page, filterResourceType, fetchLogs]);

  const handleFilterChange = (value: string) => {
    setFilterResourceType(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900">Journal d&apos;audit</h1>
          <p className="text-gray-500 mt-1">Historique complet des actions effectuées sur la plateforme</p>
        </div>
        <button
          onClick={() => fetchLogs(page, filterResourceType)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
        >
          <RefreshCw size={16} />
          Rafraîchir
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={16} className="text-gray-400" />
            <span className="font-medium">Ressource</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterResourceType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:border-ioai-blue focus:outline-none min-w-[220px]"
            >
              {RESOURCE_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-ioai-blue" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Shield size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune action enregistrée</p>
            <p className="text-gray-400 text-sm mt-1">Les actions admin apparaîtront ici dès qu&apos;elles seront effectuées.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date/Heure</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Ressource</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Détails</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const evt = ACTION_LABELS[log.action] || { label: log.action, icon: '•', color: 'text-gray-600', bg: 'bg-gray-50' };
                  let parsedDetails: Record<string, any> | null = null;
                  try { parsedDetails = log.details ? JSON.parse(log.details) : null; } catch {}
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: '2-digit', year: '2-digit',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 font-medium truncate max-w-[160px] block">{log.adminEmail}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${evt.bg} ${evt.color}`}>
                          <span>{evt.icon}</span>
                          {evt.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          {log.resourceLabel && (
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{log.resourceLabel}</p>
                          )}
                          {log.resourceType && (
                            <p className="text-xs text-gray-400">{log.resourceType}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {parsedDetails ? (
                          <span className="text-xs text-gray-500 font-mono truncate max-w-[200px] block">
                            {Object.entries(parsedDetails)
                              .filter(([k]) => !['candidate_ids'].includes(k))
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-gray-400 font-mono">{log.ipAddress || '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Entrées {page * PAGE_SIZE + 1} – {page * PAGE_SIZE + logs.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700">Page {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

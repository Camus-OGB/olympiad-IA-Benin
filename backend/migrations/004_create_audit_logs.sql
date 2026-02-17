-- Migration: Création de la table audit_logs
-- Date: 2026-02-17
-- Description: Journal d'audit pour tracer toutes les actions effectuées par les admins

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR PRIMARY KEY,

    -- Admin qui a effectué l'action
    admin_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    admin_email VARCHAR NOT NULL,

    -- Action effectuée
    action VARCHAR NOT NULL,
    -- Ex: update_candidate_status, delete_candidate, create_user, create_edition...

    -- Ressource affectée
    resource_type VARCHAR NOT NULL,
    -- Ex: candidate, user, edition, past_edition, faq, news, partner
    resource_id VARCHAR,
    resource_label VARCHAR,

    -- Détails supplémentaires (JSON)
    details TEXT,

    -- Méta
    ip_address VARCHAR,

    -- Timestamp (pas d'updated_at : un log ne se modifie pas)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id
    ON audit_logs(admin_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
    ON audit_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
    ON audit_logs(action);

-- Migration: Création de la table general_testimonials
-- Date: 2026-02-16
-- Description: Créer la table pour les témoignages généraux (mentors, parents, sponsors, etc.)

CREATE TABLE IF NOT EXISTS general_testimonials (
    id VARCHAR PRIMARY KEY,

    -- Informations de l'auteur
    author_name VARCHAR NOT NULL,
    author_role VARCHAR,  -- Ex: "Mentor", "Parent", "Sponsor"
    author_type VARCHAR,  -- Ex: "mentor", "parent", "sponsor", "partner"

    -- Contenu
    content TEXT NOT NULL,

    -- Médias
    photo_url VARCHAR,
    video_url VARCHAR,

    -- Organisation/Affiliation
    organization VARCHAR,

    -- Ordre d'affichage
    display_order INTEGER DEFAULT 0,

    -- Publication
    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_general_testimonials_published
    ON general_testimonials(is_published);

CREATE INDEX IF NOT EXISTS idx_general_testimonials_type
    ON general_testimonials(author_type);

CREATE INDEX IF NOT EXISTS idx_general_testimonials_order
    ON general_testimonials(display_order);

-- Note: Cette migration est compatible avec PostgreSQL

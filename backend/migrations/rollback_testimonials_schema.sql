-- Rollback: Revenir à l'ancien schéma de la table testimonials
-- Date: 2026-02-16
-- Description: Annuler les changements de update_testimonials_schema.sql

-- Supprimer la colonne school
ALTER TABLE testimonials
  DROP COLUMN IF EXISTS school;

-- Ajouter la colonne video_url
ALTER TABLE testimonials
  ADD COLUMN video_url VARCHAR;

-- Renommer les colonnes pour revenir à l'ancien schéma
ALTER TABLE testimonials
  RENAME COLUMN image_url TO photo_url;

ALTER TABLE testimonials
  RENAME COLUMN quote TO content;

ALTER TABLE testimonials
  RENAME COLUMN role TO author_role;

ALTER TABLE testimonials
  RENAME COLUMN student_name TO author_name;

-- Note: Cette migration de rollback est compatible avec PostgreSQL

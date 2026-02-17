-- Migration: Mise à jour du schéma de la table testimonials
-- Date: 2026-02-16
-- Description: Renommer les colonnes pour correspondre au contexte d'éditions passées
--              (témoignages d'élèves participants)

-- Renommer les colonnes
ALTER TABLE testimonials
  RENAME COLUMN author_name TO student_name;

ALTER TABLE testimonials
  RENAME COLUMN author_role TO role;

ALTER TABLE testimonials
  RENAME COLUMN content TO quote;

ALTER TABLE testimonials
  RENAME COLUMN photo_url TO image_url;

-- Ajouter la colonne school (établissement scolaire)
ALTER TABLE testimonials
  ADD COLUMN school VARCHAR;

-- Supprimer la colonne video_url (non utilisée dans ce contexte)
ALTER TABLE testimonials
  DROP COLUMN IF EXISTS video_url;

-- Note: Cette migration est compatible avec PostgreSQL
-- Assurez-vous de sauvegarder votre base de données avant d'exécuter cette migration

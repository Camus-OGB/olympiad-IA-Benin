-- Migration 003: Ajout du champ external_url à la table news
-- Permet d'associer un article de presse externe à une actualité

ALTER TABLE news
ADD COLUMN IF NOT EXISTS external_url TEXT DEFAULT NULL;

COMMENT ON COLUMN news.external_url IS 'Lien vers l''article original (presse, blog externe, etc.)';

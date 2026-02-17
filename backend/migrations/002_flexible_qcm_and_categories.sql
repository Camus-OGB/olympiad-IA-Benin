-- Migration: QCM flexible (2-6 réponses) et catégories gérées
-- Auteur: Claude
-- Date: 2026-02-16

-- ========================================
-- 1. Créer la table des catégories de QCM
-- ========================================

CREATE TABLE IF NOT EXISTS qcm_categories (
    id VARCHAR PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),  -- Couleur hex: #FF5733
    icon VARCHAR(50),  -- Nom de l'icône Lucide
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_qcm_categories_active ON qcm_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_qcm_categories_order ON qcm_categories(display_order, name);

-- ========================================
-- 2. Modifier la table qcm_questions
-- ========================================

-- Ajouter les nouvelles colonnes
ALTER TABLE qcm_questions
ADD COLUMN IF NOT EXISTS correct_answers JSONB,  -- Liste d'index: [0, 2]
ADD COLUMN IF NOT EXISTS is_multiple_answer BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS category_id VARCHAR REFERENCES qcm_categories(id);

-- Migrer les données existantes: correct_answer → correct_answers
UPDATE qcm_questions
SET correct_answers = jsonb_build_array(correct_answer::int)
WHERE correct_answers IS NULL AND correct_answer IS NOT NULL;

-- Migrer les options au nouveau format si elles sont encore en array simple
-- Format ancien: ['opt1', 'opt2', 'opt3', 'opt4']
-- Format nouveau: [{"text": "opt1", "id": 0}, {"text": "opt2", "id": 1}, ...]
-- Note: Cette migration suppose que les options sont en format JSON simple
-- À adapter selon vos données actuelles

-- Créer des index
CREATE INDEX IF NOT EXISTS idx_qcm_questions_category ON qcm_questions(category_id);

-- ========================================
-- 3. Modifier la table qcm_answers
-- ========================================

-- Ajouter la nouvelle colonne pour les réponses multiples
ALTER TABLE qcm_answers
ADD COLUMN IF NOT EXISTS answers_given JSONB;  -- Liste d'index: [0, 2, 3]

-- Migrer les données existantes: answer_given → answers_given
UPDATE qcm_answers
SET answers_given = jsonb_build_array(answer_given::int)
WHERE answers_given IS NULL AND answer_given IS NOT NULL;

-- ========================================
-- 4. Migrer les catégories existantes (si elles existent dans les questions)
-- ========================================

-- Créer automatiquement des catégories pour les valeurs uniques existantes dans le champ category
-- Cela permet de ne pas perdre les catégories déjà utilisées
INSERT INTO qcm_categories (id, name, slug, is_active, display_order)
SELECT
    gen_random_uuid()::text,
    DISTINCT category,
    LOWER(REPLACE(TRIM(category), ' ', '-')),
    true,
    0
FROM qcm_questions
WHERE category IS NOT NULL
AND category != ''
AND NOT EXISTS (
    SELECT 1 FROM qcm_categories WHERE LOWER(slug) = LOWER(REPLACE(TRIM(qcm_questions.category), ' ', '-'))
)
GROUP BY category;

-- ========================================
-- 5. Lier les questions aux catégories créées
-- ========================================

-- Associer les questions existantes aux catégories créées automatiquement
-- Basé sur le champ category (texte) vers category_id (FK)

UPDATE qcm_questions q
SET category_id = (
    SELECT id FROM qcm_categories c
    WHERE LOWER(c.slug) = LOWER(REPLACE(TRIM(q.category), ' ', '-'))
    LIMIT 1
)
WHERE q.category IS NOT NULL
AND q.category != ''
AND q.category_id IS NULL;

-- ========================================
-- 6. Commentaires
-- ========================================

COMMENT ON TABLE qcm_categories IS 'Catégories de questions QCM avec gestion centralisée';
COMMENT ON COLUMN qcm_questions.correct_answers IS 'Liste d''index des bonnes réponses (support réponses multiples)';
COMMENT ON COLUMN qcm_questions.is_multiple_answer IS 'True si la question accepte plusieurs réponses';
COMMENT ON COLUMN qcm_questions.category_id IS 'Référence vers la table qcm_categories';
COMMENT ON COLUMN qcm_answers.answers_given IS 'Liste d''index des réponses données (support réponses multiples)';

-- ========================================
-- Note sur la rétrocompatibilité
-- ========================================
-- Les anciennes colonnes (correct_answer, answer_given, category) sont conservées
-- pour la rétrocompatibilité pendant la transition.
-- Elles peuvent être supprimées dans une migration ultérieure après validation.

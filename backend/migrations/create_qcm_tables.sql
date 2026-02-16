-- Migration pour les tables QCM avec tirage au sort
-- Date: 2026-02-15
-- Description: Création des tables pour le système QCM

-- Table des questions (banque)
CREATE TABLE IF NOT EXISTS qcm_questions (
    id VARCHAR PRIMARY KEY,
    question TEXT NOT NULL,
    options JSON NOT NULL,                -- ['option1', 'option2', 'option3', 'option4']
    correct_answer INTEGER NOT NULL,      -- Index de la bonne réponse (0-3)
    difficulty VARCHAR(10) NOT NULL,      -- 'easy', 'medium', 'hard'
    category VARCHAR(100),                -- 'Maths', 'IA', 'Logique', etc.
    explanation TEXT,                     -- Explication de la bonne réponse
    points INTEGER NOT NULL DEFAULT 1,    -- Points attribués
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_qcm_questions_difficulty ON qcm_questions(difficulty);
CREATE INDEX idx_qcm_questions_category ON qcm_questions(category);
CREATE INDEX idx_qcm_questions_active ON qcm_questions(is_active);

-- Table des sessions QCM
CREATE TABLE IF NOT EXISTS qcm_sessions (
    id VARCHAR PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date VARCHAR NOT NULL,          -- ISO datetime
    end_date VARCHAR NOT NULL,            -- ISO datetime

    -- Configuration du tirage au sort
    total_questions INTEGER NOT NULL,     -- Nombre total de questions à tirer
    time_per_question INTEGER NOT NULL,   -- Temps par question en minutes
    -- Note: duration = total_questions * time_per_question (calculé)

    -- Filtres pour le tirage (JSON pour flexibilité)
    categories JSON,                      -- ['Maths', 'IA', 'Logique'] ou NULL
    difficulties JSON,                    -- ['easy', 'medium', 'hard'] ou NULL
    distribution_by_difficulty JSON,      -- {"easy": 5, "medium": 10, "hard": 5} ou NULL

    passing_score INTEGER NOT NULL,       -- Score de passage en % (0-100)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL
);

CREATE INDEX idx_qcm_sessions_active ON qcm_sessions(is_active);
CREATE INDEX idx_qcm_sessions_dates ON qcm_sessions(start_date, end_date);

-- Table des tentatives
CREATE TABLE IF NOT EXISTS qcm_attempts (
    id VARCHAR PRIMARY KEY,
    session_id VARCHAR NOT NULL REFERENCES qcm_sessions(id),
    candidate_id VARCHAR NOT NULL REFERENCES candidate_profiles(id),

    started_at VARCHAR NOT NULL,          -- ISO datetime
    completed_at VARCHAR,                 -- ISO datetime (NULL si en cours)

    total_questions INTEGER NOT NULL,     -- Copié de la session
    time_limit INTEGER NOT NULL,          -- Durée en minutes

    -- Résultats (NULL tant que non complété)
    score INTEGER,                        -- Score en % (0-100)
    correct_answers INTEGER,              -- Nombre de bonnes réponses
    passed BOOLEAN,                       -- true si score >= passing_score
    time_spent INTEGER,                   -- Temps réel passé en secondes

    -- Anti-triche
    tab_switches INTEGER NOT NULL DEFAULT 0,

    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL,

    -- Contraintes
    UNIQUE(session_id, candidate_id)      -- Un candidat ne peut avoir qu'une tentative par session
);

CREATE INDEX idx_qcm_attempts_session ON qcm_attempts(session_id);
CREATE INDEX idx_qcm_attempts_candidate ON qcm_attempts(candidate_id);
CREATE INDEX idx_qcm_attempts_completed ON qcm_attempts(completed_at);

-- Table d'association : questions tirées pour chaque tentative
CREATE TABLE IF NOT EXISTS qcm_attempt_questions (
    id VARCHAR PRIMARY KEY,
    attempt_id VARCHAR NOT NULL REFERENCES qcm_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR NOT NULL REFERENCES qcm_questions(id),
    order_index INTEGER NOT NULL,         -- Ordre d'affichage dans cette tentative
    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL,

    -- Contraintes
    UNIQUE(attempt_id, question_id),      -- Une question ne peut apparaître qu'une fois par tentative
    UNIQUE(attempt_id, order_index)       -- Chaque position est unique dans une tentative
);

CREATE INDEX idx_qcm_attempt_questions_attempt ON qcm_attempt_questions(attempt_id);
CREATE INDEX idx_qcm_attempt_questions_order ON qcm_attempt_questions(attempt_id, order_index);

-- Table des réponses
CREATE TABLE IF NOT EXISTS qcm_answers (
    id VARCHAR PRIMARY KEY,
    attempt_id VARCHAR NOT NULL REFERENCES qcm_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR NOT NULL REFERENCES qcm_questions(id),

    answer_given INTEGER NOT NULL,        -- Index de la réponse choisie (0-3)
    is_correct BOOLEAN,                   -- Évalué à la soumission

    answered_at VARCHAR NOT NULL,         -- ISO datetime
    time_spent_seconds INTEGER,           -- Temps passé sur cette question

    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL,

    -- Contraintes
    UNIQUE(attempt_id, question_id)       -- Une seule réponse par question par tentative
);

CREATE INDEX idx_qcm_answers_attempt ON qcm_answers(attempt_id);
CREATE INDEX idx_qcm_answers_question ON qcm_answers(question_id);

-- Commentaires sur les tables
COMMENT ON TABLE qcm_questions IS 'Banque de questions QCM réutilisables';
COMMENT ON TABLE qcm_sessions IS 'Sessions QCM avec configuration de tirage au sort automatique';
COMMENT ON TABLE qcm_attempts IS 'Tentatives individuelles des candidats avec questions tirées au sort';
COMMENT ON TABLE qcm_attempt_questions IS 'Questions spécifiques tirées pour chaque tentative';
COMMENT ON TABLE qcm_answers IS 'Réponses données par les candidats';

-- Exemples de données de test
/*
-- Insérer des questions d'exemple
INSERT INTO qcm_questions (id, question, options, correct_answer, difficulty, category, explanation, points, is_active, created_at, updated_at)
VALUES
    ('q1', 'Quelle est la complexité de la recherche binaire ?',
     '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 1, 'medium', 'Algorithmique',
     'La recherche binaire divise l''espace par 2 à chaque étape', 1, TRUE,
     datetime('now'), datetime('now')),
    ('q2', 'Python est un langage :',
     '["Compilé", "Interprété", "Assembleur", "Binaire"]', 1, 'easy', 'Programmation',
     'Python est interprété par l''interpréteur CPython', 1, TRUE,
     datetime('now'), datetime('now'));

-- Insérer une session d'exemple
INSERT INTO qcm_sessions (id, title, description, start_date, end_date, total_questions, time_per_question, distribution_by_difficulty, passing_score, is_active, created_at, updated_at)
VALUES
    ('s1', 'QCM Test', 'Session de test',
     '2026-01-01T00:00:00', '2026-12-31T23:59:59',
     10, 2, '{"easy": 4, "medium": 4, "hard": 2}', 60, TRUE,
     datetime('now'), datetime('now'));
*/

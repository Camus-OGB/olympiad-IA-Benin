-- ==========================================
-- Script de génération de données réalistes - VERSION CORRIGÉE
-- Olympiades d'Intelligence Artificielle - Bénin
-- ==========================================
--
-- Ce script génère des données réalistes pour la plateforme :
-- - Candidats avec profils complets
-- - Sessions de QCM avec résultats
-- - Actualités et ressources pédagogiques
-- - Témoignages d'anciens participants
--
-- IMPORTANT: Exécuter ce script sur une base de données vide ou de développement
-- Ne PAS exécuter en production sans sauvegarde !
-- ==========================================

-- ==========================================
-- 1. UTILISATEURS CANDIDATS (20 candidats réalistes du Bénin)
-- ==========================================

INSERT INTO users (id, email, hashed_password, first_name, last_name, role, is_verified, is_active, created_at, updated_at) VALUES
-- Candidats de Cotonou
('c1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', 'koffi.akpovi@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Koffi', 'AKPOVI', 'CANDIDATE', true, true, NOW() - INTERVAL '45 days', NOW()),
('d2b3c4d5-e6f7-5g8h-9i0j-1k2l3m4n5o6p', 'michele.dossou@yahoo.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Michèle', 'DOSSOU', 'CANDIDATE', true, true, NOW() - INTERVAL '42 days', NOW()),
('e3c4d5e6-f7g8-6h9i-0j1k-2l3m4n5o6p7q', 'seraphin.hounsou@outlook.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Séraphin', 'HOUNSOU', 'CANDIDATE', true, true, NOW() - INTERVAL '40 days', NOW()),
('f4d5e6f7-g8h9-7i0j-1k2l-3m4n5o6p7q8r', 'faridath.alladaye@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Faridath', 'ALLADAYE', 'CANDIDATE', true, true, NOW() - INTERVAL '38 days', NOW()),
('g5e6f7g8-h9i0-8j1k-2l3m-4n5o6p7q8r9s', 'rodrigue.zannou@edu.bj', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Rodrigue', 'ZANNOU', 'CANDIDATE', true, true, NOW() - INTERVAL '37 days', NOW()),
-- Porto-Novo
('h6f7g8h9-i0j1-9k2l-3m4n-5o6p7q8r9s0t', 'sylvie.ahouandjinou@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Sylvie', 'AHOUANDJINOU', 'CANDIDATE', true, true, NOW() - INTERVAL '35 days', NOW()),
('i7g8h9i0-j1k2-0l3m-4n5o-6p7q8r9s0t1u', 'pascal.hounkanrin@yahoo.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Pascal', 'HOUNKANRIN', 'CANDIDATE', true, true, NOW() - INTERVAL '33 days', NOW()),
('j8h9i0j1-k2l3-1m4n-5o6p-7q8r9s0t1u2v', 'nadine.agossou@outlook.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Nadine', 'AGOSSOU', 'CANDIDATE', true, true, NOW() - INTERVAL '31 days', NOW()),
-- Parakou
('k9i0j1k2-l3m4-2n5o-6p7q-8r9s0t1u2v3w', 'ines.bio-yaranga@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Inès', 'BIO-YARANGA', 'CANDIDATE', true, true, NOW() - INTERVAL '29 days', NOW()),
('l0j1k2l3-m4n5-3o6p-7q8r-9s0t1u2v3w4x', 'aurelien.tchakpa@edu.bj', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Aurélien', 'TCHAKPA', 'CANDIDATE', true, true, NOW() - INTERVAL '28 days', NOW()),
-- Abomey-Calavi
('m1k2l3m4-n5o6-4p7q-8r9s-0t1u2v3w4x5y', 'prisca.djossou@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Prisca', 'DJOSSOU', 'CANDIDATE', true, true, NOW() - INTERVAL '26 days', NOW()),
('n2l3m4n5-o6p7-5q8r-9s0t-1u2v3w4x5y6z', 'wilfried.gbenou@yahoo.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Wilfried', 'GBENOU', 'CANDIDATE', true, true, NOW() - INTERVAL '25 days', NOW()),
-- Bohicon
('o3m4n5o6-p7q8-6r9s-0t1u-2v3w4x5y6z7a', 'chanceline.houngnigbo@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Chanceline', 'HOUNGNIGBO', 'CANDIDATE', true, true, NOW() - INTERVAL '24 days', NOW()),
('p4n5o6p7-q8r9-7s0t-1u2v-3w4x5y6z7a8b', 'boris.ahouandjinou@outlook.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Boris', 'AHOUANDJINOU', 'CANDIDATE', true, true, NOW() - INTERVAL '22 days', NOW()),
-- Natitingou
('q5o6p7q8-r9s0-8t1u-2v3w-4x5y6z7a8b9c', 'stephanie.kouande@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Stéphanie', 'KOUANDE', 'CANDIDATE', true, true, NOW() - INTERVAL '20 days', NOW()),
('r6p7q8r9-s0t1-9u2v-3w4x-5y6z7a8b9c0d', 'kevin.tiando@edu.bj', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Kevin', 'TIANDO', 'CANDIDATE', true, true, NOW() - INTERVAL '19 days', NOW()),
-- Autres
('s7q8r9s0-t1u2-0v3w-4x5y-6z7a8b9c0d1e', 'diane.senonhoue@yahoo.fr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Diane', 'SENONHOUE', 'CANDIDATE', true, true, NOW() - INTERVAL '18 days', NOW()),
('t8r9s0t1-u2v3-1w4x-5y6z-7a8b9c0d1e2f', 'mathieu.adandedjan@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Mathieu', 'ADANDEDJAN', 'CANDIDATE', true, true, NOW() - INTERVAL '17 days', NOW()),
('u9s0t1u2-v3w4-2x5y-6z7a-8b9c0d1e2f3g', 'marlene.azonhiho@outlook.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Marlène', 'AZONHIHO', 'CANDIDATE', true, true, NOW() - INTERVAL '16 days', NOW()),
('v0t1u2v3-w4x5-3y6z-7a8b-9c0d1e2f3g4h', 'arnaud.sohou@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u', 'Arnaud', 'SOHOU', 'CANDIDATE', true, true, NOW() - INTERVAL '15 days', NOW());

-- ==========================================
-- 2. ÉCOLES (référence normalisée)
-- ==========================================

INSERT INTO schools (id, name, city, region, created_at, updated_at) VALUES
(gen_random_uuid(), 'Lycée Technique Coulibaly', 'Cotonou', 'Littoral', NOW(), NOW()),
(gen_random_uuid(), 'CEG Dantokpa', 'Cotonou', 'Littoral', NOW(), NOW()),
(gen_random_uuid(), 'Lycée Mathieu Bouké', 'Cotonou', 'Littoral', NOW(), NOW()),
(gen_random_uuid(), 'Complexe Scolaire La Verdure', 'Cotonou', 'Littoral', NOW(), NOW()),
(gen_random_uuid(), 'Lycée Behanzin', 'Cotonou', 'Littoral', NOW(), NOW()),
(gen_random_uuid(), 'Lycée Toffa 1er', 'Porto-Novo', 'Ouémé', NOW(), NOW()),
(gen_random_uuid(), 'CEG Ouando', 'Porto-Novo', 'Ouémé', NOW(), NOW()),
(gen_random_uuid(), 'Lycée Sekou Touré', 'Parakou', 'Borgou', NOW(), NOW()),
(gen_random_uuid(), 'CEG Abomey-Calavi', 'Abomey-Calavi', 'Atlantique', NOW(), NOW()),
(gen_random_uuid(), 'CEG Bohicon', 'Bohicon', 'Zou', NOW(), NOW()),
(gen_random_uuid(), 'Lycée de Natitingou', 'Natitingou', 'Atakora', NOW(), NOW());

-- ==========================================
-- 3. PROFILS DES CANDIDATS (structure correcte)
-- ==========================================

INSERT INTO candidate_profiles (id, user_id, date_of_birth, gender, phone, school_id, grade, status, created_at, updated_at) VALUES
(gen_random_uuid(), 'c1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', '2005-03-15', 'MALE', '+22997123456', (SELECT id FROM schools WHERE name = 'Lycée Technique Coulibaly' LIMIT 1), 'Terminale', 'QCM_COMPLETED', NOW() - INTERVAL '45 days', NOW()),
(gen_random_uuid(), 'd2b3c4d5-e6f7-5g8h-9i0j-1k2l3m4n5o6p', '2006-07-22', 'FEMALE', '+22996234567', (SELECT id FROM schools WHERE name = 'CEG Dantokpa' LIMIT 1), 'Première', 'QCM_COMPLETED', NOW() - INTERVAL '42 days', NOW()),
(gen_random_uuid(), 'e3c4d5e6-f7g8-6h9i-0j1k-2l3m4n5o6p7q', '2005-11-08', 'MALE', '+22995345678', (SELECT id FROM schools WHERE name = 'Lycée Mathieu Bouké' LIMIT 1), 'Terminale', 'QCM_COMPLETED', NOW() - INTERVAL '40 days', NOW()),
(gen_random_uuid(), 'f4d5e6f7-g8h9-7i0j-1k2l-3m4n5o6p7q8r', '2006-01-30', 'FEMALE', '+22994456789', (SELECT id FROM schools WHERE name = 'Complexe Scolaire La Verdure' LIMIT 1), 'Première', 'QCM_COMPLETED', NOW() - INTERVAL '38 days', NOW()),
(gen_random_uuid(), 'g5e6f7g8-h9i0-8j1k-2l3m-4n5o6p7q8r9s', '2005-09-12', 'MALE', '+22993567890', (SELECT id FROM schools WHERE name = 'Lycée Behanzin' LIMIT 1), 'Terminale', 'QCM_COMPLETED', NOW() - INTERVAL '37 days', NOW()),
(gen_random_uuid(), 'h6f7g8h9-i0j1-9k2l-3m4n-5o6p7q8r9s0t', '2006-04-18', 'FEMALE', '+22992678901', (SELECT id FROM schools WHERE name = 'Lycée Toffa 1er' LIMIT 1), 'Première', 'QCM_COMPLETED', NOW() - INTERVAL '35 days', NOW()),
(gen_random_uuid(), 'i7g8h9i0-j1k2-0l3m-4n5o-6p7q8r9s0t1u', '2005-12-25', 'MALE', '+22991789012', (SELECT id FROM schools WHERE name = 'CEG Ouando' LIMIT 1), 'Terminale', 'QCM_COMPLETED', NOW() - INTERVAL '33 days', NOW()),
(gen_random_uuid(), 'j8h9i0j1-k2l3-1m4n-5o6p-7q8r9s0t1u2v', '2006-06-14', 'FEMALE', '+22990890123', (SELECT id FROM schools WHERE name = 'Lycée Toffa 1er' LIMIT 1), 'Première', 'QCM_COMPLETED', NOW() - INTERVAL '31 days', NOW()),
(gen_random_uuid(), 'k9i0j1k2-l3m4-2n5o-6p7q-8r9s0t1u2v3w', '2005-08-07', 'FEMALE', '+22989901234', (SELECT id FROM schools WHERE name = 'Lycée Sekou Touré' LIMIT 1), 'Terminale', 'QCM_COMPLETED', NOW() - INTERVAL '29 days', NOW()),
(gen_random_uuid(), 'l0j1k2l3-m4n5-3o6p-7q8r-9s0t1u2v3w4x', '2006-02-19', 'MALE', '+22988012345', (SELECT id FROM schools WHERE name = 'Lycée Sekou Touré' LIMIT 1), 'Première', 'QCM_COMPLETED', NOW() - INTERVAL '28 days', NOW()),
(gen_random_uuid(), 'm1k2l3m4-n5o6-4p7q-8r9s-0t1u2v3w4x5y', '2005-10-03', 'FEMALE', '+22987123456', (SELECT id FROM schools WHERE name = 'CEG Abomey-Calavi' LIMIT 1), 'Terminale', 'REGISTERED', NOW() - INTERVAL '26 days', NOW()),
(gen_random_uuid(), 'n2l3m4n5-o6p7-5q8r-9s0t-1u2v3w4x5y6z', '2006-05-28', 'MALE', '+22986234567', (SELECT id FROM schools WHERE name = 'CEG Abomey-Calavi' LIMIT 1), 'Première', 'REGISTERED', NOW() - INTERVAL '25 days', NOW()),
(gen_random_uuid(), 'o3m4n5o6-p7q8-6r9s-0t1u-2v3w4x5y6z7a', '2005-12-11', 'FEMALE', '+22985345678', (SELECT id FROM schools WHERE name = 'CEG Bohicon' LIMIT 1), 'Terminale', 'REGISTERED', NOW() - INTERVAL '24 days', NOW()),
(gen_random_uuid(), 'p4n5o6p7-q8r9-7s0t-1u2v-3w4x5y6z7a8b', '2006-03-24', 'MALE', '+22984456789', (SELECT id FROM schools WHERE name = 'CEG Bohicon' LIMIT 1), 'Première', 'REGISTERED', NOW() - INTERVAL '22 days', NOW()),
(gen_random_uuid(), 'q5o6p7q8-r9s0-8t1u-2v3w-4x5y6z7a8b9c', '2006-07-16', 'FEMALE', '+22983567890', (SELECT id FROM schools WHERE name = 'Lycée de Natitingou' LIMIT 1), 'Première', 'REGISTERED', NOW() - INTERVAL '20 days', NOW()),
(gen_random_uuid(), 'r6p7q8r9-s0t1-9u2v-3w4x-5y6z7a8b9c0d', '2005-11-29', 'MALE', '+22982678901', (SELECT id FROM schools WHERE name = 'Lycée de Natitingou' LIMIT 1), 'Terminale', 'REGISTERED', NOW() - INTERVAL '19 days', NOW()),
(gen_random_uuid(), 's7q8r9s0-t1u2-0v3w-4x5y-6z7a8b9c0d1e', '2006-01-08', 'FEMALE', '+22981789012', (SELECT id FROM schools WHERE name = 'Lycée Behanzin' LIMIT 1), 'Première', 'REGISTERED', NOW() - INTERVAL '18 days', NOW()),
(gen_random_uuid(), 't8r9s0t1-u2v3-1w4x-5y6z-7a8b9c0d1e2f', '2005-09-21', 'MALE', '+22980890123', (SELECT id FROM schools WHERE name = 'Lycée Mathieu Bouké' LIMIT 1), 'Terminale', 'REGISTERED', NOW() - INTERVAL '17 days', NOW()),
(gen_random_uuid(), 'u9s0t1u2-v3w4-2x5y-6z7a-8b9c0d1e2f3g', '2006-04-05', 'FEMALE', '+22979901234', (SELECT id FROM schools WHERE name = 'Lycée Toffa 1er' LIMIT 1), 'Première', 'REGISTERED', NOW() - INTERVAL '16 days', NOW()),
(gen_random_uuid(), 'v0t1u2v3-w4x5-3y6z-7a8b-9c0d1e2f3g4h', '2005-06-17', 'MALE', '+22978012345', (SELECT id FROM schools WHERE name = 'Lycée Sekou Touré' LIMIT 1), 'Terminale', 'REGISTERED', NOW() - INTERVAL '15 days', NOW());

-- ==========================================
-- 4. QUESTIONS QCM
-- ==========================================

INSERT INTO qcm_questions (id, question, options, correct_answer, difficulty, category, explanation, points, is_active, created_at, updated_at) VALUES
-- IA - Faciles
('q1-ai-easy-01', 'Qu''est-ce que l''intelligence artificielle ?', '["Un robot humanoïde", "La capacité d''une machine à imiter l''intelligence humaine", "Un programme informatique simple", "Un système d''exploitation"]', 1, 'easy', 'Intelligence Artificielle', 'L''IA désigne les systèmes capables de simuler l''intelligence humaine.', 1, true, NOW(), NOW()),
('q2-ai-easy-02', 'Que signifie Machine Learning ?', '["Apprentissage par cœur", "Apprentissage automatique", "Programmation manuelle", "Intelligence mécanique"]', 1, 'easy', 'Intelligence Artificielle', 'Le Machine Learning permet aux machines d''apprendre à partir de données.', 1, true, NOW(), NOW()),
('q3-ai-easy-03', 'Quel est le but principal d''un réseau de neurones ?', '["Connecter des ordinateurs", "Modéliser le cerveau humain", "Créer des jeux vidéo", "Gérer des bases de données"]', 1, 'easy', 'Intelligence Artificielle', 'Les réseaux de neurones s''inspirent du cerveau pour traiter l''information.', 1, true, NOW(), NOW()),
-- IA - Moyennes
('q4-ai-med-01', 'Dans l''apprentissage supervisé, qu''est-ce qu''un label ?', '["Une étiquette physique", "La réponse correcte associée à une donnée", "Un type de réseau", "Un algorithme"]', 1, 'medium', 'Intelligence Artificielle', 'Un label est la valeur cible à prédire.', 2, true, NOW(), NOW()),
('q5-ai-med-02', 'Qu''est-ce que l''overfitting ?', '["Surapprentissage des données", "Manque de données", "Trop de neurones", "Un type d''algorithme"]', 0, 'medium', 'Intelligence Artificielle', 'L''overfitting survient quand le modèle mémorise au lieu de généraliser.', 2, true, NOW(), NOW()),
-- Maths
('q6-math-easy-01', 'Combien font 15 + 27 ?', '["32", "42", "52", "62"]', 1, 'easy', 'Mathématiques', '15 + 27 = 42', 1, true, NOW(), NOW()),
('q7-math-easy-02', 'Racine carrée de 144 ?', '["10", "11", "12", "14"]', 2, 'easy', 'Mathématiques', '12 × 12 = 144', 1, true, NOW(), NOW()),
('q8-math-med-01', 'Si f(x) = 2x + 3, f(5) = ?', '["10", "11", "13", "15"]', 2, 'medium', 'Mathématiques', 'f(5) = 2(5) + 3 = 13', 2, true, NOW(), NOW()),
('q9-math-med-02', 'Dérivée de x² ?', '["x", "2x", "x²", "2"]', 1, 'medium', 'Mathématiques', 'Dérivée de x^n = n×x^(n-1)', 2, true, NOW(), NOW()),
-- Logique
('q10-log-easy-01', 'Suite : 2, 4, 6, 8, ?', '["9", "10", "11", "12"]', 1, 'easy', 'Logique', 'Suite arithmétique de raison 2', 1, true, NOW(), NOW()),
('q11-log-med-01', 'Suite de Fibonacci : 1, 1, 2, 3, 5, 8, ?', '["11", "12", "13", "14"]', 2, 'medium', 'Logique', 'Fibonacci : somme des deux précédents (5+8=13)', 2, true, NOW(), NOW()),
-- Programmation
('q12-prog-easy-01', 'Que fait print("Bonjour") ?', '["Calcule", "Affiche Bonjour", "Crée une variable", "Efface"]', 1, 'easy', 'Programmation', 'print() affiche du texte', 1, true, NOW(), NOW()),
('q13-prog-easy-02', 'Structure pour répéter ?', '["Variable", "Boucle", "Fonction", "Commentaire"]', 1, 'easy', 'Programmation', 'Les boucles (for, while) répètent des instructions', 1, true, NOW(), NOW()),
('q14-prog-med-01', 'len([1, 2, 3, 4, 5]) = ?', '["4", "5", "6", "15"]', 1, 'medium', 'Programmation', 'len() retourne le nombre d''éléments', 2, true, NOW(), NOW()),
('q15-prog-med-02', 'Complexité recherche binaire ?', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 1, 'medium', 'Programmation', 'Recherche binaire divise par 2 à chaque étape', 2, true, NOW(), NOW());

-- ==========================================
-- 5. SESSIONS QCM
-- ==========================================

INSERT INTO qcm_sessions (id, title, description, start_date, end_date, total_questions, time_per_question, passing_score, is_active, created_at, updated_at) VALUES
('session-2026-01', 'QCM de Présélection - Édition 2026', 'Première étape de sélection pour les Olympiades d''IA 2026.', '2026-01-15T00:00:00Z', '2026-02-28T23:59:59Z', 15, 4, 60, true, NOW(), NOW()),
('session-2026-test', 'QCM d''Entraînement', 'Session d''entraînement gratuite.', '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 10, 3, 50, true, NOW(), NOW());

-- ==========================================
-- 6. TENTATIVES QCM
-- ==========================================

INSERT INTO qcm_attempts (id, session_id, candidate_id, started_at, completed_at, total_questions, time_limit, score, correct_answers, passed, time_spent, tab_switches, created_at, updated_at) VALUES
('attempt-001', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'c1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o'), '2026-01-20T10:00:00Z', '2026-01-20T10:45:00Z', 15, 60, 88, 13, true, 2700, 0, NOW(), NOW()),
('attempt-002', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'd2b3c4d5-e6f7-5g8h-9i0j-1k2l3m4n5o6p'), '2026-01-21T14:00:00Z', '2026-01-21T14:50:00Z', 15, 60, 77, 11, true, 3000, 1, NOW(), NOW()),
('attempt-003', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'e3c4d5e6-f7g8-6h9i-0j1k-2l3m4n5o6p7q'), '2026-01-22T09:30:00Z', '2026-01-22T10:20:00Z', 15, 60, 83, 12, true, 2880, 0, NOW(), NOW()),
('attempt-004', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'f4d5e6f7-g8h9-7i0j-1k2l-3m4n5o6p7q8r'), '2026-01-23T16:00:00Z', '2026-01-23T16:55:00Z', 15, 60, 67, 10, true, 3300, 2, NOW(), NOW()),
('attempt-005', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'g5e6f7g8-h9i0-8j1k-2l3m-4n5o6p7q8r9s'), '2026-01-24T11:00:00Z', '2026-01-24T11:42:00Z', 15, 60, 94, 14, true, 2520, 0, NOW(), NOW()),
('attempt-006', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'h6f7g8h9-i0j1-9k2l-3m4n-5o6p7q8r9s0t'), '2026-01-25T15:30:00Z', '2026-01-25T16:25:00Z', 15, 60, 75, 11, true, 3180, 1, NOW(), NOW()),
('attempt-007', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'i7g8h9i0-j1k2-0l3m-4n5o-6p7q8r9s0t1u'), '2026-01-26T10:00:00Z', '2026-01-26T10:48:00Z', 15, 60, 86, 13, true, 2880, 0, NOW(), NOW()),
('attempt-008', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'j8h9i0j1-k2l3-1m4n-5o6p-7q8r9s0t1u2v'), '2026-01-27T13:00:00Z', '2026-01-27T13:58:00Z', 15, 60, 61, 9, true, 3480, 3, NOW(), NOW()),
('attempt-009', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'k9i0j1k2-l3m4-2n5o-6p7q-8r9s0t1u2v3w'), '2026-01-28T09:00:00Z', '2026-01-28T09:50:00Z', 15, 60, 92, 14, true, 3000, 0, NOW(), NOW()),
('attempt-010', 'session-2026-01', (SELECT id FROM candidate_profiles WHERE user_id = 'l0j1k2l3-m4n5-3o6p-7q8r-9s0t1u2v3w4x'), '2026-01-29T14:30:00Z', '2026-01-29T15:20:00Z', 15, 60, 72, 10, true, 2940, 1, NOW(), NOW());

-- ==========================================
-- 7. ACTUALITÉS
-- ==========================================

INSERT INTO news (id, title, content, excerpt, image_url, author, is_published, published_at, category, created_at, updated_at) VALUES
(gen_random_uuid(), 'Lancement officiel OAIB 2026', 'Lancement de l''édition 2026 des Olympiades d''IA Bénin avec de nombreuses nouveautés : plateforme modernisée, nouveaux partenaires, bourses d''études.', 'Découvrez le programme complet de l''édition 2026.', 'https://images.unsplash.com/photo-1531482615713-2afd69097998', 'Comité OAIB', true, '2026-01-05T10:00:00Z', 'Annonce', NOW(), NOW()),
(gen_random_uuid(), '200 candidats inscrits !', 'Succès incroyable avec plus de 200 inscriptions en 2 semaines. 45% de filles, candidats de toutes les régions du Bénin.', 'Mobilisation exceptionnelle pour l''édition 2026.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', 'Équipe Communication', true, '2026-01-18T14:00:00Z', 'Actualité', NOW(), NOW()),
(gen_random_uuid(), 'Partenariat Google AI', 'Google AI s''engage avec accès Colab Pro, formations TensorFlow, mentorat par des ingénieurs.', 'Google AI forme la prochaine génération de talents africains.', 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6', 'Direction OAIB', true, '2026-01-25T09:00:00Z', 'Partenariat', NOW(), NOW()),
(gen_random_uuid(), 'QCM disponible maintenant', 'Le QCM de présélection est ouvert : 60 minutes, 20 questions. Score minimum 60%. Disponible jusqu''au 28 février.', 'Le test est ouvert. À vos claviers !', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173', 'Équipe Pédagogique', true, '2026-01-20T08:00:00Z', 'Actualité', NOW(), NOW()),
(gen_random_uuid(), 'Webinaire Introduction à l''IA', 'Webinaire gratuit le 10 février à 16h avec des experts de l''UAC et d''AfriTech. Introduction, démo, Q&A.', 'Participez à notre webinaire gratuit le 10 février.', 'https://images.unsplash.com/photo-1591115765373-5207764f72e7', 'Équipe Formation', true, '2026-02-01T10:00:00Z', 'Événement', NOW(), NOW());

-- ==========================================
-- 8. RESSOURCES PÉDAGOGIQUES
-- ==========================================

INSERT INTO resources (id, title, description, type, category, url, file_size, is_active, order_index, created_at, updated_at) VALUES
(gen_random_uuid(), 'Python pour l''IA', 'Guide complet NumPy, Pandas, Matplotlib.', 'PDF', 'COURS', 'https://storage.olympiades-ia.bj/python-ai.pdf', '2.5 MB', true, 1, NOW(), NOW()),
(gen_random_uuid(), 'Bases du Machine Learning', 'Régression, arbres, k-means, SVM.', 'PDF', 'COURS', 'https://storage.olympiades-ia.bj/ml-basics.pdf', '3.8 MB', true, 2, NOW(), NOW()),
(gen_random_uuid(), 'Algèbre Linéaire pour IA', 'Vecteurs, matrices, transformations.', 'PDF', 'COURS', 'https://storage.olympiades-ia.bj/linear-algebra.pdf', '4.2 MB', true, 3, NOW(), NOW()),
(gen_random_uuid(), 'TensorFlow Guide Débutant', 'Tutoriel pas-à-pas premier réseau.', 'VIDEO', 'TUTORIEL', 'https://storage.olympiades-ia.bj/tensorflow.mp4', '150 MB', true, 4, NOW(), NOW()),
(gen_random_uuid(), 'Exercices Logique', '50 exercices corrigés.', 'PDF', 'EXERCICES', 'https://storage.olympiades-ia.bj/logic-exercises.pdf', '1.8 MB', true, 5, NOW(), NOW()),
(gen_random_uuid(), 'Deep Learning CNN', 'Cours avancé vision par ordinateur.', 'PDF', 'COURS', 'https://storage.olympiades-ia.bj/cnn.pdf', '5.1 MB', true, 6, NOW(), NOW()),
(gen_random_uuid(), 'Kaggle pour Débutants', '5 défis adaptés aux débutants.', 'LINK', 'GUIDE', 'https://kaggle.com/oaib-benin', NULL, true, 7, NOW(), NOW()),
(gen_random_uuid(), 'Statistiques pour IA', 'Distributions, tests, inférence.', 'PDF', 'COURS', 'https://storage.olympiades-ia.bj/stats.pdf', '3.2 MB', true, 8, NOW(), NOW());

-- ==========================================
-- 9. ÉDITIONS PASSÉES ET TÉMOIGNAGES
-- ==========================================

INSERT INTO past_editions (id, year, host_country, num_students, created_at, updated_at) VALUES
('past-2024', 2024, 'Cameroun', 8, NOW(), NOW()),
('past-2025', 2025, 'Sénégal', 10, NOW(), NOW());

INSERT INTO testimonials (id, past_edition_id, author_name, author_role, content, photo_url, created_at, updated_at) VALUES
(gen_random_uuid(), 'past-2024', 'Sarah TOKOUDAGBA', 'Médaille d''Or - OAIB 2024', 'Les Olympiades ont changé ma vie. Acceptée à Polytechnique Paris grâce à cette expérience. Bootcamp intense mais extraordinaire.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e', NOW(), NOW()),
(gen_random_uuid(), 'past-2024', 'Marcel HOUNGBO', 'Participant - OAIB 2024', 'Même sans médaille, j''ai énormément appris. Bases solides en Python et TensorFlow. Aujourd''hui étudiant EPITECH Bénin.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', NOW(), NOW()),
(gen_random_uuid(), 'past-2025', 'Kevin ASSOGBA', 'Médaille d''Argent - OAIB 2025', 'Rigueur scientifique et travail d''équipe. Compétition à Dakar enrichissante. Déterminé à contribuer au développement tech du Bénin.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', NOW(), NOW()),
(gen_random_uuid(), 'past-2025', 'Rachelle DOSSOU', 'Participante - OAIB 2025', 'Seule fille de ma région. L''équipe m''a encouragée. Les filles sont tout aussi douées en IA ! Aujourd''hui ambassadrice.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', NOW(), NOW());

-- ==========================================
-- RÉSUMÉ
-- ==========================================
-- ✅ 20 candidats (users + profiles)
-- ✅ 11 écoles normalisées
-- ✅ 15 questions QCM
-- ✅ 2 sessions QCM
-- ✅ 10 tentatives avec résultats (scores 61% à 94%)
-- ✅ 5 actualités
-- ✅ 8 ressources pédagogiques
-- ✅ 2 éditions passées
-- ✅ 4 témoignages
--
-- Mot de passe : Password123!
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKa0kD7Q8O1qJ9u

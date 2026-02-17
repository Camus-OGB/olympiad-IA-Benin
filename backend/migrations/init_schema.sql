-- ============================================================
-- SCHÉMA COMPLET — OLYMPIADES IA BÉNIN
-- Script d'initialisation idempotent (CREATE TABLE IF NOT EXISTS)
-- Représente l'état FINAL de la base de données.
-- À exécuter sur une nouvelle BD vierge pour tout créer d'un coup.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TYPES ENUM
-- ============================================================

DO $$ BEGIN
  CREATE TYPE userrole AS ENUM ('candidate', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE candidatestatus AS ENUM (
    'registered', 'profile_complete', 'documents_submitted',
    'qcm_pending', 'qcm_passed', 'qcm_failed',
    'selected', 'rejected', 'waitlisted'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE genderenum AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE resourcetype AS ENUM ('pdf', 'video', 'link', 'image', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE resourcecategory AS ENUM (
    'preparation', 'reglement', 'resultats', 'presse', 'pedagogique', 'autre'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- UTILISATEURS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    role userrole NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    otp_code VARCHAR,
    otp_expires_at VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);


-- ============================================================
-- PROFILS CANDIDATS
-- ============================================================

CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    city VARCHAR,
    region VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);

CREATE TABLE IF NOT EXISTS candidate_profiles (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender genderenum,
    phone VARCHAR,
    address TEXT,
    photo_url VARCHAR,
    school_id VARCHAR REFERENCES schools(id) ON DELETE SET NULL,
    grade VARCHAR,
    status candidatestatus NOT NULL DEFAULT 'registered',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_status ON candidate_profiles(status);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_school ON candidate_profiles(school_id);

CREATE TABLE IF NOT EXISTS parent_contacts (
    id VARCHAR PRIMARY KEY,
    candidate_id VARCHAR NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    phone VARCHAR,
    email VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_records (
    id VARCHAR PRIMARY KEY,
    candidate_id VARCHAR NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    trimester INTEGER NOT NULL,
    average DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, trimester)
);

CREATE TABLE IF NOT EXISTS subject_scores (
    id VARCHAR PRIMARY KEY,
    candidate_id VARCHAR NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    subject VARCHAR NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subject_scores_candidate ON subject_scores(candidate_id);

CREATE TABLE IF NOT EXISTS qcm_results (
    id VARCHAR PRIMARY KEY,
    candidate_id VARCHAR NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    score DOUBLE PRECISION NOT NULL,
    time_spent INTEGER,
    completed_at VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bulletins (
    id VARCHAR PRIMARY KEY,
    candidate_id VARCHAR NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    file_url VARCHAR NOT NULL,
    trimester INTEGER,
    label VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- CONTENU VITRINE
-- ============================================================

CREATE TABLE IF NOT EXISTS news (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url VARCHAR,
    author VARCHAR,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at VARCHAR,
    category VARCHAR,
    external_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_at DESC);

CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR,
    "order" INTEGER DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    logo_url VARCHAR,
    description TEXT,
    website_url VARCHAR,
    "order" INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR PRIMARY KEY,
    slug VARCHAR NOT NULL UNIQUE,
    title VARCHAR NOT NULL,
    content TEXT,
    meta_data JSON,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ÉDITIONS EN COURS
-- ============================================================

CREATE TABLE IF NOT EXISTS editions (
    id VARCHAR PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    title VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_editions_active ON editions(is_active);
CREATE INDEX IF NOT EXISTS idx_editions_year ON editions(year DESC);

CREATE TABLE IF NOT EXISTS timeline_phases (
    id VARCHAR PRIMARY KEY,
    edition_id VARCHAR NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    phase_order INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    start_date VARCHAR,
    end_date VARCHAR,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(edition_id, phase_order)
);

CREATE INDEX IF NOT EXISTS idx_timeline_phases_edition ON timeline_phases(edition_id);

CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR PRIMARY KEY,
    edition_id VARCHAR NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    event_date VARCHAR NOT NULL,
    event_type VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS selection_criteria (
    id VARCHAR PRIMARY KEY,
    edition_id VARCHAR NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    stage VARCHAR NOT NULL,
    stage_order INTEGER NOT NULL,
    criterion TEXT NOT NULL,
    min_score DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edition_partners (
    id VARCHAR PRIMARY KEY,
    edition_id VARCHAR NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
    partner_id VARCHAR NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    role VARCHAR,
    contribution TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(edition_id, partner_id)
);


-- ============================================================
-- BILANS (ÉDITIONS PASSÉES)
-- ============================================================

CREATE TABLE IF NOT EXISTS past_editions (
    id VARCHAR PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    host_country VARCHAR,
    num_students INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS past_timeline_phases (
    id VARCHAR PRIMARY KEY,
    past_edition_id VARCHAR NOT NULL REFERENCES past_editions(id) ON DELETE CASCADE,
    phase_order INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    date VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_past_timeline_past_edition ON past_timeline_phases(past_edition_id);

CREATE TABLE IF NOT EXISTS gallery_images (
    id VARCHAR PRIMARY KEY,
    past_edition_id VARCHAR NOT NULL REFERENCES past_editions(id) ON DELETE CASCADE,
    image_url VARCHAR NOT NULL,
    caption VARCHAR,
    "order" INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR PRIMARY KEY,
    past_edition_id VARCHAR NOT NULL REFERENCES past_editions(id) ON DELETE CASCADE,
    student_name VARCHAR NOT NULL,
    role VARCHAR,
    school VARCHAR,
    quote TEXT NOT NULL,
    image_url VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR PRIMARY KEY,
    past_edition_id VARCHAR NOT NULL REFERENCES past_editions(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    rank INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS press_releases (
    id VARCHAR PRIMARY KEY,
    past_edition_id VARCHAR NOT NULL REFERENCES past_editions(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    source VARCHAR,
    url VARCHAR,
    published_at VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS edition_stats (
    id VARCHAR PRIMARY KEY,
    past_edition_id VARCHAR NOT NULL REFERENCES past_editions(id) ON DELETE CASCADE,
    metric_name VARCHAR NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    metric_unit VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TÉMOIGNAGES GÉNÉRAUX (non liés à une édition)
-- ============================================================

CREATE TABLE IF NOT EXISTS general_testimonials (
    id VARCHAR PRIMARY KEY,
    author_name VARCHAR NOT NULL,
    author_role VARCHAR,
    author_type VARCHAR,
    content TEXT NOT NULL,
    photo_url VARCHAR,
    video_url VARCHAR,
    organization VARCHAR,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_general_testimonials_published ON general_testimonials(is_published);


-- ============================================================
-- QCM
-- ============================================================

CREATE TABLE IF NOT EXISTS qcm_categories (
    id VARCHAR PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qcm_categories_active ON qcm_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_qcm_categories_order ON qcm_categories(display_order, name);

CREATE TABLE IF NOT EXISTS qcm_questions (
    id VARCHAR PRIMARY KEY,
    question TEXT NOT NULL,
    -- options: liste d'objets [{"text": "...", "id": 0}, ...]
    options JSONB NOT NULL,
    -- correct_answers: liste d'index [0] ou [0, 2] pour réponses multiples
    correct_answers JSONB NOT NULL,
    is_multiple_answer BOOLEAN NOT NULL DEFAULT FALSE,
    difficulty VARCHAR(10) NOT NULL,    -- 'easy', 'medium', 'hard'
    category_id VARCHAR REFERENCES qcm_categories(id) ON DELETE SET NULL,
    category VARCHAR(100),              -- Nom texte (legacy, conservé pour compatibilité)
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qcm_questions_difficulty ON qcm_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_qcm_questions_category_id ON qcm_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_qcm_questions_active ON qcm_questions(is_active);

CREATE TABLE IF NOT EXISTS qcm_sessions (
    id VARCHAR PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date VARCHAR NOT NULL,        -- ISO datetime
    end_date VARCHAR NOT NULL,          -- ISO datetime
    total_questions INTEGER NOT NULL,
    time_per_question INTEGER NOT NULL, -- minutes par question
    categories JSONB,                   -- ['Maths', 'IA', 'Logique']
    difficulties JSONB,                 -- ['easy', 'medium', 'hard']
    distribution_by_difficulty JSONB,   -- {"easy": 5, "medium": 10, "hard": 5}
    passing_score INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qcm_sessions_active ON qcm_sessions(is_active);

CREATE TABLE IF NOT EXISTS qcm_attempts (
    id VARCHAR PRIMARY KEY,
    session_id VARCHAR NOT NULL REFERENCES qcm_sessions(id) ON DELETE CASCADE,
    candidate_id VARCHAR NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    started_at VARCHAR NOT NULL,
    completed_at VARCHAR,
    total_questions INTEGER NOT NULL,
    time_limit INTEGER NOT NULL,        -- durée en minutes
    score INTEGER,                      -- 0-100 (%)
    correct_answers INTEGER,            -- nombre de bonnes réponses
    passed BOOLEAN,
    time_spent INTEGER,                 -- secondes réelles
    tab_switches INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_qcm_attempts_session ON qcm_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_qcm_attempts_candidate ON qcm_attempts(candidate_id);

CREATE TABLE IF NOT EXISTS qcm_attempt_questions (
    id VARCHAR PRIMARY KEY,
    attempt_id VARCHAR NOT NULL REFERENCES qcm_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR NOT NULL REFERENCES qcm_questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(attempt_id, question_id),
    UNIQUE(attempt_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_qcm_attempt_questions_attempt ON qcm_attempt_questions(attempt_id);

CREATE TABLE IF NOT EXISTS qcm_answers (
    id VARCHAR PRIMARY KEY,
    attempt_id VARCHAR NOT NULL REFERENCES qcm_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR NOT NULL REFERENCES qcm_questions(id) ON DELETE CASCADE,
    -- answers_given: liste d'index [0] ou [0, 2, 3]
    answers_given JSONB NOT NULL,
    is_correct BOOLEAN,
    answered_at VARCHAR NOT NULL,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_qcm_answers_attempt ON qcm_answers(attempt_id);


-- ============================================================
-- RESSOURCES PÉDAGOGIQUES
-- ============================================================

CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    type resourcetype NOT NULL,
    category resourcecategory NOT NULL,
    url VARCHAR NOT NULL,
    file_size VARCHAR,
    duration VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);


-- ============================================================
-- JOURNAL D'AUDIT
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR PRIMARY KEY,
    admin_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    admin_email VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    resource_type VARCHAR NOT NULL,
    resource_id VARCHAR,
    resource_label VARCHAR,
    details TEXT,
    ip_address VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

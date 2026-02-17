"""
Modèles QCM - Système de questions et sessions avec tirage au sort
AMÉLIORÉ : Support de nombre flexible de réponses (2-6) et catégories gérées
"""
from sqlalchemy import Column, String, Boolean, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base, BaseModel
import uuid
import enum


class QuestionDifficulty(str, enum.Enum):
    """Niveaux de difficulté des questions"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QCMQuestion(Base, BaseModel):
    """
    Questions de la banque QCM avec support flexible de réponses
    """
    __tablename__ = "qcm_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Contenu de la question
    question = Column(Text, nullable=False)

    # ⭐ FLEXIBLE: Liste de 2 à 6 options
    # Format JSON: [
    #   {"text": "Option A", "id": 0},
    #   {"text": "Option B", "id": 1},
    #   {"text": "Option C", "id": 2},
    #   {"text": "Option D", "id": 3}
    # ]
    options = Column(JSON, nullable=False)

    # ⭐ FLEXIBLE: Supporte réponse simple ou multiple
    # Format JSON: [0] pour une seule réponse, [0, 2] pour réponses multiples
    correct_answers = Column(JSON, nullable=False)

    # Type de question
    is_multiple_answer = Column(Boolean, default=False, nullable=False)  # Vrai/Faux

    # Métadonnées
    difficulty = Column(String(10), nullable=False)  # 'easy', 'medium', 'hard'

    # ⭐ NOUVELLE RELATION avec table catégories
    category_id = Column(String, ForeignKey("qcm_categories.id"), nullable=True)

    # Garde l'ancienne colonne pour rétrocompatibilité (sera migrée)
    category = Column(String(100), nullable=True)  # DEPRECATED

    explanation = Column(Text, nullable=True)  # Explication de la bonne réponse
    points = Column(Integer, default=1, nullable=False)  # Points par défaut

    # Statut
    is_active = Column(Boolean, default=True, nullable=False)

    # Relations
    category_ref = relationship("QCMCategory", back_populates="questions")
    attempt_questions = relationship("QCMAttemptQuestion", back_populates="question")

    def __repr__(self):
        return f"<QCMQuestion {self.id[:8]} - {self.category} - {self.difficulty}>"


class QCMSession(Base, BaseModel):
    """
    Session QCM avec configuration de tirage au sort
    """
    __tablename__ = "qcm_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Informations générales
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(String, nullable=False)  # ISO datetime
    end_date = Column(String, nullable=False)  # ISO datetime

    # ⭐ Configuration du tirage au sort
    total_questions = Column(Integer, nullable=False)  # Ex: 20 questions
    time_per_question = Column(Integer, nullable=False)  # Ex: 2 minutes par question
    # Note: duration calculée = total_questions * time_per_question

    # Filtres pour le tirage (stockés en JSON)
    categories = Column(JSON, nullable=True)  # Ex: ['Maths', 'IA', 'Logique']
    difficulties = Column(JSON, nullable=True)  # Ex: ['easy', 'medium', 'hard']
    distribution_by_difficulty = Column(JSON, nullable=True)  # Ex: {"easy": 5, "medium": 10, "hard": 5}

    # Score de passage
    passing_score = Column(Integer, nullable=False)  # 0-100 (%)

    # Statut
    is_active = Column(Boolean, default=True, nullable=False)

    # Relations
    attempts = relationship("QCMAttempt", back_populates="session")

    @property
    def duration(self):
        """Durée totale calculée en minutes"""
        return self.total_questions * self.time_per_question

    def __repr__(self):
        return f"<QCMSession {self.title} - {self.total_questions}Q>"


class QCMAttempt(Base, BaseModel):
    """
    Tentative de QCM par un candidat
    Chaque tentative a ses propres questions tirées au sort
    """
    __tablename__ = "qcm_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Relations
    session_id = Column(String, ForeignKey("qcm_sessions.id"), nullable=False)
    candidate_id = Column(String, ForeignKey("candidate_profiles.id"), nullable=False)

    # Timestamps
    started_at = Column(String, nullable=False)  # ISO datetime
    completed_at = Column(String, nullable=True)  # ISO datetime

    # Configuration de cette tentative
    total_questions = Column(Integer, nullable=False)
    time_limit = Column(Integer, nullable=False)  # en minutes

    # Résultats (NULL si pas encore complété)
    score = Column(Integer, nullable=True)  # 0-100 (%)
    correct_answers = Column(Integer, nullable=True)
    passed = Column(Boolean, nullable=True)
    time_spent = Column(Integer, nullable=True)  # en secondes

    # Anti-triche
    tab_switches = Column(Integer, default=0, nullable=False)

    # Relations
    session = relationship("QCMSession", back_populates="attempts")
    candidate = relationship("CandidateProfile", back_populates="qcm_attempts")
    attempt_questions = relationship("QCMAttemptQuestion", back_populates="attempt", cascade="all, delete-orphan")
    answers = relationship("QCMAnswer", back_populates="attempt", cascade="all, delete-orphan")

    def __repr__(self):
        status = "complété" if self.completed_at else "en cours"
        return f"<QCMAttempt {self.id[:8]} - {status}>"


class QCMAttemptQuestion(Base, BaseModel):
    """
    Questions tirées au sort pour une tentative spécifique
    Associe une tentative à une question avec son ordre
    """
    __tablename__ = "qcm_attempt_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Relations
    attempt_id = Column(String, ForeignKey("qcm_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("qcm_questions.id"), nullable=False)

    # Ordre dans ce QCM spécifique
    order_index = Column(Integer, nullable=False)

    # Relations
    attempt = relationship("QCMAttempt", back_populates="attempt_questions")
    question = relationship("QCMQuestion", back_populates="attempt_questions")

    def __repr__(self):
        return f"<QCMAttemptQuestion {self.attempt_id[:8]} - Q{self.order_index}>"


class QCMAnswer(Base, BaseModel):
    """
    Réponses données par le candidat
    AMÉLIORÉ : Support de réponses multiples
    """
    __tablename__ = "qcm_answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Relations
    attempt_id = Column(String, ForeignKey("qcm_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("qcm_questions.id"), nullable=False)

    # ⭐ FLEXIBLE: Supporte réponses simples et multiples
    # Format JSON: [0] pour une seule réponse, [0, 2, 3] pour réponses multiples
    answers_given = Column(JSON, nullable=False)

    # Garde l'ancienne colonne pour rétrocompatibilité (sera migrée)
    answer_given = Column(Integer, nullable=True)  # DEPRECATED

    is_correct = Column(Boolean, nullable=True)  # Évalué à la soumission

    # Métadonnées
    answered_at = Column(String, nullable=False)  # ISO datetime
    time_spent_seconds = Column(Integer, nullable=True)  # Temps passé sur cette question

    # Relations
    attempt = relationship("QCMAttempt", back_populates="answers")
    question = relationship("QCMQuestion")

    def __repr__(self):
        return f"<QCMAnswer {self.id[:8]} - Q{self.question_id[:8]}>"

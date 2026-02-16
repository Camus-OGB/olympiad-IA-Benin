"""
Schémas Pydantic pour les QCM
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime


# ==================== QUESTIONS ====================

class QuestionCreate(BaseModel):
    """Création d'une question"""
    question: str = Field(..., min_length=10, description="Texte de la question")
    options: List[str] = Field(..., min_length=4, max_length=4, description="4 options de réponse")
    correct_answer: int = Field(..., ge=0, le=3, description="Index de la bonne réponse (0-3)")
    difficulty: str = Field(..., description="Difficulté: easy, medium, hard")
    category: Optional[str] = Field(None, description="Catégorie de la question")
    explanation: Optional[str] = Field(None, description="Explication de la réponse")
    points: int = Field(1, ge=1, description="Nombre de points")

    @field_validator('difficulty')
    @classmethod
    def validate_difficulty(cls, v):
        if v not in ['easy', 'medium', 'hard']:
            raise ValueError("Difficulté doit être: easy, medium, ou hard")
        return v


class QuestionUpdate(BaseModel):
    """Mise à jour d'une question"""
    question: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[int] = Field(None, ge=0, le=3)
    difficulty: Optional[str] = None
    category: Optional[str] = None
    explanation: Optional[str] = None
    points: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None


class QuestionResponse(BaseModel):
    """Réponse question (AVEC la réponse correcte - Admin uniquement)"""
    id: str
    question: str
    options: List[str]
    correct_answer: int
    difficulty: str
    category: Optional[str]
    explanation: Optional[str]
    points: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionForCandidate(BaseModel):
    """Question pour candidat (SANS la réponse correcte)"""
    id: str
    question: str
    options: List[str]
    # correct_answer: OMIS intentionnellement
    # explanation: OMIS intentionnellement

    model_config = ConfigDict(from_attributes=True)


# ==================== SESSIONS ====================

class SessionCreate(BaseModel):
    """Création d'une session QCM"""
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    start_date: str = Field(..., description="ISO datetime")
    end_date: str = Field(..., description="ISO datetime")

    # Configuration du tirage au sort
    total_questions: int = Field(..., ge=1, le=100, description="Nombre total de questions")
    time_per_question: int = Field(..., ge=1, le=30, description="Minutes par question")

    # Filtres optionnels
    categories: Optional[List[str]] = Field(None, description="Catégories à inclure")
    difficulties: Optional[List[str]] = Field(None, description="Difficultés à inclure")
    distribution_by_difficulty: Optional[Dict[str, int]] = Field(
        None,
        description="Répartition par difficulté, ex: {'easy': 5, 'medium': 10, 'hard': 5}"
    )

    passing_score: int = Field(..., ge=0, le=100, description="Score de passage en %")

    @field_validator('distribution_by_difficulty')
    @classmethod
    def validate_distribution(cls, v, info):
        if v is not None:
            # Vérifier que la somme = total_questions
            total = sum(v.values())
            total_questions = info.data.get('total_questions')
            if total_questions and total != total_questions:
                raise ValueError(
                    f"La somme de la distribution ({total}) doit égaler total_questions ({total_questions})"
                )

            # Vérifier les clés valides
            valid_keys = {'easy', 'medium', 'hard'}
            if not set(v.keys()).issubset(valid_keys):
                raise ValueError(f"Clés de distribution invalides. Utiliser: {valid_keys}")

        return v


class SessionUpdate(BaseModel):
    """Mise à jour d'une session"""
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_questions: Optional[int] = Field(None, ge=1, le=100)
    time_per_question: Optional[int] = Field(None, ge=1, le=30)
    categories: Optional[List[str]] = None
    difficulties: Optional[List[str]] = None
    distribution_by_difficulty: Optional[Dict[str, int]] = None
    passing_score: Optional[int] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None


class SessionResponse(BaseModel):
    """Réponse session complète"""
    id: str
    title: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime

    total_questions: int
    time_per_question: int
    duration: int  # Calculé automatiquement

    categories: Optional[List[str]]
    difficulties: Optional[List[str]]
    distribution_by_difficulty: Optional[Dict[str, int]]

    passing_score: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionForCandidate(BaseModel):
    """Session vue par un candidat (informations limitées)"""
    id: str
    title: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    total_questions: int
    time_per_question: int
    duration: int
    passing_score: int

    # Statut pour ce candidat
    status: str  # 'locked', 'available', 'completed'
    score: Optional[int] = None  # Si complété
    completed_at: Optional[datetime] = None  # Si complété

    model_config = ConfigDict(from_attributes=True)


# ==================== TENTATIVES ====================

class AttemptResponse(BaseModel):
    """Réponse tentative"""
    id: str
    session_id: str
    candidate_id: str
    started_at: datetime
    completed_at: Optional[datetime]
    total_questions: int
    time_limit: int
    score: Optional[int]
    correct_answers: Optional[int]
    passed: Optional[bool]
    time_spent: Optional[int]
    tab_switches: int

    model_config = ConfigDict(from_attributes=True)


class SubmitAnswerRequest(BaseModel):
    """Soumission d'une réponse"""
    question_id: str
    answer: int = Field(..., ge=0, le=3, description="Index de la réponse (0-3)")


class CompleteAttemptResponse(BaseModel):
    """Résultat final d'une tentative"""
    id: str
    session_id: str
    score: int
    total_questions: int
    correct_answers: int
    passed: bool
    time_spent: int
    tab_switches: int
    completed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttemptDetailResponse(BaseModel):
    """Détails d'une tentative avec toutes les questions/réponses"""
    id: str
    session: SessionResponse
    started_at: datetime
    completed_at: Optional[datetime]
    score: Optional[int]
    correct_answers: Optional[int]
    passed: Optional[bool]
    time_spent: Optional[int]

    # Questions et réponses
    questions: List[QuestionResponse]  # Avec les bonnes réponses
    answers: Dict[str, int]  # question_id -> answer_given

    model_config = ConfigDict(from_attributes=True)


# ==================== STATISTIQUES ====================

class QCMStatsResponse(BaseModel):
    """Statistiques QCM pour un candidat"""
    total_attempts: int
    completed_attempts: int
    passed_attempts: int
    average_score: Optional[float]
    best_score: Optional[int]
    total_time_spent: int  # en secondes

    recent_attempts: List[AttemptResponse]

    model_config = ConfigDict(from_attributes=True)


class AdminQCMStatsResponse(BaseModel):
    """Statistiques QCM globales pour l'admin"""
    total_questions: int
    total_sessions: int
    total_attempts: int
    completed_attempts: int

    average_score: Optional[float]
    pass_rate: Optional[float]  # Pourcentage de candidats ayant réussi

    questions_by_difficulty: dict[str, int]  # {'easy': 10, 'medium': 20, 'hard': 5}
    questions_by_category: dict[str, int]    # {'Maths': 15, 'IA': 10, ...}

    attempts_by_session: dict[str, int]      # session_id → nombre de tentatives

    top_performers: List[dict]               # Top 10 candidats avec meilleur score
    recent_attempts: List[dict]              # 10 dernières tentatives

    model_config = ConfigDict(from_attributes=True)

"""
Endpoints QCM - Système avec tirage au sort automatique
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime
import logging
import random

from app.db.session import get_db
from app.models.user import User
from app.models.candidate_profile import CandidateProfile
from app.models.qcm import (
    QCMQuestion, QCMSession, QCMAttempt,
    QCMAttemptQuestion, QCMAnswer
)
from app.schemas.qcm import (
    QuestionCreate, QuestionUpdate, QuestionResponse,
    QuestionForCandidate, SessionCreate, SessionUpdate,
    SessionResponse, SessionForCandidate, AttemptResponse,
    SubmitAnswerRequest, CompleteAttemptResponse,
    AttemptDetailResponse, QCMStatsResponse, AdminQCMStatsResponse
)
from app.utils.deps import get_current_verified_user, get_current_admin

router = APIRouter()
logger = logging.getLogger(__name__)


# ==================== ENDPOINTS ADMIN - GESTION DES QUESTIONS ====================

@router.get("/admin/questions", response_model=List[QuestionResponse])
async def get_all_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Liste de toutes les questions (Admin uniquement)
    """
    query = db.query(QCMQuestion).filter(QCMQuestion.is_active == True)

    if category:
        query = query.filter(QCMQuestion.category == category)

    if difficulty:
        query = query.filter(QCMQuestion.difficulty == difficulty)

    questions = query.order_by(QCMQuestion.created_at.desc()).offset(skip).limit(limit).all()

    return questions


@router.post("/admin/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question: QuestionCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle question (Admin uniquement)
    """
    new_question = QCMQuestion(
        question=question.question,
        options=[opt.model_dump() for opt in question.options],
        correct_answers=question.correct_answers,
        is_multiple_answer=question.is_multiple_answer,
        difficulty=question.difficulty,
        category_id=question.category_id,
        category=question.category,
        explanation=question.explanation,
        points=question.points,
        is_active=True
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    logger.info(f"Question créée: {new_question.id} par {current_admin.email}")

    return new_question


@router.post("/admin/questions/bulk", response_model=dict, status_code=status.HTTP_201_CREATED)
async def bulk_create_questions(
    questions: List[QuestionCreate],
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Créer plusieurs questions en une seule requête (Admin uniquement)
    Utile pour l'import CSV/JSON
    """
    created_count = 0
    errors = []

    for idx, question in enumerate(questions):
        try:
            new_question = QCMQuestion(
                question=question.question,
                options=[opt.model_dump() for opt in question.options],
                correct_answers=question.correct_answers,
                is_multiple_answer=question.is_multiple_answer,
                difficulty=question.difficulty,
                category_id=question.category_id,
                category=question.category,
                explanation=question.explanation,
                points=question.points,
                is_active=True
            )

            db.add(new_question)
            created_count += 1
        except Exception as e:
            errors.append({
                "index": idx,
                "question": question.question[:50] + "..." if len(question.question) > 50 else question.question,
                "error": str(e)
            })
            logger.error(f"Erreur création question {idx}: {str(e)}")

    try:
        db.commit()
        logger.info(f"{created_count} questions créées en masse par {current_admin.email}")
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Erreur lors de la sauvegarde: {str(e)}")

    return {
        "message": f"{created_count} questions créées avec succès",
        "created_count": created_count,
        "error_count": len(errors),
        "errors": errors
    }


@router.put("/admin/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: str,
    question_update: QuestionUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour une question (Admin uniquement)
    """
    question = db.query(QCMQuestion).filter(QCMQuestion.id == question_id).first()

    if not question:
        raise HTTPException(404, "Question non trouvée")

    # Mise à jour des champs
    update_data = question_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        # Les QuestionOption sont déjà sérialisés en dict par model_dump
        setattr(question, field, value)

    db.commit()
    db.refresh(question)

    logger.info(f"Question {question_id} mise à jour par {current_admin.email}")

    return question


@router.delete("/admin/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer une question (Admin uniquement)
    Soft delete: marque comme inactive
    """
    question = db.query(QCMQuestion).filter(QCMQuestion.id == question_id).first()

    if not question:
        raise HTTPException(404, "Question non trouvée")

    # Soft delete
    question.is_active = False
    db.commit()

    logger.info(f"Question {question_id} supprimée par {current_admin.email}")

    return {"message": "Question supprimée avec succès"}


# ==================== ENDPOINTS ADMIN - GESTION DES SESSIONS ====================

@router.get("/admin/sessions", response_model=List[SessionResponse])
async def get_all_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Liste de toutes les sessions (Admin uniquement)
    """
    sessions = db.query(QCMSession).order_by(
        QCMSession.created_at.desc()
    ).offset(skip).limit(limit).all()

    return sessions


@router.post("/admin/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session: SessionCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle session QCM (Admin uniquement)
    Le système fera un tirage au sort automatique pour chaque candidat
    """
    # Vérifier qu'il y a assez de questions disponibles
    if session.distribution_by_difficulty:
        for difficulty, count in session.distribution_by_difficulty.items():
            query = db.query(QCMQuestion).filter(
                QCMQuestion.is_active == True,
                QCMQuestion.difficulty == difficulty
            )

            if session.categories:
                query = query.filter(QCMQuestion.category.in_(session.categories))

            available = query.count()

            if available < count:
                raise HTTPException(
                    400,
                    f"Pas assez de questions {difficulty} disponibles. "
                    f"Demandé: {count}, Disponible: {available}"
                )
    else:
        # Vérification simple
        query = db.query(QCMQuestion).filter(QCMQuestion.is_active == True)

        if session.categories:
            query = query.filter(QCMQuestion.category.in_(session.categories))

        if session.difficulties:
            query = query.filter(QCMQuestion.difficulty.in_(session.difficulties))

        available = query.count()

        if available < session.total_questions:
            raise HTTPException(
                400,
                f"Pas assez de questions disponibles. "
                f"Demandé: {session.total_questions}, Disponible: {available}"
            )

    # Créer la session
    new_session = QCMSession(
        title=session.title,
        description=session.description,
        start_date=session.start_date,
        end_date=session.end_date,
        total_questions=session.total_questions,
        time_per_question=session.time_per_question,
        categories=session.categories,
        difficulties=session.difficulties,
        distribution_by_difficulty=session.distribution_by_difficulty,
        passing_score=session.passing_score,
        is_active=True
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    logger.info(f"Session QCM créée: {new_session.id} par {current_admin.email}")

    return new_session


@router.put("/admin/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    session_update: SessionUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour une session (Admin uniquement)
    """
    session = db.query(QCMSession).filter(QCMSession.id == session_id).first()

    if not session:
        raise HTTPException(404, "Session non trouvée")

    # Mise à jour des champs
    update_data = session_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)

    logger.info(f"Session {session_id} mise à jour par {current_admin.email}")

    return session


@router.delete("/admin/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer une session (Admin uniquement)
    Attention: supprime aussi toutes les tentatives liées
    """
    session = db.query(QCMSession).filter(QCMSession.id == session_id).first()

    if not session:
        raise HTTPException(404, "Session non trouvée")

    # Vérifier s'il y a des tentatives
    attempts_count = db.query(QCMAttempt).filter(
        QCMAttempt.session_id == session_id
    ).count()

    if attempts_count > 0:
        raise HTTPException(
            400,
            f"Impossible de supprimer: {attempts_count} tentative(s) existe(nt). "
            "Désactivez la session plutôt."
        )

    db.delete(session)
    db.commit()

    logger.info(f"Session {session_id} supprimée par {current_admin.email}")

    return {"message": "Session supprimée avec succès"}


# ==================== ENDPOINTS CANDIDAT - PASSAGE DU QCM ====================

@router.get("/sessions", response_model=List[SessionForCandidate])
async def get_available_sessions(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Liste des sessions QCM pour le candidat connecté
    Avec leur statut: locked, available, completed
    """
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(404, "Profil candidat non trouvé")

    # Récupérer toutes les sessions actives
    sessions = db.query(QCMSession).filter(QCMSession.is_active == True).all()

    now = datetime.utcnow().isoformat()
    result = []

    for session in sessions:
        # Vérifier si le candidat a déjà complété cette session
        attempt = db.query(QCMAttempt).filter(
            QCMAttempt.session_id == session.id,
            QCMAttempt.candidate_id == profile.id,
            QCMAttempt.completed_at.isnot(None)
        ).first()

        if attempt:
            # Complété
            status = "completed"
            score = attempt.score
            completed_at = attempt.completed_at
        elif now < session.start_date:
            # Pas encore commencé
            status = "locked"
            score = None
            completed_at = None
        elif now > session.end_date:
            # Terminé (mais pas passé)
            status = "locked"
            score = None
            completed_at = None
        else:
            # Disponible
            status = "available"
            score = None
            completed_at = None

        result.append(SessionForCandidate(
            id=session.id,
            title=session.title,
            description=session.description,
            start_date=session.start_date,
            end_date=session.end_date,
            total_questions=session.total_questions,
            time_per_question=session.time_per_question,
            duration=session.duration,
            passing_score=session.passing_score,
            status=status,
            score=score,
            completed_at=completed_at
        ))

    return result


@router.post("/sessions/{session_id}/start", response_model=AttemptResponse)
async def start_qcm_attempt(
    session_id: str,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    ⭐ Démarrer une tentative de QCM avec TIRAGE AU SORT des questions
    """
    # 1. Récupérer la session
    session = db.query(QCMSession).filter(QCMSession.id == session_id).first()

    if not session or not session.is_active:
        raise HTTPException(404, "Session non trouvée ou inactive")

    # 2. Vérifier les dates
    now = datetime.utcnow().isoformat()
    if now < session.start_date:
        raise HTTPException(400, "La session n'a pas encore commencé")
    if now > session.end_date:
        raise HTTPException(400, "La session est terminée")

    # 3. Récupérer le profil candidat
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(404, "Profil candidat non trouvé")

    # 4. Vérifier que le candidat n'a pas déjà complété cette session
    existing_attempt = db.query(QCMAttempt).filter(
        QCMAttempt.session_id == session_id,
        QCMAttempt.candidate_id == profile.id,
        QCMAttempt.completed_at.isnot(None)
    ).first()

    if existing_attempt:
        raise HTTPException(400, "Vous avez déjà complété cette session")

    # ⭐ 5. TIRAGE AU SORT DES QUESTIONS
    try:
        selected_questions = draw_random_questions(
            db=db,
            total=session.total_questions,
            categories=session.categories,
            difficulties=session.difficulties,
            distribution=session.distribution_by_difficulty
        )
    except ValueError as e:
        raise HTTPException(400, str(e))

    # 6. Créer la tentative
    attempt = QCMAttempt(
        session_id=session_id,
        candidate_id=profile.id,
        started_at=datetime.utcnow().isoformat(),
        total_questions=session.total_questions,
        time_limit=session.duration,
        tab_switches=0
    )

    db.add(attempt)
    db.flush()  # Pour obtenir l'ID

    # 7. Associer les questions tirées au sort
    for index, question in enumerate(selected_questions):
        attempt_question = QCMAttemptQuestion(
            attempt_id=attempt.id,
            question_id=question.id,
            order_index=index
        )
        db.add(attempt_question)

    db.commit()
    db.refresh(attempt)

    logger.info(
        f"Tentative QCM démarrée: {attempt.id} pour candidat {profile.id} "
        f"({len(selected_questions)} questions tirées)"
    )

    return attempt


def draw_random_questions(
    db: Session,
    total: int,
    categories: Optional[List[str]] = None,
    difficulties: Optional[List[str]] = None,
    distribution: Optional[dict] = None
) -> List[QCMQuestion]:
    """
    ⭐ Tire au sort des questions selon les critères
    """
    selected = []

    if distribution:
        # Tirage avec répartition par difficulté
        for difficulty, count in distribution.items():
            query = db.query(QCMQuestion).filter(
                QCMQuestion.is_active == True,
                QCMQuestion.difficulty == difficulty
            )

            if categories:
                query = query.filter(QCMQuestion.category.in_(categories))

            available = query.all()

            if len(available) < count:
                raise ValueError(
                    f"Pas assez de questions {difficulty} disponibles. "
                    f"Demandé: {count}, Disponible: {len(available)}"
                )

            selected.extend(random.sample(available, count))
    else:
        # Tirage simple sans répartition
        query = db.query(QCMQuestion).filter(QCMQuestion.is_active == True)

        if categories:
            query = query.filter(QCMQuestion.category.in_(categories))

        if difficulties:
            query = query.filter(QCMQuestion.difficulty.in_(difficulties))

        available = query.all()

        if len(available) < total:
            raise ValueError(
                f"Pas assez de questions disponibles. "
                f"Demandé: {total}, Disponible: {len(available)}"
            )

        selected = random.sample(available, total)

    # Mélanger l'ordre final
    random.shuffle(selected)

    return selected


@router.get("/attempts/{attempt_id}/questions", response_model=List[QuestionForCandidate])
async def get_attempt_questions(
    attempt_id: str,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les questions d'une tentative (SANS les réponses correctes)
    """
    # Vérifier que la tentative appartient bien au candidat
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    attempt = db.query(QCMAttempt).filter(
        QCMAttempt.id == attempt_id,
        QCMAttempt.candidate_id == profile.id
    ).first()

    if not attempt:
        raise HTTPException(404, "Tentative non trouvée")

    # Récupérer les questions dans l'ordre
    attempt_questions = db.query(QCMAttemptQuestion).filter(
        QCMAttemptQuestion.attempt_id == attempt_id
    ).order_by(QCMAttemptQuestion.order_index).all()

    questions = []
    for aq in attempt_questions:
        question = aq.question
        # IMPORTANT: Ne pas exposer correct_answer et explanation
        questions.append(QuestionForCandidate(
            id=question.id,
            question=question.question,
            options=question.options,
            is_multiple_answer=question.is_multiple_answer,
            points=question.points
        ))

    return questions


@router.post("/attempts/{attempt_id}/answers")
async def submit_answer(
    attempt_id: str,
    answer_data: SubmitAnswerRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Soumettre une réponse à une question
    """
    # Vérifier que la tentative appartient au candidat
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    attempt = db.query(QCMAttempt).filter(
        QCMAttempt.id == attempt_id,
        QCMAttempt.candidate_id == profile.id
    ).first()

    if not attempt:
        raise HTTPException(404, "Tentative non trouvée")

    if attempt.completed_at:
        raise HTTPException(400, "La tentative est déjà terminée")

    # Vérifier que la question fait partie de cette tentative
    attempt_question = db.query(QCMAttemptQuestion).filter(
        QCMAttemptQuestion.attempt_id == attempt_id,
        QCMAttemptQuestion.question_id == answer_data.question_id
    ).first()

    if not attempt_question:
        raise HTTPException(400, "Cette question ne fait pas partie de votre tentative")

    # Vérifier si une réponse existe déjà
    existing_answer = db.query(QCMAnswer).filter(
        QCMAnswer.attempt_id == attempt_id,
        QCMAnswer.question_id == answer_data.question_id
    ).first()

    if existing_answer:
        # Mettre à jour la réponse
        existing_answer.answer_given = answer_data.answer
        existing_answer.answered_at = datetime.utcnow().isoformat()
    else:
        # Créer une nouvelle réponse
        new_answer = QCMAnswer(
            attempt_id=attempt_id,
            question_id=answer_data.question_id,
            answer_given=answer_data.answer,
            answered_at=datetime.utcnow().isoformat()
        )
        db.add(new_answer)

    db.commit()

    return {"message": "Réponse enregistrée"}


@router.post("/attempts/{attempt_id}/complete", response_model=CompleteAttemptResponse)
async def complete_attempt(
    attempt_id: str,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    ⭐ Terminer et corriger une tentative de QCM
    """
    # Vérifier que la tentative appartient au candidat
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    attempt = db.query(QCMAttempt).filter(
        QCMAttempt.id == attempt_id,
        QCMAttempt.candidate_id == profile.id
    ).first()

    if not attempt:
        raise HTTPException(404, "Tentative non trouvée")

    if attempt.completed_at:
        raise HTTPException(400, "La tentative est déjà terminée")

    # Récupérer toutes les réponses
    answers = db.query(QCMAnswer).filter(
        QCMAnswer.attempt_id == attempt_id
    ).all()

    # Corriger les réponses
    correct_count = 0
    for answer in answers:
        question = db.query(QCMQuestion).filter(
            QCMQuestion.id == answer.question_id
        ).first()

        if question:
            is_correct = answer.answer_given == question.correct_answer
            answer.is_correct = is_correct
            if is_correct:
                correct_count += 1

    # Calculer le score
    score_percentage = round((correct_count / attempt.total_questions) * 100)
    session = attempt.session
    passed = score_percentage >= session.passing_score

    # Calculer le temps passé
    started = datetime.fromisoformat(attempt.started_at)
    completed = datetime.utcnow()
    time_spent_seconds = int((completed - started).total_seconds())

    # Mettre à jour la tentative
    attempt.completed_at = completed.isoformat()
    attempt.score = score_percentage
    attempt.correct_answers = correct_count
    attempt.passed = passed
    attempt.time_spent = time_spent_seconds

    db.commit()
    db.refresh(attempt)

    logger.info(
        f"Tentative {attempt_id} complétée: {correct_count}/{attempt.total_questions} "
        f"({score_percentage}%) - {'RÉUSSI' if passed else 'ÉCHOUÉ'}"
    )

    return CompleteAttemptResponse(
        id=attempt.id,
        session_id=attempt.session_id,
        score=score_percentage,
        total_questions=attempt.total_questions,
        correct_answers=correct_count,
        passed=passed,
        time_spent=time_spent_seconds,
        tab_switches=attempt.tab_switches,
        completed_at=attempt.completed_at
    )


@router.get("/results", response_model=List[AttemptResponse])
async def get_my_results(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer tous les résultats QCM du candidat connecté
    """
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(404, "Profil candidat non trouvé")

    attempts = db.query(QCMAttempt).filter(
        QCMAttempt.candidate_id == profile.id,
        QCMAttempt.completed_at.isnot(None)
    ).order_by(QCMAttempt.completed_at.desc()).all()

    return attempts


@router.get("/attempts/{attempt_id}/details", response_model=AttemptDetailResponse)
async def get_attempt_details(
    attempt_id: str,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Détails complets d'une tentative avec correction
    (Accessible uniquement si la tentative est complétée)
    """
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    attempt = db.query(QCMAttempt).filter(
        QCMAttempt.id == attempt_id,
        QCMAttempt.candidate_id == profile.id
    ).first()

    if not attempt:
        raise HTTPException(404, "Tentative non trouvée")

    if not attempt.completed_at:
        raise HTTPException(400, "La tentative n'est pas encore terminée")

    # Récupérer les questions et réponses
    attempt_questions = db.query(QCMAttemptQuestion).filter(
        QCMAttemptQuestion.attempt_id == attempt_id
    ).order_by(QCMAttemptQuestion.order_index).all()

    answers_dict = {}
    for answer in attempt.answers:
        answers_dict[answer.question_id] = answer.answer_given

    questions = [aq.question for aq in attempt_questions]

    return AttemptDetailResponse(
        id=attempt.id,
        session=attempt.session,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        score=attempt.score,
        correct_answers=attempt.correct_answers,
        passed=attempt.passed,
        time_spent=attempt.time_spent,
        questions=questions,
        answers=answers_dict
    )


# ==================== STATISTIQUES ADMIN ====================

@router.get("/admin/stats", response_model=AdminQCMStatsResponse)
async def get_admin_qcm_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Statistiques globales QCM pour l'admin
    """
    # Nombre total de questions actives
    total_questions = db.query(QCMQuestion).filter(QCMQuestion.is_active == True).count()

    # Nombre total de sessions
    total_sessions = db.query(QCMSession).count()

    # Nombre total de tentatives et complétées
    total_attempts = db.query(QCMAttempt).count()
    completed_attempts = db.query(QCMAttempt).filter(
        QCMAttempt.completed_at.isnot(None)
    ).count()

    # Score moyen et taux de réussite
    completed_attempts_list = db.query(QCMAttempt).filter(
        QCMAttempt.completed_at.isnot(None)
    ).all()

    average_score = None
    pass_rate = None
    if completed_attempts_list:
        scores = [a.score for a in completed_attempts_list if a.score is not None]
        if scores:
            average_score = sum(scores) / len(scores)

        passed = len([a for a in completed_attempts_list if a.passed])
        pass_rate = (passed / len(completed_attempts_list)) * 100

    # Questions par difficulté
    questions_by_difficulty = {}
    for difficulty in ['easy', 'medium', 'hard']:
        count = db.query(QCMQuestion).filter(
            QCMQuestion.is_active == True,
            QCMQuestion.difficulty == difficulty
        ).count()
        questions_by_difficulty[difficulty] = count

    # Questions par catégorie
    questions_by_category = {}
    categories = db.query(QCMQuestion.category).filter(
        QCMQuestion.is_active == True,
        QCMQuestion.category.isnot(None)
    ).distinct().all()

    for (category,) in categories:
        count = db.query(QCMQuestion).filter(
            QCMQuestion.is_active == True,
            QCMQuestion.category == category
        ).count()
        questions_by_category[category] = count

    # Tentatives par session
    attempts_by_session = {}
    sessions = db.query(QCMSession).all()
    for session in sessions:
        count = db.query(QCMAttempt).filter(
            QCMAttempt.session_id == session.id
        ).count()
        attempts_by_session[session.title] = count

    # Top 10 candidats avec meilleur score
    top_attempts = db.query(QCMAttempt).join(CandidateProfile).join(User).filter(
        QCMAttempt.completed_at.isnot(None),
        QCMAttempt.score.isnot(None)
    ).order_by(QCMAttempt.score.desc()).limit(10).all()

    top_performers = []
    for attempt in top_attempts:
        top_performers.append({
            'candidate_name': f"{attempt.candidate.user.first_name} {attempt.candidate.user.last_name}",
            'session_title': attempt.session.title,
            'score': attempt.score,
            'completed_at': attempt.completed_at.isoformat() if attempt.completed_at else None
        })

    # 10 dernières tentatives
    recent_attempts_list = db.query(QCMAttempt).join(CandidateProfile).join(User).order_by(
        QCMAttempt.started_at.desc()
    ).limit(10).all()

    recent_attempts = []
    for attempt in recent_attempts_list:
        recent_attempts.append({
            'candidate_name': f"{attempt.candidate.user.first_name} {attempt.candidate.user.last_name}",
            'session_title': attempt.session.title,
            'score': attempt.score,
            'completed': attempt.completed_at is not None,
            'started_at': attempt.started_at.isoformat() if attempt.started_at else None
        })

    return AdminQCMStatsResponse(
        total_questions=total_questions,
        total_sessions=total_sessions,
        total_attempts=total_attempts,
        completed_attempts=completed_attempts,
        average_score=average_score,
        pass_rate=pass_rate,
        questions_by_difficulty=questions_by_difficulty,
        questions_by_category=questions_by_category,
        attempts_by_session=attempts_by_session,
        top_performers=top_performers,
        recent_attempts=recent_attempts
    )

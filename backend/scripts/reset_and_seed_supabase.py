#!/usr/bin/env python3
"""Soft reset + seed pour la base PostgreSQL (Supabase).

- Conserve uniquement l'utilisateur super admin cible (email)
- Supprime toutes les autres données applicatives
- Réinjecte des données de test complètes (candidats, profils, écoles, QCM, contenu)

⚠️ Script destructif: utilisez --yes pour exécuter réellement.
"""

import argparse
import random
from datetime import date, datetime, timedelta

from app.core.config import settings
from app.core.security import get_password_hash
from app.db import SessionLocal, init_db

from app.models.user import User, UserRole
from app.models.candidate_profile import (
    AcademicRecord,
    Bulletin,
    CandidateProfile,
    CandidateStatus,
    Gender,
    ParentContact,
    QCMResult,
    School,
    SubjectScore,
)
from app.models.qcm import QCMAnswer, QCMAttempt, QCMAttemptQuestion, QCMQuestion, QCMSession
from app.models.content import FAQ, News, Edition, TimelinePhase, CalendarEvent, SelectionCriterion


def _now_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def _days_ago_iso(days: int) -> str:
    return (datetime.utcnow() - timedelta(days=days)).replace(microsecond=0).isoformat() + "Z"


def assert_postgres_database_url() -> None:
    url = (settings.DATABASE_URL or "").lower()
    if not (url.startswith("postgresql://") or url.startswith("postgres://")):
        raise RuntimeError(
            "Refus d'exécuter: DATABASE_URL n'est pas PostgreSQL. "
            "Vérifie que tu pointes bien vers Supabase (postgresql://...)."
        )


def soft_reset(db, keep_super_admin_email: str) -> None:
    keep_super_admin_email = keep_super_admin_email.strip().lower()

    keep_user = db.query(User).filter(User.email == keep_super_admin_email).first()
    if not keep_user:
        raise RuntimeError(f"Super admin introuvable: {keep_super_admin_email}.")

    # 1) Supprimer d'abord les tables avec FKs vers candidate_profiles / qcm
    db.query(QCMAnswer).delete(synchronize_session=False)
    db.query(QCMAttemptQuestion).delete(synchronize_session=False)
    db.query(QCMAttempt).delete(synchronize_session=False)

    db.query(Bulletin).delete(synchronize_session=False)
    db.query(QCMResult).delete(synchronize_session=False)
    db.query(SubjectScore).delete(synchronize_session=False)
    db.query(AcademicRecord).delete(synchronize_session=False)
    db.query(ParentContact).delete(synchronize_session=False)
    db.query(CandidateProfile).delete(synchronize_session=False)

    # 2) Contenu vitrine
    db.query(TimelinePhase).delete(synchronize_session=False)
    db.query(CalendarEvent).delete(synchronize_session=False)
    db.query(SelectionCriterion).delete(synchronize_session=False)
    db.query(Edition).delete(synchronize_session=False)
    db.query(FAQ).delete(synchronize_session=False)
    db.query(News).delete(synchronize_session=False)

    # 3) Banque QCM
    db.query(QCMQuestion).delete(synchronize_session=False)
    db.query(QCMSession).delete(synchronize_session=False)

    # 4) Référentiels
    db.query(School).delete(synchronize_session=False)

    # 5) Supprimer tous les users sauf le super_admin cible
    db.query(User).filter(User.email != keep_super_admin_email).delete(synchronize_session=False)


def seed_content(db) -> None:
    news_1 = News(
        title="Ouverture des inscriptions - AOAI 2026",
        content="Les inscriptions pour la sélection nationale sont ouvertes.",
        excerpt="Inscriptions ouvertes pour la sélection nationale.",
        image_url="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
        author="Équipe AOAI Bénin",
        is_published=True,
        published_at=_days_ago_iso(10),
        category="Annonce",
    )

    faq_1 = FAQ(question="Qui peut participer ?", answer="Tout élève béninois du secondaire.", category="Inscription", order=1)
    faq_2 = FAQ(question="Comment se déroule la sélection ?", answer="Inscription, QCM, puis étapes successives.", category="Sélection", order=2)

    edition = Edition(year=2026, is_active=True, title="AOAI 2026 - Sélection Nationale", description="Processus de sélection nationale.")

    db.add_all([news_1, faq_1, faq_2, edition])
    db.flush()

    phases = [
        TimelinePhase(edition_id=edition.id, phase_order=1, title="Inscriptions", description="Création de compte et dépôt de dossier", is_current=True),
        TimelinePhase(edition_id=edition.id, phase_order=2, title="QCM", description="Test de présélection", is_current=False),
        TimelinePhase(edition_id=edition.id, phase_order=3, title="Sélection régionale", description="Étape régionale", is_current=False),
        TimelinePhase(edition_id=edition.id, phase_order=4, title="Bootcamp", description="Formation intensive", is_current=False),
        TimelinePhase(edition_id=edition.id, phase_order=5, title="Finale nationale", description="Sélection finale", is_current=False),
    ]

    events = [
        CalendarEvent(edition_id=edition.id, title="Clôture inscriptions", description="Dernier jour", event_date=_days_ago_iso(-14), event_type="deadline"),
        CalendarEvent(edition_id=edition.id, title="Début QCM", description="Ouverture des sessions", event_date=_days_ago_iso(-7), event_type="event"),
    ]

    criteria = [
        SelectionCriterion(edition_id=edition.id, stage="qcm", stage_order=1, criterion="Score minimum", min_score=60.0),
        SelectionCriterion(edition_id=edition.id, stage="regional", stage_order=2, criterion="Classement régional", min_score=None),
    ]

    db.add_all(phases + events + criteria)


def seed_qcm(db) -> QCMSession:
    categories = ["Mathématiques", "IA & ML", "Programmation", "Logique"]
    difficulties = ["easy", "medium", "hard"]

    questions: list[QCMQuestion] = []
    for i in range(40):
        diff = random.choices(difficulties, weights=[0.45, 0.4, 0.15])[0]
        cat = random.choice(categories)
        q = QCMQuestion(
            question=f"Question {i+1} ({cat}, {diff})",
            options=["A", "B", "C", "D"],
            correct_answer=random.randint(0, 3),
            difficulty=diff,
            category=cat,
            explanation="Explication de la réponse.",
            points=1,
            is_active=True,
        )
        questions.append(q)

    db.add_all(questions)
    db.flush()

    start_date = (datetime.utcnow() - timedelta(days=3)).replace(microsecond=0).isoformat() + "Z"
    end_date = (datetime.utcnow() + timedelta(days=10)).replace(microsecond=0).isoformat() + "Z"

    session = QCMSession(
        title="QCM de présélection",
        description="Session principale de présélection",
        start_date=start_date,
        end_date=end_date,
        total_questions=20,
        time_per_question=2,
        categories=categories,
        difficulties=difficulties,
        distribution_by_difficulty={"easy": 8, "medium": 9, "hard": 3},
        passing_score=60,
        is_active=True,
    )

    db.add(session)
    db.flush()

    return session


def seed_candidates(db, qcm_session: QCMSession) -> None:
    regions = ["Littoral", "Atlantique", "Ouémé", "Borgou", "Zou", "Mono"]
    schools = [
        School(name="Lycée Toffa 1", city="Porto-Novo", region="Ouémé"),
        School(name="Lycée Béhanzin", city="Porto-Novo", region="Ouémé"),
        School(name="CPEG Akpakpa", city="Cotonou", region="Littoral"),
        School(name="Lycée Mathieu Bouké", city="Parakou", region="Borgou"),
        School(name="Lycée Houffon", city="Bohicon", region="Zou"),
    ]
    db.add_all(schools)
    db.flush()

    grades = ["Seconde", "Première", "Terminale"]
    statuses = [
        CandidateStatus.REGISTERED,
        CandidateStatus.QCM_PENDING,
        CandidateStatus.QCM_COMPLETED,
        CandidateStatus.REGIONAL_SELECTED,
        CandidateStatus.BOOTCAMP_SELECTED,
        CandidateStatus.NATIONAL_FINALIST,
        CandidateStatus.REJECTED,
    ]

    for i in range(25):
        first = f"Candidat{i+1}"
        last = "Test"
        email = f"candidat{i+1}@test.bj"

        user = User(
            email=email,
            hashed_password=get_password_hash("Test@2026"),
            first_name=first,
            last_name=last,
            role=UserRole.CANDIDATE,
            is_verified=True,
            is_active=True,
        )
        db.add(user)
        db.flush()

        gender = random.choice([Gender.MALE, Gender.FEMALE, None])
        profile = CandidateProfile(
            user_id=user.id,
            date_of_birth=date(2008, 1, 1) + timedelta(days=random.randint(0, 900)),
            gender=gender,
            phone=f"+229 6{random.randint(1000000, 9999999)}",
            address=random.choice(regions),
            school_id=random.choice(schools).id,
            grade=random.choice(grades),
            status=random.choice(statuses),
            photo_url=None,
        )
        db.add(profile)
        db.flush()

        # Parent contact
        db.add(ParentContact(candidate_id=profile.id, name="Parent Test", phone="+229 60000000", email="parent@test.bj"))

        # Academic records
        for trimester in (1, 2, 3):
            db.add(AcademicRecord(candidate_id=profile.id, trimester=trimester, average=round(random.uniform(10, 18), 2)))

        # Subject scores
        for subject in ("math", "science", "informatique"):
            db.add(SubjectScore(candidate_id=profile.id, subject=subject, score=round(random.uniform(8, 20), 2)))

        # Bulletins
        db.add(Bulletin(candidate_id=profile.id, file_url="https://example.com/bulletin.pdf", trimester=1, label="Bulletin T1"))

        # QCM: pour une partie des candidats, créer tentative + résultat
        if profile.status in {
            CandidateStatus.QCM_COMPLETED,
            CandidateStatus.REGIONAL_SELECTED,
            CandidateStatus.BOOTCAMP_SELECTED,
            CandidateStatus.NATIONAL_FINALIST,
            CandidateStatus.REJECTED,
        }:
            started_at = _days_ago_iso(random.randint(1, 30))
            completed_at = _days_ago_iso(random.randint(0, 10))
            score = random.randint(25, 95)

            attempt = QCMAttempt(
                session_id=qcm_session.id,
                candidate_id=profile.id,
                started_at=started_at,
                completed_at=completed_at,
                total_questions=qcm_session.total_questions,
                time_limit=qcm_session.duration,
                score=score,
                correct_answers=int((score / 100) * qcm_session.total_questions),
                passed=score >= qcm_session.passing_score,
                time_spent=random.randint(10 * 60, qcm_session.duration * 60),
                tab_switches=random.randint(0, 5),
            )
            db.add(attempt)
            db.flush()

            # Créer 20 questions tirées au sort + réponses
            question_pool = db.query(QCMQuestion).all()
            chosen = random.sample(question_pool, k=min(qcm_session.total_questions, len(question_pool)))
            for idx, q in enumerate(chosen):
                db.add(QCMAttemptQuestion(attempt_id=attempt.id, question_id=q.id, order_index=idx))
                given = random.randint(0, 3)
                db.add(
                    QCMAnswer(
                        attempt_id=attempt.id,
                        question_id=q.id,
                        answer_given=given,
                        is_correct=(given == q.correct_answer),
                        answered_at=_now_iso(),
                        time_spent_seconds=random.randint(5, 60),
                    )
                )

            db.add(
                QCMResult(
                    candidate_id=profile.id,
                    score=float(score),
                    time_spent=attempt.time_spent,
                    completed_at=completed_at,
                )
            )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--yes", action="store_true", help="Exécuter réellement (destructif)")
    parser.add_argument("--keep-email", default="admin@olympiades-ia.bj", help="Email super_admin à conserver")
    parser.add_argument(
        "--create-super-admin-if-missing",
        action="store_true",
        help="Créer le super_admin à conserver s'il n'existe pas encore (utile sur DB vide).",
    )
    args = parser.parse_args()

    assert_postgres_database_url()

    print("⚠️  RESET + SEED (Supabase Postgres)")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    print(f"Conserver uniquement: {args.keep_email}")

    if not args.yes:
        print("\nDry-run: aucune modification n'a été effectuée.")
        print("Relance avec: python reset_and_seed_supabase.py --yes")
        return 0

    random.seed(20260216)

    init_db()

    db = SessionLocal()
    try:
        keep_email = args.keep_email.strip().lower()
        keep_user = db.query(User).filter(User.email == keep_email).first()
        if not keep_user and args.create_super_admin_if_missing:
            keep_user = User(
                email=keep_email,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                first_name=settings.FIRST_SUPERUSER_FIRSTNAME,
                last_name=settings.FIRST_SUPERUSER_LASTNAME,
                role=UserRole.SUPER_ADMIN,
                is_verified=True,
                is_active=True,
            )
            db.add(keep_user)
            db.commit()
            db.refresh(keep_user)

        soft_reset(db, args.keep_email)
        seed_content(db)
        qcm_session = seed_qcm(db)
        seed_candidates(db, qcm_session)

        db.commit()
        print("✅ Reset + seed terminés")
        return 0
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())

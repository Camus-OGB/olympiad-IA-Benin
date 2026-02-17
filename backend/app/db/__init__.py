"""
Package de base de données
"""
import os
import logging
from pathlib import Path
from sqlalchemy import text
from app.db.base_class import Base
from app.db.session import get_db, SessionLocal, engine

logger = logging.getLogger(__name__)

# Import tous les modèles pour que SQLAlchemy les connaisse
from app.models.user import User
from app.models.candidate_profile import (
    CandidateProfile, School, ParentContact,
    AcademicRecord, SubjectScore, QCMResult, Bulletin
)
from app.models.content import (
    News, FAQ,
    Edition, TimelinePhase, CalendarEvent, SelectionCriterion, EditionPartner,
    PastEdition, PastTimelinePhase, GalleryImage, Testimonial,
    Achievement, PressRelease, EditionStat,
    Partner, Page
)
from app.models.general_testimonial import GeneralTestimonial
from app.models.qcm_category import QCMCategory
from app.models.qcm import (
    QCMQuestion, QCMSession, QCMAttempt,
    QCMAttemptQuestion, QCMAnswer
)
from app.models.resource import Resource
from app.models.audit_log import AuditLog


def init_db():
    """
    Initialise la base de données via le script SQL DDL complet.

    Sur une BD vierge : crée toutes les tables, types et index.
    Sur une BD existante : les CREATE TABLE IF NOT EXISTS sont ignorés,
    aucune donnée n'est touchée.
    """
    schema_file = Path(__file__).parent.parent.parent / "migrations" / "init_schema.sql"

    if not schema_file.exists():
        logger.warning(f"Script SQL non trouvé: {schema_file}. Fallback sur SQLAlchemy create_all.")
        Base.metadata.create_all(bind=engine)
        return

    sql = schema_file.read_text(encoding="utf-8")

    with engine.begin() as conn:
        # Exécuter le script complet en une seule transaction
        conn.execute(text(sql))

    logger.info("Schéma de base de données initialisé via init_schema.sql")

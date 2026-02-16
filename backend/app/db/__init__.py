"""
Package de base de données
"""
from app.db.base_class import Base
from app.db.session import get_db, SessionLocal, engine

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
from app.models.qcm import (
    QCMQuestion, QCMSession, QCMAttempt,
    QCMAttemptQuestion, QCMAnswer
)
from app.models.resource import Resource


def init_db():
    """Initialise la base de données"""
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)

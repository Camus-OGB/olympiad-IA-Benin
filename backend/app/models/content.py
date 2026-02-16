"""
Modèles pour le contenu du site vitrine - Section 2
Normalisé en 3FN
"""
from sqlalchemy import Column, String, Text, Integer, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base, BaseModel
import uuid


class News(Base, BaseModel):
    """
    Actualités et annonces - Section 2.1: Page d'accueil
    Déjà en 3FN — tous les attributs dépendent de la clé primaire.
    """
    __tablename__ = "news"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)  # Résumé court
    image_url = Column(String, nullable=True)
    author = Column(String, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    published_at = Column(String, nullable=True)  # ISO format datetime
    category = Column(String, nullable=True)  # Annonce, Actualité, etc.

    def __repr__(self):
        return f"<News {self.title}>"


class FAQ(Base, BaseModel):
    """
    Questions fréquemment posées - Section 2.3 et 2.4
    Déjà en 3FN.
    """
    __tablename__ = "faqs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, nullable=True)  # Inscription, QCM, Sélection, etc.
    order = Column(Integer, default=0)  # Ordre d'affichage
    is_published = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<FAQ {self.question[:50]}>"


class Edition(Base, BaseModel):
    """
    Informations sur l'édition en cours - Section 2.3: Édition 2026
    Normalisée en 3FN : les données JSON sont éclatées en tables enfants.
    """
    __tablename__ = "editions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    year = Column(Integer, unique=True, nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)  # Une seule édition active

    # Présentation
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Relations normalisées (au lieu de colonnes JSON)
    timeline_phases = relationship("TimelinePhase", back_populates="edition", cascade="all, delete-orphan",
                                   order_by="TimelinePhase.phase_order")
    calendar_events = relationship("CalendarEvent", back_populates="edition", cascade="all, delete-orphan",
                                    order_by="CalendarEvent.event_date")
    selection_criteria = relationship("SelectionCriterion", back_populates="edition", cascade="all, delete-orphan",
                                      order_by="SelectionCriterion.stage_order")
    edition_partners = relationship("EditionPartner", back_populates="edition", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Edition {self.year}>"


class TimelinePhase(Base, BaseModel):
    """
    Phases de la timeline d'une édition (3FN)
    Remplace le champ JSON timeline_data dans Edition.
    """
    __tablename__ = "timeline_phases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    edition_id = Column(String, ForeignKey("editions.id", ondelete="CASCADE"), nullable=False)

    phase_order = Column(Integer, nullable=False)  # Ordre de la phase (1-6)
    title = Column(String, nullable=False)  # Ex: "Phase 1 : Inscription"
    description = Column(Text, nullable=True)
    start_date = Column(String, nullable=True)  # ISO date
    end_date = Column(String, nullable=True)  # ISO date
    is_current = Column(Boolean, default=False, nullable=False)

    # Relation
    edition = relationship("Edition", back_populates="timeline_phases")

    def __repr__(self):
        return f"<TimelinePhase {self.title}>"


class CalendarEvent(Base, BaseModel):
    """
    Événements du calendrier d'une édition (3FN)
    Remplace le champ JSON calendar_data dans Edition.
    """
    __tablename__ = "calendar_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    edition_id = Column(String, ForeignKey("editions.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(String, nullable=False)  # ISO date
    event_type = Column(String, nullable=True)  # "deadline", "event", "announcement"

    # Relation
    edition = relationship("Edition", back_populates="calendar_events")

    def __repr__(self):
        return f"<CalendarEvent {self.title}>"


class SelectionCriterion(Base, BaseModel):
    """
    Critères de sélection par étape d'une édition (3FN)
    Remplace le champ JSON selection_criteria dans Edition.
    """
    __tablename__ = "selection_criteria"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    edition_id = Column(String, ForeignKey("editions.id", ondelete="CASCADE"), nullable=False)

    stage = Column(String, nullable=False)  # "qcm", "regional", "bootcamp", "final"
    stage_order = Column(Integer, nullable=False)
    criterion = Column(Text, nullable=False)  # Description du critère
    min_score = Column(Float, nullable=True)  # Score minimum si applicable

    # Relation
    edition = relationship("Edition", back_populates="selection_criteria")

    def __repr__(self):
        return f"<SelectionCriterion {self.stage}: {self.criterion[:50]}>"


class EditionPartner(Base, BaseModel):
    """
    Association entre une édition et ses partenaires (3FN)
    Table de jointure Many-to-Many avec attributs supplémentaires.
    Remplace le champ JSON partners_data dans Edition.
    """
    __tablename__ = "edition_partners"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    edition_id = Column(String, ForeignKey("editions.id", ondelete="CASCADE"), nullable=False)
    partner_id = Column(String, ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)

    role = Column(String, nullable=True)  # "sponsor", "technique", "institutionnel"
    contribution = Column(Text, nullable=True)

    # Relations
    edition = relationship("Edition", back_populates="edition_partners")
    partner = relationship("Partner", back_populates="edition_partners")

    def __repr__(self):
        return f"<EditionPartner edition={self.edition_id} partner={self.partner_id}>"


class PastEdition(Base, BaseModel):
    """
    Bilan des éditions passées - Section 2.2
    Normalisée en 3FN : les données JSON sont éclatées en tables enfants.
    """
    __tablename__ = "past_editions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    year = Column(Integer, unique=True, nullable=False)

    # Participation internationale
    host_country = Column(String, nullable=True)
    num_students = Column(Integer, nullable=True)

    # Relations normalisées (au lieu de colonnes JSON)
    past_timeline_phases = relationship("PastTimelinePhase", back_populates="past_edition",
                                         cascade="all, delete-orphan", order_by="PastTimelinePhase.phase_order")
    gallery_images = relationship("GalleryImage", back_populates="past_edition", cascade="all, delete-orphan")
    testimonials = relationship("Testimonial", back_populates="past_edition", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="past_edition", cascade="all, delete-orphan")
    press_releases = relationship("PressRelease", back_populates="past_edition", cascade="all, delete-orphan")
    edition_stats = relationship("EditionStat", back_populates="past_edition", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PastEdition {self.year}>"


class PastTimelinePhase(Base, BaseModel):
    """
    Timeline du parcours d'une édition passée (3FN)
    Remplace le champ JSON timeline_data dans PastEdition.
    """
    __tablename__ = "past_timeline_phases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    past_edition_id = Column(String, ForeignKey("past_editions.id", ondelete="CASCADE"), nullable=False)

    phase_order = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(String, nullable=True)

    # Relation
    past_edition = relationship("PastEdition", back_populates="past_timeline_phases")

    def __repr__(self):
        return f"<PastTimelinePhase {self.title}>"


class GalleryImage(Base, BaseModel):
    """
    Photos de la galerie d'une édition passée (3FN)
    Remplace le champ JSON gallery_urls dans PastEdition.
    """
    __tablename__ = "gallery_images"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    past_edition_id = Column(String, ForeignKey("past_editions.id", ondelete="CASCADE"), nullable=False)

    image_url = Column(String, nullable=False)
    caption = Column(String, nullable=True)
    order = Column(Integer, default=0)

    # Relation
    past_edition = relationship("PastEdition", back_populates="gallery_images")

    def __repr__(self):
        return f"<GalleryImage {self.image_url}>"


class Testimonial(Base, BaseModel):
    """
    Témoignages d'une édition passée (3FN)
    Remplace le champ JSON testimonials_data dans PastEdition.
    """
    __tablename__ = "testimonials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    past_edition_id = Column(String, ForeignKey("past_editions.id", ondelete="CASCADE"), nullable=False)

    author_name = Column(String, nullable=False)
    author_role = Column(String, nullable=True)  # "élève", "mentor", "parent"
    content = Column(Text, nullable=False)
    video_url = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)

    # Relation
    past_edition = relationship("PastEdition", back_populates="testimonials")

    def __repr__(self):
        return f"<Testimonial by {self.author_name}>"


class Achievement(Base, BaseModel):
    """
    Distinctions et performances d'une édition passée (3FN)
    Remplace le champ JSON achievements_data dans PastEdition.
    """
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    past_edition_id = Column(String, ForeignKey("past_editions.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # "médaille", "mention", "classement"
    rank = Column(Integer, nullable=True)

    # Relation
    past_edition = relationship("PastEdition", back_populates="achievements")

    def __repr__(self):
        return f"<Achievement {self.title}>"


class PressRelease(Base, BaseModel):
    """
    Communiqués de presse d'une édition passée (3FN)
    Remplace le champ JSON press_releases dans PastEdition.
    """
    __tablename__ = "press_releases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    past_edition_id = Column(String, ForeignKey("past_editions.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, nullable=False)
    source = Column(String, nullable=True)  # Nom du média
    url = Column(String, nullable=True)
    published_at = Column(String, nullable=True)  # ISO date

    # Relation
    past_edition = relationship("PastEdition", back_populates="press_releases")

    def __repr__(self):
        return f"<PressRelease {self.title}>"


class EditionStat(Base, BaseModel):
    """
    Statistiques comparatives d'une édition passée (3FN)
    Remplace le champ JSON stats_data dans PastEdition.
    """
    __tablename__ = "edition_stats"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    past_edition_id = Column(String, ForeignKey("past_editions.id", ondelete="CASCADE"), nullable=False)

    metric_name = Column(String, nullable=False)  # "nb_inscrits", "nb_filles", "score_moyen"
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String, nullable=True)  # "%", "candidats", "points"

    # Relation
    past_edition = relationship("PastEdition", back_populates="edition_stats")

    def __repr__(self):
        return f"<EditionStat {self.metric_name}={self.metric_value}>"


class Partner(Base, BaseModel):
    """
    Partenaires institutionnels - Section 2.4: Pages institutionnelles
    Déjà en 3FN. Ajout de la relation avec EditionPartner.
    """
    __tablename__ = "partners"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    website_url = Column(String, nullable=True)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relation normalisée
    edition_partners = relationship("EditionPartner", back_populates="partner")

    def __repr__(self):
        return f"<Partner {self.name}>"


class Page(Base, BaseModel):
    """
    Pages institutionnelles - Section 2.4
    À propos, Mission, Contact, etc.
    Déjà en 3FN (meta_data est acceptable en JSON car c'est un
    bag de propriétés libres pour le SEO, sans structure fixe).
    """
    __tablename__ = "pages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String, unique=True, nullable=False)  # a-propos, mission, contact
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)  # HTML/Markdown
    meta_data = Column(JSON, nullable=True)  # SEO, images, etc.
    is_published = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<Page {self.slug}>"

"""
Schémas Pydantic pour le contenu du site vitrine - Section 2
Adaptés à la structure 3FN
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# === News & Actualités - Section 2.1 ===

class NewsCreate(BaseModel):
    """Création d'une actualité"""
    title: str = Field(..., min_length=5, max_length=200)
    content: str = Field(..., min_length=10)
    excerpt: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    is_published: bool = False
    external_url: Optional[str] = None  # Lien vers l'article original


class NewsUpdate(BaseModel):
    """Mise à jour d'une actualité"""
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    excerpt: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None
    external_url: Optional[str] = None  # Lien vers l'article original


class NewsResponse(BaseModel):
    """Réponse actualité"""
    id: str
    title: str
    content: str
    excerpt: Optional[str]
    image_url: Optional[str]
    author: Optional[str]
    category: Optional[str]
    is_published: bool
    published_at: Optional[str]
    external_url: Optional[str]  # Lien vers l'article original
    created_at: str
    updated_at: str

    @field_validator('created_at', 'updated_at', 'published_at', mode='before')
    @classmethod
    def convert_datetime_to_str(cls, value):
        """Convertir datetime en string ISO format"""
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    class Config:
        from_attributes = True


# === FAQ - Section 2.3, 2.4 ===

class FAQCreate(BaseModel):
    """Création d'une FAQ"""
    question: str = Field(..., min_length=10)
    answer: str = Field(..., min_length=10)
    category: Optional[str] = None
    order: int = 0
    is_published: bool = True


class FAQUpdate(BaseModel):
    """Mise à jour d'une FAQ"""
    question: Optional[str] = Field(None, min_length=10)
    answer: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = None
    order: Optional[int] = None
    is_published: Optional[bool] = None


class FAQResponse(BaseModel):
    """Réponse FAQ"""
    id: str
    question: str
    answer: str
    category: Optional[str]
    order: int
    is_published: bool
    created_at: str

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime_to_str(cls, value):
        """Convertir datetime en string ISO format"""
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    class Config:
        from_attributes = True


# === Sous-entités normalisées pour Edition ===

class TimelinePhaseCreate(BaseModel):
    """Création d'une phase de timeline"""
    phase_order: int = Field(..., ge=1, le=10)
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False


class TimelinePhaseResponse(BaseModel):
    """Réponse phase de timeline"""
    id: str
    phase_order: int
    title: str
    description: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    is_current: bool

    class Config:
        from_attributes = True


class CalendarEventCreate(BaseModel):
    """Création d'un événement calendrier"""
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    event_date: str = Field(..., min_length=10)
    event_type: Optional[str] = None


class CalendarEventResponse(BaseModel):
    """Réponse événement calendrier"""
    id: str
    title: str
    description: Optional[str]
    event_date: str
    event_type: Optional[str]

    class Config:
        from_attributes = True


class SelectionCriterionCreate(BaseModel):
    """Création d'un critère de sélection"""
    stage: str = Field(..., min_length=2)
    stage_order: int = Field(..., ge=1)
    criterion: str = Field(..., min_length=5)
    min_score: Optional[float] = None


class SelectionCriterionResponse(BaseModel):
    """Réponse critère de sélection"""
    id: str
    stage: str
    stage_order: int
    criterion: str
    min_score: Optional[float]

    class Config:
        from_attributes = True


class EditionPartnerCreate(BaseModel):
    """Ajout d'un partenaire à une édition"""
    partner_id: str
    role: Optional[str] = None
    contribution: Optional[str] = None


class EditionPartnerResponse(BaseModel):
    """Réponse partenaire d'édition"""
    id: str
    partner_id: str
    role: Optional[str]
    contribution: Optional[str]

    class Config:
        from_attributes = True


# === Éditions - Section 2.3 ===

class EditionCreate(BaseModel):
    """Création d'une édition"""
    year: int = Field(..., ge=2020, le=2100)
    is_active: bool = False
    title: str
    description: Optional[str] = None
    # Les sous-entités sont créées via des endpoints dédiés


class EditionUpdate(BaseModel):
    """Mise à jour d'une édition"""
    year: Optional[int] = Field(None, ge=2020, le=2100)
    is_active: Optional[bool] = None
    title: Optional[str] = None
    description: Optional[str] = None


class EditionResponse(BaseModel):
    """Réponse édition avec sous-entités normalisées"""
    id: str
    year: int
    is_active: bool
    title: str
    description: Optional[str]
    timeline_phases: List[TimelinePhaseResponse] = []
    calendar_events: List[CalendarEventResponse] = []
    selection_criteria: List[SelectionCriterionResponse] = []
    edition_partners: List[EditionPartnerResponse] = []
    created_at: str

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime_to_str(cls, value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    class Config:
        from_attributes = True


# === Sous-entités normalisées pour PastEdition ===

class PastTimelinePhaseCreate(BaseModel):
    """Création d'une phase timeline passée"""
    phase_order: int = Field(..., ge=1)
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    date: Optional[str] = None


class PastTimelinePhaseResponse(BaseModel):
    """Réponse phase timeline passée"""
    id: str
    phase_order: int
    title: str
    description: Optional[str]
    date: Optional[str]

    class Config:
        from_attributes = True


class GalleryImageCreate(BaseModel):
    """Ajout d'une image à la galerie"""
    image_url: str
    caption: Optional[str] = None
    order: int = 0


class GalleryImageResponse(BaseModel):
    """Réponse image galerie"""
    id: str
    image_url: str
    caption: Optional[str]
    order: int

    class Config:
        from_attributes = True


class TestimonialCreate(BaseModel):
    """Création d'un témoignage"""
    student_name: str = Field(..., min_length=2)
    school: Optional[str] = None
    role: Optional[str] = None  # Distinction/rôle (ex: "Médaille d'Or")
    quote: str = Field(..., min_length=10)
    image_url: Optional[str] = None


class TestimonialResponse(BaseModel):
    """Réponse témoignage"""
    id: str
    student_name: str
    school: Optional[str]
    role: Optional[str]
    quote: str
    image_url: Optional[str]
    past_edition_id: Optional[str] = None  # Ajouté pour le contexte

    class Config:
        from_attributes = True


# ==================== GENERAL TESTIMONIALS ====================

class GeneralTestimonialCreate(BaseModel):
    """Création d'un témoignage général"""
    author_name: str = Field(..., min_length=2)
    author_role: Optional[str] = None  # Ex: "Mentor", "Parent", "Sponsor"
    author_type: Optional[str] = None  # Ex: "mentor", "parent", "sponsor", "partner"
    content: str = Field(..., min_length=10)
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    organization: Optional[str] = None
    display_order: Optional[int] = 0
    is_published: Optional[bool] = True


class GeneralTestimonialUpdate(BaseModel):
    """Mise à jour d'un témoignage général"""
    author_name: Optional[str] = Field(None, min_length=2)
    author_role: Optional[str] = None
    author_type: Optional[str] = None
    content: Optional[str] = Field(None, min_length=10)
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    organization: Optional[str] = None
    display_order: Optional[int] = None
    is_published: Optional[bool] = None


class GeneralTestimonialResponse(BaseModel):
    """Réponse témoignage général"""
    id: str
    author_name: str
    author_role: Optional[str]
    author_type: Optional[str]
    content: str
    photo_url: Optional[str]
    video_url: Optional[str]
    organization: Optional[str]
    display_order: Optional[int]
    is_published: bool

    class Config:
        from_attributes = True


class AchievementCreate(BaseModel):
    """Création d'une distinction"""
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    category: Optional[str] = None
    rank: Optional[int] = None


class AchievementResponse(BaseModel):
    """Réponse distinction"""
    id: str
    title: str
    description: Optional[str]
    category: Optional[str]
    rank: Optional[int]

    class Config:
        from_attributes = True


class PressReleaseCreate(BaseModel):
    """Création d'un communiqué de presse"""
    title: str = Field(..., min_length=5)
    source: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[str] = None


class PressReleaseResponse(BaseModel):
    """Réponse communiqué de presse"""
    id: str
    title: str
    source: Optional[str]
    url: Optional[str]
    published_at: Optional[str]

    class Config:
        from_attributes = True


class EditionStatCreate(BaseModel):
    """Création d'une statistique d'édition"""
    metric_name: str = Field(..., min_length=2)
    metric_value: float
    metric_unit: Optional[str] = None


class EditionStatResponse(BaseModel):
    """Réponse statistique d'édition"""
    id: str
    metric_name: str
    metric_value: float
    metric_unit: Optional[str]

    class Config:
        from_attributes = True


# === Éditions passées - Section 2.2 ===

class PastEditionCreate(BaseModel):
    """Création d'une édition passée"""
    year: int = Field(..., ge=2020, le=2100)
    host_country: Optional[str] = None
    num_students: Optional[int] = None
    # Les sous-entités sont créées via des endpoints dédiés


class PastEditionUpdate(BaseModel):
    """Mise à jour d'une édition passée"""
    year: Optional[int] = Field(None, ge=2020, le=2100)
    host_country: Optional[str] = None
    num_students: Optional[int] = None


class PastEditionResponse(BaseModel):
    """Réponse édition passée avec sous-entités normalisées"""
    id: str
    year: int
    host_country: Optional[str]
    num_students: Optional[int]
    past_timeline_phases: List[PastTimelinePhaseResponse] = []
    gallery_images: List[GalleryImageResponse] = []
    testimonials: List[TestimonialResponse] = []
    achievements: List[AchievementResponse] = []
    press_releases: List[PressReleaseResponse] = []
    edition_stats: List[EditionStatResponse] = []
    created_at: str

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime_to_str(cls, value):
        """Convertir datetime en string ISO format"""
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    class Config:
        from_attributes = True


# === Partenaires - Section 2.4 ===

class PartnerCreate(BaseModel):
    """Création d'un partenaire"""
    name: str = Field(..., min_length=2)
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    order: int = 0
    is_active: bool = True


class PartnerUpdate(BaseModel):
    """Mise à jour d'un partenaire"""
    name: Optional[str] = Field(None, min_length=2)
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class PartnerResponse(BaseModel):
    """Réponse partenaire"""
    id: str
    name: str
    logo_url: Optional[str]
    description: Optional[str]
    website_url: Optional[str]
    order: int
    is_active: bool

    class Config:
        from_attributes = True


# === Pages institutionnelles - Section 2.4 ===

class PageCreate(BaseModel):
    """Création d'une page"""
    slug: str = Field(..., min_length=2, max_length=100)
    title: str = Field(..., min_length=2)
    content: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None
    is_published: bool = True


class PageUpdate(BaseModel):
    """Mise à jour d'une page"""
    slug: Optional[str] = Field(None, min_length=2, max_length=100)
    title: Optional[str] = Field(None, min_length=2)
    content: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None
    is_published: Optional[bool] = None


class PageResponse(BaseModel):
    """Réponse page"""
    id: str
    slug: str
    title: str
    content: Optional[str]
    meta_data: Optional[Dict[str, Any]]
    is_published: bool
    created_at: str

    @field_validator('created_at', mode='before')
    @classmethod
    def convert_datetime_to_str(cls, value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    class Config:
        from_attributes = True


# === Next Deadline ===

class NextDeadlineResponse(BaseModel):
    """
    Prochaine deadline dynamique pour le compte à rebours du site vitrine
    """
    phase_title: str  # Ex: "Phase 1 : Inscription"
    phase_description: Optional[str] = None
    target_date: str  # ISO datetime de la prochaine deadline
    target_type: str  # "start" ou "end"
    current_phase: Optional[Dict[str, Any]] = None  # Phase actuellement en cours si applicable
    edition_year: int

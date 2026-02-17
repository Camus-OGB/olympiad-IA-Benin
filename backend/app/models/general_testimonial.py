"""
Modèle pour les témoignages généraux (mentors, parents, sponsors, etc.)
Séparé des témoignages de participants d'éditions passées
"""
import uuid
from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean
from sqlalchemy.sql import func
from app.db.base_class import Base, BaseModel


class GeneralTestimonial(Base, BaseModel):
    """
    Témoignages généraux (non liés à une édition spécifique)
    Pour mentors, parents, sponsors, partenaires, etc.
    """
    __tablename__ = "general_testimonials"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Informations de l'auteur
    author_name = Column(String, nullable=False)
    author_role = Column(String, nullable=True)  # Ex: "Mentor", "Parent", "Sponsor", "Partenaire"
    author_type = Column(String, nullable=True)  # Ex: "mentor", "parent", "sponsor", "partner"

    # Contenu
    content = Column(Text, nullable=False)  # Le témoignage complet

    # Médias
    photo_url = Column(String, nullable=True)  # Photo de l'auteur
    video_url = Column(String, nullable=True)  # URL vidéo (YouTube, Vimeo, etc.)

    # Organisation/Affiliation (optionnel)
    organization = Column(String, nullable=True)  # Ex: "Ministère de l'Éducation", "Google Benin"

    # Ordre d'affichage
    display_order = Column(Integer, nullable=True, default=0)

    # Publication
    is_published = Column(Boolean, nullable=False, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<GeneralTestimonial {self.author_name} ({self.author_type})>"

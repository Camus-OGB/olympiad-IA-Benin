"""
Modèle pour les ressources pédagogiques
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid


class ResourceType(str, enum.Enum):
    """Type de ressource"""
    PDF = "pdf"
    VIDEO = "video"
    LINK = "link"
    DOCUMENT = "document"


class ResourceCategory(str, enum.Enum):
    """Catégorie de ressource"""
    GUIDE = "guide"
    COURS = "cours"
    EXERCICES = "exercices"
    TUTORIEL = "tutoriel"
    AUTRE = "autre"


class Resource(Base):
    """Ressource pédagogique pour les candidats"""
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(SQLEnum(ResourceType), nullable=False)
    category = Column(SQLEnum(ResourceCategory), nullable=False)
    url = Column(String(500), nullable=False)
    file_size = Column(String(20))  # Ex: "2.4 MB"
    duration = Column(String(20))    # Ex: "45 min" pour les vidéos
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)  # Pour l'ordre d'affichage

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

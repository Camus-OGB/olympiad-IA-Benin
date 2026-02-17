"""
Modèle pour les catégories de QCM
Permet une gestion centralisée des catégories avec statistiques
"""
from sqlalchemy import Column, String, Text, Integer, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base, BaseModel
import uuid


class QCMCategory(Base, BaseModel):
    """
    Catégories de questions QCM
    Ex: Mathématiques, Intelligence Artificielle, Logique, Python, etc.
    """
    __tablename__ = "qcm_categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Informations de base
    name = Column(String(100), nullable=False, unique=True)  # Ex: "Mathématiques"
    slug = Column(String(100), nullable=False, unique=True)  # Ex: "mathematiques"
    description = Column(Text, nullable=True)

    # Visuel
    color = Column(String(7), nullable=True)  # Couleur hex: #FF5733
    icon = Column(String(50), nullable=True)  # Nom de l'icône Lucide: "Calculator"

    # Ordre d'affichage
    display_order = Column(Integer, nullable=True, default=0)

    # Statut
    is_active = Column(Boolean, default=True, nullable=False)

    # Relations
    questions = relationship("QCMQuestion", back_populates="category_ref")

    def __repr__(self):
        return f"<QCMCategory {self.name}>"

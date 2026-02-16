"""
Modèle User basé sur Section 3: Espace Candidat
"""
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, Integer
from sqlalchemy.orm import relationship
from app.db.base_class import Base, BaseModel
import enum
import uuid


class UserRole(str, enum.Enum):
    """Rôles utilisateur"""
    CANDIDATE = "candidate"  # Candidat
    ADMIN = "admin"  # Administrateur
    SUPER_ADMIN = "super_admin"  # Super administrateur


class User(Base, BaseModel):
    """
    Modèle User - Section 3.1: Inscription et authentification
    Gère l'authentification et les informations de base
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Authentification (Section 3.1)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CANDIDATE, nullable=False)

    # Informations de base
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)

    # Statuts
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)  # Email vérifié

    # OTP pour vérification email et reset password
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(String, nullable=True)  # ISO format datetime

    # Relations
    profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"

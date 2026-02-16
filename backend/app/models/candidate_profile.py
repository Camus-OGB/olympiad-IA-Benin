"""
Modèle CandidateProfile basé sur Section 3.2: Profil candidat
Normalisé en 3FN
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Date, Enum as SQLEnum, Float, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base, BaseModel
import enum
import uuid


class Gender(str, enum.Enum):
    """Genre"""
    MALE = "male"
    FEMALE = "female"


class CandidateStatus(str, enum.Enum):
    """
    Statut du candidat dans le processus - Section 3.4: Tableau de bord
    """
    REGISTERED = "registered"  # Inscrit
    QCM_PENDING = "qcm_pending"  # En attente du QCM
    QCM_COMPLETED = "qcm_completed"  # QCM complété
    REGIONAL_SELECTED = "regional_selected"  # Sélectionné pour formation régionale
    BOOTCAMP_SELECTED = "bootcamp_selected"  # Sélectionné pour bootcamp
    NATIONAL_FINALIST = "national_finalist"  # Finaliste national (top 4)
    REJECTED = "rejected"  # Non retenu


class School(Base, BaseModel):
    """
    Table de référence des établissements scolaires (3FN)
    Élimine la redondance des noms d'école en texte libre.
    """
    __tablename__ = "schools"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)  # Département/région du Bénin

    # Relations
    candidate_profiles = relationship("CandidateProfile", back_populates="school_ref")

    def __repr__(self):
        return f"<School {self.name}>"


class CandidateProfile(Base, BaseModel):
    """
    Profil candidat - Section 3.2: Profil candidat (3FN)
    Ne contient que les attributs directement dépendants du candidat.
    """
    __tablename__ = "candidate_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Informations personnelles (Section 3.2)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(SQLEnum(Gender), nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)

    # Photo d'identité (upload avec recadrage)
    photo_url = Column(String, nullable=True)

    # Informations scolaires - référence normalisée
    school_id = Column(String, ForeignKey("schools.id"), nullable=True)
    grade = Column(String, nullable=True)  # Classe actuelle

    # Statut dans le processus (Section 3.4: Tableau de bord)
    status = Column(SQLEnum(CandidateStatus), default=CandidateStatus.REGISTERED, nullable=False)

    # Relations
    user = relationship("User", back_populates="profile")
    school_ref = relationship("School", back_populates="candidate_profiles")
    parent_contact = relationship("ParentContact", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    academic_records = relationship("AcademicRecord", back_populates="candidate", cascade="all, delete-orphan")
    subject_scores = relationship("SubjectScore", back_populates="candidate", cascade="all, delete-orphan")
    qcm_result = relationship("QCMResult", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    bulletins = relationship("Bulletin", back_populates="candidate", cascade="all, delete-orphan")
    qcm_attempts = relationship("QCMAttempt", back_populates="candidate", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CandidateProfile user_id={self.user_id}>"


class ParentContact(Base, BaseModel):
    """
    Contact parent/tuteur (3FN)
    Séparé car ces attributs dépendent du parent, pas directement du candidat.
    Obligatoire pour les mineurs.
    """
    __tablename__ = "parent_contacts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, unique=True)

    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    # Relation
    candidate = relationship("CandidateProfile", back_populates="parent_contact")

    def __repr__(self):
        return f"<ParentContact candidate_id={self.candidate_id}>"


class AcademicRecord(Base, BaseModel):
    """
    Moyennes trimestrielles (3FN)
    Chaque ligne = un trimestre, élimine les colonnes répétitives
    average_trimester_1/2/3.
    """
    __tablename__ = "academic_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    trimester = Column(Integer, nullable=False)  # 1, 2, ou 3
    average = Column(Float, nullable=False)  # Moyenne générale du trimestre

    # Relation
    candidate = relationship("CandidateProfile", back_populates="academic_records")

    def __repr__(self):
        return f"<AcademicRecord candidate_id={self.candidate_id} T{self.trimester}={self.average}>"


class SubjectScore(Base, BaseModel):
    """
    Notes par matière (3FN)
    Chaque ligne = une matière, permet d'ajouter facilement d'autres matières
    sans modifier le schéma.
    """
    __tablename__ = "subject_scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String, nullable=False)  # "math", "science", "physique", etc.
    score = Column(Float, nullable=False)

    # Relation
    candidate = relationship("CandidateProfile", back_populates="subject_scores")

    def __repr__(self):
        return f"<SubjectScore candidate_id={self.candidate_id} {self.subject}={self.score}>"


class QCMResult(Base, BaseModel):
    """
    Résultat QCM (3FN) - Section 3.3
    Séparé car ces attributs dépendent du QCM passé, pas du profil candidat.
    """
    __tablename__ = "qcm_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, unique=True)

    score = Column(Float, nullable=False)
    time_spent = Column(Integer, nullable=True)  # En secondes
    completed_at = Column(String, nullable=True)  # ISO format datetime

    # Relation
    candidate = relationship("CandidateProfile", back_populates="qcm_result")

    def __repr__(self):
        return f"<QCMResult candidate_id={self.candidate_id} score={self.score}>"


class Bulletin(Base, BaseModel):
    """
    Bulletins scolaires (3FN)
    Chaque bulletin est une ligne distincte au lieu d'un JSON array.
    """
    __tablename__ = "bulletins"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)

    file_url = Column(String, nullable=False)
    trimester = Column(Integer, nullable=True)  # Trimestre correspondant (optionnel)
    label = Column(String, nullable=True)  # Libellé (ex: "Bulletin T1 2025")

    # Relation
    candidate = relationship("CandidateProfile", back_populates="bulletins")

    def __repr__(self):
        return f"<Bulletin candidate_id={self.candidate_id} url={self.file_url}>"

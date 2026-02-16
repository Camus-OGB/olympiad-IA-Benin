"""
Schémas Pydantic pour les candidats - Section 3.2
Adaptés à la structure 3FN
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from app.models.candidate_profile import Gender, CandidateStatus

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


# === Sous-entités normalisées ===

class ParentContactCreate(BaseModel):
    """Création/mise à jour du contact parent"""
    name: str = Field(..., max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = None


class ParentContactResponse(BaseModel):
    """Réponse contact parent"""
    id: str
    name: str
    phone: Optional[str]
    email: Optional[str]

    class Config:
        from_attributes = True


class AcademicRecordCreate(BaseModel):
    """Création d'un relevé trimestriel"""
    trimester: int = Field(..., ge=1, le=3)
    average: float = Field(..., ge=0, le=20)


class AcademicRecordResponse(BaseModel):
    """Réponse relevé trimestriel"""
    id: str
    trimester: int
    average: float

    class Config:
        from_attributes = True


class SubjectScoreCreate(BaseModel):
    """Création d'une note par matière"""
    subject: str = Field(..., min_length=2, max_length=50)
    score: float = Field(..., ge=0, le=20)


class SubjectScoreResponse(BaseModel):
    """Réponse note par matière"""
    id: str
    subject: str
    score: float

    class Config:
        from_attributes = True


class QCMResultResponse(BaseModel):
    """Réponse résultat QCM"""
    id: str
    score: float
    time_spent: Optional[int]
    completed_at: Optional[str]

    class Config:
        from_attributes = True


class BulletinResponse(BaseModel):
    """Réponse bulletin scolaire"""
    id: str
    file_url: str
    trimester: Optional[int]
    label: Optional[str]

    class Config:
        from_attributes = True


class SchoolResponse(BaseModel):
    """Réponse école"""
    id: str
    name: str
    city: Optional[str]
    region: Optional[str]

    class Config:
        from_attributes = True


class SchoolCreate(BaseModel):
    """Création d'une école"""
    name: str = Field(..., min_length=2, max_length=200)
    city: Optional[str] = None
    region: Optional[str] = None


# === Profil candidat principal ===

class CandidateProfileUpdate(BaseModel):
    """Mise à jour du profil candidat - Section 3.2"""
    # Informations personnelles
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None

    # Informations scolaires - référence par ID
    school_id: Optional[str] = None
    grade: Optional[str] = Field(None, max_length=50)

    # Contact parent (optionnel, mis à jour via endpoint dédié aussi)
    parent_contact: Optional[ParentContactCreate] = None

    # Moyennes trimestrielles
    academic_records: Optional[List[AcademicRecordCreate]] = None

    # Notes par matière
    subject_scores: Optional[List[SubjectScoreCreate]] = None


class CandidateProfileResponse(BaseModel):
    """Réponse profil candidat complet"""
    id: str
    user_id: str

    # Informations personnelles
    date_of_birth: Optional[date]
    gender: Optional[Gender]
    phone: Optional[str]
    address: Optional[str]
    photo_url: Optional[str]

    # Informations scolaires
    school_id: Optional[str]
    school_ref: Optional[SchoolResponse] = None
    grade: Optional[str]

    # Sous-entités normalisées
    parent_contact: Optional[ParentContactResponse] = None
    academic_records: List[AcademicRecordResponse] = []
    subject_scores: List[SubjectScoreResponse] = []
    qcm_result: Optional[QCMResultResponse] = None
    bulletins: List[BulletinResponse] = []

    # Statut et progression
    status: CandidateStatus

    created_at: str
    updated_at: str

    @validator('created_at', 'updated_at', pre=True)
    def convert_datetime_to_str(cls, value):
        """Convertir datetime en string ISO format"""
        if hasattr(value, 'isoformat'):
            return value.isoformat()
        return value

    class Config:
        from_attributes = True


class CandidateDashboard(BaseModel):
    """Tableau de bord candidat - Section 3.4"""
    user: "UserResponse"
    profile: CandidateProfileResponse
    progress_percentage: float
    next_steps: List[str]
    notifications: List[str]
    profile_completion: float

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    """Réponse après upload de fichier"""
    file_url: str
    bulletin_id: Optional[str] = None  # ID de l'entrée bulletin créée

    class Config:
        from_attributes = True


# Rebuild models to resolve forward references
from app.schemas.user import UserResponse
CandidateDashboard.model_rebuild()

"""
Schémas Pydantic pour l'espace administrateur - Section 4
Adaptés à la structure 3FN
"""
from pydantic import BaseModel, ConfigDict, validator
from typing import List, Dict, Any, Optional, TYPE_CHECKING
from datetime import datetime
from app.models.candidate_profile import CandidateStatus, Gender

if TYPE_CHECKING:
    from app.schemas.user import UserResponse
    from app.schemas.candidate import CandidateProfileResponse


# === Statistiques - Section 4.4 ===

class DashboardStats(BaseModel):
    """Statistiques du tableau de bord admin"""
    # Candidats
    total_candidates: int
    verified_candidates: int
    qcm_completed: int

    # Par région
    candidates_by_region: Dict[str, int]

    # Par statut
    candidates_by_status: Dict[str, int]

    # Par genre
    candidates_by_gender: Dict[str, int]

    # Progression QCM
    qcm_average_score: Optional[float]

    # Inscriptions récentes
    recent_registrations: int


class CandidateListItem(BaseModel):
    """Item de liste de candidats - Section 4.1"""
    id: str
    user_id: str
    full_name: str
    email: str
    school_name: Optional[str]  # Dénormalisé pour l'affichage en liste
    school_region: Optional[str]  # Région de l'école
    grade: Optional[str]
    gender: Optional[Gender]
    status: CandidateStatus
    qcm_score: Optional[float]
    created_at: str
    is_verified: bool
    profile_completion: int  # Pourcentage de complétion du profil (0-100)

    @validator('created_at', pre=True)
    def convert_datetime_to_str(cls, value):
        """Convertir datetime en string ISO format"""
        if hasattr(value, 'isoformat'):
            return value.isoformat()
        return value


class CandidateListResponse(BaseModel):
    """Réponse liste paginée de candidats"""
    items: List[CandidateListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class CandidateDetailResponse(BaseModel):
    """Détail complet d'un candidat pour admin"""
    id: str
    user: "UserResponse"
    profile: "CandidateProfileResponse"

    class Config:
        from_attributes = True


class CandidateStatusUpdate(BaseModel):
    """Mise à jour du statut d'un candidat"""
    status: CandidateStatus
    comment: Optional[str] = None


class BulkActionRequest(BaseModel):
    """Action groupée sur les candidats - Section 4.1"""
    candidate_ids: List[str]
    action: str  # "validate", "reject", "export", "notify"
    comment: Optional[str] = None


class ExportRequest(BaseModel):
    """Requête d'export de données - Section 4.1"""
    format: str = "csv"  # "csv" ou "excel"
    filters: Optional[Dict[str, Any]] = None
    fields: Optional[List[str]] = None


class UpdateCandidateStatusRequest(BaseModel):
    """Mise à jour du statut d'un candidat"""
    new_status: CandidateStatus
    note: Optional[str] = None
    send_notification: bool = True


class BulkStatusUpdateRequest(BaseModel):
    """Mise à jour en masse du statut"""
    candidate_ids: List[str]
    new_status: CandidateStatus
    send_notification: bool = True


class AuditLogResponse(BaseModel):
    """Entrée du journal d'audit"""
    id: str
    admin_id: Optional[str] = None
    admin_email: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    resource_label: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Rebuild models to resolve forward references
from app.schemas.user import UserResponse
from app.schemas.candidate import CandidateProfileResponse
CandidateDetailResponse.model_rebuild()

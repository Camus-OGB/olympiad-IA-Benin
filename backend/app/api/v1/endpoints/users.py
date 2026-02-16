"""
Endpoints pour la gestion des utilisateurs
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.db.session import get_db
from app.models.user import User
from app.models.candidate_profile import CandidateProfile, CandidateStatus
from app.utils.deps import get_current_user
from app.schemas.user import UserResponse

router = APIRouter()


class UpdateUserRequest(BaseModel):
    """Requête de mise à jour des informations utilisateur"""
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour les informations de l'utilisateur connecté
    """
    # Vérifier si le profil candidat est verrouillé
    if current_user.role == "candidate":
        profile = db.query(CandidateProfile).filter(
            CandidateProfile.user_id == current_user.id
        ).first()

        if profile:
            locked_statuses = [
                CandidateStatus.QCM_PENDING,
                CandidateStatus.QCM_COMPLETED,
                CandidateStatus.REGIONAL_SELECTED,
                CandidateStatus.BOOTCAMP_SELECTED,
                CandidateStatus.NATIONAL_FINALIST
            ]
            if profile.status in locked_statuses:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Votre profil a été validé et ne peut plus être modifié"
                )

    # Vérifier si l'email est déjà utilisé par un autre utilisateur
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
        current_user.email = user_update.email
        # Si l'email change, remettre is_verified à False
        current_user.is_verified = False

    # Mettre à jour les champs fournis
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name

    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name

    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les informations de l'utilisateur connecté
    """
    return current_user

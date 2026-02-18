"""
Endpoints d'authentification - Section 3.1: Inscription et authentification
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.candidate_profile import CandidateProfile, CandidateStatus, School
from app.schemas.user import (
    RegisterRequest,
    VerifyOTPRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserResponse,
    TokenResponse
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    generate_otp
)
from app.core.config import settings
from app.services.email_service import send_verification_email, send_welcome_email, send_password_reset_email
from app.utils.deps import get_current_user, get_current_verified_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Inscription d'un nouveau candidat - Section 3.1

    Processus:
    1. Vérification de l'unicité de l'email
    2. Création du compte utilisateur
    3. Génération et envoi de l'OTP par email
    4. Retour des informations utilisateur (non vérifié)
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte existe déjà avec cet email"
        )

    # Créer l'utilisateur
    user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        first_name=request.first_name,
        last_name=request.last_name,
        role=UserRole.CANDIDATE,
        is_verified=False,
        is_active=True
    )

    # Générer l'OTP
    otp_code = generate_otp()
    user.otp_code = otp_code
    user.otp_expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()

    db.add(user)
    db.commit()
    db.refresh(user)

    # Créer le profil candidat avec les infos de base
    # Chercher ou créer l'école dans la table School normalisée
    school_obj = db.query(School).filter(School.name == request.school).first()
    if not school_obj:
        school_obj = School(name=request.school)
        db.add(school_obj)
        db.flush()  # Pour obtenir l'ID

    profile = CandidateProfile(
        user_id=user.id,
        school_id=school_obj.id,
        grade=request.grade,
        status=CandidateStatus.REGISTERED
    )
    db.add(profile)
    db.commit()

    # Envoyer l'email de vérification
    try:
        await send_verification_email(user.email, otp_code)
    except Exception as e:
        logger.error(f"Erreur envoi email: {str(e)}")
        # On ne bloque pas l'inscription même si l'email échoue

    return user


@router.post("/verify-otp", response_model=UserResponse)
async def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    """
    Vérification de l'OTP pour confirmer l'email - Section 3.1

    Après vérification réussie:
    - L'utilisateur devient vérifié
    - Un email de bienvenue est envoyé
    """
    # Trouver l'utilisateur
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    # Vérifier si déjà vérifié
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà vérifié"
        )

    # Vérifier l'OTP
    if not user.otp_code or user.otp_code != request.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code OTP invalide"
        )

    # Vérifier l'expiration
    if user.otp_expires_at:
        expiry = datetime.fromisoformat(user.otp_expires_at)
        if datetime.utcnow() > expiry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Code OTP expiré. Demandez un nouveau code."
            )

    # Marquer comme vérifié
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)

    # Envoyer l'email de bienvenue
    try:
        await send_welcome_email(user.email, user.first_name)
    except Exception as e:
        logger.error(f"Erreur envoi email de bienvenue: {str(e)}")

    return user


@router.post("/resend-otp", response_model=dict)
async def resend_otp(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Renvoyer un nouveau code OTP
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà vérifié"
        )

    # Générer un nouveau OTP
    otp_code = generate_otp()
    user.otp_code = otp_code
    user.otp_expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
    db.commit()

    # Envoyer l'email
    try:
        await send_verification_email(user.email, otp_code)
    except Exception as e:
        logger.error(f"Erreur envoi email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'envoi de l'email"
        )

    return {"message": "Un nouveau code a été envoyé à votre email"}


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Connexion avec email et mot de passe - Section 3.1

    Retourne:
    - Les tokens JWT dans des cookies HttpOnly sécurisés
    - Les informations utilisateur dans le body
    """
    # Trouver l'utilisateur
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    # Vérifier le mot de passe
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    # Vérifier si l'utilisateur est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )

    # Créer les tokens
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    # Définir les cookies - Configuration adaptée à l'environnement
    # En développement (localhost): secure=False, samesite="lax", httponly=False pour faciliter le debug
    # En production (HTTPS): secure=True, samesite="none", httponly=True pour la sécurité
    is_production = settings.ENVIRONMENT == "production"

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=is_production,  # HttpOnly seulement en production pour la sécurité
        secure=is_production,  # True seulement en production HTTPS
        samesite="none" if is_production else "lax",  # Cross-domain en prod, lax en dev
        path="/",  # Cookie valide sur toutes les routes
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=is_production,  # HttpOnly seulement en production pour la sécurité
        secure=is_production,  # True seulement en production HTTPS
        samesite="none" if is_production else "lax",  # Cross-domain en prod, lax en dev
        path="/",  # Cookie valide sur toutes les routes
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
async def logout(response: Response):
    """
    Déconnexion - suppression des cookies
    """
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")

    return {"message": "Déconnexion réussie"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Rafraîchir l'access token avec le refresh token
    """
    from jose import JWTError, jwt

    # Récupérer le refresh token du cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token manquant"
        )

    try:
        # Décoder le token
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )

    # Récupérer l'utilisateur
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé ou inactif"
        )

    # Créer un nouveau access token
    new_access_token = create_access_token({"sub": user.id})

    # Mettre à jour le cookie pour cross-domain
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,  # Obligatoire pour SameSite=None
        samesite="none",  # Permet les cookies cross-domain
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Demande de réinitialisation de mot de passe
    Envoie un OTP par email
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Ne pas révéler si l'email existe ou non (sécurité)
        return {"message": "Si cet email existe, un code de réinitialisation a été envoyé"}

    # Générer un OTP pour la réinitialisation
    otp_code = generate_otp()
    user.otp_code = otp_code
    user.otp_expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
    db.commit()

    # Envoyer l'email
    try:
        await send_password_reset_email(user.email, otp_code)
    except Exception as e:
        logger.error(f"Erreur envoi email de réinitialisation: {str(e)}")

    return {"message": "Si cet email existe, un code de réinitialisation a été envoyé"}


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Réinitialiser le mot de passe avec le code OTP
    """
    # Trouver l'utilisateur
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    # Vérifier l'OTP
    if not user.otp_code or user.otp_code != request.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code OTP invalide"
        )

    # Vérifier l'expiration
    if user.otp_expires_at:
        expiry = datetime.fromisoformat(user.otp_expires_at)
        if datetime.utcnow() > expiry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Code OTP expiré"
            )

    # Réinitialiser le mot de passe
    user.hashed_password = get_password_hash(request.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Mot de passe réinitialisé avec succès"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les informations de l'utilisateur connecté
    """
    return current_user


class ChangePasswordRequest(BaseModel):
    """Requête de changement de mot de passe"""
    current_password: str
    new_password: str


@router.put("/me/password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Changer le mot de passe de l'utilisateur connecté
    """
    # Vérifier le mot de passe actuel
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect"
        )

    # Valider le nouveau mot de passe
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit contenir au moins 8 caractères"
        )

    # Mettre à jour le mot de passe
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    return {"message": "Mot de passe changé avec succès"}

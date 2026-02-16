"""
Dépendances FastAPI pour l'authentification et les permissions
"""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from typing import Optional

from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

# Security scheme
security = HTTPBearer(auto_error=False)


def get_current_user_from_cookie(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Récupère l'utilisateur courant depuis le cookie access_token
    """
    # Récupérer le token du cookie
    access_token = request.cookies.get("access_token")

    if not access_token:
        return None

    try:
        # Décoder le token
        payload = decode_token(access_token)
        if not payload or payload.get("type") != "access":
            return None

        user_id: str = payload.get("sub")
        if user_id is None:
            return None

        # Récupérer l'utilisateur
        user = db.query(User).filter(User.id == user_id).first()
        return user

    except JWTError:
        return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """
    Récupère l'utilisateur courant - REQUIS
    Renvoie une erreur 401 si non authentifié
    """
    user = get_current_user_from_cookie(request, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )

    return user


def get_current_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Récupère l'utilisateur courant ET vérifié
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email non vérifié"
        )
    return current_user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Récupère l'utilisateur courant actif
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utilisateur inactif"
        )
    return current_user


def get_current_candidate(
    current_user: User = Depends(get_current_verified_user)
) -> User:
    """
    Récupère l'utilisateur candidat uniquement
    """
    if current_user.role not in [UserRole.CANDIDATE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux candidats"
        )
    return current_user


def get_current_admin(
    current_user: User = Depends(get_current_verified_user)
) -> User:
    """
    Récupère l'utilisateur admin ou super_admin uniquement
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user


def get_current_super_admin(
    current_user: User = Depends(get_current_verified_user)
) -> User:
    """
    Récupère l'utilisateur super_admin uniquement
    """
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux super administrateurs"
        )
    return current_user


def get_optional_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Récupère l'utilisateur courant si authentifié, sinon None
    Utile pour les routes publiques qui affichent du contenu différent si connecté
    """
    return get_current_user_from_cookie(request, db)

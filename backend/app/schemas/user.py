"""
Schémas Pydantic pour les utilisateurs et l'authentification
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# === Authentification ===

class LoginRequest(BaseModel):
    """Requête de connexion"""
    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    """Requête d'inscription - Section 3.1"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    school: str = Field(..., min_length=2)
    grade: str = Field(..., min_length=1)

    @validator('password')
    def validate_password(cls, v):
        """Valide la force du mot de passe"""
        if not any(char.isdigit() for char in v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not any(char.isupper() for char in v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        return v


class VerifyOTPRequest(BaseModel):
    """Vérification du code OTP"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    """Demande de réinitialisation de mot de passe"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Réinitialisation de mot de passe avec OTP"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)


# === Réponses ===

class TokenResponse(BaseModel):
    """Réponse avec tokens d'authentification"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    """Réponse utilisateur de base"""
    id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_verified: bool
    is_active: bool
    created_at: datetime
    profile_id: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Réponse après authentification réussie"""
    user: UserResponse
    token: str  # Pour compatibilité frontend (le vrai token est dans le cookie)
    message: str = "Connexion réussie"


class MessageResponse(BaseModel):
    """Réponse générique avec message"""
    message: str


class UserUpdate(BaseModel):
    """Mise à jour des informations utilisateur"""
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)


class PasswordChange(BaseModel):
    """Changement de mot de passe"""
    current_password: str
    new_password: str = Field(..., min_length=8)


# Rebuild models to resolve forward references
TokenResponse.model_rebuild()

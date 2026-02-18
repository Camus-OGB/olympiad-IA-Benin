"""
Configuration de l'application
"""
from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    """Configuration de l'application"""

    # Application
    APP_NAME: str = "Olympiades IA Bénin API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./olympiades.db"
    DATABASE_SSLMODE: str = ""  # Ex: "require" pour Supabase

    # Security
    SECRET_KEY: str = "olympiades-ia-benin-dev-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 jours (30 * 24 * 60)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Security middleware
    CSRF_PROTECTION_ENABLED: bool = True
    SECURITY_HEADERS_ENABLED: bool = True
    ACCESS_LOG_ENABLED: bool = True

    @property
    def cors_origins(self) -> List[str]:
        """Retourne la liste des origines CORS autorisées"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def trusted_origins(self) -> List[str]:
        origins = set(self.cors_origins)
        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL.strip())
        return sorted([o for o in origins if o])

    # Email (Brevo API)
    BREVO_API_KEY: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = ""

    # Supabase Storage - Buckets séparés
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Buckets séparés par type de fichier
    SUPABASE_BUCKET_PHOTOS: str = "olympiades-photos"
    SUPABASE_BUCKET_BULLETINS: str = "olympiades-bulletins"
    SUPABASE_BUCKET_DOCUMENTS: str = "olympiades-documents"
    SUPABASE_BUCKET_NEWS: str = "olympiades-news"
    SUPABASE_BUCKET_RESOURCES: str = "olympiades-resources"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Cache Redis (optionnel)
    REDIS_ENABLED: bool = False
    REDIS_URL: str = "redis://localhost:6379/0"

    # Premier super utilisateur
    FIRST_SUPERUSER_EMAIL: str = "admin@olympiades-ia.bj"
    FIRST_SUPERUSER_PASSWORD: str = "Admin@2026"
    FIRST_SUPERUSER_FIRSTNAME: str = "Admin"
    FIRST_SUPERUSER_LASTNAME: str = "System"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

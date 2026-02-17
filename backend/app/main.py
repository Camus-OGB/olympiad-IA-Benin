"""
Application FastAPI principale - Olympiades IA Bénin
Documentation Swagger disponible sur /docs
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time
import uuid
from typing import Optional

from app.core.config import settings
from app.db import init_db, SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.core.security import decode_token

try:
    import redis.asyncio as redis
except Exception:  # pragma: no cover
    redis = None

# Configuration du logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Événements au démarrage et à l'arrêt de l'application
    """
    # Démarrage
    logger.info(f"🚀 Démarrage de {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"📊 Environnement: {settings.ENVIRONMENT}")

    # Initialiser la base de données
    logger.info("📦 Initialisation de la base de données...")
    init_db()

    app.state.redis: Optional[object] = None
    if settings.REDIS_ENABLED:
        if redis is None:
            logger.error("❌ REDIS_ENABLED=true mais la dépendance redis n'est pas disponible")
        else:
            try:
                client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
                await client.ping()
                app.state.redis = client
                logger.info("✅ Redis connecté")
            except Exception as e:
                logger.error(f"❌ Impossible de se connecter à Redis: {str(e)}")

    # Créer le super admin par défaut s'il n'existe pas
    db = SessionLocal()
    try:
        admin = db.query(User).filter(
            User.email == settings.FIRST_SUPERUSER_EMAIL
        ).first()

        if not admin:
            admin = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                first_name=settings.FIRST_SUPERUSER_FIRSTNAME,
                last_name=settings.FIRST_SUPERUSER_LASTNAME,
                role=UserRole.SUPER_ADMIN,
                is_verified=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            logger.info(f"✅ Super admin créé: {settings.FIRST_SUPERUSER_EMAIL}")
        else:
            logger.info(f"ℹ️  Super admin existe: {settings.FIRST_SUPERUSER_EMAIL}")
    except Exception as e:
        logger.error(f"❌ Erreur création super admin: {str(e)}")
        db.rollback()
    finally:
        db.close()

    logger.info("✅ Application démarrée avec succès!")
    logger.info(f"📖 Documentation Swagger: http://localhost:{settings.PORT}/docs")
    logger.info(f"📖 Documentation ReDoc: http://localhost:{settings.PORT}/redoc")

    yield  # L'application tourne

    # Arrêt
    logger.info("🛑 Arrêt de l'application...")

    if getattr(app.state, "redis", None) is not None:
        try:
            await app.state.redis.close()
        except Exception:
            pass


# Créer l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="""
# Olympiades d'Intelligence Artificielle du Bénin - API

API complète pour la plateforme des Olympiades IA Bénin.

## Fonctionnalités

### 🎯 Espace Candidat
- Inscription et authentification (email + OTP)
- Gestion du profil personnel et scolaire
- Upload de documents (photo, bulletins)
- Tableau de bord de suivi

### 👨‍💼 Espace Administrateur
- Gestion des candidatures
- Validation et suivi des candidats
- Statistiques et rapports
- Gestion du contenu du site

### 🌐 Site Vitrine
- Actualités et annonces
- FAQ dynamique
- Informations sur les éditions
- Pages institutionnelles

## Authentification

L'API utilise des **cookies HttpOnly** avec des tokens JWT :
- `access_token` : Valide 8 heures
- `refresh_token` : Valide 7 jours

Les tokens sont automatiquement gérés par le backend.

## Sections

Basé sur le document de spécifications :
- **Section 2** : Site Vitrine Institutionnel
- **Section 3** : Espace Candidat
- **Section 4** : Espace Administrateur

*(La Section 5 - Gamification sera implémentée ultérieurement)*

## Support

Pour toute question, contactez l'équipe technique.
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)


# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def access_log_middleware(request: Request, call_next):
    if not settings.ACCESS_LOG_ENABLED:
        return await call_next(request)

    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    start = time.perf_counter()

    user_id = None
    access_token = request.cookies.get("access_token")
    if access_token:
        payload = decode_token(access_token)
        if payload and payload.get("type") == "access":
            user_id = payload.get("sub")

    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000

    response.headers["X-Request-ID"] = request_id
    logger.info(
        "ACCESS request_id=%s ip=%s user_id=%s method=%s path=%s status=%s duration_ms=%.2f",
        request_id,
        request.client.host if request.client else "-",
        user_id or "-",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.middleware("http")
async def csrf_protection_middleware(request: Request, call_next):
    if not settings.CSRF_PROTECTION_ENABLED:
        return await call_next(request)

    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origin = request.headers.get("origin")
        referer = request.headers.get("referer")
        trusted = set(settings.trusted_origins)

        def _is_trusted(value: str | None) -> bool:
            if not value:
                return False
            return any(value.startswith(t) for t in trusted)

        if request.cookies.get("access_token") or request.cookies.get("refresh_token"):
            if origin and not _is_trusted(origin):
                return JSONResponse(status_code=403, content={"detail": "CSRF blocked"})
            if not origin and referer and not _is_trusted(referer):
                return JSONResponse(status_code=403, content={"detail": "CSRF blocked"})
            if not origin and not referer:
                return JSONResponse(status_code=403, content={"detail": "CSRF blocked"})

    return await call_next(request)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    if not settings.SECURITY_HEADERS_ENABLED:
        return response

    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
    )
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
    )

    if request.url.path in {"/docs", "/redoc", "/openapi.json"}:
        if "Content-Security-Policy" in response.headers:
            del response.headers["Content-Security-Policy"]

    if settings.ENVIRONMENT == "production":
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

    return response


# Handler d'erreurs global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Gère toutes les exceptions non capturées"""
    logger.error(f"Erreur non gérée: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur"}
    )


# Routes de base
@app.get("/", tags=["Root"])
async def root():
    """Page d'accueil de l'API"""
    return {
        "message": "Olympiades IA Bénin - API",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Vérification de l'état de l'application"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


# Import des routers
from app.api.v1.endpoints import auth, candidates, admin, content, qcm, users, resources, upload, qcm_categories

# Inclusion des routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentification"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Utilisateurs"])
app.include_router(candidates.router, prefix="/api/v1/candidates", tags=["Candidats"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administration"])
app.include_router(content.router, prefix="/api/v1/content", tags=["Contenu"])
app.include_router(qcm.router, prefix="/api/v1/qcm", tags=["QCM"])
app.include_router(qcm_categories.router, prefix="/api/v1/qcm-categories", tags=["Catégories QCM"])
app.include_router(resources.router, prefix="/api/v1/resources", tags=["Ressources"])
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

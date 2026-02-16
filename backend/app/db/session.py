"""
Configuration de la session de base de données
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Créer le moteur de base de données
connect_args = {
    "check_same_thread": False
} if "sqlite" in settings.DATABASE_URL else {}

if ("postgres" in settings.DATABASE_URL.lower()) and settings.DATABASE_SSLMODE:
    connect_args = {**connect_args, "sslmode": settings.DATABASE_SSLMODE}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency pour obtenir une session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

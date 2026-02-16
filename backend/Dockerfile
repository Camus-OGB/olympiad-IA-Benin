# Dockerfile pour le backend FastAPI
# Olympiades IA Bénin
# Optimisé pour Render avec multi-stage build

# Stage 1: Builder - Installation des dépendances
FROM python:3.12.8-slim as builder

# Variables d'environnement pour Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Dépendances système pour psycopg2 et compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Créer un environnement virtuel
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copier et installer les dépendances Python
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Stage 2: Runtime - Image finale légère
FROM python:3.12.8-slim

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH"

# Installer uniquement les dépendances runtime pour PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root pour la sécurité
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copier l'environnement virtuel depuis le builder
COPY --from=builder /opt/venv /opt/venv

# Définir le répertoire de travail
WORKDIR /app

# Copier le code de l'application
COPY --chown=appuser:appuser . .

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port (Render utilise $PORT)
EXPOSE 8000

# Healthcheck pour monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Commande de démarrage
# Render injecte automatiquement la variable $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

# Olympiades d'Intelligence Artificielle du Bénin 🇧🇯

Plateforme complète de gestion des Olympiades d'IA du Bénin.

## 🏗️ Architecture

Ce projet est divisé en deux parties :

### Frontend (Next.js)
- Application web moderne avec Next.js 15
- Interface candidat et admin
- CMS avec éditeur WYSIWYG
- Voir [frontend/README.md](frontend/README.md)

### Backend (FastAPI)
- API REST avec FastAPI
- Base de données PostgreSQL
- Authentification JWT
- Voir [backend/README.md](backend/README.md)

## 🚀 Démarrage rapide

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:3000

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API : http://localhost:8000
Docs : http://localhost:8000/api/docs

Le projet contient des templates :

- `backend/.env.example`
- `frontend/.env.example`

### Checklist rapide

- Utiliser PostgreSQL (Supabase) en production via `backend/.env` (non versionné)
- Vérifier que tu ne pushes aucun secret (DB URL, clés Supabase, SMTP)
- Supprimer les artefacts locaux (logs/DB locale/cache) avant le push

## 📁 Structure du projet

```
olympiades-ia-benin/
├── frontend/          # Application Next.js
├── backend/           # API FastAPI
├── docs/              # Documentation
└── README.md
```

## 🛠️ Stack Technologique

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- TipTap Editor

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT

## 👥 Développement

### Frontend
```bash
cd frontend
npm run dev          # Développement
npm run build        # Build production
npm run lint         # Linter
```

### Backend
```bash
cd backend
uvicorn app.main:app --reload  # Développement
pytest                          # Tests
black app/                      # Format code
```

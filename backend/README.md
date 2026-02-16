# Backend - Olympiades IA Bénin

API FastAPI complète pour la plateforme des Olympiades d'Intelligence Artificielle du Bénin.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Structure du projet](#structure-du-projet)
- [Modèles de données](#modèles-de-données)
- [Sécurité](#sécurité)

## 🎯 Fonctionnalités

### Section 2 : Site Vitrine Institutionnel
- ✅ Actualités et annonces
- ✅ FAQ dynamique
- ✅ Informations sur l'édition en cours
- ✅ Bilan des éditions passées
- ✅ Partenaires institutionnels
- ✅ Pages institutionnelles (À propos, Mission, Contact)

### Section 3 : Espace Candidat
- ✅ Inscription et authentification (Email + OTP)
- ✅ Gestion du profil candidat (personnel et scolaire)
- ✅ Upload de documents (photo, bulletins)
- ✅ Tableau de bord de suivi
- ✅ Gestion du statut dans le processus de sélection

### Section 4 : Espace Administrateur
- ✅ Statistiques et tableau de bord
- ✅ Gestion des candidatures
- ✅ Mise à jour du statut des candidats
- ✅ Actions en masse
- ✅ Export de données
- ✅ Gestion du contenu du site

## 🏗️ Architecture

L'API suit une architecture en couches :

```
backend/
├── app/
│   ├── api/v1/endpoints/     # Endpoints API
│   ├── core/                 # Configuration et sécurité
│   ├── db/                   # Base de données
│   ├── models/               # Modèles SQLAlchemy
│   ├── schemas/              # Schémas Pydantic
│   ├── services/             # Services métier
│   ├── utils/                # Utilitaires
│   └── main.py               # Point d'entrée FastAPI
```

## 🛠️ Technologies

- **FastAPI** 0.115.0 - Framework web moderne et rapide
- **SQLAlchemy** 2.0.36 - ORM pour PostgreSQL/SQLite
- **Pydantic** v2 - Validation de données
- **Python-Jose** - JWT pour l'authentification
- **Passlib** avec Bcrypt - Hachage de mots de passe
- **FastAPI-Mail** - Envoi d'emails (OTP, notifications)
- **Supabase** - Stockage de fichiers
- **Uvicorn** - Serveur ASGI

## 📦 Installation

### Option 1 : Installation manuelle

**Prérequis** :
- Python 3.11+
- PostgreSQL (recommandé) ou SQLite (développement)
- Un compte Supabase (pour le stockage de fichiers)
- Un serveur SMTP (pour les emails)

**Étapes** :

1. **Naviguer vers le dossier backend**
```bash
cd backend
```

2. **Créer un environnement virtuel**
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

5. **Lancer le serveur**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ L'API sera disponible sur http://localhost:8000
📖 Documentation : http://localhost:8000/docs

> **Note** : La base de données et le super admin seront créés automatiquement au premier démarrage

## ⚙️ Configuration

### 📦 Configuration Supabase Storage

Pour configurer le stockage de fichiers (photos, bulletins), suivez le guide détaillé :

👉 **[Guide complet Supabase Storage](SUPABASE_SETUP.md)**

**Résumé rapide** :
1. Créez un bucket `olympiades-documents` dans Supabase
2. Récupérez vos credentials (URL + anon key)
3. Configurez les politiques de sécurité
4. Ajoutez les variables dans `.env`

### 🔧 Variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend/` :

```env
# Application
APP_NAME=Olympiades IA Bénin API
APP_VERSION=1.0.0
ENVIRONMENT=development
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Base de données
DATABASE_URL=sqlite:///./olympiades.db
# Ou pour PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/olympiades_ia

# Sécurité
SECRET_KEY=your-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_FROM=noreply@olympiades-ia.bj
MAIL_FROM_NAME=Olympiades IA Bénin

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_BUCKET=olympiades-documents

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Super Admin par défaut
FIRST_SUPERUSER_EMAIL=admin@olympiades-ia.bj
FIRST_SUPERUSER_PASSWORD=Admin@2026
FIRST_SUPERUSER_FIRSTNAME=Admin
FIRST_SUPERUSER_LASTNAME=Système
```

## 🚀 Utilisation

### Lancer le serveur de développement

```bash
# Méthode 1 : Avec uvicorn directement
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Méthode 2 : Via le script Python
python -m app.main
```

Le serveur sera accessible sur :
- **API** : http://localhost:8000
- **Documentation Swagger** : http://localhost:8000/docs
- **Documentation ReDoc** : http://localhost:8000/redoc

### Super Admin par défaut

Au premier démarrage, un compte super admin est automatiquement créé :
- **Email** : `admin@olympiades-ia.bj`
- **Mot de passe** : `Admin@2026`

⚠️ **Changez ces identifiants en production !**

## 🧰 Scripts utilitaires

Les scripts de maintenance et d'initialisation sont regroupés dans `backend/scripts/`.

Des wrappers sont conservés à la racine du dossier `backend/` pour compatibilité.

### Reset + seed Supabase (destructif)

```bash
python reset_and_seed_supabase.py
python reset_and_seed_supabase.py --yes --keep-email admin@olympiades-ia.bj
```

### Créer un utilisateur admin/super admin

```bash
python create_admin.py --email admin@olympiades-ia.bj --password "Admin@2026" --role super_admin
```

## 📚 API Documentation

### Endpoints principaux

#### Authentification (`/api/v1/auth`)
- `POST /register` - Inscription d'un candidat
- `POST /verify-otp` - Vérifier le code OTP
- `POST /resend-otp` - Renvoyer un code OTP
- `POST /login` - Connexion
- `POST /logout` - Déconnexion
- `POST /refresh` - Rafraîchir le token
- `POST /forgot-password` - Mot de passe oublié
- `POST /reset-password` - Réinitialiser le mot de passe
- `GET /me` - Informations utilisateur connecté

#### Candidats (`/api/v1/candidates`)
- `GET /me/profile` - Récupérer mon profil
- `PUT /me/profile` - Mettre à jour mon profil
- `POST /me/photo` - Upload photo d'identité
- `POST /me/bulletins` - Upload bulletin scolaire
- `DELETE /me/bulletins/{index}` - Supprimer un bulletin
- `GET /me/dashboard` - Tableau de bord candidat

#### Administration (`/api/v1/admin`)
- `GET /dashboard/stats` - Statistiques générales
- `GET /candidates` - Liste des candidats (avec filtres)
- `GET /candidates/{id}` - Détails d'un candidat
- `PUT /candidates/{id}/status` - Mettre à jour le statut
- `POST /candidates/bulk-update-status` - Mise à jour en masse
- `GET /candidates/{id}/export` - Exporter les données
- `DELETE /candidates/{id}` - Supprimer un candidat

#### Contenu (`/api/v1/content`)
- **News** : `GET, POST, PUT, DELETE /news`
- **FAQ** : `GET, POST, PUT, DELETE /faq`
- **Éditions** : `GET, POST, PUT /editions`
- **Éditions passées** : `GET, POST, PUT /past-editions`
- **Partenaires** : `GET, POST, PUT, DELETE /partners`
- **Pages** : `GET, POST, PUT, DELETE /pages`

### Authentification

L'API utilise des **cookies HttpOnly** pour la sécurité :

1. **Connexion** : `POST /api/v1/auth/login`
   - Les tokens sont automatiquement stockés dans les cookies
   - `access_token` : Valide 8 heures
   - `refresh_token` : Valide 7 jours

2. **Requêtes authentifiées** : Les cookies sont envoyés automatiquement

3. **Rafraîchissement** : `POST /api/v1/auth/refresh`
   - Génère un nouveau access_token sans re-login

4. **Déconnexion** : `POST /api/v1/auth/logout`
   - Supprime les cookies

## 📁 Structure du projet

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── auth.py          # Authentification
│   │           ├── candidates.py    # Espace candidat
│   │           ├── admin.py         # Espace admin
│   │           └── content.py       # Contenu du site
│   ├── core/
│   │   ├── config.py               # Configuration
│   │   └── security.py             # Sécurité (JWT, hash)
│   ├── db/
│   │   ├── base_class.py           # Classe de base SQLAlchemy
│   │   ├── session.py              # Session DB
│   │   └── __init__.py             # init_db()
│   ├── models/
│   │   ├── user.py                 # User, UserRole
│   │   ├── candidate_profile.py    # CandidateProfile
│   │   └── content.py              # News, FAQ, Edition, etc.
│   ├── schemas/
│   │   ├── user.py                 # Schémas utilisateur
│   │   ├── candidate.py            # Schémas candidat
│   │   ├── admin.py                # Schémas admin
│   │   └── content.py              # Schémas contenu
│   ├── services/
│   │   ├── email_service.py        # Envoi emails
│   │   └── storage_service.py      # Upload Supabase
│   ├── utils/
│   │   └── deps.py                 # Dépendances FastAPI
│   └── main.py                     # Application FastAPI
├── .env.example                    # Template variables d'env
├── requirements.txt                # Dépendances Python
└── README.md                       # Cette documentation
```

## 💾 Modèles de données

### User
Utilisateur du système (candidat ou admin)
- email, hashed_password, role
- OTP pour vérification email
- is_verified, is_active

### CandidateProfile
Profil complet du candidat
- Informations personnelles (date_of_birth, gender, phone, address)
- Contact parent/tuteur
- Photo d'identité
- Informations scolaires (school, grade, moyennes, notes)
- Bulletins scolaires (PDF)
- Statut dans le processus (registered → qcm_pending → ... → national_finalist)
- Résultats QCM

### Content Models
- **News** : Actualités et annonces
- **FAQ** : Questions fréquentes
- **Edition** : Édition en cours (timeline, calendrier, critères)
- **PastEdition** : Éditions passées (galerie, témoignages, performances)
- **Partner** : Partenaires institutionnels
- **Page** : Pages institutionnelles (À propos, Mission, Contact)

## 🔒 Sécurité

### Authentification
- **JWT** avec tokens dans cookies HttpOnly
- **OTP** 6 chiffres pour vérification email (15 min de validité)
- **Bcrypt** pour le hachage des mots de passe
- **Refresh tokens** pour renouvellement automatique

### Autorisation
- **Role-based access control (RBAC)**
  - `CANDIDATE` : Accès à son profil et dashboard
  - `ADMIN` : Accès à la gestion des candidats
  - `SUPER_ADMIN` : Accès complet (suppression, etc.)

### Protection des données
- **Cookies sécurisés** (HttpOnly, Secure en production, SameSite)
- **CORS** configuré pour le frontend uniquement
- **Validation** Pydantic sur toutes les entrées
- **SQL injection** prévenue par SQLAlchemy ORM

### Emails
- Emails HTML stylés et professionnels
- Templates pour : OTP, bienvenue, reset password, notifications
- Liens vers le frontend pour actions utilisateur

## 🧪 Tests

```bash
# À venir : tests unitaires et d'intégration
pytest
```

## 📝 Logs

Les logs sont configurés avec différents niveaux :
- **Development** : INFO
- **Production** : WARNING

Exemple de logs :
```
2026-02-15 10:30:00 - app.main - INFO - 🚀 Démarrage de Olympiades IA Bénin API v1.0.0
2026-02-15 10:30:01 - app.main - INFO - ✅ Super admin créé: admin@olympiades-ia.bj
2026-02-15 10:30:02 - app.api.v1.endpoints.auth - INFO - Connexion réussie pour user@example.com
```

## 🚀 Déploiement
### Avec un serveur traditionnel

1. Configurer PostgreSQL
2. Configurer les variables d'environnement
3. Lancer avec Gunicorn :
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📞 Support

Pour toute question ou problème, contactez l'équipe technique.

## 📄 Licence

© 2026 Olympiades IA Bénin. Tous droits réservés.

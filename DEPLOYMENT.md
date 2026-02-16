# 🚀 Guide de Déploiement - Olympiades IA Bénin

Guide complet pour déployer la plateforme en production.

---

## 📋 Prérequis

- Node.js 18+ et npm/yarn
- Python 3.10+
- Compte Supabase (pour le stockage de fichiers)
- Compte SMTP (Gmail, SendGrid, etc.)
- Domaine personnalisé (optionnel)

---

## 1️⃣ Configuration Supabase

### Créer les buckets de stockage

Connectez-vous à votre projet Supabase et exécutez ce SQL :

```sql
-- Bucket pour les photos de profil
INSERT INTO storage.buckets (id, name, public)
VALUES ('olympiades-photos', 'olympiades-photos', true);

-- Bucket pour les bulletins scolaires
INSERT INTO storage.buckets (id, name, public)
VALUES ('olympiades-bulletins', 'olympiades-bulletins', false);

-- Bucket pour les documents généraux
INSERT INTO storage.buckets (id, name, public)
VALUES ('olympiades-documents', 'olympiades-documents', false);

-- Bucket pour les images d'actualités
INSERT INTO storage.buckets (id, name, public)
VALUES ('olympiades-news', 'olympiades-news', true);

-- Bucket pour les ressources pédagogiques
INSERT INTO storage.buckets (id, name, public)
VALUES ('olympiades-resources', 'olympiades-resources', true);
```

### Configurer les politiques RLS (Row Level Security)

```sql
-- Photos : lecture publique, écriture authentifiée
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
USING (bucket_id = 'olympiades-photos');

CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'olympiades-photos' AND auth.role() = 'authenticated');

-- Bulletins : accès restreint
CREATE POLICY "Owner read access" ON storage.objects FOR SELECT
USING (bucket_id = 'olympiades-bulletins' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ressources : lecture publique, écriture admin
CREATE POLICY "Public read resources" ON storage.objects FOR SELECT
USING (bucket_id = 'olympiades-resources');

-- Répéter pour les autres buckets selon les besoins
```

### Récupérer les clés API

1. Aller dans **Project Settings** → **API**
2. Copier :
   - `SUPABASE_URL` : Project URL
   - `SUPABASE_KEY` : `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` : `service_role` `secret` key (pour le backend)

---

## 2️⃣ Déploiement du Backend (FastAPI)

### Render

1. **Créer une base de données PostgreSQL sur Render**
   - Render → New → PostgreSQL
   - Copier l'URL de connexion (ex: `postgres://...`)

   **Sauvegardes (Backups)**
   - Activer les sauvegardes automatiques dans les paramètres de la base PostgreSQL sur Render
   - Vérifier la fréquence (quotidienne) et la rétention
   - Tester au moins une fois la restauration sur une base de test

2. **Créer un nouveau Web Service (Backend)**

   **Option A : Déploiement avec Docker (Recommandé)** 🐳
   - Render → New → Web Service
   - Repository : lier le repo GitHub
   - Root Directory : `backend`
   - Runtime : **Docker**
   - Le Dockerfile sera automatiquement détecté
   - Render utilisera le Dockerfile optimisé (Python 3.12, multi-stage build)

   **Option B : Déploiement Python classique**
   - Render → New → Web Service
   - Repository : lier le repo GitHub
   - Root Directory : `backend`
   - Runtime : Python
   - Build Command : `pip install -r requirements.txt`
   - Start Command : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

   > 💡 **Conseil** : L'option Docker garantit un environnement identique entre dev et prod, et évite les problèmes de dépendances système.

3. **Configurer les variables d'environnement sur Render**
   Dans Render → Web Service → Environment :
   ```
   DATABASE_URL=<render_postgresql_url>
   SECRET_KEY=<générer_une_clé_sécurisée>
   SUPABASE_URL=<votre_supabase_url>
   SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<votre_email>
   SMTP_PASSWORD=<mot_de_passe_app>
   FRONTEND_URL=https://<votre-projet>.vercel.app
   ENVIRONMENT=production

   # Sécurité (middleware)
   CSRF_PROTECTION_ENABLED=true
   SECURITY_HEADERS_ENABLED=true
   ACCESS_LOG_ENABLED=true

   # Cache Redis (optionnel)
   # Si vous avez un Redis managé, exposez son URL ici.
   REDIS_ENABLED=false
   REDIS_URL=redis://localhost:6379/0
   ```

4. **Récupérer l'URL publique du backend**
   - Render fournit une URL du type : `https://<service>.onrender.com`

### 🐳 Développement local avec Docker

Pour développer localement avec Docker et avoir un environnement identique à la production :

```bash
cd backend

# Démarrer tous les services (backend + PostgreSQL + pgAdmin)
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down
```

L'application sera accessible sur :
- **API Backend** : http://localhost:8000
- **Swagger Docs** : http://localhost:8000/docs
- **pgAdmin** : http://localhost:5050

📖 Voir [backend/DOCKER.md](backend/DOCKER.md) pour plus de détails sur Docker.

---

## 3️⃣ Déploiement du Frontend (Next.js)

### Vercel

1. **Importer le projet**
   - Aller sur [vercel.com](https://vercel.com)
   - Import Git Repository
   - Sélectionner `frontend/` comme Root Directory

2. **Configurer les variables d'environnement**
   ```
   NEXT_PUBLIC_API_URL=https://<votre-backend>.onrender.com/api/v1
   ```

3. **Déployer**
   - Vercel déploie automatiquement à chaque push sur `main`

---

## 4️⃣ Configuration SMTP (Emails)

### Option A : Gmail

1. **Activer l'authentification à 2 facteurs**
2. **Créer un mot de passe d'application**
   - Google Account → Security → App Passwords
   - Générer un mot de passe pour "Mail"

3. **Variables d'environnement**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre.email@gmail.com
   SMTP_PASSWORD=<mot_de_passe_application>
   EMAILS_FROM_EMAIL=noreply@olympiades-ia.bj
   EMAILS_FROM_NAME=Olympiades IA Bénin
   ```

### Option B : SendGrid

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<votre_sendgrid_api_key>
```

### Option C : Brevo (ex-Sendinblue)

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<votre_email>
SMTP_PASSWORD=<votre_smtp_key>
```

---

## 5️⃣ Base de Données

### Migration initiale

```bash
cd backend

# Activer l'environnement virtuel
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Appliquer les migrations
python app/main.py
# La base de données sera automatiquement initialisée
```

### Créer le super admin

Le super admin est automatiquement créé au démarrage avec :
- Email : `admin@olympiades-ia.bj`
- Mot de passe : `Admin@2026`

**⚠️ IMPORTANT** : Changez ce mot de passe en production !

---

## 6️⃣ Variables d'Environnement Complètes

### Backend `.env`

```bash
# Application
APP_NAME=Olympiades IA Bénin API
APP_VERSION=1.0.0
DEBUG=False
ENVIRONMENT=production

# Server
HOST=0.0.0.0
PORT=8000

# Database (fourni par Render)
DATABASE_URL=postgresql://user:password@host:port/database

# Security
SECRET_KEY=<générer_avec: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 jours
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS
ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASSWORD=<mot_de_passe_application>
EMAILS_FROM_EMAIL=noreply@olympiades-ia.bj
EMAILS_FROM_NAME=Olympiades IA Bénin

# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Buckets
SUPABASE_BUCKET_PHOTOS=olympiades-photos
SUPABASE_BUCKET_BULLETINS=olympiades-bulletins
SUPABASE_BUCKET_DOCUMENTS=olympiades-documents
SUPABASE_BUCKET_NEWS=olympiades-news
SUPABASE_BUCKET_RESOURCES=olympiades-resources

# Frontend
FRONTEND_URL=https://votre-domaine.com

# Premier super utilisateur
FIRST_SUPERUSER_EMAIL=admin@olympiades-ia.bj
FIRST_SUPERUSER_PASSWORD=<CHANGER_EN_PRODUCTION>
FIRST_SUPERUSER_FIRSTNAME=Admin
FIRST_SUPERUSER_LASTNAME=System
```

### Frontend `.env.local`

```bash
NEXT_PUBLIC_API_URL=https://<votre-backend>.onrender.com/api/v1
```

---

## 7️⃣ Cache Redis (Optionnel mais Recommandé)

Redis est utilisé pour mettre en cache les vitrines et améliorer les performances de l'API.

### Pourquoi utiliser Redis ?

- ⚡ **Performance** : Réponses instantanées pour les données mises en cache
- 🔄 **Réduction de charge** : Moins de requêtes à la base de données
- 📊 **Scalabilité** : Meilleure gestion de la charge avec beaucoup d'utilisateurs

### Option A : Render Redis (Recommandé)

**Avantages** : Intégré à Render, facile à configurer, géré automatiquement

1. **Créer une instance Redis sur Render**
   ```
   Render Dashboard → New → Redis
   - Name: olympiades-redis
   - Plan: Choisir selon vos besoins (Free tier disponible)
   - Region: Même région que votre backend
   ```

2. **Copier l'URL de connexion**
   - Format : `redis://red-xxxxxxxxxxxxx:6379`
   - Disponible dans Redis → Connect → Internal Redis URL

3. **Ajouter les variables d'environnement au backend**
   ```
   REDIS_ENABLED=true
   REDIS_URL=redis://red-xxxxxxxxxxxxx:6379
   ```

4. **Redéployer le backend**
   - Le cache sera automatiquement activé

### Option B : Upstash Redis (Serverless)

**Avantages** : Pay-per-request, free tier généreux, global edge network

1. **Créer un compte sur [Upstash](https://upstash.com)**

2. **Créer une base de données Redis**
   ```
   Upstash Console → Create Database
   - Name: olympiades-cache
   - Type: Regional (ou Global pour multi-régions)
   - Region: Choisir le plus proche
   ```

3. **Copier l'URL de connexion**
   ```
   Format: redis://:password@region.upstash.io:6379
   ```

4. **Configurer dans Render**
   ```
   REDIS_ENABLED=true
   REDIS_URL=redis://:your_password@us1-xxxxx.upstash.io:6379
   ```

### Option C : Railway Redis

1. **Créer une instance Redis sur Railway**
   ```
   Railway → New Project → Deploy Redis
   ```

2. **Copier l'URL de connexion**
   ```
   Railway → Redis → Connect → REDIS_URL
   Format: redis://default:password@containers-us-west-xxx.railway.app:6379
   ```

3. **Ajouter à vos variables d'environnement Render**

### Option D : Redis local (Développement uniquement)

**Pour tester localement avec Docker Compose** :

```bash
cd backend

# Le docker-compose.yml inclut déjà Redis (décommenter si nécessaire)
docker-compose up -d

# Redis sera disponible sur redis://localhost:6379/0
```

**Ou avec Docker seul** :

```bash
# Démarrer Redis
docker run -d --name olympiades-redis -p 6379:6379 redis:7-alpine

# Dans votre .env local
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379/0
```

**Ou installation native** :

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

### Vérifier que Redis fonctionne

1. **Consulter les logs du backend**
   ```bash
   # Sur Render
   Dashboard → Backend Service → Logs

   # Rechercher : "Redis cache enabled" ou "Redis connected"
   ```

2. **Tester l'API**
   ```bash
   # Première requête (cache miss)
   curl https://votre-backend.onrender.com/api/v1/content/vitrine
   # Temps de réponse: ~200-500ms

   # Deuxième requête (cache hit)
   curl https://votre-backend.onrender.com/api/v1/content/vitrine
   # Temps de réponse: ~50-100ms ⚡
   ```

3. **Headers de réponse**
   ```
   X-Cache: HIT   (donnée depuis le cache)
   X-Cache: MISS  (donnée depuis la BDD)
   ```

### Désactiver Redis temporairement

Si vous rencontrez des problèmes, désactivez Redis :

```bash
REDIS_ENABLED=false
```

L'application fonctionnera normalement sans cache.

### Monitoring Redis

**Sur Render** :
- Dashboard → Redis → Metrics
- Voir : connexions actives, mémoire utilisée, commandes/sec

**Sur Upstash** :
- Console → Database → Metrics
- Voir : requêtes, latence, throughput

### Coûts estimés

| Service | Free Tier | Plan Payant |
|---------|-----------|-------------|
| **Render** | ❌ Pas de free tier | À partir de $7/mois |
| **Upstash** | ✅ 10,000 requêtes/jour | Pay-per-request (~$0.20/100K req) |
| **Railway** | ✅ $5 crédit/mois | Pay-as-you-go |
| **Docker local** | ✅ Gratuit | N/A |

**Recommandation** : Upstash pour production (free tier généreux), Docker local pour développement.

---

## 8️⃣ Sécurité en Production

### Checklist de sécurité

- [ ] Changer le mot de passe du super admin par défaut
- [ ] Utiliser HTTPS uniquement (TLS/SSL)
- [ ] Configurer `ALLOWED_ORIGINS` correctement
- [ ] Utiliser des clés secrètes fortes (SECRET_KEY)
- [ ] Activer les logs de sécurité
- [ ] Configurer les sauvegardes automatiques de la BDD
- [ ] Limiter les tentatives de connexion (rate limiting)
- [ ] Valider tous les fichiers uploadés
- [ ] Scanner régulièrement les dépendances (npm audit, pip-audit)

### Génération de clés sécurisées

```bash
# SECRET_KEY
openssl rand -hex 32

# Ou avec Python
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 9️⃣ Monitoring et Logs

### Backend (FastAPI)

Les logs sont automatiquement générés. Pour les visualiser en production :

```bash
# Render
# Voir dans le dashboard → Logs
```

### Frontend (Next.js)

Vercel fournit un dashboard de monitoring intégré avec :
- Logs de requêtes
- Métriques de performance
- Erreurs runtime

---

## 🔟 Maintenance

### Sauvegardes de la base de données

```bash
# Backup PostgreSQL
pg_dump -h <host> -U <user> -d <database> > backup_$(date +%Y%m%d).sql

# Restauration
psql -h <host> -U <user> -d <database> < backup_20260216.sql
```

### Mises à jour des dépendances

```bash
# Backend
cd backend
pip install --upgrade -r requirements.txt

# Frontend
cd frontend
npm update
npm audit fix
```

---

## 🆘 Dépannage

### Erreur CORS

**Problème** : `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution** : Vérifier que `ALLOWED_ORIGINS` dans le backend inclut l'URL du frontend.

### Erreur 502 Bad Gateway

**Problème** : Le backend ne répond pas

**Solution** :
1. Vérifier que le backend est bien démarré
2. Vérifier les logs d'erreur
3. Vérifier la connexion à la base de données

### Emails non envoyés

**Problème** : Les emails de vérification ne sont pas envoyés

**Solution** :
1. Vérifier les credentials SMTP
2. Vérifier que le port 587 n'est pas bloqué
3. Tester avec un service comme [Mailtrap](https://mailtrap.io) en dev

---

## 📞 Support

Pour toute question sur le déploiement :
- Email : contact@olympiades-ia.bj
- Documentation backend : [backend/README.md](backend/README.md)
- Documentation frontend : [frontend/README.md](frontend/README.md)

---

**Dernière mise à jour** : 16 février 2026
**Version** : 1.0.0

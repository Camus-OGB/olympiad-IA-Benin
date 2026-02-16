# 🐳 Guide Docker - Backend Olympiades IA Bénin

Ce guide explique comment lancer le backend FastAPI avec Docker.

## 📋 Prérequis

- [Docker](https://docs.docker.com/get-docker/) installé
- [Docker Compose](https://docs.docker.com/compose/install/) installé

## 🚀 Démarrage rapide

### 1. Configuration

Créez le fichier `.env` à partir du template :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos valeurs. Pour Docker, utilisez cette DATABASE_URL :

```env
DATABASE_URL=postgresql://olympiades:olympiades_password_2026@db:5432/olympiades_ia
```

### 2. Lancer l'application

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend
```

L'application sera accessible sur :
- **API Backend** : http://localhost:8000
- **Swagger Documentation** : http://localhost:8000/docs
- **ReDoc Documentation** : http://localhost:8000/redoc
- **Redis** (cache) : localhost:6379
- **pgAdmin** (gestion DB) : http://localhost:5050

### 3. Se connecter à pgAdmin (optionnel)

1. Ouvrez http://localhost:5050
2. Connectez-vous avec :
   - Email : `admin@olympiades-ia.bj`
   - Mot de passe : `admin`
3. Ajoutez un serveur :
   - Host : `db`
   - Port : `5432`
   - Database : `olympiades_ia`
   - Username : `olympiades`
   - Password : `olympiades_password_2026`

## 🛠️ Commandes utiles

### Gestion des conteneurs

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Voir les logs en temps réel
docker-compose logs -f backend

# Voir l'état des services
docker-compose ps

# Arrêter et supprimer TOUT (conteneurs, volumes, réseau)
docker-compose down -v
```

### Accéder au conteneur

```bash
# Accéder au shell du backend
docker-compose exec backend bash

# Exécuter des commandes Python
docker-compose exec backend python -c "from app.main import app; print(app)"

# Voir les logs de la base de données
docker-compose logs -f db
```

### Gestion de la base de données

```bash
# Accéder à PostgreSQL
docker-compose exec db psql -U olympiades -d olympiades_ia

# Backup de la base de données
docker-compose exec db pg_dump -U olympiades olympiades_ia > backup.sql

# Restaurer un backup
docker-compose exec -T db psql -U olympiades olympiades_ia < backup.sql
```

### Reconstruction

```bash
# Reconstruire les images après modification du Dockerfile
docker-compose build

# Forcer la reconstruction complète
docker-compose build --no-cache

# Reconstruire et redémarrer
docker-compose up -d --build
```

## 📁 Structure Docker

```
backend/
├── Dockerfile              # Image du backend FastAPI
├── docker-compose.yml      # Orchestration des services
├── .dockerignore          # Fichiers à exclure de l'image
└── .env                   # Variables d'environnement
```

## 🔧 Services inclus

### Backend (FastAPI)
- **Image** : Python 3.12.8 slim (multi-stage build)
- **Port** : 8000
- **Hot reload** : Activé en développement
- **Dépendances** : Installées depuis requirements.txt

### Database (PostgreSQL)
- **Image** : PostgreSQL 15 Alpine
- **Port** : 5432
- **Données** : Persistées dans un volume Docker
- **Credentials** :
  - Database : `olympiades_ia`
  - User : `olympiades`
  - Password : `olympiades_password_2026`

### Redis (Cache)
- **Image** : Redis 7 Alpine
- **Port** : 6379
- **Données** : Persistées dans un volume Docker
- **Persistence** : AOF (Append Only File) activée
- **Healthcheck** : Vérifie la connexion toutes les 10s

### pgAdmin (Optionnel)
- **Image** : pgAdmin 4
- **Port** : 5050
- **Accès** : admin@olympiades-ia.bj / admin

## 🌐 Réseau

Tous les services sont dans le réseau `olympiades-network` et peuvent communiquer entre eux :
- Backend → DB via `db:5432`
- Backend → Redis via `redis:6379`
- pgAdmin → DB via `db:5432`

## 💾 Volumes

Les données sont persistées dans des volumes Docker :
- `postgres_data` : Base de données PostgreSQL
- `redis_data` : Cache Redis (AOF persistence)

Ces volumes survivent aux redémarrages et suppressions de conteneurs.

## 🔐 Sécurité en production

⚠️ **IMPORTANT pour la production** :

1. **Changez TOUS les mots de passe** dans `.env` et `docker-compose.yml`
2. **Désactivez pgAdmin** (commentez le service)
3. **Utilisez des secrets Docker** au lieu de variables d'environnement
4. **Activez HTTPS** avec un reverse proxy (Nginx, Traefik)
5. **Limitez l'exposition des ports**

Exemple de configuration production :

```yaml
# Ne pas exposer PostgreSQL directement
# Commenter la section ports: dans le service db

# Utiliser des secrets
secrets:
  db_password:
    file: ./secrets/db_password.txt
  secret_key:
    file: ./secrets/secret_key.txt
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier que la DB est prête
docker-compose ps db

# Redémarrer tout
docker-compose down && docker-compose up -d
```

### Erreur de connexion à la DB

```bash
# Vérifier que la DB est accessible
docker-compose exec db psql -U olympiades -d olympiades_ia -c "SELECT 1;"

# Recréer la DB
docker-compose down -v
docker-compose up -d
```

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port 8000
sudo lsof -i :8000

# Ou changer le port dans docker-compose.yml
ports:
  - "8001:8000"  # Utiliser 8001 au lieu de 8000
```

### Hot reload ne fonctionne pas

Le hot reload est activé grâce au volume monté :
```yaml
volumes:
  - ./app:/app/app
```

Si ça ne fonctionne pas, redémarrez :
```bash
docker-compose restart backend
```

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
# CPU, mémoire, réseau
docker stats

# Spécifique au backend
docker stats olympiades-backend
```

### Nettoyer les ressources inutilisées

```bash
# Supprimer les images inutilisées
docker image prune

# Nettoyer tout
docker system prune -a
```

## 🚀 Déploiement

Pour déployer en production, considérez :

1. **Docker Swarm** ou **Kubernetes** pour l'orchestration
2. **Nginx** ou **Traefik** comme reverse proxy
3. **Let's Encrypt** pour HTTPS
4. **Sentry** pour le monitoring d'erreurs
5. **Prometheus + Grafana** pour les métriques

## 📞 Support

Pour toute question, consultez la documentation Docker officielle ou contactez l'équipe technique.

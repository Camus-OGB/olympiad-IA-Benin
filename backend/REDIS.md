# 🚀 Guide Redis - Olympiades IA Bénin

Guide rapide pour configurer et utiliser Redis pour le cache de l'API.

---

## 📖 Table des matières

1. [Pourquoi Redis ?](#pourquoi-redis)
2. [Configuration Locale](#configuration-locale)
3. [Configuration Production](#configuration-production)
4. [Test et Validation](#test-et-validation)
5. [Monitoring](#monitoring)
6. [Dépannage](#dépannage)

---

## 🎯 Pourquoi Redis ?

### Bénéfices de performance

| Métrique | Sans Redis | Avec Redis | Amélioration |
|----------|-----------|------------|--------------|
| Temps de réponse `/vitrine` | 200-500ms | 50-100ms | **4-5x plus rapide** |
| Charge DB | 100% | 10-20% | **80-90% réduit** |
| Requêtes/seconde | 50-100 | 500-1000 | **10x plus rapide** |

### Ce qui est mis en cache

- ✅ **Vitrines** : `/api/v1/content/vitrine` (TTL: 5 minutes)
- ✅ **Statistiques** : Compteurs d'inscriptions, candidats
- ✅ **Données publiques** : Actualités, ressources

### Ce qui n'est PAS mis en cache

- ❌ Données personnelles des utilisateurs
- ❌ Informations d'authentification
- ❌ Données en temps réel critiques

---

## 🏠 Configuration Locale

### Option 1 : Docker Compose (Recommandé)

Le plus simple pour démarrer :

```bash
cd backend

# Démarrer tous les services (backend + PostgreSQL + Redis)
docker-compose up -d

# Vérifier que Redis fonctionne
docker-compose ps redis
docker-compose logs redis
```

Redis sera disponible sur `redis://localhost:6379/0`.

### Option 2 : Docker seul

```bash
# Démarrer Redis
docker run -d \
  --name olympiades-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine redis-server --appendonly yes

# Vérifier
docker logs olympiades-redis
docker exec olympiades-redis redis-cli ping
# Réponse attendue: PONG
```

### Option 3 : Installation native

**Ubuntu/Debian :**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**macOS :**
```bash
brew install redis
brew services start redis
```

**Windows :**
- Utiliser Docker Desktop (recommandé)
- Ou télécharger depuis [Redis Windows](https://github.com/microsoftarchive/redis/releases)

### Configuration `.env` local

```bash
# Dans backend/.env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379/0
```

---

## ☁️ Configuration Production

### Render Redis (Recommandé pour simplicité)

1. **Créer l'instance Redis**
   ```
   Render Dashboard → New → Redis
   - Name: olympiades-redis
   - Plan: Starter ($7/mois) ou Pro ($15/mois)
   - Region: Même région que le backend
   ```

2. **Récupérer l'URL**
   ```
   Dashboard → Redis → Connect
   Internal Redis URL: redis://red-xxxxx:6379
   ```

3. **Configurer dans le backend**
   ```
   Render → Backend Service → Environment
   REDIS_ENABLED=true
   REDIS_URL=redis://red-xxxxxxxxxxxxx:6379
   ```

4. **Redéployer**
   - Git push → Auto-deploy
   - Ou : Dashboard → Manual Deploy → Deploy latest commit

### Upstash (Recommandé pour free tier)

**Avantages** : Free tier généreux, serverless, global edge

1. **Créer un compte** : [upstash.com](https://upstash.com)

2. **Créer une database**
   ```
   Console → Create Database
   - Name: olympiades-cache
   - Type: Regional (ou Global)
   - Region: us-east-1 (ou le plus proche)
   - TLS: Enabled
   ```

3. **Copier l'URL**
   ```
   Format: redis://default:password@region.upstash.io:6379
   ```

4. **Configurer dans Render**
   ```
   REDIS_ENABLED=true
   REDIS_URL=redis://default:xxx@us1-xxxxx.upstash.io:6379
   ```

**Free Tier Upstash** :
- 10,000 commandes/jour
- 256 MB stockage
- Parfait pour démarrer !

### Railway

1. **Créer l'instance**
   ```
   Railway → New Project → Deploy Redis
   ```

2. **Copier l'URL**
   ```
   Variables → REDIS_URL
   Format: redis://default:password@containers-us-west-xxx.railway.app:6379
   ```

3. **Ajouter à Render**

---

## ✅ Test et Validation

### Test rapide avec le script Python

```bash
cd backend

# Avec environnement virtuel
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Lancer le test
python test_redis.py
```

**Sortie attendue** :
```
🧪 Test de connexion Redis
============================================================

🔧 Configuration Redis:
   - REDIS_ENABLED: True
   - REDIS_URL: redis://localhost:6379/0

🔄 Connexion à Redis...
📡 Test de connexion (PING)...
✅ PONG reçu - Connexion établie!

📝 Test d'écriture (SET)...
✅ Clé 'test_key' créée

📖 Test de lecture (GET)...
✅ Valeur récupérée: Hello from Olympiades IA!

✅ ✅ ✅ Tous les tests Redis sont passés avec succès!
```

### Test avec l'API

```bash
# Premier appel (cache MISS - donnée depuis BDD)
curl -i https://votre-backend.onrender.com/api/v1/content/vitrine

# Header de réponse:
X-Cache: MISS
# Temps: ~300ms

# Deuxième appel (cache HIT - donnée depuis Redis)
curl -i https://votre-backend.onrender.com/api/v1/content/vitrine

# Header de réponse:
X-Cache: HIT
# Temps: ~50ms ⚡
```

### Test avec redis-cli

```bash
# Local
redis-cli ping

# Docker
docker exec olympiades-redis redis-cli ping

# Voir les clés en cache
redis-cli KEYS "*vitrine*"

# Voir une valeur
redis-cli GET "vitrine_cache"

# Statistiques
redis-cli INFO stats
```

---

## 📊 Monitoring

### Métriques importantes

**Sur Render** :
```
Dashboard → Redis → Metrics
- Connected clients
- Memory usage
- Operations per second
- Hit rate (cache efficiency)
```

**Sur Upstash** :
```
Console → Database → Metrics
- Daily requests
- Latency (p50, p99)
- Storage usage
```

### Commandes utiles

```bash
# Info complète
redis-cli INFO

# Mémoire utilisée
redis-cli INFO memory

# Statistiques de performance
redis-cli INFO stats

# Nombre de clés
redis-cli DBSIZE

# Voir toutes les clés
redis-cli KEYS "*"

# Monitoring en temps réel
redis-cli MONITOR
```

### Alertes recommandées

1. **Mémoire** : Alerte si > 80% utilisée
2. **Connexions** : Alerte si > 1000 clients connectés
3. **Hit Rate** : Alerte si < 70% (cache peu efficace)
4. **Latency** : Alerte si P99 > 100ms

---

## 🐛 Dépannage

### Erreur : Connection refused

**Symptôme** :
```
❌ Erreur de connexion: Error connecting to Redis
```

**Solutions** :

1. **Vérifier que Redis est démarré**
   ```bash
   # Docker
   docker-compose ps redis
   docker-compose up -d redis

   # Linux
   sudo systemctl status redis
   sudo systemctl start redis
   ```

2. **Vérifier l'URL dans `.env`**
   ```bash
   # Local
   REDIS_URL=redis://localhost:6379/0

   # Docker Compose
   REDIS_URL=redis://redis:6379/0

   # Production
   REDIS_URL=redis://red-xxxxx:6379
   ```

3. **Vérifier le firewall**
   ```bash
   # Autoriser le port 6379
   sudo ufw allow 6379
   ```

### Cache pas mis à jour

**Symptôme** : Les modifications ne sont pas visibles immédiatement

**Cause** : C'est normal ! Les données sont mises en cache pendant 5 minutes.

**Solutions** :

1. **Attendre l'expiration** (5 min)

2. **Forcer la suppression du cache** (admin uniquement)
   ```bash
   redis-cli DEL "vitrine_cache"
   ```

3. **Désactiver temporairement Redis**
   ```bash
   REDIS_ENABLED=false
   ```

### Performance dégradée

**Symptôme** : Redis est lent

**Solutions** :

1. **Vérifier la mémoire**
   ```bash
   redis-cli INFO memory
   # Si used_memory > maxmemory, augmenter la RAM
   ```

2. **Nettoyer les clés expirées**
   ```bash
   redis-cli FLUSHDB  # ⚠️ Supprime TOUTES les clés
   ```

3. **Upgrader le plan** (si provider managé)

### Redis prend trop de mémoire

**Solutions** :

1. **Configurer eviction policy**
   ```bash
   # Dans redis.conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

2. **Réduire les TTL**
   ```python
   # Dans le code
   CACHE_TTL = 60  # 1 minute au lieu de 5
   ```

---

## 🔒 Sécurité en Production

### Bonnes pratiques

1. **Utiliser TLS/SSL**
   ```bash
   REDIS_URL=rediss://...  # 's' pour SSL
   ```

2. **Définir un mot de passe**
   ```bash
   # redis.conf
   requirepass votre_mot_de_passe_fort
   ```

3. **Limiter les connexions**
   ```bash
   # redis.conf
   maxclients 1000
   ```

4. **Ne pas exposer le port publiquement**
   - Utiliser un réseau privé (VPC)
   - Ou un firewall strict

5. **Sauvegardes régulières**
   - AOF activé (docker-compose inclus)
   - Snapshots RDB quotidiens

---

## 📚 Ressources

- [Documentation Redis officielle](https://redis.io/docs/)
- [Redis Python Client](https://redis-py.readthedocs.io/)
- [Upstash](https://upstash.com)
- [Render Redis](https://render.com/docs/redis)

---

## 📞 Support

Pour toute question sur Redis :
- Vérifier les logs : `docker-compose logs redis`
- Consulter [DEPLOYMENT.md](../DEPLOYMENT.md)
- Email : contact@olympiades-ia.bj

---

**Dernière mise à jour** : 16 février 2026
**Version** : 1.0.0

# 🗂️ Configuration Supabase Storage - Guide Complet

Guide détaillé pour configurer le stockage de fichiers avec Supabase pour la plateforme Olympiades IA Bénin.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Création des buckets](#création-des-buckets)
- [Configuration des restrictions](#configuration-des-restrictions)
- [Politiques de sécurité](#politiques-de-sécurité)
- [Configuration backend](#configuration-backend)
- [Tests](#tests)
- [Dépannage](#dépannage)

## 🎯 Prérequis

- Un compte Supabase (gratuit sur https://supabase.com)
- Un projet Supabase créé
- Accès au dashboard Supabase

## 📦 Création des buckets

### Option 1 : Via l'interface Supabase (Recommandé pour débutants)

1. **Accédez à votre projet**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Naviguez vers Storage**
   - Dans le menu de gauche : **Storage**

3. **Créez le bucket principal**
   - Cliquez sur **New bucket**
   - Remplissez le formulaire :

   ```
   Name: olympiades-documents
   Public bucket: ✅ Coché
   File size limit: 52428800 (50 MB)
   Allowed MIME types: (laisser vide pour l'instant)
   ```

   - Cliquez sur **Create bucket**

4. **Créez les dossiers (folders)**

   Dans le bucket `olympiades-documents`, créez ces dossiers :
   - `photos/` - Photos d'identité
   - `bulletins/` - Bulletins scolaires
   - `documents/` - Autres documents
   - `news/` - Images des actualités (optionnel)

### Option 2 : Via SQL (Avancé - avec restrictions)

Allez dans **SQL Editor** et exécutez :

```sql
-- ====================
-- BUCKET: olympiades-photos
-- ====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-photos',
  'olympiades-photos',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
);

-- ====================
-- BUCKET: olympiades-bulletins
-- ====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-bulletins',
  'olympiades-bulletins',
  true,
  10485760,  -- 10 MB
  ARRAY['application/pdf']
);

-- ====================
-- BUCKET: olympiades-documents (général)
-- ====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-documents',
  'olympiades-documents',
  true,
  52428800,  -- 50 MB
  NULL  -- Tous types autorisés
);
```

## 🔧 Configuration des restrictions

### Restrictions par type de fichier

| Type de fichier | Taille max | Formats autorisés | Nombre max |
|----------------|------------|-------------------|------------|
| **Photo d'identité** | 5 MB | JPEG, PNG | 1 par candidat |
| **Bulletin scolaire** | 10 MB | PDF | 3 par candidat |
| **Autres documents** | 50 MB | Tous | 5 par candidat |

### Modifier les restrictions d'un bucket existant

**Via l'interface** :
1. Storage → Sélectionnez le bucket
2. Cliquez sur l'icône ⚙️ (Settings)
3. Modifiez :
   - **File size limit** : `5242880` (5 MB) ou `10485760` (10 MB)
   - **Allowed MIME types** :
     ```
     image/jpeg
     image/png
     application/pdf
     ```

**Via SQL** :
```sql
-- Modifier la taille max
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'olympiades-photos';

-- Modifier les types MIME autorisés
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png']
WHERE id = 'olympiades-photos';
```

## 🔒 Politiques de sécurité

### Stratégie 1 : Bucket unique avec restrictions dans le code

Si vous utilisez un seul bucket `olympiades-documents`, configurez ces politiques :

```sql
-- ====================
-- POLITIQUES POUR: olympiades-documents
-- ====================

-- 1. Lecture publique (tout le monde peut voir)
CREATE POLICY "Public can view all files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-documents');

-- 2. Les utilisateurs authentifiés peuvent uploader dans leur dossier
CREATE POLICY "Authenticated users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'olympiades-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Les utilisateurs peuvent mettre à jour leurs fichiers
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'olympiades-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Les utilisateurs peuvent supprimer leurs fichiers
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Les admins peuvent tout supprimer
CREATE POLICY "Admins can delete any file"
ON storage.objects FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);
```

### Stratégie 2 : Buckets séparés avec restrictions SQL

Si vous utilisez des buckets séparés (`olympiades-photos`, `olympiades-bulletins`) :

```sql
-- ====================
-- POLITIQUES PHOTOS
-- ====================

-- Lecture publique
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-photos');

-- Upload limité (1 photo par user)
CREATE POLICY "Users can upload one photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'olympiades-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  (storage.extension(name)) IN ('jpg', 'jpeg', 'png') AND
  -- Vérifier qu'il n'y a pas déjà une photo
  NOT EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = 'olympiades-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Mise à jour autorisée (remplacer la photo)
CREATE POLICY "Users can update own photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'olympiades-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression autorisée
CREATE POLICY "Users can delete own photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ====================
-- POLITIQUES BULLETINS
-- ====================

-- Lecture publique
CREATE POLICY "Public can view bulletins"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-bulletins');

-- Upload limité (max 3 bulletins)
CREATE POLICY "Users can upload max 3 bulletins"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'olympiades-bulletins' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  (storage.extension(name)) = 'pdf' AND
  -- Limiter à 3 fichiers
  (
    SELECT COUNT(*)
    FROM storage.objects
    WHERE bucket_id = 'olympiades-bulletins'
    AND (storage.foldername(name))[1] = auth.uid()::text
  ) < 3
);

-- Suppression autorisée
CREATE POLICY "Users can delete own bulletins"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-bulletins' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 🎨 Configuration Backend

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# Supabase Storage
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre-anon-key
SUPABASE_BUCKET=olympiades-documents

# Ou si vous utilisez des buckets séparés :
SUPABASE_BUCKET_PHOTOS=olympiades-photos
SUPABASE_BUCKET_BULLETINS=olympiades-bulletins
SUPABASE_BUCKET_DOCUMENTS=olympiades-documents
```

**Pour obtenir vos credentials** :
1. Dashboard Supabase → **Settings** → **API**
2. Copiez :
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_KEY`

⚠️ **N'utilisez JAMAIS la `service_role` key dans le frontend !**

### 2. Restrictions dans le code

Le backend implémente déjà les restrictions via [upload_config.py](app/core/upload_config.py) :

```python
# Tailles maximales
MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_BULLETIN_SIZE = 10 * 1024 * 1024  # 10 MB

# Types MIME autorisés
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"]
ALLOWED_DOCUMENT_TYPES = ["application/pdf"]

# Nombres maximum
MAX_BULLETINS_PER_CANDIDATE = 3
```

Les endpoints valident automatiquement :
- ✅ Type MIME du fichier
- ✅ Taille du fichier
- ✅ Nombre de fichiers uploadés
- ✅ Extension du fichier

## 📂 Structure des fichiers

Les fichiers sont organisés ainsi :

```
olympiades-documents/
├── {user_id}/
│   ├── photos/
│   │   └── photo-{uuid}.jpg
│   ├── bulletins/
│   │   ├── bulletin-1-{uuid}.pdf
│   │   ├── bulletin-2-{uuid}.pdf
│   │   └── bulletin-3-{uuid}.pdf
│   └── documents/
│       └── document-{uuid}.pdf
```

**Ou avec buckets séparés** :

```
olympiades-photos/
└── {user_id}/
    └── photo-{uuid}.jpg

olympiades-bulletins/
└── {user_id}/
    ├── bulletin-1-{uuid}.pdf
    ├── bulletin-2-{uuid}.pdf
    └── bulletin-3-{uuid}.pdf
```

## 🧪 Tests

### 1. Tester l'upload via l'interface Supabase

1. Storage → `olympiades-documents`
2. Créez un dossier : `test-user-id/photos/`
3. Uploadez une image
4. Vérifiez l'URL publique :
   ```
   https://votre-projet.supabase.co/storage/v1/object/public/olympiades-documents/test-user-id/photos/test.jpg
   ```

### 2. Tester via l'API backend

```bash
# Démarrer le backend
docker-compose up -d

# Ouvrir Swagger
http://localhost:8000/docs

# Tester l'upload :
1. POST /api/v1/auth/register - Créer un compte
2. POST /api/v1/auth/verify-otp - Vérifier l'OTP
3. POST /api/v1/auth/login - Se connecter
4. POST /api/v1/candidates/me/photo - Uploader une photo
```

### 3. Tester les restrictions

**Test 1 : Fichier trop gros**
- Essayez d'uploader une image > 5 MB
- ✅ Devrait retourner erreur 413 "Fichier trop volumineux"

**Test 2 : Mauvais format**
- Essayez d'uploader un .txt comme photo
- ✅ Devrait retourner erreur 400 "Format non supporté"

**Test 3 : Trop de bulletins**
- Uploadez 3 bulletins, puis essayez un 4ème
- ✅ Devrait retourner erreur 400 "Maximum 3 bulletins"

## 🐛 Dépannage

### Erreur : "Bucket not found"

**Cause** : Le bucket n'existe pas ou le nom est incorrect

**Solution** :
```bash
# Vérifiez dans .env
SUPABASE_BUCKET=olympiades-documents

# Vérifiez dans Supabase Dashboard → Storage
```

### Erreur : "Insufficient permissions"

**Cause** : Les politiques RLS ne sont pas configurées

**Solution** :
```sql
-- Vérifier les politiques existantes
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Désactiver temporairement RLS pour tester (DEV ONLY!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Réactiver et créer les bonnes politiques
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Puis créer les politiques (voir section Politiques de sécurité)
```

### Erreur : "File size exceeds limit"

**Cause** : Le bucket a une limite de taille trop basse

**Solution** :
```sql
-- Augmenter la limite
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50 MB
WHERE id = 'olympiades-documents';
```

### Erreur : "MIME type not allowed"

**Cause** : Le bucket n'autorise pas ce type de fichier

**Solution** :
```sql
-- Autoriser tous les types
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'olympiades-documents';

-- Ou autoriser des types spécifiques
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf']
WHERE id = 'olympiades-documents';
```

### URLs non accessibles (404)

**Cause** : Le bucket n'est pas public

**Solution** :
```sql
-- Rendre le bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'olympiades-documents';
```

## 🔐 Sécurité en production

### ⚠️ Important pour la production

1. **N'exposez JAMAIS la `service_role` key**
   - Utilisez uniquement `anon/public` key côté client
   - La `service_role` est réservée au backend serveur

2. **Activez toujours RLS (Row Level Security)**
   ```sql
   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
   ```

3. **Limitez les permissions au strict nécessaire**
   - Les utilisateurs ne peuvent uploader que dans leur dossier
   - Seuls les admins peuvent supprimer les fichiers des autres

4. **Validez TOUJOURS côté backend**
   - Ne faites pas confiance au frontend pour les validations
   - Le backend re-vérifie type MIME, taille, nombre

5. **Utilisez des noms de fichiers uniques**
   - UUID pour éviter les collisions
   - Empêche l'écrasement de fichiers

6. **Surveillez l'utilisation du stockage**
   - Supabase gratuit : 1 GB
   - Plan Pro : 100 GB
   - Mettez des alertes de quotas

## 📊 Quotas Supabase

| Plan | Stockage | Bande passante | Limite upload |
|------|----------|----------------|---------------|
| **Free** | 1 GB | 2 GB/mois | 50 MB/fichier |
| **Pro** | 100 GB | 200 GB/mois | 5 GB/fichier |
| **Enterprise** | Illimité | Illimité | Personnalisé |

## 📞 Support

- **Documentation Supabase Storage** : https://supabase.com/docs/guides/storage
- **Discord Supabase** : https://discord.supabase.com
- **Backend documentation** : [README.md](README.md)

---

**Configuration créée pour les Olympiades d'Intelligence Artificielle du Bénin 2026** 🇧🇯

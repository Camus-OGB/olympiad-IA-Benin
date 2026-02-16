-- ============================================
-- Configuration Supabase Storage
-- Buckets séparés pour Olympiades IA Bénin
-- ============================================

-- IMPORTANT: Exécutez ce script dans Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Collez ce code → Run

-- ============================================
-- ÉTAPE 1: CRÉER LES BUCKETS
-- ============================================

-- Bucket pour les photos d'identité
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-photos',
  'olympiades-photos',
  true,  -- Public (lecture)
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les bulletins scolaires
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-bulletins',
  'olympiades-bulletins',
  true,  -- Public (lecture)
  10485760,  -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les documents généraux
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-documents',
  'olympiades-documents',
  true,  -- Public (lecture)
  52428800,  -- 50 MB
  NULL  -- Tous types autorisés
)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les images des actualités
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-news',
  'olympiades-news',
  true,  -- Public (lecture)
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les ressources pédagogiques (PDF, documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'olympiades-resources',
  'olympiades-resources',
  true,  -- Public (lecture)
  52428800,  -- 50 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.oasis.opendocument.text'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ÉTAPE 2: POLITIQUES POUR OLYMPIADES-PHOTOS
-- ============================================

-- Lecture publique
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-photos');

-- Upload: Une seule photo par utilisateur
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

-- Mise à jour: Remplacer sa photo
CREATE POLICY "Users can update own photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'olympiades-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression: Supprimer sa photo
CREATE POLICY "Users can delete own photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- ÉTAPE 3: POLITIQUES POUR OLYMPIADES-BULLETINS
-- ============================================

-- Lecture publique
CREATE POLICY "Public can view bulletins"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-bulletins');

-- Upload: Maximum 3 bulletins par utilisateur
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

-- Mise à jour: Modifier ses bulletins
CREATE POLICY "Users can update own bulletins"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'olympiades-bulletins' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression: Supprimer ses bulletins
CREATE POLICY "Users can delete own bulletins"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-bulletins' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- ÉTAPE 4: POLITIQUES POUR OLYMPIADES-DOCUMENTS
-- ============================================

-- Lecture publique
CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-documents');

-- Upload: Utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'olympiades-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Mise à jour
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'olympiades-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- ÉTAPE 5: POLITIQUES POUR OLYMPIADES-NEWS
-- ============================================

-- Lecture publique
CREATE POLICY "Public can view news images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-news');

-- Upload: Seuls les admins (via backend service_role)
-- Pas de politique INSERT pour authenticated (géré par le backend)

-- Suppression: Seuls les admins
CREATE POLICY "Admins can delete news images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-news' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- ============================================
-- ÉTAPE 6: POLITIQUES POUR OLYMPIADES-RESOURCES
-- ============================================

-- Lecture publique (tous les candidats peuvent consulter les ressources)
CREATE POLICY "Public can view resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'olympiades-resources');

-- Upload: Seuls les admins peuvent uploader des ressources
CREATE POLICY "Admins can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'olympiades-resources' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- Mise à jour: Seuls les admins
CREATE POLICY "Admins can update resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'olympiades-resources' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- Suppression: Seuls les admins
CREATE POLICY "Admins can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-resources' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- ============================================
-- ÉTAPE 7: POLITIQUES ADMIN GLOBALES
-- ============================================

-- Les admins peuvent supprimer n'importe quel fichier
CREATE POLICY "Admins can delete any photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-photos' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can delete any bulletin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-bulletins' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can delete any document"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'olympiades-documents' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier les buckets créés
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id LIKE 'olympiades-%'
ORDER BY id;

-- Vérifier les politiques créées
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%olympiades%'
ORDER BY policyname;

-- ============================================
-- RÉSUMÉ
-- ============================================

-- ✅ 5 buckets créés :
--    - olympiades-photos (5MB, images)
--    - olympiades-bulletins (10MB, PDF)
--    - olympiades-documents (50MB, tous types)
--    - olympiades-news (10MB, images)
--    - olympiades-resources (50MB, PDF et documents)

-- ✅ Politiques configurées :
--    - Lecture publique pour tous les buckets
--    - Upload limité (1 photo, 3 bulletins)
--    - Utilisateurs peuvent gérer leurs fichiers
--    - Admins peuvent gérer les ressources et actualités
--    - Admins peuvent tout supprimer

-- 🔐 Sécurité :
--    - Row Level Security activé
--    - Validation des types MIME
--    - Limites de taille par bucket
--    - Organisation par user_id (sauf resources/news)

-- 📝 Prochaines étapes :
--    1. Copiez vos credentials Supabase dans .env
--    2. Testez les uploads via l'API backend
--    3. Vérifiez les URLs publiques

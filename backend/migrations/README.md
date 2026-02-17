# Migrations de la base de données

Ce dossier contient les scripts de migration SQL pour la base de données.

## Comment appliquer une migration

### Via psql (ligne de commande)

```bash
# Se connecter à votre base de données
psql -U votre_utilisateur -d nom_de_la_base

# Exécuter le script de migration
\i /chemin/vers/update_testimonials_schema.sql
```

### Via Supabase Dashboard

1. Allez dans votre projet Supabase
2. Naviguez vers **SQL Editor**
3. Copiez-collez le contenu du fichier de migration
4. Cliquez sur **Run**

### Via script Python

```bash
cd backend
python -c "
from app.db.database import engine
with open('migrations/update_testimonials_schema.sql', 'r') as f:
    sql = f.read()
    with engine.connect() as conn:
        conn.execute(sql)
        conn.commit()
"
```

## Migrations disponibles

### 1. `create_general_testimonials_table.sql`
**Date:** 2026-02-16
**Description:** Création de la table `general_testimonials` pour les témoignages généraux (mentors, parents, sponsors, partenaires).

**Changements:**
- Crée la table `general_testimonials` avec les colonnes :
  - `author_name`, `author_role`, `author_type`, `content`
  - `photo_url`, `video_url`, `organization`
  - `display_order`, `is_published`
  - `created_at`, `updated_at`
- Crée les index pour optimiser les performances

**Ordre d'exécution:** À exécuter EN PREMIER

---

### 2. `update_testimonials_schema.sql`
**Date:** 2026-02-16
**Description:** Mise à jour du schéma de la table `testimonials` pour correspondre au contexte d'éditions passées (témoignages d'élèves participants).

**Changements:**
- Renomme `author_name` → `student_name`
- Renomme `author_role` → `role`
- Renomme `content` → `quote`
- Renomme `photo_url` → `image_url`
- Ajoute la colonne `school` (établissement scolaire)
- Supprime la colonne `video_url` (non utilisée)

**Rollback:** `rollback_testimonials_schema.sql`
**Ordre d'exécution:** À exécuter EN SECOND (après create_general_testimonials_table.sql)

## Important

⚠️ **Sauvegardez toujours votre base de données avant d'appliquer une migration !**

```bash
# Exemple de backup avec pg_dump
pg_dump -U votre_utilisateur nom_de_la_base > backup_$(date +%Y%m%d_%H%M%S).sql
```

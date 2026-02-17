# Architecture Duale des Témoignages - Documentation

## 📋 Vue d'ensemble

L'application utilise maintenant **2 types de témoignages distincts** :

### 1. **Témoignages de Participants** (Éditions Passées)
- **Table** : `testimonials`
- **Gestion** : `/admin/contenu/bilans/[slug]/equipe`
- **Champs** : `student_name`, `school`, `role`, `quote`, `image_url`
- **Usage** : Page de bilan de chaque édition
- **Limite** : 4 témoignages par édition (les finalistes)

### 2. **Témoignages Généraux**
- **Table** : `general_testimonials`
- **Gestion** : `/admin/contenu/temoignages`
- **Champs** : `author_name`, `author_role`, `author_type`, `content`, `photo_url`, `video_url`, `organization`
- **Usage** : Page d'accueil du site
- **Types** : Mentors, Parents, Sponsors, Partenaires, Anciens participants

---

## ✅ Ce qui a été implémenté

### Backend

1. **Modèles créés** ✅
   - `backend/app/models/general_testimonial.py` - Nouveau modèle
   - `backend/app/models/content.py` - Modèle `Testimonial` mis à jour
   - Import dans `backend/app/db/__init__.py`

2. **Schémas Pydantic** ✅
   - `GeneralTestimonialCreate`, `GeneralTestimonialUpdate`, `GeneralTestimonialResponse`
   - `TestimonialCreate`, `TestimonialUpdate`, `TestimonialResponse` (mis à jour)

3. **Endpoints API** ✅
   - `GET /content/general-testimonials` - Liste des témoignages généraux
   - `POST /content/general-testimonials` - Création
   - `PUT /content/general-testimonials/{id}` - Mise à jour
   - `DELETE /content/general-testimonials/{id}` - Suppression

   - `POST /content/past-editions/{id}/testimonials` - Création témoignage participant
   - `PUT /content/past-editions/{id}/testimonials/{tid}` - Mise à jour
   - `DELETE /content/past-editions/{id}/testimonials/{tid}` - Suppression

### Frontend

1. **Interfaces TypeScript** ✅
   - `GeneralTestimonial` - Interface pour témoignages généraux
   - `Testimonial` - Interface pour témoignages de participants (mis à jour)

2. **API Client** ✅
   - `getGeneralTestimonials()` - Récupérer témoignages généraux
   - `createGeneralTestimonial()` - Créer
   - `updateGeneralTestimonial()` - Mettre à jour
   - `deleteGeneralTestimonial()` - Supprimer
   - `getAllTestimonials()` - Récupérer pour page d'accueil (modifié)

3. **Pages Admin** ✅
   - `/admin/contenu/temoignages/page.tsx` - Gestion témoignages généraux (refait)
   - `/admin/contenu/bilans/[slug]/equipe/page.tsx` - Gestion participants (connecté)
   - Menu "Témoignages" réactivé dans l'admin

4. **Page d'accueil** ✅
   - Mise à jour pour afficher les témoignages généraux
   - Utilisation des bons noms de champs (`authorName`, `content`, `photoUrl`, etc.)

### Migrations SQL

1. **`create_general_testimonials_table.sql`** ✅
   - Crée la table `general_testimonials`
   - Index pour performances

2. **`update_testimonials_schema.sql`** ✅
   - Renomme les colonnes de `testimonials` pour les participants
   - `author_name` → `student_name`
   - `content` → `quote`
   - `photo_url` → `image_url`
   - Ajoute `school`

3. **`rollback_testimonials_schema.sql`** ✅
   - Script de rollback en cas de problème

---

## 🔄 Actions à effectuer (Base de données)

### Étape 1 : Appliquer les migrations SQL

**IMPORTANT : Sauvegardez d'abord votre base de données !**

```bash
# Via Supabase Dashboard (RECOMMANDÉ)
1. Allez dans votre projet Supabase
2. Ouvrez SQL Editor
3. Copiez-collez le contenu de `create_general_testimonials_table.sql`
4. Cliquez sur Run
5. Puis copiez-collez le contenu de `update_testimonials_schema.sql`
6. Cliquez sur Run
```

**OU via psql :**

```bash
psql -U votre_utilisateur -d nom_de_la_base -f backend/migrations/create_general_testimonials_table.sql
psql -U votre_utilisateur -d nom_de_la_base -f backend/migrations/update_testimonials_schema.sql
```

### Étape 2 : Vérifier que tout fonctionne

1. **Tester le backend**
   ```bash
   cd backend
   # Relancer le serveur si nécessaire
   ```

2. **Tester le frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Vérifier l'admin**
   - Allez sur `/admin/contenu/temoignages`
   - Créez un témoignage général
   - Vérifiez qu'il apparaît sur la page d'accueil

4. **Vérifier les bilans**
   - Allez sur `/admin/contenu/bilans`
   - Choisissez une édition
   - Cliquez sur "Témoignages"
   - Ajoutez un témoignage de participant

---

## 📊 Structure des tables

### `general_testimonials`
```sql
id                VARCHAR PRIMARY KEY
author_name       VARCHAR NOT NULL
author_role       VARCHAR
author_type       VARCHAR  -- "mentor", "parent", "sponsor", "partner"
content           TEXT NOT NULL
photo_url         VARCHAR
video_url         VARCHAR
organization      VARCHAR
display_order     INTEGER DEFAULT 0
is_published      BOOLEAN NOT NULL DEFAULT TRUE
created_at        TIMESTAMP WITH TIME ZONE
updated_at        TIMESTAMP WITH TIME ZONE
```

### `testimonials` (Participants)
```sql
id                VARCHAR PRIMARY KEY
past_edition_id   VARCHAR NOT NULL (FK)
student_name      VARCHAR NOT NULL
school            VARCHAR
role              VARCHAR
quote             TEXT NOT NULL
image_url         VARCHAR
```

---

## 🎯 Utilisation

### Pour les administrateurs

1. **Témoignages généraux** (Page d'accueil)
   - Menu : Admin → Contenu & CMS → Témoignages
   - Types disponibles : Mentor, Parent, Sponsor, Partenaire, Ancien participant
   - Possibilité d'ajouter une vidéo
   - Statut publié/brouillon

2. **Témoignages de participants** (Bilans)
   - Menu : Admin → Contenu & CMS → Bilans (Archives)
   - Sélectionner une édition → Témoignages
   - Maximum 4 participants par édition
   - Champs adaptés aux étudiants (école, rôle)

---

## 🔍 Différences clés

| Caractéristique | Témoignages Généraux | Témoignages Participants |
|----------------|---------------------|-------------------------|
| **Affichage** | Page d'accueil | Page bilan d'édition |
| **Auteurs** | Mentors, parents, sponsors | Finalistes d'une édition |
| **Nombre** | Illimité | 4 par édition |
| **Vidéo** | ✅ Oui | ❌ Non |
| **Organisation** | ✅ Oui | ❌ Non (école à la place) |
| **Publication** | Toggle publié/brouillon | Toujours visible sur le bilan |

---

## 🐛 Troubleshooting

**Erreur : "Table general_testimonials does not exist"**
→ Appliquez la migration `create_general_testimonials_table.sql`

**Erreur : "Column student_name does not exist"**
→ Appliquez la migration `update_testimonials_schema.sql`

**Les témoignages n'apparaissent pas sur la page d'accueil**
→ Vérifiez que le statut `is_published` est à `true`

**Erreur 500 lors de la création d'un témoignage**
→ Vérifiez que toutes les migrations ont été appliquées correctement

---

## 📝 Notes importantes

- Les 2 types de témoignages sont **complètement indépendants**
- Les données existantes ne sont **pas perdues** (si migration correctement appliquée)
- Le rollback est possible avec `rollback_testimonials_schema.sql`
- Pensez à **sauvegarder** avant d'appliquer les migrations

---

## ✨ Améliorations futures possibles

- [ ] Système de filtrage par type sur la page d'accueil
- [ ] Intégration vidéo directe (player YouTube/Vimeo)
- [ ] Galerie de tous les témoignages
- [ ] Export PDF des témoignages
- [ ] Statistiques d'impact (nombre de vues, etc.)

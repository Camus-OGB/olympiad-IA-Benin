# 🎯 QCM Flexible - Migration et Utilisation

## 📋 Résumé des améliorations

### Avant (limité)
- ❌ **4 réponses obligatoires** par question
- ❌ **1 seule bonne réponse** possible
- ❌ Catégories en texte libre (pas de gestion centralisée)

### Après (flexible) ✨
- ✅ **2 à 6 réponses** par question (configurable)
- ✅ **Réponses simples OU multiples**
- ✅ **Catégories gérées** avec couleurs, icônes, statistiques

---

## 🗂️ Structure des Catégories

### Table `qcm_categories`

```sql
CREATE TABLE qcm_categories (
    id VARCHAR PRIMARY KEY,
    name VARCHAR(100) UNIQUE,          -- Ex: "Mathématiques"
    slug VARCHAR(100) UNIQUE,          -- Ex: "mathematiques"
    description TEXT,
    color VARCHAR(7),                  -- Ex: "#3B82F6"
    icon VARCHAR(50),                  -- Ex: "Calculator" (Lucide icon)
    display_order INTEGER,
    is_active BOOLEAN
);
```

### Catégories par défaut

| Nom | Couleur | Icône |
|-----|---------|-------|
| Mathématiques | 🔵 #3B82F6 | Calculator |
| Intelligence Artificielle | 🟢 #10B981 | Brain |
| Programmation Python | 🟡 #F59E0B | Code |
| Logique et Raisonnement | 🟣 #8B5CF6 | Lightbulb |
| Culture Générale IA | 🩷 #EC4899 | BookOpen |

---

## 📝 Format des Questions

### Ancien format (4 réponses fixes)

```json
{
  "question": "Quelle est la capitale du Bénin ?",
  "options": ["Cotonou", "Porto-Novo", "Parakou", "Abomey"],
  "correct_answer": 1
}
```

### Nouveau format (2-6 réponses, flexible)

#### Question simple (1 bonne réponse)

```json
{
  "question": "Quelle est la capitale du Bénin ?",
  "options": [
    {"text": "Cotonou", "id": 0},
    {"text": "Porto-Novo", "id": 1}
  ],
  "correct_answers": [1],
  "is_multiple_answer": false,
  "category_id": "uuid-de-la-categorie",
  "difficulty": "easy",
  "points": 1
}
```

#### Question à choix multiples (plusieurs bonnes réponses)

```json
{
  "question": "Quels sont des frameworks Python pour le ML ?",
  "options": [
    {"text": "TensorFlow", "id": 0},
    {"text": "PyTorch", "id": 1},
    {"text": "Express.js", "id": 2},
    {"text": "Scikit-learn", "id": 3},
    {"text": "React", "id": 4}
  ],
  "correct_answers": [0, 1, 3],
  "is_multiple_answer": true,
  "category_id": "uuid-de-la-categorie",
  "difficulty": "medium",
  "points": 2
}
```

---

## 🔌 Endpoints API

### Catégories

```http
GET    /api/v1/qcm-categories           # Liste toutes les catégories
GET    /api/v1/qcm-categories/{id}      # Détails d'une catégorie
POST   /api/v1/qcm-categories           # Créer une catégorie (admin)
PUT    /api/v1/qcm-categories/{id}      # Modifier une catégorie (admin)
DELETE /api/v1/qcm-categories/{id}      # Supprimer une catégorie (admin)
```

### Questions (mises à jour pour supporter le nouveau format)

```http
POST /api/v1/qcm/questions
Content-Type: application/json

{
  "question": "Qu'est-ce que le Machine Learning ?",
  "options": [
    {"text": "Un type de base de données", "id": 0},
    {"text": "Une méthode d'apprentissage automatique", "id": 1},
    {"text": "Un langage de programmation", "id": 2}
  ],
  "correct_answers": [1],
  "is_multiple_answer": false,
  "difficulty": "easy",
  "category_id": "uuid-ia",
  "points": 1
}
```

---

## 🚀 Migration

### Étape 1: Appliquer la migration SQL

```bash
# Sur votre base de données Supabase
psql -U postgres -h <supabase-host> -d postgres -f migrations/002_flexible_qcm_and_categories.sql
```

### Étape 2: Redémarrer le backend

```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
python -m uvicorn app.main:app --reload
```

### Étape 3: Vérifier dans Swagger

1. Ouvrez http://localhost:8000/docs
2. Allez dans la section **Catégories QCM**
3. Testez `GET /api/v1/qcm-categories` pour voir les catégories par défaut

---

## 🎨 Exemple Frontend

### Créer une question avec le nouveau format

```typescript
const questionData = {
  question: "Quels langages sont typés ?",
  options: [
    { text: "Python", id: 0 },
    { text: "TypeScript", id: 1 },
    { text: "JavaScript", id: 2 },
    { text: "Java", id: 3 }
  ],
  correct_answers: [1, 3],  // TypeScript et Java
  is_multiple_answer: true,
  difficulty: "medium",
  category_id: "uuid-programmation",
  points: 2,
  explanation: "TypeScript et Java sont fortement typés"
};

await qcmApi.createQuestion(questionData);
```

### Afficher les catégories avec leurs couleurs

```tsx
const categories = await qcmApi.getCategories();

return (
  <div className="grid grid-cols-2 gap-4">
    {categories.map(cat => (
      <div
        key={cat.id}
        className="p-4 rounded-lg border"
        style={{ borderColor: cat.color }}
      >
        <Icon name={cat.icon} />
        <h3>{cat.name}</h3>
        <p>{cat.questionCount} questions</p>
      </div>
    ))}
  </div>
);
```

---

## ✅ Avantages

1. **Flexibilité** : Adaptez le nombre de réponses selon la question
2. **Réponses multiples** : Posez des questions plus complexes
3. **Gestion centralisée** : Catégories cohérentes avec statistiques
4. **UI améliorée** : Couleurs et icônes pour une meilleure expérience
5. **Rétrocompatibilité** : Les anciennes questions continuent de fonctionner

---

## 🔄 Rétrocompatibilité

Les colonnes suivantes sont conservées temporairement :
- `qcm_questions.correct_answer` (deprecated)
- `qcm_questions.category` (deprecated)
- `qcm_answers.answer_given` (deprecated)

Elles seront supprimées dans une migration ultérieure après validation complète.

---

## 📚 Prochaines étapes

1. ✅ Appliquer la migration SQL
2. ✅ Tester les endpoints dans Swagger
3. 🔄 Mettre à jour le frontend pour utiliser les catégories
4. 🔄 Créer l'interface admin de gestion des catégories
5. 🔄 Migrer les questions existantes vers le nouveau format

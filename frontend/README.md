# Olympiades d'Intelligence Artificielle du Bénin 🇧🇯

Plateforme officielle pour la sélection nationale des candidats aux Olympiades d'IA (AOAI & IOAI).

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancer en développement
npm run dev

# Ouvrir http://localhost:3000
```

## 🏗️ Stack Technique

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel (recommandé)

## 📁 Structure du Projet

```
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Accueil
│   ├── layout.tsx         # Layout racine
│   ├── globals.css        # Styles globaux
│   │
│   ├── (pages publiques)
│   ├── (auth)             # Authentification
│   ├── candidat/          # Espace candidat
│   └── admin/             # Espace admin
│
├── components/            # Composants réutilisables
│   ├── Navbar.tsx
│   └── Footer.tsx
│
├── types/                 # Types TypeScript
│   └── index.ts
│
└── Configuration
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🎨 Identité Visuelle

**Couleurs principales:**
- Vert IOAI: `#00A896`
- Bleu IOAI: `#3366CC`
- Bleu foncé: `#2E4A8B`
- Jaune Bénin: `#FFB800`
- Rouge Bénin: `#E63946`

## 🌐 Routes Principales

### Pages Publiques
- `/` - Accueil
- `/bilan` - Historique 2025
- `/edition-2026` - Édition 2026
- `/a-propos` - À propos
- `/contact` - Contact
- `/blog` - Actualités

### Authentification
- `/connexion` - Connexion
- `/inscription` - Inscription

### Espace Candidat
- `/candidat/dashboard` - Tableau de bord
- `/candidat/qcm` - Examens
- `/candidat/resultats` - Résultats

### Espace Admin
- `/admin/dashboard` - Vue d'ensemble
- `/admin/candidats` - Gestion candidats
- `/admin/qcm` - Gestion QCM

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Développement (port 3000)
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Vérification du code
```

### Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

### Build manuel

```bash
npm run build
npm run start
```

## 🔐 Variables d'Environnement

Créez un fichier `.env.local` :

```env
# API URLs (à configurer)
NEXT_PUBLIC_API_URL=https://api.olympiades-ia.bj
```
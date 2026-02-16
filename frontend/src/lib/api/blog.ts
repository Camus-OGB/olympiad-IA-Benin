/**
 * Service de gestion des articles de blog et actualités
 * Utilise localStorage pour le stockage (peut être migré vers une base de données plus tard)
 */

export interface BlogArticle {
  id: string
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  content: string
  image?: string
  author?: string
  tags?: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'olympiades_blog_articles'

// Fonction helper pour générer un slug à partir du titre
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .trim()
}

// Fonction helper pour générer un ID unique
function generateId(): string {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Récupérer tous les articles
export function getArticles(): BlogArticle[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultArticles()

    return JSON.parse(stored)
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return getDefaultArticles()
  }
}

// Récupérer un article par son ID
export function getArticleById(id: string): BlogArticle | null {
  const articles = getArticles()
  return articles.find(article => article.id === id) || null
}

// Récupérer un article par son slug
export function getArticleBySlug(slug: string): BlogArticle | null {
  const articles = getArticles()
  return articles.find(article => article.slug === slug) || null
}

// Créer un nouvel article
export function createArticle(articleData: Omit<BlogArticle, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): BlogArticle {
  const articles = getArticles()

  const newArticle: BlogArticle = {
    ...articleData,
    id: generateId(),
    slug: generateSlug(articleData.title),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  articles.push(newArticle)
  saveArticles(articles)

  return newArticle
}

// Mettre à jour un article existant
export function updateArticle(id: string, articleData: Partial<BlogArticle>): BlogArticle | null {
  const articles = getArticles()
  const index = articles.findIndex(article => article.id === id)

  if (index === -1) return null

  const updatedArticle: BlogArticle = {
    ...articles[index],
    ...articleData,
    id: articles[index].id, // Assure que l'ID ne peut pas être modifié
    updatedAt: new Date().toISOString(),
  }

  // Mettre à jour le slug si le titre a changé
  if (articleData.title && articleData.title !== articles[index].title) {
    updatedArticle.slug = generateSlug(articleData.title)
  }

  articles[index] = updatedArticle
  saveArticles(articles)

  return updatedArticle
}

// Supprimer un article
export function deleteArticle(id: string): boolean {
  const articles = getArticles()
  const filteredArticles = articles.filter(article => article.id !== id)

  if (filteredArticles.length === articles.length) return false

  saveArticles(filteredArticles)
  return true
}

// Sauvegarder les articles dans localStorage
function saveArticles(articles: BlogArticle[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des articles:', error)
  }
}

// Récupérer uniquement les articles publiés
export function getPublishedArticles(): BlogArticle[] {
  return getArticles().filter(article => article.published)
}

// Filtrer les articles par catégorie
export function getArticlesByCategory(category: string): BlogArticle[] {
  return getArticles().filter(article =>
    article.category === category && article.published
  )
}

// Rechercher des articles
export function searchArticles(query: string): BlogArticle[] {
  const lowerQuery = query.toLowerCase()
  return getArticles().filter(article =>
    article.published && (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  )
}

// Articles par défaut (exemples)
function getDefaultArticles(): BlogArticle[] {
  return [
    {
      id: 'article_default_1',
      title: "Lancement des inscriptions pour l'AOAI 2026",
      slug: 'lancement-inscriptions-aoai-2026',
      date: '15 Jan 2026',
      category: 'Annonce',
      excerpt: "Les élèves béninois peuvent désormais s'inscrire pour la phase de présélection nationale.",
      content: `<h1>Lancement des inscriptions pour l'AOAI 2026</h1>
<p>Les inscriptions pour la présélection nationale de l'édition 2026 des Olympiades Africaines d'Intelligence Artificielle sont désormais ouvertes !</p>
<h2>Qui peut s'inscrire ?</h2>
<p>Tous les élèves béninois du secondaire passionnés par l'intelligence artificielle, les mathématiques et la programmation.</p>
<h2>Comment s'inscrire ?</h2>
<p>Rendez-vous sur la plateforme d'inscription et suivez les étapes indiquées. La présélection se déroulera en plusieurs phases.</p>
<p><strong>Bonne chance à tous les candidats !</strong></p>`,
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
      author: 'Équipe AOAI Bénin',
      published: true,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
      tags: ['inscription', '2026', 'annonce']
    },
    {
      id: 'article_default_2',
      title: "Retour sur l'exploit de Beijing",
      slug: 'retour-exploit-beijing',
      date: '10 Sept 2025',
      category: 'Résultats',
      excerpt: "Analyse de la performance de nos 4 champions lors de la première participation historique.",
      content: `<h1>Retour sur l'exploit de Beijing</h1>
<p>Notre première participation aux Olympiades Internationales d'Intelligence Artificielle à Beijing a été un <strong>succès retentissant</strong> !</p>
<h2>Les résultats</h2>
<ul>
  <li>4 finalistes représentant le Bénin</li>
  <li>1 Mention Honorable</li>
  <li>30ème place mondiale sur 87 pays participants</li>
</ul>
<h2>Un moment historique</h2>
<p>Cette première participation marque le début d'une belle aventure pour le Bénin dans le domaine de l'IA.</p>`,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
      author: 'Équipe AOAI Bénin',
      published: true,
      createdAt: '2025-09-10T14:00:00Z',
      updatedAt: '2025-09-10T14:00:00Z',
      tags: ['résultats', 'beijing', '2025']
    },
    {
      id: 'article_default_3',
      title: 'Partenariat renforcé avec Sèmè City',
      slug: 'partenariat-renforce-seme-city',
      date: '05 Jan 2026',
      category: 'Presse',
      excerpt: "Sèmè City confirme son engagement pour la formation des talents en IA.",
      content: `<h1>Partenariat renforcé avec Sèmè City</h1>
<p>Nous sommes fiers d'annoncer le renforcement de notre partenariat avec <strong>Sèmè City</strong> pour l'édition 2026.</p>
<h2>Un soutien stratégique</h2>
<p>Sèmè City met à disposition ses infrastructures et son expertise pour la formation de nos talents.</p>
<h2>Objectifs</h2>
<ul>
  <li>Former les candidats aux meilleures pratiques de l'IA</li>
  <li>Offrir un environnement propice à l'apprentissage</li>
  <li>Développer l'écosystème tech béninois</li>
</ul>`,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
      author: 'Relations Publiques',
      published: true,
      createdAt: '2026-01-05T09:00:00Z',
      updatedAt: '2026-01-05T09:00:00Z',
      tags: ['partenariat', 'seme-city', 'formation']
    },
    {
      id: 'article_default_4',
      title: 'Comment se préparer aux épreuves ?',
      slug: 'comment-se-preparer-epreuves',
      date: '20 Déc 2025',
      category: 'Formation',
      excerpt: "Conseils pour réussir les tests de logique et d'algèbre linéaire.",
      content: `<h1>Comment se préparer aux épreuves ?</h1>
<p>Voici quelques conseils pour bien préparer les épreuves de présélection.</p>
<h2>1. Maîtriser les fondamentaux</h2>
<ul>
  <li>Algèbre linéaire</li>
  <li>Probabilités et statistiques</li>
  <li>Logique et algorithmique</li>
</ul>
<h2>2. Pratiquer régulièrement</h2>
<p>La pratique est essentielle pour progresser en programmation et en résolution de problèmes.</p>
<h2>3. Travailler en groupe</h2>
<p>N'hésitez pas à échanger avec d'autres candidats pour partager vos connaissances.</p>`,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
      author: 'Équipe pédagogique',
      published: true,
      createdAt: '2025-12-20T08:00:00Z',
      updatedAt: '2025-12-20T08:00:00Z',
      tags: ['formation', 'conseils', 'preparation']
    },
    {
      id: 'article_default_5',
      title: "L'IA au Bénin : Enjeux et Opportunités",
      slug: 'ia-benin-enjeux-opportunites',
      date: '15 Nov 2025',
      category: 'Analyse',
      excerpt: "Pourquoi l'IA est crucial pour le développement du Bénin.",
      content: `<h1>L'IA au Bénin : Enjeux et Opportunités</h1>
<p>L'intelligence artificielle représente une <strong>opportunité majeure</strong> pour le développement du Bénin.</p>
<h2>Les enjeux</h2>
<ul>
  <li>Développement économique</li>
  <li>Innovation technologique</li>
  <li>Formation des jeunes talents</li>
</ul>
<h2>Les opportunités</h2>
<p>Le Bénin a tous les atouts pour devenir un acteur majeur de l'IA en Afrique de l'Ouest.</p>`,
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=800&auto=format&fit=crop',
      author: 'Dr. Expertise IA',
      published: true,
      createdAt: '2025-11-15T11:00:00Z',
      updatedAt: '2025-11-15T11:00:00Z',
      tags: ['analyse', 'benin', 'ia', 'opportunites']
    },
    {
      id: 'article_default_6',
      title: 'Témoignage : De Porto-Novo à Beijing',
      slug: 'temoignage-porto-novo-beijing',
      date: '01 Oct 2025',
      category: 'Interview',
      excerpt: "Un candidat raconte son parcours et sa fierté.",
      content: `<h1>Témoignage : De Porto-Novo à Beijing</h1>
<p>Interview d'un de nos finalistes qui a participé à l'édition 2025 à Beijing.</p>
<h2>Le parcours</h2>
<blockquote>
  <p>"C'était un rêve devenu réalité. Représenter mon pays dans une compétition internationale..."</p>
</blockquote>
<h2>Les défis</h2>
<blockquote>
  <p>"La préparation a été intense, mais l'accompagnement de l'équipe a été exceptionnel."</p>
</blockquote>
<h2>Le message aux futurs candidats</h2>
<blockquote>
  <p><strong>"N'ayez pas peur de vous lancer. C'est une expérience inoubliable !"</strong></p>
</blockquote>`,
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop',
      author: 'Interview',
      published: true,
      createdAt: '2025-10-01T15:00:00Z',
      updatedAt: '2025-10-01T15:00:00Z',
      tags: ['temoignage', 'beijing', 'inspiration']
    }
  ]
}

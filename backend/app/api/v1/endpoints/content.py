"""
Endpoints pour le contenu du site vitrine - Section 2: Site Vitrine Institutionnel
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import json

from app.db.session import get_db
from app.models.user import User
from app.models.content import News, FAQ, Edition, PastEdition, Partner, Page
from app.schemas.content import (
    NewsCreate,
    NewsUpdate,
    NewsResponse,
    FAQCreate,
    FAQUpdate,
    FAQResponse,
    EditionCreate,
    EditionUpdate,
    EditionResponse,
    PastEditionCreate,
    PastEditionUpdate,
    PastEditionResponse,
    PartnerCreate,
    PartnerUpdate,
    PartnerResponse,
    PageCreate,
    PageUpdate,
    PageResponse
)
from app.utils.deps import get_current_admin

router = APIRouter()
logger = logging.getLogger(__name__)


async def _cache_get(request: Request, key: str):
    redis_client = getattr(request.app.state, "redis", None)
    if redis_client is None:
        return None
    try:
        value = await redis_client.get(key)
    except Exception:
        return None
    if not value:
        return None
    try:
        return json.loads(value)
    except Exception:
        return None


async def _cache_set(request: Request, key: str, payload, ttl_seconds: int):
    redis_client = getattr(request.app.state, "redis", None)
    if redis_client is None:
        return
    try:
        await redis_client.set(key, json.dumps(payload), ex=ttl_seconds)
    except Exception:
        return


async def _cache_invalidate_prefix(request: Request, prefix: str):
    redis_client = getattr(request.app.state, "redis", None)
    if redis_client is None:
        return
    try:
        async for key in redis_client.scan_iter(match=f"{prefix}*"):
            await redis_client.delete(key)
    except Exception:
        return


# ==================== NEWS / ACTUALITÉS ====================
# Section 2.1: Page d'accueil

@router.get("/news", response_model=List[NewsResponse])
async def list_news(
    request: Request,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    published_only: bool = True
):
    """
    Liste des actualités et annonces - Section 2.1

    Public: Affiche uniquement les actualités publiées
    Admin: Peut voir toutes les actualités
    """
    cache_key = f"content:news:list:skip={skip}:limit={limit}:published={int(published_only)}"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    query = db.query(News)

    if published_only:
        query = query.filter(News.is_published == True)

    news = query.order_by(News.published_at.desc()).offset(skip).limit(limit).all()
    payload = [NewsResponse.model_validate(n).model_dump() for n in news]
    await _cache_set(request, cache_key, payload, ttl_seconds=60)
    return payload


@router.get("/news/{news_id}", response_model=NewsResponse)
async def get_news(
    request: Request,
    news_id: str,
    db: Session = Depends(get_db)
):
    """
    Détails d'une actualité
    """
    cache_key = f"content:news:get:{news_id}"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    news = db.query(News).filter(News.id == news_id).first()

    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actualité non trouvée"
        )

    payload = NewsResponse.model_validate(news).model_dump()
    await _cache_set(request, cache_key, payload, ttl_seconds=120)
    return payload


@router.post("/news", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    news_data: NewsCreate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Créer une nouvelle actualité (Admin seulement)
    """
    from datetime import datetime

    news = News(
        **news_data.model_dump(exclude={"published_at"}),
        author=f"{current_admin.first_name} {current_admin.last_name}"
    )

    # Si publiée, définir la date de publication
    if news.is_published and not news.published_at:
        news.published_at = datetime.utcnow().isoformat()

    db.add(news)
    db.commit()
    db.refresh(news)

    logger.info(f"Actualité créée: {news.title} par {current_admin.email}")

    await _cache_invalidate_prefix(request, "content:news:")
    return news


@router.put("/news/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: str,
    news_data: NewsUpdate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Mettre à jour une actualité (Admin seulement)
    """
    from datetime import datetime

    news = db.query(News).filter(News.id == news_id).first()

    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actualité non trouvée"
        )

    # Mettre à jour les champs
    update_data = news_data.model_dump(exclude_unset=True, exclude={"published_at"})
    for field, value in update_data.items():
        setattr(news, field, value)

    # Si on publie pour la première fois, définir la date
    if news.is_published and not news.published_at:
        news.published_at = datetime.utcnow().isoformat()

    db.commit()
    db.refresh(news)

    logger.info(f"Actualité mise à jour: {news.title} par {current_admin.email}")

    if request is not None:
        await _cache_invalidate_prefix(request, "content:news:")
    return news


@router.delete("/news/{news_id}")
async def delete_news(
    news_id: str,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Supprimer une actualité (Admin seulement)
    """
    news = db.query(News).filter(News.id == news_id).first()

    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actualité non trouvée"
        )

    db.delete(news)
    db.commit()

    logger.info(f"Actualité supprimée: {news.title} par {current_admin.email}")

    await _cache_invalidate_prefix(request, "content:news:")

    return {"message": "Actualité supprimée avec succès"}


# ==================== FAQ ====================
# Section 2.3 et 2.4

@router.get("/faq", response_model=List[FAQResponse])
async def list_faq(
    request: Request,
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    published_only: bool = True
):
    """
    Liste des FAQ - Section 2.3 et 2.4

    Catégories possibles: Inscription, QCM, Sélection, Formation, etc.
    """
    cache_key = f"content:faq:list:category={category or ''}:published={int(published_only)}"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    query = db.query(FAQ)

    if published_only:
        query = query.filter(FAQ.is_published == True)

    if category:
        query = query.filter(FAQ.category == category)

    faqs = query.order_by(FAQ.order.asc()).all()
    payload = [FAQResponse.model_validate(f).model_dump() for f in faqs]
    await _cache_set(request, cache_key, payload, ttl_seconds=300)
    return payload


@router.post("/faq", response_model=FAQResponse, status_code=status.HTTP_201_CREATED)
async def create_faq(
    faq_data: FAQCreate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Créer une nouvelle FAQ (Admin seulement)
    """
    faq = FAQ(**faq_data.model_dump())
    db.add(faq)
    db.commit()
    db.refresh(faq)

    logger.info(f"FAQ créée par {current_admin.email}")

    await _cache_invalidate_prefix(request, "content:faq:")
    return faq


@router.put("/faq/{faq_id}", response_model=FAQResponse)
async def update_faq(
    faq_id: str,
    faq_data: FAQUpdate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Mettre à jour une FAQ (Admin seulement)
    """
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()

    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ non trouvée"
        )

    update_data = faq_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(faq, field, value)

    db.commit()
    db.refresh(faq)

    if request is not None:
        await _cache_invalidate_prefix(request, "content:faq:")
    return faq


@router.delete("/faq/{faq_id}")
async def delete_faq(
    faq_id: str,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Supprimer une FAQ (Admin seulement)
    """
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()

    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ non trouvée"
        )

    db.delete(faq)
    db.commit()

    await _cache_invalidate_prefix(request, "content:faq:")

    return {"message": "FAQ supprimée avec succès"}


# ==================== ÉDITIONS ====================
# Section 2.3: Édition en cours

@router.get("/editions/active", response_model=Optional[EditionResponse])
async def get_active_edition(request: Request, db: Session = Depends(get_db)):
    """
    Récupérer l'édition active - Section 2.3

    Affiche les informations de l'édition en cours:
    - Timeline des 6 phases
    - Calendrier
    - Critères de sélection
    - Partenaires
    """
    cache_key = "content:editions:active"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    edition = db.query(Edition).filter(Edition.is_active == True).first()
    if edition is None:
        await _cache_set(request, cache_key, None, ttl_seconds=60)
        return None

    payload = EditionResponse.model_validate(edition).model_dump()
    await _cache_set(request, cache_key, payload, ttl_seconds=120)
    return payload


@router.get("/editions", response_model=List[EditionResponse])
async def list_editions(
    request: Request,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Liste de toutes les éditions
    """
    cache_key = f"content:editions:list:skip={skip}:limit={limit}"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    editions = db.query(Edition).order_by(Edition.year.desc()).offset(skip).limit(limit).all()
    payload = [EditionResponse.model_validate(e).model_dump() for e in editions]
    await _cache_set(request, cache_key, payload, ttl_seconds=300)
    return payload


@router.get("/editions/{edition_id}", response_model=EditionResponse)
async def get_edition(
    request: Request,
    edition_id: str,
    db: Session = Depends(get_db)
):
    """
    Détails d'une édition
    """
    cache_key = f"content:editions:get:{edition_id}"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    edition = db.query(Edition).filter(Edition.id == edition_id).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Édition non trouvée"
        )

    payload = EditionResponse.model_validate(edition).model_dump()
    await _cache_set(request, cache_key, payload, ttl_seconds=300)
    return payload


@router.post("/editions", response_model=EditionResponse, status_code=status.HTTP_201_CREATED)
async def create_edition(
    edition_data: EditionCreate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Créer une nouvelle édition (Admin seulement)
    """
    # Vérifier qu'une édition avec cette année n'existe pas déjà
    existing = db.query(Edition).filter(Edition.year == edition_data.year).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Une édition existe déjà pour l'année {edition_data.year}"
        )

    # Si cette édition est active, désactiver les autres
    if edition_data.is_active:
        db.query(Edition).update({Edition.is_active: False})

    edition = Edition(**edition_data.model_dump())
    db.add(edition)
    db.commit()
    db.refresh(edition)

    logger.info(f"Édition {edition.year} créée par {current_admin.email}")

    await _cache_invalidate_prefix(request, "content:editions:")
    return edition


@router.put("/editions/{edition_id}", response_model=EditionResponse)
async def update_edition(
    edition_id: str,
    edition_data: EditionUpdate,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Mettre à jour une édition (Admin seulement)
    """
    edition = db.query(Edition).filter(Edition.id == edition_id).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Édition non trouvée"
        )

    update_data = edition_data.model_dump(exclude_unset=True)

    # Si on active cette édition, désactiver les autres
    if update_data.get("is_active"):
        db.query(Edition).filter(Edition.id != edition_id).update({Edition.is_active: False})

    for field, value in update_data.items():
        setattr(edition, field, value)

    db.commit()
    db.refresh(edition)

    if request is not None:
        await _cache_invalidate_prefix(request, "content:editions:")
    return edition


# ==================== ÉDITIONS PASSÉES ====================
# Section 2.2: Bilan des éditions passées

@router.get("/past-editions", response_model=List[PastEditionResponse])
async def list_past_editions(
    db: Session = Depends(get_db)
):
    """
    Liste des éditions passées - Section 2.2

    Affiche:
    - Participation internationale
    - Timeline du parcours
    - Galerie photos
    - Témoignages
    - Distinctions et performances
    """
    editions = db.query(PastEdition).order_by(PastEdition.year.desc()).all()
    return editions


@router.get("/past-editions/{edition_id}", response_model=PastEditionResponse)
async def get_past_edition(
    edition_id: str,
    db: Session = Depends(get_db)
):
    """
    Détails d'une édition passée
    """
    edition = db.query(PastEdition).filter(PastEdition.id == edition_id).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Édition passée non trouvée"
        )

    return edition


@router.post("/past-editions", response_model=PastEditionResponse, status_code=status.HTTP_201_CREATED)
async def create_past_edition(
    edition_data: PastEditionCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Créer une édition passée (Admin seulement)
    """
    edition = PastEdition(**edition_data.model_dump())
    db.add(edition)
    db.commit()
    db.refresh(edition)

    logger.info(f"Édition passée {edition.year} créée par {current_admin.email}")

    return edition


@router.put("/past-editions/{edition_id}", response_model=PastEditionResponse)
async def update_past_edition(
    edition_id: str,
    edition_data: PastEditionUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour une édition passée (Admin seulement)
    """
    edition = db.query(PastEdition).filter(PastEdition.id == edition_id).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Édition passée non trouvée"
        )

    update_data = edition_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(edition, field, value)

    db.commit()
    db.refresh(edition)

    return edition


# ==================== PARTENAIRES ====================
# Section 2.4: Pages institutionnelles

@router.get("/partners", response_model=List[PartnerResponse])
async def list_partners(
    db: Session = Depends(get_db),
    active_only: bool = True
):
    """
    Liste des partenaires institutionnels - Section 2.4
    """
    query = db.query(Partner)

    if active_only:
        query = query.filter(Partner.is_active == True)

    partners = query.order_by(Partner.order.asc()).all()
    return partners


@router.post("/partners", response_model=PartnerResponse, status_code=status.HTTP_201_CREATED)
async def create_partner(
    partner_data: PartnerCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Ajouter un partenaire (Admin seulement)
    """
    partner = Partner(**partner_data.model_dump())
    db.add(partner)
    db.commit()
    db.refresh(partner)

    logger.info(f"Partenaire créé: {partner.name} par {current_admin.email}")

    return partner


@router.put("/partners/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: str,
    partner_data: PartnerUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour un partenaire (Admin seulement)
    """
    partner = db.query(Partner).filter(Partner.id == partner_id).first()

    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partenaire non trouvé"
        )

    update_data = partner_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(partner, field, value)

    db.commit()
    db.refresh(partner)

    return partner


@router.delete("/partners/{partner_id}")
async def delete_partner(
    partner_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer un partenaire (Admin seulement)
    """
    partner = db.query(Partner).filter(Partner.id == partner_id).first()

    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partenaire non trouvé"
        )

    db.delete(partner)
    db.commit()

    return {"message": "Partenaire supprimé avec succès"}


# ==================== PAGES ====================
# Section 2.4: Pages institutionnelles (À propos, Mission, Contact)

@router.get("/pages/{slug}", response_model=PageResponse)
async def get_page(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Récupérer une page par son slug - Section 2.4

    Slugs courants: a-propos, mission, contact, mentions-legales
    """
    page = db.query(Page).filter(Page.slug == slug, Page.is_published == True).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page non trouvée"
        )

    return page


@router.get("/pages", response_model=List[PageResponse])
async def list_pages(
    db: Session = Depends(get_db),
    published_only: bool = True
):
    """
    Liste de toutes les pages
    """
    query = db.query(Page)

    if published_only:
        query = query.filter(Page.is_published == True)

    pages = query.all()
    return pages


@router.post("/pages", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(
    page_data: PageCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle page (Admin seulement)
    """
    # Vérifier que le slug n'existe pas déjà
    existing = db.query(Page).filter(Page.slug == page_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Une page existe déjà avec le slug '{page_data.slug}'"
        )

    page = Page(**page_data.model_dump())
    db.add(page)
    db.commit()
    db.refresh(page)

    logger.info(f"Page créée: {page.slug} par {current_admin.email}")

    return page


@router.put("/pages/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: str,
    page_data: PageUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour une page (Admin seulement)
    """
    page = db.query(Page).filter(Page.id == page_id).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page non trouvée"
        )

    update_data = page_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(page, field, value)

    db.commit()
    db.refresh(page)

    return page


@router.delete("/pages/{page_id}")
async def delete_page(
    page_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer une page (Admin seulement)
    """
    page = db.query(Page).filter(Page.id == page_id).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page non trouvée"
        )

    db.delete(page)
    db.commit()

    return {"message": "Page supprimée avec succès"}

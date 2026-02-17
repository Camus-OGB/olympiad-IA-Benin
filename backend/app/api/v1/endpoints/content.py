"""
Endpoints pour le contenu du site vitrine - Section 2: Site Vitrine Institutionnel
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import json
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.content import News, FAQ, Edition, PastEdition, Partner, Page, TimelinePhase, PastTimelinePhase, GalleryImage, Testimonial, SelectionCriterion
from app.models.general_testimonial import GeneralTestimonial
from app.models.candidate_profile import CandidateProfile
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
    PageResponse,
    NextDeadlineResponse,
    GeneralTestimonialCreate,
    GeneralTestimonialUpdate,
    GeneralTestimonialResponse,
    TimelinePhaseCreate,
    TimelinePhaseResponse,
    SelectionCriterionCreate,
    SelectionCriterionResponse,
    PastTimelinePhaseCreate,
    PastTimelinePhaseResponse,
    GalleryImageCreate,
    GalleryImageResponse,
    TestimonialCreate,
    TestimonialResponse
)
from app.utils.deps import get_current_admin
from app.utils.audit import log_audit

router = APIRouter()
logger = logging.getLogger(__name__)


# ==================== STATS PUBLIQUES ====================

@router.get("/public-stats")
async def get_public_stats(request: Request, db: Session = Depends(get_db)):
    """
    Statistiques publiques pour le site vitrine
    - Nombre total de candidats inscrits
    - Nombre de candidats vérifiés
    """
    cache_key = "content:public-stats"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    total_candidates = db.query(CandidateProfile).count()
    verified_candidates = db.query(CandidateProfile).join(User).filter(
        User.is_verified == True
    ).count()

    payload = {
        "total_candidates": total_candidates,
        "verified_candidates": verified_candidates
    }

    # Cache pendant 2 minutes
    await _cache_set(request, cache_key, payload, ttl_seconds=120)
    return payload


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
    log_audit(db=db, admin=current_admin, action="create_news", resource_type="news",
              resource_label=news.title, request=request)
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

    log_audit(db=db, admin=current_admin, action="update_news", resource_type="news",
              resource_id=news_id, resource_label=news.title, request=request)
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

    log_audit(db=db, admin=current_admin, action="delete_news", resource_type="news",
              resource_id=news_id, resource_label=news.title, request=request)
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


@router.get("/editions/active/next-deadline", response_model=Optional[NextDeadlineResponse])
async def get_next_deadline(request: Request, db: Session = Depends(get_db)):
    """
    Récupérer la prochaine deadline pour le compte à rebours du site vitrine

    Retourne:
    - La prochaine phase qui va démarrer (start_date futur)
    - OU la phase en cours avec sa date de fin (is_current=True avec end_date futur)
    - None si aucune phase future/en cours
    """
    cache_key = "content:editions:next-deadline"
    cached = await _cache_get(request, cache_key)
    if cached is not None:
        return cached

    # Récupérer l'édition active
    edition = db.query(Edition).filter(Edition.is_active == True).first()
    if not edition:
        await _cache_set(request, cache_key, None, ttl_seconds=60)
        return None

    now = datetime.utcnow()

    # Chercher la phase en cours (is_current=True)
    current_phase = db.query(TimelinePhase).filter(
        TimelinePhase.edition_id == edition.id,
        TimelinePhase.is_current == True
    ).first()

    # Chercher la prochaine phase à venir (start_date dans le futur)
    future_phases = db.query(TimelinePhase).filter(
        TimelinePhase.edition_id == edition.id,
        TimelinePhase.start_date.isnot(None)
    ).order_by(TimelinePhase.phase_order).all()

    next_phase = None
    target_date = None
    target_type = None

    # Vérifier si une phase en cours a une date de fin dans le futur
    if current_phase and current_phase.end_date:
        try:
            end_dt = datetime.fromisoformat(current_phase.end_date.replace('Z', '+00:00'))
            if end_dt > now:
                next_phase = current_phase
                target_date = current_phase.end_date
                target_type = "end"
        except (ValueError, AttributeError):
            pass

    # Sinon, chercher la prochaine phase à démarrer
    if not next_phase:
        for phase in future_phases:
            if not phase.start_date:
                continue
            try:
                start_dt = datetime.fromisoformat(phase.start_date.replace('Z', '+00:00'))
                if start_dt > now:
                    next_phase = phase
                    target_date = phase.start_date
                    target_type = "start"
                    break
            except (ValueError, AttributeError):
                continue

    # Pas de deadline trouvée
    if not next_phase or not target_date:
        await _cache_set(request, cache_key, None, ttl_seconds=60)
        return None

    # Construire la réponse
    response = {
        "phase_title": next_phase.title,
        "phase_description": next_phase.description,
        "target_date": target_date,
        "target_type": target_type,
        "current_phase": {
            "title": current_phase.title,
            "is_active": True,
            "start_date": current_phase.start_date,
            "end_date": current_phase.end_date
        } if current_phase and current_phase.id != next_phase.id else None,
        "edition_year": edition.year
    }

    # Cache pendant 5 minutes
    await _cache_set(request, cache_key, response, ttl_seconds=300)
    return response


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
    log_audit(db=db, admin=current_admin, action="create_edition", resource_type="edition",
              resource_label=edition_data.title, details={"year": edition_data.year}, request=request)
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

    log_audit(db=db, admin=current_admin, action="update_edition", resource_type="edition",
              resource_id=edition_id, resource_label=edition.title, request=request)
    db.commit()
    db.refresh(edition)

    if request is not None:
        await _cache_invalidate_prefix(request, "content:editions:")
    return edition


# ==================== PHASES DE L'ÉDITION ACTIVE ====================

@router.post(
    "/editions/{edition_id}/phases",
    response_model=TimelinePhaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une phase pour une édition"
)
def create_edition_phase(
    edition_id: str,
    phase: TimelinePhaseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Créer une nouvelle phase de timeline pour une édition"""
    edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Édition non trouvée")

    new_phase = TimelinePhase(
        edition_id=edition_id,
        phase_order=phase.phase_order,
        title=phase.title,
        description=phase.description,
        start_date=phase.start_date,
        end_date=phase.end_date,
        is_current=phase.is_current
    )

    # Si is_current=True, désactiver les autres phases courantes
    if phase.is_current:
        db.query(TimelinePhase).filter(TimelinePhase.edition_id == edition_id).update({TimelinePhase.is_current: False})

    db.add(new_phase)
    db.commit()
    db.refresh(new_phase)
    return new_phase


@router.put(
    "/editions/{edition_id}/phases/{phase_id}",
    response_model=TimelinePhaseResponse,
    summary="Mettre à jour une phase"
)
def update_edition_phase(
    edition_id: str,
    phase_id: str,
    phase: TimelinePhaseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mettre à jour une phase de timeline"""
    db_phase = db.query(TimelinePhase).filter(
        TimelinePhase.id == phase_id,
        TimelinePhase.edition_id == edition_id
    ).first()

    if not db_phase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phase non trouvée")

    # Si is_current=True, désactiver les autres phases courantes
    if phase.is_current:
        db.query(TimelinePhase).filter(
            TimelinePhase.edition_id == edition_id,
            TimelinePhase.id != phase_id
        ).update({TimelinePhase.is_current: False})

    db_phase.phase_order = phase.phase_order
    db_phase.title = phase.title
    db_phase.description = phase.description
    db_phase.start_date = phase.start_date
    db_phase.end_date = phase.end_date
    db_phase.is_current = phase.is_current

    db.commit()
    db.refresh(db_phase)
    return db_phase


@router.delete(
    "/editions/{edition_id}/phases/{phase_id}",
    summary="Supprimer une phase"
)
def delete_edition_phase(
    edition_id: str,
    phase_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer une phase de timeline"""
    db_phase = db.query(TimelinePhase).filter(
        TimelinePhase.id == phase_id,
        TimelinePhase.edition_id == edition_id
    ).first()

    if not db_phase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phase non trouvée")

    db.delete(db_phase)
    db.commit()
    return {"message": "Phase supprimée"}


# ==================== CRITÈRES DE SÉLECTION ====================

@router.post(
    "/editions/{edition_id}/criteria",
    response_model=SelectionCriterionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter un critère de sélection à une édition"
)
def create_edition_criterion(
    edition_id: str,
    criterion: SelectionCriterionCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Créer un nouveau critère de sélection pour une édition"""
    edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Édition non trouvée")

    new_criterion = SelectionCriterion(
        edition_id=edition_id,
        stage=criterion.stage,
        stage_order=criterion.stage_order,
        criterion=criterion.criterion,
        min_score=criterion.min_score
    )
    db.add(new_criterion)
    db.commit()
    db.refresh(new_criterion)
    return new_criterion


@router.put(
    "/editions/{edition_id}/criteria/{criterion_id}",
    response_model=SelectionCriterionResponse,
    summary="Mettre à jour un critère de sélection"
)
def update_edition_criterion(
    edition_id: str,
    criterion_id: str,
    criterion: SelectionCriterionCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mettre à jour un critère de sélection"""
    db_criterion = db.query(SelectionCriterion).filter(
        SelectionCriterion.id == criterion_id,
        SelectionCriterion.edition_id == edition_id
    ).first()

    if not db_criterion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Critère non trouvé")

    db_criterion.stage = criterion.stage
    db_criterion.stage_order = criterion.stage_order
    db_criterion.criterion = criterion.criterion
    db_criterion.min_score = criterion.min_score

    db.commit()
    db.refresh(db_criterion)
    return db_criterion


@router.delete(
    "/editions/{edition_id}/criteria/{criterion_id}",
    summary="Supprimer un critère de sélection"
)
def delete_edition_criterion(
    edition_id: str,
    criterion_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer un critère de sélection"""
    db_criterion = db.query(SelectionCriterion).filter(
        SelectionCriterion.id == criterion_id,
        SelectionCriterion.edition_id == edition_id
    ).first()

    if not db_criterion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Critère non trouvé")

    db.delete(db_criterion)
    db.commit()
    return {"message": "Critère supprimé"}


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
    log_audit(db=db, admin=current_admin, action="create_past_edition", resource_type="past_edition",
              resource_label=getattr(edition_data, 'title', str(edition_data.year)))
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

    log_audit(db=db, admin=current_admin, action="update_past_edition", resource_type="past_edition",
              resource_id=edition_id, resource_label=getattr(edition, 'title', str(edition.year)))
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


# ==================== PAST EDITION TIMELINE PHASES ====================

@router.post(
    "/past-editions/{edition_id}/timeline",
    response_model=PastTimelinePhaseResponse,
    summary="Créer une phase de timeline pour une édition passée"
)
def create_timeline_phase(
    edition_id: str,
    phase: PastTimelinePhaseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Créer une nouvelle phase de timeline pour une édition passée"""
    # Vérifier que l'édition existe
    edition = db.query(PastEdition).filter(
        PastEdition.id == edition_id
    ).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Édition passée non trouvée"
        )

    # Créer la phase
    new_phase = PastTimelinePhase(
        past_edition_id=edition_id,
        phase_order=phase.phase_order,
        title=phase.title,
        description=phase.description,
        date=phase.date
    )

    db.add(new_phase)
    db.commit()
    db.refresh(new_phase)

    return new_phase


@router.put(
    "/past-editions/{edition_id}/timeline/{phase_id}",
    response_model=PastTimelinePhaseResponse,
    summary="Mettre à jour une phase de timeline"
)
def update_timeline_phase(
    edition_id: str,
    phase_id: str,
    phase: PastTimelinePhaseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mettre à jour une phase de timeline existante"""
    db_phase = db.query(PastTimelinePhase).filter(
        PastTimelinePhase.id == phase_id,
        PastTimelinePhase.past_edition_id == edition_id
    ).first()

    if not db_phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phase de timeline non trouvée"
        )

    # Mettre à jour les champs
    db_phase.phase_order = phase.phase_order
    db_phase.title = phase.title
    db_phase.description = phase.description
    db_phase.date = phase.date

    db.commit()
    db.refresh(db_phase)

    return db_phase


@router.delete(
    "/past-editions/{edition_id}/timeline/{phase_id}",
    summary="Supprimer une phase de timeline"
)
def delete_timeline_phase(
    edition_id: str,
    phase_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer une phase de timeline"""
    db_phase = db.query(PastTimelinePhase).filter(
        PastTimelinePhase.id == phase_id,
        PastTimelinePhase.past_edition_id == edition_id
    ).first()

    if not db_phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phase de timeline non trouvée"
        )

    db.delete(db_phase)
    db.commit()

    return {"message": "Phase de timeline supprimée avec succès"}



# ==================== PAST EDITION GALLERY IMAGES ====================

@router.post(
    "/past-editions/{edition_id}/gallery",
    response_model=GalleryImageResponse,
    summary="Ajouter une image à la galerie"
)
def create_gallery_image(
    edition_id: str,
    image: GalleryImageCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Ajouter une nouvelle image à la galerie d'une édition passée"""
    edition = db.query(PastEdition).filter(
        PastEdition.id == edition_id
    ).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Édition passée non trouvée"
        )

    new_image = GalleryImage(
        past_edition_id=edition_id,
        image_url=image.image_url,
        caption=image.caption,
        order=image.order
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image


@router.put(
    "/past-editions/{edition_id}/gallery/{image_id}",
    response_model=GalleryImageResponse,
    summary="Mettre à jour une image de galerie"
)
def update_gallery_image(
    edition_id: str,
    image_id: str,
    image: GalleryImageCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mettre à jour une image de galerie existante"""
    db_image = db.query(GalleryImage).filter(
        GalleryImage.id == image_id,
        GalleryImage.past_edition_id == edition_id
    ).first()

    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image de galerie non trouvée"
        )

    db_image.image_url = image.image_url
    db_image.caption = image.caption
    db_image.order = image.order

    db.commit()
    db.refresh(db_image)

    return db_image


@router.delete(
    "/past-editions/{edition_id}/gallery/{image_id}",
    summary="Supprimer une image de galerie"
)
def delete_gallery_image(
    edition_id: str,
    image_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer une image de galerie"""
    db_image = db.query(GalleryImage).filter(
        GalleryImage.id == image_id,
        GalleryImage.past_edition_id == edition_id
    ).first()

    if not db_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image de galerie non trouvée"
        )

    db.delete(db_image)
    db.commit()

    return {"message": "Image de galerie supprimée avec succès"}


# ==================== PAST EDITION TESTIMONIALS ====================

@router.post(
    "/past-editions/{edition_id}/testimonials",
    response_model=TestimonialResponse,
    summary="Créer un témoignage"
)
def create_testimonial(
    edition_id: str,
    testimonial: TestimonialCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Créer un nouveau témoignage pour une édition passée"""
    edition = db.query(PastEdition).filter(
        PastEdition.id == edition_id
    ).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Édition passée non trouvée"
        )

    new_testimonial = Testimonial(
        past_edition_id=edition_id,
        student_name=testimonial.student_name,
        school=testimonial.school,
        role=testimonial.role,
        quote=testimonial.quote,
        image_url=testimonial.image_url
    )

    db.add(new_testimonial)
    db.commit()
    db.refresh(new_testimonial)

    return new_testimonial


@router.put(
    "/past-editions/{edition_id}/testimonials/{testimonial_id}",
    response_model=TestimonialResponse,
    summary="Mettre à jour un témoignage"
)
def update_testimonial(
    edition_id: str,
    testimonial_id: str,
    testimonial: TestimonialCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mettre à jour un témoignage existant"""
    db_testimonial = db.query(Testimonial).filter(
        Testimonial.id == testimonial_id,
        Testimonial.past_edition_id == edition_id
    ).first()

    if not db_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )

    db_testimonial.student_name = testimonial.student_name
    db_testimonial.school = testimonial.school
    db_testimonial.role = testimonial.role
    db_testimonial.quote = testimonial.quote
    db_testimonial.image_url = testimonial.image_url

    db.commit()
    db.refresh(db_testimonial)

    return db_testimonial


@router.delete(
    "/past-editions/{edition_id}/testimonials/{testimonial_id}",
    summary="Supprimer un témoignage"
)
def delete_testimonial(
    edition_id: str,
    testimonial_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer un témoignage"""
    db_testimonial = db.query(Testimonial).filter(
        Testimonial.id == testimonial_id,
        Testimonial.past_edition_id == edition_id
    ).first()

    if not db_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )

    db.delete(db_testimonial)
    db.commit()

    return {"message": "Témoignage supprimé avec succès"}


# ==================== GENERAL TESTIMONIALS ====================

@router.get(
    "/general-testimonials",
    response_model=List[GeneralTestimonialResponse],
    summary="Récupérer tous les témoignages généraux"
)
def get_general_testimonials(
    published_only: bool = Query(True, description="Filtrer uniquement les témoignages publiés"),
    db: Session = Depends(get_db)
):
    """Récupérer tous les témoignages généraux (mentors, parents, sponsors, etc.)"""
    query = db.query(GeneralTestimonial)
    
    if published_only:
        query = query.filter(GeneralTestimonial.is_published == True)
    
    testimonials = query.order_by(GeneralTestimonial.display_order).all()
    return testimonials


@router.post(
    "/general-testimonials",
    response_model=GeneralTestimonialResponse,
    summary="Créer un témoignage général"
)
def create_general_testimonial(
    testimonial: GeneralTestimonialCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Créer un nouveau témoignage général"""
    new_testimonial = GeneralTestimonial(
        author_name=testimonial.author_name,
        author_role=testimonial.author_role,
        author_type=testimonial.author_type,
        content=testimonial.content,
        photo_url=testimonial.photo_url,
        video_url=testimonial.video_url,
        organization=testimonial.organization,
        display_order=testimonial.display_order,
        is_published=testimonial.is_published
    )
    
    db.add(new_testimonial)
    db.commit()
    db.refresh(new_testimonial)
    
    return new_testimonial


@router.put(
    "/general-testimonials/{testimonial_id}",
    response_model=GeneralTestimonialResponse,
    summary="Mettre à jour un témoignage général"
)
def update_general_testimonial(
    testimonial_id: str,
    testimonial: GeneralTestimonialUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Mettre à jour un témoignage général existant"""
    db_testimonial = db.query(GeneralTestimonial).filter(
        GeneralTestimonial.id == testimonial_id
    ).first()
    
    if not db_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )
    
    # Mettre à jour les champs fournis
    update_data = testimonial.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_testimonial, field, value)
    
    db.commit()
    db.refresh(db_testimonial)
    
    return db_testimonial


@router.delete(
    "/general-testimonials/{testimonial_id}",
    summary="Supprimer un témoignage général"
)
def delete_general_testimonial(
    testimonial_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Supprimer un témoignage général"""
    db_testimonial = db.query(GeneralTestimonial).filter(
        GeneralTestimonial.id == testimonial_id
    ).first()
    
    if not db_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )
    
    db.delete(db_testimonial)
    db.commit()
    
    return {"message": "Témoignage général supprimé avec succès"}

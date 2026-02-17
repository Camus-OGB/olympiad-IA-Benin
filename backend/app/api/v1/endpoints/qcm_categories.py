"""
Endpoints pour la gestion des catégories de QCM
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.models.qcm_category import QCMCategory
from app.models.qcm import QCMQuestion
from app.models.user import User
from app.schemas.qcm_category import (
    QCMCategoryCreate,
    QCMCategoryUpdate,
    QCMCategoryResponse,
    QCMCategoryWithStats
)
from app.utils.deps import get_current_admin

router = APIRouter()


@router.get("/", response_model=List[QCMCategoryWithStats])
async def list_categories(
    db: Session = Depends(get_db),
    include_inactive: bool = False
):
    """
    Liste toutes les catégories de QCM avec statistiques
    Accessible à tous (pour affichage public)
    """
    query = db.query(QCMCategory)

    if not include_inactive:
        query = query.filter(QCMCategory.is_active == True)

    query = query.order_by(QCMCategory.display_order.asc(), QCMCategory.name.asc())
    categories = query.all()

    # Ajouter le nombre de questions par catégorie
    result = []
    for category in categories:
        question_count = db.query(QCMQuestion).filter(
            QCMQuestion.category_id == category.id,
            QCMQuestion.is_active == True
        ).count()

        result.append(QCMCategoryWithStats(
            **category.__dict__,
            question_count=question_count
        ))

    return result


@router.get("/{category_id}", response_model=QCMCategoryResponse)
async def get_category(
    category_id: str,
    db: Session = Depends(get_db)
):
    """Récupère une catégorie par son ID"""
    category = db.query(QCMCategory).filter(QCMCategory.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catégorie non trouvée"
        )

    return category


@router.post("/", response_model=QCMCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: QCMCategoryCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Crée une nouvelle catégorie de QCM
    Réservé aux admins
    """
    # Vérifier que le slug est unique
    existing = db.query(QCMCategory).filter(QCMCategory.slug == category_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Le slug '{category_data.slug}' est déjà utilisé"
        )

    # Vérifier que le nom est unique
    existing_name = db.query(QCMCategory).filter(QCMCategory.name == category_data.name).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Le nom '{category_data.name}' est déjà utilisé"
        )

    category = QCMCategory(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.put("/{category_id}", response_model=QCMCategoryResponse)
async def update_category(
    category_id: str,
    category_data: QCMCategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Met à jour une catégorie
    Réservé aux admins
    """
    category = db.query(QCMCategory).filter(QCMCategory.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catégorie non trouvée"
        )

    # Vérifier l'unicité du slug si modifié
    if category_data.slug and category_data.slug != category.slug:
        existing = db.query(QCMCategory).filter(
            QCMCategory.slug == category_data.slug,
            QCMCategory.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le slug '{category_data.slug}' est déjà utilisé"
            )

    # Vérifier l'unicité du nom si modifié
    if category_data.name and category_data.name != category.name:
        existing_name = db.query(QCMCategory).filter(
            QCMCategory.name == category_data.name,
            QCMCategory.id != category_id
        ).first()
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le nom '{category_data.name}' est déjà utilisé"
            )

    # Appliquer les modifications
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Supprime une catégorie
    Réservé aux admins
    """
    category = db.query(QCMCategory).filter(QCMCategory.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Catégorie non trouvée"
        )

    # Vérifier qu'il n'y a pas de questions associées
    question_count = db.query(QCMQuestion).filter(
        QCMQuestion.category_id == category_id
    ).count()

    if question_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Impossible de supprimer cette catégorie car {question_count} question(s) y sont associées. "
                   f"Veuillez d'abord réassigner ou supprimer ces questions."
        )

    db.delete(category)
    db.commit()

    return None

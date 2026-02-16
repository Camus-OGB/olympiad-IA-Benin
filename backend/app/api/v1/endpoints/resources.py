"""
Endpoints pour les ressources pédagogiques
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceResponse, ResourceCreate, ResourceUpdate
from app.utils.deps import get_current_admin, get_current_verified_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ResourceResponse])
async def get_resources(
    db: Session = Depends(get_db)
):
    """
    Liste des ressources actives (accessible à tous les candidats vérifiés)
    """
    resources = db.query(Resource).filter(
        Resource.is_active == True
    ).order_by(Resource.order_index, Resource.created_at.desc()).all()

    return resources


@router.post("/", response_model=ResourceResponse)
async def create_resource(
    resource: ResourceCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle ressource (Admin uniquement)
    """
    new_resource = Resource(**resource.model_dump())
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)

    return new_resource


@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: str,
    resource_update: ResourceUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour une ressource (Admin uniquement)
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()

    if not resource:
        raise HTTPException(404, "Ressource non trouvée")

    update_data = resource_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)

    return resource


@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer une ressource (Admin uniquement)
    Soft delete: marque comme inactive
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()

    if not resource:
        raise HTTPException(404, "Ressource non trouvée")

    resource.is_active = False
    db.commit()

    return {"message": "Ressource supprimée avec succès"}

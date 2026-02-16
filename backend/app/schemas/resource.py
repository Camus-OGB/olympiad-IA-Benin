"""
Schémas Pydantic pour les ressources pédagogiques
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.resource import ResourceType, ResourceCategory


class ResourceBase(BaseModel):
    """Base pour les ressources"""
    title: str
    description: Optional[str] = None
    type: ResourceType
    category: ResourceCategory
    url: str
    file_size: Optional[str] = None
    duration: Optional[str] = None


class ResourceCreate(ResourceBase):
    """Création d'une ressource"""
    pass


class ResourceUpdate(BaseModel):
    """Mise à jour d'une ressource"""
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[ResourceType] = None
    category: Optional[ResourceCategory] = None
    url: Optional[str] = None
    file_size: Optional[str] = None
    duration: Optional[str] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None


class ResourceResponse(ResourceBase):
    """Réponse avec une ressource"""
    id: str
    is_active: bool
    order_index: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

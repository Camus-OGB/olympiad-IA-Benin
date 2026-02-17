"""
Schémas Pydantic pour les catégories de QCM
"""
from pydantic import BaseModel, validator
from typing import Optional


class QCMCategoryBase(BaseModel):
    """Base schema for QCM category"""
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = None  # Format hex: #FF5733
    icon: Optional[str] = None  # Nom de l'icône Lucide
    display_order: Optional[int] = 0
    is_active: bool = True

    @validator('color')
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('La couleur doit être au format hex (#FF5733)')
        return v


class QCMCategoryCreate(QCMCategoryBase):
    """Schema for creating a category"""
    pass


class QCMCategoryUpdate(BaseModel):
    """Schema for updating a category"""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class QCMCategoryResponse(QCMCategoryBase):
    """Schema for category response"""
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class QCMCategoryWithStats(QCMCategoryResponse):
    """Category avec statistiques"""
    question_count: int  # Nombre de questions dans cette catégorie

    class Config:
        from_attributes = True

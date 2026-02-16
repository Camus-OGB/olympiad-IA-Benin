"""
Endpoints pour l'upload de fichiers
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict
import os

from app.utils.deps import get_current_admin
from app.models.user import User
from app.services.storage_service import storage_service

router = APIRouter()

# Configuration
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {
    'pdf': ['.pdf'],
    'document': ['.doc', '.docx', '.txt', '.odt']
}

ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.oasis.opendocument.text'
}


def format_file_size(bytes: int) -> str:
    """Formate la taille du fichier"""
    if bytes == 0:
        return "0 B"
    k = 1024
    sizes = ['B', 'KB', 'MB', 'GB']
    i = 0
    size = float(bytes)
    while size >= k and i < len(sizes) - 1:
        size /= k
        i += 1
    return f"{size:.2f} {sizes[i]}"


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin)
) -> Dict[str, str]:
    """
    Upload un fichier de ressource sur Supabase Storage (Admin uniquement)
    """
    # Vérifier l'extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    all_allowed_extensions = []
    for exts in ALLOWED_EXTENSIONS.values():
        all_allowed_extensions.extend(exts)

    if file_ext not in all_allowed_extensions:
        raise HTTPException(
            400,
            f"Extension non autorisée. Extensions acceptées: {', '.join(all_allowed_extensions)}"
        )

    # Vérifier le type MIME
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            400,
            f"Type de fichier non autorisé. Type reçu: {file.content_type}"
        )

    # Lire le contenu pour vérifier la taille
    content = await file.read()
    file_size = len(content)

    # Vérifier la taille
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            400,
            f"Fichier trop volumineux. Taille maximale: {format_file_size(MAX_FILE_SIZE)}"
        )

    # Remettre le curseur au début pour l'upload
    await file.seek(0)

    # Upload sur Supabase Storage
    file_url = await storage_service.upload_resource(file)

    if not file_url:
        raise HTTPException(
            500,
            "Erreur lors de l'upload du fichier sur Supabase"
        )

    # Retourner l'URL et les métadonnées
    return {
        "url": file_url,
        "filename": file.filename,
        "size": format_file_size(file_size),
        "content_type": file.content_type
    }

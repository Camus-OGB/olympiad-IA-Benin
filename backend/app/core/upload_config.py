"""
Configuration des restrictions d'upload de fichiers
"""
from typing import List

# Tailles maximales en bytes
MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_BULLETIN_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_DOCUMENT_SIZE = 50 * 1024 * 1024  # 50 MB

# Types MIME autorisés
ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png"
]

ALLOWED_DOCUMENT_TYPES = [
    "application/pdf"
]

# Nombres maximum de fichiers
MAX_BULLETINS_PER_CANDIDATE = 3
MAX_DOCUMENTS_PER_CANDIDATE = 5

# Extensions autorisées
ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"]
ALLOWED_DOCUMENT_EXTENSIONS = [".pdf"]


def validate_file_size(file_size: int, max_size: int) -> bool:
    """Valide la taille d'un fichier"""
    return file_size <= max_size


def validate_mime_type(mime_type: str, allowed_types: List[str]) -> bool:
    """Valide le type MIME d'un fichier"""
    return mime_type.lower() in allowed_types


def get_file_extension(filename: str) -> str:
    """Récupère l'extension d'un fichier"""
    return filename.lower().split(".")[-1] if "." in filename else ""

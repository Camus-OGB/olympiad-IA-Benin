"""
Service de stockage avec Supabase - Buckets séparés
"""
from supabase import create_client, Client
from app.core.config import settings
from fastapi import UploadFile
import logging
import uuid
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class StorageService:
    """Service pour gérer l'upload de fichiers sur Supabase avec buckets séparés"""

    def __init__(self):
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            self.client: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            # Buckets séparés par type de fichier
            self.bucket_photos = settings.SUPABASE_BUCKET_PHOTOS
            self.bucket_bulletins = settings.SUPABASE_BUCKET_BULLETINS
            self.bucket_documents = settings.SUPABASE_BUCKET_DOCUMENTS
            self.bucket_news = settings.SUPABASE_BUCKET_NEWS
            self.bucket_resources = settings.SUPABASE_BUCKET_RESOURCES
        else:
            self.client = None
            logger.warning("Supabase non configuré - uploads désactivés")

    async def upload_file(
        self,
        file: UploadFile,
        bucket_name: str,
        user_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Upload un fichier sur Supabase Storage dans un bucket spécifique

        Args:
            file: Fichier à uploader
            bucket_name: Nom du bucket de destination
            user_id: ID utilisateur pour organiser les fichiers

        Returns:
            URL publique du fichier ou None si erreur
        """
        if not self.client:
            logger.error("Supabase non configuré")
            return None

        try:
            # Générer un nom de fichier unique
            file_ext = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_id = str(uuid.uuid4())

            # Organisation des fichiers par user_id
            if user_id:
                file_path = f"{user_id}/{unique_id}.{file_ext}"
            else:
                file_path = f"{unique_id}.{file_ext}"

            # Lire le contenu du fichier
            file_content = await file.read()

            # Upload sur Supabase dans le bucket spécifique
            response = self.client.storage.from_(bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": file.content_type}
            )

            # Obtenir l'URL publique
            public_url = self.client.storage.from_(bucket_name).get_public_url(file_path)

            return public_url

        except Exception as e:
            logger.error(f"Erreur upload fichier dans {bucket_name}: {str(e)}")
            return None

    async def delete_file(self, file_url: str, bucket_name: str) -> bool:
        """
        Supprime un fichier de Supabase Storage

        Args:
            file_url: URL complète du fichier
            bucket_name: Nom du bucket contenant le fichier

        Returns:
            True si succès, False sinon
        """
        if not self.client:
            return False

        try:
            # Extraire le path du fichier depuis l'URL
            # Format: https://xxx.supabase.co/storage/v1/object/public/bucket/path
            parts = file_url.split(f"/{bucket_name}/")
            if len(parts) != 2:
                logger.error(f"URL invalide: {file_url}")
                return False

            file_path = parts[1]

            # Supprimer le fichier
            self.client.storage.from_(bucket_name).remove([file_path])
            return True

        except Exception as e:
            logger.error(f"Erreur suppression fichier: {str(e)}")
            return False

    def create_signed_url(self, bucket_name: str, file_url_or_path: str, expires_in: int = 600) -> Optional[str]:
        """
        Génère une URL signée temporaire pour accéder à un fichier stocké dans Supabase Storage.

        Args:
            bucket_name: Nom du bucket
            file_url_or_path: URL complète (public/private) ou path relatif dans le bucket
            expires_in: Durée de validité en secondes

        Returns:
            URL signée ou None si erreur
        """
        if not self.client:
            logger.error("Supabase non configuré")
            return None

        try:
            file_path = file_url_or_path
            if file_url_or_path.startswith("http://") or file_url_or_path.startswith("https://"):
                parsed = urlparse(file_url_or_path)
                parts = parsed.path.split(f"/{bucket_name}/", 1)
                if len(parts) != 2:
                    logger.error(f"URL invalide: {file_url_or_path}")
                    return None
                file_path = parts[1].lstrip("/")

            resp = self.client.storage.from_(bucket_name).create_signed_url(file_path, expires_in)
            if isinstance(resp, dict):
                return resp.get("signedURL") or resp.get("signedUrl")
            return None
        except Exception as e:
            logger.error(f"Erreur génération URL signée: {str(e)}")
            return None

    async def upload_photo(self, file: UploadFile, user_id: str) -> Optional[str]:
        """
        Upload une photo d'identité
        Bucket: olympiades-photos (5MB max, JPEG/PNG)
        """
        return await self.upload_file(file, bucket_name=self.bucket_photos, user_id=user_id)

    async def upload_bulletin(self, file: UploadFile, user_id: str) -> Optional[str]:
        """
        Upload un bulletin scolaire
        Bucket: olympiades-bulletins (10MB max, PDF)
        """
        return await self.upload_file(file, bucket_name=self.bucket_bulletins, user_id=user_id)

    async def upload_document(self, file: UploadFile, user_id: str = None) -> Optional[str]:
        """
        Upload un document général
        Bucket: olympiades-documents (50MB max, tous types)
        """
        return await self.upload_file(file, bucket_name=self.bucket_documents, user_id=user_id)

    async def upload_news_image(self, file: UploadFile) -> Optional[str]:
        """
        Upload une image pour les actualités
        Bucket: olympiades-news (10MB max, images)
        """
        return await self.upload_file(file, bucket_name=self.bucket_news, user_id=None)

    async def upload_resource(self, file: UploadFile) -> Optional[str]:
        """
        Upload une ressource pédagogique (PDF, Document)
        Bucket: olympiades-resources (50MB max, PDF/DOC/DOCX/TXT/ODT)
        """
        return await self.upload_file(file, bucket_name=self.bucket_resources, user_id=None)


# Instance globale
storage_service = StorageService()

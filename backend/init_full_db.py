"""
Script d'initialisation complète de la base de données
- Crée toutes les tables
- Crée un compte admin par défaut
"""
import sys
from pathlib import Path

# Ajouter le chemin du projet au PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent))

from app.db import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """Initialise la base de données complète"""

    logger.info("🗄️  Création des tables...")

    # Créer toutes les tables
    init_db()

    logger.info("✅ Tables créées avec succès")



if __name__ == "__main__":
    logger.info("="*60)
    logger.info("🚀 INITIALISATION DE LA BASE DE DONNÉES")
    logger.info("="*60)

    init_database()

    logger.info("\n✅ Initialisation terminée avec succès!")
    logger.info("\n📝 Pour vous connecter en tant qu'admin:")
    logger.info("   📧 Email: admin@olympiades-ia.bj")
    logger.info("   🔑 Mot de passe: Admin@2026")
    logger.info("\n🌐 Accédez à l'interface admin sur:")
    logger.info("   http://localhost:3000/auth/connexion")

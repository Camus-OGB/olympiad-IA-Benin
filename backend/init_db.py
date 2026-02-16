"""
Script pour initialiser la base de données avec les tables QCM
"""
import sys
from pathlib import Path

# Ajouter le chemin du projet au PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent))

from app.db import init_db

if __name__ == "__main__":
    print("🔧 Initialisation de la base de données...")
    try:
        init_db()
        print("✅ Base de données initialisée avec succès !")
        print("   Toutes les tables ont été créées, y compris les tables QCM.")
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        import traceback
        traceback.print_exc()

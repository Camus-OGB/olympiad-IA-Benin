#!/usr/bin/env python3
"""
Script de test de connexion Redis
Usage: python test_redis.py
"""

import sys
from redis import Redis
from decouple import config


def test_redis_connection():
    """Teste la connexion à Redis et effectue quelques opérations basiques"""

    redis_url = config("REDIS_URL", default="redis://localhost:6379/0")
    redis_enabled = config("REDIS_ENABLED", default=False, cast=bool)

    print(f"🔧 Configuration Redis:")
    print(f"   - REDIS_ENABLED: {redis_enabled}")
    print(f"   - REDIS_URL: {redis_url}")
    print()

    if not redis_enabled:
        print("⚠️  Redis est désactivé (REDIS_ENABLED=false)")
        print("   Pour l'activer, définissez REDIS_ENABLED=true dans votre .env")
        return False

    try:
        print("🔄 Connexion à Redis...")
        redis_client = Redis.from_url(redis_url, decode_responses=True)

        # Test ping
        print("📡 Test de connexion (PING)...")
        response = redis_client.ping()
        if response:
            print("✅ PONG reçu - Connexion établie!")

        # Test SET
        print("\n📝 Test d'écriture (SET)...")
        redis_client.set("test_key", "Hello from Olympiades IA!", ex=60)
        print("✅ Clé 'test_key' créée (expire dans 60s)")

        # Test GET
        print("\n📖 Test de lecture (GET)...")
        value = redis_client.get("test_key")
        print(f"✅ Valeur récupérée: {value}")

        # Test INFO
        print("\n📊 Informations Redis:")
        info = redis_client.info("server")
        print(f"   - Version: {info.get('redis_version', 'N/A')}")
        print(f"   - Uptime: {info.get('uptime_in_seconds', 0)} secondes")
        print(f"   - Connexions: {redis_client.info('clients').get('connected_clients', 0)}")

        # Test DBSIZE
        print("\n🔢 Statistiques:")
        dbsize = redis_client.dbsize()
        print(f"   - Nombre de clés: {dbsize}")

        # Test TTL
        ttl = redis_client.ttl("test_key")
        print(f"   - TTL de test_key: {ttl} secondes")

        # Nettoyage
        print("\n🧹 Nettoyage...")
        redis_client.delete("test_key")
        print("✅ Clé de test supprimée")

        print("\n✅ ✅ ✅ Tous les tests Redis sont passés avec succès! ✅ ✅ ✅")
        return True

    except ConnectionError as e:
        print(f"❌ Erreur de connexion: {e}")
        print("\n💡 Solutions possibles:")
        print("   1. Vérifiez que Redis est démarré")
        print("   2. Vérifiez l'URL dans REDIS_URL")
        print("   3. Pour Docker: docker-compose up -d redis")
        print("   4. Pour local: sudo systemctl start redis (Linux)")
        return False

    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False


if __name__ == "__main__":
    print("🧪 Test de connexion Redis - Olympiades IA Bénin")
    print("=" * 60)
    print()

    success = test_redis_connection()

    print()
    print("=" * 60)

    sys.exit(0 if success else 1)

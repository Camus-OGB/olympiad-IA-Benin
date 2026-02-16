#!/usr/bin/env python3
"""Script pour créer un compte admin.

Ce script est destiné au développement / bootstrap.
"""

import argparse

from app.core.security import get_password_hash
from app.db import SessionLocal
from app.models.user import User, UserRole


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", default="admin@olympiades-ia.bj")
    parser.add_argument("--password", default="Admin@2026")
    parser.add_argument("--role", default=UserRole.ADMIN.value, choices=[r.value for r in UserRole])
    parser.add_argument("--first-name", default="Admin")
    parser.add_argument("--last-name", default="Olympiades IA")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == args.email).first()
        if existing:
            print(f"✅ Un utilisateur existe déjà avec l'email: {args.email}")
            print(f"   ID: {existing.id}")
            print(f"   Rôle: {existing.role}")
            print(f"   Vérifié: {existing.is_verified}")
            print(f"   Actif: {existing.is_active}")
            return 0

        user = User(
            email=args.email,
            first_name=args.first_name,
            last_name=args.last_name,
            role=UserRole(args.role),
            hashed_password=get_password_hash(args.password),
            is_verified=True,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print("✅ Utilisateur créé avec succès")
        print(f"📧 Email: {args.email}")
        print(f"🔑 Mot de passe: {args.password}")
        print(f"👤 Rôle: {args.role}")
        return 0
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de la création: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())

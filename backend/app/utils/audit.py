"""
Helper pour enregistrer les actions admin dans le journal d'audit
"""
import json
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_audit(
    db: Session,
    admin,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    resource_label: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request=None,
) -> None:
    """
    Enregistre une action admin dans le journal d'audit.
    Ne fait pas de commit — la route appelante s'en charge.

    Args:
        db: Session SQLAlchemy
        admin: L'utilisateur admin qui effectue l'action
        action: Code de l'action (ex: "update_candidate_status")
        resource_type: Type de ressource (ex: "candidate", "user", "edition")
        resource_id: ID de la ressource affectée
        resource_label: Nom lisible de la ressource (ex: "Jean Dupont")
        details: Dictionnaire de détails supplémentaires
        request: La requête FastAPI (pour extraire l'IP)
    """
    ip = None
    if request is not None:
        try:
            # Prendre en compte les proxies (X-Forwarded-For)
            forwarded_for = request.headers.get("x-forwarded-for")
            if forwarded_for:
                ip = forwarded_for.split(",")[0].strip()
            else:
                ip = request.client.host if request.client else None
        except Exception:
            ip = None

    entry = AuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_label=resource_label,
        details=json.dumps(details, ensure_ascii=False) if details else None,
        ip_address=ip,
    )
    db.add(entry)

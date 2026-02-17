"""
Modèle pour le journal d'audit admin
Enregistre toutes les actions effectuées par les administrateurs
"""
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base


class AuditLog(Base):
    """
    Journal d'audit : chaque action admin est enregistrée ici.
    Permet le suivi complet des opérations sur la plateforme.
    """
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Qui a fait l'action
    admin_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_email = Column(String, nullable=False)  # Dénormalisé pour conserver l'historique

    # Quelle action
    action = Column(String, nullable=False)
    # Ex: "update_candidate_status", "delete_candidate", "create_user", "create_edition"...

    # Sur quelle ressource
    resource_type = Column(String, nullable=False)
    # Ex: "candidate", "user", "edition", "past_edition", "faq", "news", "partner"
    resource_id = Column(String, nullable=True)
    resource_label = Column(String, nullable=True)  # Nom lisible, ex: "Jean Dupont"

    # Détails supplémentaires (JSON string)
    details = Column(Text, nullable=True)
    # Ex: '{"old_status": "registered", "new_status": "qcm_pending"}'

    # Méta
    ip_address = Column(String, nullable=True)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AuditLog {self.action} by {self.admin_email} on {self.resource_type}:{self.resource_id}>"

"""
Endpoints pour l'espace administrateur - Section 4: Espace Administrateur
Adaptés à la structure 3FN
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, date as date_type
import logging

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.candidate_profile import (
    CandidateProfile, CandidateStatus, QCMResult, School
)
from app.models.candidate_profile import Bulletin
from app.schemas.admin import (
    DashboardStats,
    CandidateListItem,
    CandidateDetailResponse,
    UpdateCandidateStatusRequest,
    BulkStatusUpdateRequest
)
from app.utils.deps import get_current_admin
from app.utils.audit import log_audit
from app.models.audit_log import AuditLog
from app.schemas.admin import AuditLogResponse
from app.services.email_service import send_notification_email
from app.services.storage_service import StorageService

router = APIRouter()
logger = logging.getLogger(__name__)
storage_service = StorageService()


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Statistiques du tableau de bord admin - Section 4.1: Tableau de bord administrateur

    Affiche:
    - Nombre total de candidats
    - Nombre de candidats vérifiés
    - Nombre de QCM complétés
    - Répartition par région (basé sur la table School)
    - Répartition par genre (male, female, unspecified)
    - Score moyen au QCM
    - Répartition par statut
    - Inscriptions récentes (7 derniers jours)
    """
    # Nombre total de candidats
    total_candidates = db.query(CandidateProfile).count()

    # Candidats dont le profil a été validé (statut avancé au-delà de l'inscription)
    verified_candidates = db.query(CandidateProfile).filter(
        CandidateProfile.status != CandidateStatus.REGISTERED
    ).count()

    # QCM complétés (via la table QCMResult)
    qcm_completed = db.query(QCMResult).count()

    # Score moyen du QCM
    qcm_average_score = db.query(
        func.avg(QCMResult.score)
    ).scalar()

    # Répartition par région (via la table School normalisée)
    candidates_by_region = {}
    region_results = db.query(
        School.region, func.count(CandidateProfile.id)
    ).join(CandidateProfile, CandidateProfile.school_id == School.id).group_by(
        School.region
    ).all()

    for region, count in region_results:
        region_name = region if region else "Non spécifié"
        candidates_by_region[region_name] = count

    # Comptage des candidats sans école
    no_school_count = db.query(CandidateProfile).filter(
        CandidateProfile.school_id.is_(None)
    ).count()
    if no_school_count > 0:
        candidates_by_region["Non spécifié"] = candidates_by_region.get("Non spécifié", 0) + no_school_count

    # Répartition par statut
    candidates_by_status = {}
    for candidate_status in CandidateStatus:
        count = db.query(CandidateProfile).filter(
            CandidateProfile.status == candidate_status
        ).count()
        candidates_by_status[candidate_status.value] = count

    # Répartition par genre
    from app.models.candidate_profile import Gender
    candidates_by_gender = {}
    for gender in Gender:
        count = db.query(CandidateProfile).filter(
            CandidateProfile.gender == gender
        ).count()
        candidates_by_gender[gender.value] = count

    # Compter les candidats sans genre spécifié
    no_gender_count = db.query(CandidateProfile).filter(
        CandidateProfile.gender.is_(None)
    ).count()
    if no_gender_count > 0:
        candidates_by_gender["unspecified"] = no_gender_count

    # Candidats récemment inscrits (7 derniers jours)
    from datetime import timedelta
    seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    recent_registrations = db.query(CandidateProfile).join(User).filter(
        User.created_at >= seven_days_ago
    ).count()

    return {
        "total_candidates": total_candidates,
        "verified_candidates": verified_candidates,
        "qcm_completed": qcm_completed,
        "candidates_by_region": candidates_by_region,
        "candidates_by_status": candidates_by_status,
        "candidates_by_gender": candidates_by_gender,
        "qcm_average_score": round(qcm_average_score, 2) if qcm_average_score else None,
        "recent_registrations": recent_registrations
    }


@router.get("/candidates", response_model=List[CandidateListItem])
async def list_candidates(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100000),  # Augmenté pour permettre l'export complet des données
    candidate_status: Optional[CandidateStatus] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|qcm_score|status)$"),
    order: str = Query("desc", regex="^(asc|desc)$")
):
    """
    Liste des candidats avec filtrage et tri - Section 4.2: Gestion des candidatures

    Filtres disponibles:
    - Statut du candidat
    - Recherche par nom/email
    - Tri par date d'inscription, score QCM, statut
    """
    query = db.query(CandidateProfile).join(User).options(
        selectinload(CandidateProfile.user),
        selectinload(CandidateProfile.school_ref),
        selectinload(CandidateProfile.parent_contact),
        selectinload(CandidateProfile.academic_records),
        selectinload(CandidateProfile.subject_scores),
        selectinload(CandidateProfile.qcm_result),
        selectinload(CandidateProfile.bulletins)
    )

    # Filtre par statut
    if candidate_status:
        query = query.filter(CandidateProfile.status == candidate_status)

    # Recherche
    if search:
        search_pattern = f"%{search}%"
        # Jointure optionnelle avec School pour chercher par nom d'école
        query = query.outerjoin(School, CandidateProfile.school_id == School.id).filter(
            (User.first_name.ilike(search_pattern)) |
            (User.last_name.ilike(search_pattern)) |
            (User.email.ilike(search_pattern)) |
            (School.name.ilike(search_pattern))
        )

    # Tri
    if sort_by == "created_at":
        order_column = User.created_at
    elif sort_by == "qcm_score":
        # Tri par score QCM via sous-requête
        order_column = User.created_at  # Fallback
    else:
        order_column = CandidateProfile.status

    if order == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())

    # Pagination
    candidates = query.offset(skip).limit(limit).all()

    def is_majeur(dob) -> bool:
        if not dob:
            return False
        birth = dob if isinstance(dob, date_type) else date_type.fromisoformat(str(dob))
        today = date_type.today()
        age = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
        return age >= 18

    # Formater la réponse
    result = []
    for profile in candidates:
        # Récupérer le score QCM depuis la table normalisée
        qcm_score = None
        if profile.qcm_result:
            qcm_score = profile.qcm_result.score

        # Calculer le pourcentage de complétion du profil

        fields = [
            profile.date_of_birth,
            profile.gender,
            profile.phone,
            profile.address,
            profile.photo_url,
            profile.school_id,
            profile.grade,
            len(profile.academic_records) > 0,
            len(profile.subject_scores) > 0,
            len(profile.bulletins) > 0,
        ]
        # Informations tuteur comptées uniquement pour les mineurs
        if not is_majeur(profile.date_of_birth):
            fields.append(profile.parent_contact is not None)
        filled_count = sum(1 for field in fields if field)
        profile_completion = round((filled_count / len(fields)) * 100)

        result.append({
            "id": profile.id,
            "user_id": profile.user_id,
            "full_name": f"{profile.user.first_name} {profile.user.last_name}",
            "email": profile.user.email,
            "school_name": profile.school_ref.name if profile.school_ref else None,
            "school_region": profile.school_ref.region if profile.school_ref else None,
            "grade": profile.grade,
            "gender": profile.gender,
            "status": profile.status,
            "qcm_score": qcm_score,
            "created_at": profile.user.created_at,
            "is_verified": profile.user.is_verified,
            "profile_completion": profile_completion
        })

    return result


@router.get("/candidates/{candidate_id}", response_model=CandidateDetailResponse)
async def get_candidate_detail(
    candidate_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Détails complets d'un candidat - Section 4.2: Gestion des candidatures

    Affiche toutes les informations:
    - Informations personnelles
    - Informations scolaires
    - Documents uploadés (bulletins via relation)
    - Résultats QCM
    - Contact parent
    """
    profile = db.query(CandidateProfile).options(
        selectinload(CandidateProfile.user),
        selectinload(CandidateProfile.school_ref),
        selectinload(CandidateProfile.parent_contact),
        selectinload(CandidateProfile.academic_records),
        selectinload(CandidateProfile.subject_scores),
        selectinload(CandidateProfile.qcm_result),
        selectinload(CandidateProfile.bulletins)
    ).filter(
        CandidateProfile.id == candidate_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidat non trouvé"
        )

    return {
        "id": profile.id,
        "user": profile.user,
        "profile": profile,
    }


@router.get("/candidates/{candidate_id}/bulletins/{bulletin_id}/signed-url")
async def get_bulletin_signed_url(
    candidate_id: str,
    bulletin_id: str,
    expires_in: int = Query(600, ge=60, le=3600),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Génère une URL signée temporaire pour télécharger un bulletin.

    Cette approche évite d'ouvrir les bulletins en lecture publique côté Supabase.
    """
    profile = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidat non trouvé")

    bulletin = db.query(Bulletin).filter(
        Bulletin.id == bulletin_id,
        Bulletin.candidate_id == candidate_id,
    ).first()
    if not bulletin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bulletin non trouvé")

    signed_url = storage_service.create_signed_url(
        bucket_name=storage_service.bucket_bulletins,
        file_url_or_path=bulletin.file_url,
        expires_in=expires_in,
    )
    if not signed_url:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Impossible de générer l'URL")

    logger.info(
        f"URL signée bulletin générée pour candidate_id={candidate_id} bulletin_id={bulletin_id} par admin={current_admin.email}"
    )
    return {"signed_url": signed_url, "expires_in": expires_in}


@router.put("/candidates/{candidate_id}/status")
async def update_candidate_status(
    candidate_id: str,
    request: UpdateCandidateStatusRequest,
    http_request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour le statut d'un candidat - Section 4.2: Gestion des candidatures

    Permet de faire progresser ou régresser un candidat dans le processus:
    - REGISTERED → QCM_PENDING → QCM_COMPLETED
    - QCM_COMPLETED → REGIONAL_SELECTED ou REJECTED
    - REGIONAL_SELECTED → BOOTCAMP_SELECTED ou REJECTED
    - BOOTCAMP_SELECTED → NATIONAL_FINALIST ou REJECTED
    """
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.id == candidate_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidat non trouvé"
        )

    old_status = profile.status
    profile.status = request.new_status

    # Ajouter une note si fournie
    if request.note:
        logger.info(f"Note pour candidat {candidate_id}: {request.note}")

    candidate_name = f"{profile.user.first_name} {profile.user.last_name}" if profile.user else candidate_id
    log_audit(
        db=db, admin=current_admin,
        action="update_candidate_status",
        resource_type="candidate",
        resource_id=candidate_id,
        resource_label=candidate_name,
        details={"old_status": old_status.value if old_status else None, "new_status": request.new_status.value, "note": request.note},
        request=http_request,
    )

    db.commit()
    db.refresh(profile)

    # Envoyer une notification au candidat si demandé
    if request.send_notification:
        try:
            notification_messages = {
                CandidateStatus.QCM_PENDING: "Le QCM est maintenant disponible ! Connectez-vous pour le passer.",
                CandidateStatus.REGIONAL_SELECTED: "Félicitations ! Vous êtes sélectionné pour la formation régionale.",
                CandidateStatus.BOOTCAMP_SELECTED: "Félicitations ! Vous participez au bootcamp national.",
                CandidateStatus.NATIONAL_FINALIST: "BRAVO ! Vous êtes l'un des 4 finalistes nationaux !",
                CandidateStatus.REJECTED: "Malheureusement, vous n'avez pas été retenu pour cette étape."
            }

            message = notification_messages.get(
                request.new_status,
                f"Votre statut a été mis à jour : {request.new_status.value}"
            )

            await send_notification_email(
                profile.user.email,
                f"{profile.user.first_name} {profile.user.last_name}",
                "Mise à jour de votre candidature",
                message
            )
        except Exception as e:
            logger.error(f"Erreur envoi notification: {str(e)}")

    logger.info(
        f"Statut du candidat {candidate_id} changé de {old_status} à {request.new_status} "
        f"par l'admin {current_admin.email}"
    )

    return {
        "message": "Statut mis à jour avec succès",
        "old_status": old_status,
        "new_status": request.new_status
    }


@router.post("/candidates/bulk-update-status")
async def bulk_update_status(
    request: BulkStatusUpdateRequest,
    http_request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mise à jour en masse du statut de plusieurs candidats

    Utile pour:
    - Ouvrir le QCM à tous les candidats inscrits
    - Sélectionner plusieurs candidats pour une étape
    - Rejeter plusieurs candidats en une fois
    """
    if not request.candidate_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun candidat spécifié"
        )

    # Mettre à jour tous les candidats
    updated_count = 0
    for candidate_id in request.candidate_ids:
        profile = db.query(CandidateProfile).filter(
            CandidateProfile.id == candidate_id
        ).first()

        if profile:
            profile.status = request.new_status
            updated_count += 1

            # Envoyer notification si demandé
            if request.send_notification:
                try:
                    await send_notification_email(
                        profile.user.email,
                        f"{profile.user.first_name} {profile.user.last_name}",
                        "Mise à jour de votre candidature",
                        f"Votre statut a été mis à jour : {request.new_status.value}"
                    )
                except Exception as e:
                    logger.error(f"Erreur envoi notification pour {candidate_id}: {str(e)}")

    log_audit(
        db=db, admin=current_admin,
        action="bulk_update_status",
        resource_type="candidate",
        details={"candidate_ids": request.candidate_ids, "new_status": request.new_status.value, "updated_count": updated_count},
        request=http_request,
    )

    db.commit()

    logger.info(
        f"Mise à jour en masse de {updated_count} candidats vers {request.new_status} "
        f"par l'admin {current_admin.email}"
    )

    return {
        "message": f"{updated_count} candidats mis à jour avec succès",
        "updated_count": updated_count
    }


@router.get("/candidates/{candidate_id}/export")
async def export_candidate_data(
    candidate_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Exporter les données d'un candidat au format JSON

    Utile pour:
    - Archivage
    - Analyse externe
    - Conformité RGPD (droit à la portabilité)
    """
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.id == candidate_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidat non trouvé"
        )

    # Construire l'export normalisé
    export_data = {
        "user": {
            "id": profile.user.id,
            "email": profile.user.email,
            "first_name": profile.user.first_name,
            "last_name": profile.user.last_name,
            "is_verified": profile.user.is_verified,
            "created_at": profile.user.created_at,
            "updated_at": profile.user.updated_at
        },
        "profile": {
            "id": profile.id,
            "date_of_birth": str(profile.date_of_birth) if profile.date_of_birth else None,
            "gender": profile.gender.value if profile.gender else None,
            "phone": profile.phone,
            "address": profile.address,
            "photo_url": profile.photo_url,
            "school": {
                "name": profile.school_ref.name,
                "city": profile.school_ref.city,
                "region": profile.school_ref.region
            } if profile.school_ref else None,
            "grade": profile.grade,
            "status": profile.status.value,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at
        },
        "parent_contact": {
            "name": profile.parent_contact.name,
            "phone": profile.parent_contact.phone,
            "email": profile.parent_contact.email
        } if profile.parent_contact else None,
        "academic_records": [
            {
                "trimester": record.trimester,
                "average": record.average
            }
            for record in profile.academic_records
        ],
        "subject_scores": [
            {
                "subject": score.subject,
                "score": score.score
            }
            for score in profile.subject_scores
        ],
        "qcm_result": {
            "score": profile.qcm_result.score,
            "time_spent": profile.qcm_result.time_spent,
            "completed_at": profile.qcm_result.completed_at
        } if profile.qcm_result else None,
        "bulletins": [
            {
                "file_url": bulletin.file_url,
                "trimester": bulletin.trimester,
                "label": bulletin.label
            }
            for bulletin in profile.bulletins
        ]
    }

    return export_data


@router.delete("/candidates/{candidate_id}")
async def delete_candidate(
    candidate_id: str,
    http_request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer définitivement un candidat

    ATTENTION: Cette action est irréversible !
    Utilisez plutôt le statut REJECTED pour désactiver un candidat.

    Réservé aux super admins pour les cas de:
    - Doublons
    - Demandes de suppression RGPD
    - Comptes frauduleux
    """
    # Vérifier que c'est un super admin
    if current_admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les super admins peuvent supprimer des candidats"
        )

    profile = db.query(CandidateProfile).filter(
        CandidateProfile.id == candidate_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidat non trouvé"
        )

    user_email = profile.user.email
    candidate_name = f"{profile.user.first_name} {profile.user.last_name}"

    log_audit(
        db=db, admin=current_admin,
        action="delete_candidate",
        resource_type="candidate",
        resource_id=candidate_id,
        resource_label=candidate_name,
        details={"email": user_email},
        request=http_request,
    )

    # Supprimer le profil et l'utilisateur (cascade)
    db.delete(profile.user)
    db.commit()

    logger.warning(
        f"Candidat {candidate_id} ({user_email}) supprimé définitivement "
        f"par le super admin {current_admin.email}"
    )

    return {"message": "Candidat supprimé définitivement"}


# ================================================================================
# Section: Gestion des Utilisateurs Admin
# ================================================================================

@router.get("/users")
async def list_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100000),  # Augmenté pour permettre l'export complet des données
    role: Optional[UserRole] = None,
    search: Optional[str] = None
):
    """
    Liste tous les utilisateurs (admins et candidats)

    Filtres:
    - role: Filtrer par rôle (CANDIDATE, ADMIN, SUPER_ADMIN)
    - search: Recherche par nom ou email
    """
    query = db.query(User)

    # Filtre par rôle
    if role:
        query = query.filter(User.role == role)

    # Recherche
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.first_name.ilike(search_pattern)) |
            (User.last_name.ilike(search_pattern)) |
            (User.email.ilike(search_pattern))
        )

    # Pagination
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "role": user.role.value,
            "isActive": user.is_active,
            "isVerified": user.is_verified,
            "createdAt": user.created_at,
            "updatedAt": user.updated_at
        }
        for user in users
    ]


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    request: dict,
    http_request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Créer un nouvel utilisateur (admin ou candidat)

    Seuls les super admins peuvent créer d'autres admins.
    """
    # Vérifier que l'email n'existe pas déjà
    existing_user = db.query(User).filter(User.email == request.get("email")).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )

    # Vérifier les permissions pour créer un admin
    requested_role = UserRole(request.get("role", "CANDIDATE"))
    if requested_role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        if current_admin.role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les super admins peuvent créer des administrateurs"
            )

    # Créer l'utilisateur
    from app.core.security import get_password_hash
    new_user = User(
        email=request.get("email"),
        hashed_password=get_password_hash(request.get("password", "Password123!")),
        first_name=request.get("firstName"),
        last_name=request.get("lastName"),
        role=requested_role,
        is_verified=request.get("isVerified", False),
        is_active=request.get("isActive", True)
    )

    db.add(new_user)
    log_audit(
        db=db, admin=current_admin,
        action="create_user",
        resource_type="user",
        resource_label=f"{new_user.first_name} {new_user.last_name}",
        details={"email": new_user.email, "role": new_user.role.value},
        request=http_request,
    )
    db.commit()
    db.refresh(new_user)

    logger.info(f"Utilisateur {new_user.email} créé par {current_admin.email}")

    return {
        "id": new_user.id,
        "email": new_user.email,
        "firstName": new_user.first_name,
        "lastName": new_user.last_name,
        "role": new_user.role.value,
        "isActive": new_user.is_active,
        "isVerified": new_user.is_verified,
        "createdAt": new_user.created_at
    }


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    request: dict,
    http_request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour un utilisateur existant
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    # Vérifier les permissions pour modifier un admin
    if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        if current_admin.role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les super admins peuvent modifier des administrateurs"
            )

    # Mettre à jour les champs
    if "firstName" in request:
        user.first_name = request["firstName"]
    if "lastName" in request:
        user.last_name = request["lastName"]
    if "email" in request:
        # Vérifier l'unicité
        existing = db.query(User).filter(
            User.email == request["email"],
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
        user.email = request["email"]

    if "role" in request and current_admin.role == UserRole.SUPER_ADMIN:
        user.role = UserRole(request["role"])

    log_audit(
        db=db, admin=current_admin,
        action="update_user",
        resource_type="user",
        resource_id=user_id,
        resource_label=f"{user.first_name} {user.last_name}",
        details={"email": user.email, "fields_updated": list(request.keys())},
        request=http_request,
    )
    db.commit()
    db.refresh(user)

    logger.info(f"Utilisateur {user.email} modifié par {current_admin.email}")

    return {
        "id": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "role": user.role.value,
        "isActive": user.is_active,
        "isVerified": user.is_verified,
        "updatedAt": user.updated_at
    }


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    request: dict,
    http_request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Activer/désactiver un utilisateur
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    # Vérifier les permissions
    if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        if current_admin.role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les super admins peuvent désactiver des administrateurs"
            )

    # Empêcher de se désactiver soi-même
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas désactiver votre propre compte"
        )

    user.is_active = request.get("isActive", True)
    log_audit(
        db=db, admin=current_admin,
        action="toggle_user_status",
        resource_type="user",
        resource_id=user_id,
        resource_label=f"{user.first_name} {user.last_name}",
        details={"email": user.email, "is_active": user.is_active},
        request=http_request,
    )
    db.commit()

    logger.info(
        f"Statut de {user.email} changé à {'actif' if user.is_active else 'inactif'} "
        f"par {current_admin.email}"
    )

    return {
        "message": f"Utilisateur {'activé' if user.is_active else 'désactivé'} avec succès",
        "isActive": user.is_active
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    http_request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Supprimer définitivement un utilisateur

    ATTENTION: Action irréversible !
    Réservé aux super admins.
    """
    if current_admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les super admins peuvent supprimer des utilisateurs"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    # Empêcher de se supprimer soi-même
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )

    user_email = user.email
    user_name = f"{user.first_name} {user.last_name}"
    log_audit(
        db=db, admin=current_admin,
        action="delete_user",
        resource_type="user",
        resource_id=user_id,
        resource_label=user_name,
        details={"email": user_email, "role": user.role.value},
        request=http_request,
    )
    db.delete(user)
    db.commit()

    logger.warning(
        f"Utilisateur {user_email} supprimé définitivement par {current_admin.email}"
    )

    return {"message": "Utilisateur supprimé définitivement"}


# ================================================================================
# Section: Journal d'Audit
# ================================================================================

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    admin_id: Optional[str] = None,
):
    """
    Récupérer le journal d'audit des actions admin.
    Retourne les entrées les plus récentes en premier.
    """
    query = db.query(AuditLog)

    if action:
        query = query.filter(AuditLog.action == action)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    if admin_id:
        query = query.filter(AuditLog.admin_id == admin_id)

    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs

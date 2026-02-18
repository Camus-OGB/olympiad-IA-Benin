"""
Endpoints pour l'espace candidat - Section 3: Espace Candidat
Adaptés à la structure 3FN
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, selectinload
from typing import Optional
from datetime import date, datetime
import logging

from app.db.session import get_db
from app.models.user import User
from app.models.candidate_profile import (
    CandidateProfile, ParentContact, AcademicRecord,
    SubjectScore, QCMResult, Bulletin, School, CandidateStatus
)
from app.schemas.candidate import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    CandidateDashboard,
    UploadResponse,
    ParentContactCreate,
    AcademicRecordCreate,
    SubjectScoreCreate,
    SchoolCreate,
    SchoolResponse
)
from app.utils.deps import get_current_verified_user
from app.services.storage_service import StorageService
from app.core.upload_config import (
    MAX_PHOTO_SIZE,
    MAX_BULLETIN_SIZE,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    MAX_BULLETINS_PER_CANDIDATE,
    validate_file_size,
    validate_mime_type
)

router = APIRouter()
logger = logging.getLogger(__name__)
storage_service = StorageService()


@router.get("/me/profile", response_model=CandidateProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer le profil du candidat connecté - Section 3.2: Profil candidat
    """
    profile = db.query(CandidateProfile).options(
        selectinload(CandidateProfile.school_ref),
        selectinload(CandidateProfile.parent_contact),
        selectinload(CandidateProfile.academic_records),
        selectinload(CandidateProfile.subject_scores),
        selectinload(CandidateProfile.qcm_result),
        selectinload(CandidateProfile.bulletins)
    ).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé"
        )

    return profile


@router.put("/me/profile", response_model=CandidateProfileResponse)
async def update_my_profile(
    profile_update: CandidateProfileUpdate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour le profil du candidat - Section 3.2: Profil candidat

    Permet de mettre à jour:
    - Informations personnelles (date de naissance, genre, téléphone, adresse)
    - Informations scolaires (établissement, classe)
    - Contact parent/tuteur
    - Moyennes trimestrielles
    - Notes par matière
    """
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé"
        )

    # Vérifier si le profil est verrouillé (validé par l'admin)
    locked_statuses = [
        CandidateStatus.QCM_PENDING,
        CandidateStatus.QCM_COMPLETED,
        CandidateStatus.REGIONAL_SELECTED,
        CandidateStatus.BOOTCAMP_SELECTED,
        CandidateStatus.NATIONAL_FINALIST
    ]
    if profile.status in locked_statuses:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre profil a été validé et ne peut plus être modifié. Contactez l'administration pour toute modification."
        )

    # Mettre à jour les champs directs du profil
    update_data = profile_update.model_dump(
        exclude_unset=True,
        exclude={"parent_contact", "academic_records", "subject_scores"}
    )
    for field, value in update_data.items():
        setattr(profile, field, value)

    # Gérer le contact parent
    if profile_update.parent_contact is not None:
        parent_data = profile_update.parent_contact
        if profile.parent_contact:
            # Mise à jour
            profile.parent_contact.name = parent_data.name
            profile.parent_contact.phone = parent_data.phone
            profile.parent_contact.email = parent_data.email
        else:
            # Création
            new_parent = ParentContact(
                candidate_id=profile.id,
                name=parent_data.name,
                phone=parent_data.phone,
                email=parent_data.email
            )
            db.add(new_parent)

    # Gérer les relevés trimestriels
    if profile_update.academic_records is not None:
        # Supprimer les anciens et recréer
        db.query(AcademicRecord).filter(
            AcademicRecord.candidate_id == profile.id
        ).delete()
        for record in profile_update.academic_records:
            new_record = AcademicRecord(
                candidate_id=profile.id,
                trimester=record.trimester,
                average=record.average
            )
            db.add(new_record)

    # Gérer les notes par matière
    if profile_update.subject_scores is not None:
        # Supprimer les anciennes et recréer
        db.query(SubjectScore).filter(
            SubjectScore.candidate_id == profile.id
        ).delete()
        for score in profile_update.subject_scores:
            new_score = SubjectScore(
                candidate_id=profile.id,
                subject=score.subject,
                score=score.score
            )
            db.add(new_score)

    db.commit()
    db.refresh(profile)

    return profile


@router.post("/me/photo", response_model=UploadResponse)
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Upload de la photo d'identité - Section 3.2: Profil candidat

    Restrictions:
    - Format: JPEG, PNG uniquement
    - Taille max: 5 MB
    - Le frontend doit gérer le recadrage avant l'upload
    """
    # Vérifier le type MIME
    if not validate_mime_type(file.content_type, ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format de fichier non supporté. Formats autorisés : {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Lire le fichier pour vérifier la taille
    file_content = await file.read()
    file_size = len(file_content)

    # Vérifier la taille
    if not validate_file_size(file_size, MAX_PHOTO_SIZE):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Fichier trop volumineux. Taille max : {MAX_PHOTO_SIZE / (1024*1024):.0f} MB"
        )

    # Réinitialiser le pointeur du fichier
    await file.seek(0)

    # Upload vers Supabase
    photo_url = await storage_service.upload_photo(file, current_user.id)

    if not photo_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'upload de la photo"
        )

    # Mettre à jour le profil
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé"
        )

    # Vérifier si le profil est verrouillé
    locked_statuses = [
        CandidateStatus.QCM_PENDING,
        CandidateStatus.QCM_COMPLETED,
        CandidateStatus.REGIONAL_SELECTED,
        CandidateStatus.BOOTCAMP_SELECTED,
        CandidateStatus.NATIONAL_FINALIST
    ]
    if profile.status in locked_statuses:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre profil a été validé et ne peut plus être modifié"
        )

    profile.photo_url = photo_url
    db.commit()

    return {"file_url": photo_url}


@router.post("/me/bulletins", response_model=UploadResponse)
async def upload_bulletin(
    file: UploadFile = File(...),
    trimester: Optional[int] = None,
    label: Optional[str] = None,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Upload d'un bulletin scolaire - Section 3.2: Profil candidat

    Restrictions:
    - Format: PDF uniquement
    - Taille max: 10 MB
    - Maximum 3 bulletins par candidat
    """
    # Récupérer le profil pour vérifier le nombre de bulletins
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé"
        )

    # Vérifier si le profil est verrouillé
    locked_statuses = [
        CandidateStatus.QCM_PENDING,
        CandidateStatus.QCM_COMPLETED,
        CandidateStatus.REGIONAL_SELECTED,
        CandidateStatus.BOOTCAMP_SELECTED,
        CandidateStatus.NATIONAL_FINALIST
    ]
    if profile.status in locked_statuses:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre profil a été validé et ne peut plus être modifié"
        )

    # Vérifier le nombre de bulletins existants
    bulletin_count = db.query(Bulletin).filter(
        Bulletin.candidate_id == profile.id
    ).count()

    if bulletin_count >= MAX_BULLETINS_PER_CANDIDATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_BULLETINS_PER_CANDIDATE} bulletins autorisés"
        )

    # Vérifier le type MIME
    if not validate_mime_type(file.content_type, ALLOWED_DOCUMENT_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format de fichier non supporté. Formats autorisés : {', '.join(ALLOWED_DOCUMENT_TYPES)}"
        )

    # Lire le fichier pour vérifier la taille
    file_content = await file.read()
    file_size = len(file_content)

    # Vérifier la taille
    if not validate_file_size(file_size, MAX_BULLETIN_SIZE):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Fichier trop volumineux. Taille max : {MAX_BULLETIN_SIZE / (1024*1024):.0f} MB"
        )

    # Réinitialiser le pointeur du fichier
    await file.seek(0)

    # Upload vers Supabase
    bulletin_url = await storage_service.upload_bulletin(file, current_user.id)

    if not bulletin_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'upload du bulletin"
        )

    # Créer l'entrée bulletin en base
    new_bulletin = Bulletin(
        candidate_id=profile.id,
        file_url=bulletin_url,
        trimester=trimester,
        label=label
    )
    db.add(new_bulletin)
    db.commit()
    db.refresh(new_bulletin)

    return {"file_url": bulletin_url, "bulletin_id": new_bulletin.id}


@router.delete("/me/bulletins/{bulletin_id}")
async def delete_bulletin(
    bulletin_id: str,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer un bulletin par son ID
    """
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé"
        )

    bulletin = db.query(Bulletin).filter(
        Bulletin.id == bulletin_id,
        Bulletin.candidate_id == profile.id
    ).first()

    if not bulletin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bulletin non trouvé"
        )

    db.delete(bulletin)
    db.commit()

    return {"message": "Bulletin supprimé avec succès"}


@router.get("/me/dashboard", response_model=CandidateDashboard)
async def get_my_dashboard(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Tableau de bord du candidat - Section 3.4: Tableau de bord

    Affiche:
    - Statut actuel dans le processus de sélection
    - Étapes franchies et prochaines étapes
    - Score QCM si complété
    - Notifications et messages importants
    """
    profile = db.query(CandidateProfile).options(
        selectinload(CandidateProfile.school_ref),
        selectinload(CandidateProfile.parent_contact),
        selectinload(CandidateProfile.academic_records),
        selectinload(CandidateProfile.subject_scores),
        selectinload(CandidateProfile.qcm_result),
        selectinload(CandidateProfile.bulletins)
    ).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil non trouvé"
        )

    # Déterminer la progression
    progress_percentage = 0
    next_steps = []

    # Calculer le pourcentage de complétion du profil
    profile_fields = [
        profile.date_of_birth,
        profile.gender,
        profile.phone,
        profile.address,
        profile.photo_url,
        profile.school_id,
        profile.grade,
    ]

    # Vérifier si le candidat est majeur (18 ans ou plus)
    def is_candidate_majeur() -> bool:
        if not profile.date_of_birth:
            return False
        try:
            if isinstance(profile.date_of_birth, str):
                birth_date = datetime.strptime(profile.date_of_birth, "%Y-%m-%d").date()
            else:
                birth_date = profile.date_of_birth
            today = date.today()
            age = today.year - birth_date.year
            if (today.month, today.day) < (birth_date.month, birth_date.day):
                age -= 1
            return age >= 18
        except (ValueError, TypeError):
            return False

    candidat_is_majeur = is_candidate_majeur()

    # Vérifier les sous-entités
    has_parent_contact = profile.parent_contact is not None
    has_academic_records = len(profile.academic_records) > 0
    has_subject_scores = len(profile.subject_scores) > 0
    has_bulletins = len(profile.bulletins) > 0

    completed_fields = sum(1 for field in profile_fields if field)

    # Parent/tuteur obligatoire uniquement si mineur
    if not candidat_is_majeur:
        completed_fields += sum([has_parent_contact, has_academic_records, has_subject_scores, has_bulletins])
        total_fields = len(profile_fields) + 4  # +4 pour parent, academic, subject, bulletins
    else:
        completed_fields += sum([has_academic_records, has_subject_scores, has_bulletins])
        total_fields = len(profile_fields) + 3  # +3 pour academic, subject, bulletins (sans parent)

    profile_completion = (completed_fields / total_fields) * 100

    # Messages basés sur le statut
    if profile.status == CandidateStatus.REGISTERED:
        progress_percentage = 20
        next_steps = [
            "Complétez votre profil (informations personnelles et scolaires)",
            "Uploadez votre photo d'identité",
            "Uploadez vos bulletins scolaires",
            "Attendez l'ouverture du QCM"
        ]
    elif profile.status == CandidateStatus.QCM_PENDING:
        progress_percentage = 40
        next_steps = [
            "Le QCM est disponible !",
            "Vous avez un temps limité pour le compléter",
            "Assurez-vous d'être dans un environnement calme"
        ]
    elif profile.status == CandidateStatus.QCM_COMPLETED:
        progress_percentage = 60
        next_steps = [
            "QCM complété avec succès",
            "Les résultats sont en cours d'analyse",
            "Vous serez notifié des résultats prochainement"
        ]
    elif profile.status == CandidateStatus.REGIONAL_SELECTED:
        progress_percentage = 75
        next_steps = [
            "Félicitations ! Vous êtes sélectionné pour la formation régionale",
            "Consultez vos emails pour les détails de la formation",
            "Préparez-vous pour le bootcamp national"
        ]
    elif profile.status == CandidateStatus.BOOTCAMP_SELECTED:
        progress_percentage = 90
        next_steps = [
            "Félicitations ! Vous participez au bootcamp national",
            "Vous êtes parmi les meilleurs candidats du pays",
            "Préparez-vous pour la sélection finale"
        ]
    elif profile.status == CandidateStatus.NATIONAL_FINALIST:
        progress_percentage = 100
        next_steps = [
            "BRAVO ! Vous faites partie des 4 finalistes nationaux",
            "Vous représenterez le Bénin aux Olympiades Internationales d'IA",
            "Consultez votre email pour les prochaines étapes"
        ]
    elif profile.status == CandidateStatus.REJECTED:
        progress_percentage = 100
        next_steps = [
            "Malheureusement, vous n'avez pas été retenu pour cette édition",
            "Ne vous découragez pas ! Vous pouvez participer l'année prochaine",
            "Continuez à développer vos compétences en IA"
        ]

    # Notifications
    notifications = []
    if not profile.photo_url:
        notifications.append("Veuillez uploader votre photo d'identité")
    if not has_bulletins:
        notifications.append("Veuillez uploader vos bulletins scolaires")
    if profile_completion < 80:
        notifications.append(f"Profil complété à {profile_completion:.0f}% - complétez votre profil")

    return {
        "user": current_user,
        "profile": profile,
        "progress_percentage": progress_percentage,
        "next_steps": next_steps,
        "notifications": notifications,
        "profile_completion": round(profile_completion, 1)
    }


@router.post("/schools", response_model=SchoolResponse)
async def create_or_get_school(
    school_data: SchoolCreate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    Créer une école ou récupérer une école existante par nom

    Si une école avec le même nom existe déjà, elle est retournée
    (et ses champs city/region sont mis à jour si fournis).
    Sinon, une nouvelle école est créée.
    """
    # Chercher si l'école existe déjà
    existing_school = db.query(School).filter(
        School.name == school_data.name
    ).first()

    if existing_school:
        # Mettre à jour la région/ville si fournie et différente
        updated = False
        if school_data.region and existing_school.region != school_data.region:
            existing_school.region = school_data.region
            updated = True
        if school_data.city and existing_school.city != school_data.city:
            existing_school.city = school_data.city
            updated = True
        if updated:
            db.commit()
            db.refresh(existing_school)
        return existing_school

    # Créer une nouvelle école
    new_school = School(
        name=school_data.name,
        city=school_data.city,
        region=school_data.region
    )

    db.add(new_school)
    db.commit()
    db.refresh(new_school)

    return new_school

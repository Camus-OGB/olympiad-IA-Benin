"""
Schémas Pydantic pour validation des données
"""
from app.schemas.user import (
    LoginRequest,
    RegisterRequest,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserResponse,
    AuthResponse,
    MessageResponse,
    UserUpdate,
    PasswordChange,
)

from app.schemas.candidate import (
    CandidateProfileUpdate,
    CandidateProfileResponse,
    CandidateDashboard,
    UploadResponse,
)

from app.schemas.content import (
    NewsCreate,
    NewsUpdate,
    NewsResponse,
    FAQCreate,
    FAQUpdate,
    FAQResponse,
    EditionCreate,
    EditionUpdate,
    EditionResponse,
    PastEditionCreate,
    PastEditionUpdate,
    PastEditionResponse,
    PartnerCreate,
    PartnerUpdate,
    PartnerResponse,
    PageCreate,
    PageUpdate,
    PageResponse,
)

from app.schemas.admin import (
    DashboardStats,
    CandidateListItem,
    CandidateListResponse,
    CandidateDetailResponse,
    CandidateStatusUpdate,
    BulkActionRequest,
    ExportRequest,
)

from app.schemas.qcm import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    QuestionForCandidate,
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionForCandidate,
    AttemptResponse,
    SubmitAnswerRequest,
    CompleteAttemptResponse,
    AttemptDetailResponse,
    QCMStatsResponse,
)

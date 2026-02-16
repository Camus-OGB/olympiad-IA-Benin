/**
 * Types Profile — ré-exportés depuis candidate API pour compatibilité
 */
export type {
  CandidateProfile,
  CandidateProfileUpdate,
  CandidateStatus,
  Gender,
  ParentContact,
  AcademicRecord,
  SubjectScore,
  QCMResult,
  Bulletin,
  SchoolInfo,
  CandidateDashboard,
  UploadResponse,
} from '@/lib/api/candidate'

/**
 * Données du formulaire de profil — utilisé dans les composants du formulaire
 */
export interface ProfileFormData {
  dateOfBirth?: string
  gender?: 'M' | 'F'
  phone?: string
  address?: string
  schoolId?: string
  grade?: string
  parentContact?: {
    name: string
    phone?: string
    email?: string
  }
  academicRecords?: {
    trimester: number
    average: number
  }[]
  subjectScores?: {
    subject: string
    score: number
  }[]
}

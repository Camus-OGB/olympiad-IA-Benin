// Re-export user types
export * from './user'

// Re-export QCM types
export * from './qcm'

// Re-export API types
export * from './api'

// Re-export profile types (excluding QCMResult which is already in qcm.ts)
export type {
  CandidateProfile,
  CandidateProfileUpdate,
  CandidateStatus,
  Gender,
  ParentContact,
  AcademicRecord,
  SubjectScore,
  Bulletin,
  SchoolInfo,
  CandidateDashboard,
  UploadResponse,
  ProfileFormData,
} from './profile'

// Re-export content types from the API module
export type {
  NewsItem,
  FAQItem,
  Edition,
  PastEdition,
  Partner,
  Page,
  TimelinePhase,
  Testimonial,
  Achievement,
  GalleryImage,
} from '@/lib/api/content'

// Public website types
export interface NavItem {
  label: string
  path: string
}

export interface TimelineEvent {
  year: string
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
}

export interface Stat {
  label: string
  value: number
  suffix?: string
}

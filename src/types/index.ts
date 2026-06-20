// ── Core Domain Types ─────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'branch_admin'
  | 'sales'
  | 'teacher'
  | 'coordinator'
  | 'finance'
  | 'parent'
  | 'student'
  | 'ai_tutor';

export type Curriculum = 'IGCSE' | 'A-Level' | 'CBSE' | 'IB' | 'American';

export type Emirate = 'Dubai' | 'Sharjah' | 'Abu Dhabi' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah';

export type BranchStatus = 'active' | 'inactive' | 'coming_soon';

// Enrichment / test-prep offerings — distinct from graded academic Curriculum above,
// since these aren't percentage-graded the same way (skill-based or band/score-based).
export type ProgrammeType = 'Robotics' | 'Brainobrain' | 'Oratory' | 'IELTS' | 'SAT' | 'NEET-JEE' | 'Languages';

export type Subject =
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Mathematics'
  | 'English'
  | 'Business Studies'
  | 'Accounting'
  | 'Computer Science'
  | 'Economics'
  | 'History'
  | 'Geography'
  | 'Arabic'
  | 'French';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type LeadStatus = 'new' | 'contacted' | 'trial_scheduled' | 'trial_done' | 'enrolled' | 'lost';
export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'waived' | 'partial';
export type HomeworkStatus = 'assigned' | 'submitted' | 'graded' | 'missing';
export type BatchStatus = 'active' | 'inactive' | 'full' | 'upcoming';

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  employeeId?: string;
  joinDate?: string;
}

// ── Branch ────────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  emirate?: Emirate;
  phone: string;
  whatsappNumber?: string;
  email: string;
  adminId?: string;
  managerId?: string;
  isActive: boolean;
  status?: BranchStatus;
  capacity: number;
  establishedYear: number;
}

// ── Student ───────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  parentId?: string;
  branchId: string;
  curriculum: Curriculum;
  grade: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  xp: number;
  streak: number;
  planet: PlanetLevel;
  subjects: Subject[];
  batchIds: string[];
  dateOfBirth?: string;
  nationality?: string;
  gender?: 'Male' | 'Female' | 'Other';
  previousSchool?: string;
  notes?: string;
}

export type PlanetLevel = 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Neptune' | 'Pluto';

export const PLANET_ORDER: PlanetLevel[] = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Pluto'];

export const PLANET_XP_THRESHOLDS: Record<PlanetLevel, number> = {
  Mercury: 0,
  Venus: 500,
  Earth: 1200,
  Mars: 2500,
  Jupiter: 5000,
  Saturn: 8500,
  Neptune: 13000,
  Pluto: 20000,
};

// ── Teacher ───────────────────────────────────────────────────────────────────

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  branchId: string;
  subjects: Subject[];
  curriculums: Curriculum[];
  teachingAreas?: string[];
  maxClassesPerWeek?: number;
  qualification: string;
  experience: number;
  rating: number;
  isActive: boolean;
  avatar?: string;
  batchIds: string[];
}

// ── Parent ────────────────────────────────────────────────────────────────────

export interface Parent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  studentIds: string[];
  branchId?: string;
  relationship?: string;
}

// ── Batch ─────────────────────────────────────────────────────────────────────

export interface Batch {
  id: string;
  name: string;
  branchId: string;
  teacherId: string;
  subject: Subject;
  curriculum: Curriculum;
  grade: string;
  studentIds: string[];
  maxCapacity: number;
  schedule: Schedule[];
  status: BatchStatus;
  room?: string;
  startDate: string;
  endDate?: string;
}

export interface Schedule {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  startTime: string;
  endTime: string;
}

// ── Attendance ─────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  batchId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  note?: string;
}

// ── Homework ──────────────────────────────────────────────────────────────────

export interface Homework {
  id: string;
  batchId: string;
  teacherId: string;
  title: string;
  description: string;
  subject: Subject;
  dueDate: string;
  assignedDate: string;
  status: HomeworkStatus;
  maxMarks: number;
  attachments?: string[];
  submissions: HomeworkSubmission[];
}

export interface HomeworkSubmission {
  studentId: string;
  submittedAt: string;
  marks?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

// ── Assessment ────────────────────────────────────────────────────────────────

export interface Assessment {
  id: string;
  batchId: string;
  teacherId: string;
  title: string;
  subject: Subject;
  curriculum: Curriculum;
  type: 'quiz' | 'test' | 'mock_exam' | 'assignment';
  date: string;
  maxMarks: number;
  duration: number;
  results: AssessmentResult[];
  status: 'upcoming' | 'completed' | 'graded';
  syllabusTopics?: string[];
}

export interface AssessmentResult {
  studentId: string;
  marks: number;
  percentage: number;
  grade: string;
  feedback?: string;
}

// ── Lead ──────────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentName: string;
  studentAge?: number;
  curriculum: Curriculum;
  preferredProgramme?: string;
  subjects: Subject[];
  grade: string;
  source: 'website' | 'walk_in' | 'referral' | 'social_media' | 'google_ads' | 'whatsapp';
  status: LeadStatus;
  assignedTo?: string;
  branchId: string;
  notes?: string;
  followUpDate?: string;
  trialDate?: string;
  trialTimeSlot?: string;
  dateOfBirth?: string;
  nationality?: string;
  referrerName?: string;
  createdAt: string;
  convertedAt?: string;
  callLog?: { date: string; outcome: string; notes?: string }[];
}

// ── Finance ───────────────────────────────────────────────────────────────────

export interface FeeStructure {
  id: string;
  branchId: string;
  name: string;
  curriculum: Curriculum;
  grade: string;
  subject: Subject;
  monthlyFee: number;
  registrationFee: number;
  currency: 'AED' | 'SAR' | 'USD';
}

export interface Invoice {
  id: string;
  studentId: string;
  parentId: string;
  branchId: string;
  items: InvoiceItem[];
  totalAmount: number;
  currency: 'AED' | 'SAR' | 'USD';
  status: FeeStatus;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'online' | 'cheque';
  invoiceNumber: string;
  paidAmount?: number;
  paymentHistory?: PaymentRecord[];
  notes?: string;
}

export interface PaymentRecord {
  date: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

// ── Message ───────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  subject: string;
  body: string;
  isRead: boolean;
  sentAt: string;
  type: 'message' | 'notification' | 'alert';
}

// ── Meeting ───────────────────────────────────────────────────────────────────

export interface Meeting {
  id: string;
  requestedBy: string;
  teacherId?: string;
  parentId: string;
  studentId?: string;
  branchId: string;
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  agenda?: string;
  notes?: string;
  type: 'parent_teacher' | 'academic_review' | 'counselling';
}

// ── Notification ──────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
  avatar?: string;
  token: string;
}

// ── AI ────────────────────────────────────────────────────────────────────────

export interface AIConversation {
  id: string;
  studentId: string;
  messages: AIMessage[];
  subject?: Subject;
  topic?: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  saved?: boolean;
}

export interface StudyPlan {
  studentId: string;
  subject: Subject;
  weeklyGoal: number;
  topics: StudyTopic[];
  generatedAt: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
}

// ── Achievement ───────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'attendance' | 'academic' | 'streak' | 'homework' | 'special';
}

// ── Campaign ──────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  channel: 'social_media' | 'google_ads' | 'referral' | 'whatsapp' | 'email';
  branchId: string;
  startDate: string;
  endDate?: string;
  budget: number;
  leadsGenerated: number;
  conversions: number;
  status: 'active' | 'paused' | 'ended';
}

// ── Scholarship ───────────────────────────────────────────────────────────────

export interface ScholarshipApplication {
  id: string;
  studentId: string;
  type: 'merit' | 'need_based' | 'sibling' | 'staff';
  requestedPercentage: number;
  approvedPercentage?: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

// ── Branch Request ────────────────────────────────────────────────────────────

export interface BranchRequest {
  id: string;
  branchId: string;
  requestedBy: string;
  type: 'leave' | 'room_booking' | 'parent_request' | 'resource';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  declineReason?: string;
}

// ── Class Note ────────────────────────────────────────────────────────────────
// Shared lesson materials (uploaded by teachers, visible to students in
// Resources). Distinct from LessonLog below, which is the teacher's private
// per-lesson log — they intentionally don't share a data model.

export interface ClassNote {
  id: string;
  batchId: string;
  teacherId: string;
  title: string;
  description?: string;
  subject: Subject;
  fileType: 'pdf' | 'doc' | 'slides' | 'video' | 'link';
  uploadedAt: string;
}

// ── Lesson Log ────────────────────────────────────────────────────────────────
// A teacher's structured record of what happened in a specific class session —
// not visible to students (Private Notes especially), unlike ClassNote above.

export interface LessonLog {
  id: string;
  batchId: string;
  teacherId: string;
  date: string;
  topicCovered: string;
  homeworkId?: string;
  nextClassPlan: string;
  privateNotes?: string;
}

// ── Syllabus Plan ─────────────────────────────────────────────────────────────

export interface SyllabusTopic {
  title: string;
  weekNumber: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface SyllabusPlan {
  id: string;
  batchId: string;
  subject: Subject;
  curriculum: Curriculum;
  term: string;
  topics: SyllabusTopic[];
}

// ── Teacher Review ────────────────────────────────────────────────────────────

export interface TeacherReview {
  id: string;
  teacherId: string;
  reviewerId: string;
  date: string;
  category: 'lesson_observation' | 'peer_review' | 'student_feedback';
  rating: number;
  strengths: string;
  improvements: string;
  status: 'draft' | 'completed';
}

// ── Intervention ──────────────────────────────────────────────────────────────

export interface Intervention {
  id: string;
  studentId: string;
  reason: string;
  type: 'academic' | 'attendance' | 'behavioral';
  startDate: string;
  targetDate: string;
  status: 'active' | 'monitoring' | 'resolved';
  actions: string[];
  ownerId: string;
}

// ── Payment Plan ──────────────────────────────────────────────────────────────

export interface PaymentInstallment {
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface PaymentPlan {
  id: string;
  invoiceId: string;
  studentId: string;
  installments: PaymentInstallment[];
  createdAt: string;
}

// ── Expense ───────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  branchId: string;
  category: 'rent' | 'salaries' | 'utilities' | 'marketing' | 'supplies' | 'maintenance' | 'other';
  description: string;
  amount: number;
  date: string;
  approvedBy?: string;
  vendor?: string;
  receiptFileName?: string;
}

// ── Programme (enrichment / test-prep) ───────────────────────────────────────

export interface Programme {
  id: string;
  name: string;
  type: ProgrammeType;
  branchId: string;
  instructorName: string;
  ageGroup: string;
  studentIds: string[];
  status: 'active' | 'inactive' | 'upcoming';
}

// ── Go-Live Configuration ────────────────────────────────────────────────────
// NOTE: this is demo-only configuration storage (persisted to localStorage,
// unencrypted). Never enter real production secrets here — see GoLivePage.

export interface GoLiveConfig {
  stripeKey: string;
  stripePublic: string;
  s3Bucket: string;
  s3Region: string;
  s3AccessKey: string;
  sendgridKey: string;
  fromEmail: string;
  fromName: string;
  wapiToken: string;
  wapiPhoneId: string;
  anthropicKey: string;
  openaiKey: string;
  privacyUrl: string;
  termsUrl: string;
  refundUrl: string;
  studentProApiKey: string;
  studentProSyncEnabled: boolean;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface SystemSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  currency: 'AED' | 'SAR' | 'USD';
  timezone: string;
  academicYear: string;
  vatNumber?: string;
  vatRate: number;
  paymentGateway?: string;
  emailProvider?: string;
  whatsappEnabled: boolean;
  aiProvider?: string;
  isLive: boolean;
  primaryColor?: string;
  currentTerm?: string;
  mode: 'demo' | 'live';
  // Bank transfer details shown to parents on the Pay Now screen — left unset until
  // a finance admin fills them in via Setup; the UI shows "Not configured yet" until then.
  bankAccountName?: string;
  bankName?: string;
  bankIban?: string;
  openingHours?: string;
}

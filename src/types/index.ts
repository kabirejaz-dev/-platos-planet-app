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
export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'waived';
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
}

// ── Branch ────────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  adminId?: string;
  isActive: boolean;
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
  subjects: Subject[];
  grade: string;
  source: 'website' | 'walk_in' | 'referral' | 'social_media' | 'google_ads' | 'whatsapp';
  status: LeadStatus;
  assignedTo?: string;
  branchId: string;
  notes?: string;
  followUpDate?: string;
  trialDate?: string;
  createdAt: string;
  convertedAt?: string;
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
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'online';
  invoiceNumber: string;
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
}

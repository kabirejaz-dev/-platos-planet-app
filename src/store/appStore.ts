import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AuthUser, Branch, Student, Teacher, Parent, Batch, AttendanceRecord,
  Homework, HomeworkSubmission, Assessment, Lead, Invoice, Message, Meeting, Notification,
  SystemSettings, AIConversation, Achievement, User,
  Campaign, ScholarshipApplication, AuditLogEntry, BranchRequest, ClassNote,
  SyllabusPlan, TeacherReview, Intervention, PaymentPlan, Expense, StudyPlan,
  GoLiveConfig, Programme, LessonLog, UserRole
} from '@/types';
import { seedData } from '@/data/seed';
import { toast } from '@/hooks/useToast';
import { generateId } from '@/lib/utils';

// Defense-in-depth: which roles may write to each entity domain. This mirrors
// ROLE_PATH_ACCESS in App.tsx, but route guards alone don't stop a logged-in
// user from calling a store action directly (e.g. via devtools console).
const ROLE_ACCESS = {
  branch: ['super_admin', 'branch_admin'],
  student: ['super_admin', 'branch_admin', 'teacher', 'coordinator'],
  teacher: ['super_admin', 'branch_admin'],
  batch: ['super_admin', 'branch_admin'],
  attendance: ['teacher', 'branch_admin'],
  homework: ['teacher'],
  homeworkSubmission: ['student'],
  assessment: ['teacher', 'coordinator'],
  lead: ['sales'],
  invoice: ['finance', 'super_admin'],
  meeting: ['parent', 'teacher', 'coordinator'],
  user: ['super_admin'],
  settings: ['super_admin'],
  campaign: ['sales'],
  scholarship: ['sales', 'super_admin'],
  branchRequest: ['branch_admin', 'teacher', 'parent'],
  classNote: ['teacher'],
  lessonLog: ['teacher'],
  syllabusPlan: ['coordinator'],
  teacherReview: ['coordinator'],
  intervention: ['coordinator'],
  paymentPlan: ['finance'],
  expense: ['finance', 'branch_admin'],
  programme: ['super_admin'],
  goLiveConfig: ['super_admin'],
} satisfies Record<string, UserRole[]>;

function guardRole(get: () => AppState, domain: keyof typeof ROLE_ACCESS): boolean {
  const role = get().currentUser?.role;
  const allowed: UserRole[] = ROLE_ACCESS[domain];
  if (!role || !allowed.includes(role)) {
    toast.error('Not authorized', "You don't have permission to do that.");
    return false;
  }
  return true;
}

function logAudit(
  get: () => AppState,
  set: (fn: (s: AppState) => Partial<AppState>) => void,
  action: string,
  entityType: string,
  details: string,
  severity: AuditLogEntry['severity'] = 'info',
  entityId?: string
) {
  const entry: AuditLogEntry = {
    id: `al-${generateId()}`,
    userId: get().currentUser?.id || 'system',
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
    severity,
  };
  set((s) => ({ auditLog: [entry, ...s.auditLog] }));
}

interface AppState {
  // Auth
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;

  // Data
  users: User[];
  branches: Branch[];
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  batches: Batch[];
  attendance: AttendanceRecord[];
  homework: Homework[];
  assessments: Assessment[];
  leads: Lead[];
  invoices: Invoice[];
  messages: Message[];
  meetings: Meeting[];
  notifications: Notification[];
  conversations: AIConversation[];
  achievements: Achievement[];
  settings: SystemSettings;
  campaigns: Campaign[];
  scholarships: ScholarshipApplication[];
  auditLog: AuditLogEntry[];
  branchRequests: BranchRequest[];
  classNotes: ClassNote[];
  lessonLogs: LessonLog[];
  syllabusPlans: SyllabusPlan[];
  teacherReviews: TeacherReview[];
  interventions: Intervention[];
  paymentPlans: PaymentPlan[];
  expenses: Expense[];
  studyPlans: StudyPlan[];
  goLiveConfig: GoLiveConfig;
  programmes: Programme[];

  // CRUD operations
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;

  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  addParent: (parent: Parent) => void;
  updateParent: (id: string, updates: Partial<Parent>) => void;

  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;

  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;

  addAttendance: (record: AttendanceRecord) => void;
  bulkAddAttendance: (records: AttendanceRecord[]) => void;

  addHomework: (hw: Homework) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;
  submitHomework: (id: string, submission: HomeworkSubmission) => void;

  addAssessment: (a: Assessment) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;

  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;

  addMessage: (msg: Message) => void;
  markMessageRead: (id: string) => void;

  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;

  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  addConversation: (c: AIConversation) => void;
  updateConversation: (id: string, updates: Partial<AIConversation>) => void;

  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  updateSettings: (updates: Partial<SystemSettings>) => void;

  addXP: (studentId: string, amount: number) => void;

  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;

  addScholarship: (s: ScholarshipApplication) => void;
  updateScholarship: (id: string, updates: Partial<ScholarshipApplication>) => void;

  addAuditLog: (entry: AuditLogEntry) => void;

  addBranchRequest: (r: BranchRequest) => void;
  updateBranchRequest: (id: string, updates: Partial<BranchRequest>) => void;

  addClassNote: (note: ClassNote) => void;

  addLessonLog: (log: LessonLog) => void;
  updateLessonLog: (id: string, updates: Partial<LessonLog>) => void;

  addSyllabusPlan: (plan: SyllabusPlan) => void;
  updateSyllabusPlan: (id: string, updates: Partial<SyllabusPlan>) => void;

  addTeacherReview: (review: TeacherReview) => void;
  updateTeacherReview: (id: string, updates: Partial<TeacherReview>) => void;

  addIntervention: (i: Intervention) => void;
  updateIntervention: (id: string, updates: Partial<Intervention>) => void;

  addPaymentPlan: (plan: PaymentPlan) => void;
  updatePaymentPlan: (id: string, updates: Partial<PaymentPlan>) => void;

  addExpense: (expense: Expense) => void;

  addStudyPlan: (plan: StudyPlan) => void;
  updateStudyPlan: (studentId: string, subject: string, updates: Partial<StudyPlan>) => void;

  updateGoLiveConfig: (updates: Partial<GoLiveConfig>) => void;

  addProgramme: (programme: Programme) => void;
  updateProgramme: (id: string, updates: Partial<Programme>) => void;

  importStoreSnapshot: (snapshot: PersistedSlice) => void;
}

// The slice of state that gets persisted to localStorage and round-tripped
// through Export/Import in the Setup Wizard. Kept as one function so both
// uses can never drift out of sync with each other.
function pickPersistedSlice(state: AppState) {
  return {
    currentUser: state.currentUser,
    students: state.students,
    teachers: state.teachers,
    batches: state.batches,
    attendance: state.attendance,
    homework: state.homework,
    assessments: state.assessments,
    leads: state.leads,
    invoices: state.invoices,
    messages: state.messages,
    meetings: state.meetings,
    notifications: state.notifications,
    conversations: state.conversations,
    settings: state.settings,
    users: state.users,
    branches: state.branches,
    parents: state.parents,
    campaigns: state.campaigns,
    scholarships: state.scholarships,
    auditLog: state.auditLog,
    branchRequests: state.branchRequests,
    classNotes: state.classNotes,
    lessonLogs: state.lessonLogs,
    syllabusPlans: state.syllabusPlans,
    teacherReviews: state.teacherReviews,
    interventions: state.interventions,
    paymentPlans: state.paymentPlans,
    expenses: state.expenses,
    studyPlans: state.studyPlans,
    goLiveConfig: state.goLiveConfig,
    programmes: state.programmes,
  };
}
type PersistedSlice = ReturnType<typeof pickPersistedSlice>;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state from seed data
      currentUser: null,
      ...seedData,

      setCurrentUser: (user) => set({ currentUser: user }),

      addBranch: (branch) => {
        if (!guardRole(get, 'branch')) return;
        set((s) => ({ branches: [...s.branches, branch] }));
      },
      updateBranch: (id, updates) => {
        if (!guardRole(get, 'branch')) return;
        set((s) => ({ branches: s.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)) }));
      },

      addStudent: (student) => {
        if (!guardRole(get, 'student')) return;
        set((s) => ({ students: [...s.students, student] }));
        logAudit(get, set, 'Enrolled Student', 'Student', student.name, 'info', student.id);
      },
      updateStudent: (id, updates) => {
        if (!guardRole(get, 'student')) return;
        set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, ...updates } : st)) }));
      },
      addParent: (parent) => {
        if (!guardRole(get, 'student')) return;
        set((s) => ({ parents: [...s.parents, parent] }));
      },
      updateParent: (id, updates) => {
        if (!guardRole(get, 'student')) return;
        set((s) => ({ parents: s.parents.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
      },

      addTeacher: (teacher) => {
        if (!guardRole(get, 'teacher')) return;
        set((s) => ({ teachers: [...s.teachers, teacher] }));
      },
      updateTeacher: (id, updates) => {
        if (!guardRole(get, 'teacher')) return;
        set((s) => ({ teachers: s.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
      },

      addBatch: (batch) => {
        if (!guardRole(get, 'batch')) return;
        set((s) => ({ batches: [...s.batches, batch] }));
      },
      updateBatch: (id, updates) => {
        if (!guardRole(get, 'batch')) return;
        set((s) => ({ batches: s.batches.map((b) => (b.id === id ? { ...b, ...updates } : b)) }));
      },

      addAttendance: (record) => {
        if (!guardRole(get, 'attendance')) return;
        set((s) => ({ attendance: [...s.attendance, record] }));
      },
      bulkAddAttendance: (records) => {
        if (!guardRole(get, 'attendance')) return;
        set((s) => {
          const existingKeys = new Set(s.attendance.map((a) => `${a.batchId}-${a.studentId}-${a.date}`));
          const newRecords = records.filter(
            (r) => !existingKeys.has(`${r.batchId}-${r.studentId}-${r.date}`)
          );
          const updated = [...s.attendance];
          records.forEach((r) => {
            const key = `${r.batchId}-${r.studentId}-${r.date}`;
            const idx = updated.findIndex((a) => `${a.batchId}-${a.studentId}-${a.date}` === key);
            if (idx >= 0) updated[idx] = r;
          });
          return { attendance: [...updated.filter((a) => !records.find((r) => r.id === a.id)), ...newRecords, ...records.filter((r) => existingKeys.has(`${r.batchId}-${r.studentId}-${r.date}`))] };
        });
      },

      addHomework: (hw) => {
        if (!guardRole(get, 'homework')) return;
        set((s) => ({ homework: [...s.homework, hw] }));
      },
      updateHomework: (id, updates) => {
        if (!guardRole(get, 'homework')) return;
        set((s) => ({ homework: s.homework.map((h) => (h.id === id ? { ...h, ...updates } : h)) }));
      },
      submitHomework: (id, submission) => {
        if (!guardRole(get, 'homeworkSubmission')) return;
        set((s) => ({
          homework: s.homework.map((h) =>
            h.id === id
              ? { ...h, submissions: [...h.submissions.filter((sub) => sub.studentId !== submission.studentId), submission] }
              : h
          ),
        }));
      },

      addAssessment: (a) => {
        if (!guardRole(get, 'assessment')) return;
        set((s) => ({ assessments: [...s.assessments, a] }));
      },
      updateAssessment: (id, updates) => {
        if (!guardRole(get, 'assessment')) return;
        set((s) => ({ assessments: s.assessments.map((a) => (a.id === id ? { ...a, ...updates } : a)) }));
      },

      addLead: (lead) => {
        if (!guardRole(get, 'lead')) return;
        set((s) => ({ leads: [...s.leads, lead] }));
      },
      updateLead: (id, updates) => {
        if (!guardRole(get, 'lead')) return;
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)) }));
      },

      addInvoice: (invoice) => {
        if (!guardRole(get, 'invoice')) return;
        set((s) => ({ invoices: [...s.invoices, invoice] }));
      },
      updateInvoice: (id, updates) => {
        if (!guardRole(get, 'invoice')) return;
        set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)) }));
        if (updates.paidAmount !== undefined) {
          const invoice = get().invoices.find((i) => i.id === id);
          logAudit(get, set, 'Recorded Payment', 'Invoice', `${invoice?.invoiceNumber || id} · AED ${updates.paidAmount}`, 'info', id);
        }
      },

      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      markMessageRead: (id) =>
        set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)) })),

      addMeeting: (meeting) => {
        if (!guardRole(get, 'meeting')) return;
        set((s) => ({ meetings: [...s.meetings, meeting] }));
      },
      updateMeeting: (id, updates) => {
        if (!guardRole(get, 'meeting')) return;
        set((s) => ({ meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)) }));
      },

      addNotification: (n) => set((s) => ({ notifications: [...s.notifications, n] })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),

      markAllNotificationsRead: (userId) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)),
        })),

      addConversation: (c) => set((s) => ({ conversations: [...s.conversations, c] })),
      updateConversation: (id, updates) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      addUser: (user) => {
        if (!guardRole(get, 'user')) return;
        set((s) => ({ users: [...s.users, user] }));
        logAudit(get, set, 'Created User Account', 'User', `${user.name} · ${user.role}`, 'info', user.id);
      },
      updateUser: (id, updates) => {
        if (!guardRole(get, 'user')) return;
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)) }));
      },

      updateSettings: (updates) => {
        if (!guardRole(get, 'settings')) return;
        set((s) => ({ settings: { ...s.settings, ...updates } }));
      },

      addXP: (studentId, amount) =>
        set((s) => {
          const students = s.students.map((st) => {
            if (st.id !== studentId) return st;
            const newXP = st.xp + amount;
            const planets: Array<{ level: string; threshold: number }> = [
              { level: 'Pluto', threshold: 20000 },
              { level: 'Neptune', threshold: 13000 },
              { level: 'Saturn', threshold: 8500 },
              { level: 'Jupiter', threshold: 5000 },
              { level: 'Mars', threshold: 2500 },
              { level: 'Earth', threshold: 1200 },
              { level: 'Venus', threshold: 500 },
              { level: 'Mercury', threshold: 0 },
            ];
            const newPlanet = planets.find((p) => newXP >= p.threshold)?.level || 'Mercury';
            return { ...st, xp: newXP, planet: newPlanet as Student['planet'] };
          });
          return { students };
        }),

      addCampaign: (campaign) => {
        if (!guardRole(get, 'campaign')) return;
        set((s) => ({ campaigns: [...s.campaigns, campaign] }));
      },
      updateCampaign: (id, updates) => {
        if (!guardRole(get, 'campaign')) return;
        set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
      },

      addScholarship: (sch) => {
        if (!guardRole(get, 'scholarship')) return;
        set((s) => ({ scholarships: [...s.scholarships, sch] }));
      },
      updateScholarship: (id, updates) => {
        if (!guardRole(get, 'scholarship')) return;
        set((s) => ({ scholarships: s.scholarships.map((sc) => (sc.id === id ? { ...sc, ...updates } : sc)) }));
      },

      addAuditLog: (entry) => set((s) => ({ auditLog: [entry, ...s.auditLog] })),

      addBranchRequest: (r) => {
        if (!guardRole(get, 'branchRequest')) return;
        set((s) => ({ branchRequests: [...s.branchRequests, r] }));
      },
      updateBranchRequest: (id, updates) => {
        if (!guardRole(get, 'branchRequest')) return;
        set((s) => ({ branchRequests: s.branchRequests.map((r) => (r.id === id ? { ...r, ...updates } : r)) }));
        if (updates.status === 'approved' || updates.status === 'rejected') {
          const request = get().branchRequests.find((r) => r.id === id);
          logAudit(get, set, updates.status === 'approved' ? 'Approved Request' : 'Rejected Request', 'BranchRequest', request?.title || id, updates.status === 'rejected' ? 'warning' : 'info', id);
        }
      },

      addClassNote: (note) => {
        if (!guardRole(get, 'classNote')) return;
        set((s) => ({ classNotes: [...s.classNotes, note] }));
      },

      addLessonLog: (log) => {
        if (!guardRole(get, 'lessonLog')) return;
        set((s) => ({ lessonLogs: [...s.lessonLogs, log] }));
      },
      updateLessonLog: (id, updates) => {
        if (!guardRole(get, 'lessonLog')) return;
        set((s) => ({ lessonLogs: s.lessonLogs.map((l) => (l.id === id ? { ...l, ...updates } : l)) }));
      },

      addSyllabusPlan: (plan) => {
        if (!guardRole(get, 'syllabusPlan')) return;
        set((s) => ({ syllabusPlans: [...s.syllabusPlans, plan] }));
      },
      updateSyllabusPlan: (id, updates) => {
        if (!guardRole(get, 'syllabusPlan')) return;
        set((s) => ({ syllabusPlans: s.syllabusPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
      },

      addTeacherReview: (review) => {
        if (!guardRole(get, 'teacherReview')) return;
        set((s) => ({ teacherReviews: [...s.teacherReviews, review] }));
      },
      updateTeacherReview: (id, updates) => {
        if (!guardRole(get, 'teacherReview')) return;
        set((s) => ({ teacherReviews: s.teacherReviews.map((r) => (r.id === id ? { ...r, ...updates } : r)) }));
      },

      addIntervention: (i) => {
        if (!guardRole(get, 'intervention')) return;
        set((s) => ({ interventions: [...s.interventions, i] }));
      },
      updateIntervention: (id, updates) => {
        if (!guardRole(get, 'intervention')) return;
        set((s) => ({ interventions: s.interventions.map((i) => (i.id === id ? { ...i, ...updates } : i)) }));
      },

      addPaymentPlan: (plan) => {
        if (!guardRole(get, 'paymentPlan')) return;
        set((s) => ({ paymentPlans: [...s.paymentPlans, plan] }));
      },
      updatePaymentPlan: (id, updates) => {
        if (!guardRole(get, 'paymentPlan')) return;
        set((s) => ({ paymentPlans: s.paymentPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
      },

      addExpense: (expense) => {
        if (!guardRole(get, 'expense')) return;
        set((s) => ({ expenses: [...s.expenses, expense] }));
        logAudit(get, set, 'Added Expense', 'Expense', `${expense.description} · AED ${expense.amount}`, 'info', expense.id);
      },

      addStudyPlan: (plan) => set((s) => ({ studyPlans: [...s.studyPlans, plan] })),
      updateStudyPlan: (studentId, subject, updates) =>
        set((s) => ({
          studyPlans: s.studyPlans.map((p) =>
            p.studentId === studentId && p.subject === subject ? { ...p, ...updates } : p
          ),
        })),

      updateGoLiveConfig: (updates) => {
        if (!guardRole(get, 'goLiveConfig')) return;
        set((s) => ({ goLiveConfig: { ...s.goLiveConfig, ...updates } }));
      },

      addProgramme: (programme) => {
        if (!guardRole(get, 'programme')) return;
        set((s) => ({ programmes: [...s.programmes, programme] }));
      },
      updateProgramme: (id, updates) => {
        if (!guardRole(get, 'programme')) return;
        set((s) => ({ programmes: s.programmes.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
      },

      importStoreSnapshot: (snapshot) => {
        if (!guardRole(get, 'settings')) return;
        set(() => snapshot);
      },
    }),
    {
      name: 'platos-planet-store',
      version: 7,
      migrate: () => ({ currentUser: null, ...seedData }),
      partialize: pickPersistedSlice,
    }
  )
);

// Exports the same slice of state that gets persisted to localStorage, as a
// JSON string — used for the Setup Wizard's backup/restore and for moving
// data between devices ahead of a future real-backend migration.
export function exportStoreSnapshot(): string {
  return JSON.stringify(pickPersistedSlice(useAppStore.getState()));
}

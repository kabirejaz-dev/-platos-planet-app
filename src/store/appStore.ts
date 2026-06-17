import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AuthUser, Branch, Student, Teacher, Parent, Batch, AttendanceRecord,
  Homework, Assessment, Lead, Invoice, Message, Meeting, Notification,
  SystemSettings, AIConversation, Achievement, User
} from '@/types';
import { seedData } from '@/data/seed';

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

  // CRUD operations
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;

  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;

  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;

  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;

  addAttendance: (record: AttendanceRecord) => void;
  bulkAddAttendance: (records: AttendanceRecord[]) => void;

  addHomework: (hw: Homework) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;

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

  addConversation: (c: AIConversation) => void;
  updateConversation: (id: string, updates: Partial<AIConversation>) => void;

  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  updateSettings: (updates: Partial<SystemSettings>) => void;

  addXP: (studentId: string, amount: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state from seed data
      currentUser: null,
      ...seedData,

      setCurrentUser: (user) => set({ currentUser: user }),

      addBranch: (branch) => set((s) => ({ branches: [...s.branches, branch] })),
      updateBranch: (id, updates) =>
        set((s) => ({ branches: s.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)) })),

      addStudent: (student) => set((s) => ({ students: [...s.students, student] })),
      updateStudent: (id, updates) =>
        set((s) => ({ students: s.students.map((st) => (st.id === id ? { ...st, ...updates } : st)) })),

      addTeacher: (teacher) => set((s) => ({ teachers: [...s.teachers, teacher] })),
      updateTeacher: (id, updates) =>
        set((s) => ({ teachers: s.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

      addBatch: (batch) => set((s) => ({ batches: [...s.batches, batch] })),
      updateBatch: (id, updates) =>
        set((s) => ({ batches: s.batches.map((b) => (b.id === id ? { ...b, ...updates } : b)) })),

      addAttendance: (record) => set((s) => ({ attendance: [...s.attendance, record] })),
      bulkAddAttendance: (records) =>
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
        }),

      addHomework: (hw) => set((s) => ({ homework: [...s.homework, hw] })),
      updateHomework: (id, updates) =>
        set((s) => ({ homework: s.homework.map((h) => (h.id === id ? { ...h, ...updates } : h)) })),

      addAssessment: (a) => set((s) => ({ assessments: [...s.assessments, a] })),
      updateAssessment: (id, updates) =>
        set((s) => ({ assessments: s.assessments.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),

      addLead: (lead) => set((s) => ({ leads: [...s.leads, lead] })),
      updateLead: (id, updates) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)) })),

      addInvoice: (invoice) => set((s) => ({ invoices: [...s.invoices, invoice] })),
      updateInvoice: (id, updates) =>
        set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)) })),

      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      markMessageRead: (id) =>
        set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)) })),

      addMeeting: (meeting) => set((s) => ({ meetings: [...s.meetings, meeting] })),
      updateMeeting: (id, updates) =>
        set((s) => ({ meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),

      addNotification: (n) => set((s) => ({ notifications: [...s.notifications, n] })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),

      addConversation: (c) => set((s) => ({ conversations: [...s.conversations, c] })),
      updateConversation: (id, updates) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      addUser: (user) => set((s) => ({ users: [...s.users, user] })),
      updateUser: (id, updates) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)) })),

      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),

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
    }),
    {
      name: 'platos-planet-store',
      version: 2,
      migrate: () => ({ currentUser: null, ...seedData }),
      partialize: (state) => ({
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
      }),
    }
  )
);

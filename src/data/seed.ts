import type {
  Branch, Student, Teacher, Parent, Batch, AttendanceRecord,
  Homework, Assessment, Lead, Invoice, Message, Meeting, Notification,
  SystemSettings, Achievement, User, AIConversation, AttendanceStatus,
  Campaign, ScholarshipApplication, AuditLogEntry, BranchRequest, ClassNote,
  SyllabusPlan, TeacherReview, Intervention, PaymentPlan, Expense, StudyPlan,
  GoLiveConfig, Programme, LessonLog
} from '@/types';

// ── Date helpers ──────────────────────────────────────────────────────────────

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
// Builds an ISO datetime for a given Asia/Dubai (UTC+4) wall-clock time, so any
// timezone-aware renderer correctly shows e.g. "4:00 PM" regardless of host TZ.
const atTime = (n: number, hourUAE: number, minuteUAE = 0) =>
  `${daysAgo(n)}T${String(hourUAE - 4).padStart(2, '0')}:${String(minuteUAE).padStart(2, '0')}:00.000Z`;

// ── Branches ──────────────────────────────────────────────────────────────────

export const branches: Branch[] = [
  { id: 'br-001', name: 'Al Qusais', address: '305 & 312, SMJ-2, Damascus Street, Al Qusais', city: 'Dubai', country: 'UAE', phone: '+971 4 123 4567', email: 'alqusais@platosplanet.ae', adminId: 'u-ba-001', isActive: true, capacity: 40, establishedYear: 2015 },
  { id: 'br-002', name: 'Al Majaz', address: 'M-02, Abdul Aziz Building, King Faisal Street, Al Majaz', city: 'Sharjah', country: 'UAE', phone: '+971 6 234 5678', email: 'almajaz@platosplanet.ae', adminId: 'u-ba-002', isActive: true, capacity: 35, establishedYear: 2018 },
  { id: 'br-003', name: 'JLT (Coming Soon)', address: 'Jumeirah Lake Towers — address to be confirmed', city: 'Dubai', country: 'UAE', phone: '', email: 'jlt@platosplanet.ae', adminId: 'u-ba-003', isActive: false, capacity: 50, establishedYear: 2026 },
];

// ── Users ─────────────────────────────────────────────────────────────────────

export const users: User[] = [
  { id: 'u-sa-001', name: 'Khalid Al Rashid', email: 'khalid@platosplanet.ae', phone: '+971 50 111 2222', role: 'super_admin', isActive: true, createdAt: '2020-01-01', lastLogin: new Date().toISOString() },
  { id: 'u-ba-001', name: 'Fatima Hassan', email: 'fatima@platosplanet.ae', phone: '+971 50 222 3333', role: 'branch_admin', branchId: 'br-001', isActive: true, createdAt: '2020-06-01' },
  { id: 'u-ba-002', name: 'Staff 2', email: 'staff2@platosplanet.ae', phone: '+971 50 333 4444', role: 'branch_admin', branchId: 'br-002', isActive: true, createdAt: '2021-06-01' },
  { id: 'u-ba-003', name: 'Staff 3', email: 'staff3@platosplanet.ae', phone: '+971 50 444 5555', role: 'branch_admin', branchId: 'br-003', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-sl-001', name: 'Layla Nasser', email: 'layla@platosplanet.ae', phone: '+971 50 555 6666', role: 'sales', branchId: 'br-001', isActive: true, createdAt: '2021-01-01' },
  { id: 'u-tc-001', name: 'Dr. Sarah Mitchell', email: 'sarah@platosplanet.ae', phone: '+971 50 666 7777', role: 'teacher', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-tc-002', name: 'Staff 4', email: 'staff4@platosplanet.ae', phone: '+971 50 777 8888', role: 'teacher', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-tc-003', name: 'Staff 5', email: 'staff5@platosplanet.ae', phone: '+971 50 888 9999', role: 'teacher', branchId: 'br-002', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-tc-004', name: 'Staff 1', email: 'staff1@platosplanet.ae', phone: '+971 50 910 1112', role: 'teacher', branchId: 'br-001', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-tc-005', name: 'Staff 6', email: 'staff6@platosplanet.ae', phone: '+971 50 112 1314', role: 'teacher', branchId: 'br-002', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-tc-006', name: 'Staff 7', email: 'staff7@platosplanet.ae', phone: '+971 50 131 4151', role: 'teacher', branchId: 'br-002', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-co-001', name: 'Dr. Yusuf Ibrahim', email: 'yusuf@platosplanet.ae', phone: '+971 50 999 0000', role: 'coordinator', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-fi-001', name: 'Priya Sharma', email: 'priya@platosplanet.ae', phone: '+971 50 100 2000', role: 'finance', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-pr-001', name: 'Mohammed Al Farsi', email: 'mfarsi@gmail.com', phone: '+971 50 200 3000', role: 'parent', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-pr-002', name: 'Parent 2', email: 'parent2@example.com', phone: '+971 50 300 4000', role: 'parent', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-pr-003', name: 'Parent 10', email: 'parent10@example.com', phone: '+971 50 401 5001', role: 'parent', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-pr-004', name: 'Parent 7', email: 'parent7@example.com', phone: '+971 55 502 6002', role: 'parent', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-pr-005', name: 'Parent 4', email: 'parent4@example.com', phone: '+971 52 603 7003', role: 'parent', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-pr-009', name: 'Parent 9', email: 'parent9@example.com', phone: '+971 56 009 1009', role: 'parent', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-st-001', name: 'Zaid Al Farsi', email: 'zaid@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-st-002', name: 'Student 2', email: 'student2@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-st-003', name: 'Student 5', email: 'student5@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-st-004', name: 'Student 9', email: 'student9@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-st-005', name: 'Student 10', email: 'student10@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-st-006', name: 'Student 7', email: 'student7@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-st-007', name: 'Student 4', email: 'student4@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-st-008', name: 'Student 6', email: 'student6@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-st-009', name: 'Student 11', email: 'student11@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-st-010', name: 'Student 3', email: 'student3@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-st-011', name: 'Student 12', email: 'student12@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-st-012', name: 'Student 8', email: 'student8@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2022-01-01' },
];

// ── Teachers ──────────────────────────────────────────────────────────────────

export const teachers: Teacher[] = [
  { id: 'tc-001', userId: 'u-tc-001', name: 'Dr. Sarah Mitchell', email: 'sarah@platosplanet.ae', phone: '+971 50 666 7777', branchId: 'br-001', subjects: ['Physics', 'Mathematics'], curriculums: ['IGCSE', 'A-Level'], qualification: 'PhD Physics, UCL', experience: 8, rating: 4.9, isActive: true, batchIds: ['ba-001', 'ba-002', 'ba-006'] },
  { id: 'tc-002', userId: 'u-tc-002', name: 'Staff 4', email: 'staff4@platosplanet.ae', phone: '+971 50 777 8888', branchId: 'br-001', subjects: ['Chemistry', 'Biology'], curriculums: ['IGCSE', 'CBSE'], qualification: 'MSc Chemistry, IIT Bombay', experience: 6, rating: 4.7, isActive: true, batchIds: ['ba-003', 'ba-005'] },
  { id: 'tc-003', userId: 'u-tc-003', name: 'Staff 5', email: 'staff5@platosplanet.ae', phone: '+971 50 888 9999', branchId: 'br-002', subjects: ['Mathematics', 'Computer Science'], curriculums: ['IGCSE', 'A-Level', 'CBSE'], qualification: 'MSc Computer Science, NUS', experience: 5, rating: 4.8, isActive: true, batchIds: ['ba-004', 'ba-008'] },
  { id: 'tc-004', userId: 'u-tc-004', name: 'Staff 1', email: 'staff1@platosplanet.ae', phone: '+971 50 910 1112', branchId: 'br-001', subjects: ['English', 'History'], curriculums: ['IGCSE', 'A-Level'], qualification: 'MA English Literature, AUS', experience: 7, rating: 4.6, isActive: true, batchIds: ['ba-007'] },
  { id: 'tc-005', userId: 'u-tc-005', name: 'Staff 6', email: 'staff6@platosplanet.ae', phone: '+971 50 112 1314', branchId: 'br-002', subjects: ['Biology', 'Chemistry'], curriculums: ['IGCSE', 'A-Level'], qualification: 'MSc Biochemistry, Trinity College Dublin', experience: 9, rating: 4.8, isActive: true, batchIds: ['ba-009'] },
  { id: 'tc-006', userId: 'u-tc-006', name: 'Staff 7', email: 'staff7@platosplanet.ae', phone: '+971 50 131 4151', branchId: 'br-002', subjects: ['Mathematics', 'Economics'], curriculums: ['A-Level', 'IB'], qualification: 'PhD Economics, LSE', experience: 11, rating: 4.9, isActive: true, batchIds: ['ba-010'] },
];

// ── Parents ───────────────────────────────────────────────────────────────────

export const parents: Parent[] = [
  { id: 'pr-001', userId: 'u-pr-001', name: 'Mohammed Al Farsi', email: 'mfarsi@gmail.com', phone: '+971 50 200 3000', studentIds: ['st-001'], branchId: 'br-001', relationship: 'Father' },
  { id: 'pr-002', userId: 'u-pr-002', name: 'Parent 2', email: 'parent2@example.com', phone: '+971 50 300 4000', studentIds: ['st-002'], branchId: 'br-001' },
  { id: 'pr-003', userId: 'u-pr-003', name: 'Parent 10', email: 'parent10@example.com', phone: '+971 50 401 5001', studentIds: ['st-005'], branchId: 'br-001' },
  { id: 'pr-004', userId: 'u-pr-004', name: 'Parent 7', email: 'parent7@example.com', phone: '+971 55 502 6002', studentIds: ['st-006', 'st-010'], branchId: 'br-002' },
  { id: 'pr-005', userId: 'u-pr-005', name: 'Parent 4', email: 'parent4@example.com', phone: '+971 52 603 7003', studentIds: ['st-007'], branchId: 'br-001' },
  { id: 'pr-006', name: 'Parent 12', email: 'parent12@example.com', phone: '+971 50 704 8004', userId: 'u-pr-006', studentIds: ['st-011'], branchId: 'br-001' },
  { id: 'pr-007', name: 'Parent 8', email: 'parent8@example.com', phone: '+971 55 805 9005', userId: 'u-pr-007', studentIds: ['st-012'], branchId: 'br-002' },
  { id: 'pr-008', name: 'Parent 6', email: 'parent6@example.com', phone: '+971 50 906 0006', userId: 'u-pr-008', studentIds: ['st-008', 'st-009'], branchId: 'br-002' },
  { id: 'pr-009', name: 'Parent 9', email: 'parent9@example.com', phone: '+971 56 009 1009', userId: 'u-pr-009', studentIds: ['st-003'], branchId: 'br-002' },
];

// ── Students ──────────────────────────────────────────────────────────────────

export const students: Student[] = [
  { id: 'st-001', userId: 'u-st-001', name: 'Zaid Al Farsi', email: 'zaid@student.platosplanet.ae', parentId: 'pr-001', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 10', enrollmentDate: '2021-09-01', status: 'active', xp: 3750, streak: 12, planet: 'Mars', subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'], batchIds: ['ba-001', 'ba-003'], dateOfBirth: '2010-03-14', nationality: 'Emirati', gender: 'Male' },
  { id: 'st-002', userId: 'u-st-002', name: 'Student 2', email: 'student2@student.platosplanet.ae', parentId: 'pr-002', branchId: 'br-001', curriculum: 'A-Level', grade: 'Year 12', enrollmentDate: '2022-01-01', status: 'active', xp: 6200, streak: 21, planet: 'Saturn', subjects: ['Mathematics', 'Physics', 'Computer Science'], batchIds: ['ba-001', 'ba-002'] },
  { id: 'st-003', userId: 'u-st-003', name: 'Student 5', email: 'student5@student.platosplanet.ae', parentId: 'pr-009', branchId: 'br-002', curriculum: 'CBSE', grade: 'Class 11', enrollmentDate: '2022-01-01', status: 'active', xp: 1800, streak: 5, planet: 'Earth', subjects: ['Chemistry', 'Biology', 'Mathematics'], batchIds: ['ba-003', 'ba-004'] },
  { id: 'st-004', userId: 'u-st-004', name: 'Student 9', email: 'student9@student.platosplanet.ae', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 9', enrollmentDate: '2023-09-01', status: 'active', xp: 720, streak: 8, planet: 'Venus', subjects: ['Mathematics', 'English', 'Biology'], batchIds: ['ba-001', 'ba-007'] },
  { id: 'st-005', userId: 'u-st-005', name: 'Student 10', email: 'student10@student.platosplanet.ae', parentId: 'pr-003', branchId: 'br-001', curriculum: 'A-Level', grade: 'Year 13', enrollmentDate: '2022-09-01', status: 'active', xp: 14200, streak: 34, planet: 'Neptune', subjects: ['Mathematics', 'Physics', 'Economics'], batchIds: ['ba-002', 'ba-006'] },
  { id: 'st-006', userId: 'u-st-006', name: 'Student 7', email: 'student7@student.platosplanet.ae', parentId: 'pr-004', branchId: 'br-002', curriculum: 'CBSE', grade: 'Class 12', enrollmentDate: '2023-01-01', status: 'active', xp: 5100, streak: 15, planet: 'Jupiter', subjects: ['Chemistry', 'Biology', 'Mathematics'], batchIds: ['ba-004', 'ba-008'] },
  { id: 'st-007', userId: 'u-st-007', name: 'Student 4', email: 'student4@student.platosplanet.ae', parentId: 'pr-005', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 11', enrollmentDate: '2023-09-01', status: 'active', xp: 1400, streak: 6, planet: 'Earth', subjects: ['English', 'History', 'Biology'], batchIds: ['ba-005', 'ba-007'] },
  { id: 'st-008', userId: 'u-st-008', name: 'Student 6', email: 'student6@student.platosplanet.ae', parentId: 'pr-008', branchId: 'br-002', curriculum: 'A-Level', grade: 'Year 12', enrollmentDate: '2022-09-01', status: 'active', xp: 4600, streak: 18, planet: 'Jupiter', subjects: ['Biology', 'Chemistry', 'Mathematics'], batchIds: ['ba-009', 'ba-010'] },
  { id: 'st-009', userId: 'u-st-009', name: 'Student 11', email: 'student11@student.platosplanet.ae', parentId: 'pr-008', branchId: 'br-002', curriculum: 'IGCSE', grade: 'Grade 10', enrollmentDate: '2023-01-01', status: 'active', xp: 2200, streak: 9, planet: 'Earth', subjects: ['Mathematics', 'Physics', 'Economics'], batchIds: ['ba-009', 'ba-010'] },
  { id: 'st-010', userId: 'u-st-010', name: 'Student 3', email: 'student3@student.platosplanet.ae', parentId: 'pr-004', branchId: 'br-002', curriculum: 'CBSE', grade: 'Class 11', enrollmentDate: '2023-09-01', status: 'active', xp: 880, streak: 3, planet: 'Venus', subjects: ['Mathematics', 'Computer Science'], batchIds: ['ba-004', 'ba-008'] },
  { id: 'st-011', userId: 'u-st-011', name: 'Student 12', email: 'student12@student.platosplanet.ae', parentId: 'pr-006', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 10', enrollmentDate: '2021-09-01', status: 'active', xp: 9200, streak: 28, planet: 'Saturn', subjects: ['Mathematics', 'Physics', 'English', 'History'], batchIds: ['ba-001', 'ba-002', 'ba-007'] },
  { id: 'st-012', userId: 'u-st-012', name: 'Student 8', email: 'student8@student.platosplanet.ae', parentId: 'pr-007', branchId: 'br-002', curriculum: 'A-Level', grade: 'Year 13', enrollmentDate: '2022-01-01', status: 'suspended', xp: 2900, streak: 0, planet: 'Mars', subjects: ['Mathematics', 'Economics'], batchIds: ['ba-010'] },
];

// ── Batches ───────────────────────────────────────────────────────────────────

export const batches: Batch[] = [
  { id: 'ba-001', name: 'IGCSE Physics — Grade 10 (Mon/Wed)', branchId: 'br-001', teacherId: 'tc-001', subject: 'Physics', curriculum: 'IGCSE', grade: 'Grade 10', studentIds: ['st-001', 'st-002', 'st-004', 'st-011'], maxCapacity: 12, schedule: [{ day: 'Mon', startTime: '16:00', endTime: '18:00' }, { day: 'Wed', startTime: '16:00', endTime: '18:00' }], status: 'active', room: 'Room 101', startDate: '2024-09-01' },
  { id: 'ba-002', name: 'A-Level Mathematics — Year 12/13 (Tue/Thu)', branchId: 'br-001', teacherId: 'tc-001', subject: 'Mathematics', curriculum: 'A-Level', grade: 'Year 12', studentIds: ['st-002', 'st-005', 'st-011'], maxCapacity: 10, schedule: [{ day: 'Tue', startTime: '17:00', endTime: '19:00' }, { day: 'Thu', startTime: '17:00', endTime: '19:00' }], status: 'active', room: 'Room 102', startDate: '2024-09-01' },
  { id: 'ba-003', name: 'IGCSE Chemistry — Grade 10 (Tue/Fri)', branchId: 'br-001', teacherId: 'tc-002', subject: 'Chemistry', curriculum: 'IGCSE', grade: 'Grade 10', studentIds: ['st-001', 'st-003'], maxCapacity: 12, schedule: [{ day: 'Tue', startTime: '16:00', endTime: '18:00' }, { day: 'Fri', startTime: '10:00', endTime: '12:00' }], status: 'active', room: 'Lab 1', startDate: '2024-09-01' },
  { id: 'ba-004', name: 'CBSE Mathematics — Class 11/12 (Mon/Thu)', branchId: 'br-002', teacherId: 'tc-003', subject: 'Mathematics', curriculum: 'CBSE', grade: 'Class 11', studentIds: ['st-003', 'st-006', 'st-010'], maxCapacity: 15, schedule: [{ day: 'Mon', startTime: '15:00', endTime: '17:00' }, { day: 'Thu', startTime: '15:00', endTime: '17:00' }], status: 'active', room: 'Room 201', startDate: '2024-09-01' },
  { id: 'ba-005', name: 'IGCSE Biology — Grade 10/11 (Mon/Thu)', branchId: 'br-001', teacherId: 'tc-002', subject: 'Biology', curriculum: 'IGCSE', grade: 'Grade 10', studentIds: ['st-001', 'st-007', 'st-004'], maxCapacity: 12, schedule: [{ day: 'Mon', startTime: '14:00', endTime: '16:00' }, { day: 'Thu', startTime: '14:00', endTime: '16:00' }], status: 'active', room: 'Lab 2', startDate: '2024-09-01' },
  { id: 'ba-006', name: 'A-Level Physics — Year 13 (Tue/Sat)', branchId: 'br-001', teacherId: 'tc-001', subject: 'Physics', curriculum: 'A-Level', grade: 'Year 13', studentIds: ['st-005', 'st-002'], maxCapacity: 8, schedule: [{ day: 'Tue', startTime: '14:00', endTime: '16:00' }, { day: 'Sat', startTime: '10:00', endTime: '12:00' }], status: 'active', room: 'Room 103', startDate: '2024-09-01' },
  { id: 'ba-007', name: 'IGCSE English — Grade 9/11 (Wed/Sat)', branchId: 'br-001', teacherId: 'tc-004', subject: 'English', curriculum: 'IGCSE', grade: 'Grade 9', studentIds: ['st-004', 'st-007', 'st-011'], maxCapacity: 12, schedule: [{ day: 'Wed', startTime: '15:00', endTime: '17:00' }, { day: 'Sat', startTime: '11:00', endTime: '13:00' }], status: 'active', room: 'Room 104', startDate: '2024-09-01' },
  { id: 'ba-008', name: 'CBSE CS & Mathematics — Class 12 (Wed/Fri)', branchId: 'br-002', teacherId: 'tc-003', subject: 'Computer Science', curriculum: 'CBSE', grade: 'Class 12', studentIds: ['st-006', 'st-010'], maxCapacity: 10, schedule: [{ day: 'Wed', startTime: '16:00', endTime: '18:00' }, { day: 'Fri', startTime: '14:00', endTime: '16:00' }], status: 'active', room: 'Computer Lab', startDate: '2024-09-01' },
  { id: 'ba-009', name: 'A-Level Biology — Year 12 (Mon/Wed)', branchId: 'br-002', teacherId: 'tc-005', subject: 'Biology', curriculum: 'A-Level', grade: 'Year 12', studentIds: ['st-008', 'st-009'], maxCapacity: 10, schedule: [{ day: 'Mon', startTime: '16:00', endTime: '18:00' }, { day: 'Wed', startTime: '16:00', endTime: '18:00' }], status: 'active', room: 'Room 301', startDate: '2024-09-01' },
  { id: 'ba-010', name: 'A-Level Economics — Year 12/13 (Tue/Thu)', branchId: 'br-002', teacherId: 'tc-006', subject: 'Economics', curriculum: 'A-Level', grade: 'Year 12', studentIds: ['st-008', 'st-009', 'st-012'], maxCapacity: 12, schedule: [{ day: 'Tue', startTime: '15:00', endTime: '17:00' }, { day: 'Thu', startTime: '15:00', endTime: '17:00' }], status: 'active', room: 'Room 302', startDate: '2024-09-01' },
];

// ── Attendance ─────────────────────────────────────────────────────────────────

// Generate a block of attendance records for a batch over several weeks
function genAtt(
  startId: number,
  batchId: string,
  studentIds: string[],
  teacherId: string,
  offsets: number[], // days ago for each session
  statuses: Record<string, AttendanceStatus[]> // studentId → statuses matching offsets
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let id = startId;
  for (let si = 0; si < studentIds.length; si++) {
    const sid = studentIds[si];
    const sts = statuses[sid] || offsets.map(() => 'present' as AttendanceStatus);
    for (let oi = 0; oi < offsets.length; oi++) {
      records.push({ id: `att-${String(id++).padStart(3,'0')}`, batchId, studentId: sid, date: daysAgo(offsets[oi]), status: sts[oi], markedBy: teacherId });
    }
  }
  return records;
}

export const attendance: AttendanceRecord[] = [
  // ba-001 — IGCSE Physics (Mon/Wed) — 8 sessions over 4 weeks
  ...genAtt(1, 'ba-001', ['st-001','st-002','st-004','st-011'], 'tc-001',
    [0,2,7,9,14,16,21,23],
    {
      'st-001': ['present','present','present','present','present','present','present','present'],
      'st-002': ['present','absent','present','present','present','late','present','present'],
      'st-004': ['late','present','absent','present','present','present','present','absent'],
      'st-011': ['present','present','present','present','absent','present','present','present'],
    }
  ),
  // ba-002 — A-Level Maths (Tue/Thu)
  ...genAtt(50, 'ba-002', ['st-002','st-005','st-011'], 'tc-001',
    [1,3,8,10,15,17,22,24],
    {
      'st-002': ['present','present','present','absent','present','present','present','present'],
      'st-005': ['present','present','present','present','present','present','present','late'],
      'st-011': ['present','present','absent','present','present','absent','present','present'],
    }
  ),
  // ba-003 — IGCSE Chemistry (Tue/Fri)
  ...genAtt(90, 'ba-003', ['st-001','st-003'], 'tc-002',
    [1,4,8,11,15,18,22,25],
    {
      'st-001': ['present','present','present','present','late','present','present','present'],
      'st-003': ['present','excused','present','present','present','absent','present','present'],
    }
  ),
  // ba-004 — CBSE Maths (Mon/Thu)
  ...genAtt(120, 'ba-004', ['st-003','st-006','st-010'], 'tc-003',
    [0,3,7,10,14,17,21,24],
    {
      'st-003': ['present','present','present','present','absent','present','present','present'],
      'st-006': ['present','present','present','late','present','present','present','present'],
      'st-010': ['absent','present','present','present','present','present','late','present'],
    }
  ),
  // ba-005 — IGCSE Biology (Mon/Thu)
  ...genAtt(150, 'ba-005', ['st-001','st-007','st-004'], 'tc-002',
    [0,3,7,10,14,17,21,24],
    {
      'st-001': ['present','present','present','present','present','late','present','present'],
      'st-007': ['present','absent','present','present','present','present','present','present'],
      'st-004': ['late','present','present','absent','present','present','present','present'],
    }
  ),
  // ba-006 — A-Level Physics (Tue/Sat)
  ...genAtt(180, 'ba-006', ['st-005','st-002'], 'tc-001',
    [1,4,8,11,15,18,22,25],
    {
      'st-005': ['present','present','present','present','present','present','present','present'],
      'st-002': ['present','present','present','late','present','present','absent','present'],
    }
  ),
  // ba-007 — IGCSE English (Wed/Sat)
  ...genAtt(200, 'ba-007', ['st-004','st-007','st-011'], 'tc-004',
    [2,5,9,12,16,19,23,26],
    {
      'st-004': ['present','present','present','present','late','present','present','present'],
      'st-007': ['present','present','absent','present','present','present','present','present'],
      'st-011': ['present','present','present','present','present','present','present','absent'],
    }
  ),
  // ba-009 — A-Level Biology (Mon/Wed) Al Majaz
  ...genAtt(230, 'ba-009', ['st-008','st-009'], 'tc-005',
    [0,2,7,9,14,16,21,23],
    {
      'st-008': ['present','present','present','present','present','late','present','present'],
      'st-009': ['present','present','absent','present','present','present','present','present'],
    }
  ),
  // ba-010 — A-Level Economics (Tue/Thu) Al Majaz
  ...genAtt(250, 'ba-010', ['st-008','st-009','st-012'], 'tc-006',
    [1,3,8,10,15,17,22,24],
    {
      'st-008': ['present','present','present','present','present','present','late','present'],
      'st-009': ['late','present','present','present','present','absent','present','present'],
      'st-012': ['absent','absent','present','absent','present','absent','absent','present'],
    }
  ),
];

// ── Homework ──────────────────────────────────────────────────────────────────

export const homework: Homework[] = [
  {
    id: 'hw-001', batchId: 'ba-001', teacherId: 'tc-001',
    title: "Newton's Laws — Problem Set 3",
    description: 'Complete questions 1–15 from Chapter 4. Focus on free-body diagrams and net force calculations.',
    subject: 'Physics', dueDate: daysAgo(-2), assignedDate: daysAgo(0), status: 'assigned', maxMarks: 50,
    submissions: [
      { studentId: 'st-002', submittedAt: new Date().toISOString(), status: 'submitted' },
      { studentId: 'st-011', submittedAt: daysAgo(-1), status: 'submitted' },
    ],
  },
  {
    id: 'hw-002', batchId: 'ba-003', teacherId: 'tc-002',
    title: 'Organic Chemistry — Naming Compounds',
    description: 'Name the following 20 organic compounds using IUPAC nomenclature rules.',
    subject: 'Chemistry', dueDate: daysAgo(-1), assignedDate: daysAgo(3), status: 'graded', maxMarks: 40,
    submissions: [
      { studentId: 'st-001', submittedAt: daysAgo(-2), marks: 36, feedback: 'Excellent work on alkanes. Review ketone naming.', status: 'graded' },
      { studentId: 'st-003', submittedAt: daysAgo(-1), marks: 32, feedback: 'Good effort. Practice ester naming.', status: 'graded' },
    ],
  },
  {
    id: 'hw-003', batchId: 'ba-002', teacherId: 'tc-001',
    title: 'Integration by Parts — Exercise 5',
    description: 'Solve all 12 integration by parts problems. Show all working steps.',
    subject: 'Mathematics', dueDate: daysAgo(-3), assignedDate: daysAgo(7), status: 'assigned', maxMarks: 60,
    submissions: [
      { studentId: 'st-005', submittedAt: daysAgo(-3), status: 'submitted' },
      { studentId: 'st-011', submittedAt: daysAgo(-2), marks: 54, feedback: 'Excellent technique. Check sign errors in Q8.', status: 'graded' },
    ],
  },
  {
    id: 'hw-004', batchId: 'ba-001', teacherId: 'tc-001',
    title: 'Electricity — Circuit Diagrams',
    description: 'Draw and analyse the 8 circuit diagrams on worksheet B. Calculate total resistance for series and parallel circuits.',
    subject: 'Physics', dueDate: daysAgo(5), assignedDate: daysAgo(12), status: 'graded', maxMarks: 45,
    submissions: [
      { studentId: 'st-001', submittedAt: daysAgo(6), marks: 41, feedback: 'Strong understanding. Minor error in Q3 parallel calc.', status: 'graded' },
      { studentId: 'st-002', submittedAt: daysAgo(7), marks: 44, feedback: 'Near perfect. Well done.', status: 'graded' },
      { studentId: 'st-004', submittedAt: daysAgo(5), marks: 33, feedback: 'Review series circuits. See me for help.', status: 'graded' },
      { studentId: 'st-011', submittedAt: daysAgo(5), marks: 43, feedback: 'Very good. Review total EMF calculation.', status: 'graded' },
    ],
  },
  {
    id: 'hw-005', batchId: 'ba-005', teacherId: 'tc-002',
    title: 'Cell Division — Mitosis vs Meiosis',
    description: 'Draw annotated diagrams for all stages of mitosis and meiosis. Compare the two processes in a table.',
    subject: 'Biology', dueDate: daysAgo(-4), assignedDate: daysAgo(2), status: 'assigned', maxMarks: 35,
    submissions: [
      { studentId: 'st-007', submittedAt: daysAgo(-3), status: 'submitted' },
    ],
  },
  {
    id: 'hw-006', batchId: 'ba-007', teacherId: 'tc-004',
    title: 'Unseen Poetry — Analysis Essay',
    description: 'Write a 600-word analytical essay on the unseen poem distributed in class. Focus on language, structure, and context.',
    subject: 'English', dueDate: daysAgo(3), assignedDate: daysAgo(10), status: 'graded', maxMarks: 50,
    submissions: [
      { studentId: 'st-004', submittedAt: daysAgo(4), marks: 42, feedback: 'Excellent analysis of metaphor. Strengthen your conclusion.', status: 'graded' },
      { studentId: 'st-007', submittedAt: daysAgo(3), marks: 38, feedback: 'Good ideas but lacks textual evidence in paragraph 2.', status: 'graded' },
      { studentId: 'st-011', submittedAt: daysAgo(4), marks: 47, feedback: 'Outstanding. Consider for school magazine.', status: 'graded' },
    ],
  },
  {
    id: 'hw-007', batchId: 'ba-009', teacherId: 'tc-005',
    title: 'Enzymes — Reaction Rate Lab Report',
    description: 'Write a full lab report for the enzyme activity experiment. Include hypothesis, method, results graph, and evaluation.',
    subject: 'Biology', dueDate: daysAgo(-1), assignedDate: daysAgo(4), status: 'assigned', maxMarks: 80,
    submissions: [
      { studentId: 'st-008', submittedAt: daysAgo(0), status: 'submitted' },
    ],
  },
  {
    id: 'hw-008', batchId: 'ba-010', teacherId: 'tc-006',
    title: 'Market Structures — Essay',
    description: 'Compare and contrast perfect competition and monopoly. Use real-world examples from UAE markets.',
    subject: 'Economics', dueDate: daysAgo(1), assignedDate: daysAgo(8), status: 'graded', maxMarks: 60,
    submissions: [
      { studentId: 'st-008', submittedAt: daysAgo(2), marks: 53, feedback: 'Excellent UAE examples. Deepen analysis of deadweight loss.', status: 'graded' },
      { studentId: 'st-009', submittedAt: daysAgo(1), marks: 48, feedback: 'Good structure. More evaluation required for A grade.', status: 'graded' },
      { studentId: 'st-012', submittedAt: daysAgo(0), marks: 38, feedback: 'Acceptable but lacks application. See me after class.', status: 'graded' },
    ],
  },
  {
    id: 'hw-009', batchId: 'ba-002', teacherId: 'tc-001',
    title: 'Binomial Theorem — Problem Set',
    description: 'Complete 15 expansion problems using the binomial theorem. Include Pascal\'s triangle working.',
    subject: 'Mathematics', dueDate: daysAgo(10), assignedDate: daysAgo(17), status: 'graded', maxMarks: 40,
    submissions: [
      { studentId: 'st-002', submittedAt: daysAgo(11), marks: 37, feedback: 'Very good. Minor algebraic slip in Q12.', status: 'graded' },
      { studentId: 'st-005', submittedAt: daysAgo(10), marks: 40, feedback: 'Perfect score! Excellent work.', status: 'graded' },
      { studentId: 'st-011', submittedAt: daysAgo(10), marks: 34, feedback: 'Good. Review negative indices.', status: 'graded' },
    ],
  },
  {
    id: 'hw-010', batchId: 'ba-004', teacherId: 'tc-003',
    title: 'Probability — Conditional Problems',
    description: 'Solve 20 conditional probability problems. Use tree diagrams where appropriate.',
    subject: 'Mathematics', dueDate: daysAgo(-5), assignedDate: daysAgo(1), status: 'assigned', maxMarks: 50,
    submissions: [],
  },
];

// ── Assessments ───────────────────────────────────────────────────────────────

export const assessments: Assessment[] = [
  {
    id: 'as-001', batchId: 'ba-001', teacherId: 'tc-001',
    title: 'IGCSE Physics — Paper 2 Mock',
    subject: 'Physics', curriculum: 'IGCSE', type: 'mock_exam',
    date: daysAgo(10), maxMarks: 80, duration: 75, status: 'graded',
    syllabusTopics: ['Forces', 'Motion', 'Energy'],
    results: [
      { studentId: 'st-001', marks: 68, percentage: 85, grade: 'A*', feedback: 'Outstanding in forces section.' },
      { studentId: 'st-002', marks: 72, percentage: 90, grade: 'A*', feedback: 'Exceptional. Review energy transformations.' },
      { studentId: 'st-004', marks: 55, percentage: 69, grade: 'B', feedback: 'Good work. Practice graph interpretation.' },
      { studentId: 'st-011', marks: 74, percentage: 92, grade: 'A*', feedback: 'Excellent. Top of the class.' },
    ],
  },
  {
    id: 'as-002', batchId: 'ba-003', teacherId: 'tc-002',
    title: 'Chemistry Quiz — Organic Reactions',
    subject: 'Chemistry', curriculum: 'IGCSE', type: 'quiz',
    date: daysAgo(5), maxMarks: 25, duration: 30, status: 'graded',
    syllabusTopics: ['Alkanes', 'Alkenes', 'Alcohols'],
    results: [
      { studentId: 'st-001', marks: 22, percentage: 88, grade: 'A', feedback: 'Strong understanding of mechanisms.' },
      { studentId: 'st-003', marks: 18, percentage: 72, grade: 'B', feedback: 'Good. Review substitution reactions.' },
    ],
  },
  {
    id: 'as-003', batchId: 'ba-002', teacherId: 'tc-001',
    title: 'A-Level Maths — Pure 1 Test',
    subject: 'Mathematics', curriculum: 'A-Level', type: 'test',
    date: daysAgo(-7), maxMarks: 100, duration: 90, status: 'upcoming',
    syllabusTopics: ['Calculus', 'Algebra', 'Sequences'],
    results: [],
  },
  {
    id: 'as-004', batchId: 'ba-005', teacherId: 'tc-002',
    title: 'Biology — Cell Structure Quiz',
    subject: 'Biology', curriculum: 'IGCSE', type: 'quiz',
    date: daysAgo(8), maxMarks: 30, duration: 25, status: 'graded',
    syllabusTopics: ['Cell Structure', 'Organelles', 'Osmosis'],
    results: [
      { studentId: 'st-001', marks: 28, percentage: 93, grade: 'A*', feedback: 'Excellent recall and application.' },
      { studentId: 'st-007', marks: 22, percentage: 73, grade: 'B', feedback: 'Good. Review mitochondria function.' },
      { studentId: 'st-004', marks: 25, percentage: 83, grade: 'A', feedback: 'Strong performance.' },
    ],
  },
  {
    id: 'as-005', batchId: 'ba-006', teacherId: 'tc-001',
    title: 'A-Level Physics — Quantum Mock',
    subject: 'Physics', curriculum: 'A-Level', type: 'mock_exam',
    date: daysAgo(15), maxMarks: 120, duration: 120, status: 'graded',
    syllabusTopics: ['Quantum Physics', 'Wave-Particle Duality', 'Photoelectric Effect'],
    results: [
      { studentId: 'st-005', marks: 108, percentage: 90, grade: 'A*', feedback: 'Exceptional. University-level understanding.' },
      { studentId: 'st-002', marks: 95, percentage: 79, grade: 'A', feedback: 'Very good. Strengthen quantum number questions.' },
    ],
  },
  {
    id: 'as-006', batchId: 'ba-007', teacherId: 'tc-004',
    title: 'English — Paper 1 Reading Comprehension',
    subject: 'English', curriculum: 'IGCSE', type: 'test',
    date: daysAgo(12), maxMarks: 40, duration: 60, status: 'graded',
    syllabusTopics: ['Inference', 'Language Analysis', 'Summary Writing'],
    results: [
      { studentId: 'st-004', marks: 34, percentage: 85, grade: 'A*', feedback: 'Superb inference skills.' },
      { studentId: 'st-007', marks: 28, percentage: 70, grade: 'B', feedback: 'Improve summary technique.' },
      { studentId: 'st-011', marks: 38, percentage: 95, grade: 'A*', feedback: 'Outstanding. Best in class.' },
    ],
  },
  {
    id: 'as-007', batchId: 'ba-009', teacherId: 'tc-005',
    title: 'A-Level Biology — Genetics Test',
    subject: 'Biology', curriculum: 'A-Level', type: 'test',
    date: daysAgo(6), maxMarks: 60, duration: 50, status: 'graded',
    syllabusTopics: ['Mendelian Genetics', 'Inheritance Patterns', 'DNA Replication'],
    results: [
      { studentId: 'st-008', marks: 54, percentage: 90, grade: 'A*', feedback: 'Exceptional genetics knowledge.' },
      { studentId: 'st-009', marks: 45, percentage: 75, grade: 'B', feedback: 'Good. Practice dihybrid crosses.' },
    ],
  },
  {
    id: 'as-008', batchId: 'ba-010', teacherId: 'tc-006',
    title: 'Economics — Macroeconomics Mock',
    subject: 'Economics', curriculum: 'A-Level', type: 'mock_exam',
    date: daysAgo(20), maxMarks: 80, duration: 90, status: 'graded',
    syllabusTopics: ['GDP', 'Inflation', 'Fiscal Policy', 'Monetary Policy'],
    results: [
      { studentId: 'st-008', marks: 70, percentage: 87, grade: 'A*', feedback: 'Excellent macroeconomic analysis.' },
      { studentId: 'st-009', marks: 61, percentage: 76, grade: 'A', feedback: 'Good understanding. Strengthen evaluation.' },
      { studentId: 'st-012', marks: 48, percentage: 60, grade: 'C', feedback: 'Needs significant improvement. Book a tutorial.' },
    ],
  },
  {
    id: 'as-009', batchId: 'ba-004', teacherId: 'tc-003',
    title: 'CBSE Mathematics — Unit Test 3',
    subject: 'Mathematics', curriculum: 'CBSE', type: 'test',
    date: daysAgo(-10), maxMarks: 50, duration: 60, status: 'upcoming',
    syllabusTopics: ['Matrices', 'Determinants', 'Continuity'],
    results: [],
  },
  {
    id: 'as-010', batchId: 'ba-001', teacherId: 'tc-001',
    title: 'IGCSE Physics — Waves Quiz',
    subject: 'Physics', curriculum: 'IGCSE', type: 'quiz',
    date: daysAgo(25), maxMarks: 20, duration: 20, status: 'graded',
    syllabusTopics: ['Transverse Waves', 'Longitudinal Waves', 'Reflection'],
    results: [
      { studentId: 'st-001', marks: 18, percentage: 90, grade: 'A*', feedback: 'Perfect understanding of wave properties.' },
      { studentId: 'st-002', marks: 17, percentage: 85, grade: 'A*', feedback: 'Excellent.' },
      { studentId: 'st-004', marks: 13, percentage: 65, grade: 'C', feedback: 'Review longitudinal waves.' },
      { studentId: 'st-011', marks: 19, percentage: 95, grade: 'A*', feedback: 'Outstanding.' },
    ],
  },
];

// ── Leads ─────────────────────────────────────────────────────────────────────

export const leads: Lead[] = [
  {
    id: 'ld-001', parentName: 'Lead 1 Parent', parentEmail: 'lead1parent@example.com', parentPhone: '+971 50 400 5001',
    studentName: 'Lead 1', studentAge: 15, curriculum: 'IGCSE', subjects: ['Mathematics', 'Physics'], grade: 'Grade 10',
    source: 'referral', status: 'trial_scheduled', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: 'Father is a doctor. Very keen on A* grades. Trial class booked for Wednesday.',
    followUpDate: daysAgo(-1), trialDate: daysAgo(-1), createdAt: daysAgo(5),
  },
  {
    id: 'ld-002', parentName: 'Lead 2 Parent', parentEmail: 'lead2parent@example.com', parentPhone: '+971 55 500 6002',
    studentName: 'Lead 2', studentAge: 16, curriculum: 'CBSE', subjects: ['Chemistry', 'Biology'], grade: 'Class 11',
    source: 'google_ads', status: 'contacted', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: 'Interested in medical entrance prep alongside CBSE. Wants weekend batches only.',
    followUpDate: daysAgo(-2), createdAt: daysAgo(3),
  },
  {
    id: 'ld-003', parentName: 'Lead 3 Parent', parentEmail: 'lead3parent@example.com', parentPhone: '+971 52 600 7003',
    studentName: 'Lead 3', studentAge: 17, curriculum: 'A-Level', subjects: ['Mathematics', 'Computer Science'], grade: 'Year 12',
    source: 'walk_in', status: 'new', branchId: 'br-002', createdAt: daysAgo(1),
  },
  {
    id: 'ld-004', parentName: 'Lead 6 Parent', parentEmail: 'lead6parent@example.com', parentPhone: '+971 56 700 8004',
    studentName: 'Lead 6', studentAge: 14, curriculum: 'IGCSE', subjects: ['English', 'Biology', 'Mathematics'], grade: 'Grade 9',
    source: 'social_media', status: 'enrolled', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: 'Successfully enrolled. Started October batch.',
    createdAt: daysAgo(15), convertedAt: daysAgo(7),
  },
  {
    id: 'ld-005', parentName: 'Lead 4 Parent', parentEmail: 'lead4parent@example.com', parentPhone: '+971 50 801 9005',
    studentName: 'Lead 4', studentAge: 13, curriculum: 'IGCSE', subjects: ['Mathematics', 'English'], grade: 'Grade 8',
    source: 'whatsapp', status: 'new', branchId: 'br-001',
    notes: 'Sent inquiry via WhatsApp at 10pm. Prefers Arabic-speaking teacher.',
    createdAt: daysAgo(0),
  },
  {
    id: 'ld-006', parentName: 'Lead 7 Parent', parentEmail: 'lead7parent@example.com', parentPhone: '+971 55 902 0006',
    studentName: 'Lead 7', studentAge: 15, curriculum: 'CBSE', subjects: ['Physics', 'Chemistry', 'Mathematics'], grade: 'Class 10',
    source: 'referral', status: 'trial_done', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: "Referred by Student 5's family. Trial went well. Waiting for parent decision.",
    followUpDate: daysAgo(-3), trialDate: daysAgo(4), createdAt: daysAgo(7),
  },
  {
    id: 'ld-007', parentName: 'Lead 8 Parent', parentEmail: 'lead8parent@example.com', parentPhone: '+971 52 003 1007',
    studentName: 'Lead 8', studentAge: 16, curriculum: 'A-Level', subjects: ['Mathematics', 'Economics', 'Business Studies'], grade: 'Year 11',
    source: 'google_ads', status: 'contacted', assignedTo: 'u-sl-001', branchId: 'br-002',
    notes: 'Interested in university prep for UK unis. Parents are expats from Hong Kong.',
    followUpDate: daysAgo(-1), createdAt: daysAgo(4),
  },
  {
    id: 'ld-008', parentName: 'Lead 5 Parent', parentEmail: 'lead5parent@example.com', parentPhone: '+971 50 104 2008',
    studentName: 'Lead 5', studentAge: 18, curriculum: 'A-Level', subjects: ['Physics', 'Mathematics'], grade: 'Year 13',
    source: 'walk_in', status: 'contacted', branchId: 'br-001',
    notes: 'Retaking A-Levels. Needs intensive revision for June exams. Very motivated.',
    followUpDate: daysAgo(0), createdAt: daysAgo(2),
  },
  {
    id: 'ld-009', parentName: 'Lead 9 Parent', parentEmail: 'lead9parent@example.com', parentPhone: '+971 55 205 3009',
    studentName: 'Lead 9', studentAge: 14, curriculum: 'IGCSE', subjects: ['Biology', 'Chemistry'], grade: 'Grade 9',
    source: 'social_media', status: 'new', branchId: 'br-002',
    createdAt: daysAgo(0),
  },
  {
    id: 'ld-010', parentName: 'Lead 10 Parent', parentEmail: 'lead10parent@example.com', parentPhone: '+971 52 306 4010',
    studentName: 'Lead 10', studentAge: 17, curriculum: 'A-Level', subjects: ['Mathematics', 'Physics', 'Computer Science'], grade: 'Year 12',
    source: 'referral', status: 'enrolled', assignedTo: 'u-sl-001', branchId: 'br-002',
    notes: 'Enrolled at the Al Majaz campus. Very high achiever — target Oxford Engineering.',
    createdAt: daysAgo(20), convertedAt: daysAgo(10),
  },
  {
    id: 'ld-011', parentName: 'Lead 11 Parent', parentEmail: 'lead11parent@example.com', parentPhone: '+971 50 407 5011',
    studentName: 'Lead 11', studentAge: 12, curriculum: 'IGCSE', subjects: ['Mathematics', 'English', 'Arabic'], grade: 'Grade 7',
    source: 'website', status: 'new', branchId: 'br-001',
    createdAt: daysAgo(0),
  },
  {
    id: 'ld-012', parentName: 'Lead 12 Parent', parentEmail: 'lead12parent@example.com', parentPhone: '+971 55 508 6012',
    studentName: 'Lead 12', studentAge: 16, curriculum: 'IGCSE', subjects: ['Mathematics', 'Computer Science'], grade: 'Grade 10',
    source: 'google_ads', status: 'lost', branchId: 'br-002',
    notes: 'Chose a competitor. Price was the main objection.',
    followUpDate: daysAgo(8), createdAt: daysAgo(12),
  },
];

// ── Invoices ──────────────────────────────────────────────────────────────────

export const invoices: Invoice[] = [
  {
    id: 'inv-001', invoiceNumber: 'INV-2024-001', studentId: 'st-001', parentId: 'pr-001', branchId: 'br-001',
    items: [{ description: 'IGCSE Physics — October 2024', amount: 1200, quantity: 1 }, { description: 'IGCSE Chemistry — October 2024', amount: 1200, quantity: 1 }],
    totalAmount: 2400, currency: 'AED', status: 'paid', dueDate: daysAgo(20), issuedDate: daysAgo(30), paidDate: daysAgo(22), paymentMethod: 'card',
  },
  {
    id: 'inv-002', invoiceNumber: 'INV-2024-002', studentId: 'st-002', parentId: 'pr-002', branchId: 'br-001',
    items: [{ description: 'A-Level Mathematics — October 2024', amount: 1400, quantity: 1 }, { description: 'IGCSE Physics — October 2024', amount: 1200, quantity: 1 }, { description: 'Registration Fee', amount: 500, quantity: 1 }],
    totalAmount: 3100, currency: 'AED', status: 'pending', dueDate: daysAgo(-3), issuedDate: daysAgo(5),
  },
  {
    id: 'inv-003', invoiceNumber: 'INV-2024-003', studentId: 'st-003', parentId: 'pr-009', branchId: 'br-002',
    items: [{ description: 'CBSE Mathematics — October 2024', amount: 1100, quantity: 1 }, { description: 'IGCSE Chemistry — October 2024', amount: 1200, quantity: 1 }],
    totalAmount: 2300, currency: 'AED', status: 'overdue', dueDate: daysAgo(10), issuedDate: daysAgo(20),
  },
  {
    id: 'inv-004', invoiceNumber: 'INV-2024-004', studentId: 'st-005', parentId: 'pr-003', branchId: 'br-001',
    items: [{ description: 'A-Level Mathematics — October 2024', amount: 1400, quantity: 1 }, { description: 'A-Level Physics — October 2024', amount: 1400, quantity: 1 }],
    totalAmount: 2800, currency: 'AED', status: 'paid', dueDate: daysAgo(15), issuedDate: daysAgo(25), paidDate: daysAgo(16), paymentMethod: 'bank_transfer',
  },
  {
    id: 'inv-005', invoiceNumber: 'INV-2024-005', studentId: 'st-006', parentId: 'pr-004', branchId: 'br-002',
    items: [{ description: 'CBSE Mathematics — November 2024', amount: 1100, quantity: 1 }, { description: 'CBSE Computer Science — November 2024', amount: 1100, quantity: 1 }],
    totalAmount: 2200, currency: 'AED', status: 'pending', dueDate: daysAgo(-5), issuedDate: daysAgo(3),
  },
  {
    id: 'inv-006', invoiceNumber: 'INV-2024-006', studentId: 'st-011', parentId: 'pr-006', branchId: 'br-001',
    items: [{ description: 'IGCSE Physics — November 2024', amount: 1200, quantity: 1 }, { description: 'A-Level Mathematics — November 2024', amount: 1400, quantity: 1 }, { description: 'IGCSE English — November 2024', amount: 1000, quantity: 1 }],
    totalAmount: 3600, currency: 'AED', status: 'paid', dueDate: daysAgo(12), issuedDate: daysAgo(22), paidDate: daysAgo(14), paymentMethod: 'cash',
  },
  {
    id: 'inv-007', invoiceNumber: 'INV-2024-007', studentId: 'st-008', parentId: 'pr-008', branchId: 'br-002',
    items: [{ description: 'A-Level Biology — November 2024', amount: 1300, quantity: 1 }, { description: 'A-Level Economics — November 2024', amount: 1300, quantity: 1 }],
    totalAmount: 2600, currency: 'AED', status: 'overdue', dueDate: daysAgo(7), issuedDate: daysAgo(17),
  },
  {
    id: 'inv-008', invoiceNumber: 'INV-2024-008', studentId: 'st-009', parentId: 'pr-008', branchId: 'br-002',
    items: [{ description: 'A-Level Biology — November 2024', amount: 1300, quantity: 1 }, { description: 'A-Level Economics — November 2024', amount: 1300, quantity: 1 }],
    totalAmount: 2600, currency: 'AED', status: 'paid', dueDate: daysAgo(14), issuedDate: daysAgo(24), paidDate: daysAgo(15), paymentMethod: 'card',
  },
  {
    id: 'inv-009', invoiceNumber: 'INV-2024-009', studentId: 'st-007', parentId: 'pr-005', branchId: 'br-001',
    items: [{ description: 'IGCSE Biology — November 2024', amount: 1200, quantity: 1 }, { description: 'IGCSE English — November 2024', amount: 1000, quantity: 1 }],
    totalAmount: 2200, currency: 'AED', status: 'overdue', dueDate: daysAgo(5), issuedDate: daysAgo(15),
  },
  {
    id: 'inv-010', invoiceNumber: 'INV-2024-010', studentId: 'st-001', parentId: 'pr-001', branchId: 'br-001',
    items: [{ description: 'IGCSE Physics — November 2024', amount: 1200, quantity: 1 }, { description: 'IGCSE Chemistry — November 2024', amount: 1200, quantity: 1 }, { description: 'IGCSE Biology — November 2024', amount: 1200, quantity: 1 }],
    totalAmount: 3600, currency: 'AED', status: 'pending', dueDate: daysAgo(-2), issuedDate: daysAgo(4),
  },
  {
    id: 'inv-011', invoiceNumber: 'INV-2024-011', studentId: 'st-002', parentId: 'pr-002', branchId: 'br-001',
    items: [{ description: 'A-Level Mathematics — November 2024', amount: 1400, quantity: 1 }, { description: 'A-Level Physics — November 2024', amount: 1400, quantity: 1 }],
    totalAmount: 2800, currency: 'AED', status: 'paid', dueDate: daysAgo(8), issuedDate: daysAgo(18), paidDate: daysAgo(9), paymentMethod: 'online',
  },
  {
    id: 'inv-012', invoiceNumber: 'INV-2024-012', studentId: 'st-012', parentId: 'pr-007', branchId: 'br-002',
    items: [{ description: 'A-Level Economics — November 2024', amount: 1300, quantity: 1 }],
    totalAmount: 1300, currency: 'AED', status: 'overdue', dueDate: daysAgo(18), issuedDate: daysAgo(28),
  },
  {
    id: 'inv-013', invoiceNumber: 'INV-2024-013', studentId: 'st-001', parentId: 'pr-001', branchId: 'br-001',
    items: [{ description: 'IGCSE Full Year Tuition — 3-Instalment Plan', amount: 7200, quantity: 1 }],
    totalAmount: 7200, currency: 'AED', status: 'partial', dueDate: daysAgo(-10), issuedDate: daysAgo(50), paidAmount: 4800,
  },
  {
    id: 'inv-014', invoiceNumber: 'INV-2024-014', studentId: 'st-002', parentId: 'pr-002', branchId: 'br-001',
    items: [{ description: 'A-Level Full Year Tuition — 4-Instalment Plan', amount: 9600, quantity: 1 }],
    totalAmount: 9600, currency: 'AED', status: 'overdue', dueDate: daysAgo(30), issuedDate: daysAgo(60), paidAmount: 2400,
  },
];

// ── Messages ──────────────────────────────────────────────────────────────────

export const messages: Message[] = [
  { id: 'msg-001', fromId: 'u-tc-001', toId: 'u-pr-001', subject: "Zaid's Progress — Physics", body: "Dear Mr. Al Farsi, Zaid has shown excellent improvement, scoring 85% in his Physics mock. He's particularly strong in forces and motion. Please ensure he completes Problem Set 3 due Wednesday. Best regards, Dr. Mitchell", isRead: false, sentAt: daysAgo(1), type: 'message' },
  { id: 'msg-002', fromId: 'u-fi-001', toId: 'u-pr-002', subject: 'Invoice INV-2024-002 — Payment Reminder', body: 'Dear Parent 2, Invoice INV-2024-002 for AED 3,100 is due on June 20th. Please log in to your parent portal to pay online. For queries: finance@platosplanet.ae', isRead: true, sentAt: daysAgo(2), type: 'notification' },
  { id: 'msg-003', fromId: 'u-pr-001', toId: 'u-tc-001', subject: "Re: Zaid's Progress", body: "Thank you Dr. Mitchell. We're very pleased. Could we schedule a parent-teacher meeting to discuss A-Level preparation?", isRead: false, sentAt: daysAgo(0), type: 'message' },
  { id: 'msg-004', fromId: 'u-tc-004', toId: 'u-pr-006', subject: "Student 12's Outstanding English Essay", body: "Dear Parent 12, I'm writing to let you know that Student 12's poetry analysis essay was exceptional — 47/50. I've recommended it for the school magazine. She has a real gift for literature. Kind regards, Staff 1", isRead: false, sentAt: daysAgo(3), type: 'message' },
  { id: 'msg-005', fromId: 'u-tc-005', toId: 'u-pr-008', subject: "Student 6's Genetics Test Results", body: "Dear Parent 6, Student 6 scored 54/60 (90%) in the Genetics test — one of the top scores in the cohort. He's ready for university-level biology. Well done to him! Staff 6", isRead: true, sentAt: daysAgo(5), type: 'message' },
  { id: 'msg-006', fromId: 'u-co-001', toId: 'u-tc-001', subject: 'Upcoming Mock Exam Schedule', body: "Dear Dr. Mitchell, Please submit the question paper for A-Level Pure 1 mock by Thursday EOD. Exam is scheduled for next week. Please ensure all students are notified. Dr. Ibrahim", isRead: false, sentAt: daysAgo(1), type: 'message' },
  { id: 'msg-007', fromId: 'u-fi-001', toId: 'u-pr-008', subject: 'Invoice INV-2024-007 — Overdue Notice', body: "Dear Parent 6, Invoice INV-2024-007 for AED 2,600 is now 7 days overdue. Please contact us urgently to avoid service interruption. finance@platosplanet.ae", isRead: false, sentAt: daysAgo(2), type: 'alert' },
  { id: 'msg-008', fromId: 'u-pr-003', toId: 'u-tc-001', subject: "Student 10's University Application Help", body: "Dr. Mitchell, Student 10 has received a conditional offer from Imperial College for Engineering. Could you write a supporting reference letter? He needs it by end of month. Thank you, Parent 10", isRead: false, sentAt: daysAgo(0), type: 'message' },
  { id: 'msg-009', fromId: 'u-tc-006', toId: 'u-pr-007', subject: "Student 8 — Attendance & Academic Warning", body: "Dear Parent 8, I need to bring to your attention that Student 8 has missed 5 of the last 8 Economics sessions and scored only 60% on his mock. We need an urgent meeting to discuss a support plan. Staff 7", isRead: false, sentAt: daysAgo(1), type: 'alert' },
  { id: 'msg-010', fromId: 'u-sa-001', toId: 'u-ba-001', subject: 'Al Qusais Q4 Targets', body: "Fatima, please ensure Al Qusais hits 180 enrolled students by December. Currently at 142. Focus on A-Level and IGCSE Grade 9-10 outreach. Let me know if you need marketing support. — Khalid", isRead: true, sentAt: daysAgo(4), type: 'message' },
];

// ── Meetings ──────────────────────────────────────────────────────────────────

export const meetings: Meeting[] = [
  { id: 'mt-001', requestedBy: 'u-pr-001', teacherId: 'u-tc-001', parentId: 'pr-001', studentId: 'st-001', branchId: 'br-001', scheduledAt: atTime(-3, 16), duration: 30, status: 'confirmed', agenda: 'Discuss A-Level preparation strategy and subject selection for Year 12.', type: 'parent_teacher' },
  { id: 'mt-002', requestedBy: 'u-co-001', teacherId: 'u-tc-002', parentId: 'pr-002', studentId: 'st-002', branchId: 'br-001', scheduledAt: atTime(-5, 11), duration: 45, status: 'pending', agenda: 'Quarterly academic review for Student 2.', type: 'academic_review' },
  { id: 'mt-003', requestedBy: 'u-tc-006', teacherId: 'u-tc-006', parentId: 'pr-007', studentId: 'st-012', branchId: 'br-002', scheduledAt: atTime(-2, 15), duration: 30, status: 'confirmed', agenda: 'Academic warning meeting — attendance and performance below threshold.', type: 'counselling' },
  { id: 'mt-004', requestedBy: 'u-pr-003', teacherId: 'u-tc-001', parentId: 'pr-003', studentId: 'st-005', branchId: 'br-001', scheduledAt: atTime(-7, 10), duration: 60, status: 'completed', agenda: 'University application reference letter and predicted grades for Imperial College.', notes: 'Agreed on A* predicted grade for Physics. Reference to be submitted by month end.', type: 'academic_review' },
  { id: 'mt-005', requestedBy: 'u-pr-004', teacherId: 'u-tc-003', parentId: 'pr-004', studentId: 'st-006', branchId: 'br-002', scheduledAt: atTime(-1, 17), duration: 30, status: 'pending', agenda: "Discuss Student 7's CBSE board exam preparation and study plan.", type: 'parent_teacher' },
  { id: 'mt-006', requestedBy: 'u-tc-004', teacherId: 'u-tc-004', parentId: 'pr-006', studentId: 'st-011', branchId: 'br-001', scheduledAt: atTime(-14, 9), duration: 20, status: 'completed', agenda: "Student 12's essay shortlisted for school magazine.", notes: 'Parent delighted. Agreed to submit essay. Discussed A-Level English Lit options.', type: 'parent_teacher' },
];

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications: Notification[] = [
  { id: 'notif-001', userId: 'u-pr-001', title: 'Attendance Alert', message: 'Zaid was marked late for Physics class on Monday.', type: 'warning', isRead: true, createdAt: daysAgo(0) },
  { id: 'notif-002', userId: 'u-st-001', title: 'Homework Due Tomorrow', message: "Newton's Laws — Problem Set 3 is due in 24 hours.", type: 'warning', isRead: false, createdAt: daysAgo(0) },
  { id: 'notif-003', userId: 'u-st-001', title: 'Achievement Unlocked!', message: 'You reached Mars! Keep going — Jupiter awaits.', type: 'success', isRead: false, createdAt: daysAgo(1) },
  { id: 'notif-004', userId: 'u-st-002', title: 'New Test Result', message: 'Your A-Level Physics Quantum Mock result is available: 79% (A).', type: 'info', isRead: false, createdAt: daysAgo(14) },
  { id: 'notif-005', userId: 'u-st-005', title: '🎉 34-Day Streak!', message: "You're on fire! 34 consecutive study days. Incredible dedication.", type: 'success', isRead: false, createdAt: daysAgo(0) },
  { id: 'notif-006', userId: 'u-pr-002', title: 'Fee Payment Due', message: 'Invoice INV-2024-002 for AED 3,100 is due in 3 days.', type: 'warning', isRead: true, createdAt: daysAgo(2) },
  { id: 'notif-007', userId: 'u-st-011', title: 'Top of the Class!', message: 'You scored 92% in IGCSE Physics Mock — highest in your batch. Outstanding!', type: 'success', isRead: false, createdAt: daysAgo(9) },
  { id: 'notif-008', userId: 'u-st-008', title: 'New Homework Assigned', message: 'Mr. O\'Brien has assigned: Enzymes — Reaction Rate Lab Report. Due in 1 day.', type: 'info', isRead: true, createdAt: daysAgo(4) },
  { id: 'notif-009', userId: 'u-pr-008', title: 'Overdue Invoice', message: 'Invoice INV-2024-007 for AED 2,600 is now overdue. Please settle immediately.', type: 'error', isRead: false, createdAt: daysAgo(2) },
  { id: 'notif-010', userId: 'u-st-012', title: 'Academic Warning', message: 'Your attendance has dropped to 37.5%. You risk losing your place. Please contact your teacher.', type: 'error', isRead: false, createdAt: daysAgo(1) },
  { id: 'notif-011', userId: 'u-pr-006', title: "Student 12's Essay in Magazine", message: "Student 12's poetry analysis will be featured in this term's school magazine. Congratulations!", type: 'success', isRead: false, createdAt: daysAgo(3) },
  { id: 'notif-012', userId: 'u-st-009', title: 'Meeting Scheduled', message: 'A parent-teacher meeting has been confirmed for next week with Staff 7.', type: 'info', isRead: true, createdAt: daysAgo(5) },

  // Role-specific notifications (per role, for the bell dropdown)
  { id: 'notif-013', userId: 'u-ba-001', title: 'Pending Approvals', message: '2 pending requests need your approval.', type: 'warning', isRead: false, createdAt: daysAgo(0), link: '/branch-admin/requests' },
  { id: 'notif-014', userId: 'u-ba-001', title: 'Attendance Drop', message: "Student 9's attendance dropped to 75%.", type: 'warning', isRead: false, createdAt: daysAgo(0), link: '/branch-admin/students' },
  { id: 'notif-015', userId: 'u-ba-001', title: 'New Enrolment', message: 'New student enrolled: Zaid Al Farsi (IGCSE Grade 10).', type: 'success', isRead: false, createdAt: daysAgo(1), link: '/branch-admin/students' },

  { id: 'notif-016', userId: 'u-sl-001', title: '🔴 Hot Lead', message: 'Lead 1 — trial class today.', type: 'error', isRead: false, createdAt: daysAgo(0), link: '/sales/leads' },
  { id: 'notif-017', userId: 'u-sl-001', title: 'Follow-up Overdue', message: 'Lead 5 follow-up is 1 day overdue.', type: 'warning', isRead: false, createdAt: daysAgo(0), link: '/sales/follow-ups' },
  { id: 'notif-018', userId: 'u-sl-001', title: 'New Lead', message: 'New lead received from WhatsApp: Lead 4.', type: 'info', isRead: false, createdAt: daysAgo(0), link: '/sales/leads' },

  { id: 'notif-019', userId: 'u-tc-001', title: 'Homework to Review', message: '3 homework submissions awaiting your review.', type: 'info', isRead: false, createdAt: daysAgo(0), link: '/teacher/homework' },
  { id: 'notif-020', userId: 'u-tc-001', title: 'Parent Message', message: "Parent message from Mohammed Al Farsi about Zaid's batch.", type: 'info', isRead: false, createdAt: daysAgo(0), link: '/teacher/messages' },

  { id: 'notif-021', userId: 'u-co-001', title: 'Intervention Required', message: 'Student 8 attendance: 37.5% — intervention required.', type: 'error', isRead: false, createdAt: daysAgo(0), link: '/coordinator/interventions' },
  { id: 'notif-022', userId: 'u-co-001', title: 'Curriculum Behind', message: 'A-Level Maths batch is behind on curriculum (25% coverage).', type: 'warning', isRead: false, createdAt: daysAgo(0), link: '/coordinator/syllabus' },

  { id: 'notif-023', userId: 'u-fi-001', title: 'Overdue Invoices', message: '4 overdue invoices require immediate follow-up (AED 8,400).', type: 'error', isRead: false, createdAt: daysAgo(0), link: '/finance/outstanding' },
  { id: 'notif-024', userId: 'u-fi-001', title: 'VAT Summary Ready', message: 'VAT Q2 2026 summary ready to review.', type: 'info', isRead: false, createdAt: daysAgo(0), link: '/finance/vat' },

  { id: 'notif-025', userId: 'u-sa-001', title: 'Go Live Setup', message: 'Go Live Setup is 38% complete — 15 checks remaining.', type: 'warning', isRead: false, createdAt: daysAgo(0), link: '/super-admin/go-live' },
  { id: 'notif-026', userId: 'u-sa-001', title: 'Overdue Invoices', message: '5 overdue invoices across all branches.', type: 'error', isRead: false, createdAt: daysAgo(0), link: '/super-admin/finance' },
  { id: 'notif-027', userId: 'u-sa-001', title: 'New Enquiry', message: 'New enquiry: Lead 4 (IGCSE) via WhatsApp.', type: 'info', isRead: false, createdAt: daysAgo(1), link: '/super-admin/admissions' },

  { id: 'notif-028', userId: 'u-pr-001', title: 'New Message', message: "New message from Dr. Sarah Mitchell about Zaid's Physics progress.", type: 'info', isRead: false, createdAt: daysAgo(0), link: '/parent/messages' },
  { id: 'notif-029', userId: 'u-pr-001', title: 'Invoice Due Soon', message: 'Invoice INV-2024-010 (AED 3,600) due in 2 days.', type: 'warning', isRead: false, createdAt: daysAgo(0), link: '/parent/fees' },
];

// ── Achievements ──────────────────────────────────────────────────────────────

export const achievements: Achievement[] = [
  { id: 'ach-001', title: 'First Step', description: 'Complete your first class', icon: '🚀', xpReward: 50, isUnlocked: true, unlockedAt: daysAgo(90), category: 'academic' },
  { id: 'ach-002', title: 'Week Warrior', description: 'Maintain a 7-day study streak', icon: '🔥', xpReward: 100, isUnlocked: true, unlockedAt: daysAgo(30), category: 'streak' },
  { id: 'ach-003', title: 'Perfect Attendance', description: 'Attend every class for one full month', icon: '⭐', xpReward: 200, isUnlocked: false, category: 'attendance' },
  { id: 'ach-004', title: 'Top of the Class', description: 'Score 90%+ in three consecutive tests', icon: '🏆', xpReward: 300, isUnlocked: false, category: 'academic' },
  { id: 'ach-005', title: 'Homework Hero', description: 'Submit 10 homework assignments on time', icon: '📚', xpReward: 150, isUnlocked: true, unlockedAt: daysAgo(14), category: 'homework' },
  { id: 'ach-006', title: 'Planet Explorer', description: 'Reach the Mars level', icon: '🪐', xpReward: 250, isUnlocked: true, unlockedAt: daysAgo(7), category: 'special' },
  { id: 'ach-007', title: 'Night Owl', description: 'Complete 5 homework assignments after 9pm', icon: '🦉', xpReward: 80, isUnlocked: true, unlockedAt: daysAgo(20), category: 'homework' },
  { id: 'ach-008', title: 'AI Scholar', description: 'Ask the AI Tutor 20 questions', icon: '🤖', xpReward: 120, isUnlocked: false, category: 'academic' },
  { id: 'ach-009', title: 'Comeback Kid', description: 'Improve your score by 20+ points after a retake', icon: '💪', xpReward: 180, isUnlocked: false, category: 'academic' },
  { id: 'ach-010', title: 'Speed Demon', description: 'Submit a homework within 1 hour of it being assigned', icon: '⚡', xpReward: 60, isUnlocked: true, unlockedAt: daysAgo(5), category: 'homework' },
  { id: 'ach-011', title: 'Consistent Champion', description: 'Maintain 90%+ attendance for an entire term', icon: '🎯', xpReward: 350, isUnlocked: false, category: 'attendance' },
  { id: 'ach-012', title: 'Jupiter Jumper', description: 'Reach the Jupiter planet level (5000 XP)', icon: '🌟', xpReward: 500, isUnlocked: false, category: 'special' },
];

// ── System Settings ───────────────────────────────────────────────────────────

export const settings: SystemSettings = {
  companyName: "Plato's Planet Digital",
  address: '305 & 312, SMJ-2, Damascus Street, Al Qusais, Dubai',
  phone: '+971 4 123 4567',
  email: 'hello@platosplanet.ae',
  website: 'https://platosplanet.ae',
  currency: 'AED',
  timezone: 'Asia/Dubai',
  academicYear: '2024-2025',
  vatNumber: 'TRN100234567890003',
  vatRate: 5,
  whatsappEnabled: false,
  isLive: false,
  currentTerm: 'Term 3',
  mode: 'demo',
};

// ── AI Conversations ──────────────────────────────────────────────────────────

export const conversations: AIConversation[] = [
  {
    id: 'conv-001', studentId: 'st-001', subject: 'Physics', topic: "Newton's Second Law",
    createdAt: daysAgo(1),
    messages: [
      { id: 'cm-001', role: 'user', content: "Can you explain Newton's Second Law with a worked example?", timestamp: daysAgo(1) },
      { id: 'cm-002', role: 'assistant', content: "Newton's Second Law states **F = ma**. A 5 kg box pushed with 20 N force has acceleration: a = F/m = 20/5 = **4 m/s²**. Want an IGCSE-style question with friction?", timestamp: daysAgo(1), saved: true },
    ],
  },
];

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const campaigns: Campaign[] = [
  { id: 'cmp-001', name: 'Back to School 2024', channel: 'social_media', branchId: 'br-001', startDate: daysAgo(40), endDate: daysAgo(10), budget: 8000, leadsGenerated: 34, conversions: 9, status: 'ended' },
  { id: 'cmp-002', name: 'Google Search — A-Level Prep', channel: 'google_ads', branchId: 'br-001', startDate: daysAgo(25), budget: 5000, leadsGenerated: 21, conversions: 5, status: 'active' },
  { id: 'cmp-003', name: 'Friend Referral Bonus', channel: 'referral', branchId: 'br-002', startDate: daysAgo(60), budget: 2000, leadsGenerated: 14, conversions: 6, status: 'active' },
  { id: 'cmp-004', name: 'WhatsApp Broadcast — CBSE Boards', channel: 'whatsapp', branchId: 'br-002', startDate: daysAgo(15), budget: 1200, leadsGenerated: 9, conversions: 2, status: 'active' },
  { id: 'cmp-005', name: 'Summer Camp Email Blast', channel: 'email', branchId: 'br-001', startDate: daysAgo(70), endDate: daysAgo(50), budget: 1500, leadsGenerated: 11, conversions: 3, status: 'ended' },
];

// ── Scholarship Applications ─────────────────────────────────────────────────

export const scholarships: ScholarshipApplication[] = [
  { id: 'sch-001', studentId: 'st-011', type: 'merit', requestedPercentage: 25, approvedPercentage: 20, reason: 'Top of class in IGCSE Physics & English, 9.2k XP, exceptional essay shortlisted for school magazine.', status: 'approved', submittedAt: daysAgo(20), reviewedBy: 'u-sa-001' },
  { id: 'sch-002', studentId: 'st-004', type: 'sibling', requestedPercentage: 10, reason: 'Younger sibling of an enrolled student (Student 9); family requesting multi-child discount.', status: 'pending', submittedAt: daysAgo(3) },
  { id: 'sch-003', studentId: 'st-009', type: 'need_based', requestedPercentage: 30, reason: 'Family relocated from Abu Dhabi to Sharjah after job loss; requesting financial assistance to continue A-Level prep at the Al Majaz campus.', status: 'pending', submittedAt: daysAgo(6) },
  { id: 'sch-004', studentId: 'st-012', type: 'merit', requestedPercentage: 15, approvedPercentage: 0, reason: 'Requested based on prior school record, but recent attendance (37.5%) and grades do not meet merit bar.', status: 'rejected', submittedAt: daysAgo(12), reviewedBy: 'u-sa-001' },
];

// ── Audit Log ─────────────────────────────────────────────────────────────────

export const auditLog: AuditLogEntry[] = [
  { id: 'aud-001', userId: 'u-sa-001', action: 'Updated system settings', entityType: 'Settings', details: 'Changed VAT rate from 0% to 5%.', timestamp: daysAgo(45), severity: 'warning' },
  { id: 'aud-002', userId: 'u-ba-001', action: 'Created branch admin account', entityType: 'User', entityId: 'u-ba-001', details: 'Provisioned new branch admin for the Al Qusais centre.', timestamp: daysAgo(200), severity: 'info' },
  { id: 'aud-003', userId: 'u-fi-001', action: 'Recorded payment', entityType: 'Invoice', entityId: 'inv-006', details: 'Marked INV-2024-006 as paid via cash, AED 3,600.', timestamp: daysAgo(14), severity: 'info' },
  { id: 'aud-004', userId: 'u-co-001', action: 'Approved assessment', entityType: 'Assessment', entityId: 'as-003', details: 'Approved A-Level Maths Pure 1 Test for scheduling.', timestamp: daysAgo(2), severity: 'info' },
  { id: 'aud-005', userId: 'u-sa-001', action: 'Deactivated branch admin', entityType: 'User', details: 'Temporarily deactivated a branch admin account pending HR review.', timestamp: daysAgo(60), severity: 'critical' },
  { id: 'aud-006', userId: 'u-tc-006', action: 'Flagged at-risk student', entityType: 'Student', entityId: 'st-012', details: 'Raised academic warning for Student 8 — attendance below 40%.', timestamp: daysAgo(1), severity: 'warning' },
  { id: 'aud-007', userId: 'u-sl-001', action: 'Converted lead to enrolment', entityType: 'Lead', entityId: 'ld-004', details: 'Lead ld-004 (Lead 6) converted to enrolled student.', timestamp: daysAgo(7), severity: 'info' },
  { id: 'aud-008', userId: 'u-sa-001', action: 'Exported financial report', entityType: 'Report', details: 'Exported Q4 revenue report (PDF) for board meeting.', timestamp: daysAgo(5), severity: 'info' },
  { id: 'aud-009', userId: 'u-ba-002', action: 'Failed login attempt', entityType: 'Auth', details: '3 failed login attempts before successful sign-in.', timestamp: daysAgo(9), severity: 'warning' },
  { id: 'aud-010', userId: 'u-sa-001', action: 'Toggled platform live status', entityType: 'Settings', details: 'isLive flag changed during Go-Live setup walkthrough.', timestamp: daysAgo(100), severity: 'critical' },
];

// ── Branch Requests ───────────────────────────────────────────────────────────

export const branchRequests: BranchRequest[] = [
  { id: 'req-001', branchId: 'br-001', requestedBy: 'u-tc-004', type: 'leave', title: 'Sick leave — 2 days', description: 'Requesting sick leave for Wed–Thu, will arrange cover for English batches.', status: 'pending', createdAt: daysAgo(1) },
  { id: 'req-002', branchId: 'br-001', requestedBy: 'u-tc-001', type: 'room_booking', title: 'Lab 1 for extra revision session', description: 'Need Lab 1 booked Saturday 2–4pm for A-Level Physics revision before mock exam.', status: 'approved', createdAt: daysAgo(4), resolvedAt: daysAgo(3) },
  { id: 'req-003', branchId: 'br-001', requestedBy: 'u-pr-001', type: 'parent_request', title: 'Request to switch Zaid\'s Biology batch', description: 'Current batch clashes with football practice — requesting move to a Tuesday/Friday slot.', status: 'pending', createdAt: daysAgo(2) },
  { id: 'req-004', branchId: 'br-002', requestedBy: 'u-tc-006', type: 'room_booking', title: 'Room 302 — parent counselling session', description: "Need a private room for the counselling meeting with Student 8's family.", status: 'approved', createdAt: daysAgo(3), resolvedAt: daysAgo(2) },
  { id: 'req-005', branchId: 'br-002', requestedBy: 'u-tc-003', type: 'resource', title: 'New projector for Computer Lab', description: 'Current projector flickers during CS lessons; requesting replacement before next term.', status: 'pending', createdAt: daysAgo(6) },
  { id: 'req-006', branchId: 'br-001', requestedBy: 'u-pr-006', type: 'parent_request', title: 'Extra practice papers for Student 12', description: 'Requesting additional past papers ahead of her English exam.', status: 'rejected', createdAt: daysAgo(10), resolvedAt: daysAgo(8) },
];

// ── Class Notes ───────────────────────────────────────────────────────────────

export const classNotes: ClassNote[] = [
  { id: 'note-001', batchId: 'ba-001', teacherId: 'tc-001', title: 'Forces & Motion — Lecture Slides', description: 'Full slide deck covering Newton\'s three laws with worked examples.', subject: 'Physics', fileType: 'slides', uploadedAt: daysAgo(9) },
  { id: 'note-002', batchId: 'ba-001', teacherId: 'tc-001', title: 'Free Body Diagram Cheat Sheet', subject: 'Physics', fileType: 'pdf', uploadedAt: daysAgo(6) },
  { id: 'note-003', batchId: 'ba-003', teacherId: 'tc-002', title: 'Organic Chemistry Naming Guide', description: 'IUPAC nomenclature rules with practice compounds.', subject: 'Chemistry', fileType: 'pdf', uploadedAt: daysAgo(4) },
  { id: 'note-004', batchId: 'ba-002', teacherId: 'tc-001', title: 'Integration by Parts — Worked Solutions', subject: 'Mathematics', fileType: 'pdf', uploadedAt: daysAgo(7) },
  { id: 'note-005', batchId: 'ba-007', teacherId: 'tc-004', title: 'Unseen Poetry — Annotation Techniques (Video)', subject: 'English', fileType: 'video', uploadedAt: daysAgo(11) },
  { id: 'note-006', batchId: 'ba-005', teacherId: 'tc-002', title: 'Mitosis vs Meiosis Diagram Pack', subject: 'Biology', fileType: 'slides', uploadedAt: daysAgo(2) },
  { id: 'note-007', batchId: 'ba-009', teacherId: 'tc-005', title: 'Genetics — Khan Academy Playlist', subject: 'Biology', fileType: 'link', uploadedAt: daysAgo(5) },
  { id: 'note-008', batchId: 'ba-010', teacherId: 'tc-006', title: 'Macroeconomics Mock — Mark Scheme', subject: 'Economics', fileType: 'pdf', uploadedAt: daysAgo(19) },
];

// ── Lesson Logs ───────────────────────────────────────────────────────────────

export const lessonLogs: LessonLog[] = [
  { id: 'log-001', batchId: 'ba-001', teacherId: 'tc-001', date: '2026-06-16',
    topicCovered: "Newton's Laws of Motion (completed chapters 4.1–4.3)",
    homeworkId: 'hw-001',
    nextClassPlan: 'Begin chapter 4.4 — Momentum and Impulse',
    privateNotes: 'Zaid needs extra help with vector components — schedule 10 min catch-up' },
  { id: 'log-002', batchId: 'ba-002', teacherId: 'tc-001', date: '2026-06-17',
    topicCovered: 'Integration by parts (practice problems)',
    homeworkId: 'hw-003',
    nextClassPlan: 'Integration by substitution',
    privateNotes: 'Student 2 progressing well — suggest past paper practice' },
];

// ── Syllabus Plans ────────────────────────────────────────────────────────────

export const syllabusPlans: SyllabusPlan[] = [
  { id: 'syl-001', batchId: 'ba-001', subject: 'Physics', curriculum: 'IGCSE', term: 'Term 2 2024-25', topics: [
    { title: 'Forces & Motion', weekNumber: 1, status: 'completed' },
    { title: 'Energy & Work', weekNumber: 3, status: 'completed' },
    { title: 'Waves', weekNumber: 5, status: 'completed' },
    { title: 'Electricity & Circuits', weekNumber: 7, status: 'in_progress' },
    { title: 'Magnetism', weekNumber: 9, status: 'pending' },
    { title: 'Nuclear Physics', weekNumber: 11, status: 'pending' },
  ] },
  { id: 'syl-002', batchId: 'ba-003', subject: 'Chemistry', curriculum: 'IGCSE', term: 'Term 2 2024-25', topics: [
    { title: 'Atomic Structure', weekNumber: 1, status: 'completed' },
    { title: 'Bonding', weekNumber: 3, status: 'completed' },
    { title: 'Organic Chemistry', weekNumber: 5, status: 'in_progress' },
    { title: 'Rates of Reaction', weekNumber: 8, status: 'pending' },
    { title: 'Electrolysis', weekNumber: 10, status: 'pending' },
  ] },
  { id: 'syl-003', batchId: 'ba-002', subject: 'Mathematics', curriculum: 'A-Level', term: 'Term 2 2024-25', topics: [
    { title: 'Algebra & Functions', weekNumber: 1, status: 'completed' },
    { title: 'Sequences & Series', weekNumber: 3, status: 'completed' },
    { title: 'Differentiation', weekNumber: 5, status: 'completed' },
    { title: 'Integration', weekNumber: 7, status: 'in_progress' },
    { title: 'Vectors', weekNumber: 10, status: 'pending' },
  ] },
  { id: 'syl-004', batchId: 'ba-010', subject: 'Economics', curriculum: 'A-Level', term: 'Term 2 2024-25', topics: [
    { title: 'Market Structures', weekNumber: 1, status: 'completed' },
    { title: 'Macroeconomic Indicators', weekNumber: 4, status: 'completed' },
    { title: 'Fiscal Policy', weekNumber: 7, status: 'in_progress' },
    { title: 'Monetary Policy', weekNumber: 9, status: 'pending' },
    { title: 'International Trade', weekNumber: 11, status: 'pending' },
  ] },
  { id: 'syl-005', batchId: 'ba-007', subject: 'English', curriculum: 'IGCSE', term: 'Term 2 2024-25', topics: [
    { title: 'Unseen Poetry Analysis', weekNumber: 1, status: 'completed' },
    { title: 'Persuasive Writing', weekNumber: 4, status: 'in_progress' },
    { title: 'Narrative Composition', weekNumber: 7, status: 'pending' },
    { title: 'Spoken Language Endorsement', weekNumber: 10, status: 'pending' },
  ] },
];

// ── Teacher Reviews ───────────────────────────────────────────────────────────

export const teacherReviews: TeacherReview[] = [
  { id: 'rev-001', teacherId: 'tc-001', reviewerId: 'u-co-001', date: daysAgo(15), category: 'lesson_observation', rating: 4.8, strengths: 'Exceptional command of subject, clear explanations, excellent pacing.', improvements: 'Could involve quieter students more during Q&A.', status: 'completed' },
  { id: 'rev-002', teacherId: 'tc-002', reviewerId: 'u-co-001', date: daysAgo(22), category: 'peer_review', rating: 4.5, strengths: 'Strong lab safety practices, engaging demonstrations.', improvements: 'Provide more worked examples before independent practice.', status: 'completed' },
  { id: 'rev-003', teacherId: 'tc-004', reviewerId: 'u-co-001', date: daysAgo(8), category: 'student_feedback', rating: 4.6, strengths: 'Students report feeling supported, great feedback turnaround on essays.', improvements: 'Some students would like more structured revision sessions.', status: 'completed' },
  { id: 'rev-004', teacherId: 'tc-006', reviewerId: 'u-co-001', date: daysAgo(3), category: 'lesson_observation', rating: 4.9, strengths: 'University-level rigor, excellent use of real-world UAE examples.', improvements: 'Consider differentiating pace for students who are behind.', status: 'completed' },
  { id: 'rev-005', teacherId: 'tc-003', reviewerId: 'u-co-001', date: daysAgo(-2), category: 'peer_review', rating: 0, strengths: '', improvements: '', status: 'draft' },
];

// ── Interventions ─────────────────────────────────────────────────────────────

export const interventions: Intervention[] = [
  { id: 'int-001', studentId: 'st-012', reason: 'Attendance dropped to 37.5%, mock exam score 60% (C grade), missed 5 of last 8 Economics sessions.', type: 'attendance', startDate: daysAgo(1), targetDate: daysAgo(-30), status: 'active', actions: ['Weekly check-in call with parent', 'Mandatory catch-up sessions for missed topics', 'Counselling meeting booked with Staff 7'], ownerId: 'u-tc-006' },
  { id: 'int-002', studentId: 'st-004', reason: 'Scored C grade in Waves Quiz (65%) — below target band for IGCSE Physics.', type: 'academic', startDate: daysAgo(20), targetDate: daysAgo(-10), status: 'monitoring', actions: ['Extra revision worksheet on longitudinal waves', 'Paired with high-performing peer for study group'], ownerId: 'u-tc-001' },
  { id: 'int-003', studentId: 'st-010', reason: 'Low XP and streak (880 XP, 3-day streak) suggest disengagement with platform and homework.', type: 'behavioral', startDate: daysAgo(10), targetDate: daysAgo(-20), status: 'monitoring', actions: ['AI Tutor usage encouraged for daily practice', 'Parent notified to encourage consistent study routine'], ownerId: 'u-co-001' },
  { id: 'int-004', studentId: 'st-007', reason: 'Missed Biology homework deadline twice in a row.', type: 'academic', startDate: daysAgo(40), targetDate: daysAgo(20), status: 'resolved', actions: ['One-on-one session with teacher', 'Homework reminders enabled'], ownerId: 'u-tc-002' },
];

// ── Payment Plans ─────────────────────────────────────────────────────────────

export const paymentPlans: PaymentPlan[] = [
  { id: 'pp-001', invoiceId: 'inv-003', studentId: 'st-003', createdAt: daysAgo(18), installments: [
    { dueDate: daysAgo(10), amount: 1150, status: 'paid' },
    { dueDate: daysAgo(-10), amount: 1150, status: 'pending' },
  ] },
  { id: 'pp-002', invoiceId: 'inv-007', studentId: 'st-008', createdAt: daysAgo(15), installments: [
    { dueDate: daysAgo(5), amount: 1300, status: 'overdue' },
    { dueDate: daysAgo(-25), amount: 1300, status: 'pending' },
  ] },
  { id: 'pp-003', invoiceId: 'inv-012', studentId: 'st-012', createdAt: daysAgo(25), installments: [
    { dueDate: daysAgo(20), amount: 433.33, status: 'paid' },
    { dueDate: daysAgo(-10), amount: 433.33, status: 'overdue' },
    { dueDate: daysAgo(-40), amount: 433.34, status: 'pending' },
  ] },
  { id: 'pp-004', invoiceId: 'inv-013', studentId: 'st-001', createdAt: daysAgo(50), installments: [
    { dueDate: daysAgo(50), amount: 2400, status: 'paid' },
    { dueDate: daysAgo(20), amount: 2400, status: 'paid' },
    { dueDate: daysAgo(-10), amount: 2400, status: 'pending' },
  ] },
  { id: 'pp-005', invoiceId: 'inv-014', studentId: 'st-002', createdAt: daysAgo(60), installments: [
    { dueDate: daysAgo(60), amount: 2400, status: 'paid' },
    { dueDate: daysAgo(30), amount: 2400, status: 'overdue' },
    { dueDate: daysAgo(-5), amount: 2400, status: 'pending' },
    { dueDate: daysAgo(-35), amount: 2400, status: 'pending' },
  ] },
];

// ── Expenses ──────────────────────────────────────────────────────────────────

export const expenses: Expense[] = [
  { id: 'exp-001', branchId: 'br-001', category: 'rent', description: 'Monthly rent — Al Qusais centre', amount: 45000, date: daysAgo(5), approvedBy: 'u-sa-001' },
  { id: 'exp-002', branchId: 'br-001', category: 'salaries', description: 'Teaching staff payroll — November', amount: 128000, date: daysAgo(3), approvedBy: 'u-sa-001' },
  { id: 'exp-003', branchId: 'br-001', category: 'utilities', description: 'DEWA electricity & water bill', amount: 6200, date: daysAgo(8) },
  { id: 'exp-004', branchId: 'br-002', category: 'rent', description: 'Monthly rent — Al Majaz centre', amount: 32000, date: daysAgo(5), approvedBy: 'u-sa-001' },
  { id: 'exp-005', branchId: 'br-002', category: 'marketing', description: 'WhatsApp broadcast campaign — CBSE boards', amount: 1200, date: daysAgo(15) },
  { id: 'exp-006', branchId: 'br-002', category: 'rent', description: 'Additional premises lease — Al Majaz expansion floor', amount: 38000, date: daysAgo(5), approvedBy: 'u-sa-001' },
  { id: 'exp-007', branchId: 'br-002', category: 'maintenance', description: 'Lab equipment repair — Room 301', amount: 2400, date: daysAgo(12) },
  { id: 'exp-008', branchId: 'br-001', category: 'supplies', description: 'Stationery and printed worksheets', amount: 1800, date: daysAgo(9) },
  { id: 'exp-009', branchId: 'br-001', category: 'marketing', description: 'Back to School 2024 social campaign', amount: 8000, date: daysAgo(40) },
  { id: 'exp-010', branchId: 'br-002', category: 'salaries', description: 'Teaching staff payroll — November', amount: 64000, date: daysAgo(3), approvedBy: 'u-sa-001' },
];

// ── Study Plans ───────────────────────────────────────────────────────────────

export const studyPlans: StudyPlan[] = [
  { studentId: 'st-001', subject: 'Chemistry', weeklyGoal: 6, generatedAt: daysAgo(2), topics: [
    { id: 'sp-001', title: 'Substitution Reactions Review', estimatedHours: 1.5, priority: 'high', completed: false, dueDate: daysAgo(-3) },
    { id: 'sp-002', title: 'Ester Naming Practice', estimatedHours: 1, priority: 'high', completed: true },
    { id: 'sp-003', title: 'Alkene Reactions Worksheet', estimatedHours: 1.5, priority: 'medium', completed: false, dueDate: daysAgo(-6) },
    { id: 'sp-004', title: 'Past Paper — Organic Chemistry', estimatedHours: 2, priority: 'low', completed: false, dueDate: daysAgo(-10) },
  ] },
];

// ── Programmes (enrichment / test-prep — Robotics, Brainobrain, Oratory, IELTS, SAT, NEET/IIT-JEE, Languages) ──

export const programmes: Programme[] = [
  { id: 'prog-001', name: 'Robotics Club', type: 'Robotics', branchId: 'br-001', instructorName: 'Staff 8', ageGroup: '8-14', studentIds: ['st-004', 'st-007'], status: 'active' },
  { id: 'prog-002', name: 'Brainobrain — Mental Arithmetic & Abacus', type: 'Brainobrain', branchId: 'br-002', instructorName: 'Staff 9', ageGroup: '6-15', studentIds: ['st-010'], status: 'active' },
  { id: 'prog-003', name: 'Oratory & Public Speaking', type: 'Oratory', branchId: 'br-001', instructorName: 'Staff 1', ageGroup: '10-17', studentIds: ['st-011'], status: 'active' },
  { id: 'prog-004', name: 'IELTS Preparation (IDP Accredited)', type: 'IELTS', branchId: 'br-001', instructorName: 'Staff 10', ageGroup: '16+', studentIds: ['st-002', 'st-005'], status: 'active' },
  { id: 'prog-005', name: 'SAT Preparation', type: 'SAT', branchId: 'br-002', instructorName: 'Staff 11', ageGroup: '15-18', studentIds: ['st-006'], status: 'active' },
  { id: 'prog-006', name: 'NEET & IIT-JEE Coaching', type: 'NEET-JEE', branchId: 'br-002', instructorName: 'Staff 12', ageGroup: '15-18', studentIds: ['st-003', 'st-010'], status: 'active' },
  { id: 'prog-007', name: 'Language Courses — Arabic & French', type: 'Languages', branchId: 'br-001', instructorName: 'Staff 13', ageGroup: 'All ages', studentIds: ['st-001'], status: 'active' },
  { id: 'prog-008', name: 'IELTS Preparation — Al Majaz', type: 'IELTS', branchId: 'br-002', instructorName: 'Staff 14', ageGroup: '16+', studentIds: ['st-008', 'st-009'], status: 'active' },
];

// ── Go-Live Configuration ─────────────────────────────────────────────────────

export const goLiveConfig: GoLiveConfig = {
  stripeKey: '', stripePublic: '', s3Bucket: '', s3Region: '', s3AccessKey: '',
  sendgridKey: '', fromEmail: '', fromName: '', wapiToken: '', wapiPhoneId: '',
  anthropicKey: '', openaiKey: '', privacyUrl: '', termsUrl: '', refundUrl: '',
  studentProApiKey: '', studentProSyncEnabled: false,
};

// ── Seed Data Export ──────────────────────────────────────────────────────────

export const seedData = {
  users, branches, students, teachers, parents, batches,
  attendance, homework, assessments, leads, invoices,
  messages, meetings, notifications, achievements, settings, conversations,
  campaigns, scholarships, auditLog, branchRequests, classNotes, lessonLogs,
  syllabusPlans, teacherReviews, interventions, paymentPlans, expenses, studyPlans,
  goLiveConfig, programmes,
};

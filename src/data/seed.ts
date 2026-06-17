import type {
  Branch, Student, Teacher, Parent, Batch, AttendanceRecord,
  Homework, Assessment, Lead, Invoice, Message, Meeting, Notification,
  SystemSettings, Achievement, User, AIConversation, AttendanceStatus
} from '@/types';

// ── Date helpers ──────────────────────────────────────────────────────────────

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };

// ── Branches ──────────────────────────────────────────────────────────────────

export const branches: Branch[] = [
  { id: 'br-001', name: 'Dubai Marina Centre', address: 'Marina Walk, Level 2', city: 'Dubai', country: 'UAE', phone: '+971 4 123 4567', email: 'marina@platosplanet.ae', adminId: 'u-ba-001', isActive: true, capacity: 200, establishedYear: 2020 },
  { id: 'br-002', name: 'Jumeirah Learning Hub', address: 'Jumeirah Beach Road, Block 3', city: 'Dubai', country: 'UAE', phone: '+971 4 234 5678', email: 'jumeirah@platosplanet.ae', adminId: 'u-ba-002', isActive: true, capacity: 150, establishedYear: 2021 },
  { id: 'br-003', name: 'Abu Dhabi Main Campus', address: 'Corniche Road, Tower 7', city: 'Abu Dhabi', country: 'UAE', phone: '+971 2 345 6789', email: 'abudhabi@platosplanet.ae', adminId: 'u-ba-003', isActive: true, capacity: 180, establishedYear: 2022 },
];

// ── Users ─────────────────────────────────────────────────────────────────────

export const users: User[] = [
  { id: 'u-sa-001', name: 'Khalid Al Rashid', email: 'khalid@platosplanet.ae', phone: '+971 50 111 2222', role: 'super_admin', isActive: true, createdAt: '2020-01-01', lastLogin: new Date().toISOString() },
  { id: 'u-ba-001', name: 'Fatima Hassan', email: 'fatima@platosplanet.ae', phone: '+971 50 222 3333', role: 'branch_admin', branchId: 'br-001', isActive: true, createdAt: '2020-06-01' },
  { id: 'u-ba-002', name: 'Omar Malik', email: 'omar@platosplanet.ae', phone: '+971 50 333 4444', role: 'branch_admin', branchId: 'br-002', isActive: true, createdAt: '2021-06-01' },
  { id: 'u-ba-003', name: 'Aisha Al Blooshi', email: 'aisha@platosplanet.ae', phone: '+971 50 444 5555', role: 'branch_admin', branchId: 'br-003', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-sl-001', name: 'Layla Nasser', email: 'layla@platosplanet.ae', phone: '+971 50 555 6666', role: 'sales', branchId: 'br-001', isActive: true, createdAt: '2021-01-01' },
  { id: 'u-tc-001', name: 'Dr. Sarah Mitchell', email: 'sarah@platosplanet.ae', phone: '+971 50 666 7777', role: 'teacher', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-tc-002', name: 'Mr. Rajan Pillai', email: 'rajan@platosplanet.ae', phone: '+971 50 777 8888', role: 'teacher', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-tc-003', name: 'Ms. Emily Chen', email: 'emily@platosplanet.ae', phone: '+971 50 888 9999', role: 'teacher', branchId: 'br-002', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-tc-004', name: 'Ms. Nadia Al Hashimi', email: 'nadia@platosplanet.ae', phone: '+971 50 910 1112', role: 'teacher', branchId: 'br-001', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-tc-005', name: 'Mr. James O\'Brien', email: 'james@platosplanet.ae', phone: '+971 50 112 1314', role: 'teacher', branchId: 'br-003', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-tc-006', name: 'Dr. Ananya Krishnan', email: 'ananya@platosplanet.ae', phone: '+971 50 131 4151', role: 'teacher', branchId: 'br-003', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-co-001', name: 'Dr. Yusuf Ibrahim', email: 'yusuf@platosplanet.ae', phone: '+971 50 999 0000', role: 'coordinator', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-fi-001', name: 'Priya Sharma', email: 'priya@platosplanet.ae', phone: '+971 50 100 2000', role: 'finance', branchId: 'br-001', isActive: true, createdAt: '2020-09-01' },
  { id: 'u-pr-001', name: 'Mohammed Al Farsi', email: 'mfarsi@gmail.com', phone: '+971 50 200 3000', role: 'parent', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-pr-002', name: 'Jennifer Thompson', email: 'jennifer@gmail.com', phone: '+971 50 300 4000', role: 'parent', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-pr-003', name: 'Hassan Al Khalil', email: 'hkhalil@gmail.com', phone: '+971 50 401 5001', role: 'parent', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-pr-004', name: 'Meera Iyer', email: 'meera.iyer@gmail.com', phone: '+971 55 502 6002', role: 'parent', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-pr-005', name: 'David Johnson', email: 'djohnson@icloud.com', phone: '+971 52 603 7003', role: 'parent', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-st-001', name: 'Zaid Al Farsi', email: 'zaid@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-st-002', name: 'Emma Thompson', email: 'emma@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-st-003', name: 'Aryan Patel', email: 'aryan@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2022-01-01' },
  { id: 'u-st-004', name: 'Nour Al Zaabi', email: 'nour@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-st-005', name: 'Rayan Al Khalil', email: 'rayan@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-st-006', name: 'Sofia Iyer', email: 'sofia@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-st-007', name: 'Mia Johnson', email: 'mia@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-st-008', name: 'Omar Khalid', email: 'omar.k@student.platosplanet.ae', role: 'student', branchId: 'br-003', isActive: true, createdAt: '2022-09-01' },
  { id: 'u-st-009', name: 'Lina Al Rashid', email: 'lina@student.platosplanet.ae', role: 'student', branchId: 'br-003', isActive: true, createdAt: '2023-01-01' },
  { id: 'u-st-010', name: 'Aditya Sharma', email: 'aditya@student.platosplanet.ae', role: 'student', branchId: 'br-002', isActive: true, createdAt: '2023-09-01' },
  { id: 'u-st-011', name: 'Mariam Al Suwaidi', email: 'mariam@student.platosplanet.ae', role: 'student', branchId: 'br-001', isActive: true, createdAt: '2021-09-01' },
  { id: 'u-st-012', name: 'Lucas Andrade', email: 'lucas@student.platosplanet.ae', role: 'student', branchId: 'br-003', isActive: true, createdAt: '2022-01-01' },
];

// ── Teachers ──────────────────────────────────────────────────────────────────

export const teachers: Teacher[] = [
  { id: 'tc-001', userId: 'u-tc-001', name: 'Dr. Sarah Mitchell', email: 'sarah@platosplanet.ae', phone: '+971 50 666 7777', branchId: 'br-001', subjects: ['Physics', 'Mathematics'], curriculums: ['IGCSE', 'A-Level'], qualification: 'PhD Physics, UCL', experience: 8, rating: 4.9, isActive: true, batchIds: ['ba-001', 'ba-002', 'ba-006'] },
  { id: 'tc-002', userId: 'u-tc-002', name: 'Mr. Rajan Pillai', email: 'rajan@platosplanet.ae', phone: '+971 50 777 8888', branchId: 'br-001', subjects: ['Chemistry', 'Biology'], curriculums: ['IGCSE', 'CBSE'], qualification: 'MSc Chemistry, IIT Bombay', experience: 6, rating: 4.7, isActive: true, batchIds: ['ba-003', 'ba-005'] },
  { id: 'tc-003', userId: 'u-tc-003', name: 'Ms. Emily Chen', email: 'emily@platosplanet.ae', phone: '+971 50 888 9999', branchId: 'br-002', subjects: ['Mathematics', 'Computer Science'], curriculums: ['IGCSE', 'A-Level', 'CBSE'], qualification: 'MSc Computer Science, NUS', experience: 5, rating: 4.8, isActive: true, batchIds: ['ba-004', 'ba-008'] },
  { id: 'tc-004', userId: 'u-tc-004', name: 'Ms. Nadia Al Hashimi', email: 'nadia@platosplanet.ae', phone: '+971 50 910 1112', branchId: 'br-001', subjects: ['English', 'History'], curriculums: ['IGCSE', 'A-Level'], qualification: 'MA English Literature, AUS', experience: 7, rating: 4.6, isActive: true, batchIds: ['ba-007'] },
  { id: 'tc-005', userId: 'u-tc-005', name: 'Mr. James O\'Brien', email: 'james@platosplanet.ae', phone: '+971 50 112 1314', branchId: 'br-003', subjects: ['Biology', 'Chemistry'], curriculums: ['IGCSE', 'A-Level'], qualification: 'MSc Biochemistry, Trinity College Dublin', experience: 9, rating: 4.8, isActive: true, batchIds: ['ba-009'] },
  { id: 'tc-006', userId: 'u-tc-006', name: 'Dr. Ananya Krishnan', email: 'ananya@platosplanet.ae', phone: '+971 50 131 4151', branchId: 'br-003', subjects: ['Mathematics', 'Economics'], curriculums: ['A-Level', 'IB'], qualification: 'PhD Economics, LSE', experience: 11, rating: 4.9, isActive: true, batchIds: ['ba-010'] },
];

// ── Parents ───────────────────────────────────────────────────────────────────

export const parents: Parent[] = [
  { id: 'pr-001', userId: 'u-pr-001', name: 'Mohammed Al Farsi', email: 'mfarsi@gmail.com', phone: '+971 50 200 3000', studentIds: ['st-001'], branchId: 'br-001' },
  { id: 'pr-002', userId: 'u-pr-002', name: 'Jennifer Thompson', email: 'jennifer@gmail.com', phone: '+971 50 300 4000', studentIds: ['st-002'], branchId: 'br-001' },
  { id: 'pr-003', userId: 'u-pr-003', name: 'Hassan Al Khalil', email: 'hkhalil@gmail.com', phone: '+971 50 401 5001', studentIds: ['st-005'], branchId: 'br-001' },
  { id: 'pr-004', userId: 'u-pr-004', name: 'Meera Iyer', email: 'meera.iyer@gmail.com', phone: '+971 55 502 6002', studentIds: ['st-006', 'st-010'], branchId: 'br-002' },
  { id: 'pr-005', userId: 'u-pr-005', name: 'David Johnson', email: 'djohnson@icloud.com', phone: '+971 52 603 7003', studentIds: ['st-007'], branchId: 'br-001' },
  { id: 'pr-006', name: 'Khalid Al Suwaidi', email: 'k.suwaidi@gmail.com', phone: '+971 50 704 8004', userId: 'u-pr-006', studentIds: ['st-011'], branchId: 'br-001' },
  { id: 'pr-007', name: 'Carlos Andrade', email: 'carlos.andrade@gmail.com', phone: '+971 55 805 9005', userId: 'u-pr-007', studentIds: ['st-012'], branchId: 'br-003' },
  { id: 'pr-008', name: 'Noura Al Rashid', email: 'n.alrashid@gmail.com', phone: '+971 50 906 0006', userId: 'u-pr-008', studentIds: ['st-008', 'st-009'], branchId: 'br-003' },
];

// ── Students ──────────────────────────────────────────────────────────────────

export const students: Student[] = [
  { id: 'st-001', userId: 'u-st-001', name: 'Zaid Al Farsi', email: 'zaid@student.platosplanet.ae', parentId: 'pr-001', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 10', enrollmentDate: '2021-09-01', status: 'active', xp: 3750, streak: 12, planet: 'Mars', subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'], batchIds: ['ba-001', 'ba-003'] },
  { id: 'st-002', userId: 'u-st-002', name: 'Emma Thompson', email: 'emma@student.platosplanet.ae', parentId: 'pr-002', branchId: 'br-001', curriculum: 'A-Level', grade: 'Year 12', enrollmentDate: '2022-01-01', status: 'active', xp: 6200, streak: 21, planet: 'Saturn', subjects: ['Mathematics', 'Physics', 'Computer Science'], batchIds: ['ba-001', 'ba-002'] },
  { id: 'st-003', userId: 'u-st-003', name: 'Aryan Patel', email: 'aryan@student.platosplanet.ae', branchId: 'br-002', curriculum: 'CBSE', grade: 'Class 11', enrollmentDate: '2022-01-01', status: 'active', xp: 1800, streak: 5, planet: 'Earth', subjects: ['Chemistry', 'Biology', 'Mathematics'], batchIds: ['ba-003', 'ba-004'] },
  { id: 'st-004', userId: 'u-st-004', name: 'Nour Al Zaabi', email: 'nour@student.platosplanet.ae', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 9', enrollmentDate: '2023-09-01', status: 'active', xp: 720, streak: 8, planet: 'Venus', subjects: ['Mathematics', 'English', 'Biology'], batchIds: ['ba-001', 'ba-007'] },
  { id: 'st-005', userId: 'u-st-005', name: 'Rayan Al Khalil', email: 'rayan@student.platosplanet.ae', parentId: 'pr-003', branchId: 'br-001', curriculum: 'A-Level', grade: 'Year 13', enrollmentDate: '2022-09-01', status: 'active', xp: 14200, streak: 34, planet: 'Neptune', subjects: ['Mathematics', 'Physics', 'Economics'], batchIds: ['ba-002', 'ba-006'] },
  { id: 'st-006', userId: 'u-st-006', name: 'Sofia Iyer', email: 'sofia@student.platosplanet.ae', parentId: 'pr-004', branchId: 'br-002', curriculum: 'CBSE', grade: 'Class 12', enrollmentDate: '2023-01-01', status: 'active', xp: 5100, streak: 15, planet: 'Jupiter', subjects: ['Chemistry', 'Biology', 'Mathematics'], batchIds: ['ba-004', 'ba-008'] },
  { id: 'st-007', userId: 'u-st-007', name: 'Mia Johnson', email: 'mia@student.platosplanet.ae', parentId: 'pr-005', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 11', enrollmentDate: '2023-09-01', status: 'active', xp: 1400, streak: 6, planet: 'Earth', subjects: ['English', 'History', 'Biology'], batchIds: ['ba-005', 'ba-007'] },
  { id: 'st-008', userId: 'u-st-008', name: 'Omar Khalid', email: 'omar.k@student.platosplanet.ae', parentId: 'pr-008', branchId: 'br-003', curriculum: 'A-Level', grade: 'Year 12', enrollmentDate: '2022-09-01', status: 'active', xp: 4600, streak: 18, planet: 'Jupiter', subjects: ['Biology', 'Chemistry', 'Mathematics'], batchIds: ['ba-009', 'ba-010'] },
  { id: 'st-009', userId: 'u-st-009', name: 'Lina Al Rashid', email: 'lina@student.platosplanet.ae', parentId: 'pr-008', branchId: 'br-003', curriculum: 'IGCSE', grade: 'Grade 10', enrollmentDate: '2023-01-01', status: 'active', xp: 2200, streak: 9, planet: 'Earth', subjects: ['Mathematics', 'Physics', 'Economics'], batchIds: ['ba-009', 'ba-010'] },
  { id: 'st-010', userId: 'u-st-010', name: 'Aditya Sharma', email: 'aditya@student.platosplanet.ae', parentId: 'pr-004', branchId: 'br-002', curriculum: 'CBSE', grade: 'Class 11', enrollmentDate: '2023-09-01', status: 'active', xp: 880, streak: 3, planet: 'Venus', subjects: ['Mathematics', 'Computer Science'], batchIds: ['ba-004', 'ba-008'] },
  { id: 'st-011', userId: 'u-st-011', name: 'Mariam Al Suwaidi', email: 'mariam@student.platosplanet.ae', parentId: 'pr-006', branchId: 'br-001', curriculum: 'IGCSE', grade: 'Grade 10', enrollmentDate: '2021-09-01', status: 'active', xp: 9200, streak: 28, planet: 'Saturn', subjects: ['Mathematics', 'Physics', 'English', 'History'], batchIds: ['ba-001', 'ba-002', 'ba-007'] },
  { id: 'st-012', userId: 'u-st-012', name: 'Lucas Andrade', email: 'lucas@student.platosplanet.ae', parentId: 'pr-007', branchId: 'br-003', curriculum: 'A-Level', grade: 'Year 13', enrollmentDate: '2022-01-01', status: 'suspended', xp: 2900, streak: 0, planet: 'Mars', subjects: ['Mathematics', 'Economics'], batchIds: ['ba-010'] },
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
  { id: 'ba-009', name: 'A-Level Biology — Year 12 (Mon/Wed)', branchId: 'br-003', teacherId: 'tc-005', subject: 'Biology', curriculum: 'A-Level', grade: 'Year 12', studentIds: ['st-008', 'st-009'], maxCapacity: 10, schedule: [{ day: 'Mon', startTime: '16:00', endTime: '18:00' }, { day: 'Wed', startTime: '16:00', endTime: '18:00' }], status: 'active', room: 'Room 301', startDate: '2024-09-01' },
  { id: 'ba-010', name: 'A-Level Economics — Year 12/13 (Tue/Thu)', branchId: 'br-003', teacherId: 'tc-006', subject: 'Economics', curriculum: 'A-Level', grade: 'Year 12', studentIds: ['st-008', 'st-009', 'st-012'], maxCapacity: 12, schedule: [{ day: 'Tue', startTime: '15:00', endTime: '17:00' }, { day: 'Thu', startTime: '15:00', endTime: '17:00' }], status: 'active', room: 'Room 302', startDate: '2024-09-01' },
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
  // ba-009 — A-Level Biology (Mon/Wed) Abu Dhabi
  ...genAtt(230, 'ba-009', ['st-008','st-009'], 'tc-005',
    [0,2,7,9,14,16,21,23],
    {
      'st-008': ['present','present','present','present','present','late','present','present'],
      'st-009': ['present','present','absent','present','present','present','present','present'],
    }
  ),
  // ba-010 — A-Level Economics (Tue/Thu) Abu Dhabi
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
    id: 'ld-001', parentName: 'Ahmed Al Mansouri', parentEmail: 'ahmed.mansouri@gmail.com', parentPhone: '+971 50 400 5001',
    studentName: 'Sara Al Mansouri', studentAge: 15, curriculum: 'IGCSE', subjects: ['Mathematics', 'Physics'], grade: 'Grade 10',
    source: 'referral', status: 'trial_scheduled', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: 'Father is a doctor. Very keen on A* grades. Trial class booked for Wednesday.',
    followUpDate: daysAgo(-1), trialDate: daysAgo(-1), createdAt: daysAgo(5),
  },
  {
    id: 'ld-002', parentName: 'Rajesh Kumar', parentEmail: 'rajesh.kumar@hotmail.com', parentPhone: '+971 55 500 6002',
    studentName: 'Priya Kumar', studentAge: 16, curriculum: 'CBSE', subjects: ['Chemistry', 'Biology'], grade: 'Class 11',
    source: 'google_ads', status: 'contacted', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: 'Interested in medical entrance prep alongside CBSE. Wants weekend batches only.',
    followUpDate: daysAgo(-2), createdAt: daysAgo(3),
  },
  {
    id: 'ld-003', parentName: 'Claire Williams', parentEmail: 'claire.williams@icloud.com', parentPhone: '+971 52 600 7003',
    studentName: 'Jack Williams', studentAge: 17, curriculum: 'A-Level', subjects: ['Mathematics', 'Computer Science'], grade: 'Year 12',
    source: 'walk_in', status: 'new', branchId: 'br-002', createdAt: daysAgo(1),
  },
  {
    id: 'ld-004', parentName: 'Fatima Saeed', parentEmail: 'fatima.saeed@gmail.com', parentPhone: '+971 56 700 8004',
    studentName: 'Ali Saeed', studentAge: 14, curriculum: 'IGCSE', subjects: ['English', 'Biology', 'Mathematics'], grade: 'Grade 9',
    source: 'social_media', status: 'enrolled', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: 'Successfully enrolled. Started October batch.',
    createdAt: daysAgo(15), convertedAt: daysAgo(7),
  },
  {
    id: 'ld-005', parentName: 'Tariq Al Zaabi', parentEmail: 'tariq.alzaabi@gmail.com', parentPhone: '+971 50 801 9005',
    studentName: 'Hessa Al Zaabi', studentAge: 13, curriculum: 'IGCSE', subjects: ['Mathematics', 'English'], grade: 'Grade 8',
    source: 'whatsapp', status: 'new', branchId: 'br-001',
    notes: 'Sent inquiry via WhatsApp at 10pm. Prefers Arabic-speaking teacher.',
    createdAt: daysAgo(0),
  },
  {
    id: 'ld-006', parentName: 'Sunita Menon', parentEmail: 'sunita.menon@yahoo.com', parentPhone: '+971 55 902 0006',
    studentName: 'Rohan Menon', studentAge: 15, curriculum: 'CBSE', subjects: ['Physics', 'Chemistry', 'Mathematics'], grade: 'Class 10',
    source: 'referral', status: 'trial_done', assignedTo: 'u-sl-001', branchId: 'br-001',
    notes: 'Referred by Aryan Patel\'s family. Trial went well. Waiting for parent decision.',
    followUpDate: daysAgo(-3), trialDate: daysAgo(4), createdAt: daysAgo(7),
  },
  {
    id: 'ld-007', parentName: 'Robert Chen', parentEmail: 'rchen@gmail.com', parentPhone: '+971 52 003 1007',
    studentName: 'Alice Chen', studentAge: 16, curriculum: 'A-Level', subjects: ['Mathematics', 'Economics', 'Business Studies'], grade: 'Year 11',
    source: 'google_ads', status: 'contacted', assignedTo: 'u-sl-001', branchId: 'br-003',
    notes: 'Interested in university prep for UK unis. Parents are expats from Hong Kong.',
    followUpDate: daysAgo(-1), createdAt: daysAgo(4),
  },
  {
    id: 'ld-008', parentName: 'Waleed Al Hamdan', parentEmail: 'w.hamdan@outlook.com', parentPhone: '+971 50 104 2008',
    studentName: 'Yousef Al Hamdan', studentAge: 18, curriculum: 'A-Level', subjects: ['Physics', 'Mathematics'], grade: 'Year 13',
    source: 'walk_in', status: 'contacted', branchId: 'br-001',
    notes: 'Retaking A-Levels. Needs intensive revision for June exams. Very motivated.',
    followUpDate: daysAgo(0), createdAt: daysAgo(2),
  },
  {
    id: 'ld-009', parentName: 'Anita Pillai', parentEmail: 'a.pillai@gmail.com', parentPhone: '+971 55 205 3009',
    studentName: 'Kavya Pillai', studentAge: 14, curriculum: 'IGCSE', subjects: ['Biology', 'Chemistry'], grade: 'Grade 9',
    source: 'social_media', status: 'new', branchId: 'br-002',
    createdAt: daysAgo(0),
  },
  {
    id: 'ld-010', parentName: 'Patrick O\'Sullivan', parentEmail: 'p.osullivan@icloud.com', parentPhone: '+971 52 306 4010',
    studentName: 'Conor O\'Sullivan', studentAge: 17, curriculum: 'A-Level', subjects: ['Mathematics', 'Physics', 'Computer Science'], grade: 'Year 12',
    source: 'referral', status: 'enrolled', assignedTo: 'u-sl-001', branchId: 'br-003',
    notes: 'Enrolled for Abu Dhabi campus. Very high achiever — target Oxford Engineering.',
    createdAt: daysAgo(20), convertedAt: daysAgo(10),
  },
  {
    id: 'ld-011', parentName: 'Hind Al Marzouqi', parentEmail: 'hind.marzouqi@gmail.com', parentPhone: '+971 50 407 5011',
    studentName: 'Hamdan Al Marzouqi', studentAge: 12, curriculum: 'IGCSE', subjects: ['Mathematics', 'English', 'Arabic'], grade: 'Grade 7',
    source: 'website', status: 'new', branchId: 'br-001',
    createdAt: daysAgo(0),
  },
  {
    id: 'ld-012', parentName: 'Maria Santos', parentEmail: 'maria.santos@gmail.com', parentPhone: '+971 55 508 6012',
    studentName: 'Gabriel Santos', studentAge: 16, curriculum: 'IGCSE', subjects: ['Mathematics', 'Computer Science'], grade: 'Grade 10',
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
    id: 'inv-003', invoiceNumber: 'INV-2024-003', studentId: 'st-003', parentId: 'pr-001', branchId: 'br-002',
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
    id: 'inv-007', invoiceNumber: 'INV-2024-007', studentId: 'st-008', parentId: 'pr-008', branchId: 'br-003',
    items: [{ description: 'A-Level Biology — November 2024', amount: 1300, quantity: 1 }, { description: 'A-Level Economics — November 2024', amount: 1300, quantity: 1 }],
    totalAmount: 2600, currency: 'AED', status: 'overdue', dueDate: daysAgo(7), issuedDate: daysAgo(17),
  },
  {
    id: 'inv-008', invoiceNumber: 'INV-2024-008', studentId: 'st-009', parentId: 'pr-008', branchId: 'br-003',
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
    id: 'inv-012', invoiceNumber: 'INV-2024-012', studentId: 'st-012', parentId: 'pr-007', branchId: 'br-003',
    items: [{ description: 'A-Level Economics — November 2024', amount: 1300, quantity: 1 }],
    totalAmount: 1300, currency: 'AED', status: 'overdue', dueDate: daysAgo(18), issuedDate: daysAgo(28),
  },
];

// ── Messages ──────────────────────────────────────────────────────────────────

export const messages: Message[] = [
  { id: 'msg-001', fromId: 'u-tc-001', toId: 'u-pr-001', subject: "Zaid's Progress — Physics", body: "Dear Mr. Al Farsi, Zaid has shown excellent improvement, scoring 85% in his Physics mock. He's particularly strong in forces and motion. Please ensure he completes Problem Set 3 due Wednesday. Best regards, Dr. Mitchell", isRead: false, sentAt: daysAgo(1), type: 'message' },
  { id: 'msg-002', fromId: 'u-fi-001', toId: 'u-pr-002', subject: 'Invoice INV-2024-002 — Payment Reminder', body: 'Dear Ms. Thompson, Invoice INV-2024-002 for AED 3,100 is due on June 20th. Please log in to your parent portal to pay online. For queries: finance@platosplanet.ae', isRead: true, sentAt: daysAgo(2), type: 'notification' },
  { id: 'msg-003', fromId: 'u-pr-001', toId: 'u-tc-001', subject: "Re: Zaid's Progress", body: "Thank you Dr. Mitchell. We're very pleased. Could we schedule a parent-teacher meeting to discuss A-Level preparation?", isRead: false, sentAt: daysAgo(0), type: 'message' },
  { id: 'msg-004', fromId: 'u-tc-004', toId: 'u-pr-006', subject: "Mariam's Outstanding English Essay", body: "Dear Mr. Al Suwaidi, I'm writing to let you know that Mariam's poetry analysis essay was exceptional — 47/50. I've recommended it for the school magazine. She has a real gift for literature. Kind regards, Ms. Al Hashimi", isRead: false, sentAt: daysAgo(3), type: 'message' },
  { id: 'msg-005', fromId: 'u-tc-005', toId: 'u-pr-008', subject: "Omar's Genetics Test Results", body: "Dear Ms. Al Rashid, Omar scored 54/60 (90%) in the Genetics test — one of the top scores in the cohort. He's ready for university-level biology. Well done to him! Mr. O'Brien", isRead: true, sentAt: daysAgo(5), type: 'message' },
  { id: 'msg-006', fromId: 'u-co-001', toId: 'u-tc-001', subject: 'Upcoming Mock Exam Schedule', body: "Dear Dr. Mitchell, Please submit the question paper for A-Level Pure 1 mock by Thursday EOD. Exam is scheduled for next week. Please ensure all students are notified. Dr. Ibrahim", isRead: false, sentAt: daysAgo(1), type: 'message' },
  { id: 'msg-007', fromId: 'u-fi-001', toId: 'u-pr-008', subject: 'Invoice INV-2024-007 — Overdue Notice', body: "Dear Ms. Al Rashid, Invoice INV-2024-007 for AED 2,600 is now 7 days overdue. Please contact us urgently to avoid service interruption. finance@platosplanet.ae", isRead: false, sentAt: daysAgo(2), type: 'alert' },
  { id: 'msg-008', fromId: 'u-pr-003', toId: 'u-tc-001', subject: "Rayan's University Application Help", body: "Dr. Mitchell, Rayan has received a conditional offer from Imperial College for Engineering. Could you write a supporting reference letter? He needs it by end of month. Thank you, Hassan Al Khalil", isRead: false, sentAt: daysAgo(0), type: 'message' },
  { id: 'msg-009', fromId: 'u-tc-006', toId: 'u-pr-007', subject: "Lucas — Attendance & Academic Warning", body: "Dear Mr. Andrade, I need to bring to your attention that Lucas has missed 5 of the last 8 Economics sessions and scored only 60% on his mock. We need an urgent meeting to discuss a support plan. Dr. Krishnan", isRead: false, sentAt: daysAgo(1), type: 'alert' },
  { id: 'msg-010', fromId: 'u-sa-001', toId: 'u-ba-001', subject: 'Dubai Marina Q4 Targets', body: "Fatima, please ensure Dubai Marina hits 180 enrolled students by December. Currently at 142. Focus on A-Level and IGCSE Grade 9-10 outreach. Let me know if you need marketing support. — Khalid", isRead: true, sentAt: daysAgo(4), type: 'message' },
];

// ── Meetings ──────────────────────────────────────────────────────────────────

export const meetings: Meeting[] = [
  { id: 'mt-001', requestedBy: 'u-pr-001', teacherId: 'u-tc-001', parentId: 'pr-001', studentId: 'st-001', branchId: 'br-001', scheduledAt: daysAgo(-3), duration: 30, status: 'confirmed', agenda: 'Discuss A-Level preparation strategy and subject selection for Year 12.', type: 'parent_teacher' },
  { id: 'mt-002', requestedBy: 'u-co-001', teacherId: 'u-tc-002', parentId: 'pr-002', studentId: 'st-002', branchId: 'br-001', scheduledAt: daysAgo(-5), duration: 45, status: 'pending', agenda: 'Quarterly academic review for Emma Thompson.', type: 'academic_review' },
  { id: 'mt-003', requestedBy: 'u-tc-006', teacherId: 'u-tc-006', parentId: 'pr-007', studentId: 'st-012', branchId: 'br-003', scheduledAt: daysAgo(-2), duration: 30, status: 'confirmed', agenda: 'Academic warning meeting — attendance and performance below threshold.', type: 'counselling' },
  { id: 'mt-004', requestedBy: 'u-pr-003', teacherId: 'u-tc-001', parentId: 'pr-003', studentId: 'st-005', branchId: 'br-001', scheduledAt: daysAgo(-7), duration: 60, status: 'completed', agenda: 'University application reference letter and predicted grades for Imperial College.', notes: 'Agreed on A* predicted grade for Physics. Reference to be submitted by month end.', type: 'academic_review' },
  { id: 'mt-005', requestedBy: 'u-pr-004', teacherId: 'u-tc-003', parentId: 'pr-004', studentId: 'st-006', branchId: 'br-002', scheduledAt: daysAgo(-1), duration: 30, status: 'pending', agenda: 'Discuss Sofia\'s CBSE board exam preparation and study plan.', type: 'parent_teacher' },
  { id: 'mt-006', requestedBy: 'u-tc-004', teacherId: 'u-tc-004', parentId: 'pr-006', studentId: 'st-011', branchId: 'br-001', scheduledAt: daysAgo(-14), duration: 20, status: 'completed', agenda: 'Mariam\'s essay shortlisted for school magazine.', notes: 'Parent delighted. Agreed to submit essay. Discussed A-Level English Lit options.', type: 'parent_teacher' },
];

// ── Notifications ─────────────────────────────────────────────────────────────

export const notifications: Notification[] = [
  { id: 'notif-001', userId: 'u-pr-001', title: 'Attendance Alert', message: 'Zaid was marked late for Physics class on Monday.', type: 'warning', isRead: false, createdAt: daysAgo(0) },
  { id: 'notif-002', userId: 'u-st-001', title: 'Homework Due Tomorrow', message: "Newton's Laws — Problem Set 3 is due in 24 hours.", type: 'warning', isRead: false, createdAt: daysAgo(0) },
  { id: 'notif-003', userId: 'u-st-001', title: 'Achievement Unlocked!', message: 'You reached Mars! Keep going — Jupiter awaits.', type: 'success', isRead: false, createdAt: daysAgo(1) },
  { id: 'notif-004', userId: 'u-st-002', title: 'New Test Result', message: 'Your A-Level Physics Quantum Mock result is available: 79% (A).', type: 'info', isRead: false, createdAt: daysAgo(14) },
  { id: 'notif-005', userId: 'u-st-005', title: '🎉 34-Day Streak!', message: "You're on fire! 34 consecutive study days. Incredible dedication.", type: 'success', isRead: false, createdAt: daysAgo(0) },
  { id: 'notif-006', userId: 'u-pr-002', title: 'Fee Payment Due', message: 'Invoice INV-2024-002 for AED 3,100 is due in 3 days.', type: 'warning', isRead: true, createdAt: daysAgo(2) },
  { id: 'notif-007', userId: 'u-st-011', title: 'Top of the Class!', message: 'You scored 92% in IGCSE Physics Mock — highest in your batch. Outstanding!', type: 'success', isRead: false, createdAt: daysAgo(9) },
  { id: 'notif-008', userId: 'u-st-008', title: 'New Homework Assigned', message: 'Mr. O\'Brien has assigned: Enzymes — Reaction Rate Lab Report. Due in 1 day.', type: 'info', isRead: true, createdAt: daysAgo(4) },
  { id: 'notif-009', userId: 'u-pr-008', title: 'Overdue Invoice', message: 'Invoice INV-2024-007 for AED 2,600 is now overdue. Please settle immediately.', type: 'error', isRead: false, createdAt: daysAgo(2) },
  { id: 'notif-010', userId: 'u-st-012', title: 'Academic Warning', message: 'Your attendance has dropped to 37.5%. You risk losing your place. Please contact your teacher.', type: 'error', isRead: false, createdAt: daysAgo(1) },
  { id: 'notif-011', userId: 'u-pr-006', title: "Mariam's Essay in Magazine", message: "Mariam's poetry analysis will be featured in this term's school magazine. Congratulations!", type: 'success', isRead: false, createdAt: daysAgo(3) },
  { id: 'notif-012', userId: 'u-st-009', title: 'Meeting Scheduled', message: 'A parent-teacher meeting has been confirmed for next week with Dr. Krishnan.', type: 'info', isRead: true, createdAt: daysAgo(5) },
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
  address: 'Dubai Marina, Tower 1, Level 12',
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
};

// ── AI Conversations ──────────────────────────────────────────────────────────

export const conversations: AIConversation[] = [
  {
    id: 'conv-001', studentId: 'st-001', subject: 'Physics', topic: "Newton's Second Law",
    createdAt: daysAgo(1),
    messages: [
      { id: 'cm-001', role: 'user', content: "Can you explain Newton's Second Law with a worked example?", timestamp: daysAgo(1) },
      { id: 'cm-002', role: 'assistant', content: "Newton's Second Law states **F = ma**. A 5 kg box pushed with 20 N force has acceleration: a = F/m = 20/5 = **4 m/s²**. Want an IGCSE-style question with friction?", timestamp: daysAgo(1) },
    ],
  },
];

// ── Seed Data Export ──────────────────────────────────────────────────────────

export const seedData = {
  users, branches, students, teachers, parents, batches,
  attendance, homework, assessments, leads, invoices,
  messages, meetings, notifications, achievements, settings, conversations,
};

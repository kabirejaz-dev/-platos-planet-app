import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/Toaster'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// Super Admin
import SuperAdminDashboard from '@/pages/super-admin/SuperAdminDashboard'
import BranchesPage from '@/pages/super-admin/BranchesPage'
import UsersPage from '@/pages/super-admin/UsersPage'
import GoLivePage from '@/pages/super-admin/GoLivePage'

// Branch Admin
import BranchAdminDashboard from '@/pages/branch-admin/BranchAdminDashboard'
import StudentsPage from '@/pages/branch-admin/StudentsPage'
import BatchesPage from '@/pages/branch-admin/BatchesPage'

// Sales
import SalesDashboard from '@/pages/sales/SalesDashboard'
import LeadsPage from '@/pages/sales/LeadsPage'
import FollowUpsPage from '@/pages/sales/FollowUpsPage'

// Teacher
import TeacherDashboard from '@/pages/teacher/TeacherDashboard'
import ClassesPage from '@/pages/teacher/ClassesPage'
import AttendancePage from '@/pages/teacher/AttendancePage'
import HomeworkPage from '@/pages/teacher/HomeworkPage'
import TestsPage from '@/pages/teacher/TestsPage'
import StudentProgressPage from '@/pages/teacher/StudentProgressPage'

// Coordinator
import CoordinatorDashboard from '@/pages/coordinator/CoordinatorDashboard'

// Finance
import FinanceDashboard from '@/pages/finance/FinanceDashboard'
import InvoicesPage from '@/pages/finance/InvoicesPage'
import OutstandingFeesPage from '@/pages/finance/OutstandingFeesPage'

// Parent
import ParentDashboard from '@/pages/parent/ParentDashboard'
import ParentAttendancePage from '@/pages/parent/ParentAttendancePage'
import ParentHomeworkPage from '@/pages/parent/ParentHomeworkPage'
import ParentFeesPage from '@/pages/parent/ParentFeesPage'

// Student
import StudentDashboard from '@/pages/student/StudentDashboard'
import StudentHomeworkPage from '@/pages/student/StudentHomeworkPage'
import StudentTestsPage from '@/pages/student/StudentTestsPage'
import AchievementsPage from '@/pages/student/AchievementsPage'

// AI Tutor
import AITutorPage from '@/pages/ai-tutor/AITutorPage'

// Shared
import MessagesPage from '@/pages/shared/MessagesPage'

// Stub pages for secondary routes
function StubPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4D7CFF]/20 to-[#7B61FF]/20 border border-[#4D7CFF]/20 flex items-center justify-center mb-4">
        <span className="text-2xl">📋</span>
      </div>
      <h2 className="text-xl font-bold text-foreground font-display mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{description || 'This section is fully wired up to shared data. Content populates as you add data through other sections.'}</p>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleRoute({ role, children }: { role: string; children: React.ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== role) return <Navigate to={`/${currentUser.role.replace('_', '-')}`} replace />
  return <>{children}</>
}

export default function App() {
  const currentUser = useAppStore((s) => s.currentUser)

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to={currentUser ? `/${currentUser.role.replace('_', '-')}` : '/login'} replace />} />

        {/* App shell wraps all authenticated routes */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>

          {/* ── Super Admin ───────────────────────────────────────── */}
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/branches" element={<BranchesPage />} />
          <Route path="/super-admin/users" element={<UsersPage />} />
          <Route path="/super-admin/admissions" element={<StubPage title="Admissions Overview" description="Consolidated view of all leads and enrolments across branches, powered by the Sales CRM data." />} />
          <Route path="/super-admin/academics" element={<StubPage title="Academic Analytics" description="System-wide curriculum coverage, assessment results, and teacher performance." />} />
          <Route path="/super-admin/finance" element={<FinanceDashboard />} />
          <Route path="/super-admin/reports" element={<StubPage title="Reports Centre" description="Generate PDF and Excel reports for attendance, revenue, academics, and more." />} />
          <Route path="/super-admin/settings" element={<StubPage title="System Settings" description="Configure platform-wide settings, permissions, and notification preferences." />} />
          <Route path="/super-admin/audit" element={<StubPage title="Audit Logs" description="Full audit trail of all user actions, data changes, and system events." />} />
          <Route path="/super-admin/go-live" element={<GoLivePage />} />

          {/* ── Branch Admin ──────────────────────────────────────── */}
          <Route path="/branch-admin" element={<BranchAdminDashboard />} />
          <Route path="/branch-admin/students" element={<StudentsPage />} />
          <Route path="/branch-admin/teachers" element={<StubPage title="Teacher Management" description="Teacher profiles, subject assignments, and performance metrics for this branch." />} />
          <Route path="/branch-admin/batches" element={<BatchesPage />} />
          <Route path="/branch-admin/timetable" element={<StubPage title="Timetable" description="Weekly timetable view for all batches across rooms in this branch." />} />
          <Route path="/branch-admin/attendance" element={<StubPage title="Attendance Overview" description="Branch-wide attendance report with per-student drill-down." />} />
          <Route path="/branch-admin/fees" element={<StubPage title="Fee Overview" description="Outstanding, collected, and overdue fees for students in this branch." />} />
          <Route path="/branch-admin/requests" element={<StubPage title="Requests" description="Parent requests, teacher leave applications, and room booking requests." />} />
          <Route path="/branch-admin/reports" element={<StubPage title="Branch Reports" description="Comprehensive branch reports including attendance, academics, and revenue." />} />

          {/* ── Sales ─────────────────────────────────────────────── */}
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/sales/leads" element={<LeadsPage />} />
          <Route path="/sales/follow-ups" element={<FollowUpsPage />} />
          <Route path="/sales/trials" element={<StubPage title="Trial Classes" description="Schedule and track trial class sessions for prospective students." />} />
          <Route path="/sales/admissions" element={<StubPage title="Admissions" description="Enrolled students with their complete onboarding checklist." />} />
          <Route path="/sales/campaigns" element={<StubPage title="Campaigns" description="Marketing campaigns, referral programmes, and lead generation tracking." />} />
          <Route path="/sales/scholarships" element={<StubPage title="Scholarships" description="Merit-based and need-based scholarship applications and approvals." />} />
          <Route path="/sales/reports" element={<StubPage title="Sales Reports" description="Conversion rates, source analysis, and revenue attribution reports." />} />

          {/* ── Teacher ───────────────────────────────────────────── */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<ClassesPage />} />
          <Route path="/teacher/attendance" element={<AttendancePage />} />
          <Route path="/teacher/homework" element={<HomeworkPage />} />
          <Route path="/teacher/tests" element={<TestsPage />} />
          <Route path="/teacher/notes" element={<StubPage title="Class Notes" description="Upload and share lesson notes, presentations, and study materials with students." />} />
          <Route path="/teacher/progress" element={<StudentProgressPage />} />
          <Route path="/teacher/messages" element={<MessagesPage />} />

          {/* ── Coordinator ───────────────────────────────────────── */}
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
          <Route path="/coordinator/curriculum" element={<StubPage title="Curriculum Coverage" description="Track syllabus completion rates by batch, subject, and teacher." />} />
          <Route path="/coordinator/syllabus" element={<StubPage title="Syllabus Plans" description="Termly and weekly syllabus plans for all curricula and subjects." />} />
          <Route path="/coordinator/assessments" element={<StubPage title="Assessments" description="System-wide assessment calendar with approval workflow for high-stakes tests." />} />
          <Route path="/coordinator/results" element={<StubPage title="Results" description="Moderated results, grade distributions, and comparative analysis." />} />
          <Route path="/coordinator/reviews" element={<StubPage title="Teacher Reviews" description="Structured peer reviews and observation reports for teaching quality." />} />
          <Route path="/coordinator/interventions" element={<StubPage title="Interventions" description="Targeted academic intervention plans for at-risk students." />} />
          <Route path="/coordinator/reports" element={<StubPage title="Academic Reports" description="Termly and annual academic performance reports by curriculum and branch." />} />

          {/* ── Finance ───────────────────────────────────────────── */}
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/collection" element={<StubPage title="Fee Collection" description="Record cash, card, and bank transfer payments against outstanding invoices." />} />
          <Route path="/finance/invoices" element={<InvoicesPage />} />
          <Route path="/finance/payment-plans" element={<StubPage title="Payment Plans" description="Set up instalment plans for families who need to spread fee payments." />} />
          <Route path="/finance/outstanding" element={<OutstandingFeesPage />} />
          <Route path="/finance/expenses" element={<StubPage title="Expenses" description="Track branch operating expenses and generate profit/loss reports." />} />
          <Route path="/finance/vat" element={<StubPage title="VAT Reports" description="UAE VAT-compliant reports ready for submission to the FTA." />} />
          <Route path="/finance/forecasts" element={<StubPage title="Revenue Forecasts" description="Predictive revenue model based on current enrolments and renewal rates." />} />

          {/* ── Parent ────────────────────────────────────────────── */}
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/progress" element={<StubPage title="Child Progress" description="Detailed academic progress timeline for your child." />} />
          <Route path="/parent/attendance" element={<ParentAttendancePage />} />
          <Route path="/parent/homework" element={<ParentHomeworkPage />} />
          <Route path="/parent/exams" element={<StubPage title="Exams & Results" description="Upcoming exams schedule and historical results." />} />
          <Route path="/parent/fees" element={<ParentFeesPage />} />
          <Route path="/parent/meetings" element={<StubPage title="Meetings" description="Book parent-teacher meetings and view upcoming appointments." />} />
          <Route path="/parent/messages" element={<MessagesPage />} />

          {/* ── Student ───────────────────────────────────────────── */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/classes" element={<StubPage title="My Classes" description="Your enrolled batches, schedules, and class materials." />} />
          <Route path="/student/homework" element={<StudentHomeworkPage />} />
          <Route path="/student/tests" element={<StudentTestsPage />} />
          <Route path="/student/ai-tutor" element={<AITutorPage />} />
          <Route path="/student/study-plan" element={<StubPage title="Study Plan" description="AI-generated personalised study plan based on your weak areas and upcoming exams." />} />
          <Route path="/student/resources" element={<StubPage title="Resources" description="Past papers, notes, and learning materials uploaded by your teachers." />} />
          <Route path="/student/achievements" element={<AchievementsPage />} />

          {/* ── AI Tutor ──────────────────────────────────────────── */}
          <Route path="/ai-tutor" element={<AITutorPage />} />
          <Route path="/ai-tutor/ask" element={<AITutorPage />} />
          <Route path="/ai-tutor/doubt-solver" element={<AITutorPage />} />
          <Route path="/ai-tutor/quiz" element={<AITutorPage />} />
          <Route path="/ai-tutor/planner" element={<StubPage title="AI Study Planner" description="Let AI generate a personalised weekly study plan based on your syllabus and exam dates." />} />
          <Route path="/ai-tutor/flashcards" element={<AITutorPage />} />
          <Route path="/ai-tutor/saved" element={<StubPage title="Saved Answers" description="Bookmark AI answers you found useful for later revision." />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

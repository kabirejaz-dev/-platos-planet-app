import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/Toaster'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LegalPage, PRIVACY_SECTIONS, TERMS_SECTIONS, REFUND_SECTIONS } from '@/pages/shared/LegalPage'
import type { UserRole } from '@/types'

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))

// Super Admin
const SuperAdminDashboard   = lazy(() => import('@/pages/super-admin/SuperAdminDashboard'))
const BranchesPage          = lazy(() => import('@/pages/super-admin/BranchesPage'))
const UsersPage             = lazy(() => import('@/pages/super-admin/UsersPage'))
const GoLivePage            = lazy(() => import('@/pages/super-admin/GoLivePage'))
const AdmissionsOverviewPage = lazy(() => import('@/pages/super-admin/AdmissionsOverviewPage'))
const AcademicAnalyticsPage  = lazy(() => import('@/pages/super-admin/AcademicAnalyticsPage'))
const ReportsCentrePage      = lazy(() => import('@/pages/super-admin/ReportsCentrePage'))
const SystemSettingsPage     = lazy(() => import('@/pages/super-admin/SystemSettingsPage'))
const AuditLogsPage          = lazy(() => import('@/pages/super-admin/AuditLogsPage'))
const GoLiveCommandCentrePage = lazy(() => import('@/pages/super-admin/GoLiveCommandCentrePage'))

// Branch Admin
const BranchAdminDashboard    = lazy(() => import('@/pages/branch-admin/BranchAdminDashboard'))
const StudentsPage             = lazy(() => import('@/pages/branch-admin/StudentsPage'))
const StudentProfileDetailPage = lazy(() => import('@/pages/branch-admin/StudentProfileDetailPage'))
const BatchesPage              = lazy(() => import('@/pages/branch-admin/BatchesPage'))
const TeachersPage             = lazy(() => import('@/pages/branch-admin/TeachersPage'))
const TimetablePage            = lazy(() => import('@/pages/branch-admin/TimetablePage'))
const AttendanceOverviewPage   = lazy(() => import('@/pages/branch-admin/AttendanceOverviewPage'))
const FeeOverviewPage          = lazy(() => import('@/pages/branch-admin/FeeOverviewPage'))
const RequestsPage             = lazy(() => import('@/pages/branch-admin/RequestsPage'))
const BranchReportsPage        = lazy(() => import('@/pages/branch-admin/BranchReportsPage'))

// Sales
const SalesDashboard  = lazy(() => import('@/pages/sales/SalesDashboard'))
const LeadsPage       = lazy(() => import('@/pages/sales/LeadsPage'))
const FollowUpsPage   = lazy(() => import('@/pages/sales/FollowUpsPage'))
const TrialsPage      = lazy(() => import('@/pages/sales/TrialsPage'))
const AdmissionsPage  = lazy(() => import('@/pages/sales/AdmissionsPage'))
const CampaignsPage   = lazy(() => import('@/pages/sales/CampaignsPage'))
const ScholarshipsPage = lazy(() => import('@/pages/sales/ScholarshipsPage'))
const SalesReportsPage = lazy(() => import('@/pages/sales/SalesReportsPage'))

// Teacher
const TeacherDashboard    = lazy(() => import('@/pages/teacher/TeacherDashboard'))
const ClassesPage         = lazy(() => import('@/pages/teacher/ClassesPage'))
const AttendancePage      = lazy(() => import('@/pages/teacher/AttendancePage'))
const HomeworkPage        = lazy(() => import('@/pages/teacher/HomeworkPage'))
const TestsPage           = lazy(() => import('@/pages/teacher/TestsPage'))
const StudentProgressPage = lazy(() => import('@/pages/teacher/StudentProgressPage'))
const ClassNotesPage      = lazy(() => import('@/pages/teacher/ClassNotesPage'))

// Coordinator
const CoordinatorDashboard  = lazy(() => import('@/pages/coordinator/CoordinatorDashboard'))
const CurriculumPage        = lazy(() => import('@/pages/coordinator/CurriculumPage'))
const AssessmentsCoordPage  = lazy(() => import('@/pages/coordinator/AssessmentsPage'))
const ResultsPage           = lazy(() => import('@/pages/coordinator/ResultsPage'))
const SyllabusPlansPage     = lazy(() => import('@/pages/coordinator/SyllabusPlansPage'))
const TeacherReviewsPage    = lazy(() => import('@/pages/coordinator/TeacherReviewsPage'))
const InterventionsPage     = lazy(() => import('@/pages/coordinator/InterventionsPage'))
const AcademicReportsPage   = lazy(() => import('@/pages/coordinator/AcademicReportsPage'))

// Finance
const FinanceDashboard    = lazy(() => import('@/pages/finance/FinanceDashboard'))
const InvoicesPage        = lazy(() => import('@/pages/finance/InvoicesPage'))
const OutstandingFeesPage = lazy(() => import('@/pages/finance/OutstandingFeesPage'))
const CollectionPage      = lazy(() => import('@/pages/finance/CollectionPage'))
const ForecastsPage       = lazy(() => import('@/pages/finance/ForecastsPage'))
const PaymentPlansPage    = lazy(() => import('@/pages/finance/PaymentPlansPage'))
const ExpensesPage        = lazy(() => import('@/pages/finance/ExpensesPage'))
const VATReportsPage      = lazy(() => import('@/pages/finance/VATReportsPage'))

// Parent
const ParentDashboard      = lazy(() => import('@/pages/parent/ParentDashboard'))
const ParentAttendancePage = lazy(() => import('@/pages/parent/ParentAttendancePage'))
const ParentHomeworkPage   = lazy(() => import('@/pages/parent/ParentHomeworkPage'))
const ParentFeesPage       = lazy(() => import('@/pages/parent/ParentFeesPage'))
const ProgressPage         = lazy(() => import('@/pages/parent/ProgressPage'))
const ExamsPage            = lazy(() => import('@/pages/parent/ExamsPage'))
const MeetingsPage         = lazy(() => import('@/pages/parent/MeetingsPage'))

// Student
const StudentDashboard    = lazy(() => import('@/pages/student/StudentDashboard'))
const StudentHomeworkPage = lazy(() => import('@/pages/student/StudentHomeworkPage'))
const StudentTestsPage    = lazy(() => import('@/pages/student/StudentTestsPage'))
const AchievementsPage    = lazy(() => import('@/pages/student/AchievementsPage'))
const MyClassesPage       = lazy(() => import('@/pages/student/MyClassesPage'))
const StudyPlanPage       = lazy(() => import('@/pages/student/StudyPlanPage'))
const ResourcesPage       = lazy(() => import('@/pages/student/ResourcesPage'))
const StudentSchedulePage    = lazy(() => import('@/pages/student/StudentSchedulePage'))
const StudentAttendancePage  = lazy(() => import('@/pages/student/StudentAttendancePage'))
const StudentFeesPage        = lazy(() => import('@/pages/student/StudentFeesPage'))
const StudentProfilePage     = lazy(() => import('@/pages/student/StudentProfilePage'))

// AI Tutor
const AITutorPage      = lazy(() => import('@/pages/ai-tutor/AITutorPage'))
const SavedAnswersPage = lazy(() => import('@/pages/ai-tutor/SavedAnswersPage'))

// Shared
const MessagesPage = lazy(() => import('@/pages/shared/MessagesPage'))

// Which roles may view each top-level path segment. A logged-in user navigating
// (directly, via back-button, or by typing a URL) outside their own segment is
// bounced to their own dashboard instead of being allowed to view it.
const ROLE_PATH_ACCESS: Record<string, UserRole[]> = {
  'super-admin': ['super_admin'],
  'branch-admin': ['branch_admin'],
  sales: ['sales'],
  teacher: ['teacher'],
  coordinator: ['coordinator'],
  finance: ['finance'],
  parent: ['parent'],
  student: ['student'],
  'ai-tutor': ['student', 'ai_tutor'],
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppStore((s) => s.currentUser)
  const location = useLocation()
  if (!currentUser) return <Navigate to="/login" replace />

  const segment = location.pathname.split('/')[1]
  const allowedRoles = ROLE_PATH_ACCESS[segment]
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={`/${currentUser.role.replace('_', '-')}`} replace />
  }

  return <>{children}</>
}

export default function App() {
  const currentUser = useAppStore((s) => s.currentUser)

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Toaster />
        <Routes>
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to={currentUser ? `/${currentUser.role.replace('_', '-')}` : '/login'} replace />} />

            {/* Legal — public, no login required */}
            <Route path="/privacy" element={<LegalPage title="Privacy Policy" sections={PRIVACY_SECTIONS} />} />
            <Route path="/terms" element={<LegalPage title="Terms of Service" sections={TERMS_SECTIONS} />} />
            <Route path="/refund" element={<LegalPage title="Refund Policy" sections={REFUND_SECTIONS} />} />

            {/* App shell wraps all authenticated routes */}
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>

              {/* ── Super Admin ───────────────────────────────────────── */}
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/branches" element={<BranchesPage />} />
              <Route path="/super-admin/users" element={<UsersPage />} />
              <Route path="/super-admin/admissions" element={<AdmissionsOverviewPage />} />
              <Route path="/super-admin/academics" element={<AcademicAnalyticsPage />} />
              <Route path="/super-admin/finance" element={<FinanceDashboard />} />
              <Route path="/super-admin/reports" element={<ReportsCentrePage />} />
              <Route path="/super-admin/settings" element={<SystemSettingsPage />} />
              <Route path="/super-admin/audit" element={<AuditLogsPage />} />
              <Route path="/super-admin/go-live" element={<GoLivePage />} />
              <Route path="/super-admin/go-live-status" element={<GoLiveCommandCentrePage />} />

              {/* ── Branch Admin ──────────────────────────────────────── */}
              <Route path="/branch-admin" element={<BranchAdminDashboard />} />
              <Route path="/branch-admin/students" element={<StudentsPage />} />
              <Route path="/branch-admin/students/:id" element={<StudentProfileDetailPage />} />
              <Route path="/branch-admin/teachers" element={<TeachersPage />} />
              <Route path="/branch-admin/batches" element={<BatchesPage />} />
              <Route path="/branch-admin/timetable" element={<TimetablePage />} />
              <Route path="/branch-admin/attendance" element={<AttendanceOverviewPage />} />
              <Route path="/branch-admin/fees" element={<FeeOverviewPage />} />
              <Route path="/branch-admin/requests" element={<RequestsPage />} />
              <Route path="/branch-admin/reports" element={<BranchReportsPage />} />

              {/* ── Sales ─────────────────────────────────────────────── */}
              <Route path="/sales" element={<SalesDashboard />} />
              <Route path="/sales/leads" element={<LeadsPage />} />
              <Route path="/sales/follow-ups" element={<FollowUpsPage />} />
              <Route path="/sales/trials" element={<TrialsPage />} />
              <Route path="/sales/admissions" element={<AdmissionsPage />} />
              <Route path="/sales/campaigns" element={<CampaignsPage />} />
              <Route path="/sales/scholarships" element={<ScholarshipsPage />} />
              <Route path="/sales/reports" element={<SalesReportsPage />} />

              {/* ── Teacher ───────────────────────────────────────────── */}
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/classes" element={<ClassesPage />} />
              <Route path="/teacher/attendance" element={<AttendancePage />} />
              <Route path="/teacher/homework" element={<HomeworkPage />} />
              <Route path="/teacher/tests" element={<TestsPage />} />
              <Route path="/teacher/notes" element={<ClassNotesPage />} />
              <Route path="/teacher/progress" element={<StudentProgressPage />} />
              <Route path="/teacher/messages" element={<MessagesPage />} />

              {/* ── Coordinator ───────────────────────────────────────── */}
              <Route path="/coordinator" element={<CoordinatorDashboard />} />
              <Route path="/coordinator/curriculum" element={<CurriculumPage />} />
              <Route path="/coordinator/syllabus" element={<SyllabusPlansPage />} />
              <Route path="/coordinator/assessments" element={<AssessmentsCoordPage />} />
              <Route path="/coordinator/results" element={<ResultsPage />} />
              <Route path="/coordinator/reviews" element={<TeacherReviewsPage />} />
              <Route path="/coordinator/interventions" element={<InterventionsPage />} />
              <Route path="/coordinator/reports" element={<AcademicReportsPage />} />

              {/* ── Finance ───────────────────────────────────────────── */}
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/finance/collection" element={<CollectionPage />} />
              <Route path="/finance/invoices" element={<InvoicesPage />} />
              <Route path="/finance/payment-plans" element={<PaymentPlansPage />} />
              <Route path="/finance/outstanding" element={<OutstandingFeesPage />} />
              <Route path="/finance/expenses" element={<ExpensesPage />} />
              <Route path="/finance/vat" element={<VATReportsPage />} />
              <Route path="/finance/forecasts" element={<ForecastsPage />} />

              {/* ── Parent ────────────────────────────────────────────── */}
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/progress" element={<ProgressPage />} />
              <Route path="/parent/attendance" element={<ParentAttendancePage />} />
              <Route path="/parent/homework" element={<ParentHomeworkPage />} />
              <Route path="/parent/exams" element={<ExamsPage />} />
              <Route path="/parent/fees" element={<ParentFeesPage />} />
              <Route path="/parent/meetings" element={<MeetingsPage />} />
              <Route path="/parent/messages" element={<MessagesPage />} />

              {/* ── Student ───────────────────────────────────────────── */}
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/schedule" element={<StudentSchedulePage />} />
              <Route path="/student/classes" element={<MyClassesPage />} />
              <Route path="/student/homework" element={<StudentHomeworkPage />} />
              <Route path="/student/tests" element={<StudentTestsPage />} />
              <Route path="/student/attendance" element={<StudentAttendancePage />} />
              <Route path="/student/fees" element={<StudentFeesPage />} />
              <Route path="/student/ai-tutor" element={<AITutorPage />} />
              <Route path="/student/study-plan" element={<StudyPlanPage />} />
              <Route path="/student/resources" element={<ResourcesPage />} />
              <Route path="/student/achievements" element={<AchievementsPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />

              {/* ── AI Tutor ──────────────────────────────────────────── */}
              <Route path="/ai-tutor" element={<AITutorPage />} />
              <Route path="/ai-tutor/ask" element={<AITutorPage />} />
              <Route path="/ai-tutor/doubt-solver" element={<AITutorPage />} />
              <Route path="/ai-tutor/quiz" element={<AITutorPage />} />
              <Route path="/ai-tutor/planner" element={<StudyPlanPage />} />
              <Route path="/ai-tutor/flashcards" element={<AITutorPage />} />
              <Route path="/ai-tutor/saved" element={<SavedAnswersPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

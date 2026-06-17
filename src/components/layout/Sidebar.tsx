import { NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import type { UserRole } from '@/types'
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, DollarSign,
  BarChart3, Settings, LogOut, Building2, UserCheck, ClipboardList,
  Calendar, MessageSquare, Award, Brain, Zap, FileText,
  TrendingUp, Target, Bell, ShieldCheck, Star,
  Home, FlaskConical, BookMarked, PenTool, Lightbulb, Search
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface NavItem { label: string; path: string; icon: React.ReactNode }

function getNavItems(role: UserRole): NavItem[] {
  const navMap: Record<UserRole, NavItem[]> = {
    super_admin: [
      { label: 'Overview', path: '/super-admin', icon: <LayoutDashboard size={16} /> },
      { label: 'Branches', path: '/super-admin/branches', icon: <Building2 size={16} /> },
      { label: 'Users', path: '/super-admin/users', icon: <Users size={16} /> },
      { label: 'Admissions', path: '/super-admin/admissions', icon: <UserCheck size={16} /> },
      { label: 'Academics', path: '/super-admin/academics', icon: <BookOpen size={16} /> },
      { label: 'Finance', path: '/super-admin/finance', icon: <DollarSign size={16} /> },
      { label: 'Reports', path: '/super-admin/reports', icon: <BarChart3 size={16} /> },
      { label: 'Settings', path: '/super-admin/settings', icon: <Settings size={16} /> },
      { label: 'Audit Logs', path: '/super-admin/audit', icon: <FileText size={16} /> },
      { label: 'Go Live Setup', path: '/super-admin/go-live', icon: <Zap size={16} /> },
    ],
    branch_admin: [
      { label: 'Dashboard', path: '/branch-admin', icon: <LayoutDashboard size={16} /> },
      { label: 'Students', path: '/branch-admin/students', icon: <GraduationCap size={16} /> },
      { label: 'Teachers', path: '/branch-admin/teachers', icon: <Users size={16} /> },
      { label: 'Batches', path: '/branch-admin/batches', icon: <BookOpen size={16} /> },
      { label: 'Timetable', path: '/branch-admin/timetable', icon: <Calendar size={16} /> },
      { label: 'Attendance', path: '/branch-admin/attendance', icon: <UserCheck size={16} /> },
      { label: 'Fees', path: '/branch-admin/fees', icon: <DollarSign size={16} /> },
      { label: 'Requests', path: '/branch-admin/requests', icon: <ClipboardList size={16} /> },
      { label: 'Reports', path: '/branch-admin/reports', icon: <BarChart3 size={16} /> },
    ],
    sales: [
      { label: 'Dashboard', path: '/sales', icon: <LayoutDashboard size={16} /> },
      { label: 'Leads', path: '/sales/leads', icon: <Target size={16} /> },
      { label: 'Follow-Ups', path: '/sales/follow-ups', icon: <Bell size={16} /> },
      { label: 'Trial Classes', path: '/sales/trials', icon: <Star size={16} /> },
      { label: 'Admissions', path: '/sales/admissions', icon: <UserCheck size={16} /> },
      { label: 'Campaigns', path: '/sales/campaigns', icon: <TrendingUp size={16} /> },
      { label: 'Scholarships', path: '/sales/scholarships', icon: <Award size={16} /> },
      { label: 'Reports', path: '/sales/reports', icon: <BarChart3 size={16} /> },
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={16} /> },
      { label: 'My Classes', path: '/teacher/classes', icon: <BookOpen size={16} /> },
      { label: 'Attendance', path: '/teacher/attendance', icon: <UserCheck size={16} /> },
      { label: 'Homework', path: '/teacher/homework', icon: <ClipboardList size={16} /> },
      { label: 'Tests', path: '/teacher/tests', icon: <PenTool size={16} /> },
      { label: 'Notes', path: '/teacher/notes', icon: <BookMarked size={16} /> },
      { label: 'Student Progress', path: '/teacher/progress', icon: <TrendingUp size={16} /> },
      { label: 'Messages', path: '/teacher/messages', icon: <MessageSquare size={16} /> },
    ],
    coordinator: [
      { label: 'Dashboard', path: '/coordinator', icon: <LayoutDashboard size={16} /> },
      { label: 'Curriculum', path: '/coordinator/curriculum', icon: <BookOpen size={16} /> },
      { label: 'Syllabus Plans', path: '/coordinator/syllabus', icon: <ClipboardList size={16} /> },
      { label: 'Assessments', path: '/coordinator/assessments', icon: <PenTool size={16} /> },
      { label: 'Results', path: '/coordinator/results', icon: <BarChart3 size={16} /> },
      { label: 'Teacher Reviews', path: '/coordinator/reviews', icon: <Star size={16} /> },
      { label: 'Interventions', path: '/coordinator/interventions', icon: <ShieldCheck size={16} /> },
      { label: 'Reports', path: '/coordinator/reports', icon: <FileText size={16} /> },
    ],
    finance: [
      { label: 'Dashboard', path: '/finance', icon: <LayoutDashboard size={16} /> },
      { label: 'Fee Collection', path: '/finance/collection', icon: <DollarSign size={16} /> },
      { label: 'Invoices', path: '/finance/invoices', icon: <FileText size={16} /> },
      { label: 'Payment Plans', path: '/finance/payment-plans', icon: <Calendar size={16} /> },
      { label: 'Outstanding', path: '/finance/outstanding', icon: <Bell size={16} /> },
      { label: 'Expenses', path: '/finance/expenses', icon: <TrendingUp size={16} /> },
      { label: 'VAT Reports', path: '/finance/vat', icon: <BarChart3 size={16} /> },
      { label: 'Forecasts', path: '/finance/forecasts', icon: <Target size={16} /> },
    ],
    parent: [
      { label: 'Dashboard', path: '/parent', icon: <Home size={16} /> },
      { label: 'Child Progress', path: '/parent/progress', icon: <TrendingUp size={16} /> },
      { label: 'Attendance', path: '/parent/attendance', icon: <UserCheck size={16} /> },
      { label: 'Homework', path: '/parent/homework', icon: <ClipboardList size={16} /> },
      { label: 'Exams', path: '/parent/exams', icon: <PenTool size={16} /> },
      { label: 'Fees', path: '/parent/fees', icon: <DollarSign size={16} /> },
      { label: 'Meetings', path: '/parent/meetings', icon: <Calendar size={16} /> },
      { label: 'Messages', path: '/parent/messages', icon: <MessageSquare size={16} /> },
    ],
    student: [
      { label: 'Dashboard', path: '/student', icon: <Home size={16} /> },
      { label: 'My Classes', path: '/student/classes', icon: <BookOpen size={16} /> },
      { label: 'Homework', path: '/student/homework', icon: <ClipboardList size={16} /> },
      { label: 'Tests', path: '/student/tests', icon: <PenTool size={16} /> },
      { label: 'AI Doubt Solver', path: '/student/ai-tutor', icon: <Brain size={16} /> },
      { label: 'Study Plan', path: '/student/study-plan', icon: <Target size={16} /> },
      { label: 'Resources', path: '/student/resources', icon: <BookMarked size={16} /> },
      { label: 'Achievements', path: '/student/achievements', icon: <Award size={16} /> },
    ],
    ai_tutor: [
      { label: 'Dashboard', path: '/ai-tutor', icon: <LayoutDashboard size={16} /> },
      { label: 'Ask Question', path: '/ai-tutor/ask', icon: <Search size={16} /> },
      { label: 'Doubt Solver', path: '/ai-tutor/doubt-solver', icon: <Lightbulb size={16} /> },
      { label: 'Quiz Generator', path: '/ai-tutor/quiz', icon: <FlaskConical size={16} /> },
      { label: 'Study Planner', path: '/ai-tutor/planner', icon: <Target size={16} /> },
      { label: 'Flashcards', path: '/ai-tutor/flashcards', icon: <BookMarked size={16} /> },
      { label: 'Saved Answers', path: '/ai-tutor/saved', icon: <Star size={16} /> },
    ],
  }
  return navMap[role] || []
}

const roleConfig: Record<UserRole, { label: string; color: string; bg: string }> = {
  super_admin:  { label: 'Super Admin',        color: '#FF6B7A', bg: 'rgba(255,107,122,0.12)' },
  branch_admin: { label: 'Branch Admin',        color: '#4D7CFF', bg: 'rgba(77,124,255,0.12)' },
  sales:        { label: 'Sales & Admissions',  color: '#00FFA3', bg: 'rgba(0,255,163,0.12)' },
  teacher:      { label: 'Teacher',             color: '#7B61FF', bg: 'rgba(123,97,255,0.12)' },
  coordinator:  { label: 'Coordinator',         color: '#00F0FF', bg: 'rgba(0,240,255,0.12)' },
  finance:      { label: 'Finance Manager',     color: '#C6FF00', bg: 'rgba(198,255,0,0.12)' },
  parent:       { label: 'Parent',              color: '#4D7CFF', bg: 'rgba(77,124,255,0.12)' },
  student:      { label: 'Student',             color: '#00FFA3', bg: 'rgba(0,255,163,0.12)' },
  ai_tutor:     { label: 'AI Tutor',            color: '#7B61FF', bg: 'rgba(123,97,255,0.12)' },
}

interface SidebarProps { collapsed?: boolean }

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { currentUser, setCurrentUser } = useAppStore()
  const navigate = useNavigate()
  if (!currentUser) return null

  const navItems = getNavItems(currentUser.role)
  const rc = roleConfig[currentUser.role]

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-[64px]' : 'w-[240px]'
      )}
      style={{
        background: 'linear-gradient(180deg, #0B0F1E 0%, #080C18 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 flex-shrink-0 py-5',
        collapsed ? 'px-[18px]' : 'px-5'
      )}>
        <div
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 60%, #00F0FF 100%)',
            boxShadow: '0 0 20px rgba(77,124,255,0.4), 0 0 40px rgba(123,97,255,0.2)',
          }}
        >
          <span className="text-white font-bold text-sm font-display leading-none">P</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white font-display leading-tight tracking-tight">
              Plato's Planet
            </p>
            <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase">Digital</p>
          </div>
        )}
      </div>

      {/* ── Role badge ───────────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit"
            style={{ background: rc.bg, border: `1px solid ${rc.color}25` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: rc.color, boxShadow: `0 0 6px ${rc.color}` }} />
            <span className="text-[11px] font-semibold" style={{ color: rc.color }}>{rc.label}</span>
          </div>
        </div>
      )}

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="mx-4 mb-3" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className={cn('flex-1 overflow-y-auto space-y-0.5 pb-3', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length <= 2}
            className={({ isActive }) => cn('nav-item', isActive && 'active')}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0 opacity-80">{item.icon}</span>
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── User section ─────────────────────────────────────────── */}
      <div className={cn('flex-shrink-0 pb-3', collapsed ? 'px-2' : 'px-3')}>
        <div className="section-divider mb-3" />

        {!collapsed && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Avatar name={currentUser.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/90 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-white/30 truncate">{currentUser.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => { setCurrentUser(null); navigate('/login') }}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all',
            'text-white/25 hover:text-red-400 hover:bg-red-500/8',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={14} />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}

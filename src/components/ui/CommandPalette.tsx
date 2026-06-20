import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import {
  Search, GraduationCap, BookOpen, DollarSign, Users, BarChart3,
  LayoutDashboard, Phone, FileText, Settings, Star, X
} from 'lucide-react'

interface CmdItem {
  id: string
  label: string
  sublabel?: string
  icon: React.ReactNode
  action: () => void
  category: string
}

const ROLE_PAGES: Record<string, Array<{ label: string; path: string; icon: React.ReactNode }>> = {
  super_admin:  [
    { label: 'Dashboard', path: '/super-admin', icon: <LayoutDashboard size={14} /> },
    { label: 'Branches', path: '/super-admin/branches', icon: <BookOpen size={14} /> },
    { label: 'Users', path: '/super-admin/users', icon: <Users size={14} /> },
    { label: 'Finance', path: '/super-admin/finance', icon: <DollarSign size={14} /> },
    { label: 'Go Live Setup', path: '/super-admin/go-live', icon: <Settings size={14} /> },
    { label: 'Go-Live Command Centre', path: '/super-admin/go-live-status', icon: <Settings size={14} /> },
  ],
  branch_admin: [
    { label: 'Dashboard', path: '/branch-admin', icon: <LayoutDashboard size={14} /> },
    { label: 'Students', path: '/branch-admin/students', icon: <GraduationCap size={14} /> },
    { label: 'Batches', path: '/branch-admin/batches', icon: <BookOpen size={14} /> },
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={14} /> },
    { label: 'My Classes', path: '/teacher/classes', icon: <BookOpen size={14} /> },
    { label: 'Attendance', path: '/teacher/attendance', icon: <Users size={14} /> },
    { label: 'Homework', path: '/teacher/homework', icon: <FileText size={14} /> },
    { label: 'Tests & Assessments', path: '/teacher/tests', icon: <BarChart3 size={14} /> },
    { label: 'Student Progress', path: '/teacher/progress', icon: <Star size={14} /> },
  ],
  sales: [
    { label: 'Dashboard', path: '/sales', icon: <LayoutDashboard size={14} /> },
    { label: 'Leads', path: '/sales/leads', icon: <Phone size={14} /> },
    { label: 'Follow-Ups', path: '/sales/follow-ups', icon: <Phone size={14} /> },
  ],
  finance: [
    { label: 'Dashboard', path: '/finance', icon: <LayoutDashboard size={14} /> },
    { label: 'Invoices', path: '/finance/invoices', icon: <FileText size={14} /> },
    { label: 'Outstanding Fees', path: '/finance/outstanding', icon: <DollarSign size={14} /> },
  ],
  parent: [
    { label: 'Dashboard', path: '/parent', icon: <LayoutDashboard size={14} /> },
    { label: 'Attendance', path: '/parent/attendance', icon: <Users size={14} /> },
    { label: 'Homework', path: '/parent/homework', icon: <FileText size={14} /> },
    { label: 'Fees', path: '/parent/fees', icon: <DollarSign size={14} /> },
  ],
  student: [
    { label: 'Dashboard', path: '/student', icon: <LayoutDashboard size={14} /> },
    { label: 'Homework', path: '/student/homework', icon: <FileText size={14} /> },
    { label: 'Tests', path: '/student/tests', icon: <BarChart3 size={14} /> },
    { label: 'AI Tutor', path: '/student/ai-tutor', icon: <Star size={14} /> },
    { label: 'Achievements', path: '/student/achievements', icon: <Star size={14} /> },
  ],
  coordinator: [
    { label: 'Dashboard', path: '/coordinator', icon: <LayoutDashboard size={14} /> },
  ],
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { currentUser, students, batches, leads } = useAppStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const go = useCallback((path: string) => {
    navigate(path)
    onClose()
  }, [navigate, onClose])

  const role = currentUser?.role ?? 'student'
  const pages = ROLE_PAGES[role] ?? []

  const studentItems: CmdItem[] = students
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.grade.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5)
    .map((s) => ({
      id: `student-${s.id}`,
      label: s.name,
      sublabel: `${s.curriculum} · ${s.grade} · ${s.planet}`,
      icon: <GraduationCap size={14} />,
      action: () => go('/branch-admin/students'),
      category: 'Students',
    }))

  const batchItems: CmdItem[] = batches
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.subject.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5)
    .map((b) => ({
      id: `batch-${b.id}`,
      label: b.name,
      sublabel: `${b.curriculum} · ${b.subject} · ${b.studentIds.length} students`,
      icon: <BookOpen size={14} />,
      action: () => go('/branch-admin/batches'),
      category: 'Batches',
    }))

  const leadItems: CmdItem[] = leads
    .filter((l) => l.parentName.toLowerCase().includes(search.toLowerCase()) || l.studentName.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5)
    .map((l) => ({
      id: `lead-${l.id}`,
      label: l.parentName,
      sublabel: `Student: ${l.studentName} · ${l.status}`,
      icon: <Phone size={14} />,
      action: () => go('/sales/leads'),
      category: 'Leads',
    }))

  const pageItems: CmdItem[] = pages
    .filter((p) => p.label.toLowerCase().includes(search.toLowerCase()))
    .map((p) => ({
      id: `page-${p.path}`,
      label: p.label,
      sublabel: p.path,
      icon: p.icon,
      action: () => go(p.path),
      category: 'Navigation',
    }))

  const allItems = search.trim()
    ? [...pageItems, ...studentItems, ...batchItems, ...leadItems]
    : pageItems

  const grouped = allItems.reduce<Record<string, CmdItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[18vh] px-4 pointer-events-none">
            <motion.div
              className="w-full max-w-xl pointer-events-auto"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Command
                className="overflow-hidden rounded-2xl"
                style={{
                  background: 'rgba(10,14,26,0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(77,124,255,0.1), 0 0 60px rgba(77,124,255,0.08)',
                  backdropFilter: 'blur(32px)',
                }}
              >
                {/* Search input */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Search size={16} className="text-white/30 flex-shrink-0" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search pages, students, batches…"
                    className="flex-1 text-[14px] text-white/90 placeholder:text-white/25 outline-none bg-transparent"
                    autoFocus
                  />
                  {search && (
                    <button onClick={() => setSearch('')} aria-label="Clear search" className="text-white/25 hover:text-white/60 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                  <kbd
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono text-white/25 flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    esc
                  </kbd>
                </div>

                {/* Results */}
                <Command.List className="max-h-80 overflow-y-auto p-2">
                  <Command.Empty className="py-10 text-center text-[13px] text-white/30">
                    No results for "{search}"
                  </Command.Empty>

                  {Object.entries(grouped).map(([category, items]) => (
                    <Command.Group key={category}>
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                        {category}
                      </div>
                      {items.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.label}
                          onSelect={item.action}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group"
                          style={{ outline: 'none' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(77,124,255,0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white/40 group-hover:text-[#4D7CFF] transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white/80">{item.label}</p>
                            {item.sublabel && (
                              <p className="text-[11px] text-white/30 truncate">{item.sublabel}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">↵</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>

                {/* Footer */}
                <div
                  className="flex items-center gap-3 px-4 py-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <kbd
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono text-white/25"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {key}
                      </kbd>
                      <span className="text-[11px] text-white/20">{label}</span>
                    </div>
                  ))}
                </div>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatDate } from '@/lib/utils'
import { Search, GraduationCap, Star, TrendingUp, Filter } from 'lucide-react'
import type { Student } from '@/types'

const STATUS_COLORS: Record<Student['status'], { bg: string; color: string; label: string }> = {
  active:    { bg: 'rgba(0,255,163,0.1)',   color: '#00FFA3', label: 'Active' },
  inactive:  { bg: 'rgba(100,116,139,0.1)', color: '#64748B', label: 'Inactive' },
  suspended: { bg: 'rgba(255,107,122,0.1)', color: '#FF6B7A', label: 'Suspended' },
}

const PLANET_EMOJI: Record<string, string> = {
  Mercury: '☿', Venus: '♀', Earth: '🌍', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Neptune: '♆', Pluto: '⚡',
}

export default function StudentsPage() {
  const { currentUser, students, batches, attendance } = useAppStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Student['status']>('all')
  const [curriculumFilter, setCurriculumFilter] = useState('all')
  const [selected, setSelected] = useState<Student | null>(null)

  const branchStudents = students.filter((s) =>
    currentUser?.branchId ? s.branchId === currentUser.branchId : true
  )

  const filtered = branchStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchCurriculum = curriculumFilter === 'all' || s.curriculum === curriculumFilter
    return matchSearch && matchStatus && matchCurriculum
  })

  const curricula = [...new Set(branchStudents.map((s) => s.curriculum))]

  const getAttendanceRate = (studentId: string) => {
    const records = attendance.filter((a) => a.studentId === studentId)
    if (!records.length) return null
    const present = records.filter((a) => a.status === 'present' || a.status === 'late').length
    return Math.round((present / records.length) * 100)
  }

  const getStudentBatches = (student: Student) =>
    batches.filter((b) => student.batchIds.includes(b.id))

  return (
    <div className="space-y-5">
      <PageHeader
        title="Students"
        subtitle={`${branchStudents.length} enrolled students`}
        badge={<DemoBadge />}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="plato-input pl-9"
            placeholder="Search by name, email, grade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/30" />
          {(['all', 'active', 'inactive', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize"
              style={{
                background: statusFilter === s ? 'rgba(77,124,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${statusFilter === s ? 'rgba(77,124,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                color: statusFilter === s ? '#4D7CFF' : 'rgba(100,116,139,0.8)',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        <select
          className="plato-input w-auto"
          value={curriculumFilter}
          onChange={(e) => setCurriculumFilter(e.target.value)}
        >
          <option value="all">All Curricula</option>
          {curricula.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((student) => {
          const att = getAttendanceRate(student.id)
          const stBatches = getStudentBatches(student)
          const sc = STATUS_COLORS[student.status]

          return (
            <button
              key={student.id}
              onClick={() => setSelected(student)}
              className="plato-card p-4 text-left hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={student.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-white/90 truncate">{student.name}</p>
                    <span className="text-sm">{PLANET_EMOJI[student.planet] || '☿'}</span>
                  </div>
                  <p className="text-[12px] text-white/40">{student.curriculum} · {student.grade}</p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {sc.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(77,124,255,0.06)' }}>
                  <p className="text-[16px] font-bold text-[#4D7CFF]">{student.xp.toLocaleString()}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide">XP</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,255,163,0.06)' }}>
                  <p className="text-[16px] font-bold text-[#00FFA3]">{att !== null ? `${att}%` : '—'}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide">Attend.</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(123,97,255,0.06)' }}>
                  <p className="text-[16px] font-bold text-[#7B61FF]">{student.streak}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide">Streak</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {stBatches.slice(0, 2).map((b) => (
                  <span
                    key={b.id}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.7)' }}
                  >
                    {b.subject}
                  </span>
                ))}
                {stBatches.length > 2 && (
                  <span className="text-[10px] text-white/25">+{stBatches.length - 2} more</span>
                )}
              </div>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/30">
            <GraduationCap size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px]">No students match your filters.</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div
            className="fixed inset-y-4 right-4 z-50 w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Header */}
            <div
              className="p-5 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(77,124,255,0.04)' }}
            >
              <div className="flex items-center gap-4">
                <Avatar name={selected.name} size="lg" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[16px] font-bold text-white font-display">{selected.name}</h3>
                    <span>{PLANET_EMOJI[selected.planet] || '☿'}</span>
                  </div>
                  <p className="text-[12px] text-white/40">{selected.curriculum} · {selected.grade}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{selected.email}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'XP', value: selected.xp.toLocaleString(), color: '#4D7CFF' },
                  { label: 'Streak', value: `${selected.streak} days`, color: '#00FFA3' },
                  { label: 'Planet', value: selected.planet, color: '#7B61FF' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="text-center p-3 rounded-xl"
                    style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}
                  >
                    <p className="text-[15px] font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="plato-card p-4 space-y-3">
                <h4 className="text-[12px] font-bold text-white/50 uppercase tracking-wider">Enrolment Info</h4>
                {[
                  { label: 'Enrolled', value: formatDate(selected.enrollmentDate) },
                  { label: 'Subjects', value: selected.subjects.join(', ') },
                  { label: 'Attendance', value: getAttendanceRate(selected.id) !== null ? `${getAttendanceRate(selected.id)}%` : 'No records' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[12px] text-white/40">{row.label}</span>
                    <span className="text-[12px] text-white/80 font-medium text-right max-w-[200px]">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Batches */}
              <div className="plato-card p-4">
                <h4 className="text-[12px] font-bold text-white/50 uppercase tracking-wider mb-3">Enrolled Batches</h4>
                <div className="space-y-2">
                  {getStudentBatches(selected).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div>
                        <p className="text-[12px] font-semibold text-white/80">{b.name}</p>
                        <p className="text-[11px] text-white/30">{b.subject} · {b.schedule.map(s => `${s.day} ${s.startTime}`).join(', ')}</p>
                      </div>
                      <Star size={12} className="text-yellow-400" />
                    </div>
                  ))}
                  {getStudentBatches(selected).length === 0 && (
                    <p className="text-[12px] text-white/30 text-center py-2">No batches assigned</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button className="btn-ghost w-full justify-center" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

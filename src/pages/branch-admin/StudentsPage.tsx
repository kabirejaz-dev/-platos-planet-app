import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatDate, formatCurrency, generateId, getGradeColor } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Search, GraduationCap, Star, Filter, MessageSquare, ExternalLink, X } from 'lucide-react'
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
  const { currentUser, students, batches, attendance, invoices, assessments, parents, addMessage } = useAppStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Student['status']>('all')
  const [curriculumFilter, setCurriculumFilter] = useState('all')
  const [selected, setSelected] = useState<Student | null>(null)
  const [showMessage, setShowMessage] = useState(false)
  const [messageBody, setMessageBody] = useState('')

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

  const getAttendanceBadgeColor = (rate: number | null) => {
    if (rate === null) return { bg: 'rgba(100,116,139,0.1)', color: '#64748B' }
    if (rate >= 90) return { bg: 'rgba(0,255,163,0.1)', color: '#00FFA3' }
    if (rate >= 75) return { bg: 'rgba(251,191,36,0.1)', color: '#FBBF24' }
    return { bg: 'rgba(255,107,122,0.1)', color: '#FF6B7A' }
  }

  const getFeeStatus = (studentId: string) => {
    const studentInvoices = invoices.filter((i) => i.studentId === studentId)
    const total = studentInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
    const paid = studentInvoices.reduce((sum, i) => sum + (i.status === 'paid' ? i.totalAmount : i.paidAmount || 0), 0)
    return { total, paid, outstanding: total - paid, currency: studentInvoices[0]?.currency ?? 'AED' }
  }

  const getLastResults = (studentId: string) =>
    assessments
      .filter((a) => a.results.some((r) => r.studentId === studentId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((a) => ({ subject: a.subject, title: a.title, result: a.results.find((r) => r.studentId === studentId)!, maxMarks: a.maxMarks }))

  const handleMessageParent = () => {
    if (!selected || !currentUser) return
    const parent = parents.find((p) => p.id === selected.parentId)
    if (!parent) return
    addMessage({
      id: `msg-${generateId()}`,
      fromId: currentUser.id,
      toId: parent.userId,
      subject: `Regarding ${selected.name}`,
      body: messageBody,
      isRead: false,
      sentAt: new Date().toISOString(),
      type: 'message',
    })
    toast.success('Message sent', `To ${parent.name}`)
    setShowMessage(false)
    setMessageBody('')
  }

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
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[12px] text-white/40">{row.label}</span>
                    <span className="text-[12px] text-white/80 font-medium text-right max-w-[200px]">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[12px] text-white/40">Attendance</span>
                  {(() => {
                    const rate = getAttendanceRate(selected.id)
                    const bc = getAttendanceBadgeColor(rate)
                    return (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: bc.bg, color: bc.color }}>
                        {rate !== null ? `${rate}%` : 'No records'}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Fee status */}
              <div className="plato-card p-4">
                <h4 className="text-[12px] font-bold text-white/50 uppercase tracking-wider mb-3">Fee Status</h4>
                {(() => {
                  const fee = getFeeStatus(selected.id)
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-[13px] font-bold text-white/80">{formatCurrency(fee.total, fee.currency)}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Invoiced</p>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,255,163,0.06)' }}>
                        <p className="text-[13px] font-bold text-[#00FFA3]">{formatCurrency(fee.paid, fee.currency)}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Paid</p>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: fee.outstanding > 0 ? 'rgba(255,107,122,0.06)' : 'rgba(255,255,255,0.03)' }}>
                        <p className="text-[13px] font-bold" style={{ color: fee.outstanding > 0 ? '#FF6B7A' : 'rgba(255,255,255,0.5)' }}>{formatCurrency(fee.outstanding, fee.currency)}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Outstanding</p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Last 3 results */}
              <div className="plato-card p-4">
                <h4 className="text-[12px] font-bold text-white/50 uppercase tracking-wider mb-3">Recent Results</h4>
                <div className="space-y-2">
                  {getLastResults(selected.id).map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div>
                        <p className="text-[12px] font-semibold text-white/80">{r.subject}</p>
                        <p className="text-[11px] text-white/30">{r.title}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[13px] font-bold font-display ${getGradeColor(r.result.grade)}`}>{r.result.grade}</p>
                        <p className="text-[10px] text-white/30">{r.result.marks}/{r.maxMarks}</p>
                      </div>
                    </div>
                  ))}
                  {getLastResults(selected.id).length === 0 && (
                    <p className="text-[12px] text-white/30 text-center py-2">No results yet</p>
                  )}
                </div>
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

            <div className="p-4 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2">
                <button className="btn-ghost flex-1 justify-center" onClick={() => setShowMessage(true)}>
                  <MessageSquare size={14} /> Message Parent
                </button>
                <Link to={`/branch-admin/students/${selected.id}`} className="btn-primary flex-1 justify-center">
                  <ExternalLink size={14} /> View Full Profile
                </Link>
              </div>
              <button className="btn-ghost w-full justify-center" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </>
      )}

      {/* Message Parent modal */}
      {showMessage && selected && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setShowMessage(false)} />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-[14px] font-bold text-white font-display">Message Parent</h3>
                  <p className="text-[11px] text-white/40">{parents.find((p) => p.id === selected.parentId)?.name || 'Parent'} · re: {selected.name}</p>
                </div>
                <button onClick={() => setShowMessage(false)} className="text-white/30 hover:text-white/70"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-3">
                <textarea
                  autoFocus
                  className="plato-input text-[13px]"
                  rows={4}
                  placeholder="Type your message…"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                />
                <button className="btn-primary w-full justify-center" disabled={!messageBody.trim()} onClick={handleMessageParent}>Send Message</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

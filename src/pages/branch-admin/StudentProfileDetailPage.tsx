import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate, formatCurrency, getGradeColor, getStatusColor } from '@/lib/utils'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'

const PLANET_EMOJI: Record<string, string> = {
  Mercury: '☿', Venus: '♀', Earth: '🌍', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Neptune: '♆', Pluto: '⚡',
}

export default function StudentProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { students, batches, teachers, attendance, invoices, assessments, parents } = useAppStore()

  const student = students.find((s) => s.id === id)
  if (!student) {
    return (
      <div className="text-center py-20 text-white/30">
        <p className="mb-3">Student not found.</p>
        <button className="btn-ghost" onClick={() => navigate('/branch-admin/students')}><ArrowLeft size={14} /> Back to Students</button>
      </div>
    )
  }

  const studentBatches = batches.filter((b) => student.batchIds.includes(b.id))
  const studentAttendance = attendance.filter((a) => a.studentId === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const present = studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length
  const attRate = studentAttendance.length > 0 ? Math.round((present / studentAttendance.length) * 100) : null

  const studentInvoices = invoices.filter((i) => i.studentId === student.id)
  const totalFees = studentInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
  const paidFees = studentInvoices.reduce((sum, i) => sum + (i.status === 'paid' ? i.totalAmount : i.paidAmount || 0), 0)

  const studentResults = assessments
    .filter((a) => a.results.some((r) => r.studentId === student.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((a) => ({ ...a, result: a.results.find((r) => r.studentId === student.id)! }))

  const parent = parents.find((p) => p.id === student.parentId)
  const getBatchName = (batchId: string) => batches.find((b) => b.id === batchId)?.name ?? 'Unknown'

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/branch-admin/students')} className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70">
        <ArrowLeft size={13} /> Back to Students
      </button>

      <PageHeader
        title={student.name}
        subtitle={`${student.curriculum} · ${student.grade}`}
      />

      <div className="plato-card p-5 flex items-center gap-4">
        <Avatar name={student.name} size="xl" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-white font-display">{student.name}</h2>
            <span>{PLANET_EMOJI[student.planet] || '☿'}</span>
          </div>
          <p className="text-[12px] text-white/40">{student.email}</p>
          <p className="text-[11px] text-white/30 mt-0.5">Enrolled {formatDate(student.enrollmentDate)}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'XP', value: student.xp.toLocaleString(), color: '#4D7CFF' },
            { label: 'Streak', value: `${student.streak}d`, color: '#7B61FF' },
            { label: 'Attendance', value: attRate !== null ? `${attRate}%` : '—', color: attRate !== null && attRate >= 80 ? '#00FFA3' : '#FF6B7A' },
          ].map((s) => (
            <div key={s.label} className="text-center px-3 py-2 rounded-xl" style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
              <p className="text-[14px] font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Batches */}
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-bold text-white/70 mb-3">Enrolled Batches</h3>
          <div className="space-y-2">
            {studentBatches.map((b) => {
              const teacher = teachers.find((t) => t.id === b.teacherId)
              return (
                <div key={b.id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-[12px] font-semibold text-white/80">{b.name}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{teacher?.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
                    {b.schedule.map((s, i) => (
                      <span key={i} className="flex items-center gap-1"><Clock size={10} /> {s.day} {s.startTime}</span>
                    ))}
                    {b.room && <span className="flex items-center gap-1"><MapPin size={10} /> {b.room}</span>}
                  </div>
                </div>
              )
            })}
            {studentBatches.length === 0 && <p className="text-[12px] text-white/30 text-center py-4">No batches assigned</p>}
          </div>
        </div>

        {/* Parent contact */}
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-bold text-white/70 mb-3">Parent / Guardian</h3>
          {parent ? (
            <div className="space-y-2">
              {[
                { label: 'Name', value: parent.name },
                { label: 'Phone', value: parent.phone },
                { label: 'Email', value: parent.email },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[12px]">
                  <span className="text-white/35">{row.label}</span>
                  <span className="text-white/75 font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-white/30 text-center py-4">No parent linked</p>
          )}
        </div>
      </div>

      {/* Fees */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-white/70">Fee Invoices</h3>
          <span className="text-[12px] text-white/40">{formatCurrency(paidFees)} / {formatCurrency(totalFees)} paid</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {studentInvoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[12px] font-semibold text-white/80">{inv.invoiceNumber}</p>
                <p className="text-[11px] text-white/35">Due {formatDate(inv.dueDate)}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className={getStatusColor(inv.status)}>{inv.status}</span>
                <span className="text-[13px] font-bold text-white/80">{formatCurrency(inv.totalAmount, inv.currency)}</span>
              </div>
            </div>
          ))}
          {studentInvoices.length === 0 && <p className="text-[12px] text-white/30 text-center py-4">No invoices</p>}
        </div>
      </div>

      {/* Results */}
      <div className="plato-card p-5">
        <h3 className="text-[13px] font-bold text-white/70 mb-3">All Results</h3>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {studentResults.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[12px] font-semibold text-white/80">{a.title}</p>
                <p className="text-[11px] text-white/35">{a.subject} · {formatDate(a.date)}</p>
              </div>
              <div className="text-right">
                <p className={`text-[15px] font-bold font-display ${getGradeColor(a.result.grade)}`}>{a.result.grade}</p>
                <p className="text-[11px] text-white/30">{a.result.marks}/{a.maxMarks} · {a.result.percentage}%</p>
              </div>
            </div>
          ))}
          {studentResults.length === 0 && <p className="text-[12px] text-white/30 text-center py-4">No results yet</p>}
        </div>
      </div>

      {/* Attendance log */}
      <div className="plato-card p-5">
        <h3 className="text-[13px] font-bold text-white/70 mb-3">Attendance Log ({studentAttendance.length} sessions)</h3>
        <div className="divide-y max-h-80 overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {studentAttendance.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between py-2">
              <span className="text-[12px] text-white/60">{formatDate(rec.date)} · {getBatchName(rec.batchId)}</span>
              <span className={getStatusColor(rec.status)}>{rec.status}</span>
            </div>
          ))}
          {studentAttendance.length === 0 && <p className="text-[12px] text-white/30 text-center py-4">No attendance records</p>}
        </div>
      </div>

      <Link to="/branch-admin/students" className="text-[12px] text-[#4D7CFF] hover:underline">← Back to all students</Link>
    </div>
  )
}

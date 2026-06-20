import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, MinusCircle, TrendingUp } from 'lucide-react'
import type { AttendanceStatus } from '@/types'

const STATUS_CONFIG: Record<AttendanceStatus, { icon: JSX.Element; color: string; bg: string; label: string }> = {
  present: { icon: <CheckCircle2 size={14} />, color: '#00FFA3', bg: 'rgba(0,255,163,0.1)',   label: 'Present' },
  absent:  { icon: <XCircle size={14} />,      color: '#FF6B7A', bg: 'rgba(255,107,122,0.1)', label: 'Absent' },
  late:    { icon: <Clock size={14} />,         color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', label: 'Late' },
  excused: { icon: <MinusCircle size={14} />,   color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: 'Excused' },
}

export default function ParentAttendancePage() {
  const { currentUser, parents, students, attendance, batches } = useAppStore()

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const children = students.filter((s) => parent?.studentIds.includes(s.id))

  if (!parent || children.length === 0) {
    return <div className="text-white/30 p-6">No children linked to this account.</div>
  }

  const child = children[0]
  const childAttendance = attendance
    .filter((a) => a.studentId === child.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const total = childAttendance.length
  const present = childAttendance.filter((a) => a.status === 'present').length
  const late = childAttendance.filter((a) => a.status === 'late').length
  const absent = childAttendance.filter((a) => a.status === 'absent').length
  const excused = childAttendance.filter((a) => a.status === 'excused').length
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0

  const getBatchName = (batchId: string) => batches.find((b) => b.id === batchId)?.name ?? 'Unknown'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        subtitle={`${child.name}'s attendance record`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance Rate', value: `${rate}%`, color: rate >= 80 ? '#00FFA3' : rate >= 60 ? '#FBBF24' : '#FF6B7A' },
          { label: 'Present', value: present, color: '#00FFA3' },
          { label: 'Absent', value: absent, color: '#FF6B7A' },
          { label: 'Late / Excused', value: late + excused, color: '#FBBF24' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[26px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rate indicator */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: rate >= 80 ? '#00FFA3' : '#FF6B7A' }} />
            <span className="text-[13px] font-semibold text-white/70">Overall Rate</span>
          </div>
          <span
            className="text-[22px] font-bold font-display"
            style={{ color: rate >= 80 ? '#00FFA3' : rate >= 60 ? '#FBBF24' : '#FF6B7A' }}
          >
            {rate}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${rate}%`,
              background: rate >= 80
                ? 'linear-gradient(90deg, #00FFA3, #00D4FF)'
                : rate >= 60
                  ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                  : 'linear-gradient(90deg, #FF6B7A, #FF4D6A)',
              boxShadow: `0 0 12px ${rate >= 80 ? 'rgba(0,255,163,0.4)' : rate >= 60 ? 'rgba(251,191,36,0.4)' : 'rgba(255,107,122,0.4)'}`,
            }}
          />
        </div>
        <p className="text-[11px] text-white/25 mt-2">
          {rate >= 80 ? '✓ Excellent attendance!' : rate >= 70 ? '⚠ Attendance needs improvement' : '⚠ Attendance is below required threshold (80%)'}
        </p>
      </div>

      {/* Attendance log */}
      <div className="plato-card overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[13px] font-bold text-white/70">Attendance Log ({total} sessions)</h3>
        </div>
        <div className="overflow-y-auto max-h-[500px]">
          {childAttendance.map((record) => {
            const sc = STATUS_CONFIG[record.status]
            return (
              <div
                key={record.id}
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {sc.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/80">{formatDate(record.date)}</p>
                    <p className="text-[11px] text-white/35">{getBatchName(record.batchId)}</p>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {sc.label}
                </span>
              </div>
            )
          })}
          {childAttendance.length === 0 && (
            <p className="text-center text-[13px] text-white/30 py-10">No attendance records yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function AttendanceOverviewPage() {
  const { currentUser, batches, students, attendance } = useAppStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)

  const branchBatches = batches.filter((b) =>
    currentUser?.branchId ? b.branchId === currentUser.branchId : true
  ).filter((b) => b.status === 'active')

  const dayAttendance = attendance.filter((a) => a.date === selectedDate)

  const batchStats = branchBatches.map((batch) => {
    const batchAtt = dayAttendance.filter((a) => a.batchId === batch.id)
    const present = batchAtt.filter((a) => a.status === 'present').length
    const absent = batchAtt.filter((a) => a.status === 'absent').length
    const late = batchAtt.filter((a) => a.status === 'late').length
    const total = batch.studentIds.length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0
    return { batch, present, absent, late, total, rate, records: batchAtt }
  })

  const overall = {
    present: batchStats.reduce((s, b) => s + b.present, 0),
    absent: batchStats.reduce((s, b) => s + b.absent, 0),
    late: batchStats.reduce((s, b) => s + b.late, 0),
    total: batchStats.reduce((s, b) => s + b.total, 0),
  }
  const overallRate = overall.total > 0 ? Math.round((overall.present / overall.total) * 100) : 0

  // 7-day trend
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split('T')[0]
    const att = attendance.filter((a) => a.date === ds && branchBatches.some((b) => b.id === a.batchId))
    const total = att.length
    const present = att.filter((a) => a.status === 'present').length
    return { day: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], rate: total > 0 ? Math.round((present / total) * 100) : 0 }
  })

  const rateColor = (r: number) => r >= 85 ? '#00FFA3' : r >= 70 ? '#FBBF24' : '#FF6B7A'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Overview"
        subtitle={`${overallRate}% attendance on ${new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`}
        actions={
          <input type="date" className="plato-input text-[13px]" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Present', value: overall.present, color: '#00FFA3' },
          { label: 'Absent', value: overall.absent, color: '#FF6B7A' },
          { label: 'Late', value: overall.late, color: '#FBBF24' },
          { label: 'Rate', value: `${overallRate}%`, color: rateColor(overallRate) },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[24px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 7-day trend */}
      <div className="plato-card p-5">
        <h3 className="text-[13px] font-semibold text-white/70 mb-4">7-Day Attendance Rate</h3>
        <div className="flex items-end gap-2 h-20">
          {trend.map(({ day, rate }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-white/30">{rate > 0 ? `${rate}%` : '—'}</span>
              <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max(4, rate * 0.6)}px`, background: rateColor(rate), opacity: rate > 0 ? 0.8 : 0.2 }} />
              <span className="text-[10px] text-white/30">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Batch breakdown */}
      <div className="space-y-2">
        <h3 className="text-[13px] font-semibold text-white/50 uppercase tracking-widest px-1">By Batch</h3>
        {batchStats.map(({ batch, present, absent, late, total, rate, records }) => (
          <div key={batch.id} className="plato-card overflow-hidden">
            <button
              className="w-full flex items-center gap-4 p-4 text-left"
              onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/85">{batch.name}</p>
                <p className="text-[11px] text-white/35">{batch.subject} · {batch.curriculum}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 text-[11px]">
                  <span className="text-[#00FFA3]">{present}P</span>
                  <span className="text-[#FF6B7A]">{absent}A</span>
                  {late > 0 && <span className="text-[#FBBF24]">{late}L</span>}
                </div>
                <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${rate}%`, background: rateColor(rate) }} />
                </div>
                <span className="text-[12px] font-bold w-10 text-right" style={{ color: rateColor(rate) }}>{total > 0 ? `${rate}%` : '—'}</span>
                {expandedBatch === batch.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
              </div>
            </button>

            {expandedBatch === batch.id && (
              <div className="border-t border-white/5 divide-y divide-white/5">
                {batch.studentIds.map((sid) => {
                  const student = students.find((s) => s.id === sid)
                  const record = records.find((r) => r.studentId === sid)
                  if (!student) return null
                  const statusConfig = {
                    present: { color: '#00FFA3', label: 'Present' },
                    absent: { color: '#FF6B7A', label: 'Absent' },
                    late: { color: '#FBBF24', label: 'Late' },
                    excused: { color: '#4D7CFF', label: 'Excused' },
                  }
                  const cfg = record ? statusConfig[record.status] : { color: 'rgba(255,255,255,0.2)', label: 'Not marked' }

                  return (
                    <div key={sid} className="flex items-center gap-3 px-4 py-2.5">
                      <Avatar name={student.name} size="xs" />
                      <span className="flex-1 text-[12px] text-white/70">{student.name}</span>
                      <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

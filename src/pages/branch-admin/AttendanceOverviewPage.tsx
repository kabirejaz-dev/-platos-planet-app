import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { generateId } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { ChevronDown, ChevronUp, ClipboardCheck, Save, X } from 'lucide-react'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AttendanceOverviewPage() {
  const { currentUser, batches, students, attendance, bulkAddAttendance } = useAppStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [quickMarkOpen, setQuickMarkOpen] = useState(false)
  const [quickMarks, setQuickMarks] = useState<Record<string, 'present' | 'absent'>>({})

  const branchBatches = batches.filter((b) =>
    currentUser?.branchId ? b.branchId === currentUser.branchId : true
  ).filter((b) => b.status === 'active')

  const today = new Date().toISOString().split('T')[0]
  const todayAbbr = DAY_ABBR[new Date().getDay()]
  const todaysBatches = branchBatches.filter((b) => b.schedule.some((s) => s.day === todayAbbr))
  const todaysStudents = students.filter((s) => todaysBatches.some((b) => b.studentIds.includes(s.id)))

  const quickMarkStatus = (studentId: string): 'present' | 'absent' => {
    if (quickMarks[studentId]) return quickMarks[studentId]
    const existing = attendance.find((a) => a.studentId === studentId && a.date === today && todaysBatches.some((b) => b.id === a.batchId))
    return existing?.status === 'absent' ? 'absent' : 'present'
  }

  const saveQuickMark = () => {
    const records = todaysStudents.map((s) => {
      const batch = todaysBatches.find((b) => b.studentIds.includes(s.id))!
      return {
        id: `att-${generateId()}`,
        batchId: batch.id,
        studentId: s.id,
        date: today,
        status: quickMarkStatus(s.id),
        markedBy: currentUser?.id || '',
      }
    })
    bulkAddAttendance(records)
    const absentCount = records.filter((r) => r.status === 'absent').length
    toast.success('Attendance saved', `${records.length} students recorded${absentCount > 0 ? ` · ${absentCount} absent` : ''}`)
    setQuickMarkOpen(false)
    setQuickMarks({})
  }

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
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setQuickMarkOpen(true)} disabled={todaysBatches.length === 0}>
              <ClipboardCheck size={14} /> Quick Mark Today
            </button>
            <input type="date" className="plato-input text-[13px]" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
        }
      />

      {quickMarkOpen && (
        <div className="plato-card p-5 space-y-4" style={{ border: '1px solid rgba(251,191,36,0.3)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-white/90">Quick Mark Today — {todaysBatches.map((b) => b.name).join(', ')}</h3>
              <p className="text-[12px] text-white/40">{todaysStudents.length} students across {todaysBatches.length} class{todaysBatches.length === 1 ? '' : 'es'} today</p>
            </div>
            <button onClick={() => { setQuickMarkOpen(false); setQuickMarks({}) }} className="text-white/30 hover:text-white/70"><X size={18} /></button>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {todaysStudents.map((student) => {
              const status = quickMarkStatus(student.id)
              return (
                <div key={student.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={student.name} size="xs" />
                  <span className="flex-1 text-[13px] text-white/75">{student.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQuickMarks((m) => ({ ...m, [student.id]: 'present' }))}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                      style={status === 'present' ? { background: '#00FFA3', color: '#0A0E1A' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => setQuickMarks((m) => ({ ...m, [student.id]: 'absent' }))}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                      style={status === 'absent' ? { background: '#FF6B7A', color: '#0A0E1A' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              )
            })}
            {todaysStudents.length === 0 && <p className="text-[13px] text-white/30 text-center py-6">No classes scheduled today.</p>}
          </div>
          <button className="btn-primary w-full justify-center" onClick={saveQuickMark} disabled={todaysStudents.length === 0}>
            <Save size={14} /> Save Attendance
          </button>
        </div>
      )}

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

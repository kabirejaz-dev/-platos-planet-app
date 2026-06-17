import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { toast } from '@/components/ui/Toaster'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { generateId } from '@/lib/utils'
import type { AttendanceStatus } from '@/types'
import { CheckCircle2, XCircle, Clock, FileCheck, Save } from 'lucide-react'

const statusConfig: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: 'Present', color: '#00FFA3', icon: <CheckCircle2 size={16} /> },
  absent: { label: 'Absent', color: '#FF6B7A', icon: <XCircle size={16} /> },
  late: { label: 'Late', color: '#C6FF00', icon: <Clock size={16} /> },
  excused: { label: 'Excused', color: '#4D7CFF', icon: <FileCheck size={16} /> },
}

export default function AttendancePage() {
  const { currentUser, teachers, batches, students, attendance, bulkAddAttendance, addNotification } = useAppStore()
  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  const myBatches = batches.filter((b) => b.teacherId === teacher?.id && b.status === 'active')

  const [selectedBatch, setSelectedBatch] = useState(myBatches[0]?.id || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const batch = batches.find((b) => b.id === selectedBatch)
  const batchStudents = students.filter((s) => batch?.studentIds.includes(s.id))

  // Load existing attendance for this batch+date
  const existing = attendance.filter((a) => a.batchId === selectedBatch && a.date === date)
  const resolvedMarks = (studentId: string): AttendanceStatus => {
    if (marks[studentId]) return marks[studentId]
    const ex = existing.find((a) => a.studentId === studentId)
    return ex?.status || 'present'
  }

  const setAll = (status: AttendanceStatus) => {
    const newMarks: Record<string, AttendanceStatus> = {}
    batchStudents.forEach((s) => { newMarks[s.id] = status })
    setMarks(newMarks)
  }

  const handleSave = () => {
    if (!teacher || !batch) return
    const records = batchStudents.map((s) => ({
      id: `att-${generateId()}`,
      batchId: selectedBatch,
      studentId: s.id,
      date,
      status: resolvedMarks(s.id),
      markedBy: teacher.id,
      note: notes[s.id],
    }))
    bulkAddAttendance(records)

    // Notify parents of absent students
    records.filter((r) => r.status === 'absent').forEach((r) => {
      addNotification({
        id: `notif-${generateId()}`,
        userId: `u-pr-${r.studentId.replace('st-', '')}`,
        title: 'Absence Notification',
        message: `${students.find((s) => s.id === r.studentId)?.name} was marked absent for ${batch.subject} on ${date}.`,
        type: 'warning',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    })

    const absentNames = records.filter((r) => r.status === 'absent').map((r) => students.find((s) => s.id === r.studentId)?.name).filter(Boolean)
    toast.success('Attendance saved', absentNames.length > 0 ? `${absentNames.length} student${absentNames.length > 1 ? 's' : ''} marked absent` : `${presentCount} present · all recorded`)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const presentCount = batchStudents.filter((s) => resolvedMarks(s.id) === 'present').length
  const absentCount = batchStudents.filter((s) => resolvedMarks(s.id) === 'absent').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        subtitle="Record student attendance for your classes"
        actions={
          <button className="btn-primary" onClick={handleSave} disabled={!batch}>
            <Save size={16} />
            {saved ? 'Saved ✓' : 'Save Attendance'}
          </button>
        }
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Select Batch</label>
          <select className="plato-input" value={selectedBatch} onChange={(e) => { setSelectedBatch(e.target.value); setMarks({}) }}>
            {myBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Date</label>
          <input type="date" className="plato-input" value={date} onChange={(e) => { setDate(e.target.value); setMarks({}) }} />
        </div>
      </div>

      {batch && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: batchStudents.length, color: '#4D7CFF' },
              { label: 'Present', value: presentCount, color: '#00FFA3' },
              { label: 'Absent', value: absentCount, color: '#FF6B7A' },
              { label: 'Late/Excused', value: batchStudents.length - presentCount - absentCount, color: '#C6FF00' },
            ].map((s) => (
              <div key={s.label} className="plato-card p-3 text-center">
                <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Mark all:</span>
            {(Object.keys(statusConfig) as AttendanceStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setAll(s)}
                className="text-xs px-3 py-1.5 rounded-lg border border-dark-border hover:border-current transition-all"
                style={{ color: statusConfig[s].color }}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>

          {/* Student list */}
          <div className="plato-card overflow-hidden">
            <div className="p-4 border-b border-dark-border">
              <h3 className="text-sm font-semibold text-foreground">{batch.name}</h3>
              <p className="text-xs text-muted-foreground">{batchStudents.length} students · {date}</p>
            </div>

            <div className="divide-y divide-dark-border/50">
              {batchStudents.map((student, idx) => {
                const current = resolvedMarks(student.id)
                return (
                  <div key={student.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                    <span className="text-xs text-muted-foreground w-6">{idx + 1}</span>
                    <Avatar name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.curriculum} · {student.grade}</p>
                    </div>

                    {/* Status buttons */}
                    <div className="flex items-center gap-1.5">
                      {(Object.entries(statusConfig) as [AttendanceStatus, typeof statusConfig[AttendanceStatus]][]).map(([s, cfg]) => (
                        <button
                          key={s}
                          onClick={() => setMarks({ ...marks, [student.id]: s })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${current === s ? 'text-white' : 'text-muted-foreground hover:text-foreground bg-dark-border/30'}`}
                          style={current === s ? { background: cfg.color, color: '#0A0E1A' } : undefined}
                        >
                          {cfg.icon}
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

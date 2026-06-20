import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { toast } from '@/components/ui/Toaster'
import { generateId } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, Pencil } from 'lucide-react'

type QuickStatus = 'present' | 'absent' | 'late'

const STATUS_CONFIG: Record<QuickStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: 'Present', color: '#00FFA3', icon: <CheckCircle2 size={15} /> },
  absent: { label: 'Absent', color: '#FF6B7A', icon: <XCircle size={15} /> },
  late: { label: 'Late', color: '#C6FF00', icon: <Clock size={15} /> },
}

interface MarkAttendanceModalProps {
  open: boolean
  onClose: () => void
  batchId: string
}

function draftKey(batchId: string, date: string) {
  return `pp-attendance-draft-${batchId}-${date}`
}

export function MarkAttendanceModal({ open, onClose, batchId }: MarkAttendanceModalProps) {
  const { currentUser, teachers, batches, students, attendance, bulkAddAttendance, addNotification } = useAppStore()
  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  const batch = batches.find((b) => b.id === batchId)
  const batchStudents = students.filter((s) => batch?.studentIds.includes(s.id))
  const today = new Date().toISOString().split('T')[0]

  const existing = attendance.filter((a) => a.batchId === batchId && a.date === today)
  const alreadySubmitted = existing.length > 0

  const [editing, setEditing] = useState(false)
  const [marks, setMarks] = useState<Record<string, QuickStatus>>({})
  const [lateMinutes, setLateMinutes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setEditing(false)
    const draft = localStorage.getItem(draftKey(batchId, today))
    if (alreadySubmitted) {
      const fromExisting: Record<string, QuickStatus> = {}
      const fromExistingLate: Record<string, string> = {}
      existing.forEach((r) => {
        fromExisting[r.studentId] = r.status === 'excused' ? 'absent' : r.status
        if (r.status === 'late' && r.note) {
          const m = r.note.match(/(\d+)/)
          if (m) fromExistingLate[r.studentId] = m[1]
        }
      })
      setMarks(fromExisting)
      setLateMinutes(fromExistingLate)
    } else if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setMarks(parsed.marks || {})
        setLateMinutes(parsed.lateMinutes || {})
      } catch {
        setMarks({})
        setLateMinutes({})
      }
    } else {
      setMarks({})
      setLateMinutes({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, batchId])

  if (!batch) return null

  const resolved = (studentId: string): QuickStatus => marks[studentId] || 'present'

  const setStatus = (studentId: string, status: QuickStatus) => {
    setMarks({ ...marks, [studentId]: status })
  }

  const presentCount = batchStudents.filter((s) => resolved(s.id) === 'present').length
  const absentCount = batchStudents.filter((s) => resolved(s.id) === 'absent').length
  const lateCount = batchStudents.filter((s) => resolved(s.id) === 'late').length

  const close = () => { onClose() }

  const saveDraft = () => {
    localStorage.setItem(draftKey(batchId, today), JSON.stringify({ marks, lateMinutes }))
    toast.success('Draft saved', 'You can come back and submit it later.')
    close()
  }

  const submit = () => {
    if (!teacher) return
    const records = batchStudents.map((s) => {
      const status = resolved(s.id)
      const note = status === 'late' && lateMinutes[s.id] ? `Late by ${lateMinutes[s.id]} min` : undefined
      return {
        id: existing.find((r) => r.studentId === s.id)?.id || `att-${generateId()}`,
        batchId,
        studentId: s.id,
        date: today,
        status: status as QuickStatus,
        markedBy: teacher.id,
        note,
      }
    })
    bulkAddAttendance(records)
    localStorage.removeItem(draftKey(batchId, today))

    records.filter((r) => r.status === 'absent').forEach((r) => {
      addNotification({
        id: `notif-${generateId()}`,
        userId: `u-pr-${r.studentId.replace('st-', '')}`,
        title: 'Absence Notification',
        message: `${students.find((s) => s.id === r.studentId)?.name} was marked absent for ${batch.subject} on ${today}.`,
        type: 'warning',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    })

    const absentNames = records.filter((r) => r.status === 'absent').map((r) => students.find((s) => s.id === r.studentId)?.name).filter(Boolean)
    toast.success('Attendance submitted', absentNames.length > 0 ? `${absentNames.length} student${absentNames.length > 1 ? 's' : ''} marked absent — parents notified.` : `${presentCount} of ${batchStudents.length} present.`)
    setEditing(false)
    close()
  }

  const locked = alreadySubmitted && !editing

  return (
    <Modal open={open} onClose={close} title={`Mark Attendance — ${batch.name}`} size="lg">
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{batchStudents.length} students · {today}</p>

        {alreadySubmitted && !editing && (
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(77,124,255,0.06)', border: '1px solid rgba(77,124,255,0.2)' }}>
            <p className="text-[13px] text-white/80">Attendance already submitted today — {presentCount} present, {absentCount} absent, {lateCount} late.</p>
            <button className="btn-ghost border border-dark-border text-xs min-h-[36px] flex-shrink-0" onClick={() => setEditing(true)}>
              <Pencil size={13} /> Edit
            </button>
          </div>
        )}

        {!locked && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {(['present', 'absent', 'late'] as QuickStatus[]).map((s) => (
                <div key={s} className="plato-card p-3 text-center">
                  <p className="text-xl font-bold font-display" style={{ color: STATUS_CONFIG[s].color }}>
                    {s === 'present' ? presentCount : s === 'absent' ? absentCount : lateCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{STATUS_CONFIG[s].label}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-dark-border/50 max-h-[360px] overflow-y-auto">
              {batchStudents.map((student, idx) => {
                const current = resolved(student.id)
                return (
                  <div key={student.id} className="flex items-center gap-3 py-3 flex-wrap">
                    <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
                    <Avatar name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.curriculum} · {student.grade}</p>
                    </div>

                    {current === 'late' && (
                      <input
                        type="number"
                        min={1}
                        max={120}
                        placeholder="mins"
                        className="plato-input w-20 text-center text-xs py-1.5"
                        value={lateMinutes[student.id] || ''}
                        onChange={(e) => setLateMinutes({ ...lateMinutes, [student.id]: e.target.value })}
                      />
                    )}

                    <div className="flex items-center gap-1.5">
                      {(['present', 'absent', 'late'] as QuickStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(student.id, s)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${current === s ? '' : 'text-muted-foreground hover:text-foreground bg-dark-border/30'}`}
                          style={current === s ? { background: STATUS_CONFIG[s].color, color: '#0A0E1A' } : undefined}
                        >
                          {STATUS_CONFIG[s].icon}
                          <span className="hidden sm:inline">{STATUS_CONFIG[s].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={saveDraft}>Save Draft</button>
              <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={submit}>
                {alreadySubmitted ? 'Resubmit Attendance' : 'Submit Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

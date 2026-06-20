import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate } from '@/lib/utils'
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Upload, X } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay'
import type { Homework } from '@/types'

const STATUS_CONFIG = {
  assigned:  { icon: <Clock size={14} />,         color: '#4D7CFF',  bg: 'rgba(77,124,255,0.1)',  label: 'Assigned' },
  submitted: { icon: <Upload size={14} />,          color: '#FBBF24',  bg: 'rgba(251,191,36,0.1)', label: 'Submitted' },
  graded:    { icon: <CheckCircle2 size={14} />,   color: '#00FFA3',  bg: 'rgba(0,255,163,0.1)',   label: 'Graded' },
  missing:   { icon: <AlertCircle size={14} />,    color: '#FF6B7A',  bg: 'rgba(255,107,122,0.1)', label: 'Missing' },
}

export default function StudentHomeworkPage() {
  const { currentUser, students, homework, batches, submitHomework, addXP } = useAppStore()
  const [filter, setFilter] = useState<'all' | Homework['status']>('all')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [celebrating, setCelebrating] = useState<Homework | null>(null)

  const student = students.find((s) => s.userId === currentUser?.id)
  if (!student) return <div className="text-white/30 p-6">Student profile not found.</div>

  const myBatchIds = student.batchIds
  const myHomework = homework.filter((h) => myBatchIds.includes(h.batchId))

  const getStatus = (hw: Homework): Homework['status'] => {
    const submission = hw.submissions.find((s) => s.studentId === student.id)
    if (!submission) {
      return new Date(hw.dueDate) < new Date() ? 'missing' : 'assigned'
    }
    return submission.status === 'graded' ? 'graded' : 'submitted'
  }

  const getSubmission = (hw: Homework) =>
    hw.submissions.find((s) => s.studentId === student.id)

  const filtered = myHomework.filter((hw) => {
    if (filter === 'all') return true
    return getStatus(hw) === filter
  })

  const handleSubmit = (hw: Homework) => {
    submitHomework(hw.id, {
      studentId: student.id,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    })
    addXP(student.id, 15)
    toast.success('Homework submitted! +15 XP', hw.title)
    setCelebrating(hw)
    setSubmitting(null)
    setNote('')
  }

  const counts = {
    all: myHomework.length,
    assigned: myHomework.filter((h) => getStatus(h) === 'assigned').length,
    submitted: myHomework.filter((h) => getStatus(h) === 'submitted').length,
    graded: myHomework.filter((h) => getStatus(h) === 'graded').length,
    missing: myHomework.filter((h) => getStatus(h) === 'missing').length,
  }

  const getBatchName = (batchId: string) =>
    batches.find((b) => b.id === batchId)?.name ?? 'Unknown batch'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Homework"
        subtitle={`${counts.assigned} pending · ${counts.graded} graded`}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'assigned', 'submitted', 'graded', 'missing'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(77,124,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f ? 'rgba(77,124,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
              color: filter === f ? '#4D7CFF' : 'rgba(100,116,139,0.8)',
            }}
          >
            {f === 'all' ? 'All' : f}
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px]"
              style={{
                background: filter === f ? 'rgba(77,124,255,0.3)' : 'rgba(255,255,255,0.08)',
                color: filter === f ? '#4D7CFF' : 'rgba(100,116,139,0.6)',
              }}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Homework list */}
      <div className="space-y-3">
        {filtered.map((hw) => {
          const status = getStatus(hw)
          const sc = STATUS_CONFIG[status]
          const submission = getSubmission(hw)
          const isOverdue = new Date(hw.dueDate) < new Date() && status === 'assigned'
          const isSubmitOpen = submitting === hw.id

          return (
            <div key={hw.id} className="plato-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-bold text-white/90">{hw.title}</h3>
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  <p className="text-[12px] text-white/50 mb-2">{getBatchName(hw.batchId)} · {hw.subject}</p>
                  <p className="text-[13px] text-white/60 leading-relaxed">{hw.description}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <span
                      className={`text-[12px] font-medium ${isOverdue ? 'text-[#FF6B7A]' : 'text-white/40'}`}
                    >
                      Due: {formatDate(hw.dueDate)}
                    </span>
                    <span className="text-[12px] text-white/30">Max marks: {hw.maxMarks}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  {status === 'graded' && submission?.marks !== undefined ? (
                    <div>
                      <p
                        className="text-[22px] font-bold font-display"
                        style={{ color: (submission.marks / hw.maxMarks) >= 0.8 ? '#00FFA3' : (submission.marks / hw.maxMarks) >= 0.6 ? '#FBBF24' : '#FF6B7A' }}
                      >
                        {submission.marks}/{hw.maxMarks}
                      </p>
                      <p className="text-[11px] text-white/30">marks</p>
                    </div>
                  ) : status === 'assigned' ? (
                    <button
                      className="btn-primary"
                      onClick={() => setSubmitting(isSubmitOpen ? null : hw.id)}
                    >
                      <Upload size={14} /> Submit
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Submission panel */}
              {isSubmitOpen && (
                <div
                  className="mt-4 p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(77,124,255,0.06)', border: '1px solid rgba(77,124,255,0.15)' }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13px] font-semibold text-[#4D7CFF]">Submit Homework</h4>
                    <button onClick={() => setSubmitting(null)} className="text-white/30 hover:text-white/70">
                      <X size={14} />
                    </button>
                  </div>
                  <textarea
                    className="plato-input text-[13px]"
                    rows={3}
                    placeholder="Add a note for your teacher (optional)…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <button className="btn-ghost text-[12px]" onClick={() => setSubmitting(null)}>Cancel</button>
                    <button className="btn-primary text-[12px]" onClick={() => handleSubmit(hw)}>
                      <Upload size={13} /> Confirm Submission
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {submission?.feedback && (
                <div
                  className="mt-4 p-3 rounded-xl"
                  style={{ background: 'rgba(0,255,163,0.06)', border: '1px solid rgba(0,255,163,0.15)' }}
                >
                  <p className="text-[11px] text-[#00FFA3] font-semibold mb-1">Teacher Feedback</p>
                  <p className="text-[12px] text-white/60">{submission.feedback}</p>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px]">No homework in this category.</p>
          </div>
        )}
      </div>

      <CelebrationOverlay
        open={Boolean(celebrating)}
        onClose={() => setCelebrating(null)}
        xp={15}
        studentFirstName={student.name.split(' ')[0]}
        itemTitle={celebrating?.title || ''}
      />
    </div>
  )
}

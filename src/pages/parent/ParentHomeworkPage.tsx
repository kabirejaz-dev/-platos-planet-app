import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatDate } from '@/lib/utils'
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Upload } from 'lucide-react'

export default function ParentHomeworkPage() {
  const { currentUser, parents, students, homework, batches } = useAppStore()

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const children = students.filter((s) => parent?.studentIds.includes(s.id))

  if (!parent || children.length === 0) {
    return <div className="text-white/30 p-6">No children linked to this account.</div>
  }

  const child = children[0]
  const myBatchIds = child.batchIds
  const childHomework = homework
    .filter((h) => myBatchIds.includes(h.batchId))
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())

  const getStatus = (hw: typeof homework[0]) => {
    const submission = hw.submissions.find((s) => s.studentId === child.id)
    if (!submission) return new Date(hw.dueDate) < new Date() ? 'missing' : 'assigned'
    return submission.status === 'graded' ? 'graded' : 'submitted'
  }

  const getSubmission = (hw: typeof homework[0]) =>
    hw.submissions.find((s) => s.studentId === child.id)

  const getBatchName = (id: string) => batches.find((b) => b.id === id)?.name ?? 'Unknown'

  const counts = {
    total: childHomework.length,
    assigned: childHomework.filter((h) => getStatus(h) === 'assigned').length,
    submitted: childHomework.filter((h) => getStatus(h) === 'submitted').length,
    graded: childHomework.filter((h) => getStatus(h) === 'graded').length,
    missing: childHomework.filter((h) => getStatus(h) === 'missing').length,
  }

  const STATUS_CONFIG = {
    assigned:  { icon: <Clock size={13} />,        color: '#4D7CFF',  bg: 'rgba(77,124,255,0.1)',  label: 'Assigned' },
    submitted: { icon: <Upload size={13} />,         color: '#FBBF24',  bg: 'rgba(251,191,36,0.1)', label: 'Submitted' },
    graded:    { icon: <CheckCircle2 size={13} />,  color: '#00FFA3',  bg: 'rgba(0,255,163,0.1)',   label: 'Graded' },
    missing:   { icon: <AlertCircle size={13} />,   color: '#FF6B7A',  bg: 'rgba(255,107,122,0.1)', label: 'Missing' },
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Homework" subtitle={`${child.name}'s assignments`} badge={<DemoBadge />} />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, color: '#4D7CFF' },
          { label: 'Submitted', value: counts.submitted + counts.graded, color: '#00FFA3' },
          { label: 'Pending', value: counts.assigned, color: '#FBBF24' },
          { label: 'Missing', value: counts.missing, color: counts.missing > 0 ? '#FF6B7A' : '#00FFA3' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[24px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Homework list */}
      <div className="plato-card overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[13px] font-bold text-white/70">All Assignments ({counts.total})</h3>
        </div>
        <div>
          {childHomework.map((hw) => {
            const status = getStatus(hw)
            const sc = STATUS_CONFIG[status]
            const submission = getSubmission(hw)
            const isOverdue = new Date(hw.dueDate) < new Date() && status === 'assigned'

            return (
              <div
                key={hw.id}
                className="flex items-start gap-4 px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {sc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-white/85">{hw.title}</p>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/35 mt-0.5">{getBatchName(hw.batchId)} · {hw.subject}</p>
                  <p className="text-[11px] mt-1" style={{ color: isOverdue ? '#FF6B7A' : 'rgba(100,116,139,0.6)' }}>
                    Due: {formatDate(hw.dueDate)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {status === 'graded' && submission?.marks !== undefined ? (
                    <div>
                      <p
                        className="text-[16px] font-bold font-display"
                        style={{ color: (submission.marks / hw.maxMarks) >= 0.8 ? '#00FFA3' : '#FBBF24' }}
                      >
                        {submission.marks}/{hw.maxMarks}
                      </p>
                      <p className="text-[10px] text-white/30">marks</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}

          {childHomework.length === 0 && (
            <div className="text-center py-12 text-white/30">
              <ClipboardList size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-[13px]">No homework assigned yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

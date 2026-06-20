import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { FieldError, fieldInputClass } from '@/components/ui/FormField'
import { generateId, formatDate, getStatusColor, gradeFromPercentage } from '@/lib/utils'
import { homeworkSchema, getFieldErrors } from '@/lib/schemas'
import { Plus, ClipboardList, Users, Clock, CheckCircle2, Star } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

export default function HomeworkPage() {
  const { currentUser, teachers, batches, students, homework, parents, addHomework, updateHomework, addNotification } = useAppStore()
  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  const myBatches = batches.filter((b) => b.teacherId === teacher?.id)
  const myHomework = homework.filter((h) => h.teacherId === teacher?.id)

  const [showModal, setShowModal] = useState(false)
  const [selectedHW, setSelectedHW] = useState<string | null>(null)
  const [grading, setGrading] = useState<Record<string, { marks: string; feedback: string }>>({})
  const [form, setForm] = useState({
    batchId: myBatches[0]?.id || '',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: '50',
  })
  const [errors, setErrors] = useState<Partial<Record<'title' | 'dueDate' | 'maxMarks', string>>>({})

  const handleCreate = () => {
    if (!teacher) return
    const fieldErrors = getFieldErrors(homeworkSchema, form)
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    const batch = batches.find((b) => b.id === form.batchId)
    addHomework({
      id: `hw-${generateId()}`,
      batchId: form.batchId,
      teacherId: teacher.id,
      title: form.title,
      description: form.description,
      subject: batch?.subject || 'Physics',
      dueDate: form.dueDate,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'assigned',
      maxMarks: Number(form.maxMarks),
      submissions: [],
    })
    setShowModal(false)
    setForm({ batchId: myBatches[0]?.id || '', title: '', description: '', dueDate: '', maxMarks: '50' })
    setErrors({})
  }

  const saveGrade = (hwId: string, studentId: string) => {
    const key = `${hwId}-${studentId}`
    const g = grading[key]
    if (!g) return
    const hw = homework.find((h) => h.id === hwId)
    updateHomework(hwId, {
      submissions: hw?.submissions.map((s) =>
        s.studentId === studentId ? { ...s, marks: Number(g.marks), feedback: g.feedback, status: 'graded' } : s
      ),
    })
    const student = students.find((s) => s.id === studentId)
    toast.success('Graded', `${student?.name} · ${g.marks}/${hw?.maxMarks} marks`)

    if (student && hw) {
      const gradeMsg = `${hw.title}: ${student.name} scored ${g.marks}/${hw.maxMarks}.`
      addNotification({ id: `notif-${generateId()}`, userId: student.userId, title: 'Homework Graded', message: gradeMsg, type: 'success', isRead: false, createdAt: new Date().toISOString(), link: '/student/homework' })
      const parent = parents.find((p) => p.id === student.parentId)
      if (parent) {
        addNotification({ id: `notif-${generateId()}`, userId: parent.userId, title: 'Homework Graded', message: gradeMsg, type: 'info', isRead: false, createdAt: new Date().toISOString(), link: '/parent/homework' })
      }
    }
  }

  const viewHW = myHomework.find((h) => h.id === selectedHW)
  const viewBatch = batches.find((b) => b.id === viewHW?.batchId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        subtitle={`${myHomework.length} assignments · ${myHomework.reduce((s, h) => s + h.submissions.filter((sub) => sub.status === 'submitted').length, 0)} pending review`}
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Assign Homework
          </button>
        }
      />

      {selectedHW && viewHW ? (
        // Detail view
        <div className="space-y-4">
          <button className="btn-ghost" onClick={() => setSelectedHW(null)}>← Back to all homework</button>

          <div className="plato-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground font-display">{viewHW.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{viewBatch?.name}</p>
              </div>
              <span className={getStatusColor(viewHW.status)}>{viewHW.status}</span>
            </div>
            <p className="text-sm text-foreground/80 mt-4">{viewHW.description}</p>
            <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={12} /> Due: {formatDate(viewHW.dueDate)}</span>
              <span className="flex items-center gap-1"><Star size={12} /> Max: {viewHW.maxMarks} marks</span>
              <span className="flex items-center gap-1"><Users size={12} /> {viewHW.submissions.length}/{viewBatch?.studentIds.length || 0} submitted</span>
            </div>
          </div>

          {/* Submissions */}
          <div className="plato-card overflow-hidden">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Submissions & Grading</h3>
              <span className="text-xs text-muted-foreground">
                {viewHW.submissions.length}/{viewBatch?.studentIds.length || 0} submitted · {Math.max((viewBatch?.studentIds.length || 0) - viewHW.submissions.length, 0)} missing
              </span>
            </div>
            <div className="divide-y divide-dark-border/50">
              {(viewBatch?.studentIds || []).map((studentId) => {
                const student = students.find((s) => s.id === studentId)
                const sub = viewHW.submissions.find((s) => s.studentId === studentId)
                const key = `${viewHW.id}-${studentId}`

                return student ? (
                  <div key={studentId} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={student.name} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub ? `Submitted ${formatDate(sub.submittedAt)}` : 'Not submitted yet'}
                        </p>
                      </div>
                      <span className={sub ? getStatusColor(sub.status) : 'badge-danger'}>
                        {sub ? sub.status : 'missing'}
                      </span>
                    </div>

                    {sub && sub.status !== 'graded' && (
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="number"
                          placeholder={`Marks (/${viewHW.maxMarks})`}
                          className="plato-input w-32"
                          value={grading[key]?.marks || ''}
                          onChange={(e) => setGrading({ ...grading, [key]: { ...grading[key], marks: e.target.value } })}
                        />
                        {grading[key]?.marks && (
                          <span className="text-sm font-bold text-[#FBBF24] w-8 text-center">
                            {gradeFromPercentage(Math.round((Number(grading[key].marks) / viewHW.maxMarks) * 100))}
                          </span>
                        )}
                        <input
                          placeholder="Feedback (optional)"
                          className="plato-input flex-1"
                          value={grading[key]?.feedback || ''}
                          onChange={(e) => setGrading({ ...grading, [key]: { ...grading[key], feedback: e.target.value } })}
                        />
                        <button className="btn-primary py-2" onClick={() => saveGrade(viewHW.id, studentId)}>
                          <CheckCircle2 size={14} /> Grade
                        </button>
                      </div>
                    )}

                    {sub?.status === 'graded' && (
                      <div className="flex items-center gap-4 mt-2 p-3 rounded-xl bg-[#00FFA3]/5 border border-[#00FFA3]/20">
                        <div className="text-center">
                          <p className="text-lg font-bold text-[#00FFA3]">{sub.marks}/{viewHW.maxMarks}</p>
                          <p className="text-xs text-muted-foreground">marks</p>
                        </div>
                        {sub.feedback && <p className="text-sm text-muted-foreground">{sub.feedback}</p>}
                      </div>
                    )}
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>
      ) : (
        // List view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myHomework.map((hw) => {
            const batch = batches.find((b) => b.id === hw.batchId)
            const submitted = hw.submissions.length
            const total = batch?.studentIds.length || 0
            const pending = hw.submissions.filter((s) => s.status === 'submitted').length

            return (
              <div
                key={hw.id}
                onClick={() => setSelectedHW(hw.id)}
                className="plato-card p-5 cursor-pointer hover:shadow-card-hover hover:border-[#4D7CFF]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center">
                    <ClipboardList size={20} className="text-[#7B61FF]" />
                  </div>
                  <span className={getStatusColor(hw.status)}>{hw.status}</span>
                </div>

                <h3 className="font-semibold text-foreground">{hw.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{batch?.name}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(hw.dueDate)}</span>
                  <span className="flex items-center gap-1"><Star size={12} /> {hw.maxMarks} marks</span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Submissions</span>
                    <span className="text-foreground">{submitted}/{total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#4D7CFF]" style={{ width: `${total > 0 ? (submitted / total) * 100 : 0}%` }} />
                  </div>
                </div>

                {pending > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
                    <Clock size={12} /> {pending} awaiting review
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setErrors({}) }} title="Assign Homework">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Batch</label>
            <select className="plato-input" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}>
              {myBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Title</label>
            <input className={fieldInputClass(errors.title)} placeholder="e.g. Newton's Laws — Problem Set 3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <FieldError message={errors.title} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Instructions</label>
            <textarea className="plato-input resize-none h-28" placeholder="Describe the task in detail…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Due Date</label>
              <input type="date" className={fieldInputClass(errors.dueDate)} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              <FieldError message={errors.dueDate} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Max Marks</label>
              <input type="number" className={fieldInputClass(errors.maxMarks)} value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
              <FieldError message={errors.maxMarks} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => { setShowModal(false); setErrors({}) }}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.title || !form.dueDate}>Assign</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

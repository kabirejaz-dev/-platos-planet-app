import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Modal } from '@/components/ui/Modal'
import { FieldError, fieldInputClass } from '@/components/ui/FormField'
import { daysUntil, generateId } from '@/lib/utils'
import { assessmentSchema, getFieldErrors } from '@/lib/schemas'
import { toast } from '@/components/ui/Toaster'
import { Calendar, Clock, FileText, AlertCircle, Plus } from 'lucide-react'

const emptyForm = { batchId: '', teacherId: '', title: '', type: 'quiz' as 'quiz' | 'test' | 'mock_exam' | 'assignment', date: '', maxMarks: '100', duration: '60', topics: '' }

export default function AssessmentsPage() {
  const { assessments, batches, teachers, addAssessment } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'graded'>('upcoming')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<'title' | 'date' | 'maxMarks' | 'duration', string>>>({})

  const today = new Date().toISOString().split('T')[0]

  const closeModal = () => { setShowModal(false); setForm(emptyForm); setErrors({}) }

  const handleCreate = () => {
    const fieldErrors = getFieldErrors(assessmentSchema, form)
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    if (!form.batchId || !form.teacherId) return
    const batch = batches.find((b) => b.id === form.batchId)
    addAssessment({
      id: `as-${generateId()}`,
      batchId: form.batchId,
      teacherId: form.teacherId,
      title: form.title,
      subject: batch?.subject || 'Physics',
      curriculum: batch?.curriculum || 'IGCSE',
      type: form.type,
      date: form.date,
      maxMarks: Number(form.maxMarks),
      duration: Number(form.duration),
      status: new Date(form.date) > new Date() ? 'upcoming' : 'completed',
      syllabusTopics: form.topics.split(',').map((t) => t.trim()).filter(Boolean),
      results: [],
    })
    toast.success('Assessment created', form.title)
    closeModal()
  }

  const filtered = assessments.filter((a) => {
    if (filter === 'upcoming') return a.date >= today && a.status === 'upcoming'
    if (filter === 'graded') return a.status === 'graded'
    return true
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcoming = assessments.filter((a) => a.date >= today && a.status === 'upcoming')
  const thisWeek = upcoming.filter((a) => daysUntil(a.date) <= 7)

  const typeColor: Record<string, string> = {
    exam: '#FF6B7A', quiz: '#4D7CFF', assignment: '#7B61FF',
    mock: '#FBBF24', practical: '#00FFA3', test: '#00F0FF',
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assessments"
        subtitle={`${upcoming.length} upcoming · ${thisWeek.length} this week`}
        badge={<DemoBadge />}
        actions={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Create Assessment</button>}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#FF6B7A]">{thisWeek.length}</p>
          <p className="text-[11px] text-white/30 mt-1">This Week</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#4D7CFF]">{upcoming.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Upcoming</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#00FFA3]">{assessments.filter((a) => a.status === 'graded').length}</p>
          <p className="text-[11px] text-white/30 mt-1">Graded</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {(['upcoming', 'graded', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize" style={{ background: filter === f ? 'rgba(77,124,255,0.2)' : 'transparent', color: filter === f ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => {
          const batch = batches.find((b) => b.id === a.batchId)
          const teacher = teachers.find((t) => t.id === a.teacherId)
          const days = daysUntil(a.date)
          const color = typeColor[a.type] || '#4D7CFF'
          const isUrgent = days >= 0 && days <= 3

          return (
            <div key={a.id} className="plato-card p-4 flex items-center gap-4" style={{ borderLeft: `3px solid ${color}` }}>
              <div className="text-center w-14 flex-shrink-0">
                <p className="text-[10px] text-white/30 uppercase">{new Date(a.date + 'T00:00').toLocaleDateString('en', { month: 'short' })}</p>
                <p className="text-[22px] font-bold font-display text-white/80">{new Date(a.date + 'T00:00').getDate()}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-bold text-white/90">{a.title}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold capitalize" style={{ background: `${color}15`, color }}>{a.type}</span>
                  {isUrgent && a.status === 'upcoming' && (
                    <span className="flex items-center gap-1 text-[10px] text-[#FF6B7A]"><AlertCircle size={10} /> {days === 0 ? 'Today!' : `${days}d`}</span>
                  )}
                </div>
                <p className="text-[12px] text-white/40 mt-0.5">{a.subject} · {batch?.name}</p>
                {teacher && <p className="text-[11px] text-white/30">{teacher.name}</p>}
                <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30">
                  {a.duration && <span className="flex items-center gap-1"><Clock size={10} /> {a.duration} min</span>}
                  <span className="flex items-center gap-1"><FileText size={10} /> {a.maxMarks} marks</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: a.status === 'graded' ? 'rgba(0,255,163,0.1)' : 'rgba(77,124,255,0.1)', color: a.status === 'graded' ? '#00FFA3' : '#4D7CFF' }}>
                  {a.status}
                </span>
                {a.status === 'graded' && a.results.length > 0 && (
                  <p className="text-[11px] text-white/30 mt-1">{a.results.length} submitted</p>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <Calendar size={32} className="mx-auto mb-3 opacity-30" />
            <p>No assessments in this view.</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={closeModal} title="Create Assessment">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Batch</label>
            <select className="plato-input" value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}>
              <option value="">— Select Batch —</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Teacher</label>
            <select className="plato-input" value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}>
              <option value="">— Select Teacher —</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Title</label>
            <input className={fieldInputClass(errors.title)} placeholder="e.g. IGCSE Physics Mock Paper 2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <FieldError message={errors.title} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Type</label>
            <select className="plato-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}>
              <option value="quiz">Quiz</option>
              <option value="test">Test</option>
              <option value="mock_exam">Mock Exam</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Date</label>
              <input type="date" className={fieldInputClass(errors.date)} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              <FieldError message={errors.date} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Max Marks</label>
              <input type="number" className={fieldInputClass(errors.maxMarks)} placeholder="100" value={form.maxMarks} onChange={(e) => setForm((f) => ({ ...f, maxMarks: e.target.value }))} />
              <FieldError message={errors.maxMarks} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Duration (min)</label>
              <input type="number" className={fieldInputClass(errors.duration)} placeholder="60" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
              <FieldError message={errors.duration} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Syllabus Topics (comma separated)</label>
            <input className="plato-input" placeholder="Forces, Motion, Energy" value={form.topics} onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={closeModal}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.batchId || !form.teacherId || !form.title || !form.date}>Create</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, generateId } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Star, ClipboardCheck, Plus } from 'lucide-react'

const CATEGORY_LABEL: Record<string, string> = { lesson_observation: 'Lesson Observation', peer_review: 'Peer Review', student_feedback: 'Student Feedback' }

const SLIDER_FIELDS = [
  { key: 'teachingQuality', label: 'Teaching Quality' },
  { key: 'communication', label: 'Communication' },
  { key: 'punctuality', label: 'Punctuality' },
] as const

const emptyForm = {
  teacherId: '',
  category: 'lesson_observation' as 'lesson_observation' | 'peer_review' | 'student_feedback',
  rating: 0,
  teachingQuality: 3,
  communication: 3,
  punctuality: 3,
  strengths: '',
  improvements: '',
}

export default function TeacherReviewsPage() {
  const { currentUser, teacherReviews, teachers, updateTeacher, addTeacherReview } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const completed = teacherReviews.filter((r) => r.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const drafts = teacherReviews.filter((r) => r.status === 'draft')
  const avgRating = completed.length > 0 ? (completed.reduce((s, r) => s + r.rating, 0) / completed.length).toFixed(1) : '0'

  const openModal = (teacherId?: string) => {
    setForm({ ...emptyForm, teacherId: teacherId || teachers[0]?.id || '' })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.teacherId || form.rating === 0) return
    const teacher = teachers.find((t) => t.id === form.teacherId)
    if (!teacher) return

    addTeacherReview({
      id: `rev-${generateId()}`,
      teacherId: form.teacherId,
      reviewerId: currentUser?.id || '',
      date: new Date().toISOString(),
      category: form.category,
      rating: form.rating,
      strengths: form.strengths,
      improvements: form.improvements,
      status: 'completed',
    })

    // Recompute the teacher's average rating from all completed reviews (including this new one)
    const teacherCompleted = teacherReviews.filter((r) => r.teacherId === form.teacherId && r.status === 'completed')
    const newAvg = (teacherCompleted.reduce((s, r) => s + r.rating, 0) + form.rating) / (teacherCompleted.length + 1)
    updateTeacher(form.teacherId, { rating: Math.round(newAvg * 10) / 10 })

    toast.success('Review saved', `${teacher.name}'s average rating updated.`)
    setShowModal(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Teacher Reviews"
        subtitle="Structured peer reviews and observation reports for teaching quality"
        badge={<DemoBadge />}
        actions={<button className="btn-primary" onClick={() => openModal()}><Plus size={15} /> Write Review</button>}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[22px] font-bold font-display text-[#FBBF24]">★ {avgRating}</p>
          <p className="text-[11px] text-white/30 mt-1">Avg Rating</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[22px] font-bold font-display text-[#00FFA3]">{completed.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Completed Reviews</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[22px] font-bold font-display text-[#4D7CFF]">{drafts.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Drafts</p>
        </div>
      </div>

      <div className="space-y-3">
        {completed.map((review) => {
          const teacher = teachers.find((t) => t.id === review.teacherId)
          return (
            <div key={review.id} className="plato-card p-4">
              <div className="flex items-start gap-3">
                {teacher && <Avatar name={teacher.name} size="sm" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-white/85">{teacher?.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#7B61FF]/10 text-[#7B61FF]">{CATEGORY_LABEL[review.category]}</span>
                  </div>
                  <p className="text-[11px] text-white/30">{formatDate(review.date)}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-[10px] font-semibold text-[#00FFA3] uppercase tracking-wider mb-1">Strengths</p>
                      <p className="text-[12px] text-white/60">{review.strengths}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#FBBF24] uppercase tracking-wider mb-1">Areas to Improve</p>
                      <p className="text-[12px] text-white/60">{review.improvements}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#FBBF24] flex-shrink-0">
                  <Star size={14} fill="#FBBF24" /> <span className="text-[13px] font-bold">{review.rating}</span>
                </div>
              </div>
            </div>
          )
        })}

        {drafts.map((review) => {
          const teacher = teachers.find((t) => t.id === review.teacherId)
          return (
            <div key={review.id} className="plato-card p-4 flex items-center gap-3 opacity-60">
              <ClipboardCheck size={16} className="text-white/30" />
              {teacher && <Avatar name={teacher.name} size="sm" />}
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-white/70">{teacher?.name} — {CATEGORY_LABEL[review.category]}</p>
                <p className="text-[11px] text-white/30">Draft · not yet completed</p>
              </div>
            </div>
          )
        })}

        {completed.length === 0 && drafts.length === 0 && (
          <p className="text-center text-[13px] text-white/30 py-10">No reviews yet. Click "Write Review" to add one.</p>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Write Review">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Teacher</label>
            <select className="plato-input" value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.subjects.join(', ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Review Type</label>
            <select className="plato-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof f.category }))}>
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Overall Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                  <Star size={22} fill={n <= form.rating ? '#FBBF24' : 'none'} className={n <= form.rating ? 'text-[#FBBF24]' : 'text-white/20'} />
                </button>
              ))}
            </div>
          </div>
          {SLIDER_FIELDS.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                <span>{s.label}</span><span>{form[s.key]}/5</span>
              </div>
              <input type="range" min={1} max={5} value={form[s.key]} onChange={(e) => setForm((f) => ({ ...f, [s.key]: Number(e.target.value) }))} className="w-full" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Strengths</label>
            <textarea className="plato-input min-h-[70px]" placeholder="What did the teacher do well?" value={form.strengths} onChange={(e) => setForm((f) => ({ ...f, strengths: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Areas to Improve</label>
            <textarea className="plato-input min-h-[70px]" placeholder="What could be improved?" value={form.improvements} onChange={(e) => setForm((f) => ({ ...f, improvements: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={!form.teacherId || form.rating === 0}>Save Review</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

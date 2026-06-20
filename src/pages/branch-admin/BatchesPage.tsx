import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { FieldError, fieldInputClass } from '@/components/ui/FormField'
import { generateId } from '@/lib/utils'
import { batchSchema, getFieldErrors } from '@/lib/schemas'
import { Plus, BookOpen, Clock, X } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'
import type { BatchStatus, Subject, Curriculum } from '@/types'

const STATUS_STYLE: Record<BatchStatus, { bg: string; color: string }> = {
  active:   { bg: 'rgba(0,255,163,0.1)',   color: '#00FFA3' },
  inactive: { bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
  full:     { bg: 'rgba(255,107,122,0.1)', color: '#FF6B7A' },
  upcoming: { bg: 'rgba(77,124,255,0.1)',  color: '#4D7CFF' },
}

const SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Business Studies', 'Accounting', 'Computer Science', 'Economics']
const CURRICULA: Curriculum[] = ['IGCSE', 'A-Level', 'CBSE', 'IB', 'American']

export default function BatchesPage() {
  const { currentUser, batches, students, teachers, addBatch } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    subject: 'Mathematics' as Subject,
    curriculum: 'IGCSE' as Curriculum,
    grade: '',
    maxCapacity: 15,
    room: '',
    startDate: new Date().toISOString().split('T')[0],
    teacherId: '',
    day1: 'Mon' as const,
    start1: '16:00',
    end1: '18:00',
  })
  const [errors, setErrors] = useState<Partial<Record<'name' | 'grade' | 'teacherId' | 'maxCapacity', string>>>({})

  const branchBatches = batches.filter((b) =>
    currentUser?.branchId ? b.branchId === currentUser.branchId : true
  )
  const branchTeachers = teachers.filter((t) =>
    currentUser?.branchId ? t.branchId === currentUser.branchId : true
  )

  const handleCreate = () => {
    const fieldErrors = getFieldErrors(batchSchema, form)
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    addBatch({
      id: generateId(),
      name: form.name,
      branchId: currentUser?.branchId || 'br-001',
      teacherId: form.teacherId,
      subject: form.subject,
      curriculum: form.curriculum,
      grade: form.grade,
      studentIds: [],
      maxCapacity: form.maxCapacity,
      schedule: [{ day: form.day1, startTime: form.start1, endTime: form.end1 }],
      status: 'upcoming',
      room: form.room || undefined,
      startDate: form.startDate,
    })
    toast.success('Batch created', form.name)
    setShowModal(false)
    setForm(f => ({ ...f, name: '', grade: '', room: '', teacherId: '' }))
    setErrors({})
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Batches"
        subtitle={`${branchBatches.length} class batches`}
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> New Batch
          </button>
        }
      />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {branchBatches.map((batch) => {
          const enrolled = batch.studentIds.length
          const capacity = batch.maxCapacity
          const fillPct = Math.round((enrolled / capacity) * 100)
          const ss = STATUS_STYLE[batch.status]
          const teacher = branchTeachers.find((t) => t.id === batch.teacherId)

          return (
            <div key={batch.id} className="plato-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white/90 leading-tight">{batch.name}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{batch.curriculum} · {batch.grade}</p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                  style={{ background: ss.bg, color: ss.color }}
                >
                  {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                </span>
              </div>

              {/* Subject badge */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(77,124,255,0.12)', color: '#4D7CFF' }}>
                  <BookOpen size={13} />
                </div>
                <span className="text-[13px] font-semibold text-white/70">{batch.subject}</span>
              </div>

              {/* Capacity bar */}
              <div>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-white/40">Students</span>
                  <span className="text-white/70 font-semibold">{enrolled} / {capacity}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: fillPct >= 90 ? '#FF6B7A' : fillPct >= 70 ? '#FBBF24' : '#00FFA3',
                    }}
                  />
                </div>
              </div>

              {/* Schedule & teacher */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-white/40">
                  <Clock size={11} />
                  {batch.schedule.map((s) => `${s.day} ${s.startTime}–${s.endTime}`).join(', ')}
                </div>
                {teacher && (
                  <div className="flex items-center gap-2">
                    <Avatar name={teacher.name} size="xs" />
                    <span className="text-[11px] text-white/50">{teacher.name}</span>
                  </div>
                )}
              </div>

              {/* Students avatars */}
              {enrolled > 0 && (
                <div className="flex items-center gap-1">
                  {batch.studentIds.slice(0, 5).map((sid) => {
                    const st = students.find((s) => s.id === sid)
                    return st ? <Avatar key={sid} name={st.name} size="xs" /> : null
                  })}
                  {enrolled > 5 && (
                    <span className="text-[10px] text-white/30 ml-1">+{enrolled - 5}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {branchBatches.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/30">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p>No batches yet. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => { setShowModal(false); setErrors({}) }} />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-[15px] font-bold text-white font-display">Create New Batch</h3>
                <button onClick={() => { setShowModal(false); setErrors({}) }} className="text-white/30 hover:text-white/70 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Batch Name *</label>
                    <input className={fieldInputClass(errors.name)} placeholder="e.g. IGCSE Physics — Grade 10" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                    <FieldError message={errors.name} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Subject</label>
                    <select className="plato-input" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value as Subject }))}>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Curriculum</label>
                    <select className="plato-input" value={form.curriculum} onChange={(e) => setForm(f => ({ ...f, curriculum: e.target.value as Curriculum }))}>
                      {CURRICULA.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Grade *</label>
                    <input className={fieldInputClass(errors.grade)} placeholder="e.g. Grade 10" value={form.grade} onChange={(e) => setForm(f => ({ ...f, grade: e.target.value }))} />
                    <FieldError message={errors.grade} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Max Capacity</label>
                    <input className={fieldInputClass(errors.maxCapacity)} type="number" min={1} max={50} value={form.maxCapacity} onChange={(e) => setForm(f => ({ ...f, maxCapacity: Number(e.target.value) }))} />
                    <FieldError message={errors.maxCapacity} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Room</label>
                    <input className="plato-input" placeholder="e.g. Room 101" value={form.room} onChange={(e) => setForm(f => ({ ...f, room: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Start Date</label>
                    <input className="plato-input" type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Teacher *</label>
                    <select className={fieldInputClass(errors.teacherId)} value={form.teacherId} onChange={(e) => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                      <option value="">Select teacher…</option>
                      {branchTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <FieldError message={errors.teacherId} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Schedule</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select className="plato-input" value={form.day1} onChange={(e) => setForm(f => ({ ...f, day1: e.target.value as typeof form.day1 }))}>
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <option key={d}>{d}</option>)}
                      </select>
                      <input className="plato-input" type="time" value={form.start1} onChange={(e) => setForm(f => ({ ...f, start1: e.target.value }))} />
                      <input className="plato-input" type="time" value={form.end1} onChange={(e) => setForm(f => ({ ...f, end1: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="flex gap-3 px-5 py-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button className="btn-ghost flex-1 justify-center" onClick={() => { setShowModal(false); setErrors({}) }}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleCreate}>
                  <Plus size={14} /> Create Batch
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

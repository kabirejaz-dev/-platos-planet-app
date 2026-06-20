import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, formatTime, generateId } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Calendar, Clock, Users, Plus, CheckCircle2 } from 'lucide-react'

const meetingTypeLabel: Record<string, string> = {
  parent_teacher: 'Parent-Teacher',
  academic_review: 'Academic Review',
  counselling: 'Counselling',
}

export default function MeetingsPage() {
  const { currentUser, parents, students, teachers, meetings, addMeeting } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ teacherId: '', date: '', time: '10:00', type: 'parent_teacher' as 'parent_teacher' | 'academic_review' | 'counselling', notes: '' })

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const student = students.find((s) => s.id === parent?.studentIds?.[0])

  const myMeetings = meetings
    .filter((m) => m.parentId === parent?.id)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const today = new Date().toISOString().split('T')[0]
  const upcoming = myMeetings.filter((m) => m.scheduledAt >= today && m.status !== 'cancelled')
  const past = myMeetings.filter((m) => m.scheduledAt < today || m.status === 'cancelled')

  const handleBook = () => {
    if (!form.teacherId || !form.date || !parent) return
    addMeeting({
      id: `mt-${generateId()}`,
      requestedBy: currentUser?.id || '',
      branchId: student?.branchId || '',
      teacherId: form.teacherId,
      parentId: parent.id,
      studentId: student?.id || '',
      scheduledAt: `${form.date}T${form.time}:00`,
      duration: 30,
      type: form.type,
      status: 'confirmed',
      notes: form.notes,
      agenda: form.notes,
    })
    toast.success('Meeting booked', `${formatDate(form.date)} at ${form.time}`)
    setShowForm(false)
    setForm({ teacherId: '', date: '', time: '10:00', type: 'parent_teacher', notes: '' })
  }

  const statusConfig = {
    confirmed: { color: '#00FFA3', label: 'Confirmed' },
    pending: { color: '#FBBF24', label: 'Pending' },
    cancelled: { color: '#FF6B7A', label: 'Cancelled' },
    completed: { color: '#4D7CFF', label: 'Completed' },
  }

  const MeetingCard = ({ meeting }: { meeting: typeof myMeetings[0] }) => {
    const teacher = teachers.find((t) => t.id === meeting.teacherId)
    const cfg = statusConfig[meeting.status as keyof typeof statusConfig] || statusConfig.pending
    const dt = new Date(meeting.scheduledAt)
    const uaeOpts = { timeZone: 'Asia/Dubai' } as const

    return (
      <div className="plato-card p-4 flex items-start gap-4">
        <div className="w-12 flex-shrink-0 text-center">
          <p className="text-[11px] text-white/30 uppercase">{dt.toLocaleDateString('en', { ...uaeOpts, month: 'short' })}</p>
          <p className="text-[22px] font-bold font-display text-white/80">{dt.toLocaleDateString('en', { ...uaeOpts, day: 'numeric' })}</p>
          <p className="text-[10px] text-white/25">{dt.toLocaleDateString('en', { ...uaeOpts, weekday: 'short' })}</p>
        </div>
        <div className="flex-1 min-w-0">
          {teacher && (
            <div className="flex items-center gap-2 mb-2">
              <Avatar name={teacher.name} size="xs" />
              <div>
                <p className="text-[13px] font-semibold text-white/85">{teacher.name}</p>
                <p className="text-[11px] text-white/35">{teacher.subjects.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 text-[11px] text-white/35">
            <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(meeting.scheduledAt)} · {meeting.duration} min</span>
            <span className="flex items-center gap-1"><Users size={10} /> {meetingTypeLabel[meeting.type] || meeting.type}</span>
          </div>
          {meeting.agenda && <p className="text-[11px] text-white/30 mt-1 truncate">{meeting.agenda}</p>}
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Meetings"
        subtitle={`${upcoming.length} upcoming`}
        actions={
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={15} /> Book Meeting
          </button>
        }
      />

      {/* Booking form */}
      {showForm && (
        <div className="plato-card p-5 space-y-4">
          <h3 className="text-[14px] font-bold text-white/90">Book a Teacher Meeting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Teacher</label>
              <select className="plato-input" value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}>
                <option value="">Select teacher…</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.subjects.join(', ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Date</label>
              <input type="date" className="plato-input" value={form.date} min={today} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Time</label>
              <input type="time" className="plato-input" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Type</label>
              <select className="plato-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}>
                <option value="parent_teacher">Parent-Teacher</option>
                <option value="academic_review">Academic Review</option>
                <option value="counselling">Counselling</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Agenda / Notes</label>
              <input className="plato-input" placeholder="What would you like to discuss?" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-ghost flex-1 justify-center" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleBook} disabled={!form.teacherId || !form.date}>
              <CheckCircle2 size={14} /> Confirm Booking
            </button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Upcoming</h3>
          <div className="space-y-3">{upcoming.map((m) => <MeetingCard key={m.id} meeting={m} />)}</div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Past</h3>
          <div className="space-y-3 opacity-60">{past.map((m) => <MeetingCard key={m.id} meeting={m} />)}</div>
        </div>
      )}

      {myMeetings.length === 0 && !showForm && (
        <div className="text-center py-16 text-white/30">
          <Calendar size={32} className="mx-auto mb-3 opacity-30" />
          <p>No meetings yet. Book one with a teacher above.</p>
        </div>
      )}
    </div>
  )
}

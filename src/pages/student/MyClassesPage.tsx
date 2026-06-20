import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { calculateAttendanceRate } from '@/lib/utils'
import { BookOpen, Clock, Users, MapPin, Calendar } from 'lucide-react'

const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#4D7CFF', Chemistry: '#7B61FF', Biology: '#00FFA3',
  Mathematics: '#FF6B7A', English: '#FBBF24', 'Business Studies': '#00F0FF',
  Accounting: '#C6FF00', 'Computer Science': '#FF9500', Economics: '#A78BFA',
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MyClassesPage() {
  const { currentUser, students, batches, teachers, attendance } = useAppStore()

  const student = students.find((s) => s.userId === currentUser?.id)
  if (!student) return <div className="text-white/30 p-6">Student profile not found.</div>

  const myBatches = batches.filter((b) => student.batchIds.includes(b.id))

  const getAttendanceRate = (batchId: string) => {
    const records = attendance.filter((a) => a.studentId === student.id && a.batchId === batchId)
    const present = records.filter((a) => a.status === 'present').length
    return calculateAttendanceRate(present, records.length)
  }

  // Next class for each batch
  const today = new Date()
  const todayDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()]
  const getNextClass = (batch: typeof myBatches[0]) => {
    if (!batch.schedule.length) return null
    const sorted = [...batch.schedule].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    const todayIdx = DAY_ORDER.indexOf(todayDay)
    const next = sorted.find((s) => DAY_ORDER.indexOf(s.day) >= todayIdx) || sorted[0]
    return next
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Classes"
        subtitle={`${myBatches.length} enrolled batches`}
        badge={<DemoBadge />}
      />

      {myBatches.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p>You're not enrolled in any batches yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myBatches.map((batch) => {
            const teacher = teachers.find((t) => t.id === batch.teacherId)
            const attRate = getAttendanceRate(batch.id)
            const color = SUBJECT_COLORS[batch.subject] || '#4D7CFF'
            const nextClass = getNextClass(batch)
            const rateColor = attRate >= 85 ? '#00FFA3' : attRate >= 70 ? '#FBBF24' : '#FF6B7A'

            return (
              <div key={batch.id} className="plato-card overflow-hidden">
                {/* Color header band */}
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />

                <div className="p-5 space-y-4">
                  {/* Title */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                      <BookOpen size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-white/90 leading-snug">{batch.name}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">{batch.curriculum} · {batch.grade}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0" style={{ background: `${color}15`, color }}>{batch.subject}</span>
                  </div>

                  {/* Teacher */}
                  {teacher && (
                    <div className="flex items-center gap-2">
                      <Avatar name={teacher.name} size="xs" />
                      <span className="text-[12px] text-white/50">{teacher.name}</span>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="space-y-1">
                    {batch.schedule.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px] text-white/40">
                        <Clock size={11} />
                        <span>{s.day} · {s.startTime}–{s.endTime}</span>
                      </div>
                    ))}
                    {batch.room && (
                      <div className="flex items-center gap-2 text-[12px] text-white/30">
                        <MapPin size={11} /> {batch.room}
                      </div>
                    )}
                  </div>

                  {/* Next class badge */}
                  {nextClass && (
                    <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                      <Calendar size={11} style={{ color }} />
                      <span className="text-[11px]" style={{ color }}>Next: {nextClass.day} at {nextClass.startTime}</span>
                    </div>
                  )}

                  {/* Attendance */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-white/30">My Attendance</span>
                      <span className="font-semibold" style={{ color: rateColor }}>{attRate > 0 ? `${attRate}%` : '—'}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${attRate}%`, background: rateColor }} />
                    </div>
                  </div>

                  {/* Class size */}
                  <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                    <Users size={11} /> {batch.studentIds.length} / {batch.maxCapacity} students
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SUBJECT_COLORS: Record<string, string> = {
  Physics: '#4D7CFF', Chemistry: '#7B61FF', Biology: '#00FFA3',
  Mathematics: '#FF6B7A', English: '#FBBF24', 'Business Studies': '#00F0FF',
  Accounting: '#C6FF00', 'Computer Science': '#FF9500', Economics: '#A78BFA',
}

export default function TimetablePage() {
  const { currentUser, batches, teachers } = useAppStore()

  const branchBatches = batches.filter((b) =>
    (currentUser?.branchId ? b.branchId === currentUser.branchId : true) && b.status === 'active'
  )

  const todayDay = DAYS[new Date().getDay() - 1] || 'Mon'

  const getClassesForDay = (day: string) =>
    branchBatches
      .filter((b) => b.schedule.some((s) => s.day === day))
      .map((b) => ({ batch: b, slot: b.schedule.find((s) => s.day === day)! }))
      .sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime))

  return (
    <div className="space-y-5">
      <PageHeader title="Timetable" subtitle="Weekly class schedule" />

      {/* Mobile: day-by-day list */}
      <div className="block lg:hidden space-y-4">
        {DAYS.map((day) => {
          const classes = getClassesForDay(day)
          return (
            <div key={day}>
              <h3 className="text-[12px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: day === todayDay ? '#4D7CFF' : 'rgba(255,255,255,0.35)' }}>
                {day} {day === todayDay && <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#4D7CFF]/15 text-[#4D7CFF]">Today</span>}
              </h3>
              {classes.length === 0 ? (
                <p className="text-[12px] text-white/20 pl-2">No classes</p>
              ) : (
                <div className="space-y-2">
                  {classes.map(({ batch, slot }) => {
                    const teacher = teachers.find((t) => t.id === batch.teacherId)
                    const color = SUBJECT_COLORS[batch.subject] || '#4D7CFF'
                    return (
                      <div key={batch.id} className="plato-card p-3 flex items-center gap-3" style={{ borderLeft: `3px solid ${color}` }}>
                        <div className="text-center w-16 flex-shrink-0">
                          <p className="text-[11px] text-white/60 font-semibold">{slot.startTime}</p>
                          <p className="text-[10px] text-white/30">–{slot.endTime}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white/85 truncate">{batch.name}</p>
                          {teacher && <p className="text-[11px] text-white/40">{teacher.name}</p>}
                          {batch.room && <p className="text-[10px] text-white/30">{batch.room}</p>}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0" style={{ background: `${color}15`, color }}>{batch.subject}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-6 gap-3">
          {DAYS.map((day) => {
            const classes = getClassesForDay(day)
            const isToday = day === todayDay
            return (
              <div key={day}>
                <div className="mb-2 text-center">
                  <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: isToday ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>{day}</span>
                  {isToday && <div className="w-1 h-1 rounded-full bg-[#4D7CFF] mx-auto mt-1" />}
                </div>
                <div className="space-y-2">
                  {classes.length === 0 ? (
                    <div className="h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] text-white/15">Free</p>
                    </div>
                  ) : (
                    classes.map(({ batch, slot }) => {
                      const teacher = teachers.find((t) => t.id === batch.teacherId)
                      const color = SUBJECT_COLORS[batch.subject] || '#4D7CFF'
                      return (
                        <div key={batch.id} className="rounded-xl p-3 space-y-1" style={{ background: `${color}0C`, border: `1px solid ${color}25` }}>
                          <p className="text-[10px] font-bold" style={{ color }}>{slot.startTime}–{slot.endTime}</p>
                          <p className="text-[11px] font-semibold text-white/80 leading-tight">{batch.name}</p>
                          {teacher && <p className="text-[10px] text-white/35 truncate">{teacher.name}</p>}
                          {batch.room && <p className="text-[10px] text-white/25">{batch.room}</p>}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

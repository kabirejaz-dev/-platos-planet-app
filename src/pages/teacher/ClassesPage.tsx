import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { BookOpen, Clock, ChevronRight, X, Star } from 'lucide-react'

export default function ClassesPage() {
  const { currentUser, teachers, batches, students, attendance } = useAppStore()
  const [selected, setSelected] = useState<string | null>(null)

  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  if (!teacher) return <div className="text-white/30 p-6">Teacher profile not found.</div>

  const myBatches = batches.filter((b) => b.teacherId === teacher.id)

  const getStudents = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId)
    if (!batch) return []
    return students.filter((s) => batch.studentIds.includes(s.id))
  }

  const getAttendanceRate = (studentId: string, batchId: string) => {
    const records = attendance.filter((a) => a.studentId === studentId && a.batchId === batchId)
    if (!records.length) return null
    const present = records.filter((a) => a.status === 'present' || a.status === 'late').length
    return Math.round((present / records.length) * 100)
  }

  const selectedBatch = selected ? batches.find((b) => b.id === selected) : null
  const batchStudents = selected ? getStudents(selected) : []

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Classes"
        subtitle={`${myBatches.length} active batches`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {myBatches.map((batch) => {
          const bStudents = getStudents(batch.id)
          const fillPct = Math.round((bStudents.length / batch.maxCapacity) * 100)

          return (
            <button
              key={batch.id}
              onClick={() => setSelected(batch.id)}
              className="plato-card p-5 text-left hover:scale-[1.01] transition-transform space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] font-bold text-white/90 font-display">{batch.name}</p>
                  <p className="text-[12px] text-white/40 mt-0.5">{batch.curriculum} · {batch.grade}</p>
                </div>
                <div className="flex items-center gap-1.5 text-white/30">
                  <span className="text-[12px]">View roster</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 rounded-xl" style={{ background: 'rgba(77,124,255,0.08)' }}>
                  <p className="text-[18px] font-bold text-[#4D7CFF]">{bStudents.length}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide">Students</p>
                </div>
                <div className="text-center p-2.5 rounded-xl" style={{ background: 'rgba(0,255,163,0.08)' }}>
                  <p className="text-[18px] font-bold text-[#00FFA3]">{fillPct}%</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide">Full</p>
                </div>
                <div className="text-center p-2.5 rounded-xl" style={{ background: 'rgba(123,97,255,0.08)' }}>
                  <p className="text-[18px] font-bold text-[#7B61FF]">{batch.schedule.length}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide">Sessions/wk</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {batch.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-white/50">
                    <Clock size={12} className="text-white/25" />
                    <span>{s.day} · {s.startTime} – {s.endTime}</span>
                    {batch.room && <span className="text-white/25">· {batch.room}</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {bStudents.slice(0, 6).map((s) => (
                  <Avatar key={s.id} name={s.name} size="xs" />
                ))}
                {bStudents.length > 6 && (
                  <span className="text-[10px] text-white/30 ml-1">+{bStudents.length - 6}</span>
                )}
              </div>
            </button>
          )
        })}

        {myBatches.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/30">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p>No batches assigned to you yet.</p>
          </div>
        )}
      </div>

      {/* Batch detail drawer */}
      {selectedBatch && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div
            className="fixed inset-y-4 right-4 z-50 w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="p-5 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-white font-display">{selectedBatch.name}</h3>
                  <p className="text-[12px] text-white/40 mt-0.5">{selectedBatch.curriculum} · {selectedBatch.grade} · {selectedBatch.subject}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white/70 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Schedule info */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <h4 className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3">Schedule</h4>
                {selectedBatch.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px]">
                    <span className="text-white/60 font-medium">{s.day}</span>
                    <span className="text-white/40">{s.startTime} – {s.endTime}</span>
                    {selectedBatch.room && <span className="text-white/30">· {selectedBatch.room}</span>}
                  </div>
                ))}
              </div>

              {/* Student roster */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold text-white/30 uppercase tracking-wider">
                    Student Roster ({batchStudents.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {batchStudents.map((student) => {
                    const attRate = getAttendanceRate(student.id, selectedBatch.id)
                    return (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <Avatar name={student.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white/80">{student.name}</p>
                          <p className="text-[11px] text-white/30">{student.grade}</p>
                        </div>
                        <div className="text-right">
                          {attRate !== null ? (
                            <p
                              className="text-[13px] font-bold"
                              style={{ color: attRate >= 80 ? '#00FFA3' : attRate >= 60 ? '#FBBF24' : '#FF6B7A' }}
                            >
                              {attRate}%
                            </p>
                          ) : (
                            <p className="text-[12px] text-white/25">No data</p>
                          )}
                          <p className="text-[10px] text-white/25">attend.</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-yellow-400" />
                          <span className="text-[11px] text-white/40">{student.xp.toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}

                  {batchStudents.length === 0 && (
                    <p className="text-center text-[13px] text-white/30 py-4">No students enrolled yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

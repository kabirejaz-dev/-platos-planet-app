import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate, gradeFromPercentage, getGradeColor, daysUntil } from '@/lib/utils'
import { Calendar, Clock, Award, AlertCircle } from 'lucide-react'

export default function ExamsPage() {
  const { currentUser, students, parents, assessments } = useAppStore()

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const student = students.find((s) => s.id === parent?.studentIds?.[0])
  if (!student) return <div className="text-white/30 p-6">No linked student found.</div>

  const myBatchIds = student.batchIds
  const myAssessments = assessments.filter((a) => myBatchIds.includes(a.batchId))

  const today = new Date().toISOString().split('T')[0]
  const upcoming = myAssessments.filter((a) => a.date >= today && a.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const past = myAssessments.filter((a) => a.date < today || a.status === 'graded')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const urgentColor = (days: number) => days <= 3 ? '#FF6B7A' : days <= 7 ? '#FBBF24' : '#4D7CFF'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Exams & Results"
        subtitle={`${upcoming.length} upcoming · ${past.length} completed`}
      />

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calendar size={13} /> Upcoming Exams
          </h3>
          <div className="space-y-3">
            {upcoming.map((a) => {
              const days = daysUntil(a.date)
              const color = urgentColor(days)
              return (
                <div key={a.id} className="plato-card p-4 flex items-center gap-4" style={{ borderLeft: `3px solid ${color}` }}>
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-[20px] font-bold font-display" style={{ color }}>{days}</p>
                    <p className="text-[10px] text-white/30">{days === 1 ? 'day' : 'days'}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white/90">{a.title}</p>
                    <p className="text-[12px] text-white/40">{a.subject} · {a.type}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(a.date)}</span>
                      {a.duration && <span className="flex items-center gap-1"><Clock size={10} /> {a.duration} min</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: `${color}10`, color }}>{a.maxMarks} marks</span>
                    {days <= 3 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#FF6B7A]">
                        <AlertCircle size={10} /> Soon!
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="plato-card p-6 text-center">
          <Calendar size={28} className="mx-auto mb-2 text-[#00FFA3] opacity-60" />
          <p className="text-[13px] text-white/50">No upcoming exams scheduled.</p>
        </div>
      )}

      {/* Past results */}
      {past.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Award size={13} /> Past Results
          </h3>
          <div className="plato-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full plato-table">
              <thead>
                <tr>
                  <th>Exam</th><th>Subject</th><th>Date</th><th>Marks</th><th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {past.map((a) => {
                  const sub = a.results.find((s) => s.studentId === student.id)
                  const pct = sub ? Math.round((sub.marks / a.maxMarks) * 100) : null
                  const grade = pct !== null ? gradeFromPercentage(pct) : null

                  return (
                    <tr key={a.id}>
                      <td>
                        <p className="font-medium text-white/85 text-[13px]">{a.title}</p>
                        <p className="text-[11px] text-white/30">{a.type}</p>
                      </td>
                      <td className="text-[12px] text-white/60">{a.subject}</td>
                      <td className="text-[12px] text-white/40">{formatDate(a.date)}</td>
                      <td>
                        {sub
                          ? <span className="text-[13px] font-semibold text-white/80">{sub.marks}/{a.maxMarks}</span>
                          : <span className="text-[12px] text-white/25">—</span>
                        }
                      </td>
                      <td>
                        {grade
                          ? <span className={`text-[13px] font-bold ${getGradeColor(grade)}`}>{grade} <span className="text-[11px] text-white/30">({pct}%)</span></span>
                          : <span className="text-[12px] text-white/25">Pending</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

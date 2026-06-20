import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate, gradeFromPercentage, getGradeColor } from '@/lib/utils'
import { Sparkline } from '@/components/ui/Sparkline'
import { TrendingUp, BookOpen, Award, Target } from 'lucide-react'

export default function ProgressPage() {
  const { currentUser, students, parents, assessments, homework } = useAppStore()

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const student = students.find((s) => s.id === parent?.studentIds?.[0])
  if (!student) return <div className="text-white/30 p-6">No linked student found.</div>

  const myBatchIds = student.batchIds
  const myAssessments = assessments.filter((a) => myBatchIds.includes(a.batchId))
  const myHomework = homework.filter((h) => myBatchIds.includes(h.batchId))

  const gradedAssessments = myAssessments.filter((a) => a.results.some((s) => s.studentId === student.id))

  // Subject averages from assessments
  const subjectMap: Record<string, { total: number; count: number }> = {}
  gradedAssessments.forEach((a) => {
    const sub = a.results.find((s) => s.studentId === student.id)
    if (!sub) return
    const pct = Math.round((sub.marks / a.maxMarks) * 100)
    if (!subjectMap[a.subject]) subjectMap[a.subject] = { total: 0, count: 0 }
    subjectMap[a.subject].total += pct
    subjectMap[a.subject].count++
  })

  const subjectAverages = Object.entries(subjectMap).map(([subject, { total, count }]) => ({
    subject,
    avg: Math.round(total / count),
    grade: gradeFromPercentage(Math.round(total / count)),
    trend: gradedAssessments
      .filter((a) => a.subject === subject)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-4)
      .map((a) => Math.round((a.results.find((r) => r.studentId === student.id)!.marks / a.maxMarks) * 100)),
  })).sort((a, b) => b.avg - a.avg)

  const overallAvg = subjectAverages.length > 0
    ? Math.round(subjectAverages.reduce((s, x) => s + x.avg, 0) / subjectAverages.length)
    : 0

  // Homework completion
  const myHWSubmissions = myHomework.filter((h) => h.submissions.some((s) => s.studentId === student.id))
  const hwRate = myHomework.length > 0 ? Math.round((myHWSubmissions.length / myHomework.length) * 100) : 0

  // Recent assessments timeline
  const recent = [...gradedAssessments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  const barColor = (avg: number) => avg >= 80 ? '#00FFA3' : avg >= 60 ? '#4D7CFF' : avg >= 40 ? '#FBBF24' : '#FF6B7A'

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${student.name}'s Progress`}
        subtitle={`${student.curriculum} · ${student.grade}`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overall Average', value: overallAvg > 0 ? `${overallAvg}%` : '—', color: barColor(overallAvg), icon: <TrendingUp size={16} /> },
          { label: 'Grade', value: overallAvg > 0 ? gradeFromPercentage(overallAvg) : '—', color: '#7B61FF', icon: <Award size={16} /> },
          { label: 'Subjects Tracked', value: subjectAverages.length, color: '#4D7CFF', icon: <BookOpen size={16} /> },
          { label: 'Homework Rate', value: `${hwRate}%`, color: hwRate >= 80 ? '#00FFA3' : '#FBBF24', icon: <Target size={16} /> },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
            <p className="text-[22px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subject performance bars */}
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Performance by Subject</h3>
          {subjectAverages.length === 0 ? (
            <p className="text-[13px] text-white/30 text-center py-8">No graded assessments yet.</p>
          ) : (
            <div className="space-y-3">
              {subjectAverages.map(({ subject, avg, grade, trend }) => (
                <div key={subject}>
                  <div className="flex justify-between items-center text-[12px] mb-1.5">
                    <span className="text-white/70 font-medium">{subject}</span>
                    <span className="flex items-center gap-2">
                      {trend.length >= 2 && <Sparkline values={trend} color={barColor(avg)} />}
                      <span className={`font-bold ${getGradeColor(grade)}`}>{grade}</span>
                      <span className="text-white/40">{avg}%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${avg}%`, background: barColor(avg) }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent results timeline */}
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Recent Results</h3>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-[13px] text-white/30 text-center py-8">No results yet.</p>
            ) : (
              recent.map((a) => {
                const sub = a.results.find((s) => s.studentId === student.id)
                if (!sub) return null
                const pct = Math.round((sub.marks / a.maxMarks) * 100)
                const grade = gradeFromPercentage(pct)
                return (
                  <div key={a.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] flex-shrink-0"
                      style={{ background: `${barColor(pct)}15`, color: barColor(pct) }}
                    >
                      {grade}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white/80 truncate">{a.title}</p>
                      <p className="text-[11px] text-white/35">{a.subject} · {formatDate(a.date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-bold" style={{ color: barColor(pct) }}>{sub.marks}/{a.maxMarks}</p>
                      <p className="text-[10px] text-white/30">{pct}%</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

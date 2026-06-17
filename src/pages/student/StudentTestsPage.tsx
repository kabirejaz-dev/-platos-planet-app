import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatDate, gradeFromPercentage, getGradeColor } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { PenTool, Calendar, CheckCircle2, Clock } from 'lucide-react'

export default function StudentTestsPage() {
  const { currentUser, students, assessments, batches } = useAppStore()

  const student = students.find((s) => s.userId === currentUser?.id)
  if (!student) return <div className="text-white/30 p-6">Student profile not found.</div>

  const myBatchIds = student.batchIds
  const myAssessments = assessments.filter((a) => myBatchIds.includes(a.batchId))

  const upcoming = myAssessments
    .filter((a) => a.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const completed = myAssessments
    .filter((a) => a.status === 'graded' || a.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getMyResult = (a: typeof assessments[0]) =>
    a.results.find((r) => r.studentId === student.id)

  const chartData = completed
    .filter((a) => getMyResult(a))
    .map((a) => ({
      name: a.title.slice(0, 10),
      score: getMyResult(a)!.percentage,
      grade: getMyResult(a)!.grade,
    }))
    .slice(-8)

  const avgScore = completed.length > 0
    ? Math.round(
        completed.reduce((sum, a) => {
          const r = getMyResult(a)
          return sum + (r?.percentage ?? 0)
        }, 0) / completed.length
      )
    : null

  const getBatchName = (batchId: string) =>
    batches.find((b) => b.id === batchId)?.name ?? 'Unknown'

  const TYPE_LABEL: Record<string, string> = {
    quiz: 'Quiz', test: 'Test', mock_exam: 'Mock Exam', assignment: 'Assignment',
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tests & Results"
        subtitle={`${upcoming.length} upcoming · ${completed.length} completed`}
        badge={<DemoBadge />}
      />

      {/* Summary stats */}
      {avgScore !== null && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Average Score', value: `${avgScore}%`, color: avgScore >= 80 ? '#00FFA3' : avgScore >= 60 ? '#FBBF24' : '#FF6B7A' },
            { label: 'Tests Taken', value: completed.length, color: '#4D7CFF' },
            { label: 'Upcoming', value: upcoming.length, color: '#7B61FF' },
          ].map((s) => (
            <div key={s.label} className="plato-card p-4 text-center">
              <p className="text-[26px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Performance chart */}
      {chartData.length > 0 && (
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-bold text-white/60 mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <ReferenceLine y={80} stroke="rgba(0,255,163,0.3)" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, 'Score']}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}
                fill="url(#barGradient)"
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4D7CFF" />
                  <stop offset="100%" stopColor="#7B61FF" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Upcoming tests */}
      {upcoming.length > 0 && (
        <div className="plato-card overflow-hidden">
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-[13px] font-bold text-white/70 flex items-center gap-2">
              <Clock size={14} className="text-[#4D7CFF]" /> Upcoming
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {upcoming.map((a) => {
              const daysLeft = Math.ceil((new Date(a.date).getTime() - Date.now()) / 86400000)
              return (
                <div key={a.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-semibold text-white/80">{a.title}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">{getBatchName(a.batchId)} · {a.subject}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: 'rgba(77,124,255,0.1)', color: '#4D7CFF' }}
                    >
                      {TYPE_LABEL[a.type]}
                    </span>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <Calendar size={11} className="text-white/30" />
                      <span className="text-[11px] text-white/40">{formatDate(a.date)}</span>
                    </div>
                    <p
                      className="text-[11px] font-bold mt-0.5"
                      style={{ color: daysLeft <= 3 ? '#FF6B7A' : daysLeft <= 7 ? '#FBBF24' : '#00FFA3' }}
                    >
                      {daysLeft <= 0 ? 'Today!' : `${daysLeft}d left`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past results */}
      <div className="plato-card overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[13px] font-bold text-white/70 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#00FFA3]" /> Results
          </h3>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {completed.map((a) => {
            const result = getMyResult(a)
            const grade = result ? gradeFromPercentage(result.percentage) : null
            const gradeCol = grade ? getGradeColor(grade) : 'rgba(100,116,139,0.5)'
            return (
              <div key={a.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold text-white/80">{a.title}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    {getBatchName(a.batchId)} · {formatDate(a.date)}
                  </p>
                  {result?.feedback && (
                    <p className="text-[11px] text-white/30 mt-1 italic">"{result.feedback}"</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {result ? (
                    <>
                      <p className="text-[22px] font-bold font-display" style={{ color: gradeCol }}>{grade}</p>
                      <p className="text-[11px] text-white/40">{result.marks}/{a.maxMarks} · {result.percentage}%</p>
                    </>
                  ) : (
                    <p className="text-[12px] text-white/25">No result</p>
                  )}
                </div>
              </div>
            )
          })}
          {completed.length === 0 && (
            <div className="text-center py-12 text-white/30">
              <PenTool size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-[13px]">No test results yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

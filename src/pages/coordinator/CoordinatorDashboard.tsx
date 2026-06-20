import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Avatar } from '@/components/ui/Avatar'
import { gradeFromPercentage, getGradeColor } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'
import { BookOpen, BarChart3, PenTool, ShieldCheck, ArrowRight, CalendarDays } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { InsightsStrip, type Insight } from '@/components/ui/InsightsStrip'

const SUBJECT_CODE: Record<string, string> = {
  Physics: 'Phy', Chemistry: 'Che', Biology: 'Bio', Mathematics: 'Mat', English: 'Eng',
  'Business Studies': 'Bus', Accounting: 'Acc', 'Computer Science': 'CS', Economics: 'Eco',
  History: 'His', Geography: 'Geo', Arabic: 'Ara', French: 'Fre',
}

export default function CoordinatorDashboard() {
  const { assessments, batches, students, teachers, homework, interventions: interventionRecords, teacherReviews, syllabusPlans } = useAppStore()

  const completedAssessments = assessments.filter((a) => a.status === 'graded')
  const upcomingAssessments = assessments.filter((a) => a.status === 'upcoming')

  const avgBySubject = batches.reduce<Record<string, { total: number; count: number }>>((acc, batch) => {
    const batchAss = completedAssessments.filter((a) => a.batchId === batch.id)
    batchAss.forEach((a) => {
      if (!acc[a.subject]) acc[a.subject] = { total: 0, count: 0 }
      const avg = a.results.reduce((s, r) => s + r.percentage, 0) / (a.results.length || 1)
      acc[a.subject].total += avg
      acc[a.subject].count += 1
    })
    return acc
  }, {})

  const subjectData = Object.entries(avgBySubject).map(([subject, { total, count }]) => ({
    subject: SUBJECT_CODE[subject] || subject.slice(0, 3),
    fullName: subject,
    avg: Math.round(total / count),
  })).sort((a, b) => b.avg - a.avg)

  const interventions = students.filter((s) => {
    const studentAss = completedAssessments.filter((a) => a.results.some((r) => r.studentId === s.id))
    if (studentAss.length === 0) return false
    const avg = studentAss.reduce((sum, a) => { const r = a.results.find((r) => r.studentId === s.id); return sum + (r?.percentage || 0) }, 0) / studentAss.length
    return avg < 65
  })

  const homeworkCompletionRate = homework.length > 0
    ? Math.round((homework.reduce((s, h) => s + h.submissions.length, 0) / (homework.reduce((s, h) => { const b = batches.find((b) => b.id === h.batchId); return s + (b?.studentIds.length || 0) }, 0) || 1)) * 100)
    : 0

  const staleInterventions = interventionRecords.filter((i) => {
    if (i.status === 'resolved') return false
    const daysSinceStart = Math.floor((Date.now() - new Date(i.startDate).getTime()) / 86400000)
    return daysSinceStart >= 5
  })

  const subjectAssessmentAvg = (a: typeof assessments[number]) => a.results.length > 0 ? a.results.reduce((s, r) => s + r.percentage, 0) / a.results.length : null
  const subjectDrops = Object.keys(avgBySubject).map((subject) => {
    const subjectGraded = completedAssessments.filter((a) => a.subject === subject).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    if (subjectGraded.length < 2) return null
    const latest = subjectAssessmentAvg(subjectGraded[subjectGraded.length - 1])
    const prev = subjectAssessmentAvg(subjectGraded[subjectGraded.length - 2])
    if (latest === null || prev === null) return null
    const drop = prev - latest
    return drop > 0 ? { subject, drop: Math.round(drop) } : null
  }).filter((x): x is { subject: string; drop: number } => x !== null)
  const biggestDrop = subjectDrops.sort((a, b) => b.drop - a.drop)[0] || null

  const reviewCountByTeacher = teachers.map((t) => ({ teacher: t, count: teacherReviews.filter((r) => r.teacherId === t.id).length }))
  const unreviewedTeacher = reviewCountByTeacher.find((r) => r.count === 0)

  // This-week-at-a-glance
  const weekAhead = new Date(); weekAhead.setDate(weekAhead.getDate() + 7)
  const assessmentsDueThisWeek = upcomingAssessments
    .filter((a) => new Date(a.date) <= weekAhead)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const openInterventions = interventionRecords.filter((i) => i.status !== 'resolved')
  const highPriorityInterventions = openInterventions.filter((i) => i.status === 'active')

  const pendingReviews = teacherReviews.filter((r) => r.status === 'draft')
  const oldestPendingReview = [...pendingReviews].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  const oldestReviewDaysOpen = oldestPendingReview ? Math.floor((Date.now() - new Date(oldestPendingReview.date).getTime()) / 86400000) : 0
  const oldestReviewTeacher = oldestPendingReview ? teachers.find((t) => t.id === oldestPendingReview.teacherId) : null

  const syllabusCoverage = syllabusPlans.length > 0
    ? Math.round(
        syllabusPlans.reduce((sum, p) => sum + (p.topics.filter((t) => t.status === 'completed').length / p.topics.length) * 100, 0) /
        syllabusPlans.length
      )
    : null

  const insights: Insight[] = []
  if (staleInterventions.length > 0) insights.push({ icon: '🔴', text: <><strong>{staleInterventions.length}</strong> open intervention{staleInterventions.length === 1 ? '' : 's'} have no activity for 5+ days</> })
  if (biggestDrop) insights.push({ icon: '📊', text: <><strong>{biggestDrop.subject}</strong> average score dropped {biggestDrop.drop}% vs the previous assessment</>, tone: 'purple' })
  if (unreviewedTeacher) insights.push({ icon: '👩‍🏫', text: <><strong>{unreviewedTeacher.teacher.name}</strong> has 0 observations this term</> })

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Excellence Centre" subtitle="Monitor curriculum, assessments, and student performance" />

      <InsightsStrip insights={insights} />

      {/* This week at a glance */}
      <div className="plato-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} className="text-[#4D7CFF]" />
          <h3 className="text-sm font-semibold text-foreground">This Week at a Glance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Assessments due</p>
            {assessmentsDueThisWeek.length > 0 ? (
              <p className="text-sm font-semibold text-foreground">
                {assessmentsDueThisWeek.length} <span className="text-muted-foreground font-normal">({assessmentsDueThisWeek.map((a) => formatDate(a.date)).join(', ')})</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">None this week</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Open interventions</p>
            <p className="text-sm font-semibold text-foreground">
              {openInterventions.length} {highPriorityInterventions.length > 0 && <span className="text-[#FF6B7A] font-normal">({highPriorityInterventions.length} high priority)</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pending reviews</p>
            {pendingReviews.length > 0 ? (
              <p className="text-sm font-semibold text-foreground">
                {pendingReviews.length} {oldestReviewTeacher && oldestReviewDaysOpen >= 5 && (
                  <span className="text-[#FBBF24] font-normal">({oldestReviewTeacher.name} — overdue)</span>
                )}
              </p>
            ) : (
              <p className="text-sm font-semibold text-[#00FFA3]">All caught up ✓</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Syllabus coverage</p>
            <p className="text-sm font-semibold text-foreground">{syllabusCoverage !== null ? `${syllabusCoverage}% avg across batches` : 'No plans yet'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assessments Graded" value={completedAssessments.length} icon={<PenTool size={18} />} color="#7B61FF" />
        <StatCard label="Upcoming" value={upcomingAssessments.length} icon={<BookOpen size={18} />} color="#4D7CFF" />
        <StatCard label="HW Completion" value={`${homeworkCompletionRate}%`} icon={<BarChart3 size={18} />} color="#00FFA3" />
        <StatCard label="Students at Risk" value={interventions.length} icon={<ShieldCheck size={18} />} color="#FF6B7A" />
      </div>

      {/* Subject performance */}
      {subjectData.length > 0 && (
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Average Score by Subject</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
              <XAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1E2940', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, 'Average']}
                labelFormatter={(label: string) => subjectData.find((d) => d.subject === label)?.fullName || label}
              />
              <Bar animationDuration={600} dataKey="avg" fill="#7B61FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent assessments */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Assessments</h3>
            <Link to="/coordinator/assessments" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {assessments.slice(0, 5).map((a) => {
              const avgScore = a.results.length > 0 ? Math.round(a.results.reduce((s, r) => s + r.percentage, 0) / a.results.length) : null
              const batch = batches.find((b) => b.id === a.batchId)
              return (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-dark-border/50 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subject} · {batch?.name}</p>
                  </div>
                  <div className="text-right">
                    {avgScore !== null ? (
                      <>
                        <p className={`text-sm font-bold ${getGradeColor(gradeFromPercentage(avgScore))}`}>{avgScore}%</p>
                        <p className="text-xs text-muted-foreground">avg</p>
                      </>
                    ) : (
                      <span className="badge-info">{a.status}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Students needing intervention */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#FF6B7A]" />
              Intervention Required
            </h3>
            <Link to="/coordinator/interventions" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">Manage <ArrowRight size={12} /></Link>
          </div>
          {interventions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🏆</p>
              <p className="text-sm text-[#00FFA3] font-medium">All students performing well!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interventions.map((student) => {
                const studentAss = completedAssessments.filter((a) => a.results.some((r) => r.studentId === student.id))
                const avg = studentAss.reduce((s, a) => { const r = a.results.find((r) => r.studentId === student.id); return s + (r?.percentage || 0) }, 0) / (studentAss.length || 1)
                return (
                  <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#FF6B7A]/5 border border-[#FF6B7A]/20">
                    <Avatar name={student.name} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.curriculum} · {student.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#FF6B7A]">{Math.round(avg)}%</p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Teacher performance */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Teacher Overview</h3>
          <Link to="/coordinator/reviews" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">Reviews <ArrowRight size={12} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            <thead><tr><th>Teacher</th><th>Subjects</th><th>Batches</th><th>Rating</th><th>Assessments</th></tr></thead>
            <tbody>
              {teachers.map((t) => {
                const tBatches = batches.filter((b) => b.teacherId === t.id && b.status === 'active')
                const tAssessments = assessments.filter((a) => a.teacherId === t.id)
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={t.name} size="xs" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.qualification}</p>
                        </div>
                      </div>
                    </td>
                    <td><div className="flex flex-wrap gap-1">{t.subjects.slice(0, 2).map((s) => <span key={s} className="badge-info text-xs">{s}</span>)}</div></td>
                    <td className="font-semibold text-foreground">{tBatches.length}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="text-[#C6FF00]">★</span>
                        <span className="text-sm font-semibold text-foreground">{t.rating}</span>
                      </div>
                    </td>
                    <td className="text-sm text-foreground">{tAssessments.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

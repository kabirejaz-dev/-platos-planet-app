import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const PLANET_EMOJI: Record<string, string> = {
  Mercury: '☿', Venus: '♀', Earth: '🌍', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Neptune: '♆', Pluto: '⚡',
}

export default function StudentProgressPage() {
  const { currentUser, teachers, batches, students, attendance, homework, assessments } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  if (!teacher) return <div className="text-white/30 p-6">Teacher profile not found.</div>

  const myBatches = batches.filter((b) => b.teacherId === teacher.id)
  const myStudentIds = [...new Set(myBatches.flatMap((b) => b.studentIds))]
  const myStudents = students.filter((s) => myStudentIds.includes(s.id))

  const getAttendanceRate = (studentId: string) => {
    const records = attendance.filter((a) => a.studentId === studentId && myBatches.some((b) => b.id === a.batchId))
    if (!records.length) return 0
    return Math.round((records.filter((a) => a.status === 'present').length / records.length) * 100)
  }

  const getAvgScore = (studentId: string) => {
    const results = assessments
      .filter((a) => a.teacherId === teacher.id)
      .flatMap((a) => a.results.filter((r) => r.studentId === studentId))
    if (!results.length) return null
    return Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
  }

  const getHwCompletion = (studentId: string) => {
    const myHw = homework.filter((h) => h.teacherId === teacher.id)
    const total = myHw.length
    if (!total) return null
    const submitted = myHw.filter((h) =>
      h.submissions.some((s) => s.studentId === studentId && (s.status === 'submitted' || s.status === 'graded'))
    ).length
    return Math.round((submitted / total) * 100)
  }

  const getAssessmentChartData = (studentId: string) =>
    assessments
      .filter((a) => a.teacherId === teacher.id && a.status === 'graded')
      .map((a) => {
        const result = a.results.find((r) => r.studentId === studentId)
        return { name: a.title.slice(0, 12), score: result?.percentage ?? 0 }
      })
      .slice(-6)

  const selected = myStudents.find((s) => s.id === selectedId) || myStudents[0]

  const attRate = selected ? getAttendanceRate(selected.id) : 0
  const avgScore = selected ? getAvgScore(selected.id) : null
  const hwCompletion = selected ? getHwCompletion(selected.id) : null
  const chartData = selected ? getAssessmentChartData(selected.id) : []

  const indicator = (val: number | null, good = 80, warn = 60) => {
    if (val === null) return <Minus size={14} className="text-white/30" />
    if (val >= good) return <TrendingUp size={14} className="text-[#00FFA3]" />
    if (val >= warn) return <TrendingUp size={14} className="text-yellow-400" />
    return <TrendingDown size={14} className="text-[#FF6B7A]" />
  }

  const scoreColor = (val: number | null) => {
    if (val === null) return 'rgba(100,116,139,0.5)'
    if (val >= 80) return '#00FFA3'
    if (val >= 60) return '#FBBF24'
    return '#FF6B7A'
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Student Progress" subtitle="Track each student's academic journey" badge={<DemoBadge />} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Student list */}
        <div className="plato-card overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-[13px] font-bold text-white/70">My Students ({myStudents.length})</h3>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {myStudents.map((student) => {
              const att = getAttendanceRate(student.id)
              const score = getAvgScore(student.id)
              const isActive = (selectedId ?? myStudents[0]?.id) === student.id
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedId(student.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isActive ? 'rgba(77,124,255,0.08)' : 'transparent',
                  }}
                >
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white/80 truncate">{student.name}</p>
                    <p className="text-[11px] text-white/30">{student.curriculum} · {student.grade}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-bold" style={{ color: scoreColor(score) }}>
                      {score !== null ? `${score}%` : '—'}
                    </p>
                    <p className="text-[10px] text-white/25">{att}% att.</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        {selected && (
          <div className="xl:col-span-2 space-y-4">
            {/* Header card */}
            <div className="plato-card p-5">
              <div className="flex items-center gap-4">
                <Avatar name={selected.name} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-white font-display">{selected.name}</h3>
                    <span className="text-lg">{PLANET_EMOJI[selected.planet]}</span>
                  </div>
                  <p className="text-[12px] text-white/40">{selected.curriculum} · {selected.grade} · {selected.planet} Level</p>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-bold text-[#4D7CFF] font-display">{selected.xp.toLocaleString()}</p>
                  <p className="text-[11px] text-white/30">XP earned</p>
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Attendance', value: attRate !== null ? `${attRate}%` : '—', color: scoreColor(attRate), trend: indicator(attRate) },
                { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', color: scoreColor(avgScore), trend: indicator(avgScore) },
                { label: 'HW Done', value: hwCompletion !== null ? `${hwCompletion}%` : '—', color: scoreColor(hwCompletion), trend: indicator(hwCompletion, 70, 50) },
              ].map((kpi) => (
                <div key={kpi.label} className="plato-card p-4 text-center">
                  <div className="flex justify-center mb-2">{kpi.trend}</div>
                  <p className="text-[24px] font-bold font-display" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Assessment history chart */}
            {chartData.length > 0 && (
              <div className="plato-card p-5">
                <h4 className="text-[13px] font-bold text-white/60 mb-4">Assessment History</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'rgba(100,116,139,0.7)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`${v}%`, 'Score']}
                    />
                    <Bar dataKey="score" fill="#4D7CFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Streak & planet */}
            <div className="grid grid-cols-2 gap-3">
              <div className="plato-card p-4">
                <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Study Streak</p>
                <p className="text-[28px] font-bold text-[#00FFA3] font-display">{selected.streak}</p>
                <p className="text-[12px] text-white/40">consecutive days</p>
              </div>
              <div className="plato-card p-4">
                <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Planet Level</p>
                <p className="text-[28px] font-bold font-display" style={{ color: '#7B61FF' }}>
                  {PLANET_EMOJI[selected.planet]} {selected.planet}
                </p>
                <p className="text-[12px] text-white/40">{selected.xp.toLocaleString()} XP total</p>
              </div>
            </div>
          </div>
        )}

        {myStudents.length === 0 && (
          <div className="xl:col-span-2 text-center py-16 text-white/30">
            <p>No students in your batches yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

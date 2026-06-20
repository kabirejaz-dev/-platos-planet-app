import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Avatar } from '@/components/ui/Avatar'
import { gradeFromPercentage, getGradeColor } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BookOpen, Award, Star, Layers, Sparkles } from 'lucide-react'

export default function AcademicAnalyticsPage() {
  const { assessments, teachers, branches, programmes, students } = useAppStore()

  const graded = assessments.filter((a) => a.status === 'graded' && a.results.length > 0)
  const allResults = graded.flatMap((a) => a.results)
  const avgScore = allResults.length > 0 ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / allResults.length) : 0

  const curriculumMap: Record<string, { total: number; count: number }> = {}
  graded.forEach((a) => {
    a.results.forEach((r) => {
      if (!curriculumMap[a.curriculum]) curriculumMap[a.curriculum] = { total: 0, count: 0 }
      curriculumMap[a.curriculum].total += r.percentage
      curriculumMap[a.curriculum].count++
    })
  })
  const curriculumData = Object.entries(curriculumMap).map(([curriculum, { total, count }]) => ({
    curriculum, avg: Math.round(total / count),
  }))

  const branchMap: Record<string, { total: number; count: number }> = {}
  graded.forEach((a) => {
    const teacher = teachers.find((t) => t.id === a.teacherId)
    if (!teacher) return
    a.results.forEach((r) => {
      if (!branchMap[teacher.branchId]) branchMap[teacher.branchId] = { total: 0, count: 0 }
      branchMap[teacher.branchId].total += r.percentage
      branchMap[teacher.branchId].count++
    })
  })
  const branchData = branches.map((b) => ({
    branch: b.name,
    avg: branchMap[b.id] ? Math.round(branchMap[b.id].total / branchMap[b.id].count) : 0,
  }))

  const topTeachers = [...teachers].sort((a, b) => b.rating - a.rating).slice(0, 6)
  const avgRating = teachers.length > 0 ? (teachers.reduce((s, t) => s + t.rating, 0) / teachers.length).toFixed(1) : '0'

  const curriculaTracked = new Set(students.filter((s) => s.status === 'active').map((s) => s.curriculum)).size

  const programmeColors: Record<string, string> = {
    Robotics: '#4D7CFF', Brainobrain: '#7B61FF', Oratory: '#00FFA3', IELTS: '#FBBF24',
    SAT: '#FF6B7A', 'NEET-JEE': '#00F0FF', Languages: '#C6FF00',
  }
  const programmeData = programmes.map((p) => ({
    id: p.id,
    name: p.name,
    value: p.studentIds.length,
    color: programmeColors[p.type] || '#64748B',
  }))

  return (
    <div className="space-y-5">
      <PageHeader title="Academic Analytics" subtitle="System-wide curriculum coverage, assessment results, and teacher performance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Score" value={`${avgScore}%`} icon={<Award size={18} />} color="#00FFA3" />
        <StatCard label="Graded Assessments" value={graded.length} icon={<BookOpen size={18} />} color="#4D7CFF" />
        <StatCard label="Avg Teacher Rating" value={avgRating} icon={<Star size={18} />} color="#FBBF24" />
        <StatCard label="Curricula Tracked" value={curriculaTracked} icon={<Layers size={18} />} color="#7B61FF" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Average Score by Curriculum</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={curriculumData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="curriculum" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar animationDuration={600} dataKey="avg" fill="#4D7CFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Average Score by Branch</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={branchData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="branch" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar animationDuration={600} dataKey="avg" fill="#00FFA3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Programme Enrollment</h3>
          <div className="flex justify-center">
            <PieChart width={160} height={160}>
              <Pie animationDuration={600} data={programmeData} cx={80} cy={80} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {programmeData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-1.5 mt-2">
            {programmeData.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <span className="text-[11px] text-white/40 truncate">{p.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-white/70 flex-shrink-0">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="plato-card p-5 lg:col-span-2">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={14} /> Programme Coverage — {programmes.length} programmes across Robotics, Brainobrain, Oratory, IELTS, SAT, NEET/IIT-JEE, Languages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {programmes.map((p) => {
            const branch = branches.find((b) => b.id === p.branchId)
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white/85 truncate">{p.name}</p>
                  <p className="text-[11px] text-white/35">{branch?.name} · {p.instructorName} · ages {p.ageGroup}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-[#00FFA3]">{p.studentIds.length}</p>
                  <p className="text-[10px] text-white/30">enrolled</p>
                </div>
              </div>
            )
          })}
        </div>
        </div>
      </div>

      <div className="plato-card p-5">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Top Rated Teachers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topTeachers.map((t) => {
            const grade = gradeFromPercentage(t.rating * 20)
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Avatar name={t.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white/85 truncate">{t.name}</p>
                  <p className="text-[11px] text-white/35">{t.subjects.join(', ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-[13px] font-bold ${getGradeColor(grade)}`}>★ {t.rating}</p>
                  <p className="text-[10px] text-white/30">{t.experience}y exp</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

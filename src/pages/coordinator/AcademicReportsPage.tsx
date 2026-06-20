import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, TrendingUp, Layers } from 'lucide-react'

export default function AcademicReportsPage() {
  const { assessments, batches, branches } = useAppStore()

  const graded = assessments.filter((a) => a.status === 'graded' && a.results.length > 0)

  const curriculumMap: Record<string, { total: number; count: number }> = {}
  graded.forEach((a) => a.results.forEach((r) => {
    if (!curriculumMap[a.curriculum]) curriculumMap[a.curriculum] = { total: 0, count: 0 }
    curriculumMap[a.curriculum].total += r.percentage
    curriculumMap[a.curriculum].count++
  }))
  const curriculumData = Object.entries(curriculumMap).map(([curriculum, { total, count }]) => ({ curriculum, avg: Math.round(total / count) }))

  const branchMap: Record<string, { total: number; count: number }> = {}
  graded.forEach((a) => {
    const batch = batches.find((b) => b.id === a.batchId)
    if (!batch) return
    a.results.forEach((r) => {
      if (!branchMap[batch.branchId]) branchMap[batch.branchId] = { total: 0, count: 0 }
      branchMap[batch.branchId].total += r.percentage
      branchMap[batch.branchId].count++
    })
  })
  const branchData = branches.map((b) => ({ branch: b.name, avg: branchMap[b.id] ? Math.round(branchMap[b.id].total / branchMap[b.id].count) : 0 }))

  const subjectMap: Record<string, { total: number; count: number }> = {}
  graded.forEach((a) => a.results.forEach((r) => {
    if (!subjectMap[a.subject]) subjectMap[a.subject] = { total: 0, count: 0 }
    subjectMap[a.subject].total += r.percentage
    subjectMap[a.subject].count++
  }))
  const subjectData = Object.entries(subjectMap).map(([subject, { total, count }]) => ({ subject, avg: Math.round(total / count) })).sort((a, b) => b.avg - a.avg)

  const allResults = graded.flatMap((a) => a.results)
  const overallAvg = allResults.length > 0 ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / allResults.length) : 0

  return (
    <div className="space-y-5">
      <PageHeader title="Academic Reports" subtitle="Termly and annual academic performance reports by curriculum and branch" badge={<DemoBadge />} />

      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <TrendingUp size={18} className="mx-auto mb-2 text-[#00FFA3]" />
          <p className="text-[20px] font-bold font-display text-[#00FFA3]">{overallAvg}%</p>
          <p className="text-[11px] text-white/30 mt-1">Overall Average</p>
        </div>
        <div className="plato-card p-4 text-center">
          <BookOpen size={18} className="mx-auto mb-2 text-[#4D7CFF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{graded.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Graded Assessments</p>
        </div>
        <div className="plato-card p-4 text-center">
          <Layers size={18} className="mx-auto mb-2 text-[#7B61FF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{Object.keys(subjectMap).length}</p>
          <p className="text-[11px] text-white/30 mt-1">Subjects Tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Average by Curriculum</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={curriculumData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="curriculum" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="avg" fill="#4D7CFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Average by Branch</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={branchData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="branch" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="avg" fill="#00FFA3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="plato-card p-5">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Average by Subject</h3>
        <div className="space-y-3">
          {subjectData.map(({ subject, avg }) => (
            <div key={subject}>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-white/70 font-medium">{subject}</span>
                <span className="text-white/40">{avg}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${avg}%`, background: avg >= 80 ? '#00FFA3' : avg >= 60 ? '#4D7CFF' : '#FBBF24' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

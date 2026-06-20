import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookOpen, AlertCircle, Grid3x3, Upload } from 'lucide-react'

const HEATMAP_SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Computer Science']
const HEATMAP_WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`)

export default function CurriculumPage() {
  const { batches, teachers, assessments, homework } = useAppStore()

  const activeBatches = batches.filter((b) => b.status === 'active')

  const batchStats = activeBatches.map((batch) => {
    const teacher = teachers.find((t) => t.id === batch.teacherId)
    const batchHW = homework.filter((h) => h.batchId === batch.id)
    const batchAssessments = assessments.filter((a) => a.batchId === batch.id)
    const completedHW = batchHW.filter((h) => h.status !== 'assigned').length
    const hwCoverage = batchHW.length > 0 ? Math.round((completedHW / batchHW.length) * 100) : 0
    const completedAssess = batchAssessments.filter((a) => a.status === 'graded').length
    const assessCoverage = batchAssessments.length > 0 ? Math.round((completedAssess / batchAssessments.length) * 100) : 0
    const overall = Math.round((hwCoverage + assessCoverage) / 2)
    return { batch, teacher, batchHW, batchAssessments, hwCoverage, assessCoverage, overall }
  })

  const overallAvg = batchStats.length > 0
    ? Math.round(batchStats.reduce((s, b) => s + b.overall, 0) / batchStats.length)
    : 0

  const statusColor = (pct: number) => pct >= 75 ? '#00FFA3' : pct >= 50 ? '#FBBF24' : '#FF6B7A'
  const statusLabel = (pct: number) => pct >= 75 ? 'On Track' : pct >= 50 ? 'Behind' : 'At Risk'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Curriculum Coverage"
        subtitle={`${activeBatches.length} active batches · ${overallAvg}% overall coverage`}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#4D7CFF]">{activeBatches.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Active Batches</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display" style={{ color: statusColor(overallAvg) }}>{overallAvg}%</p>
          <p className="text-[11px] text-white/30 mt-1">Avg Coverage</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#00FFA3]">{batchStats.filter((b) => b.overall >= 75).length}</p>
          <p className="text-[11px] text-white/30 mt-1">On Track</p>
        </div>
      </div>

      {/* Weekly coverage heat map */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Grid3x3 size={15} className="text-[#7B61FF]" /> Weekly Coverage Heat Map
          </h3>
        </div>
        {/* No week-by-week syllabus plan exists in the data model yet (only
            per-assessment topic tags) — show the grid skeleton plus the
            import prompt rather than computing fabricated coverage numbers. */}
        <div className="overflow-x-auto opacity-30 pointer-events-none select-none mb-2">
          <table className="w-full text-[10px]">
            <thead>
              <tr>
                <th className="text-left pr-3 py-1 text-white/40">Subject</th>
                {HEATMAP_WEEKS.map((w) => <th key={w} className="px-1 py-1 text-white/30 whitespace-nowrap">{w}</th>)}
              </tr>
            </thead>
            <tbody>
              {HEATMAP_SUBJECTS.map((subject) => (
                <tr key={subject}>
                  <td className="text-left pr-3 py-1 text-white/40 whitespace-nowrap">{subject}</td>
                  {HEATMAP_WEEKS.map((w) => (
                    <td key={w} className="px-1 py-1">
                      <div className="w-6 h-6 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EmptyState
          icon={<Upload size={22} />}
          title="No syllabus data yet"
          description="Import your syllabus to see coverage."
        />
      </div>

      {/* Batch cards */}
      <div className="space-y-3">
        {batchStats.map(({ batch, teacher, batchHW, batchAssessments, hwCoverage, assessCoverage, overall }) => (
          <div key={batch.id} className="plato-card p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(77,124,255,0.12)', color: '#4D7CFF' }}>
                <BookOpen size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-bold text-white/90">{batch.name}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${statusColor(overall)}15`, color: statusColor(overall) }}>
                    {statusLabel(overall)}
                  </span>
                </div>
                <p className="text-[12px] text-white/40">{batch.subject} · {batch.curriculum} · {batch.grade}</p>
              </div>
              {teacher && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Avatar name={teacher.name} size="xs" />
                  <span className="text-[11px] text-white/40 hidden sm:block">{teacher.name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Homework Coverage', value: hwCoverage, total: batchHW.length, done: batchHW.filter((h) => h.status !== 'assigned').length },
                { label: 'Assessment Coverage', value: assessCoverage, total: batchAssessments.length, done: batchAssessments.filter((a) => a.status === 'graded').length },
                { label: 'Overall Progress', value: overall, total: null, done: null },
              ].map(({ label, value, total, done }) => (
                <div key={label}>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-white/40">{label}</span>
                    <span className="font-semibold" style={{ color: statusColor(value) }}>
                      {done !== null ? `${done}/${total}` : `${value}%`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: statusColor(value) }} />
                  </div>
                </div>
              ))}
            </div>

            {overall < 50 && (
              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#FF6B7A]">
                <AlertCircle size={13} /> This batch needs attention — curriculum delivery is behind schedule.
              </div>
            )}
          </div>
        ))}

        {batchStats.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p>No active batches.</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { daysUntil } from '@/lib/utils'
import { Calendar, Clock, FileText, AlertCircle } from 'lucide-react'

export default function AssessmentsPage() {
  const { assessments, batches, teachers } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'graded'>('upcoming')

  const today = new Date().toISOString().split('T')[0]

  const filtered = assessments.filter((a) => {
    if (filter === 'upcoming') return a.date >= today && a.status === 'upcoming'
    if (filter === 'graded') return a.status === 'graded'
    return true
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcoming = assessments.filter((a) => a.date >= today && a.status === 'upcoming')
  const thisWeek = upcoming.filter((a) => daysUntil(a.date) <= 7)

  const typeColor: Record<string, string> = {
    exam: '#FF6B7A', quiz: '#4D7CFF', assignment: '#7B61FF',
    mock: '#FBBF24', practical: '#00FFA3', test: '#00F0FF',
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Assessments" subtitle={`${upcoming.length} upcoming · ${thisWeek.length} this week`} badge={<DemoBadge />} />

      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#FF6B7A]">{thisWeek.length}</p>
          <p className="text-[11px] text-white/30 mt-1">This Week</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#4D7CFF]">{upcoming.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Upcoming</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#00FFA3]">{assessments.filter((a) => a.status === 'graded').length}</p>
          <p className="text-[11px] text-white/30 mt-1">Graded</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {(['upcoming', 'graded', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize" style={{ background: filter === f ? 'rgba(77,124,255,0.2)' : 'transparent', color: filter === f ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => {
          const batch = batches.find((b) => b.id === a.batchId)
          const teacher = teachers.find((t) => t.id === a.teacherId)
          const days = daysUntil(a.date)
          const color = typeColor[a.type] || '#4D7CFF'
          const isUrgent = days >= 0 && days <= 3

          return (
            <div key={a.id} className="plato-card p-4 flex items-center gap-4" style={{ borderLeft: `3px solid ${color}` }}>
              <div className="text-center w-14 flex-shrink-0">
                <p className="text-[10px] text-white/30 uppercase">{new Date(a.date + 'T00:00').toLocaleDateString('en', { month: 'short' })}</p>
                <p className="text-[22px] font-bold font-display text-white/80">{new Date(a.date + 'T00:00').getDate()}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-bold text-white/90">{a.title}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold capitalize" style={{ background: `${color}15`, color }}>{a.type}</span>
                  {isUrgent && a.status === 'upcoming' && (
                    <span className="flex items-center gap-1 text-[10px] text-[#FF6B7A]"><AlertCircle size={10} /> {days === 0 ? 'Today!' : `${days}d`}</span>
                  )}
                </div>
                <p className="text-[12px] text-white/40 mt-0.5">{a.subject} · {batch?.name}</p>
                {teacher && <p className="text-[11px] text-white/30">{teacher.name}</p>}
                <div className="flex items-center gap-3 mt-1 text-[11px] text-white/30">
                  {a.duration && <span className="flex items-center gap-1"><Clock size={10} /> {a.duration} min</span>}
                  <span className="flex items-center gap-1"><FileText size={10} /> {a.maxMarks} marks</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: a.status === 'graded' ? 'rgba(0,255,163,0.1)' : 'rgba(77,124,255,0.1)', color: a.status === 'graded' ? '#00FFA3' : '#4D7CFF' }}>
                  {a.status}
                </span>
                {a.status === 'graded' && a.results.length > 0 && (
                  <p className="text-[11px] text-white/30 mt-1">{a.results.length} submitted</p>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <Calendar size={32} className="mx-auto mb-3 opacity-30" />
            <p>No assessments in this view.</p>
          </div>
        )}
      </div>
    </div>
  )
}

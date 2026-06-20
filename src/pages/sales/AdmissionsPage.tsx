import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, Circle, GraduationCap, BookOpen, CreditCard, Smartphone, Search } from 'lucide-react'

const CHECKLIST = [
  { key: 'profile', label: 'Profile Complete', icon: <GraduationCap size={13} /> },
  { key: 'batch', label: 'Batch Assigned', icon: <BookOpen size={13} /> },
  { key: 'fee', label: 'Fee Paid', icon: <CreditCard size={13} /> },
  { key: 'portal', label: 'Portal Access', icon: <Smartphone size={13} /> },
]

export default function AdmissionsPage() {
  const { leads, students, invoices } = useAppStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'complete' | 'pending'>('all')

  const enrolled = leads.filter((l) => l.status === 'enrolled')

  const enriched = enrolled.map((lead) => {
    const student = students.find((s) => s.name === lead.studentName)
    const hasBatch = student ? student.batchIds.length > 0 : false
    const hasFee = student
      ? invoices.some((i) => i.studentId === student.id && i.status === 'paid')
      : false
    const checks = {
      profile: !!student,
      batch: hasBatch,
      fee: hasFee,
      portal: !!student,
    }
    const score = Object.values(checks).filter(Boolean).length
    return { lead, student, checks, score }
  })

  const filtered = enriched.filter(({ lead, score }) => {
    const matchSearch = lead.studentName.toLowerCase().includes(search.toLowerCase()) ||
      lead.parentName.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'complete') return score === 4
    if (filter === 'pending') return score < 4
    return true
  })

  const stats = {
    total: enrolled.length,
    complete: enriched.filter((e) => e.score === 4).length,
    pending: enriched.filter((e) => e.score < 4).length,
    thisMonth: enrolled.filter((l) => l.convertedAt && new Date(l.convertedAt).getMonth() === new Date().getMonth()).length,
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Admissions"
        subtitle={`${stats.total} enrolled · ${stats.complete} fully onboarded`}
        badge={<DemoBadge />}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Enrolled', value: stats.total, color: '#4D7CFF' },
          { label: 'This Month', value: stats.thisMonth, color: '#7B61FF' },
          { label: 'Fully Onboarded', value: stats.complete, color: '#00FFA3' },
          { label: 'Pending Steps', value: stats.pending, color: '#FBBF24' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[24px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="plato-input pl-8 text-[13px]" placeholder="Search student or parent…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['all', 'complete', 'pending'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 text-[12px] font-medium capitalize transition-colors" style={{ background: filter === f ? 'rgba(77,124,255,0.2)' : 'transparent', color: filter === f ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(({ lead, checks, score }) => (
          <div key={lead.id} className="plato-card p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Avatar name={lead.studentName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-white/90 truncate">{lead.studentName}</p>
                <p className="text-[11px] text-white/40">{lead.curriculum} · {lead.grade}</p>
                <p className="text-[11px] text-white/30">{lead.parentName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: score === 4 ? 'rgba(0,255,163,0.1)' : 'rgba(251,191,36,0.1)',
                    color: score === 4 ? '#00FFA3' : '#FBBF24',
                  }}
                >
                  {score}/4
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(score / 4) * 100}%`, background: score === 4 ? '#00FFA3' : '#4D7CFF' }} />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-2">
              {CHECKLIST.map(({ key, label, icon }) => {
                const done = checks[key as keyof typeof checks]
                return (
                  <div key={key} className="flex items-center gap-2 text-[11px]" style={{ color: done ? '#00FFA3' : 'rgba(255,255,255,0.25)' }}>
                    {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    <span className="flex items-center gap-1">{icon} {label}</span>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            {lead.convertedAt && (
              <p className="text-[10px] text-white/20">Enrolled {formatDate(lead.convertedAt)}</p>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/30">
            <GraduationCap size={32} className="mx-auto mb-3 opacity-30" />
            <p>No enrolled students match your filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

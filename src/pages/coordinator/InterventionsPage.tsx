import type { ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { AlertTriangle, CalendarCheck, BookOpen, Heart, CheckCircle2 } from 'lucide-react'
import type { Intervention } from '@/types'

const TYPE_CONFIG: Record<Intervention['type'], { label: string; color: string; icon: ReactNode }> = {
  academic: { label: 'Academic', color: '#4D7CFF', icon: <BookOpen size={14} /> },
  attendance: { label: 'Attendance', color: '#FBBF24', icon: <CalendarCheck size={14} /> },
  behavioral: { label: 'Behavioral', color: '#7B61FF', icon: <Heart size={14} /> },
}

export default function InterventionsPage() {
  const { interventions, students, users, updateIntervention } = useAppStore()

  const active = interventions.filter((i) => i.status !== 'resolved').sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
  const resolved = interventions.filter((i) => i.status === 'resolved')

  const markResolved = (id: string) => {
    updateIntervention(id, { status: 'resolved' })
    toast.success('Intervention resolved', 'Student support plan marked as complete.')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Interventions" subtitle="Targeted academic intervention plans for at-risk students" badge={<DemoBadge />} />

      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[22px] font-bold font-display text-[#FF6B7A]">{interventions.filter((i) => i.status === 'active').length}</p>
          <p className="text-[11px] text-white/30 mt-1">Active</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[22px] font-bold font-display text-[#FBBF24]">{interventions.filter((i) => i.status === 'monitoring').length}</p>
          <p className="text-[11px] text-white/30 mt-1">Monitoring</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[22px] font-bold font-display text-[#00FFA3]">{resolved.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Resolved</p>
        </div>
      </div>

      <div className="space-y-3">
        {active.map((i) => {
          const student = students.find((s) => s.id === i.studentId)
          const owner = users.find((u) => u.id === i.ownerId)
          const cfg = TYPE_CONFIG[i.type]
          return (
            <div key={i.id} className="plato-card p-4" style={{ borderLeft: `3px solid ${i.status === 'active' ? '#FF6B7A' : '#FBBF24'}` }}>
              <div className="flex items-start gap-3">
                {student && <Avatar name={student.name} size="sm" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-white/85">{student?.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: i.status === 'active' ? 'rgba(255,107,122,0.1)' : 'rgba(251,191,36,0.1)', color: i.status === 'active' ? '#FF6B7A' : '#FBBF24' }}>{i.status}</span>
                  </div>
                  <p className="text-[12px] text-white/45 mt-1.5 flex items-start gap-1.5"><AlertTriangle size={12} className="mt-0.5 flex-shrink-0 text-white/30" /> {i.reason}</p>
                  <ul className="mt-2 space-y-1">
                    {i.actions.map((a, idx) => (
                      <li key={idx} className="text-[11px] text-white/40 flex items-start gap-1.5">
                        <span className="text-white/20 mt-0.5">•</span> {a}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-white/30 mt-2">Owner: {owner?.name} · Target: {formatDate(i.targetDate)}</p>
                </div>
                <button onClick={() => markResolved(i.id)} className="btn-ghost text-[11px] flex-shrink-0"><CheckCircle2 size={13} /> Resolve</button>
              </div>
            </div>
          )
        })}

        {resolved.length > 0 && (
          <div className="pt-2">
            <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest mb-3">Resolved</p>
            <div className="space-y-2 opacity-50">
              {resolved.map((i) => {
                const student = students.find((s) => s.id === i.studentId)
                return (
                  <div key={i.id} className="plato-card p-3 flex items-center gap-3">
                    {student && <Avatar name={student.name} size="xs" />}
                    <p className="text-[12px] text-white/60">{student?.name} — {i.reason}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

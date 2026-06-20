import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/lib/utils'
import { ShieldAlert, AlertTriangle, Info, History } from 'lucide-react'

const SEVERITY_CONFIG: Record<string, { color: string; icon: ReactNode; label: string }> = {
  critical: { color: '#FF6B7A', icon: <ShieldAlert size={14} />, label: 'Critical' },
  warning: { color: '#FBBF24', icon: <AlertTriangle size={14} />, label: 'Warning' },
  info: { color: '#4D7CFF', icon: <Info size={14} />, label: 'Info' },
}

export default function AuditLogsPage() {
  const { auditLog, users } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all')

  const filtered = [...auditLog]
    .filter((a) => filter === 'all' || a.severity === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const counts = {
    all: auditLog.length,
    critical: auditLog.filter((a) => a.severity === 'critical').length,
    warning: auditLog.filter((a) => a.severity === 'warning').length,
    info: auditLog.filter((a) => a.severity === 'info').length,
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Audit Logs" subtitle="Full audit trail of all user actions, data changes, and system events" />

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize" style={{ background: filter === f ? 'rgba(77,124,255,0.2)' : 'transparent', color: filter === f ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
            {f} <span className="text-white/30 ml-1">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="plato-card overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.map((entry) => {
            const user = users.find((u) => u.id === entry.userId)
            const cfg = SEVERITY_CONFIG[entry.severity]
            return (
              <div key={entry.id} className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold text-white/85">{entry.action}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-white/40" style={{ background: 'rgba(255,255,255,0.05)' }}>{entry.entityType}</span>
                  </div>
                  <p className="text-[12px] text-white/45 mt-1">{entry.details}</p>
                  <p className="text-[11px] text-white/30 mt-1">{user?.name || entry.userId} · {formatDateTime(entry.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <EmptyState icon={<History size={24} />} title="No audit entries" description="No events match this filter." />
        )}
      </div>
    </div>
  )
}

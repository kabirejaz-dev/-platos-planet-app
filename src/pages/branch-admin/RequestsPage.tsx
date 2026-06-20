import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, getStatusColor } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Inbox, Check, X, CalendarClock, Home, Wrench, MessageSquare } from 'lucide-react'
import type { BranchRequest } from '@/types'

const TYPE_CONFIG: Record<BranchRequest['type'], { label: string; icon: ReactNode; color: string }> = {
  leave: { label: 'Leave Request', icon: <CalendarClock size={14} />, color: '#FBBF24' },
  room_booking: { label: 'Room Booking', icon: <Home size={14} />, color: '#4D7CFF' },
  parent_request: { label: 'Parent Request', icon: <MessageSquare size={14} />, color: '#7B61FF' },
  resource: { label: 'Resource Request', icon: <Wrench size={14} />, color: '#00F0FF' },
}

export default function RequestsPage() {
  const { currentUser, branchRequests, users, updateBranchRequest } = useAppStore()
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [declining, setDeclining] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')

  const branchReqs = branchRequests
    .filter((r) => !currentUser?.branchId || r.branchId === currentUser.branchId)
    .filter((r) => filter === 'all' || r.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pendingCount = branchRequests.filter((r) => (!currentUser?.branchId || r.branchId === currentUser.branchId) && r.status === 'pending').length

  const handleApprove = (req: BranchRequest) => {
    updateBranchRequest(req.id, { status: 'approved', resolvedAt: new Date().toISOString() })
    toast.success('Request approved', req.title)
  }

  const handleDecline = (req: BranchRequest) => {
    updateBranchRequest(req.id, { status: 'rejected', resolvedAt: new Date().toISOString(), declineReason: declineReason.trim() || undefined })
    toast.error('Request rejected', req.title)
    setDeclining(null)
    setDeclineReason('')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Requests" subtitle={`${pendingCount} pending · parent requests, leave applications, and room bookings`} />

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {(['pending', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize" style={{ background: filter === f ? 'rgba(77,124,255,0.2)' : 'transparent', color: filter === f ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {branchReqs.map((req) => {
          const requester = users.find((u) => u.id === req.requestedBy)
          const cfg = TYPE_CONFIG[req.type]
          const isDeclining = declining === req.id
          return (
            <div key={req.id} className="plato-card p-4">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-white/85">{req.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <p className="text-[12px] text-white/45 mt-1">{req.description}</p>
                  <p className="text-[11px] text-white/30 mt-1">{requester?.name || req.requestedBy} · {formatDate(req.createdAt)}</p>
                  {req.status === 'rejected' && req.declineReason && (
                    <p className="text-[11px] text-[#FF6B7A]/80 mt-1.5">Decline reason: {req.declineReason}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  {req.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => { setDeclining(req.id); setDeclineReason('') }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FF6B7A]/10 text-[#FF6B7A] hover:bg-[#FF6B7A]/20 transition-colors"><X size={14} /></button>
                      <button onClick={() => handleApprove(req)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20 transition-colors"><Check size={14} /></button>
                    </div>
                  ) : (
                    <span className={getStatusColor(req.status)}>{req.status}</span>
                  )}
                </div>
              </div>

              {isDeclining && (
                <div className="mt-3 pl-[52px] flex gap-2">
                  <input
                    autoFocus
                    className="plato-input text-[12px] flex-1"
                    placeholder="Reason for declining (optional)…"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleDecline(req) }}
                  />
                  <button className="btn-ghost text-[12px]" onClick={() => setDeclining(null)}>Cancel</button>
                  <button className="btn-primary text-[12px]" style={{ background: '#FF6B7A' }} onClick={() => handleDecline(req)}>Confirm Decline</button>
                </div>
              )}
            </div>
          )
        })}

        {branchReqs.length === 0 && (
          <EmptyState icon={<Inbox size={24} />} title="No requests" description={filter === 'pending' ? 'No pending requests right now.' : 'No requests found.'} />
        )}
      </div>
    </div>
  )
}

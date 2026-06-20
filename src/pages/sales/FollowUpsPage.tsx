import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { RequiredMark, RequiredFieldsNote } from '@/components/ui/FormField'
import { formatDate } from '@/lib/utils'
import { Phone, MessageSquare, Calendar, CheckCircle2, AlertCircle, Clock, PhoneCall } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'
import type { Lead, LeadStatus } from '@/types'

const SOURCE_LABEL: Record<Lead['source'], string> = {
  website: 'Website',
  walk_in: 'Walk-in',
  referral: 'Referral',
  social_media: 'Social Media',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp',
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  trial_scheduled: 'Trial Scheduled',
  trial_done: 'Trial Done',
  enrolled: 'Enrolled',
  lost: 'Lost',
}

export default function FollowUpsPage() {
  const { leads, updateLead } = useAppStore()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [logLeadId, setLogLeadId] = useState<string | null>(null)
  const [logForm, setLogForm] = useState({ outcome: '', status: 'contacted' as LeadStatus, followUpDate: '', notes: '' })

  const dueFollowUps = leads
    .filter((l) =>
      l.followUpDate &&
      l.status !== 'enrolled' &&
      l.status !== 'lost'
    )
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())

  const todayStr = new Date().toISOString().split('T')[0]

  const overdue = dueFollowUps.filter((l) => l.followUpDate! < todayStr && !completedIds.has(l.id))
  const today = dueFollowUps.filter((l) => l.followUpDate === todayStr && !completedIds.has(l.id))
  const upcoming = dueFollowUps.filter((l) => l.followUpDate! > todayStr && !completedIds.has(l.id))
  const done = dueFollowUps.filter((l) => completedIds.has(l.id))

  const markDone = (lead: Lead) => {
    setCompletedIds((s) => new Set([...s, lead.id]))
    updateLead(lead.id, { status: lead.status === 'new' ? 'contacted' : lead.status })
    toast.success('Follow-up completed', `${lead.parentName} · ${lead.studentName}`)
  }

  const logLead = leads.find((l) => l.id === logLeadId)

  const openLogCall = (lead: Lead) => {
    setLogForm({ outcome: '', status: lead.status, followUpDate: '', notes: '' })
    setLogLeadId(lead.id)
  }

  const closeLogCall = () => setLogLeadId(null)

  const saveLogCall = () => {
    if (!logLead || !logForm.outcome.trim()) return
    const entry = { date: new Date().toISOString(), outcome: logForm.outcome.trim(), notes: logForm.notes.trim() || undefined }
    updateLead(logLead.id, {
      status: logForm.status,
      followUpDate: logForm.followUpDate || undefined,
      notes: logForm.notes.trim() ? `${logLead.notes ? logLead.notes + '\n' : ''}${formatDate(todayStr)}: ${logForm.notes.trim()}` : logLead.notes,
      callLog: [...(logLead.callLog || []), entry],
    })
    setCompletedIds((s) => new Set([...s, logLead.id]))
    toast.success('Call logged', `${logLead.parentName} · ${STATUS_LABEL[logForm.status]}`)
    closeLogCall()
  }

  const FollowUpCard = ({ lead }: { lead: Lead }) => {
    const daysUntil = Math.ceil((new Date(lead.followUpDate!).getTime() - Date.now()) / 86400000)
    const isOverdue = daysUntil < 0
    return (
      <div
        className="plato-card p-4 space-y-3"
        style={{ borderLeft: `3px solid ${isOverdue ? '#FF6B7A' : daysUntil === 0 ? '#FBBF24' : '#4D7CFF'}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[14px] font-bold text-white/90">{lead.parentName}</p>
            <p className="text-[12px] text-white/40">Student: {lead.studentName} · {lead.curriculum} · {lead.grade}</p>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
            style={{
              background: isOverdue ? 'rgba(255,107,122,0.1)' : daysUntil === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(77,124,255,0.1)',
              color: isOverdue ? '#FF6B7A' : daysUntil === 0 ? '#FBBF24' : '#4D7CFF',
            }}
          >
            {isOverdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Today' : `In ${daysUntil}d`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[12px] text-white/40">
            <Calendar size={12} />
            {formatDate(lead.followUpDate!)}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-white/40">
            <span>{SOURCE_LABEL[lead.source]}</span>
          </div>
        </div>

        {lead.notes && (
          <p className="text-[12px] text-white/50 leading-relaxed bg-white/[0.02] p-2 rounded-lg">{lead.notes}</p>
        )}

        <div className="flex items-center gap-2">
          <a
            href={`tel:${lead.parentPhone}`}
            className="btn-ghost flex-1 justify-center text-[12px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone size={13} /> Call
          </a>
          <a
            href={`https://wa.me/${lead.parentPhone.replace(/\D/g, '')}?text=${encodeURIComponent("Hello, I'm calling from Plato's Planet regarding your child's enquiry.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex-1 justify-center text-[12px]"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageSquare size={13} /> WhatsApp
          </a>
          <button
            className="btn-ghost flex-1 justify-center text-[12px]"
            onClick={() => openLogCall(lead)}
          >
            <PhoneCall size={13} /> Log Call
          </button>
          <button
            className="btn-primary flex-1 justify-center text-[12px]"
            onClick={() => markDone(lead)}
          >
            <CheckCircle2 size={13} /> Done
          </button>
        </div>
      </div>
    )
  }

  const Section = ({ title, items, icon, color }: { title: string; items: Lead[]; icon: JSX.Element; color: string }) => (
    items.length > 0 ? (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color }}>{icon}</span>
          <h3 className="text-[13px] font-bold" style={{ color }}>{title}</h3>
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: `${color}15`, color }}
          >
            {items.length}
          </span>
        </div>
        <div className="space-y-3">
          {items.map((l) => <FollowUpCard key={l.id} lead={l} />)}
        </div>
      </div>
    ) : null
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Follow-Ups"
        subtitle={`${overdue.length + today.length} need attention today`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overdue', value: overdue.length, color: '#FF6B7A' },
          { label: 'Today', value: today.length, color: '#FBBF24' },
          { label: 'Upcoming', value: upcoming.length, color: '#4D7CFF' },
          { label: 'Done', value: done.length, color: '#00FFA3' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[24px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {overdue.length === 0 && today.length === 0 && upcoming.length === 0 && done.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-[#00FFA3] opacity-50" />
          <p className="text-[14px]">No follow-ups scheduled. Add follow-up dates when creating leads.</p>
        </div>
      )}

      <Section title="Overdue" items={overdue} icon={<AlertCircle size={15} />} color="#FF6B7A" />
      <Section title="Due Today" items={today} icon={<Clock size={15} />} color="#FBBF24" />
      <Section title="Upcoming" items={upcoming} icon={<Calendar size={15} />} color="#4D7CFF" />

      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={15} className="text-[#00FFA3]" />
            <h3 className="text-[13px] font-bold text-[#00FFA3]">Completed Today</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#00FFA3]/10 text-[#00FFA3]">{done.length}</span>
          </div>
          <div className="space-y-2 opacity-60">
            {done.map((l) => (
              <div
                key={l.id}
                className="plato-card p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-[13px] font-semibold text-white/60">{l.parentName}</p>
                  <p className="text-[11px] text-white/30">{l.studentName}</p>
                </div>
                <CheckCircle2 size={16} className="text-[#00FFA3]" />
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={Boolean(logLead)} onClose={closeLogCall} title={logLead ? `Log Call — ${logLead.parentName}` : 'Log Call'} isDirty={Boolean(logForm.outcome || logForm.notes)}>
        {logLead && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Outcome<RequiredMark /></label>
              <input className="plato-input" placeholder="e.g. Spoke to parent, interested in trial" value={logForm.outcome} onChange={(e) => setLogForm((f) => ({ ...f, outcome: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Update Status</label>
              <select className="plato-input" value={logForm.status} onChange={(e) => setLogForm((f) => ({ ...f, status: e.target.value as LeadStatus }))}>
                {Object.entries(STATUS_LABEL).map(([s, label]) => <option key={s} value={s}>{label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Next Follow-up Date (optional)</label>
              <input type="date" className="plato-input" value={logForm.followUpDate} onChange={(e) => setLogForm((f) => ({ ...f, followUpDate: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes (optional)</label>
              <textarea className="plato-input min-h-[70px]" placeholder="Additional details about the call…" value={logForm.notes} onChange={(e) => setLogForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>

            <RequiredFieldsNote />

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={closeLogCall}>Cancel</button>
              <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={saveLogCall} disabled={!logForm.outcome.trim()}>Save Outcome</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

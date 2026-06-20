import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Calendar, Phone, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react'
import type { Lead } from '@/types'

export default function TrialsPage() {
  const { leads, updateLead, branches } = useAppStore()
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'no_show'>('upcoming')

  const trials = leads.filter((l) => l.status === 'trial_scheduled' || l.status === 'trial_done')

  const upcoming = trials.filter((l) => l.status === 'trial_scheduled')
  const completed = trials.filter((l) => l.status === 'trial_done')

  const markDone = (lead: Lead) => {
    updateLead(lead.id, { status: 'trial_done' })
    toast.success('Trial completed', `${lead.studentName} attended the trial`)
  }

  const markNoShow = (lead: Lead) => {
    updateLead(lead.id, { status: 'contacted' })
    toast.warning('No-show recorded', `Follow up with ${lead.parentName}`)
  }

  const enroll = (lead: Lead) => {
    updateLead(lead.id, { status: 'enrolled', convertedAt: new Date().toISOString() })
    toast.success('Enrolled! 🎉', `${lead.studentName} converted from trial`)
  }

  const list = tab === 'upcoming' ? upcoming : tab === 'completed' ? completed : []
  const today = new Date().toISOString().split('T')[0]

  const TrialCard = ({ lead }: { lead: Lead }) => {
    const isToday = lead.followUpDate === today

    return (
      <div
        className="plato-card p-4 space-y-3"
        style={{ borderLeft: `3px solid ${lead.status === 'trial_done' ? '#00FFA3' : isToday ? '#FBBF24' : '#4D7CFF'}` }}
      >
        <div className="flex items-start gap-3">
          <Avatar name={lead.studentName} size="md" />
          <div className="flex-1">
            <p className="text-[14px] font-bold text-white/90">{lead.studentName}</p>
            <p className="text-[12px] text-white/40">{lead.curriculum} · {lead.grade}</p>
            <p className="text-[12px] text-white/40">{lead.parentName} · {lead.parentPhone}</p>
          </div>
          {lead.status === 'trial_scheduled' && isToday && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBBF24]/10 text-[#FBBF24]">Today</span>
          )}
          {lead.status === 'trial_done' && (
            <CheckCircle2 size={18} className="text-[#00FFA3] flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-white/40">
          {lead.followUpDate && (
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(lead.followUpDate)}</span>
          )}
          <span className="flex items-center gap-1"><MapPin size={11} /> {branches.find((b) => b.id === lead.branchId)?.name || lead.branchId}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {lead.subjects.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(77,124,255,0.12)', color: '#4D7CFF' }}>{s}</span>
          ))}
        </div>

        {lead.status === 'trial_scheduled' && (
          <div className="flex gap-2 pt-1">
            <a href={`tel:${lead.parentPhone}`} className="btn-ghost flex-1 justify-center text-[12px]">
              <Phone size={13} /> Call
            </a>
            <button onClick={() => markNoShow(lead)} className="btn-ghost flex-1 justify-center text-[12px] text-[#FF6B7A]">
              <XCircle size={13} /> No-show
            </button>
            <button onClick={() => markDone(lead)} className="btn-primary flex-1 justify-center text-[12px]">
              <CheckCircle2 size={13} /> Done
            </button>
          </div>
        )}

        {lead.status === 'trial_done' && (
          <button onClick={() => enroll(lead)} className="w-full btn-primary justify-center text-[12px]">
            Enroll Student →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Trial Classes"
        subtitle={`${upcoming.length} upcoming · ${completed.length} completed`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#4D7CFF]">{upcoming.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Scheduled</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#00FFA3]">{completed.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Completed</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#FBBF24]">
            {upcoming.filter((l) => l.followUpDate === today).length}
          </p>
          <p className="text-[11px] text-white/30 mt-1">Today</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {([['upcoming', 'Upcoming'], ['completed', 'Completed']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all" style={{ background: tab === key ? 'rgba(77,124,255,0.2)' : 'transparent', color: tab === key ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((lead) => <TrialCard key={lead.id} lead={lead} />)}
        {list.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/30">
            <Clock size={32} className="mx-auto mb-3 opacity-30" />
            <p>No {tab} trials.</p>
          </div>
        )}
      </div>
    </div>
  )
}

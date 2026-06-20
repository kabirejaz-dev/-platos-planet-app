import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Megaphone, Users, Target, TrendingUp, Plus } from 'lucide-react'
import type { Campaign } from '@/types'

const CHANNEL_COLOR: Record<string, string> = {
  social_media: '#FF6B7A', google_ads: '#4D7CFF', referral: '#00FFA3', whatsapp: '#00F0FF', email: '#7B61FF',
}
const CHANNEL_LABEL: Record<Campaign['channel'], string> = {
  social_media: 'Instagram / Social Media', google_ads: 'Google Ads', referral: 'Referral', whatsapp: 'WhatsApp', email: 'Walk-in Event',
}

const CAMPAIGN_STATUS_COLOR: Record<string, string> = { active: '#00FFA3', paused: '#FBBF24', ended: '#64748B' }

const emptyForm = { name: '', channel: 'social_media' as Campaign['channel'], startDate: new Date().toISOString().split('T')[0], budget: '', leadsGenerated: '0', status: 'active' as Campaign['status'] }

export default function CampaignsPage() {
  const { currentUser, campaigns, branches, addCampaign } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const branchCampaigns = campaigns.filter((c) => !currentUser?.branchId || c.branchId === currentUser.branchId)
  const totalLeads = branchCampaigns.reduce((s, c) => s + c.leadsGenerated, 0)
  const totalConversions = branchCampaigns.reduce((s, c) => s + c.conversions, 0)
  const totalBudget = branchCampaigns.reduce((s, c) => s + c.budget, 0)
  const avgConversion = totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100) : 0
  const costPerLead = totalLeads > 0 ? Math.round(totalBudget / totalLeads) : 0

  const closeModal = () => { setShowModal(false); setForm(emptyForm) }

  const handleCreate = () => {
    if (!form.name.trim() || !currentUser?.branchId) return
    addCampaign({
      id: `camp-${generateId()}`,
      name: form.name.trim(),
      channel: form.channel,
      branchId: currentUser.branchId,
      startDate: form.startDate,
      budget: Number(form.budget) || 0,
      leadsGenerated: Number(form.leadsGenerated) || 0,
      conversions: 0,
      status: form.status,
    })
    toast.success('Campaign created', form.name)
    closeModal()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Campaigns"
        subtitle="Marketing campaigns, referral programmes, and lead generation tracking"
        actions={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> New Campaign</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="plato-card p-4 text-center">
          <Megaphone size={18} className="mx-auto mb-2 text-[#4D7CFF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{branchCampaigns.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Campaigns</p>
        </div>
        <div className="plato-card p-4 text-center">
          <Users size={18} className="mx-auto mb-2 text-[#7B61FF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{totalLeads}</p>
          <p className="text-[11px] text-white/30 mt-1">Leads Generated</p>
        </div>
        <div className="plato-card p-4 text-center">
          <Target size={18} className="mx-auto mb-2 text-[#00FFA3]" />
          <p className="text-[20px] font-bold font-display text-[#00FFA3]">{avgConversion}%</p>
          <p className="text-[11px] text-white/30 mt-1">Conversion Rate</p>
        </div>
        <div className="plato-card p-4 text-center">
          <TrendingUp size={18} className="mx-auto mb-2 text-[#FBBF24]" />
          <p className="text-[16px] font-bold font-display text-white/85">{formatCurrency(totalBudget)}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Budget</p>
        </div>
        <div className="plato-card p-4 text-center">
          <Target size={18} className="mx-auto mb-2 text-[#FF6B7A]" />
          <p className="text-[16px] font-bold font-display text-white/85">{formatCurrency(costPerLead)}</p>
          <p className="text-[11px] text-white/30 mt-1">Cost / Lead</p>
        </div>
      </div>

      <div className="space-y-3">
        {branchCampaigns.map((c) => {
          const branch = branches.find((b) => b.id === c.branchId)
          const conversion = c.leadsGenerated > 0 ? Math.round((c.conversions / c.leadsGenerated) * 100) : 0
          const color = CHANNEL_COLOR[c.channel]
          return (
            <div key={c.id} className="plato-card p-4" style={{ borderLeft: `3px solid ${color}` }}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold text-white/90">{c.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: `${color}15`, color }}>{c.channel.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[12px] text-white/40 mt-1">{branch?.name} · Started {formatDate(c.startDate)}{c.endDate ? ` — Ended ${formatDate(c.endDate)}` : ''}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: `${CAMPAIGN_STATUS_COLOR[c.status]}15`, color: CAMPAIGN_STATUS_COLOR[c.status] }}>{c.status}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div>
                  <p className="text-[16px] font-bold text-white/85">{formatCurrency(c.budget)}</p>
                  <p className="text-[10px] text-white/30">Budget</p>
                </div>
                <div>
                  <p className="text-[16px] font-bold text-[#4D7CFF]">{c.leadsGenerated}</p>
                  <p className="text-[10px] text-white/30">Leads</p>
                </div>
                <div>
                  <p className="text-[16px] font-bold text-[#00FFA3]">{c.conversions}</p>
                  <p className="text-[10px] text-white/30">Conversions</p>
                </div>
                <div>
                  <p className="text-[16px] font-bold text-white/85">{conversion}%</p>
                  <p className="text-[10px] text-white/30">Conv. Rate</p>
                </div>
              </div>
            </div>
          )
        })}
        {branchCampaigns.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <Megaphone size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px]">No campaigns yet. Click "New Campaign" to add one.</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={closeModal} title="New Campaign">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Campaign Name</label>
            <input className="plato-input" placeholder="e.g. Summer Enrolment Push" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Channel</label>
            <select className="plato-input" value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as Campaign['channel'] }))}>
              {Object.entries(CHANNEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Start Date</label>
              <input type="date" className="plato-input" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
              <select className="plato-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Campaign['status'] }))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Budget (AED)</label>
              <input type="number" className="plato-input" placeholder="0" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Leads Generated</label>
              <input type="number" className="plato-input" placeholder="0" value={form.leadsGenerated} onChange={(e) => setForm((f) => ({ ...f, leadsGenerated: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={closeModal}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.name.trim()}>Create Campaign</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

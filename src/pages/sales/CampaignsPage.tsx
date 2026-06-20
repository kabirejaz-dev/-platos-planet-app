import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Megaphone, Users, Target, TrendingUp } from 'lucide-react'

const CHANNEL_COLOR: Record<string, string> = {
  social_media: '#FF6B7A', google_ads: '#4D7CFF', referral: '#00FFA3', whatsapp: '#00F0FF', email: '#7B61FF',
}

const CAMPAIGN_STATUS_COLOR: Record<string, string> = { active: '#00FFA3', paused: '#FBBF24', ended: '#64748B' }

export default function CampaignsPage() {
  const { currentUser, campaigns, branches } = useAppStore()

  const branchCampaigns = campaigns.filter((c) => !currentUser?.branchId || c.branchId === currentUser.branchId)
  const totalLeads = branchCampaigns.reduce((s, c) => s + c.leadsGenerated, 0)
  const totalConversions = branchCampaigns.reduce((s, c) => s + c.conversions, 0)
  const totalBudget = branchCampaigns.reduce((s, c) => s + c.budget, 0)
  const avgConversion = totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100) : 0

  return (
    <div className="space-y-5">
      <PageHeader title="Campaigns" subtitle="Marketing campaigns, referral programmes, and lead generation tracking" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>
    </div>
  )
}

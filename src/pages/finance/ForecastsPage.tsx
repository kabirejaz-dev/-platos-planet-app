import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react'

export default function ForecastsPage() {
  const { invoices, students, leads } = useAppStore()

  const paidInvoices = invoices.filter((i) => i.status === 'paid')
  const totalCollected = paidInvoices.reduce((s, i) => s + i.totalAmount, 0)
  const activeStudents = students.filter((s) => s.status === 'active').length
  const avgPerStudent = activeStudents > 0 ? Math.round(totalCollected / activeStudents) : 0

  // Monthly revenue from paid invoices
  const monthlyRevenue: Record<string, number> = {}
  paidInvoices.forEach((inv) => {
    if (!inv.paidDate) return
    const key = inv.paidDate.slice(0, 7)
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + inv.totalAmount
  })

  const months = Object.keys(monthlyRevenue).sort().slice(-6)
  const revenueData = months.map((m) => ({
    month: new Date(m + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
    actual: monthlyRevenue[m],
    forecast: Math.round(monthlyRevenue[m] * 1.08),
  }))

  // Add 3 forecast months
  const lastMonth = months[months.length - 1] || new Date().toISOString().slice(0, 7)
  const lastRevenue = monthlyRevenue[lastMonth] || avgPerStudent * activeStudents
  for (let i = 1; i <= 3; i++) {
    const d = new Date(lastMonth + '-01')
    d.setMonth(d.getMonth() + i)
    revenueData.push({
      month: d.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      actual: 0,
      forecast: Math.round(lastRevenue * Math.pow(1.06, i)),
    })
  }

  // Pipeline value
  const pipelineLeads = leads.filter((l) => !['enrolled', 'lost'].includes(l.status))
  const pipelineValue = pipelineLeads.length * avgPerStudent

  const enrolledThisMonth = leads.filter((l) => {
    if (!l.convertedAt) return false
    return l.convertedAt.slice(0, 7) === new Date().toISOString().slice(0, 7)
  }).length

  return (
    <div className="space-y-5">
      <PageHeader
        title="Revenue Forecasts"
        subtitle="6-month projection based on current enrolments"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Collected', value: formatCurrency(totalCollected), color: '#00FFA3', icon: <DollarSign size={16} /> },
          { label: 'Avg / Student', value: formatCurrency(avgPerStudent), color: '#4D7CFF', icon: <Users size={16} /> },
          { label: 'Pipeline Value', value: formatCurrency(pipelineValue), color: '#7B61FF', icon: <Target size={16} /> },
          { label: 'Enrolled This Month', value: enrolledThisMonth, color: '#FBBF24', icon: <TrendingUp size={16} /> },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <p className="text-[11px] text-white/40">{s.label}</p>
            </div>
            <p className="text-[20px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[14px] font-bold text-white/90">Revenue Trend & Forecast</h3>
            <p className="text-[12px] text-white/40 mt-0.5">Historical + 3-month projection at 6% MoM growth</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-[#4D7CFF] inline-block" /> Actual</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-[#00FFA3] inline-block" /> Forecast</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4D7CFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4D7CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00FFA3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v > 0 ? `${(v / 1000).toFixed(0)}k` : ''} />
            <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
            <Area animationDuration={600} type="monotone" dataKey="actual" stroke="#4D7CFF" strokeWidth={2} fill="url(#actualGrad)" dot={false} />
            <Area animationDuration={600} type="monotone" dataKey="forecast" stroke="#00FFA3" strokeWidth={2} fill="url(#forecastGrad)" dot={false} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline breakdown */}
      <div className="plato-card p-5">
        <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Lead Pipeline</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {(['new', 'contacted', 'trial_scheduled', 'trial_done', 'enrolled'] as const).map((status) => {
            const count = leads.filter((l) => l.status === status).length
            const COLOR: Record<string, string> = { new: '#4D7CFF', contacted: '#7B61FF', trial_scheduled: '#C6FF00', trial_done: '#00F0FF', enrolled: '#00FFA3' }
            return (
              <div key={status} className="text-center rounded-xl p-3" style={{ background: `${COLOR[status]}08`, border: `1px solid ${COLOR[status]}20` }}>
                <p className="text-[20px] font-bold font-display" style={{ color: COLOR[status] }}>{count}</p>
                <p className="text-[10px] text-white/30 mt-1 capitalize">{status.replace('_', ' ')}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

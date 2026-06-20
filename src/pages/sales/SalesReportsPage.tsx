import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react'

const SOURCE_COLOR: Record<string, string> = {
  website: '#4D7CFF', walk_in: '#7B61FF', referral: '#00FFA3', social_media: '#FF6B7A', google_ads: '#FBBF24', whatsapp: '#00F0FF',
}

export default function SalesReportsPage() {
  const { currentUser, leads, invoices, students } = useAppStore()

  const branchLeads = leads.filter((l) => !currentUser?.branchId || l.branchId === currentUser.branchId)
  const enrolled = branchLeads.filter((l) => l.status === 'enrolled')
  const conversionRate = branchLeads.length > 0 ? Math.round((enrolled.length / branchLeads.length) * 100) : 0

  const sourceMap: Record<string, { leads: number; enrolled: number }> = {}
  branchLeads.forEach((l) => {
    if (!sourceMap[l.source]) sourceMap[l.source] = { leads: 0, enrolled: 0 }
    sourceMap[l.source].leads++
    if (l.status === 'enrolled') sourceMap[l.source].enrolled++
  })
  const sourceData = Object.entries(sourceMap).map(([source, { leads: l, enrolled: e }]) => ({
    source: source.replace('_', ' '), leads: l, enrolled: e, color: SOURCE_COLOR[source],
  }))

  const pieData = Object.entries(sourceMap).map(([source, { leads: l }]) => ({ name: source.replace('_', ' '), value: l, color: SOURCE_COLOR[source] }))

  // Revenue attribution: sum invoice totals for students whose lead source we know
  const enrolledStudentNames = new Set(enrolled.map((l) => l.studentName))
  const attributedRevenue = students
    .filter((s) => enrolledStudentNames.has(s.name))
    .reduce((sum, s) => sum + invoices.filter((i) => i.studentId === s.id && i.status === 'paid').reduce((a, i) => a + i.totalAmount, 0), 0)

  return (
    <div className="space-y-5">
      <PageHeader title="Sales Reports" subtitle="Conversion rates, source analysis, and revenue attribution reports" badge={<DemoBadge />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="plato-card p-4 text-center">
          <Users size={18} className="mx-auto mb-2 text-[#4D7CFF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{branchLeads.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Leads</p>
        </div>
        <div className="plato-card p-4 text-center">
          <Target size={18} className="mx-auto mb-2 text-[#00FFA3]" />
          <p className="text-[20px] font-bold font-display text-[#00FFA3]">{conversionRate}%</p>
          <p className="text-[11px] text-white/30 mt-1">Conversion Rate</p>
        </div>
        <div className="plato-card p-4 text-center">
          <TrendingUp size={18} className="mx-auto mb-2 text-[#7B61FF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{enrolled.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Enrolled</p>
        </div>
        <div className="plato-card p-4 text-center">
          <DollarSign size={18} className="mx-auto mb-2 text-[#FBBF24]" />
          <p className="text-[16px] font-bold font-display text-white/85">{formatCurrency(attributedRevenue)}</p>
          <p className="text-[11px] text-white/30 mt-1">Attributed Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Leads vs Enrolled by Source</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="source" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="leads" name="Leads" fill="#4D7CFF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="enrolled" name="Enrolled" fill="#00FFA3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Lead Source Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

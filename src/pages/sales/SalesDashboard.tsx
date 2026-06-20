import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Target, UserCheck, TrendingUp, Clock, ArrowRight, Plus } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const sourceData = [
  { name: 'Referral', value: 35, color: '#4D7CFF' },
  { name: 'Google Ads', value: 25, color: '#7B61FF' },
  { name: 'Social Media', value: 20, color: '#00FFA3' },
  { name: 'Walk-in', value: 12, color: '#FF6B7A' },
  { name: 'WhatsApp', value: 8, color: '#C6FF00' },
]

const weeklyLeads = [
  { day: 'Mon', leads: 3 }, { day: 'Tue', leads: 5 }, { day: 'Wed', leads: 2 },
  { day: 'Thu', leads: 7 }, { day: 'Fri', leads: 4 }, { day: 'Sat', leads: 6 }, { day: 'Sun', leads: 1 },
]

const STATUS_STEPS = ['new', 'contacted', 'trial_scheduled', 'trial_done', 'enrolled']

export default function SalesDashboard() {
  const { leads } = useAppStore()

  const newLeads = leads.filter((l) => l.status === 'new').length
  const trialScheduled = leads.filter((l) => l.status === 'trial_scheduled').length
  const enrolled = leads.filter((l) => l.status === 'enrolled').length
  const conversionRate = leads.length > 0 ? Math.round((enrolled / leads.length) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions Command Centre"
        subtitle="Track leads, trials, and enrolments"
        badge={<DemoBadge />}
        actions={
          <Link to="/sales/leads" className="btn-primary">
            <Plus size={16} /> Add Lead
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New Leads" value={newLeads} icon={<Target size={18} />} color="#4D7CFF" demo={false} />
        <StatCard label="Trials Scheduled" value={trialScheduled} icon={<Clock size={18} />} color="#7B61FF" demo={false} />
        <StatCard label="Enrolled" value={enrolled} icon={<UserCheck size={18} />} color="#00FFA3" demo={false} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp size={18} />} color="#C6FF00" demo={false} sub={`${leads.length} total leads`} />
      </div>

      {/* Funnel */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Lead Funnel</h3>
          <DemoBadge />
        </div>
        <div className="flex items-end gap-2 h-32">
          {STATUS_STEPS.map((step, idx) => {
            const count = leads.filter((l) => l.status === step || (step === 'enrolled' && l.status === 'enrolled')).length
            const maxCount = Math.max(...STATUS_STEPS.map((s) => leads.filter((l) => l.status === s).length), 1)
            const height = Math.max((count / maxCount) * 100, 8)
            const colors = ['#4D7CFF', '#7B61FF', '#00F0FF', '#C6FF00', '#00FFA3']
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg transition-all" style={{ height: `${height}%`, background: colors[idx], opacity: 0.8 + idx * 0.04 }} />
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{step.replace('_', ' ')}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead sources */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Lead Sources</h3>
            <DemoBadge />
          </div>
          <div className="flex items-center gap-6">
            <PieChart width={130} height={130}>
              <Pie data={sourceData} cx={65} cy={65} innerRadius={40} outerRadius={62} dataKey="value" strokeWidth={0}>
                {sourceData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2 flex-1">
              {sourceData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly leads chart */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Leads This Week</h3>
            <DemoBadge />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyLeads}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2940', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="leads" fill="#4D7CFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent leads */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Leads</h3>
          <Link to="/sales/leads" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            <thead><tr><th>Student</th><th>Parent</th><th>Curriculum</th><th>Source</th><th>Status</th><th>Follow-up</th></tr></thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={lead.studentName} size="xs" />
                      <span className="font-medium text-foreground">{lead.studentName}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{lead.parentName}</td>
                  <td><span className="badge-info">{lead.curriculum}</span></td>
                  <td className="text-muted-foreground capitalize text-xs">{lead.source.replace('_', ' ')}</td>
                  <td><span className={getStatusColor(lead.status)}>{lead.status.replace('_', ' ')}</span></td>
                  <td className="text-muted-foreground text-xs">{lead.followUpDate ? formatDate(lead.followUpDate) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useAppStore } from '@/store/appStore'
import { StatCard } from '@/components/ui/StatCard'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate, getStatusColor, getLastNMonths } from '@/lib/utils'
import {
  Building2, GraduationCap, DollarSign,
  AlertCircle, ArrowRight, Zap, UserPlus, ClipboardPlus, BarChart3
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Link } from 'react-router-dom'

// Demo split across all 8 active programmes — combines the academic Curriculum
// field with enrichment ProgrammeType, which aren't a shared denominator in the
// real data model, so this chart is explicitly demo (see DemoBadge) rather than
// computed live like the other charts on this page.
const PROGRAMME_SPLIT = [
  { name: 'IGCSE', value: 35, color: '#4D7CFF' },
  { name: 'A-Level', value: 22, color: '#7B61FF' },
  { name: 'CBSE', value: 18, color: '#00FFA3' },
  { name: 'NEET/IIT-JEE', value: 8, color: '#FF6B7A' },
  { name: 'Robotics', value: 6, color: '#FBBF24' },
  { name: 'Brainobrain', value: 4, color: '#00F0FF' },
  { name: 'IELTS', value: 4, color: '#C6FF00' },
  { name: 'Oratory', value: 3, color: '#A78BFA' },
]

const QUICK_ACTIONS = [
  { label: 'Add Student', icon: <UserPlus size={14} />, to: '/super-admin/users?role=student' },
  { label: 'New Enquiry', icon: <ClipboardPlus size={14} />, to: '/super-admin/admissions' },
  { label: 'Run Report', icon: <BarChart3 size={14} />, to: '/super-admin/academics' },
  { label: 'Go Live Setup', icon: <Zap size={14} />, to: '/super-admin/go-live' },
]

export default function SuperAdminDashboard() {
  const { branches, students, teachers, invoices, leads, settings } = useAppStore()

  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0)

  const outstanding = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.totalAmount, 0)

  const activeStudents = students.filter((s) => s.status === 'active').length

  // Revenue vs target, computed from real paid invoices over a rolling 6-month window
  const last6Months = getLastNMonths(6)
  const monthMap: Record<string, number> = {}
  last6Months.forEach((m) => { monthMap[m.key] = 0 })
  invoices.filter((i) => i.status === 'paid').forEach((i) => {
    const d = new Date(i.paidDate || i.issuedDate)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (key in monthMap) monthMap[key] += i.totalAmount
  })
  const revenueData = last6Months.map((m) => ({
    month: m.label,
    revenue: monthMap[m.key],
    target: Math.round(monthMap[m.key] * 1.1),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Overview"
        subtitle={`${settings.companyName} · ${settings.academicYear}`}
        badge={<DemoBadge />}
        actions={
          !settings.isLive && (
            <Link to="/super-admin/go-live" className="btn-primary">
              <Zap size={15} />
              Go Live Setup
            </Link>
          )
        }
      />

      {/* Quick Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="btn-ghost border border-dark-border text-sm py-2"
          >
            {a.icon} {a.label}
          </Link>
        ))}
      </div>

      {/* Go Live Alert */}
      {!settings.isLive && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#C6FF00]/5 border border-[#C6FF00]/20">
          <AlertCircle size={18} className="text-[#C6FF00] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#C6FF00]">Platform is in Demo Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">Complete the Go Live Setup to connect real payment gateways, email providers, and AI APIs.</p>
          </div>
          <Link to="/super-admin/go-live" className="text-xs text-[#C6FF00] font-semibold hover:underline whitespace-nowrap flex items-center gap-1">
            Setup now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={activeStudents}
          icon={<GraduationCap size={18} />}
          color="#4D7CFF"
          change={8}
          changeLabel="vs last month"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={18} />}
          color="#00FFA3"
          change={12}
          changeLabel="vs last month"
        />
        <StatCard
          label="Branches"
          value={branches.filter((b) => b.isActive).length}
          icon={<Building2 size={18} />}
          color="#7B61FF"
          demo={false}
          change={0}
          changeLabel="vs last month"
        />
        <StatCard
          label="Outstanding Fees"
          value={formatCurrency(outstanding)}
          icon={<AlertCircle size={18} />}
          color="#FF6B7A"
          change={-5}
          changeLabel="vs last month (improving)"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 plato-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue vs Target</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months (AED)</p>
            </div>
            <DemoBadge />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4D7CFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4D7CFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7B61FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1E2940', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`AED ${v.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4D7CFF" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="target" stroke="#7B61FF" strokeWidth={2} strokeDasharray="4 4" fill="url(#targetGrad)" name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Programme split */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Programme Split</h3>
            <DemoBadge />
          </div>
          <div className="flex justify-center">
            <PieChart width={160} height={160}>
              <Pie data={PROGRAMME_SPLIT} cx={80} cy={80} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {PROGRAMME_SPLIT.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1E2940', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number, name: string) => [`${v}%`, name]}
              />
            </PieChart>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {PROGRAMME_SPLIT.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-[11px] text-muted-foreground truncate">{c.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-foreground flex-shrink-0">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch performance */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Branch Performance</h3>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const branchStudents = students.filter((s) => s.branchId === branch.id && s.status === 'active').length
            const branchTeachers = teachers.filter((t) => t.branchId === branch.id && t.isActive).length
            const branchInvoices = invoices.filter((i) => i.branchId === branch.id && i.status === 'paid')
            const branchRevenue = branchInvoices.reduce((sum, i) => sum + i.totalAmount, 0)
            const capacity = branch.capacity > 0 ? Math.round((branchStudents / branch.capacity) * 100) : 0

            return (
              <div key={branch.id} className="p-4 rounded-xl bg-white/3 border border-dark-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">{branch.city}, {branch.country}</p>
                  </div>
                  <span className={branch.isActive ? 'badge-success' : 'badge-danger'}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-semibold text-foreground">{branchStudents}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Teachers</span>
                    <span className="font-semibold text-foreground">{branchTeachers}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Revenue (paid)</span>
                    <span className="font-semibold text-[#00FFA3]">{formatCurrency(branchRevenue)}</span>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="text-foreground">{capacity}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${capacity}%`,
                          background: capacity > 80 ? '#FF6B7A' : capacity > 60 ? '#C6FF00' : '#4D7CFF',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent leads */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Leads</h3>
          <Link to="/super-admin/admissions" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Parent</th>
                <th>Curriculum</th>
                <th>Source</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="hover:bg-white/3 transition-colors">
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={lead.studentName} size="sm" />
                      <span className="font-medium text-foreground">{lead.studentName}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{lead.parentName}</td>
                  <td>
                    <span className="badge-info">{lead.curriculum}</span>
                  </td>
                  <td className="text-muted-foreground capitalize">{lead.source.replace('_', ' ')}</td>
                  <td>
                    <span className={getStatusColor(lead.status)}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

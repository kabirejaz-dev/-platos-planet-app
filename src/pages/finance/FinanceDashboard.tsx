import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { DollarSign, AlertCircle, TrendingUp, FileText, ArrowRight, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const monthlyData = [
  { month: 'Jan', collected: 48000, outstanding: 8000 },
  { month: 'Feb', collected: 52000, outstanding: 6500 },
  { month: 'Mar', collected: 61000, outstanding: 9000 },
  { month: 'Apr', collected: 55000, outstanding: 7200 },
  { month: 'May', collected: 67000, outstanding: 5800 },
  { month: 'Jun', collected: 72000, outstanding: 11000 },
]

export default function FinanceDashboard() {
  const { invoices, students, settings } = useAppStore()

  const totalCollected = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0)
  const totalOutstanding = invoices.filter((i) => ['pending', 'overdue'].includes(i.status)).reduce((s, i) => s + i.totalAmount, 0)
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length
  const collectionRate = invoices.length > 0 ? Math.round((invoices.filter((i) => i.status === 'paid').length / invoices.length) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Command Centre"
        subtitle={`${settings.currency} · ${settings.academicYear}`}
        badge={<DemoBadge />}
        actions={
          <Link to="/finance/invoices" className="btn-primary">
            <FileText size={16} /> Create Invoice
          </Link>
        }
      />

      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FF6B7A]/5 border border-[#FF6B7A]/20">
          <AlertCircle size={18} className="text-[#FF6B7A] flex-shrink-0" />
          <p className="text-sm text-[#FF6B7A] font-medium">{overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} requiring immediate follow-up.</p>
          <Link to="/finance/outstanding" className="ml-auto text-xs text-[#FF6B7A] hover:underline flex items-center gap-1 whitespace-nowrap">View <ArrowRight size={12} /></Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Collected" value={formatCurrency(totalCollected, settings.currency)} icon={<CheckCircle2 size={18} />} color="#00FFA3" />
        <StatCard label="Outstanding" value={formatCurrency(totalOutstanding, settings.currency)} icon={<AlertCircle size={18} />} color="#FF6B7A" />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} icon={<TrendingUp size={18} />} color="#4D7CFF" sub={`${invoices.filter((i) => i.status === 'paid').length} of ${invoices.length} invoices`} />
        <StatCard label="Overdue" value={overdueCount} icon={<AlertCircle size={18} />} color="#FF6B7A" demo={false} />
      </div>

      {/* Monthly chart */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Monthly Collections</h3>
            <p className="text-xs text-muted-foreground">Collected vs Outstanding</p>
          </div>
          <DemoBadge />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2940', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`AED ${v.toLocaleString()}`, '']} />
            <Bar dataKey="collected" fill="#00FFA3" radius={[4, 4, 0, 0]} name="Collected" />
            <Bar dataKey="outstanding" fill="#FF6B7A" radius={[4, 4, 0, 0]} name="Outstanding" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Invoices table */}
      <div className="plato-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Invoices</h3>
          <Link to="/finance/invoices" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            <thead><tr><th>Invoice</th><th>Student</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.map((inv) => {
                const student = students.find((s) => s.id === inv.studentId)
                return (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-[#4D7CFF]">{inv.invoiceNumber}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {student && <Avatar name={student.name} size="xs" />}
                        <span className="text-sm text-foreground">{student?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-foreground">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                    <td><span className={getStatusColor(inv.status)}>{inv.status}</span></td>
                    <td className="text-muted-foreground text-sm">{formatDate(inv.dueDate)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {inv.status !== 'paid' && (
                          <Link to="/finance/collection" className="text-xs px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20 transition-colors">
                            Record Payment
                          </Link>
                        )}
                        <button className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

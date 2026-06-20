import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate, getStatusColor, getLastNMonths } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { AlertCircle, TrendingUp, FileText, ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CreateInvoiceModal } from '@/components/finance/CreateInvoiceModal'
import { RecordPaymentModal } from '@/components/finance/RecordPaymentModal'
import { InvoiceDetailModal } from '@/components/finance/InvoiceDetailModal'

export default function FinanceDashboard() {
  const { invoices, students, settings } = useAppStore()
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [recordPaymentFor, setRecordPaymentFor] = useState<string | null>(null)
  const [viewInvoiceFor, setViewInvoiceFor] = useState<string | null>(null)

  const totalCollected = invoices.reduce((s, i) => s + (i.status === 'paid' ? i.totalAmount : i.paidAmount || 0), 0)
  const totalOutstanding = invoices.reduce((s, i) => {
    if (i.status === 'pending' || i.status === 'overdue') return s + i.totalAmount
    if (i.status === 'partial') return s + (i.totalAmount - (i.paidAmount || 0))
    return s
  }, 0)
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length
  const collectionRate = invoices.length > 0 ? Math.round((invoices.filter((i) => i.status === 'paid').length / invoices.length) * 100) : 0

  // Monthly collections, computed from real invoices over a rolling 6-month window
  const last6Months = getLastNMonths(6)
  const monthMap: Record<string, { collected: number; outstanding: number }> = {}
  last6Months.forEach((m) => { monthMap[m.key] = { collected: 0, outstanding: 0 } })
  invoices.forEach((i) => {
    const d = new Date(i.status === 'paid' ? (i.paidDate || i.issuedDate) : i.issuedDate)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!(key in monthMap)) return
    if (i.status === 'paid') monthMap[key].collected += i.totalAmount
    else monthMap[key].outstanding += i.totalAmount
  })
  const monthlyData = last6Months.map((m) => ({ month: m.label, ...monthMap[m.key] }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Command Centre"
        subtitle={`${settings.currency} · ${settings.academicYear}`}
        badge={<DemoBadge />}
        actions={
          <button className="btn-primary" onClick={() => setShowCreateInvoice(true)}>
            <FileText size={16} /> Create Invoice
          </button>
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

      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-dark-border/50">
        <Info size={15} className="text-muted-foreground flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Looking for sibling/multi-child discounts? Those are reviewed and approved by the Sales & Admissions team under Scholarships, not in this module.
        </p>
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
                          <button
                            onClick={() => setRecordPaymentFor(inv.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20 transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                        <button
                          onClick={() => setViewInvoiceFor(inv.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                        >
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

      <CreateInvoiceModal open={showCreateInvoice} onClose={() => setShowCreateInvoice(false)} />

      {recordPaymentFor && (
        <RecordPaymentModal open onClose={() => setRecordPaymentFor(null)} invoiceId={recordPaymentFor} />
      )}

      {viewInvoiceFor && (
        <InvoiceDetailModal
          open
          onClose={() => setViewInvoiceFor(null)}
          invoiceId={viewInvoiceFor}
          onRecordPayment={() => { setRecordPaymentFor(viewInvoiceFor); setViewInvoiceFor(null) }}
        />
      )}
    </div>
  )
}

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
  const { invoices, students, branches, settings } = useAppStore()
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [recordPaymentFor, setRecordPaymentFor] = useState<string | null>(null)
  const [viewInvoiceFor, setViewInvoiceFor] = useState<string | null>(null)
  const [summaryTab, setSummaryTab] = useState<'branch' | 'programme'>('branch')

  const collectedAmount = (i: typeof invoices[number]) => (i.status === 'paid' ? i.totalAmount : i.paidAmount || 0)

  const totalCollected = invoices.reduce((s, i) => s + collectedAmount(i), 0)
  const totalOutstanding = invoices.reduce((s, i) => {
    if (i.status === 'pending' || i.status === 'overdue') return s + i.totalAmount
    if (i.status === 'partial') return s + (i.totalAmount - (i.paidAmount || 0))
    return s
  }, 0)
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length
  const collectionRate = invoices.length > 0 ? Math.round((invoices.filter((i) => i.status === 'paid').length / invoices.length) * 100) : 0

  // Monthly collections, computed from real invoices over a rolling 6-month window.
  // Collected is bucketed by the actual payment date (itemized payment history where it
  // exists; legacy fully-paid invoices with no history fall back to a single paidDate entry).
  // Outstanding is the remaining unpaid balance, bucketed by the invoice's due month.
  const last6Months = getLastNMonths(6)
  const monthMap: Record<string, { collected: number; outstanding: number }> = {}
  last6Months.forEach((m) => { monthMap[m.key] = { collected: 0, outstanding: 0 } })
  invoices.forEach((inv) => {
    const payments = inv.paymentHistory && inv.paymentHistory.length > 0
      ? inv.paymentHistory
      : (inv.status === 'paid' && inv.paidDate ? [{ date: inv.paidDate, amount: inv.totalAmount }] : [])
    payments.forEach((pmt) => {
      const d = new Date(pmt.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key in monthMap) monthMap[key].collected += pmt.amount
    })

    const remaining = inv.status === 'paid' ? 0 : inv.totalAmount - (inv.paidAmount || 0)
    if (remaining > 0) {
      const d = new Date(inv.dueDate)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key in monthMap) monthMap[key].outstanding += remaining
    }
  })
  const monthlyData = last6Months.map((m) => ({ month: m.label, ...monthMap[m.key] }))
  const highestMonth = monthlyData.reduce((max, m) => (m.collected > max.collected ? m : max), monthlyData[0])
  const currentMonth = monthlyData[monthlyData.length - 1]
  const currentMonthDue = currentMonth ? currentMonth.collected + currentMonth.outstanding : 0
  const currentMonthRate = currentMonthDue > 0 ? Math.round((currentMonth.collected / currentMonthDue) * 100) : 0

  const branchSummary = branches
    .map((b) => {
      const bInvoices = invoices.filter((i) => i.branchId === b.id)
      const invoiced = bInvoices.reduce((s, i) => s + i.totalAmount, 0)
      const collected = bInvoices.reduce((s, i) => s + collectedAmount(i), 0)
      return { key: b.id, label: b.name, invoiced, collected, outstanding: invoiced - collected, rate: invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0 }
    })
    .filter((r) => r.invoiced > 0)

  const programmeSummary = Array.from(new Set(students.map((s) => s.curriculum)))
    .map((curriculum) => {
      const studentIds = new Set(students.filter((s) => s.curriculum === curriculum).map((s) => s.id))
      const pInvoices = invoices.filter((i) => studentIds.has(i.studentId))
      const invoiced = pInvoices.reduce((s, i) => s + i.totalAmount, 0)
      const collected = pInvoices.reduce((s, i) => s + collectedAmount(i), 0)
      const billedStudents = new Set(pInvoices.map((i) => i.studentId)).size
      return { key: curriculum, label: curriculum, students: billedStudents, invoiced, collected, outstanding: invoiced - collected }
    })
    .filter((r) => r.invoiced > 0)

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
        {highestMonth && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-muted-foreground">
            <p>Highest collection month: <span className="text-foreground font-semibold">{highestMonth.month}</span> — {formatCurrency(highestMonth.collected, settings.currency)}</p>
            <p>Current month collection rate: <span className="text-foreground font-semibold">{currentMonthRate}%</span></p>
          </div>
        )}
      </div>

      {/* By Branch / By Programme */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Collection Summary</h3>
          <div className="flex gap-1 p-1 bg-white/5 border border-dark-border rounded-xl w-fit">
            {(['branch', 'programme'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSummaryTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${summaryTab === t ? 'bg-[#4D7CFF] text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t === 'branch' ? 'By Branch' : 'By Programme'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            {summaryTab === 'branch' ? (
              <>
                <thead><tr><th>Branch</th><th>Invoiced (AED)</th><th>Collected (AED)</th><th>Outstanding (AED)</th><th>Rate %</th></tr></thead>
                <tbody>
                  {branchSummary.map((r) => (
                    <tr key={r.key}>
                      <td className="text-sm font-medium text-foreground">{r.label}</td>
                      <td className="text-sm text-foreground">{formatCurrency(r.invoiced, settings.currency)}</td>
                      <td className="text-sm text-[#00FFA3]">{formatCurrency(r.collected, settings.currency)}</td>
                      <td className="text-sm text-[#FF6B7A]">{formatCurrency(r.outstanding, settings.currency)}</td>
                      <td className="text-sm text-foreground">{r.rate}%</td>
                    </tr>
                  ))}
                  {branchSummary.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No invoiced branches yet.</td></tr>}
                </tbody>
              </>
            ) : (
              <>
                <thead><tr><th>Programme</th><th>Students</th><th>Invoiced (AED)</th><th>Collected (AED)</th><th>Outstanding (AED)</th></tr></thead>
                <tbody>
                  {programmeSummary.map((r) => (
                    <tr key={r.key}>
                      <td className="text-sm font-medium text-foreground">{r.label}</td>
                      <td className="text-sm text-muted-foreground">{r.students}</td>
                      <td className="text-sm text-foreground">{formatCurrency(r.invoiced, settings.currency)}</td>
                      <td className="text-sm text-[#00FFA3]">{formatCurrency(r.collected, settings.currency)}</td>
                      <td className="text-sm text-[#FF6B7A]">{formatCurrency(r.outstanding, settings.currency)}</td>
                    </tr>
                  ))}
                  {programmeSummary.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No invoiced programmes yet.</td></tr>}
                </tbody>
              </>
            )}
          </table>
        </div>
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

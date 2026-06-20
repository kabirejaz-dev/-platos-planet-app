import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate, getStatusColor, getLastNMonths } from '@/lib/utils'
import { Wallet, CheckCircle2, Clock, AlertTriangle, DollarSign, MessageCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RecordPaymentModal } from '@/components/finance/RecordPaymentModal'
import { SendReminderModal } from '@/components/finance/SendReminderModal'

export default function FeeOverviewPage() {
  const { currentUser, invoices, students } = useAppStore()
  const [recordPaymentFor, setRecordPaymentFor] = useState<string | null>(null)
  const [reminderFor, setReminderFor] = useState<string | null>(null)

  const branchInvoices = invoices.filter((i) => !currentUser?.branchId || i.branchId === currentUser.branchId)
  const collected = branchInvoices.reduce((s, i) => s + (i.status === 'paid' ? i.totalAmount : i.paidAmount || 0), 0)
  const pending = branchInvoices.filter((i) => i.status === 'pending').reduce((s, i) => s + i.totalAmount, 0)
  const overdue = branchInvoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + (i.totalAmount - (i.paidAmount || 0)), 0)
  const total = branchInvoices.reduce((s, i) => s + i.totalAmount, 0)

  const last6Months = getLastNMonths(6)
  const monthMap: Record<string, { collected: number; outstanding: number }> = {}
  last6Months.forEach((m) => { monthMap[m.key] = { collected: 0, outstanding: 0 } })
  branchInvoices.forEach((inv) => {
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

  const sorted = [...branchInvoices].sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())
  const overdueInvoices = branchInvoices.filter((i) => i.status === 'overdue')

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Overview" subtitle="Outstanding, collected, and overdue fees for students in this branch" badge={<DemoBadge />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="plato-card p-4 text-center">
          <Wallet size={18} className="mx-auto mb-2 text-white/30" />
          <p className="text-[18px] font-bold font-display text-white/85">{formatCurrency(total)}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Invoiced</p>
        </div>
        <div className="plato-card p-4 text-center">
          <CheckCircle2 size={18} className="mx-auto mb-2 text-[#00FFA3]" />
          <p className="text-[18px] font-bold font-display text-[#00FFA3]">{formatCurrency(collected)}</p>
          <p className="text-[11px] text-white/30 mt-1">Collected</p>
        </div>
        <div className="plato-card p-4 text-center">
          <Clock size={18} className="mx-auto mb-2 text-[#FBBF24]" />
          <p className="text-[18px] font-bold font-display text-[#FBBF24]">{formatCurrency(pending)}</p>
          <p className="text-[11px] text-white/30 mt-1">Pending</p>
        </div>
        <div className="plato-card p-4 text-center">
          <AlertTriangle size={18} className="mx-auto mb-2 text-[#FF6B7A]" />
          <p className="text-[18px] font-bold font-display text-[#FF6B7A]">{formatCurrency(overdue)}</p>
          <p className="text-[11px] text-white/30 mt-1">Overdue</p>
        </div>
      </div>

      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Monthly Collections</h3>
            <p className="text-xs text-muted-foreground">Collected vs Outstanding · this branch</p>
          </div>
          <DemoBadge />
        </div>
        <ResponsiveContainer width="100%" height={200}>
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

      <div className="plato-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-white/70">All Invoices</h3>
        </div>
        <table className="w-full plato-table">
          <thead><tr><th>Student</th><th>Invoice #</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {sorted.map((inv) => {
              const student = students.find((s) => s.id === inv.studentId)
              const isOverdue = inv.status === 'overdue'
              return (
                <tr key={inv.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {student && <Avatar name={student.name} size="xs" />}
                      <p className="font-medium text-[13px] text-white/85">{student?.name || 'Unknown'}</p>
                    </div>
                  </td>
                  <td className="text-[12px] text-white/40">{inv.invoiceNumber}</td>
                  <td className="text-[13px] font-semibold text-white/80">{formatCurrency(inv.totalAmount)}</td>
                  <td className="text-[12px] text-white/40">{formatDate(inv.dueDate)}</td>
                  <td><span className={getStatusColor(inv.status)}>{inv.status}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => setRecordPaymentFor(inv.id)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20 flex items-center gap-1"
                        >
                          <DollarSign size={11} /> Record
                        </button>
                      )}
                      {isOverdue && (
                        <button
                          onClick={() => setReminderFor(inv.id)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-dark-border text-white/50 hover:text-white/80 flex items-center gap-1"
                        >
                          <MessageCircle size={11} /> Remind
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-white/30">No invoices for this branch yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {overdueInvoices.length > 0 && (
        <p className="text-[11px] text-white/30 text-right">{overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} in this branch</p>
      )}

      {recordPaymentFor && (
        <RecordPaymentModal open onClose={() => setRecordPaymentFor(null)} invoiceId={recordPaymentFor} />
      )}

      {reminderFor && (
        <SendReminderModal open onClose={() => setReminderFor(null)} invoiceId={reminderFor} />
      )}
    </div>
  )
}

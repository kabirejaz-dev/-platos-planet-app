import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatDate, formatCurrency, generateId } from '@/lib/utils'
import { AlertCircle, Clock, CheckCircle2, X, DollarSign, Send } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'
import type { Invoice } from '@/types'

export default function OutstandingFeesPage() {
  const { invoices, students, parents, currentUser, updateInvoice, addMessage } = useAppStore()
  const [markingPaid, setMarkingPaid] = useState<Invoice | null>(null)
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash')

  const outstanding = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1
      if (b.status === 'overdue' && a.status !== 'overdue') return 1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  const totalOutstanding = outstanding.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const overdueCount = outstanding.filter((i) => i.status === 'overdue').length
  const overdueTotalAmount = outstanding
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.totalAmount, 0)

  const currency = outstanding[0]?.currency ?? 'AED'

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? 'Unknown'
  const daysOverdue = (dueDate: string) => Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)

  const handleMarkPaid = () => {
    if (!markingPaid) return
    updateInvoice(markingPaid.id, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
    })
    toast.success('Payment recorded', `${getStudentName(markingPaid.studentId)} · ${formatCurrency(markingPaid.totalAmount, markingPaid.currency)} via ${method}`)
    setMarkingPaid(null)
  }

  const overdueInvoices = outstanding.filter((i) => i.status === 'overdue')

  const handleSendReminders = () => {
    if (!currentUser) return
    let sent = 0
    overdueInvoices.forEach((inv) => {
      const parent = parents.find((p) => p.id === inv.parentId)
      if (!parent?.userId) return
      addMessage({
        id: `msg-${generateId()}`,
        fromId: currentUser.id,
        toId: parent.userId,
        subject: `Invoice ${inv.invoiceNumber} — Payment Reminder`,
        body: `Dear ${parent.name}, invoice ${inv.invoiceNumber} for ${formatCurrency(inv.totalAmount, inv.currency)} is now ${daysOverdue(inv.dueDate)} days overdue. Please settle at your earliest convenience.`,
        isRead: false,
        sentAt: new Date().toISOString(),
        type: 'alert',
      })
      sent++
    })
    toast.success('Reminders sent', `${sent} overdue payment reminder${sent === 1 ? '' : 's'} sent to parents.`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Outstanding Fees"
        subtitle="Pending and overdue invoices"
        badge={<DemoBadge />}
        actions={
          <button className="btn-primary" disabled={overdueInvoices.length === 0} onClick={handleSendReminders}>
            <Send size={14} /> Send Reminders to All Overdue ({overdueInvoices.length})
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Outstanding', value: formatCurrency(totalOutstanding, currency), color: '#FF6B7A' },
          { label: 'Overdue Amount', value: formatCurrency(overdueTotalAmount, currency), color: '#FF6B7A' },
          { label: 'Overdue Invoices', value: overdueCount, color: overdueCount > 0 ? '#FF6B7A' : '#00FFA3' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[20px] font-bold font-display leading-tight" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="plato-card overflow-hidden">
        <table className="plato-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Student</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {outstanding.map((inv) => {
              const overdue = daysOverdue(inv.dueDate)
              const isOverdue = inv.status === 'overdue'
              return (
                <tr key={inv.id}>
                  <td className="text-white/70 font-mono text-[12px]">{inv.invoiceNumber}</td>
                  <td className="text-white/80 text-[13px] font-medium">{getStudentName(inv.studentId)}</td>
                  <td className="text-white/50 text-[12px]">{formatDate(inv.dueDate)}</td>
                  <td>
                    {overdue > 0 ? (
                      <span className="text-[12px] font-semibold" style={{ color: overdue > 30 ? '#FF6B7A' : '#FBBF24' }}>
                        {overdue}d
                      </span>
                    ) : (
                      <span className="text-[12px] text-white/30">—</span>
                    )}
                  </td>
                  <td className="font-bold text-[13px]" style={{ color: isOverdue ? '#FF6B7A' : '#FBBF24' }}>
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </td>
                  <td>
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit"
                      style={{
                        background: isOverdue ? 'rgba(255,107,122,0.1)' : 'rgba(251,191,36,0.1)',
                        color: isOverdue ? '#FF6B7A' : '#FBBF24',
                      }}
                    >
                      {isOverdue ? <AlertCircle size={11} /> : <Clock size={11} />}
                      {isOverdue ? 'Overdue' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-primary text-[11px] py-1 px-3"
                      onClick={() => setMarkingPaid(inv)}
                    >
                      <DollarSign size={12} /> Record
                    </button>
                  </td>
                </tr>
              )
            })}
            {outstanding.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-white/30">
                  <CheckCircle2 size={28} className="mx-auto mb-2 text-[#00FFA3]" />
                  No outstanding fees — all invoices are settled!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mark paid modal */}
      {markingPaid && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMarkingPaid(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 className="text-[14px] font-bold text-white font-display">Record Payment</h3>
                <button onClick={() => setMarkingPaid(null)} className="text-white/30 hover:text-white/70">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-[12px] text-white/40">{markingPaid.invoiceNumber}</p>
                  <p className="text-[16px] font-bold text-white">{getStudentName(markingPaid.studentId)}</p>
                  <p className="text-[20px] font-bold text-[#00FFA3] font-display mt-1">
                    {formatCurrency(markingPaid.totalAmount, markingPaid.currency)}
                  </p>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-white/50 mb-1.5">Payment Method</label>
                  <select className="plato-input" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div
                className="flex gap-3 px-5 py-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button className="btn-ghost flex-1 justify-center" onClick={() => setMarkingPaid(null)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleMarkPaid}>
                  <CheckCircle2 size={14} /> Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

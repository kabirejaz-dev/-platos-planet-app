import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDate, formatCurrency, generateId } from '@/lib/utils'
import { AlertCircle, Clock, CheckCircle2, DollarSign, Send, MessageCircle } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'
import { RecordPaymentModal } from '@/components/finance/RecordPaymentModal'
import { SendReminderModal } from '@/components/finance/SendReminderModal'

export default function OutstandingFeesPage() {
  const { invoices, students, parents, currentUser, addMessage } = useAppStore()
  const [recordPaymentFor, setRecordPaymentFor] = useState<string | null>(null)
  const [reminderFor, setReminderFor] = useState<string | null>(null)

  const outstanding = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue' || inv.status === 'partial')
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1
      if (b.status === 'overdue' && a.status !== 'overdue') return 1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  const totalOutstanding = outstanding.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0)
  const overdueCount = outstanding.filter((i) => i.status === 'overdue').length
  const overdueTotalAmount = outstanding
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + (i.totalAmount - (i.paidAmount || 0)), 0)

  const currency = outstanding[0]?.currency ?? 'AED'

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? 'Unknown'
  const daysOverdue = (dueDate: string) => Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)

  const overdueInvoices = outstanding.filter((i) => i.status === 'overdue')

  const agingBuckets = [
    { label: 'Current (0–30 days)', test: (d: number) => d <= 30, color: '#00FFA3' },
    { label: '31–60 days', test: (d: number) => d > 30 && d <= 60, color: '#FBBF24' },
    { label: '61–90 days', test: (d: number) => d > 60 && d <= 90, color: '#FF9500' },
    { label: '90+ days', test: (d: number) => d > 90, color: '#FF6B7A' },
  ].map((bucket) => {
    const matching = outstanding.filter((inv) => bucket.test(Math.max(0, daysOverdue(inv.dueDate))))
    const amount = matching.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0)
    return { ...bucket, count: matching.length, amount }
  })
  const agingMax = Math.max(1, ...agingBuckets.map((b) => b.amount))

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
        body: `Dear ${parent.name}, invoice ${inv.invoiceNumber} for ${formatCurrency(inv.totalAmount - (inv.paidAmount || 0), inv.currency)} is now ${daysOverdue(inv.dueDate)} days overdue. Please settle at your earliest convenience.`,
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

      {/* Aging summary */}
      <div className="plato-card p-4">
        <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest mb-3">Aging Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {agingBuckets.map((b) => (
            <div key={b.label} className="space-y-1.5">
              <p className="text-[11px] text-white/40">{b.label}</p>
              <p className="text-[14px] font-bold" style={{ color: b.amount > 0 ? b.color : 'rgba(255,255,255,0.3)' }}>
                {formatCurrency(b.amount, currency)}
              </p>
              <p className="text-[10px] text-white/30">{b.count} invoice{b.count === 1 ? '' : 's'}</p>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(b.amount / agingMax) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div className="plato-card overflow-hidden">
        <div className="overflow-x-auto">
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
              const isPartial = inv.status === 'partial'
              const paidPct = isPartial ? Math.round(((inv.paidAmount || 0) / inv.totalAmount) * 100) : 0
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
                  <td className="font-bold text-[13px]" style={{ color: isOverdue ? '#FF6B7A' : '#FBBF24', minWidth: 140 }}>
                    {formatCurrency(inv.totalAmount, inv.currency)}
                    {isPartial && (
                      <div className="mt-1">
                        <p className="text-[10px] font-normal text-white/40">
                          {formatCurrency(inv.paidAmount || 0, inv.currency)} / {formatCurrency(inv.totalAmount, inv.currency)} paid
                        </p>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
                          <div className="h-full rounded-full" style={{ width: `${paidPct}%`, background: '#FBBF24' }} />
                        </div>
                      </div>
                    )}
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
                      {isOverdue ? 'Overdue' : isPartial ? 'Partial' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-primary text-[11px] py-1 px-3"
                        onClick={() => setRecordPaymentFor(inv.id)}
                      >
                        <DollarSign size={12} /> Record
                      </button>
                      {isOverdue && (
                        <button
                          className="text-[11px] py-1 px-3 rounded-lg border border-dark-border text-white/50 hover:text-white/80 flex items-center gap-1"
                          onClick={() => setReminderFor(inv.id)}
                        >
                          <MessageCircle size={12} /> Remind
                        </button>
                      )}
                    </div>
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
      </div>

      {recordPaymentFor && (
        <RecordPaymentModal open onClose={() => setRecordPaymentFor(null)} invoiceId={recordPaymentFor} />
      )}

      {reminderFor && (
        <SendReminderModal open onClose={() => setReminderFor(null)} invoiceId={reminderFor} />
      )}
    </div>
  )
}

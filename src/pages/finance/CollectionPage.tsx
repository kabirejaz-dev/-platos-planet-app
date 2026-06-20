import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CreditCard, Search, DollarSign, Download, Printer } from 'lucide-react'
import { RecordPaymentModal } from '@/components/finance/RecordPaymentModal'
import { printPaymentReceipt } from '@/lib/receipt'
import type { Invoice } from '@/types'

type QuickRange = 'today' | 'week' | 'month' | 'custom'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function rangeFor(quick: QuickRange, customStart: string, customEnd: string) {
  const today = new Date()
  const end = todayStr()
  if (quick === 'today') return { start: end, end }
  if (quick === 'week') {
    const d = new Date(today)
    d.setDate(d.getDate() - d.getDay())
    return { start: d.toISOString().split('T')[0], end }
  }
  if (quick === 'month') {
    const d = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start: d.toISOString().split('T')[0], end }
  }
  return { start: customStart || end, end: customEnd || end }
}

export default function CollectionPage() {
  const { invoices, students, branches, settings } = useAppStore()
  const [tab, setTab] = useState<'collect' | 'log'>('collect')
  const [search, setSearch] = useState('')
  const [recordPaymentFor, setRecordPaymentFor] = useState<string | null>(null)

  // ── Collect tab ──────────────────────────────────────────────────────────
  const outstanding = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue' || i.status === 'partial')
    .filter((i) => {
      if (!search) return true
      const student = students.find((s) => s.id === i.studentId)
      return student?.name.toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1
      if (b.status === 'overdue' && a.status !== 'overdue') return 1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  const totalOutstanding = outstanding.reduce((s, i) => s + (i.totalAmount - (i.paidAmount || 0)), 0)
  const overdue = outstanding.filter((i) => i.status === 'overdue')

  // ── Log tab ──────────────────────────────────────────────────────────────
  const [quick, setQuick] = useState<QuickRange>('month')
  const [customStart, setCustomStart] = useState(todayStr())
  const [customEnd, setCustomEnd] = useState(todayStr())
  const { start, end } = rangeFor(quick, customStart, customEnd)

  const allPayments = useMemo(() => {
    return invoices.flatMap((inv: Invoice) => {
      const history = inv.paymentHistory && inv.paymentHistory.length > 0
        ? inv.paymentHistory
        : (inv.status === 'paid' && inv.paidDate ? [{ date: inv.paidDate, amount: inv.totalAmount, method: inv.paymentMethod || 'cash', reference: undefined }] : [])
      let running = 0
      return history.map((p) => {
        const previouslyPaid = running
        running += p.amount
        return { invoice: inv, date: p.date, method: p.method, reference: p.reference, amount: p.amount, previouslyPaid }
      })
    })
  }, [invoices])

  const logEntries = allPayments
    .filter((p) => p.date >= start && p.date <= end)
    .sort((a, b) => b.date.localeCompare(a.date))

  const logSummary = logEntries.reduce(
    (acc, p) => {
      acc.total += p.amount
      acc.count++
      if (p.method === 'cash') acc.cash += p.amount
      else if (p.method === 'bank_transfer') acc.transfer += p.amount
      else if (p.method === 'card') acc.card += p.amount
      return acc
    },
    { total: 0, count: 0, cash: 0, transfer: 0, card: 0 }
  )

  const printLogReceipt = (entry: typeof allPayments[number]) => {
    const student = students.find((s) => s.id === entry.invoice.studentId)
    if (!student) return
    const branch = branches.find((b) => b.id === entry.invoice.branchId)
    printPaymentReceipt({
      settings, invoice: entry.invoice, student, branch,
      amountReceived: entry.amount, previouslyPaid: entry.previouslyPaid,
      paymentMethod: entry.method, reference: entry.reference, paymentDate: entry.date,
    })
  }

  const exportCsv = () => {
    const header = ['Date', 'StudentName', 'InvoiceNo', 'Programme', 'Branch', 'PaymentMethod', 'ReferenceNo', 'Amount', 'ReceiptNo']
    const rows = logEntries.map((p) => {
      const student = students.find((s) => s.id === p.invoice.studentId)
      const branch = branches.find((b) => b.id === p.invoice.branchId)
      return [
        p.date, student?.name || '', p.invoice.invoiceNumber, student?.curriculum || '', branch?.name || '',
        p.method, p.reference || '', String(p.amount), '',
      ]
    })
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fee-collection-${start}-to-${end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const quickLabel: Record<QuickRange, string> = { today: 'Today', week: 'This Week', month: 'This Month', custom: 'Custom' }

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Collection" subtitle="Collect outstanding fees and review the payment log" />

      <div className="flex gap-1 p-1 bg-white/5 border border-dark-border rounded-xl w-fit">
        {(['collect', 'log'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-[#4D7CFF] text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t === 'collect' ? 'Collect' : 'Collection Log'}
          </button>
        ))}
      </div>

      {tab === 'collect' ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="plato-card p-4 text-center">
              <p className="text-[24px] font-bold font-display text-[#FF6B7A]">{overdue.length}</p>
              <p className="text-[11px] text-white/30 mt-1">Overdue</p>
            </div>
            <div className="plato-card p-4 text-center">
              <p className="text-[24px] font-bold font-display text-[#FBBF24]">{outstanding.filter((i) => i.status === 'pending').length}</p>
              <p className="text-[11px] text-white/30 mt-1">Pending</p>
            </div>
            <div className="plato-card p-4 text-center">
              <p className="text-[18px] font-bold font-display text-[#4D7CFF]">{formatCurrency(totalOutstanding)}</p>
              <p className="text-[11px] text-white/30 mt-1">Total Due</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="plato-input pl-8 text-[13px]" placeholder="Search by student name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Invoice list */}
          <div className="space-y-2">
            {outstanding.map((inv) => {
              const student = students.find((s) => s.id === inv.studentId)
              const isOverdue = inv.status === 'overdue'
              const remaining = inv.totalAmount - (inv.paidAmount || 0)

              return (
                <div key={inv.id} className="plato-card overflow-hidden" style={{ borderLeft: isOverdue ? '3px solid #FF6B7A' : undefined }}>
                  <div className="flex items-center gap-4 p-4">
                    {student && <Avatar name={student.name} size="sm" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white/85">{student?.name || 'Unknown Student'}</p>
                      <p className="text-[11px] text-white/40">{inv.items.map((it) => it.description).join(', ')} · {inv.invoiceNumber}</p>
                      <p className="text-[11px] text-white/30">Due: {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[16px] font-bold" style={{ color: isOverdue ? '#FF6B7A' : '#FBBF24' }}>{formatCurrency(remaining)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: isOverdue ? 'rgba(255,107,122,0.1)' : 'rgba(251,191,36,0.1)', color: isOverdue ? '#FF6B7A' : '#FBBF24' }}>
                        {isOverdue ? 'Overdue' : inv.status === 'partial' ? 'Partial' : 'Pending'}
                      </span>
                    </div>
                    <button onClick={() => setRecordPaymentFor(inv.id)} className="btn-primary flex-shrink-0 ml-2">
                      <CreditCard size={14} /> Collect
                    </button>
                  </div>
                </div>
              )
            })}

            {outstanding.length === 0 && (
              <div className="text-center py-16 text-white/30">
                <DollarSign size={32} className="mx-auto mb-3 text-[#00FFA3] opacity-50" />
                <p>All fees collected! No outstanding invoices.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Date range filter */}
          <div className="flex flex-wrap items-center gap-2">
            {(['today', 'week', 'month', 'custom'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuick(q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${quick === q ? 'bg-[#4D7CFF] text-white' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}
              >
                {quickLabel[q]}
              </button>
            ))}
            {quick === 'custom' && (
              <div className="flex items-center gap-2 ml-1">
                <input type="date" className="plato-input text-xs py-1.5" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                <span className="text-muted-foreground text-xs">to</span>
                <input type="date" className="plato-input text-xs py-1.5" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            )}
            <button onClick={exportCsv} className="btn-ghost border border-dark-border text-xs ml-auto">
              <Download size={13} /> Export CSV
            </button>
          </div>

          {/* Summary card */}
          <div className="plato-card p-4 flex flex-wrap gap-x-6 gap-y-2 items-center text-sm">
            <span className="font-semibold text-foreground">{quickLabel[quick]}{quick === 'custom' ? ` (${formatDate(start)} – ${formatDate(end)})` : ''}</span>
            <span className="text-muted-foreground">Collected: <span className="text-[#00FFA3] font-semibold">{formatCurrency(logSummary.total)}</span></span>
            <span className="text-muted-foreground">Transactions: <span className="text-foreground font-semibold">{logSummary.count}</span></span>
            <span className="text-muted-foreground">Cash: <span className="text-foreground font-semibold">{formatCurrency(logSummary.cash)}</span></span>
            <span className="text-muted-foreground">Transfer: <span className="text-foreground font-semibold">{formatCurrency(logSummary.transfer)}</span></span>
            <span className="text-muted-foreground">Card: <span className="text-foreground font-semibold">{formatCurrency(logSummary.card)}</span></span>
          </div>

          {/* Log table */}
          <div className="plato-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full plato-table">
                <thead><tr><th>Date</th><th>Student</th><th>Invoice No.</th><th>Programme</th><th>Method</th><th>Ref No.</th><th>Amount (AED)</th><th>Receipt</th></tr></thead>
                <tbody>
                  {logEntries.map((p, idx) => {
                    const student = students.find((s) => s.id === p.invoice.studentId)
                    return (
                      <tr key={idx}>
                        <td className="text-sm text-muted-foreground">{formatDate(p.date)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {student && <Avatar name={student.name} size="xs" />}
                            <span className="text-sm text-foreground">{student?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="font-mono text-xs text-[#4D7CFF]">{p.invoice.invoiceNumber}</td>
                        <td className="text-sm text-muted-foreground">{student?.curriculum || '—'}</td>
                        <td className="text-sm text-muted-foreground capitalize">{p.method.replace('_', ' ')}</td>
                        <td className="text-sm text-muted-foreground">{p.reference || '—'}</td>
                        <td className="font-semibold text-foreground text-sm">{formatCurrency(p.amount, p.invoice.currency)}</td>
                        <td>
                          <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs" onClick={() => printLogReceipt(p)}>
                            <Printer size={12} /> Print
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {logEntries.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-10 text-white/30">No payments recorded in this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {recordPaymentFor && (
        <RecordPaymentModal open onClose={() => setRecordPaymentFor(null)} invoiceId={recordPaymentFor} />
      )}
    </div>
  )
}

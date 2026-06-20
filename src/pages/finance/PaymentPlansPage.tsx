import { Fragment, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { RecordPaymentModal } from '@/components/finance/RecordPaymentModal'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { CalendarRange, CheckCircle2, ChevronDown, ChevronUp, Plus, Clock, AlertCircle } from 'lucide-react'
import type { Invoice, PaymentInstallment } from '@/types'

type PlanStatus = 'On Track' | 'Due Today' | 'Overdue' | 'Completed'
type ResolvedStatus = 'paid' | 'due_today' | 'overdue' | 'upcoming'

const STATUS_STYLE: Record<PlanStatus, { color: string; bg: string }> = {
  'On Track': { color: '#00FFA3', bg: 'rgba(0,255,163,0.1)' },
  'Due Today': { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  Overdue: { color: '#FF6B7A', bg: 'rgba(255,107,122,0.1)' },
  Completed: { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// An instalment's status is derived from how much of the invoice has actually been
// paid so far, rather than a stored flag — payments recorded against the invoice from
// anywhere (Outstanding, Invoices, here) automatically settle instalments in order.
function resolveInstallments(installments: PaymentInstallment[], paidAmount: number) {
  let running = 0
  const today = todayStr()
  return installments.map((inst) => {
    running += inst.amount
    let resolvedStatus: ResolvedStatus
    if (running <= paidAmount + 0.01) resolvedStatus = 'paid'
    else if (inst.dueDate === today) resolvedStatus = 'due_today'
    else if (inst.dueDate < today) resolvedStatus = 'overdue'
    else resolvedStatus = 'upcoming'
    return { ...inst, resolvedStatus }
  })
}

function planStatus(resolved: { resolvedStatus: ResolvedStatus }[], invoice?: Invoice): PlanStatus {
  if (invoice?.status === 'paid' || resolved.every((r) => r.resolvedStatus === 'paid')) return 'Completed'
  if (resolved.some((r) => r.resolvedStatus === 'overdue')) return 'Overdue'
  if (resolved.some((r) => r.resolvedStatus === 'due_today')) return 'Due Today'
  return 'On Track'
}

const STATUS_LABEL: Record<ResolvedStatus, string> = {
  paid: 'PAID ✓', due_today: 'DUE TODAY', overdue: 'OVERDUE', upcoming: 'UPCOMING',
}

function defaultFirstDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}

export default function PaymentPlansPage() {
  const { paymentPlans, students, invoices, branches, addPaymentPlan } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [recordPayment, setRecordPayment] = useState<{ invoiceId: string; amount: number } | null>(null)

  const [studentId, setStudentId] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [count, setCount] = useState('3')
  const [customCount, setCustomCount] = useState('5')
  const [firstDate, setFirstDate] = useState(defaultFirstDate())
  const [frequency, setFrequency] = useState<'monthly' | 'fortnightly'>('monthly')

  const studentOptions = students.map((s) => ({
    id: s.id, label: s.name, sublabel: `${branches.find((b) => b.id === s.branchId)?.name || ''} · ${s.curriculum}`,
  }))

  const eligibleInvoices = invoices.filter(
    (i) => (i.status === 'pending' || i.status === 'overdue') && !paymentPlans.some((p) => p.invoiceId === i.id) && i.studentId === studentId
  )

  const instalmentCount = count === 'custom' ? Math.max(2, Number(customCount) || 2) : Number(count)
  const selectedInvoice = invoices.find((i) => i.id === invoiceId)

  const previewInstallments: PaymentInstallment[] = selectedInvoice
    ? Array.from({ length: instalmentCount }, (_, i) => {
        const due = new Date(firstDate)
        if (frequency === 'monthly') due.setMonth(due.getMonth() + i)
        else due.setDate(due.getDate() + i * 14)
        const per = Math.floor((selectedInvoice.totalAmount / instalmentCount) * 100) / 100
        const remainder = Math.round((selectedInvoice.totalAmount - per * instalmentCount) * 100) / 100
        return { dueDate: due.toISOString().split('T')[0], amount: i === instalmentCount - 1 ? per + remainder : per, status: 'pending' }
      })
    : []

  const resetForm = () => {
    setStudentId(''); setInvoiceId(''); setCount('3'); setCustomCount('5')
    setFirstDate(defaultFirstDate()); setFrequency('monthly')
  }
  const closeModal = () => { setShowModal(false); resetForm() }

  const handleCreate = () => {
    if (!selectedInvoice) return
    addPaymentPlan({
      id: `pp-${generateId()}`,
      invoiceId: selectedInvoice.id,
      studentId: selectedInvoice.studentId,
      installments: previewInstallments,
      createdAt: todayStr(),
    })
    toast.success('Payment plan created', `${instalmentCount} instalments set up for ${selectedInvoice.invoiceNumber}`)
    closeModal()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payment Plans"
        subtitle="Instalment plans for families who need to spread fee payments"
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Create Plan
          </button>
        }
      />

      {paymentPlans.length === 0 ? (
        <EmptyState icon={<CalendarRange size={24} />} title="No payment plans yet" description="Click '+ Create Plan' to set one up." />
      ) : (
        <div className="plato-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="plato-table">
            <thead>
              <tr>
                <th>Student</th><th>Programme</th><th>Total Fee</th><th>Plan</th><th>Per Instalment</th><th>Progress</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {paymentPlans.map((plan) => {
                const student = students.find((s) => s.id === plan.studentId)
                const invoice = invoices.find((i) => i.id === plan.invoiceId)
                const paidAmount = invoice?.paidAmount || 0
                const total = plan.installments.reduce((s, i) => s + i.amount, 0)
                const resolved = resolveInstallments(plan.installments, paidAmount)
                const status = planStatus(resolved, invoice)
                const paidCount = resolved.filter((r) => r.resolvedStatus === 'paid').length
                const nextUnpaid = resolved.find((r) => r.resolvedStatus !== 'paid')
                const isExpanded = expanded === plan.id

                return (
                  <Fragment key={plan.id}>
                    <tr className="cursor-pointer" onClick={() => setExpanded(isExpanded ? null : plan.id)}>
                      <td>
                        <div className="flex items-center gap-2">
                          {student && <Avatar name={student.name} size="xs" />}
                          <span className="text-[13px] font-medium text-white/85">{student?.name}</span>
                        </div>
                      </td>
                      <td className="text-[12px] text-white/50">{student?.curriculum}</td>
                      <td className="text-[13px] font-semibold text-white/80">{formatCurrency(total)}</td>
                      <td className="text-[12px] text-white/50">{plan.installments.length} instalments</td>
                      <td className="text-[13px] text-white/70">{formatCurrency(plan.installments[0]?.amount || 0)}</td>
                      <td style={{ minWidth: 120 }}>
                        <p className="text-[11px] text-white/40 mb-1">{paidCount}/{plan.installments.length} paid</p>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(paidCount / plan.installments.length) * 100}%`, background: STATUS_STYLE[status].color }} />
                        </div>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color }}>{status}</span>
                      </td>
                      <td>{isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="bg-white/[0.02] p-4">
                          <div className="space-y-2">
                            {resolved.map((inst, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-3">
                                  {inst.resolvedStatus === 'paid' ? <CheckCircle2 size={14} className="text-[#00FFA3]" /> : inst.resolvedStatus === 'overdue' ? <AlertCircle size={14} className="text-[#FF6B7A]" /> : <Clock size={14} className="text-white/30" />}
                                  <div>
                                    <p className="text-[12px] font-semibold text-white/80">Instalment {idx + 1} — {formatCurrency(inst.amount)}</p>
                                    <p className="text-[11px] text-white/35">Due {formatDate(inst.dueDate)} · {STATUS_LABEL[inst.resolvedStatus]}</p>
                                  </div>
                                </div>
                                {inst.resolvedStatus !== 'paid' && invoice && nextUnpaid === inst && (
                                  <button
                                    className="text-[11px] px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20"
                                    onClick={(e) => { e.stopPropagation(); setRecordPayment({ invoiceId: invoice.id, amount: inst.amount }) }}
                                  >
                                    Record Payment
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <Modal open={showModal} onClose={closeModal} title="Create Payment Plan" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Student</label>
            <SearchableSelect options={studentOptions} value={studentId} onChange={(id) => { setStudentId(id); setInvoiceId('') }} placeholder="— Select Student —" emptyLabel="No students available" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Invoice</label>
            <select className="plato-input" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} disabled={!studentId}>
              <option value="">— Select Invoice —</option>
              {eligibleInvoices.map((i) => <option key={i.id} value={i.id}>{i.invoiceNumber} — {formatCurrency(i.totalAmount, i.currency)}</option>)}
            </select>
            {studentId && eligibleInvoices.length === 0 && (
              <p className="text-[11px] text-white/30 mt-1">No unpaid invoices without an existing plan for this student.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Number of Instalments</label>
              <select className="plato-input" value={count} onChange={(e) => setCount(e.target.value)}>
                {[2, 3, 4, 6].map((n) => <option key={n} value={n}>{n} instalments</option>)}
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Frequency</label>
              <select className="plato-input" value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)}>
                <option value="monthly">Monthly</option>
                <option value="fortnightly">Fortnightly</option>
              </select>
            </div>
          </div>
          {count === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Custom Instalment Count</label>
              <input type="number" min={2} max={24} className="plato-input" value={customCount} onChange={(e) => setCustomCount(e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">First Instalment Date</label>
            <input type="date" className="plato-input" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
          </div>

          {selectedInvoice && (
            <div className="rounded-xl overflow-hidden border border-dark-border">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 py-2 bg-white/[0.02]">Preview</p>
              {previewInstallments.map((inst, idx) => (
                <div key={idx} className="flex justify-between px-3 py-2 text-xs border-t border-dark-border/50">
                  <span className="text-muted-foreground">Instalment {idx + 1} — due {formatDate(inst.dueDate)}</span>
                  <span className="text-foreground font-semibold">{formatCurrency(inst.amount, selectedInvoice.currency)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={closeModal}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!selectedInvoice}>Create Plan</button>
          </div>
        </div>
      </Modal>

      {recordPayment && (
        <RecordPaymentModal
          open
          onClose={() => setRecordPayment(null)}
          invoiceId={recordPayment.invoiceId}
          defaultAmount={recordPayment.amount}
        />
      )}
    </div>
  )
}

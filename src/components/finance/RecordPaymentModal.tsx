import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Modal } from '@/components/ui/Modal'
import { FieldError, RequiredMark } from '@/components/ui/FormField'
import { formatCurrency } from '@/lib/utils'
import { formatAedOnBlur, parseAedOnFocus, aedNumber } from '@/lib/validation'
import { toast } from '@/components/ui/Toaster'
import { printPaymentReceipt } from '@/lib/receipt'
import type { PaymentRecord } from '@/types'

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online Payment' },
] as const

const REFERENCE_METHODS = new Set(['bank_transfer', 'cheque', 'online'])

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

interface RecordPaymentModalProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  defaultAmount?: number
}

export function RecordPaymentModal({ open, onClose, invoiceId, defaultAmount }: RecordPaymentModalProps) {
  const { invoices, students, parents, branches, settings, updateInvoice } = useAppStore()
  const invoice = invoices.find((i) => i.id === invoiceId)
  const student = students.find((s) => s.id === invoice?.studentId)

  const [paymentDate, setPaymentDate] = useState(todayStr())
  const [amountPaid, setAmountPaid] = useState(defaultAmount ? String(defaultAmount) : '')
  const [method, setMethod] = useState<typeof METHODS[number]['value']>('cash')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [amountError, setAmountError] = useState('')

  if (!invoice || !student) return null

  const amountDue = invoice.totalAmount - (invoice.paidAmount || 0)
  const amountNum = aedNumber(amountPaid)

  const reset = () => {
    setPaymentDate(todayStr()); setAmountPaid(''); setMethod('cash')
    setReference(''); setNotes(''); setAmountError('')
  }
  const close = () => { onClose(); reset() }

  const handleSubmit = () => {
    if (amountNum <= 0 || amountNum > amountDue) {
      setAmountError(amountNum > amountDue ? `Amount cannot exceed AED ${amountDue.toLocaleString()}` : 'Enter an amount greater than 0')
      return
    }
    const record: PaymentRecord = { date: paymentDate, amount: amountNum, method, reference: reference || undefined, notes: notes || undefined }
    const previouslyPaid = invoice.paidAmount || 0
    const newPaidAmount = previouslyPaid + amountNum
    const isFull = newPaidAmount >= invoice.totalAmount
    updateInvoice(invoice.id, {
      status: isFull ? 'paid' : 'partial',
      paidAmount: newPaidAmount,
      paidDate: isFull ? paymentDate : invoice.paidDate,
      paymentMethod: method,
      paymentHistory: [...(invoice.paymentHistory || []), record],
    })
    const parent = parents.find((p) => p.studentIds.includes(student.id))
    const branch = branches.find((b) => b.id === invoice.branchId)
    toast.success(
      `Payment of ${formatCurrency(amountNum)} recorded for ${student.name}`,
      isFull ? undefined : `Remaining balance: ${formatCurrency(invoice.totalAmount - newPaidAmount)}`,
      {
        label: 'Print Receipt',
        onClick: () => printPaymentReceipt({
          settings, invoice, student, parent, branch,
          amountReceived: amountNum, previouslyPaid, paymentMethod: method,
          reference: reference || undefined, paymentDate,
        }),
      }
    )
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Record Payment" isDirty={Boolean(amountPaid)} size="md">
      <div className="space-y-4">
        <div className="p-4 rounded-xl space-y-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Student</span><span className="font-semibold text-foreground">{student.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Invoice Number</span><span className="font-semibold text-foreground">{invoice.invoiceNumber}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Amount Due</span><span className="font-semibold text-foreground">{formatCurrency(amountDue)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Current Status</span><span className={invoice.status === 'overdue' ? 'badge-danger' : 'badge-warning'}>{invoice.status}</span></div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Payment Date</label>
          <input type="date" className="plato-input" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Amount Paid (AED)<RequiredMark /></label>
          <input
            className="plato-input"
            placeholder="0"
            value={amountPaid}
            onFocus={() => setAmountPaid(parseAedOnFocus(amountPaid))}
            onBlur={() => setAmountPaid(formatAedOnBlur(amountPaid))}
            onChange={(e) => { setAmountPaid(e.target.value); if (amountError) setAmountError('') }}
          />
          <FieldError message={amountError} />
          <button type="button" className="text-[11px] text-[#4D7CFF] hover:underline mt-1" onClick={() => setAmountPaid(String(amountDue))}>
            Full amount: AED {amountDue.toLocaleString()} (Pay in full)
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Payment Method</label>
          <select className="plato-input" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {REFERENCE_METHODS.has(method) && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Reference Number</label>
            <input className="plato-input" placeholder="Bank reference / cheque number" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
          <textarea className="plato-input min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={close}>Cancel</button>
          <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={handleSubmit} disabled={!amountPaid}>Record Payment</button>
        </div>
      </div>
    </Modal>
  )
}

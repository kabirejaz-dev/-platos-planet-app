import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Modal } from '@/components/ui/Modal'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { RequiredMark, RequiredFieldsNote, FieldError } from '@/components/ui/FormField'
import { formatCurrency, generateId, formatDate } from '@/lib/utils'
import { formatAedOnBlur, parseAedOnFocus, aedNumber, formatDateUAE } from '@/lib/validation'
import { toast } from '@/components/ui/Toaster'
import { ShieldCheck, FileText } from 'lucide-react'
import type { Curriculum, PaymentInstallment } from '@/types'

const CURRICULA: Curriculum[] = ['IGCSE', 'A-Level', 'CBSE', 'IB', 'American']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}
function plusDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

interface CreateInvoiceModalProps {
  open: boolean
  onClose: () => void
}

export function CreateInvoiceModal({ open, onClose }: CreateInvoiceModalProps) {
  const { students, branches, parents, invoices, addInvoice, addPaymentPlan } = useAppStore()

  const [studentId, setStudentId] = useState('')
  const [branchOverride, setBranchOverride] = useState('')
  const [programmeOverride, setProgrammeOverride] = useState<Curriculum | ''>('')
  const [invoiceDate, setInvoiceDate] = useState(todayStr())
  const [dueDate, setDueDate] = useState(plusDays(30))
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<'full' | 'instalment'>('full')
  const [instalmentCount, setInstalmentCount] = useState('2')
  const [siblingDiscount, setSiblingDiscount] = useState('0')
  const [notes, setNotes] = useState('')
  const [dueDateError, setDueDateError] = useState('')
  const [preview, setPreview] = useState(false)

  const student = students.find((s) => s.id === studentId)
  const branch = branches.find((b) => b.id === (branchOverride || student?.branchId))
  const programme = programmeOverride || student?.curriculum || ''

  const amountNum = aedNumber(amount)
  const vat = Math.round(amountNum * 0.05 * 100) / 100
  const subtotal = amountNum + vat
  const discountPct = Number(siblingDiscount) || 0
  const discountAmount = discountPct > 0 ? Math.round(subtotal * (discountPct / 100) * 100) / 100 : 0
  const total = Math.round((subtotal - discountAmount) * 100) / 100

  const instalments: PaymentInstallment[] = Array.from({ length: Number(instalmentCount) }, (_, i) => {
    const due = new Date()
    due.setMonth(due.getMonth() + i + 1)
    const per = Math.floor((total / Number(instalmentCount)) * 100) / 100
    const remainder = Math.round((total - per * Number(instalmentCount)) * 100) / 100
    return {
      dueDate: due.toISOString().split('T')[0],
      amount: i === Number(instalmentCount) - 1 ? per + remainder : per,
      status: 'pending' as const,
    }
  })

  const reset = () => {
    setStudentId(''); setBranchOverride(''); setProgrammeOverride('')
    setInvoiceDate(todayStr()); setDueDate(plusDays(30)); setDescription('')
    setAmount(''); setPaymentType('full'); setInstalmentCount('2')
    setSiblingDiscount('0'); setNotes(''); setPreview(false); setDueDateError('')
  }

  const close = () => { onClose(); reset() }

  const studentOptions = students.map((s) => ({ id: s.id, label: s.name, sublabel: `${branches.find((b) => b.id === s.branchId)?.name || ''} · ${s.curriculum}` }))

  const canPreview = Boolean(studentId && amountNum > 0 && dueDate >= invoiceDate)

  const handlePreview = () => {
    if (!studentId || amountNum <= 0) return
    if (dueDate < invoiceDate) { setDueDateError('Due date must be on or after the invoice date'); return }
    setDueDateError('')
    setPreview(true)
  }

  const handleSubmit = () => {
    if (!student) return
    const parent = parents.find((p) => p.studentIds.includes(student.id))
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`
    const invoiceId = `inv-${generateId()}`

    addInvoice({
      id: invoiceId,
      invoiceNumber,
      studentId: student.id,
      parentId: parent?.id || '',
      branchId: branchOverride || student.branchId,
      items: [
        { description: description || `${programme} Fees — ${student.name}`, amount: amountNum, quantity: 1 },
        { description: 'VAT (5%)', amount: vat, quantity: 1 },
      ],
      totalAmount: total,
      currency: 'AED',
      status: 'pending',
      dueDate,
      issuedDate: invoiceDate,
      notes: notes || undefined,
    })

    if (paymentType === 'instalment') {
      addPaymentPlan({
        id: `pp-${generateId()}`,
        invoiceId,
        studentId: student.id,
        installments: instalments,
        createdAt: todayStr(),
      })
    }

    toast.success(`Invoice ${invoiceNumber} created for ${student.name}`)
    close()
  }

  return (
    <Modal open={open} onClose={close} title={preview ? 'Preview Invoice' : 'Create Invoice'} size="lg" isDirty={Boolean(studentId || amount)}>
      {preview ? (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between pb-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 100%)' }}>
                  <span className="text-white font-bold font-display">P</span>
                </div>
                <p className="text-sm font-bold text-foreground font-display">Plato's Planet Digital</p>
              </div>
              <span className="badge-success flex items-center gap-1"><ShieldCheck size={12} /> KHDA & SPEA Accredited</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Student</span><p className="font-semibold text-foreground">{student?.name}</p></div>
              <div><span className="text-muted-foreground">Branch</span><p className="font-semibold text-foreground">{branch?.name}</p></div>
              <div><span className="text-muted-foreground">Programme</span><p className="font-semibold text-foreground">{programme}</p></div>
              <div><span className="text-muted-foreground">Grade</span><p className="font-semibold text-foreground">{student?.grade}</p></div>
              <div><span className="text-muted-foreground">Invoice Date</span><p className="font-semibold text-foreground">{formatDateUAE(invoiceDate)}</p></div>
              <div><span className="text-muted-foreground">Due Date</span><p className="font-semibold text-foreground">{formatDateUAE(dueDate)}</p></div>
            </div>

            <div className="border-t border-dark-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{description || 'Fees'}</span><span className="text-foreground">{formatCurrency(amountNum)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT (5%)</span><span className="text-foreground">{formatCurrency(vat)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Sibling Discount ({discountPct}%)</span><span className="text-[#00FFA3]">−{formatCurrency(discountAmount)}</span></div>}
              <div className="flex justify-between font-bold border-t border-dark-border pt-2"><span className="text-foreground">Total</span><span className="text-[#00FFA3]">{formatCurrency(total)}</span></div>
            </div>

            {paymentType === 'instalment' && (
              <div className="border-t border-dark-border pt-3 space-y-1.5">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Instalment Plan</p>
                {instalments.map((inst, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Instalment {idx + 1} — Due {formatDate(inst.dueDate)}</span>
                    <span className="text-foreground">{formatCurrency(inst.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={() => setPreview(false)}>Back to Edit</button>
            <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={handleSubmit}>Create Invoice</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Student<RequiredMark /></label>
            <SearchableSelect
              options={studentOptions}
              value={studentId}
              onChange={(id) => { setStudentId(id); setBranchOverride(''); setProgrammeOverride('') }}
              placeholder="— Select Student —"
              emptyLabel="No students available"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Branch</label>
              <select className="plato-input" value={branchOverride || student?.branchId || ''} onChange={(e) => setBranchOverride(e.target.value)} disabled={!student}>
                <option value="">— Select Branch —</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Programme</label>
              <select className="plato-input" value={programme} onChange={(e) => setProgrammeOverride(e.target.value as Curriculum)} disabled={!student}>
                <option value="">— Select Programme —</option>
                {CURRICULA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Invoice Date</label>
              <input type="date" className="plato-input" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Due Date<RequiredMark /></label>
              <input type="date" className="plato-input" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setDueDateError('') }} />
              <FieldError message={dueDateError} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
            <input className="plato-input" placeholder="e.g. Term 1 Fees — IGCSE Physics Grade 10" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Amount (AED)<RequiredMark /></label>
              <input
                className="plato-input"
                placeholder="2,400"
                value={amount}
                onFocus={() => setAmount(parseAedOnFocus(amount))}
                onBlur={() => setAmount(formatAedOnBlur(amount))}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">VAT (5%)</label>
              <input className="plato-input opacity-60" readOnly value={formatCurrency(vat)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Total</label>
              <input className="plato-input opacity-60" readOnly value={formatCurrency(total)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Payment Type</label>
            <div className="flex gap-4">
              {(['full', 'instalment'] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="radio" name="paymentType" checked={paymentType === t} onChange={() => setPaymentType(t)} />
                  {t === 'full' ? 'Full Payment' : 'Instalment Plan'}
                </label>
              ))}
            </div>
          </div>

          {paymentType === 'instalment' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Number of Instalments</label>
              <select className="plato-input" value={instalmentCount} onChange={(e) => setInstalmentCount(e.target.value)}>
                {[2, 3, 4].map((n) => <option key={n} value={n}>{n} instalments</option>)}
              </select>
              {amountNum > 0 && (
                <div className="rounded-xl overflow-hidden border border-dark-border">
                  {instalments.map((inst, idx) => (
                    <div key={idx} className="flex justify-between px-3 py-2 text-xs border-b border-dark-border/50 last:border-0">
                      <span className="text-muted-foreground">Instalment {idx + 1} — Due {formatDate(inst.dueDate)}</span>
                      <span className="text-foreground font-semibold">{formatCurrency(inst.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Sibling Discount (%)</label>
            <input type="number" min={0} max={50} className="plato-input" value={siblingDiscount} onChange={(e) => setSiblingDiscount(e.target.value)} />
            {discountAmount > 0 && <p className="text-[11px] text-[#00FFA3] mt-1">Discounted total: {formatCurrency(total)}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea className="plato-input min-h-[70px]" placeholder="Internal notes — not shown on invoice" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <RequiredFieldsNote />

          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={close}>Cancel</button>
            <button className="btn-ghost flex-1 justify-center border border-[#4D7CFF]/40 text-[#4D7CFF] min-h-[44px]" disabled={!canPreview} onClick={handlePreview}>
              <FileText size={14} /> Preview Invoice
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

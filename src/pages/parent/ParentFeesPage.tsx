import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatCurrency } from '@/lib/utils'
import { X, Receipt, CheckCircle2, Clock, AlertCircle, Wallet, Building2, Phone } from 'lucide-react'
import type { Invoice } from '@/types'

const STATUS_CONFIG: Record<Invoice['status'], { icon: JSX.Element; color: string; bg: string; label: string }> = {
  paid:    { icon: <CheckCircle2 size={13} />, color: '#00FFA3', bg: 'rgba(0,255,163,0.1)',   label: 'Paid' },
  pending: { icon: <Clock size={13} />,         color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', label: 'Pending' },
  overdue: { icon: <AlertCircle size={13} />,   color: '#FF6B7A', bg: 'rgba(255,107,122,0.1)', label: 'Overdue' },
  waived:  { icon: <CheckCircle2 size={13} />,  color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: 'Waived' },
  partial: { icon: <Clock size={13} />,         color: '#4D7CFF', bg: 'rgba(77,124,255,0.1)',  label: 'Partial' },
}

const notSet = (v?: string) => (v && v.trim() ? v : 'Not configured yet')

export default function ParentFeesPage() {
  const { currentUser, parents, invoices, students, branches, settings } = useAppStore()
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [showPayNow, setShowPayNow] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const myInvoices = invoices
    .filter((inv) => inv.parentId === parent?.id)
    .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())

  const payableInvoices = myInvoices.filter((i) => i.status === 'pending' || i.status === 'overdue' || i.status === 'partial')

  const total = myInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paid = myInvoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)
  const outstanding = myInvoices.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.totalAmount, 0)

  const currency = myInvoices[0]?.currency ?? 'AED'
  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? 'Unknown'

  const selectedInvoices = payableInvoices.filter((i) => checked.has(i.id))
  const selectedTotal = selectedInvoices.reduce((s, i) => s + (i.totalAmount - (i.paidAmount || 0)), 0)
  const reference = selectedInvoices.length > 0
    ? `${getStudentName(selectedInvoices[0].studentId)} — ${selectedInvoices.map((i) => i.invoiceNumber).join(', ')}`
    : ''
  const selectedBranches = Array.from(new Set(selectedInvoices.map((i) => i.branchId))).map((id) => branches.find((b) => b.id === id)).filter(Boolean)

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const closePayNow = () => { setShowPayNow(false); setStep(1); setChecked(new Set()) }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fees"
        subtitle="Invoice history and payment status"
        actions={
          payableInvoices.length > 0 && (
            <button className="btn-primary" onClick={() => setShowPayNow(true)}>
              <Wallet size={14} /> Pay Now
            </button>
          )
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Billed', value: formatCurrency(total, currency), color: '#4D7CFF' },
          { label: 'Paid', value: formatCurrency(paid, currency), color: '#00FFA3' },
          { label: 'Outstanding', value: formatCurrency(outstanding, currency), color: outstanding > 0 ? '#FF6B7A' : '#00FFA3' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[20px] font-bold font-display leading-tight" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="plato-card overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[13px] font-bold text-white/70">Invoices ({myInvoices.length})</h3>
        </div>
        <div>
          {myInvoices.map((inv) => {
            const sc = STATUS_CONFIG[inv.status]
            return (
              <button
                key={inv.id}
                onClick={() => setSelected(inv)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    <Receipt size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/80">{inv.invoiceNumber}</p>
                    <p className="text-[11px] text-white/35">
                      {getStudentName(inv.studentId)} · Due {formatDate(inv.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {sc.icon} {sc.label}
                  </span>
                  <p className="text-[14px] font-bold" style={{ color: sc.color }}>
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </p>
                </div>
              </button>
            )
          })}
          {myInvoices.length === 0 && (
            <p className="text-center text-[13px] text-white/30 py-10">No invoices found.</p>
          )}
        </div>
      </div>

      {/* Invoice detail */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <h3 className="text-[14px] font-bold text-white font-display">{selected.invoiceNumber}</h3>
                  <p className="text-[11px] text-white/40">Issued {formatDate(selected.issuedDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color }}
                  >
                    {STATUS_CONFIG[selected.status].icon} {STATUS_CONFIG[selected.status].label}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white/70">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[13px]">
                      <span className="text-white/60">{item.description}</span>
                      <span className="text-white/80 font-semibold">{formatCurrency(item.amount * item.quantity, selected.currency)}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-[14px] font-bold text-white/70">Total</span>
                  <span
                    className="text-[20px] font-bold font-display"
                    style={{ color: STATUS_CONFIG[selected.status].color }}
                  >
                    {formatCurrency(selected.totalAmount, selected.currency)}
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Due Date', value: formatDate(selected.dueDate) },
                    ...(selected.paidDate ? [{ label: 'Paid On', value: formatDate(selected.paidDate) }] : []),
                    ...(selected.paymentMethod ? [{ label: 'Method', value: selected.paymentMethod.replace('_', ' ') }] : []),
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-[12px]">
                      <span className="text-white/35">{row.label}</span>
                      <span className="text-white/70 font-medium capitalize">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 pb-5">
                <button className="btn-ghost w-full justify-center" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pay Now flow */}
      <Modal open={showPayNow} onClose={closePayNow} title={step === 1 ? 'Select Invoices' : step === 2 ? 'Payment Options' : 'Thank You'} size="md">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              {payableInvoices.map((inv) => {
                const remaining = inv.totalAmount - (inv.paidAmount || 0)
                return (
                  <label key={inv.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <input type="checkbox" checked={checked.has(inv.id)} onChange={() => toggle(inv.id)} />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-white/80">{inv.invoiceNumber} · {getStudentName(inv.studentId)}</p>
                      <p className="text-[11px] text-white/35">Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: STATUS_CONFIG[inv.status].color }}>{formatCurrency(remaining, inv.currency)}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-dark-border">
              <span className="text-[13px] text-white/50">Selected total</span>
              <span className="text-[16px] font-bold text-foreground">{formatCurrency(selectedTotal, currency)}</span>
            </div>
            <button className="btn-primary w-full justify-center min-h-[44px]" disabled={checked.size === 0} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-white/80"><Wallet size={14} /> Option A — Bank Transfer</div>
              <div className="text-[12px] space-y-1 pl-1">
                <div className="flex justify-between"><span className="text-white/40">Account Name</span><span className="text-white/80">{notSet(settings.bankAccountName)}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Bank</span><span className="text-white/80">{notSet(settings.bankName)}</span></div>
                <div className="flex justify-between"><span className="text-white/40">IBAN</span><span className="text-white/80">{notSet(settings.bankIban)}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Payment Ref</span><span className="text-[#4D7CFF] font-semibold">{reference}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-white/80"><Building2 size={14} /> Option B — Visit a Branch</div>
              <div className="text-[12px] space-y-1.5 pl-1">
                {selectedBranches.length > 0 ? selectedBranches.map((b) => (
                  <div key={b!.id}>
                    <p className="text-white/80 font-medium">{b!.name}</p>
                    <p className="text-white/40">{notSet(b!.address)}</p>
                  </div>
                )) : <p className="text-white/40">Not configured yet</p>}
                <div className="flex justify-between pt-1 border-t border-dark-border/50">
                  <span className="text-white/40">Opening hours</span><span className="text-white/80">{notSet(settings.openingHours)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-white/80"><Phone size={14} /> Option C — Call Us</div>
              <div className="text-[12px] flex justify-between pl-1">
                <span className="text-white/40">Phone</span><span className="text-white/80">{notSet(settings.phone)}</span>
              </div>
            </div>

            {(!settings.bankAccountName || !settings.bankName || !settings.bankIban) && (
              <p className="text-[11px] text-[#FBBF24]">Please contact the school directly for payment details until bank details are configured in Setup.</p>
            )}

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={() => setStep(3)}>I've Made the Transfer</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-2">
            <CheckCircle2 size={36} className="mx-auto text-[#00FFA3]" />
            <p className="text-[14px] text-white/80 leading-relaxed">
              Thank you. Once we receive your payment, it will be marked in your account within 1 business day.
              Please use the reference: <span className="font-semibold text-[#4D7CFF]">{reference}</span>.
            </p>
            <button className="btn-primary w-full justify-center min-h-[44px]" onClick={closePayNow}>Done</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

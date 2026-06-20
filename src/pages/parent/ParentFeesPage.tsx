import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { X, Receipt, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { Invoice } from '@/types'

const STATUS_CONFIG: Record<Invoice['status'], { icon: JSX.Element; color: string; bg: string; label: string }> = {
  paid:    { icon: <CheckCircle2 size={13} />, color: '#00FFA3', bg: 'rgba(0,255,163,0.1)',   label: 'Paid' },
  pending: { icon: <Clock size={13} />,         color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', label: 'Pending' },
  overdue: { icon: <AlertCircle size={13} />,   color: '#FF6B7A', bg: 'rgba(255,107,122,0.1)', label: 'Overdue' },
  waived:  { icon: <CheckCircle2 size={13} />,  color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', label: 'Waived' },
  partial: { icon: <Clock size={13} />,         color: '#4D7CFF', bg: 'rgba(77,124,255,0.1)',  label: 'Partial' },
}

export default function ParentFeesPage() {
  const { currentUser, parents, invoices, students } = useAppStore()
  const [selected, setSelected] = useState<Invoice | null>(null)

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const myInvoices = invoices
    .filter((inv) => inv.parentId === parent?.id)
    .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())

  const total = myInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paid = myInvoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)
  const outstanding = myInvoices.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.totalAmount, 0)

  const currency = myInvoices[0]?.currency ?? 'AED'
  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? 'Unknown'

  return (
    <div className="space-y-5">
      <PageHeader title="Fees" subtitle="Invoice history and payment status" badge={<DemoBadge />} />

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
    </div>
  )
}

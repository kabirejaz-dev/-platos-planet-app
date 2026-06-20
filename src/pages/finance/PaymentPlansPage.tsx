import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate, generateId, getStatusColor } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { CalendarRange, CheckCircle2, Plus } from 'lucide-react'
import type { PaymentInstallment } from '@/types'

export default function PaymentPlansPage() {
  const { paymentPlans, students, invoices, addPaymentPlan } = useAppStore()
  const [showModal, setShowModal] = useState(false)

  const eligibleInvoices = invoices.filter(
    (i) => (i.status === 'pending' || i.status === 'overdue') && !paymentPlans.some((p) => p.invoiceId === i.id)
  )
  const [form, setForm] = useState({ invoiceId: eligibleInvoices[0]?.id || '', installmentCount: '2' })

  const handleCreate = () => {
    const invoice = invoices.find((i) => i.id === form.invoiceId)
    const count = Number(form.installmentCount)
    if (!invoice || !count || count < 2) return

    const per = Math.floor((invoice.totalAmount / count) * 100) / 100
    const remainder = Math.round((invoice.totalAmount - per * count) * 100) / 100
    const installments: PaymentInstallment[] = Array.from({ length: count }, (_, i) => {
      const due = new Date()
      due.setMonth(due.getMonth() + i + 1)
      return {
        dueDate: due.toISOString().split('T')[0],
        amount: i === count - 1 ? per + remainder : per,
        status: 'pending',
      }
    })

    addPaymentPlan({
      id: `pp-${generateId()}`,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      installments,
      createdAt: new Date().toISOString().split('T')[0],
    })
    toast.success('Payment plan created', `${count} instalments set up for ${invoice.invoiceNumber}`)
    setShowModal(false)
    setForm({ invoiceId: eligibleInvoices[0]?.id || '', installmentCount: '2' })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payment Plans"
        subtitle="Instalment plans for families who need to spread fee payments"
        badge={<DemoBadge />}
        actions={
          <button className="btn-primary" disabled={eligibleInvoices.length === 0} onClick={() => setShowModal(true)}>
            <Plus size={15} /> Create Plan
          </button>
        }
      />

      <div className="space-y-4">
        {paymentPlans.map((plan) => {
          const student = students.find((s) => s.id === plan.studentId)
          const invoice = invoices.find((i) => i.id === plan.invoiceId)
          const paidCount = plan.installments.filter((i) => i.status === 'paid').length
          const total = plan.installments.reduce((s, i) => s + i.amount, 0)

          return (
            <div key={plan.id} className="plato-card p-4">
              <div className="flex items-center gap-3 mb-3">
                {student && <Avatar name={student.name} size="sm" />}
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-white/85">{student?.name}</p>
                  <p className="text-[11px] text-white/35">{invoice?.invoiceNumber} · {formatCurrency(total)} total · {paidCount}/{plan.installments.length} paid</p>
                </div>
                <CalendarRange size={16} className="text-white/25" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {plan.installments.map((inst, idx) => (
                  <div key={idx} className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-[12px] font-semibold text-white/75">{formatCurrency(inst.amount)}</p>
                      <p className="text-[10px] text-white/30">Due {formatDate(inst.dueDate)}</p>
                    </div>
                    {inst.status === 'paid'
                      ? <CheckCircle2 size={14} className="text-[#00FFA3]" />
                      : <span className={getStatusColor(inst.status)} style={{ fontSize: 10 }}>{inst.status}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {paymentPlans.length === 0 && (
          <EmptyState icon={<CalendarRange size={24} />} title="No payment plans" description="No instalment plans have been set up yet." />
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Payment Plan">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Invoice</label>
            <select className="plato-input" value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}>
              {eligibleInvoices.map((i) => {
                const student = students.find((s) => s.id === i.studentId)
                return <option key={i.id} value={i.id}>{i.invoiceNumber} — {student?.name} ({formatCurrency(i.totalAmount, i.currency)})</option>
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Number of Instalments</label>
            <select className="plato-input" value={form.installmentCount} onChange={(e) => setForm({ ...form, installmentCount: e.target.value })}>
              {[2, 3, 4, 6].map((n) => <option key={n} value={n}>{n} instalments</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.invoiceId}>Create Plan</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

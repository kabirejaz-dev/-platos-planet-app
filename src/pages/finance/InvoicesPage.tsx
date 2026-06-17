import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { generateId, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Plus, Printer } from 'lucide-react'

export default function InvoicesPage() {
  const { invoices, students, parents, branches, addInvoice, updateInvoice } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState<string | null>(null)
  const [form, setForm] = useState({
    studentId: students[0]?.id || '',
    description: '',
    amount: '',
    dueDate: '',
    paymentMethod: 'card' as 'cash' | 'card' | 'bank_transfer' | 'online',
  })

  const handleCreate = () => {
    const student = students.find((s) => s.id === form.studentId)
    const parent = parents.find((p) => p.studentIds.includes(form.studentId))
    const invNum = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`

    addInvoice({
      id: `inv-${generateId()}`,
      invoiceNumber: invNum,
      studentId: form.studentId,
      parentId: parent?.id || '',
      branchId: student?.branchId || '',
      items: [{ description: form.description, amount: Number(form.amount), quantity: 1 }],
      totalAmount: Number(form.amount),
      currency: 'AED',
      status: 'pending',
      dueDate: form.dueDate,
      issuedDate: new Date().toISOString().split('T')[0],
    })
    setShowModal(false)
  }

  const receiptInv = invoices.find((i) => i.id === showReceipt)
  const receiptStudent = students.find((s) => s.id === receiptInv?.studentId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total · ${invoices.filter((i) => i.status === 'paid').length} paid`}
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Invoice
          </button>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: invoices.length, color: '#4D7CFF' },
          { label: 'Paid', value: invoices.filter((i) => i.status === 'paid').length, color: '#00FFA3' },
          { label: 'Overdue', value: invoices.filter((i) => i.status === 'overdue').length, color: '#FF6B7A' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-3 text-center">
            <p className="text-xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="plato-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            <thead><tr><th>Invoice #</th><th>Student</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Issued</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.map((inv) => {
                const student = students.find((s) => s.id === inv.studentId)
                return (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-[#4D7CFF] font-semibold">{inv.invoiceNumber}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {student && <Avatar name={student.name} size="xs" />}
                        <span className="text-sm font-medium text-foreground">{student?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="font-bold text-foreground">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                    <td><span className={getStatusColor(inv.status)}>{inv.status}</span></td>
                    <td className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</td>
                    <td className="text-sm text-muted-foreground">{formatDate(inv.issuedDate)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => updateInvoice(inv.id, { status: 'paid', paidDate: new Date().toISOString().split('T')[0], paymentMethod: 'card' })}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => setShowReceipt(inv.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-1"
                        >
                          <Printer size={12} /> Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt modal */}
      {receiptInv && receiptStudent && (
        <Modal open={!!showReceipt} onClose={() => setShowReceipt(null)} title="Invoice Receipt" size="md">
          <div className="space-y-4 font-mono text-sm">
            <div className="text-center pb-4 border-b border-dark-border">
              <p className="text-lg font-bold text-foreground font-display">Plato's Planet Digital</p>
              <p className="text-xs text-muted-foreground">Dubai Marina Centre · VAT TRN100234567890003</p>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice #</span>
              <span className="font-semibold text-[#4D7CFF]">{receiptInv.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student</span>
              <span className="text-foreground">{receiptStudent.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue Date</span>
              <span className="text-foreground">{formatDate(receiptInv.issuedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={getStatusColor(receiptInv.status)}>{receiptInv.status}</span>
            </div>
            <div className="border-t border-dark-border pt-3 mt-3 space-y-2">
              {receiptInv.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground text-xs">{item.description}</span>
                  <span className="text-foreground">{formatCurrency(item.amount * item.quantity, receiptInv.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-dark-border pt-2 font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-[#00FFA3]">{formatCurrency(receiptInv.totalAmount, receiptInv.currency)}</span>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground pt-2">Thank you for choosing Plato's Planet Digital.</p>
          </div>
        </Modal>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Invoice">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Student</label>
            <select className="plato-input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.curriculum} {s.grade}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
            <input className="plato-input" placeholder="e.g. IGCSE Physics — November 2024" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Amount (AED)</label>
              <input type="number" className="plato-input" placeholder="1200" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Due Date</label>
              <input type="date" className="plato-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.description || !form.amount || !form.dueDate}>Create Invoice</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Plus, Eye } from 'lucide-react'
import { CreateInvoiceModal } from '@/components/finance/CreateInvoiceModal'
import { RecordPaymentModal } from '@/components/finance/RecordPaymentModal'
import { InvoiceDetailModal } from '@/components/finance/InvoiceDetailModal'

export default function InvoicesPage() {
  const { invoices, students } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [recordPaymentFor, setRecordPaymentFor] = useState<string | null>(null)
  const [viewInvoiceFor, setViewInvoiceFor] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total · ${invoices.filter((i) => i.status === 'paid').length} paid`}
        actions={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
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
                const remaining = inv.totalAmount - (inv.paidAmount || 0)
                return (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-[#4D7CFF] font-semibold">{inv.invoiceNumber}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {student && <Avatar name={student.name} size="xs" />}
                        <span className="text-sm font-medium text-foreground">{student?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="font-bold text-foreground">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                      {inv.status === 'partial' && (
                        <span className="block text-[11px] font-normal text-[#FBBF24]">{formatCurrency(remaining, inv.currency)} remaining</span>
                      )}
                    </td>
                    <td><span className={getStatusColor(inv.status)}>{inv.status}</span></td>
                    <td className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</td>
                    <td className="text-sm text-muted-foreground">{formatDate(inv.issuedDate)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => setRecordPaymentFor(inv.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20 transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                        <button
                          onClick={() => setViewInvoiceFor(inv.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-dark-border text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-1"
                        >
                          <Eye size={12} /> View
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

      <CreateInvoiceModal open={showCreate} onClose={() => setShowCreate(false)} />

      {recordPaymentFor && (
        <RecordPaymentModal open onClose={() => setRecordPaymentFor(null)} invoiceId={recordPaymentFor} />
      )}

      {viewInvoiceFor && (
        <InvoiceDetailModal
          open
          onClose={() => setViewInvoiceFor(null)}
          invoiceId={viewInvoiceFor}
          onRecordPayment={() => { setRecordPaymentFor(viewInvoiceFor); setViewInvoiceFor(null) }}
        />
      )}
    </div>
  )
}

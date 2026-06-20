import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Wallet, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export default function FeeOverviewPage() {
  const { currentUser, invoices, students } = useAppStore()

  const branchInvoices = invoices.filter((i) => !currentUser?.branchId || i.branchId === currentUser.branchId)
  const collected = branchInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0)
  const pending = branchInvoices.filter((i) => i.status === 'pending').reduce((s, i) => s + i.totalAmount, 0)
  const overdue = branchInvoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0)
  const total = collected + pending + overdue

  const sorted = [...branchInvoices].sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Overview" subtitle="Outstanding, collected, and overdue fees for students in this branch" badge={<DemoBadge />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="plato-card p-4 text-center">
          <Wallet size={18} className="mx-auto mb-2 text-white/30" />
          <p className="text-[18px] font-bold font-display text-white/85">{formatCurrency(total)}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Invoiced</p>
        </div>
        <div className="plato-card p-4 text-center">
          <CheckCircle2 size={18} className="mx-auto mb-2 text-[#00FFA3]" />
          <p className="text-[18px] font-bold font-display text-[#00FFA3]">{formatCurrency(collected)}</p>
          <p className="text-[11px] text-white/30 mt-1">Collected</p>
        </div>
        <div className="plato-card p-4 text-center">
          <Clock size={18} className="mx-auto mb-2 text-[#FBBF24]" />
          <p className="text-[18px] font-bold font-display text-[#FBBF24]">{formatCurrency(pending)}</p>
          <p className="text-[11px] text-white/30 mt-1">Pending</p>
        </div>
        <div className="plato-card p-4 text-center">
          <AlertTriangle size={18} className="mx-auto mb-2 text-[#FF6B7A]" />
          <p className="text-[18px] font-bold font-display text-[#FF6B7A]">{formatCurrency(overdue)}</p>
          <p className="text-[11px] text-white/30 mt-1">Overdue</p>
        </div>
      </div>

      <div className="plato-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-white/70">All Invoices</h3>
        </div>
        <table className="w-full plato-table">
          <thead><tr><th>Student</th><th>Invoice #</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {sorted.map((inv) => {
              const student = students.find((s) => s.id === inv.studentId)
              return (
                <tr key={inv.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {student && <Avatar name={student.name} size="xs" />}
                      <p className="font-medium text-[13px] text-white/85">{student?.name || 'Unknown'}</p>
                    </div>
                  </td>
                  <td className="text-[12px] text-white/40">{inv.invoiceNumber}</td>
                  <td className="text-[13px] font-semibold text-white/80">{formatCurrency(inv.totalAmount)}</td>
                  <td className="text-[12px] text-white/40">{formatDate(inv.dueDate)}</td>
                  <td><span className={getStatusColor(inv.status)}>{inv.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Receipt, FileCheck, Download } from 'lucide-react'

export default function VATReportsPage() {
  const { invoices, settings } = useAppStore()

  const paidInvoices = invoices.filter((i) => i.status === 'paid')
  const grossRevenue = paidInvoices.reduce((s, i) => s + i.totalAmount, 0)
  const vatAmount = Math.round(grossRevenue * (settings.vatRate / (100 + settings.vatRate)))
  const netRevenue = grossRevenue - vatAmount

  return (
    <div className="space-y-5">
      <PageHeader
        title="VAT Reports"
        subtitle="UAE VAT-compliant reports ready for submission to the FTA"
        badge={<DemoBadge />}
        actions={<button className="btn-primary" onClick={() => toast.success('Report exported', 'VAT return PDF generated.')}><Download size={14} /> Export VAT Return</button>}
      />

      <div className="plato-card p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#4D7CFF]/10 text-[#4D7CFF]">
          <FileCheck size={20} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white/80">TRN: {settings.vatNumber || 'Not configured'}</p>
          <p className="text-[12px] text-white/40">VAT Rate: {settings.vatRate}% · Filing period: {settings.academicYear}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[18px] font-bold font-display text-white/85">{formatCurrency(grossRevenue)}</p>
          <p className="text-[11px] text-white/30 mt-1">Gross Revenue (Collected)</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[18px] font-bold font-display text-[#FBBF24]">{formatCurrency(vatAmount)}</p>
          <p className="text-[11px] text-white/30 mt-1">VAT Payable</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[18px] font-bold font-display text-[#00FFA3]">{formatCurrency(netRevenue)}</p>
          <p className="text-[11px] text-white/30 mt-1">Net Revenue</p>
        </div>
      </div>

      <div className="plato-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-white/70">Taxable Supplies (Paid Invoices)</h3>
        </div>
        <table className="w-full plato-table">
          <thead><tr><th>Invoice #</th><th>Date</th><th>Gross Amount</th><th>VAT ({settings.vatRate}%)</th><th>Net Amount</th></tr></thead>
          <tbody>
            {paidInvoices.map((inv) => {
              const vat = Math.round(inv.totalAmount * (settings.vatRate / (100 + settings.vatRate)))
              return (
                <tr key={inv.id}>
                  <td className="text-[12px] text-white/70">{inv.invoiceNumber}</td>
                  <td className="text-[12px] text-white/40">{formatDate(inv.paidDate || inv.issuedDate)}</td>
                  <td className="text-[13px] font-semibold text-white/80">{formatCurrency(inv.totalAmount)}</td>
                  <td className="text-[12px] text-[#FBBF24]">{formatCurrency(vat)}</td>
                  <td className="text-[12px] text-white/60">{formatCurrency(inv.totalAmount - vat)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {paidInvoices.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Receipt size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-[13px]">No paid invoices in this period.</p>
          </div>
        )}
      </div>
    </div>
  )
}

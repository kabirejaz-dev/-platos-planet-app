import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Receipt, FileCheck, Download, AlertTriangle } from 'lucide-react'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getQuarters(count: number) {
  const now = new Date()
  let year = now.getFullYear()
  let q = Math.floor(now.getMonth() / 3)
  const quarters: { key: string; label: string; start: string; end: string }[] = []
  for (let i = 0; i < count; i++) {
    const startMonth = q * 3
    const start = new Date(year, startMonth, 1)
    const end = new Date(year, startMonth + 3, 0)
    quarters.push({
      key: `${year}-Q${q + 1}`,
      label: `Q${q + 1} ${MONTH_NAMES[startMonth]}–${MONTH_NAMES[startMonth + 2]} ${year}`,
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    })
    q--
    if (q < 0) { q = 3; year-- }
  }
  return quarters
}

export default function VATReportsPage() {
  const { invoices, settings } = useAppStore()
  const quarters = useMemo(() => getQuarters(8), [])
  const [periodKey, setPeriodKey] = useState(quarters[0].key)
  const period = quarters.find((q) => q.key === periodKey) || quarters[0]

  const paidInvoices = invoices
    .filter((i) => i.status === 'paid')
    .filter((i) => {
      const d = i.paidDate || i.issuedDate
      return d >= period.start && d <= period.end
    })
  const grossRevenue = paidInvoices.reduce((s, i) => s + i.totalAmount, 0)
  const vatAmount = Math.round(grossRevenue * (settings.vatRate / (100 + settings.vatRate)))
  const netRevenue = grossRevenue - vatAmount

  return (
    <div className="space-y-5">
      <PageHeader
        title="VAT Reports"
        subtitle="UAE VAT-compliant reports ready for submission to the FTA"
        badge={<DemoBadge />}
        actions={
          <div className="flex items-center gap-2">
            <select className="plato-input text-sm" value={periodKey} onChange={(e) => setPeriodKey(e.target.value)}>
              {quarters.map((q) => <option key={q.key} value={q.key}>{q.label}</option>)}
            </select>
            <button className="btn-primary" onClick={() => toast.success('Report exported', 'VAT return PDF generated.')}><Download size={14} /> Export VAT Return</button>
          </div>
        }
      />

      <div className="plato-card p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#4D7CFF]/10 text-[#4D7CFF]">
          <FileCheck size={20} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white/80">TRN: {settings.vatNumber || '— not set —'}</p>
          <p className="text-[12px] text-white/40">VAT Rate: {settings.vatRate}% · Filing period: {period.label}</p>
        </div>
      </div>

      {!settings.vatNumber && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FBBF24]/5 border border-[#FBBF24]/20 text-[12px] text-[#FBBF24]">
          <AlertTriangle size={14} /> TRN not configured. Add it in Setup → School Info.
        </div>
      )}

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
          <h3 className="text-[13px] font-semibold text-white/70">Taxable Supplies (Paid Invoices) — {period.label}</h3>
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

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { formatDateUAE } from '@/lib/validation'
import { toast } from '@/components/ui/Toaster'
import { Download, MessageCircle, ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react'

interface InvoiceDetailModalProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  onRecordPayment: () => void
}

export function InvoiceDetailModal({ open, onClose, invoiceId, onRecordPayment }: InvoiceDetailModalProps) {
  const { invoices, students, parents, branches, settings, updateInvoice } = useAppStore()
  const [showWhatsApp, setShowWhatsApp] = useState(false)

  const invoice = invoices.find((i) => i.id === invoiceId)
  const student = students.find((s) => s.id === invoice?.studentId)
  const branch = branches.find((b) => b.id === invoice?.branchId)
  const parent = parents.find((p) => student && p.studentIds.includes(student.id))

  if (!invoice || !student) return null

  const vatItem = invoice.items.find((i) => i.description.toLowerCase().includes('vat'))
  const feeItems = invoice.items.filter((i) => i !== vatItem)
  const isOverdue = invoice.status === 'pending' && invoice.dueDate < new Date().toISOString().split('T')[0]

  const whatsappMessage = `Dear ${parent?.name || 'Parent'}, your invoice ${invoice.invoiceNumber} for ${student.name} (AED ${invoice.totalAmount.toLocaleString()}) is due on ${formatDateUAE(invoice.dueDate)}. Pay now: ${window.location.origin}/finance/invoices. Plato's Planet — +971 4 123 4567`

  const sendWhatsApp = () => {
    const digits = (parent?.phone || '').replace(/[^\d]/g, '')
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`, '_blank')
    setShowWhatsApp(false)
  }

  const downloadPdf = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>${invoice.invoiceNumber}</title>
      <style>
        body { font-family: -apple-system, Arial, sans-serif; color: #111; padding: 40px; }
        h1 { font-size: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        td { padding: 6px 0; } .right { text-align: right; } .total { font-weight: bold; border-top: 1px solid #ccc; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; background: #eef; font-size: 12px; }
      </style></head><body>
      <h1>Plato's Planet Digital</h1>
      <p class="badge">KHDA &amp; SPEA Accredited</p>
      <p><strong>Invoice ${invoice.invoiceNumber}</strong><br/>Issued ${formatDateUAE(invoice.issuedDate)} · Due ${formatDateUAE(invoice.dueDate)}</p>
      <p>Student: ${student.name}<br/>Branch: ${branch?.name || ''}<br/>Programme: ${student.curriculum}<br/>Grade: ${student.grade}</p>
      <table>
        ${feeItems.map((i) => `<tr><td>${i.description}</td><td class="right">${formatCurrency(i.amount * i.quantity)}</td></tr>`).join('')}
        ${vatItem ? `<tr><td>${vatItem.description}</td><td class="right">${formatCurrency(vatItem.amount)}</td></tr>` : ''}
        <tr class="total"><td>Total</td><td class="right">${formatCurrency(invoice.totalAmount)}</td></tr>
      </table>
      <p style="margin-top:24px;color:#666;font-size:12px;">${settings.companyName} · +971 4 123 4567 · hello@platosplanet.ae</p>
      </body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const markOverdue = () => {
    updateInvoice(invoice.id, { status: 'overdue' })
    toast.success('Invoice marked overdue')
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Invoice Detail" size="lg">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-dark-border">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 100%)' }}>
                <span className="text-white font-bold font-display">P</span>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground font-display">{invoice.invoiceNumber}</p>
                <p className="text-xs text-muted-foreground">Issued {formatDateUAE(invoice.issuedDate)} · Due {formatDateUAE(invoice.dueDate)}</p>
              </div>
            </div>
            <span className="badge-success flex items-center gap-1"><ShieldCheck size={12} /> KHDA & SPEA Accredited</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Student</span><p className="font-semibold text-foreground">{student.name}</p></div>
            <div><span className="text-muted-foreground">Branch</span><p className="font-semibold text-foreground">{branch?.name}</p></div>
            <div><span className="text-muted-foreground">Programme</span><p className="font-semibold text-foreground">{student.curriculum}</p></div>
            <div><span className="text-muted-foreground">Grade</span><p className="font-semibold text-foreground">{student.grade}</p></div>
          </div>

          <div className="border-t border-dark-border pt-3 space-y-1.5">
            {feeItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.description}</span>
                <span className="text-foreground">{formatCurrency(item.amount * item.quantity)}</span>
              </div>
            ))}
            {vatItem && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{vatItem.description}</span>
                <span className="text-foreground">{formatCurrency(vatItem.amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-dark-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-[#00FFA3]">{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className={getStatusColor(invoice.status)}>{invoice.status}</span>
            {invoice.status === 'partial' && (
              <p className="text-xs text-muted-foreground">Paid: {formatCurrency(invoice.paidAmount || 0)} · Remaining: {formatCurrency(invoice.totalAmount - (invoice.paidAmount || 0))}</p>
            )}
          </div>

          {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Payment History</p>
              <div className="space-y-1.5">
                {invoice.paymentHistory.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-muted-foreground">{formatDate(p.date)} · {p.method.replace('_', ' ')}{p.reference ? ` · ${p.reference}` : ''}</span>
                    <span className="text-foreground font-semibold">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button className="btn-ghost border border-dark-border text-sm min-h-[44px]" onClick={downloadPdf}>
              <Download size={14} /> Download PDF
            </button>
            {parent?.phone && (
              <button className="btn-ghost border border-dark-border text-sm min-h-[44px]" onClick={() => setShowWhatsApp(true)}>
                <MessageCircle size={14} /> Send via WhatsApp
              </button>
            )}
            {invoice.status !== 'paid' && (
              <button className="btn-primary text-sm min-h-[44px]" onClick={onRecordPayment}>
                <CreditCard size={14} /> Record Payment
              </button>
            )}
            {invoice.status === 'pending' && isOverdue && (
              <button className="btn-ghost border border-[#FF6B7A]/40 text-[#FF6B7A] text-sm min-h-[44px]" onClick={markOverdue}>
                <AlertTriangle size={14} /> Mark Overdue
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={showWhatsApp} onClose={() => setShowWhatsApp(false)} title="Send via WhatsApp" size="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl text-[13px] text-white/80" style={{ background: 'rgba(0,255,163,0.06)', border: '1px solid rgba(0,255,163,0.2)' }}>
            {whatsappMessage}
          </div>
          <div className="flex gap-3">
            <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={() => setShowWhatsApp(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={sendWhatsApp}>Open WhatsApp</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

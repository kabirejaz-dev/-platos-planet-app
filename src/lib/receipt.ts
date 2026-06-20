import type { Invoice, Student, Parent, Branch, SystemSettings } from '@/types'
import { formatCurrency } from './utils'
import { formatDateUAE } from './validation'

// Receipt numbers reset per calendar year and persist across sessions via localStorage,
// so re-opening the app doesn't repeat a number already printed this year.
function nextReceiptNumber(): string {
  const year = new Date().getFullYear()
  const key = `plato-receipt-seq-${year}`
  const seq = Number(localStorage.getItem(key) || '0') + 1
  localStorage.setItem(key, String(seq))
  return `PR-${year}-${String(seq).padStart(4, '0')}`
}

const notSet = (v?: string) => (v && v.trim() ? v : '— not set —')

export interface PrintPaymentReceiptParams {
  settings: SystemSettings
  invoice: Invoice
  student: Student
  parent?: Parent
  branch?: Branch
  amountReceived: number
  previouslyPaid: number
  paymentMethod: string
  reference?: string
  paymentDate: string
}

export function printPaymentReceipt(p: PrintPaymentReceiptParams) {
  const win = window.open('', '_blank')
  if (!win) return

  const receiptNo = nextReceiptNumber()
  const balance = Math.max(0, p.invoice.totalAmount - p.previouslyPaid - p.amountReceived)
  const feeDescription = p.invoice.items[0]?.description || `${p.student.curriculum} Tuition`
  const period = [p.settings.currentTerm, p.settings.academicYear].filter(Boolean).join(' · ')

  win.document.write(`
    <html><head><title>${receiptNo}</title>
    <style>
      body { font-family: -apple-system, Arial, sans-serif; color: #111; padding: 40px; max-width: 480px; margin: 0 auto; }
      h1 { font-size: 18px; margin: 0; }
      .muted { color: #888; font-size: 12px; }
      .row { display: flex; justify-content: space-between; gap: 16px; padding: 4px 0; font-size: 13px; }
      .total { font-weight: bold; border-top: 1px solid #ccc; margin-top: 6px; padding-top: 6px; }
      hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; }
      .footer { text-align: center; color: #999; font-size: 11px; margin-top: 24px; }
    </style></head><body>
      <div class="header">
        <div>
          <h1>${p.settings.companyName}</h1>
          <p class="muted">${notSet(p.branch?.address)}</p>
          <p class="muted">TRN: ${notSet(p.settings.vatNumber)}</p>
        </div>
        ${p.settings.logo ? `<img src="${p.settings.logo}" style="height:40px" />` : ''}
      </div>
      <hr />
      <div class="row"><strong>PAYMENT RECEIPT</strong><span>No. ${receiptNo}</span></div>
      <div class="row"><span class="muted">Date</span><span>${formatDateUAE(p.paymentDate)}</span></div>
      <hr />
      <div class="row"><span class="muted">Received from</span><span>${p.parent?.name || '—'}</span></div>
      <div class="row"><span class="muted">For student</span><span>${p.student.name}</span></div>
      <div class="row"><span class="muted">Programme</span><span>${p.student.curriculum} · Branch: ${p.branch?.name || '—'}</span></div>
      ${period ? `<div class="row"><span class="muted">Period</span><span>${period}</span></div>` : ''}
      <hr />
      <div class="row"><span>${feeDescription}</span><span>${formatCurrency(p.invoice.totalAmount, p.invoice.currency)}</span></div>
      ${p.previouslyPaid > 0 ? `<div class="row"><span>Less: Previous Payments</span><span>(${formatCurrency(p.previouslyPaid, p.invoice.currency)})</span></div>` : ''}
      <div class="row total"><span>Amount Received Today</span><span>${formatCurrency(p.amountReceived, p.invoice.currency)}</span></div>
      <div class="row"><span>Balance Outstanding</span><span>${formatCurrency(balance, p.invoice.currency)}</span></div>
      <hr />
      <div class="row"><span class="muted">Payment Method</span><span style="text-transform:capitalize">${p.paymentMethod.replace('_', ' ')}</span></div>
      <div class="row"><span class="muted">Reference No.</span><span>${p.reference || '—'}</span></div>
      <p class="footer">Thank you for your payment.<br/>This is a computer-generated receipt.</p>
    </body></html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

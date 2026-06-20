import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { MessageCircle, Copy, AlertTriangle } from 'lucide-react'

interface SendReminderModalProps {
  open: boolean
  onClose: () => void
  invoiceId: string
}

export function SendReminderModal({ open, onClose, invoiceId }: SendReminderModalProps) {
  const { invoices, students, parents, settings } = useAppStore()
  const [copied, setCopied] = useState(false)

  const invoice = invoices.find((i) => i.id === invoiceId)
  const student = students.find((s) => s.id === invoice?.studentId)
  const parent = parents.find((p) => student && p.studentIds.includes(student.id))

  if (!invoice || !student) return null

  const amountDue = invoice.totalAmount - (invoice.paidAmount || 0)
  const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000))
  const phoneLine = settings.phone || '[School Phone — set in Setup]'
  const emailLine = settings.email || '[School Email — set in Setup]'

  const message = `Dear ${parent?.name || 'Parent'},

This is a reminder from ${settings.companyName} that the following fee payment is overdue:

Student: ${student.name}
Invoice: ${invoice.invoiceNumber}
Amount Due: ${formatCurrency(amountDue, invoice.currency)}
Original Due Date: ${formatDate(invoice.dueDate)}
Days Overdue: ${daysOverdue} days

Please arrange payment at your earliest convenience or contact us to discuss a payment plan.

${phoneLine}
${emailLine}

Thank you.`

  const sendWhatsApp = () => {
    if (!parent?.phone) return
    window.open(`https://wa.me/${parent.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Reminder" size="md">
      <div className="space-y-4">
        <div className="p-3 rounded-xl text-[13px] text-white/80 whitespace-pre-line" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {message}
        </div>
        {!parent?.phone && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FBBF24]/5 border border-[#FBBF24]/20 text-[12px] text-[#FBBF24]">
            <AlertTriangle size={14} /> No phone number on file for this parent.
          </div>
        )}
        <div className="flex gap-3">
          <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={copyMessage}>
            <Copy size={14} /> {copied ? 'Copied ✓' : 'Copy Message'}
          </button>
          <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={sendWhatsApp} disabled={!parent?.phone}>
            <MessageCircle size={14} /> Send via WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  )
}

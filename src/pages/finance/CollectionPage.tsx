import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { CreditCard, CheckCircle2, Search, DollarSign } from 'lucide-react'

export default function CollectionPage() {
  const { invoices, students, updateInvoice } = useAppStore()
  const [search, setSearch] = useState('')
  const [recording, setRecording] = useState<string | null>(null)
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'online'>('card')

  const outstanding = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue')
    .filter((i) => {
      if (!search) return true
      const student = students.find((s) => s.id === i.studentId)
      return student?.name.toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1
      if (b.status === 'overdue' && a.status !== 'overdue') return 1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  const totalOutstanding = outstanding.reduce((s, i) => s + i.totalAmount, 0)
  const overdue = outstanding.filter((i) => i.status === 'overdue')

  const handleCollect = (invoiceId: string) => {
    updateInvoice(invoiceId, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
    })
    const inv = invoices.find((i) => i.id === invoiceId)
    const student = students.find((s) => s.id === inv?.studentId)
    toast.success('Payment recorded', `${student?.name} · ${formatCurrency(inv?.totalAmount || 0)}`)
    setRecording(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fee Collection"
        subtitle={`${outstanding.length} outstanding · ${formatCurrency(totalOutstanding)} total`}
        badge={<DemoBadge />}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#FF6B7A]">{overdue.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Overdue</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#FBBF24]">{outstanding.filter((i) => i.status === 'pending').length}</p>
          <p className="text-[11px] text-white/30 mt-1">Pending</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[18px] font-bold font-display text-[#4D7CFF]">{formatCurrency(totalOutstanding)}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Due</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input className="plato-input pl-8 text-[13px]" placeholder="Search by student name…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Invoice list */}
      <div className="space-y-2">
        {outstanding.map((inv) => {
          const student = students.find((s) => s.id === inv.studentId)
          const isOverdue = inv.status === 'overdue'
          const isRecording = recording === inv.id

          return (
            <div key={inv.id} className="plato-card overflow-hidden" style={{ borderLeft: isOverdue ? '3px solid #FF6B7A' : undefined }}>
              <div className="flex items-center gap-4 p-4">
                {student && <Avatar name={student.name} size="sm" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white/85">{student?.name || 'Unknown Student'}</p>
                  <p className="text-[11px] text-white/40">{inv.items.map((it) => it.description).join(', ')} · {inv.invoiceNumber}</p>
                  <p className="text-[11px] text-white/30">Due: {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[16px] font-bold" style={{ color: isOverdue ? '#FF6B7A' : '#FBBF24' }}>{formatCurrency(inv.totalAmount)}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: isOverdue ? 'rgba(255,107,122,0.1)' : 'rgba(251,191,36,0.1)', color: isOverdue ? '#FF6B7A' : '#FBBF24' }}>
                    {isOverdue ? 'Overdue' : 'Pending'}
                  </span>
                </div>
                <button onClick={() => setRecording(isRecording ? null : inv.id)} className="btn-primary flex-shrink-0 ml-2">
                  <CreditCard size={14} /> Collect
                </button>
              </div>

              {isRecording && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  <p className="text-[12px] font-semibold text-white/60">Payment Method</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['cash', 'card', 'bank_transfer', 'online'] as const).map((m) => (
                      <button key={m} onClick={() => setMethod(m)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all" style={{ background: method === m ? 'rgba(77,124,255,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${method === m ? '#4D7CFF' : 'rgba(255,255,255,0.08)'}`, color: method === m ? '#4D7CFF' : 'rgba(255,255,255,0.5)' }}>
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-ghost flex-1 justify-center text-[13px]" onClick={() => setRecording(null)}>Cancel</button>
                    <button className="btn-primary flex-1 justify-center text-[13px]" onClick={() => handleCollect(inv.id)}>
                      <CheckCircle2 size={14} /> Record Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {outstanding.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <DollarSign size={32} className="mx-auto mb-3 text-[#00FFA3] opacity-50" />
            <p>All fees collected! No outstanding invoices.</p>
          </div>
        )}
      </div>
    </div>
  )
}

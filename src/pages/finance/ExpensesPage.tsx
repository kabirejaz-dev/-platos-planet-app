import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { FieldError, fieldInputClass } from '@/components/ui/FormField'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { expenseSchema, getFieldErrors } from '@/lib/schemas'
import { Plus, Receipt, Building2, Users, Zap, Megaphone, Package, Wrench, MoreHorizontal } from 'lucide-react'
import type { Expense } from '@/types'

const CATEGORY_CONFIG: Record<Expense['category'], { label: string; color: string; icon: ReactNode }> = {
  rent: { label: 'Rent', color: '#4D7CFF', icon: <Building2 size={14} /> },
  salaries: { label: 'Salaries', color: '#7B61FF', icon: <Users size={14} /> },
  utilities: { label: 'Utilities', color: '#00F0FF', icon: <Zap size={14} /> },
  marketing: { label: 'Marketing', color: '#FF6B7A', icon: <Megaphone size={14} /> },
  supplies: { label: 'Supplies', color: '#FBBF24', icon: <Package size={14} /> },
  maintenance: { label: 'Maintenance', color: '#00FFA3', icon: <Wrench size={14} /> },
  other: { label: 'Other', color: '#64748B', icon: <MoreHorizontal size={14} /> },
}

export default function ExpensesPage() {
  const { currentUser, expenses, branches, addExpense } = useAppStore()
  const branchExpenses = expenses.filter((e) => !currentUser?.branchId || e.branchId === currentUser.branchId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    category: 'other' as Expense['category'],
    branchId: currentUser?.branchId || branches[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
    amount: '',
    receiptFileName: '',
  })
  const [errors, setErrors] = useState<Partial<Record<'description' | 'amount', string>>>({})

  const total = branchExpenses.reduce((s, e) => s + e.amount, 0)
  const categoryMap: Record<string, number> = {}
  branchExpenses.forEach((e) => { categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount })

  const handleAdd = () => {
    if (!form.branchId) return
    const fieldErrors = getFieldErrors(expenseSchema, form)
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    addExpense({
      id: `exp-${generateId()}`,
      branchId: form.branchId,
      category: form.category,
      description: form.description,
      vendor: form.vendor || undefined,
      amount: Number(form.amount),
      date: form.date,
      receiptFileName: form.receiptFileName || undefined,
    })
    toast.success('Expense recorded', `${formatCurrency(Number(form.amount))} — ${form.description}`)
    setShowModal(false)
    setForm({ category: 'other', branchId: currentUser?.branchId || branches[0]?.id || '', date: new Date().toISOString().split('T')[0], description: '', vendor: '', amount: '', receiptFileName: '' })
    setErrors({})
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Expenses"
        subtitle="Track branch operating expenses and generate profit/loss reports"
        badge={<DemoBadge />}
        actions={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Expense</button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[18px] font-bold font-display text-white/85">{formatCurrency(total)}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Expenses</p>
        </div>
        {Object.entries(categoryMap).slice(0, 3).map(([cat, amt]) => (
          <div key={cat} className="plato-card p-4 text-center">
            <p className="text-[16px] font-bold font-display" style={{ color: CATEGORY_CONFIG[cat as Expense['category']].color }}>{formatCurrency(amt)}</p>
            <p className="text-[11px] text-white/30 mt-1">{CATEGORY_CONFIG[cat as Expense['category']].label}</p>
          </div>
        ))}
      </div>

      <div className="plato-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-white/70">All Expenses</h3>
        </div>
        <div className="divide-y divide-white/5">
          {branchExpenses.map((e) => {
            const branch = branches.find((b) => b.id === e.branchId)
            const cfg = CATEGORY_CONFIG[e.category]
            return (
              <div key={e.id} className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white/80">{e.description}</p>
                  <p className="text-[11px] text-white/30">{branch?.name} · {formatDate(e.date)}{e.vendor ? ` · ${e.vendor}` : ''}{e.receiptFileName ? ' · 📎 receipt' : ''}</p>
                </div>
                <p className="text-[13px] font-bold text-white/85">{formatCurrency(e.amount)}</p>
              </div>
            )
          })}
        </div>
        {branchExpenses.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Receipt size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-[13px]">No expenses recorded.</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setErrors({}) }} title="Add Expense">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Category</label>
            <select className="plato-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Expense['category'] }))}>
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Branch</label>
              {currentUser?.branchId ? (
                <input className="plato-input opacity-60" readOnly value={branches.find((b) => b.id === currentUser.branchId)?.name || ''} />
              ) : (
                <select className="plato-input" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Date</label>
              <input type="date" className="plato-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Description</label>
            <input className={fieldInputClass(errors.description)} placeholder="e.g. Stationery and printed worksheets" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <FieldError message={errors.description} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Vendor/Supplier</label>
            <input className="plato-input" placeholder="e.g. DEWA, Al Futtaim, Transguard" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Amount (AED)</label>
            <input type="number" className={fieldInputClass(errors.amount)} placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            <FieldError message={errors.amount} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Attach Receipt (optional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="plato-input"
              onChange={(e) => setForm((f) => ({ ...f, receiptFileName: e.target.files?.[0]?.name || '' }))}
            />
            {form.receiptFileName && <p className="text-[11px] text-[#00FFA3] mt-1">{form.receiptFileName}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center" onClick={() => { setShowModal(false); setErrors({}) }}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleAdd} disabled={!form.description || !form.amount}>Add Expense</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

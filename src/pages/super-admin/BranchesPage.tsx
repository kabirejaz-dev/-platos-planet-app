import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { FieldError, RequiredMark, RequiredFieldsNote } from '@/components/ui/FormField'
import { generateId, formatCurrency } from '@/lib/utils'
import { isValidUaePhone, UAE_PHONE_ERROR, useDirtyForm } from '@/lib/validation'
import { Plus, MapPin, Phone, Mail, Users, GraduationCap } from 'lucide-react'
import type { Branch, Emirate, BranchStatus } from '@/types'

const EMIRATES: Emirate[] = ['Dubai', 'Sharjah', 'Abu Dhabi', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']
const STATUSES: { value: BranchStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'coming_soon', label: 'Coming Soon' },
]
const CURRENT_YEAR = new Date().getFullYear()

const emptyForm = {
  name: '', address: '', city: '', emirate: 'Dubai' as Emirate,
  phone: '', whatsappNumber: '', email: '', managerId: '',
  status: 'active' as BranchStatus, capacity: '150', establishedYear: String(CURRENT_YEAR),
}

export default function BranchesPage() {
  const { branches, students, teachers, invoices, users, addBranch, updateBranch } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const { current: form, setCurrent: setForm, isDirty } = useDirtyForm(emptyForm)
  const [phoneError, setPhoneError] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<Branch | null>(null)
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('')

  const branchManagers = users.filter((u) => u.role === 'branch_admin').map((u) => ({ id: u.id, label: u.name, sublabel: u.email }))

  const handleSave = () => {
    if (phoneError) return
    const status = form.status
    const payload = {
      name: form.name,
      address: form.address,
      city: form.city,
      country: 'UAE',
      emirate: form.emirate,
      phone: form.phone,
      whatsappNumber: form.whatsappNumber || undefined,
      email: form.email,
      managerId: form.managerId || undefined,
      status,
      isActive: status === 'active',
      capacity: Number(form.capacity),
      establishedYear: Number(form.establishedYear),
    }
    if (editBranch) {
      updateBranch(editBranch.id, payload)
    } else {
      addBranch({ id: `br-${generateId()}`, ...payload })
    }
    closeModal()
  }

  const closeModal = () => {
    setShowModal(false)
    setEditBranch(null)
    setForm(emptyForm)
    setPhoneError('')
  }

  const openCreate = () => {
    setEditBranch(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (branch: Branch) => {
    setEditBranch(branch)
    setForm({
      name: branch.name, address: branch.address, city: branch.city,
      emirate: branch.emirate || 'Dubai',
      phone: branch.phone, whatsappNumber: branch.whatsappNumber || '',
      email: branch.email, managerId: branch.managerId || '',
      status: branch.status || (branch.isActive ? 'active' : 'inactive'),
      capacity: String(branch.capacity), establishedYear: String(branch.establishedYear),
    })
    setShowModal(true)
  }

  const requestDeactivate = (branch: Branch) => {
    if (branch.isActive) {
      setDeactivateTarget(branch)
      setDeactivateConfirmText('')
    } else {
      updateBranch(branch.id, { isActive: true, status: 'active' })
    }
  }

  const confirmDeactivate = () => {
    if (!deactivateTarget || deactivateConfirmText !== 'DEACTIVATE') return
    updateBranch(deactivateTarget.id, { isActive: false, status: 'inactive' })
    setDeactivateTarget(null)
  }

  const emailSuggestion = form.name ? `${form.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@platosplanet.ae` : ''
  const canSave = Boolean(form.name && form.emirate && form.phone && form.email) && !phoneError

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} branches · ${branches.filter((b) => b.isActive).length} active`}
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Branch
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map((branch) => {
          const branchStudents = students.filter((s) => s.branchId === branch.id && s.status === 'active').length
          const branchTeachers = teachers.filter((t) => t.branchId === branch.id && t.isActive).length
          const revenue = invoices.filter((i) => i.branchId === branch.id && i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0)
          const capacity = branch.capacity > 0 ? Math.round((branchStudents / branch.capacity) * 100) : 0

          return (
            <div key={branch.id} className="plato-card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={branch.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-foreground">{branch.name}</h3>
                    <p className="text-xs text-muted-foreground">Est. {branch.establishedYear}</p>
                  </div>
                </div>
                <span className={branch.isActive ? 'badge-success' : 'badge-danger'}>
                  {branch.status === 'coming_soon' ? 'Coming Soon' : branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span>{branch.address}, {branch.city}{branch.emirate ? `, ${branch.emirate}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} className="flex-shrink-0" />
                  <span>{branch.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} className="flex-shrink-0" />
                  <span>{branch.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{branchStudents}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><GraduationCap size={11} /> Students</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{branchTeachers}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><Users size={11} /> Teachers</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#00FFA3]">{formatCurrency(revenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="text-foreground">{branchStudents}/{branch.capacity}</span>
                </div>
                <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${capacity}%`, background: capacity > 80 ? '#FF6B7A' : '#4D7CFF' }} />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(branch)} className="btn-ghost text-xs flex-1 justify-center border border-dark-border min-h-[44px]">
                  Edit
                </button>
                <button
                  onClick={() => requestDeactivate(branch)}
                  className={`text-xs flex-1 justify-center px-3 py-2 rounded-xl border transition-all min-h-[44px] ${branch.isActive ? 'border-[#FF6B7A]/30 text-[#FF6B7A] hover:bg-[#FF6B7A]/10' : 'border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/10'}`}
                >
                  {branch.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={showModal} onClose={closeModal} title={editBranch ? 'Edit Branch' : 'Add New Branch'} isDirty={isDirty} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Branch Name<RequiredMark /></label>
              <input className="plato-input" placeholder="e.g. Al Qusais" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Address</label>
              <input className="plato-input" placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Area / District</label>
              <input className="plato-input" placeholder="e.g. Al Qusais" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Emirate<RequiredMark /></label>
              <select className="plato-input" value={form.emirate} onChange={(e) => setForm({ ...form, emirate: e.target.value as Emirate })}>
                {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Country</label>
              <input className="plato-input opacity-60" value="UAE" readOnly />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
              <select className="plato-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BranchStatus })}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone<RequiredMark /></label>
              <input
                className="plato-input"
                placeholder="+971 4 XXX XXXX"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (phoneError) setPhoneError('') }}
                onBlur={() => setPhoneError(form.phone && !isValidUaePhone(form.phone) ? UAE_PHONE_ERROR : '')}
              />
              <FieldError message={phoneError} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">WhatsApp Number</label>
              <input className="plato-input" placeholder="+971 50 XXX XXXX" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
              <p className="text-[11px] text-white/30 mt-1">Used for fee reminders and parent messages</p>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email<RequiredMark /></label>
              <input
                className="plato-input"
                placeholder="branch@platosplanet.ae"
                value={form.email}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {emailFocused && !form.email && emailSuggestion && (
                <p className="text-[11px] text-white/30 mt-1">
                  Suggested:{' '}
                  <button type="button" className="text-[#4D7CFF] hover:underline" onClick={() => setForm({ ...form, email: emailSuggestion })}>{emailSuggestion}</button>
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Branch Manager</label>
              <SearchableSelect
                options={branchManagers}
                value={form.managerId}
                onChange={(id) => setForm({ ...form, managerId: id })}
                placeholder="— Assign Branch Manager —"
                emptyLabel="No branch admins available — create one first"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Max Capacity</label>
              <input type="number" min={1} className="plato-input" placeholder="150" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              <p className="text-[11px] text-white/30 mt-1">Number of student seats available in this branch</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Established Year</label>
              <input
                type="number" min={2000} max={CURRENT_YEAR} className="plato-input"
                value={form.establishedYear}
                onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
              />
            </div>
          </div>

          <RequiredFieldsNote />

          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={handleSave} disabled={!canSave}>
              {editBranch ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)} title="Deactivate branch?" size="sm">
        {deactivateTarget && (
          <div className="space-y-4">
            <p className="text-[13px] text-white/70 leading-relaxed">
              Deactivate {deactivateTarget.name}? Students and teachers in this branch will lose access. Type <strong>'DEACTIVATE'</strong> to confirm.
            </p>
            <input
              className="plato-input"
              placeholder="Type DEACTIVATE"
              value={deactivateConfirmText}
              onChange={(e) => setDeactivateConfirmText(e.target.value)}
            />
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={() => setDeactivateTarget(null)}>Cancel</button>
              <button
                className="btn-primary flex-1 justify-center min-h-[44px]"
                style={{ background: '#FF6B7A' }}
                disabled={deactivateConfirmText !== 'DEACTIVATE'}
                onClick={confirmDeactivate}
              >
                Deactivate
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

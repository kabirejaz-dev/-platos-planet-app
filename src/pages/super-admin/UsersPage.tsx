import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { MultiSelectChips } from '@/components/ui/MultiSelectChips'
import { FieldError, RequiredMark, RequiredFieldsNote } from '@/components/ui/FormField'
import { generateId, formatDate } from '@/lib/utils'
import { isValidUaePhone, UAE_PHONE_ERROR, isValidEmail, EMAIL_ERROR } from '@/lib/validation'
import { Plus, Search, CheckCircle2 } from 'lucide-react'
import type { UserRole, Teacher } from '@/types'

const ROLES: UserRole[] = ['branch_admin', 'sales', 'teacher', 'coordinator', 'finance']

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin', branch_admin: 'Branch Admin', sales: 'Sales',
  teacher: 'Teacher', coordinator: 'Coordinator', finance: 'Finance',
  parent: 'Parent', student: 'Student', ai_tutor: 'AI Tutor',
}

const TEACHING_AREAS = ['IGCSE', 'A-Level', 'CBSE', 'NEET/IIT-JEE', 'Robotics', 'Brainobrain', 'Oratory', 'IELTS', 'SATs', 'Languages']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function suggestEmployeeId(existing: string[]): string {
  const year = new Date().getFullYear()
  let candidate = ''
  do {
    candidate = `PP-${year}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
  } while (existing.includes(candidate))
  return candidate
}

const emptyForm = {
  name: '', email: '', phone: '', role: 'teacher' as UserRole, branchId: '',
  joinDate: todayStr(), employeeId: '',
  teachingAreas: [] as string[], qualification: '', maxClassesPerWeek: '20',
}

export default function UsersPage() {
  const { users, branches, addUser, updateUser, addTeacher } = useAppStore()
  const [searchParams] = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get('role') || 'all')
  const [form, setForm] = useState(emptyForm)
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [employeeIdError, setEmployeeIdError] = useState('')
  const [createdName, setCreatedName] = useState('')

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const existingEmployeeIds = users.map((u) => u.employeeId).filter(Boolean) as string[]

  const openCreate = () => {
    setCreatedName('')
    setPhoneError('')
    setEmailError('')
    setEmployeeIdError('')
    setForm({ ...emptyForm, joinDate: todayStr(), employeeId: suggestEmployeeId(existingEmployeeIds) })
    setShowModal(true)
  }

  const handleCreate = () => {
    if (form.employeeId && existingEmployeeIds.includes(form.employeeId)) {
      setEmployeeIdError('Employee ID already in use')
      return
    }
    if (!isValidEmail(form.email)) {
      setEmailError(EMAIL_ERROR)
      return
    }
    if (form.phone && !isValidUaePhone(form.phone)) {
      setPhoneError(UAE_PHONE_ERROR)
      return
    }
    const userId = `u-${generateId()}`
    addUser({
      id: userId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      branchId: form.branchId || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      employeeId: form.employeeId || undefined,
      joinDate: form.joinDate,
    })
    if (form.role === 'teacher') {
      const teacher: Teacher = {
        id: `tc-${generateId()}`,
        userId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        branchId: form.branchId || branches[0]?.id || '',
        subjects: [],
        curriculums: [],
        teachingAreas: form.teachingAreas,
        maxClassesPerWeek: Number(form.maxClassesPerWeek) || undefined,
        qualification: form.qualification,
        experience: 0,
        rating: 0,
        isActive: true,
        batchIds: [],
      }
      addTeacher(teacher)
    }
    setCreatedName(form.name)
  }

  const closeModal = () => {
    setShowModal(false)
    setCreatedName('')
  }

  const createAnother = () => {
    setCreatedName('')
    setPhoneError('')
    setEmailError('')
    setEmployeeIdError('')
    setForm({ ...emptyForm, joinDate: todayStr(), employeeId: suggestEmployeeId([...existingEmployeeIds, form.employeeId]) })
  }

  const isExternalEmail = form.email && !form.email.toLowerCase().endsWith('@platosplanet.ae')
  const canSubmit = Boolean(form.name && form.email && form.joinDate) &&
    (form.role !== 'branch_admin' || form.branchId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} total users across all roles`}
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add User
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="plato-input pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="plato-input w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="plato-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const branch = branches.find((b) => b.id === user.branchId)
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}{user.employeeId ? ` · ${user.employeeId}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-info">{roleLabels[user.role]}</span>
                    </td>
                    <td className="text-muted-foreground text-sm">{branch?.name || '—'}</td>
                    <td>
                      <span className={user.isActive ? 'badge-success' : 'badge-danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-muted-foreground text-sm">{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all min-h-[44px] ${user.isActive ? 'border-[#FF6B7A]/30 text-[#FF6B7A] hover:bg-[#FF6B7A]/10' : 'border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/10'}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={closeModal} title="Create Staff Account" isDirty={!createdName && (form.name !== '' || form.email !== '')} size="lg">
        {createdName ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/20">
              <CheckCircle2 size={18} className="text-[#00FFA3] flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#00FFA3]">
                Account created for {createdName}. Demo password: <code className="font-mono">demo123</code> — change on first login.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={createAnother}>Create Another</button>
              <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={closeModal}>Done</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name<RequiredMark /></label>
              <input className="plato-input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email<RequiredMark /></label>
              <input
                className="plato-input"
                type="email"
                placeholder="email@platosplanet.ae"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); if (emailError) setEmailError('') }}
                onBlur={() => setEmailError(form.email && !isValidEmail(form.email) ? EMAIL_ERROR : '')}
              />
              <FieldError message={emailError} />
              {isExternalEmail && <p className="text-[11px] text-amber-400 mt-1">Note: External email addresses won't have access to internal communications</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone</label>
              <input
                className="plato-input"
                placeholder="+971 50 XXX XXXX"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (phoneError) setPhoneError('') }}
                onBlur={() => setPhoneError(form.phone && !isValidUaePhone(form.phone) ? UAE_PHONE_ERROR : '')}
              />
              <FieldError message={phoneError} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Join Date<RequiredMark /></label>
                <input type="date" className="plato-input" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Employee ID</label>
                <input
                  className="plato-input"
                  value={form.employeeId}
                  onChange={(e) => { setForm({ ...form, employeeId: e.target.value }); if (employeeIdError) setEmployeeIdError('') }}
                />
                <FieldError message={employeeIdError} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Role</label>
              <select className="plato-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Branch{form.role === 'branch_admin' && <RequiredMark />}
              </label>
              <select className="plato-input" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                <option value="">— Select Branch —</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {form.role === 'branch_admin' && (
                <p className="text-[11px] text-white/30 mt-1">This user will only see data for their assigned branch.</p>
              )}
            </div>

            {form.role === 'teacher' && (
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Teaching Details</p>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Subjects / Programmes</label>
                  <MultiSelectChips options={TEACHING_AREAS} selected={form.teachingAreas} onChange={(next) => setForm({ ...form, teachingAreas: next })} />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Qualifications</label>
                  <input className="plato-input" placeholder="e.g. BSc Physics, PGCE" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">Max Classes per Week</label>
                  <input type="number" min={1} max={30} className="plato-input" value={form.maxClassesPerWeek} onChange={(e) => setForm({ ...form, maxClassesPerWeek: e.target.value })} />
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#4D7CFF]/10 border border-[#4D7CFF]/20">
              <p className="text-xs text-[#4D7CFF]">A temporary password will be auto-generated and sent to the user's email on production. Demo password: <code className="font-mono">demo123</code></p>
            </div>

            <RequiredFieldsNote />

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={closeModal}>Cancel</button>
              <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={handleCreate} disabled={!canSubmit}>Create Account</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

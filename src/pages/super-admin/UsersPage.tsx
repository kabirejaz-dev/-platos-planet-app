import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { generateId, formatDate, getStatusColor } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import type { UserRole } from '@/types'

const ROLES: UserRole[] = ['branch_admin', 'sales', 'teacher', 'coordinator', 'finance']

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin', branch_admin: 'Branch Admin', sales: 'Sales',
  teacher: 'Teacher', coordinator: 'Coordinator', finance: 'Finance',
  parent: 'Parent', student: 'Student', ai_tutor: 'AI Tutor',
}

export default function UsersPage() {
  const { users, branches, addUser, updateUser } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'teacher' as UserRole, branchId: '' })

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleCreate = () => {
    addUser({
      id: `u-${generateId()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      branchId: form.branchId || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    })
    setShowModal(false)
    setForm({ name: '', email: '', phone: '', role: 'teacher', branchId: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} total users across all roles`}
        badge={<DemoBadge />}
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
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
                          <p className="text-xs text-muted-foreground">{user.email}</p>
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
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${user.isActive ? 'border-[#FF6B7A]/30 text-[#FF6B7A] hover:bg-[#FF6B7A]/10' : 'border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/10'}`}
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Staff Account">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name</label>
            <input className="plato-input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
            <input className="plato-input" type="email" placeholder="email@platosplanet.ae" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone</label>
            <input className="plato-input" placeholder="+971 50 XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Role</label>
            <select className="plato-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Branch</label>
            <select className="plato-input" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="">— Select Branch —</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-[#4D7CFF]/10 border border-[#4D7CFF]/20">
            <p className="text-xs text-[#4D7CFF]">A temporary password will be auto-generated and sent to the user's email on production. Demo password: <code className="font-mono">demo123</code></p>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.name || !form.email}>Create Account</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

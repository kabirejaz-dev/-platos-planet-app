import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { generateId, formatCurrency } from '@/lib/utils'
import { Plus, MapPin, Phone, Mail, Users, GraduationCap } from 'lucide-react'
import type { Branch } from '@/types'

export default function BranchesPage() {
  const { branches, students, teachers, invoices, addBranch, updateBranch } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [form, setForm] = useState({
    name: '', address: '', city: '', country: 'UAE', phone: '', email: '', capacity: '150'
  })

  const handleSave = () => {
    if (editBranch) {
      updateBranch(editBranch.id, { ...form, capacity: Number(form.capacity) })
    } else {
      addBranch({
        id: `br-${generateId()}`,
        ...form,
        capacity: Number(form.capacity),
        isActive: true,
        establishedYear: new Date().getFullYear(),
      })
    }
    setShowModal(false)
    setEditBranch(null)
    setForm({ name: '', address: '', city: '', country: 'UAE', phone: '', email: '', capacity: '150' })
  }

  const openEdit = (branch: Branch) => {
    setEditBranch(branch)
    setForm({ name: branch.name, address: branch.address, city: branch.city, country: branch.country, phone: branch.phone, email: branch.email, capacity: String(branch.capacity) })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} branches · ${branches.filter((b) => b.isActive).length} active`}
        badge={<DemoBadge />}
        actions={
          <button className="btn-primary" onClick={() => { setEditBranch(null); setShowModal(true) }}>
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
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span>{branch.address}, {branch.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} className="flex-shrink-0" />
                  <span>{branch.phone}</span>
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
                <button onClick={() => openEdit(branch)} className="btn-ghost text-xs flex-1 justify-center border border-dark-border">
                  Edit
                </button>
                <button
                  onClick={() => updateBranch(branch.id, { isActive: !branch.isActive })}
                  className={`text-xs flex-1 justify-center px-3 py-2 rounded-xl border transition-all ${branch.isActive ? 'border-[#FF6B7A]/30 text-[#FF6B7A] hover:bg-[#FF6B7A]/10' : 'border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/10'}`}
                >
                  {branch.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editBranch ? 'Edit Branch' : 'Add New Branch'}>
        <div className="space-y-4">
          {[
            { label: 'Branch Name', key: 'name', placeholder: 'e.g. Dubai Marina Centre' },
            { label: 'Address', key: 'address', placeholder: 'Street address' },
            { label: 'City', key: 'city', placeholder: 'City' },
            { label: 'Country', key: 'country', placeholder: 'Country' },
            { label: 'Phone', key: 'phone', placeholder: '+971 4 XXX XXXX' },
            { label: 'Email', key: 'email', placeholder: 'branch@platosplanet.ae' },
            { label: 'Max Capacity', key: 'capacity', placeholder: '150' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{field.label}</label>
              <input
                className="plato-input"
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={!form.name || !form.city}>
              {editBranch ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

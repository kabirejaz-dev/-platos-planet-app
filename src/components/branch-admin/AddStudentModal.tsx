import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Modal } from '@/components/ui/Modal'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { RequiredMark, RequiredFieldsNote } from '@/components/ui/FormField'
import { generateId } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import type { Curriculum } from '@/types'

const CURRICULA: Curriculum[] = ['IGCSE', 'A-Level', 'CBSE', 'IB', 'American']
const GRADES = ['Foundation', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Year 12', 'Year 13']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const emptyForm = {
  name: '', dateOfBirth: '', gender: 'Male' as 'Male' | 'Female', nationality: '', previousSchool: '',
  grade: GRADES[0], curriculum: '' as Curriculum | '', parentId: '', enrollmentDate: todayStr(), notes: '',
}

const emptyNewParent = { name: '', phone: '', email: '' }

interface AddStudentModalProps {
  open: boolean
  onClose: () => void
}

export function AddStudentModal({ open, onClose }: AddStudentModalProps) {
  const { currentUser, branches, parents, addStudent, addParent, updateParent } = useAppStore()
  const [form, setForm] = useState(emptyForm)
  const [creatingParent, setCreatingParent] = useState(false)
  const [newParent, setNewParent] = useState(emptyNewParent)

  const branch = branches.find((b) => b.id === currentUser?.branchId)
  const parentOptions = parents.map((p) => ({ id: p.id, label: p.name, sublabel: p.email }))

  const reset = () => {
    setForm(emptyForm); setCreatingParent(false); setNewParent(emptyNewParent)
  }
  const close = () => { onClose(); reset() }

  const canSubmit = Boolean(
    form.name.trim() && form.dateOfBirth && form.grade && form.curriculum && form.enrollmentDate &&
    (creatingParent ? newParent.name.trim() && newParent.phone.trim() : form.parentId)
  )

  const handleSubmit = () => {
    if (!canSubmit || !currentUser?.branchId) return

    const studentId = `st-${generateId()}`
    let parentId = form.parentId
    if (creatingParent) {
      parentId = `pr-${generateId()}`
      addParent({
        id: parentId,
        userId: `u-pr-${generateId()}`,
        name: newParent.name.trim(),
        email: newParent.email.trim() || `${newParent.name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: newParent.phone.trim(),
        studentIds: [studentId],
        branchId: currentUser.branchId,
      })
    } else {
      const existing = parents.find((p) => p.id === parentId)
      if (existing) updateParent(parentId, { studentIds: [...existing.studentIds, studentId] })
    }

    addStudent({
      id: studentId,
      userId: `u-st-${generateId()}`,
      name: form.name.trim(),
      email: `${form.name.trim().toLowerCase().replace(/\s+/g, '.')}@student.platosplanet.ae`,
      parentId,
      branchId: currentUser.branchId,
      curriculum: form.curriculum as Curriculum,
      grade: form.grade,
      enrollmentDate: form.enrollmentDate,
      status: 'active',
      xp: 0,
      streak: 0,
      planet: 'Mercury',
      subjects: [],
      batchIds: [],
      dateOfBirth: form.dateOfBirth,
      nationality: form.nationality.trim() || undefined,
      gender: form.gender,
      previousSchool: form.previousSchool.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })

    toast.success('Student added successfully', form.name.trim())
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Add Student" size="lg" isDirty={Boolean(form.name || form.parentId)}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name<RequiredMark /></label>
            <input className="plato-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Date of Birth<RequiredMark /></label>
            <input type="date" className="plato-input" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Gender</label>
            <select className="plato-input" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as 'Male' | 'Female' }))}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Nationality</label>
            <input className="plato-input" value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Current School (optional)</label>
          <input className="plato-input" value={form.previousSchool} onChange={(e) => setForm((f) => ({ ...f, previousSchool: e.target.value }))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Grade/Year<RequiredMark /></label>
            <select className="plato-input" value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Programme<RequiredMark /></label>
            <select className="plato-input" value={form.curriculum} onChange={(e) => setForm((f) => ({ ...f, curriculum: e.target.value as Curriculum }))}>
              <option value="">— Select Programme —</option>
              {CURRICULA.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Branch</label>
          <input className="plato-input opacity-60" readOnly value={branch?.name || '—'} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent/Guardian<RequiredMark /></label>
            <button type="button" className="text-[11px] text-[#4D7CFF] hover:underline" onClick={() => setCreatingParent((v) => !v)}>
              {creatingParent ? 'Choose existing parent' : '+ Create New Parent'}
            </button>
          </div>
          {creatingParent ? (
            <div className="grid grid-cols-2 gap-3">
              <input className="plato-input col-span-2" placeholder="Parent full name" value={newParent.name} onChange={(e) => setNewParent((p) => ({ ...p, name: e.target.value }))} />
              <input className="plato-input" placeholder="+971 50 XXX XXXX" value={newParent.phone} onChange={(e) => setNewParent((p) => ({ ...p, phone: e.target.value }))} />
              <input className="plato-input" placeholder="Email (optional)" value={newParent.email} onChange={(e) => setNewParent((p) => ({ ...p, email: e.target.value }))} />
            </div>
          ) : (
            <SearchableSelect options={parentOptions} value={form.parentId} onChange={(id) => setForm((f) => ({ ...f, parentId: id }))} placeholder="— Select Parent —" emptyLabel="No parents found" />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Enrolment Date<RequiredMark /></label>
          <input type="date" className="plato-input" value={form.enrollmentDate} onChange={(e) => setForm((f) => ({ ...f, enrollmentDate: e.target.value }))} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes (optional)</label>
          <textarea className="plato-input min-h-[60px]" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>

        <RequiredFieldsNote />

        <div className="flex gap-3 pt-2">
          <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={close}>Cancel</button>
          <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={handleSubmit} disabled={!canSubmit}>Add Student</button>
        </div>
      </div>
    </Modal>
  )
}

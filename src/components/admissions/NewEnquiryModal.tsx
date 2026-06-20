import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Modal } from '@/components/ui/Modal'
import { FieldError, RequiredMark, RequiredFieldsNote } from '@/components/ui/FormField'
import { generateId } from '@/lib/utils'
import { isValidUaePhone, UAE_PHONE_ERROR, isValidEmail, EMAIL_ERROR, useDirtyForm } from '@/lib/validation'
import { toast } from '@/components/ui/Toaster'
import type { Curriculum } from '@/types'

const PROGRAMMES = ['IGCSE', 'A-Level', 'CBSE', 'NEET/IIT-JEE', 'Robotics', 'Brainobrain', 'Oratory', 'IELTS', 'SATs', 'Languages']
const NATIONALITIES = ['Emirati', 'Indian', 'Pakistani', 'British', 'Filipino', 'Bangladeshi', 'Egyptian', 'Other']
const GRADE_LEVELS = ['Foundation', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`), 'A-Level Year 1', 'A-Level Year 2']
const SOURCES = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'Website' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'other', label: 'Other' },
] as const
const TIME_SLOTS = ['08:00–10:00', '10:00–12:00', '14:00–16:00', '16:00–18:00', '18:00–20:00']
const CURRICULA: Curriculum[] = ['IGCSE', 'A-Level', 'CBSE', 'IB', 'American']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function suggestGrade(dob: string): string {
  if (!dob) return ''
  const birthYear = new Date(dob).getFullYear()
  const est = new Date().getFullYear() - birthYear - 5
  if (est < 1) return 'Foundation'
  if (est <= 12) return `Grade ${est}`
  if (est === 13) return 'A-Level Year 1'
  return 'A-Level Year 2'
}

const emptyForm = {
  studentName: '', dateOfBirth: '', nationality: '', parentName: '',
  parentPhone: '', parentEmail: '', programme: PROGRAMMES[0], branchId: '',
  grade: '', source: 'whatsapp' as typeof SOURCES[number]['value'], referrerName: '',
  trialClass: true, trialDate: todayStr(), trialTimeSlot: TIME_SLOTS[0], notes: '',
}

interface NewEnquiryModalProps {
  open: boolean
  onClose: () => void
}

export function NewEnquiryModal({ open, onClose }: NewEnquiryModalProps) {
  const { branches, currentUser, addLead } = useAppStore()
  const { current: form, setCurrent: setForm, isDirty } = useDirtyForm(emptyForm)
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [gradeTouched, setGradeTouched] = useState(false)

  const close = () => { onClose(); setForm(emptyForm); setPhoneError(''); setEmailError(''); setGradeTouched(false) }

  const handleDobChange = (dob: string) => {
    const next = { ...form, dateOfBirth: dob }
    if (!gradeTouched) next.grade = suggestGrade(dob)
    setForm(next)
  }

  const handleSubmit = () => {
    if (form.parentPhone && !isValidUaePhone(form.parentPhone)) {
      setPhoneError(UAE_PHONE_ERROR)
      return
    }
    if (form.parentEmail && !isValidEmail(form.parentEmail)) {
      setEmailError(EMAIL_ERROR)
      return
    }
    const matchedCurriculum = CURRICULA.find((c) => c === form.programme) || 'IGCSE'
    const studentAge = form.dateOfBirth ? new Date().getFullYear() - new Date(form.dateOfBirth).getFullYear() : undefined

    addLead({
      id: `ld-${generateId()}`,
      parentName: form.parentName,
      parentEmail: form.parentEmail,
      parentPhone: form.parentPhone,
      studentName: form.studentName,
      studentAge,
      curriculum: matchedCurriculum,
      preferredProgramme: form.programme,
      subjects: [],
      grade: form.grade,
      source: form.source === 'other' ? 'website' : form.source,
      status: form.trialClass ? 'trial_scheduled' : 'new',
      assignedTo: currentUser?.id,
      branchId: form.branchId,
      notes: form.notes || undefined,
      trialDate: form.trialClass ? form.trialDate : undefined,
      trialTimeSlot: form.trialClass ? form.trialTimeSlot : undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      nationality: form.nationality || undefined,
      referrerName: form.source === 'referral' ? form.referrerName || undefined : undefined,
      createdAt: new Date().toISOString(),
    })

    const branchName = branches.find((b) => b.id === form.branchId)?.name || 'the branch'
    toast.success(`New enquiry added for ${form.studentName}. Assigned to ${branchName} admissions.`)
    close()
  }

  const canSubmit = Boolean(form.studentName && form.parentName && form.parentPhone && form.programme && form.branchId && form.source)

  return (
    <Modal open={open} onClose={close} title="New Enquiry" size="lg" isDirty={isDirty}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Student Name<RequiredMark /></label>
            <input className="plato-input" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Date of Birth</label>
            <input type="date" className="plato-input" value={form.dateOfBirth} onChange={(e) => handleDobChange(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Nationality</label>
            <input className="plato-input" list="nationality-list" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
            <datalist id="nationality-list">
              {NATIONALITIES.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Grade Level</label>
            <select className="plato-input" value={form.grade} onChange={(e) => { setGradeTouched(true); setForm({ ...form, grade: e.target.value }) }}>
              <option value="">— Select Grade —</option>
              {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Parent / Guardian Name<RequiredMark /></label>
            <input className="plato-input" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Parent Phone<RequiredMark /></label>
            <input
              className="plato-input"
              placeholder="+971 50 XXX XXXX"
              value={form.parentPhone}
              onChange={(e) => { setForm({ ...form, parentPhone: e.target.value }); if (phoneError) setPhoneError('') }}
              onBlur={() => setPhoneError(form.parentPhone && !isValidUaePhone(form.parentPhone) ? UAE_PHONE_ERROR : '')}
            />
            <FieldError message={phoneError} />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Parent Email</label>
            <input
              type="email"
              className="plato-input"
              value={form.parentEmail}
              onChange={(e) => { setForm({ ...form, parentEmail: e.target.value }); if (emailError) setEmailError('') }}
              onBlur={() => setEmailError(form.parentEmail && !isValidEmail(form.parentEmail) ? EMAIL_ERROR : '')}
            />
            <FieldError message={emailError} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Preferred Programme<RequiredMark /></label>
            <select className="plato-input" value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })}>
              {PROGRAMMES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Preferred Branch<RequiredMark /></label>
            <select className="plato-input" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="">— Select Branch —</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.city})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Lead Source<RequiredMark /></label>
            <select className="plato-input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as typeof form.source })}>
              {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {form.source === 'referral' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Referrer Name</label>
              <input className="plato-input" placeholder="Name of person who referred this student" value={form.referrerName} onChange={(e) => setForm({ ...form, referrerName: e.target.value })} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[13px] font-medium text-white/80">Trial Class</p>
          <button
            type="button"
            onClick={() => setForm({ ...form, trialClass: !form.trialClass })}
            className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
            style={{ background: form.trialClass ? '#00FFA3' : 'rgba(255,255,255,0.12)' }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: form.trialClass ? 22 : 2 }} />
          </button>
        </div>

        {form.trialClass && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Preferred Trial Date</label>
              <input type="date" className="plato-input" value={form.trialDate} onChange={(e) => setForm({ ...form, trialDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Preferred Time Slot</label>
              <select className="plato-input" value={form.trialTimeSlot} onChange={(e) => setForm({ ...form, trialTimeSlot: e.target.value })}>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
          <textarea className="plato-input min-h-[70px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <RequiredFieldsNote />

        <div className="flex gap-3 pt-2">
          <button className="btn-ghost flex-1 justify-center border border-dark-border min-h-[44px]" onClick={close}>Cancel</button>
          <button className="btn-primary flex-1 justify-center min-h-[44px]" onClick={handleSubmit} disabled={!canSubmit}>Add Enquiry</button>
        </div>
      </div>
    </Modal>
  )
}

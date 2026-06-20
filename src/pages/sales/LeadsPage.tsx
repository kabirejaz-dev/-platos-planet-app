import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { FieldError, fieldInputClass } from '@/components/ui/FormField'
import { generateId, formatDate, getStatusColor } from '@/lib/utils'
import { leadSchema, getFieldErrors } from '@/lib/schemas'
import { Plus, Search, Phone, Mail, ChevronRight, LayoutGrid, List, Calendar, CalendarPlus } from 'lucide-react'
import type { LeadStatus, Curriculum, Subject, Lead } from '@/types'
import { toast } from '@/components/ui/Toaster'

// Lead priority score — urgency (follow-up/trial timing or how fresh an
// uncontacted lead is), source quality, and programme demand (multi-subject
// requests). Bucketed into Hot (>=7) / Warm (4-6) / Cool (<=3).
function getLeadScore(lead: Lead): number {
  let score = 0
  if (lead.followUpDate) {
    const days = Math.ceil((new Date(lead.followUpDate).getTime() - Date.now()) / 86400000)
    if (days <= 2) score += 4
    else if (days <= 5) score += 1
  } else if (lead.status === 'new') {
    const ageDays = Math.ceil((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)
    if (ageDays <= 1) score += 3
    else if (ageDays <= 3) score += 1
  }
  const sourceScore: Record<Lead['source'], number> = { referral: 3, google_ads: 3, whatsapp: 2, social_media: 1, walk_in: 1, website: 1 }
  score += sourceScore[lead.source] ?? 0
  if (lead.subjects.length >= 3) score += 1
  if (lead.trialDate) {
    const tDays = Math.ceil((new Date(lead.trialDate).getTime() - Date.now()) / 86400000)
    if (tDays >= 0 && tDays <= 1) score += 2
  }
  return score
}

const PRIORITY_CONFIG = {
  hot:  { color: '#FF6B7A', label: 'Hot — follow up today' },
  warm: { color: '#FBBF24', label: 'Warm — follow up this week' },
  cool: { color: '#94A3B8', label: 'Cool — nurture' },
} as const

function getLeadPriority(lead: Lead): keyof typeof PRIORITY_CONFIG {
  const score = getLeadScore(lead)
  if (score >= 7) return 'hot'
  if (score >= 4) return 'warm'
  return 'cool'
}

const TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00']

const SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Business Studies', 'Accounting', 'Computer Science']
const CURRICULUMS: Curriculum[] = ['IGCSE', 'A-Level', 'CBSE']
const STATUSES: LeadStatus[] = ['new', 'contacted', 'trial_scheduled', 'trial_done', 'enrolled', 'lost']

const statusColors: Record<LeadStatus, string> = {
  new: '#4D7CFF', contacted: '#7B61FF', trial_scheduled: '#C6FF00',
  trial_done: '#00F0FF', enrolled: '#00FFA3', lost: '#FF6B7A',
}

const STAGE_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new:              { label: 'New',              color: '#4D7CFF', bg: 'rgba(77,124,255,0.08)' },
  contacted:        { label: 'Contacted',        color: '#7B61FF', bg: 'rgba(123,97,255,0.08)' },
  trial_scheduled:  { label: 'Trial Scheduled',  color: '#C6FF00', bg: 'rgba(198,255,0,0.08)' },
  trial_done:       { label: 'Trial Done',       color: '#00F0FF', bg: 'rgba(0,240,255,0.08)' },
  enrolled:         { label: 'Enrolled',         color: '#00FFA3', bg: 'rgba(0,255,163,0.08)' },
  lost:             { label: 'Lost',             color: '#FF6B7A', bg: 'rgba(255,107,122,0.08)' },
}

function KanbanCard({ lead, onClick, onScheduleTrial }: { lead: Lead; onClick: () => void; onScheduleTrial: () => void }) {
  const cfg = STAGE_CONFIG[lead.status]
  const priority = getLeadPriority(lead)
  const pc = PRIORITY_CONFIG[priority]
  const canScheduleTrial = ['contacted', 'trial_scheduled', 'trial_done'].includes(lead.status)
  return (
    <div
      onClick={onClick}
      className="plato-card p-3.5 cursor-pointer group"
      style={{ borderLeft: `3px solid ${cfg.color}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={lead.studentName} size="xs" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-white/85 truncate">{lead.studentName}</p>
          <p className="text-[10px] text-white/35 truncate">{lead.parentName}</p>
        </div>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          title={pc.label}
          style={{ background: pc.color, boxShadow: `0 0 5px ${pc.color}` }}
        />
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(77,124,255,0.15)', color: '#4D7CFF' }}>{lead.curriculum}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] text-white/40">{lead.grade}</span>
      </div>
      {lead.followUpDate && (
        <div className="flex items-center gap-1 text-[10px] text-white/30 mb-2">
          <Calendar size={10} />
          {formatDate(lead.followUpDate)}
        </div>
      )}
      {canScheduleTrial && (
        <button
          onClick={(e) => { e.stopPropagation(); onScheduleTrial() }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
          style={{ background: 'rgba(198,255,0,0.1)', color: '#C6FF00' }}
        >
          <CalendarPlus size={12} /> Schedule Trial →
        </button>
      )}
    </div>
  )
}

export default function LeadsPage() {
  const { leads, branches, teachers, currentUser, addLead, updateLead, addStudent, addUser, addNotification } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board')
  const [trialLeadId, setTrialLeadId] = useState<string | null>(null)
  const [trialForm, setTrialForm] = useState({ branchId: '', date: '', timeSlot: TIME_SLOTS[0], teacherId: '' })
  const [form, setForm] = useState({
    parentName: '', parentEmail: '', parentPhone: '',
    studentName: '', studentAge: '', grade: '',
    curriculum: 'IGCSE' as Curriculum,
    subjects: [] as Subject[],
    source: 'referral' as const,
    branchId: branches[0]?.id || '',
    notes: '',
  })
  const [errors, setErrors] = useState<Partial<Record<'studentName' | 'studentAge' | 'parentName' | 'parentEmail' | 'parentPhone', string>>>({})

  const filtered = leads.filter((l) => {
    const matchSearch = l.studentName.toLowerCase().includes(search.toLowerCase()) || l.parentName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleCreate = () => {
    const fieldErrors = getFieldErrors(leadSchema, form)
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    addLead({
      id: `ld-${generateId()}`,
      parentName: form.parentName,
      parentEmail: form.parentEmail,
      parentPhone: form.parentPhone,
      studentName: form.studentName,
      studentAge: Number(form.studentAge) || undefined,
      curriculum: form.curriculum,
      subjects: form.subjects,
      grade: form.grade,
      source: form.source,
      status: 'new',
      assignedTo: currentUser?.id,
      branchId: form.branchId,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    })
    setShowModal(false)
    setErrors({})
  }

  const handleEnroll = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return

    const userId = `u-st-${generateId()}`
    const studentId = `st-${generateId()}`

    addUser({ id: userId, name: lead.studentName, email: lead.parentEmail.replace('@', '.student@'), role: 'student', branchId: lead.branchId, isActive: true, createdAt: new Date().toISOString() })
    addStudent({
      id: studentId, userId, name: lead.studentName, email: lead.parentEmail.replace('@', '.student@'),
      branchId: lead.branchId, curriculum: lead.curriculum, grade: lead.grade,
      enrollmentDate: new Date().toISOString().split('T')[0], status: 'active',
      xp: 0, streak: 0, planet: 'Mercury', subjects: lead.subjects, batchIds: [],
    })
    updateLead(leadId, { status: 'enrolled', convertedAt: new Date().toISOString() })
    addNotification({ id: `notif-${generateId()}`, userId: currentUser?.id || '', title: 'Enrolment Successful', message: `${lead.studentName} has been enrolled successfully.`, type: 'success', isRead: false, createdAt: new Date().toISOString() })
    toast.success('Student enrolled! 🎉', `${lead.studentName} is now active`)
    setSelectedLead(null)
  }

  const detail = leads.find((l) => l.id === selectedLead)
  const trialLead = leads.find((l) => l.id === trialLeadId)
  const activeBranches = branches.filter((b) => b.isActive)
  const matchingTeachers = trialLead ? teachers.filter((t) => t.curriculums.includes(trialLead.curriculum)) : []

  const openTrialModal = (lead: Lead) => {
    setTrialLeadId(lead.id)
    setTrialForm({
      branchId: lead.branchId || activeBranches[0]?.id || '',
      date: '',
      timeSlot: TIME_SLOTS[0],
      teacherId: teachers.find((t) => t.curriculums.includes(lead.curriculum))?.id || '',
    })
  }

  const handleScheduleTrial = () => {
    if (!trialLead || !trialForm.date) return
    updateLead(trialLead.id, {
      status: 'trial_scheduled',
      branchId: trialForm.branchId,
      trialDate: trialForm.date,
      trialTimeSlot: trialForm.timeSlot,
    })
    toast.success('Trial class scheduled', `${formatDate(trialForm.date)} at ${trialForm.timeSlot}`)
    setTrialLeadId(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads Pipeline"
        subtitle={`${leads.length} total · ${leads.filter((l) => l.status === 'new').length} new · ${leads.filter((l) => l.status === 'enrolled').length} enrolled`}
        badge={<DemoBadge />}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <button onClick={() => setViewMode('board')} className="px-3 py-1.5 text-[12px] font-medium flex items-center gap-1.5 transition-colors" style={{ background: viewMode === 'board' ? 'rgba(77,124,255,0.2)' : 'transparent', color: viewMode === 'board' ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
                <LayoutGrid size={13} /> Board
              </button>
              <button onClick={() => setViewMode('list')} className="px-3 py-1.5 text-[12px] font-medium flex items-center gap-1.5 transition-colors" style={{ background: viewMode === 'list' ? 'rgba(77,124,255,0.2)' : 'transparent', color: viewMode === 'list' ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
                <List size={13} /> List
              </button>
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Lead
            </button>
          </div>
        }
      />

      {detail ? (
        // Lead detail view
        <div className="space-y-4">
          <button className="btn-ghost" onClick={() => setSelectedLead(null)}>← Back to leads</button>

          <div className="plato-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar name={detail.studentName} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-foreground font-display">{detail.studentName}</h2>
                  <p className="text-sm text-muted-foreground">{detail.curriculum} · {detail.grade}</p>
                </div>
              </div>
              <span className={getStatusColor(detail.status)} style={{ fontSize: 12 }}>{detail.status.replace('_', ' ')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent Details</h3>
                <p className="text-sm font-medium text-foreground">{detail.parentName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail size={14} />{detail.parentEmail}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone size={14} />{detail.parentPhone}</div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead Info</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium text-foreground capitalize">{detail.source.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium text-foreground">{formatDate(detail.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {detail.subjects.map((s) => <span key={s} className="badge-info">{s}</span>)}
                </div>
              </div>
            </div>

            {detail.notes && (
              <div className="mt-4 p-3 rounded-xl bg-white/3 border border-dark-border">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground">{detail.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {STATUSES.filter((s) => s !== detail.status && s !== 'lost').map((s) => (
              <button key={s} onClick={() => updateLead(detail.id, { status: s })} className="btn-ghost border border-dark-border text-sm" style={{ borderColor: `${statusColors[s]}40`, color: statusColors[s] }}>
                Move to: {s.replace('_', ' ')}
              </button>
            ))}
            {detail.status !== 'enrolled' && (
              <button onClick={() => handleEnroll(detail.id)} className="btn-primary">
                <UserCheck size={15} /> Enroll Student
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'board' ? (
        // Kanban board
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-3 min-w-max">
            {STATUSES.map((status) => {
              const colLeads = leads.filter((l) => l.status === status)
              const cfg = STAGE_CONFIG[status]
              return (
                <div key={status} className="flex-shrink-0 w-60">
                  {/* Column header */}
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-xl mb-2"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}
                  >
                    <span className="text-[12px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `${cfg.color}25`, color: cfg.color }}
                    >
                      {colLeads.length}
                    </span>
                  </div>
                  {/* Cards */}
                  <div className="space-y-2">
                    {colLeads.map((lead) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => setSelectedLead(lead.id)}
                        onScheduleTrial={() => openTrialModal(lead)}
                      />
                    ))}
                    {colLeads.length === 0 && (
                      <div
                        className="rounded-xl p-4 text-center text-[11px]"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }}
                      >
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // List view
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${statusFilter === 'all' ? 'bg-[#4D7CFF] text-white' : 'bg-white/5 text-muted-foreground hover:text-foreground'}`}>
              All ({leads.length})
            </button>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all`} style={statusFilter === s ? { background: STAGE_CONFIG[s].color, color: '#000' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(100,116,139,0.8)' }}>
                {STAGE_CONFIG[s].label} ({leads.filter((l) => l.status === s).length})
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="plato-input pl-8" placeholder="Search by student or parent…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="plato-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full plato-table">
                <thead><tr><th>Student</th><th>Parent</th><th>Curriculum</th><th>Subjects</th><th>Source</th><th>Status</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="cursor-pointer" onClick={() => setSelectedLead(lead.id)}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={lead.studentName} size="xs" />
                          <span className="font-medium text-foreground">{lead.studentName}</span>
                        </div>
                      </td>
                      <td><div><p className="text-sm text-foreground">{lead.parentName}</p><p className="text-xs text-muted-foreground">{lead.parentPhone}</p></div></td>
                      <td><span className="badge-info">{lead.curriculum}</span></td>
                      <td><div className="flex flex-wrap gap-1">{lead.subjects.slice(0, 2).map((s) => <span key={s} className="badge-purple text-xs">{s}</span>)}{lead.subjects.length > 2 && <span className="text-xs text-muted-foreground">+{lead.subjects.length - 2}</span>}</div></td>
                      <td className="text-muted-foreground capitalize text-xs">{lead.source.replace('_', ' ')}</td>
                      <td><span className={getStatusColor(lead.status)}>{lead.status.replace('_', ' ')}</span></td>
                      <td className="text-muted-foreground text-xs">{formatDate(lead.createdAt)}</td>
                      <td><ChevronRight size={16} className="text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setErrors({}) }} title="Add New Lead" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Student Name', key: 'studentName', placeholder: 'Full name' },
            { label: 'Student Age', key: 'studentAge', placeholder: '15', type: 'number' },
            { label: 'Grade / Year', key: 'grade', placeholder: 'Grade 10 / Year 12' },
            { label: 'Parent Name', key: 'parentName', placeholder: 'Full name' },
            { label: 'Parent Email', key: 'parentEmail', placeholder: 'parent@gmail.com', type: 'email' },
            { label: 'Parent Phone', key: 'parentPhone', placeholder: '+971 50 XXX XXXX' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input
                type={f.type || 'text'}
                className={fieldInputClass(errors[f.key as keyof typeof errors])}
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form] as string}
                onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); if (errors[f.key as keyof typeof errors]) setErrors({ ...errors, [f.key]: undefined }) }}
              />
              <FieldError message={errors[f.key as keyof typeof errors]} />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Curriculum</label>
            <select className="plato-input" value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value as Curriculum })}>
              {CURRICULUMS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Source</label>
            <select className="plato-input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as typeof form.source })}>
              {['website', 'walk_in', 'referral', 'social_media', 'google_ads', 'whatsapp'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button key={s} type="button"
                  onClick={() => setForm({ ...form, subjects: form.subjects.includes(s) ? form.subjects.filter((x) => x !== s) : [...form.subjects, s] })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${form.subjects.includes(s) ? 'bg-[#4D7CFF] text-white border-[#4D7CFF]' : 'border-dark-border text-muted-foreground hover:text-foreground'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea className="plato-input resize-none h-20" placeholder="Any additional notes about the lead…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => { setShowModal(false); setErrors({}) }}>Cancel</button>
          <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.studentName || !form.parentPhone}>Add Lead</button>
        </div>
      </Modal>

      {/* Schedule Trial Class modal */}
      <Modal open={!!trialLead} onClose={() => setTrialLeadId(null)} title="Schedule Trial Class" size="sm">
        {trialLead && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(77,124,255,0.06)' }}>
              <p className="text-[13px] font-semibold text-white/85">{trialLead.studentName}</p>
              <p className="text-[11px] text-white/40">{trialLead.curriculum} · {trialLead.grade}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Branch</label>
              <select className="plato-input" value={trialForm.branchId} onChange={(e) => setTrialForm((f) => ({ ...f, branchId: e.target.value }))}>
                {activeBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" className="plato-input" value={trialForm.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setTrialForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Time Slot</label>
                <select className="plato-input" value={trialForm.timeSlot} onChange={(e) => setTrialForm((f) => ({ ...f, timeSlot: e.target.value }))}>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Teacher</label>
              <select className="plato-input" value={trialForm.teacherId} onChange={(e) => setTrialForm((f) => ({ ...f, teacherId: e.target.value }))}>
                <option value="">Select teacher…</option>
                {matchingTeachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.subjects.join(', ')}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setTrialLeadId(null)}>Cancel</button>
              <button className="btn-primary flex-1 justify-center" onClick={handleScheduleTrial} disabled={!trialForm.date}>Schedule Trial</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function UserCheck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}

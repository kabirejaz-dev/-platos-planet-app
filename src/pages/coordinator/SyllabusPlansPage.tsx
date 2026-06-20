import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Modal } from '@/components/ui/Modal'
import { generateId } from '@/lib/utils'
import { CheckCircle2, Circle, Loader2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import type { SyllabusTopic } from '@/types'

// Each top-level syllabus topic is treated as a "chapter" — drilling into it
// shows a generic lesson-stage checklist. This breakdown is presentational
// only (local state) since the data model tracks chapter-level status, not
// per-stage granularity.
const CHAPTER_STAGES = ['Introduce concept', 'Worked examples', 'Practice problems', 'Review & quiz']

const STATUS_CONFIG = {
  completed: { color: '#00FFA3', icon: <CheckCircle2 size={13} /> },
  in_progress: { color: '#FBBF24', icon: <Loader2 size={13} /> },
  pending: { color: 'rgba(255,255,255,0.3)', icon: <Circle size={13} /> },
}

const NEXT_STATUS: Record<SyllabusTopic['status'], SyllabusTopic['status']> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

export default function SyllabusPlansPage() {
  const { syllabusPlans, batches, addSyllabusPlan, updateSyllabusPlan } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ batchId: batches[0]?.id || '', term: '', topicsText: '' })
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [stageChecks, setStageChecks] = useState<Record<string, boolean[]>>({})

  const toggleExpand = (planId: string, topicIdx: number) => {
    const key = `${planId}-${topicIdx}`
    setExpandedKey((k) => (k === key ? null : key))
    setStageChecks((s) => (s[key] ? s : { ...s, [key]: CHAPTER_STAGES.map(() => false) }))
  }

  const toggleStage = (key: string, idx: number) => {
    setStageChecks((s) => ({ ...s, [key]: s[key].map((v, i) => (i === idx ? !v : v)) }))
  }

  const cycleTopic = (planId: string, topicIdx: number) => {
    const plan = syllabusPlans.find((p) => p.id === planId)
    if (!plan) return
    const topics = plan.topics.map((t, i) => i === topicIdx ? { ...t, status: NEXT_STATUS[t.status] } : t)
    updateSyllabusPlan(planId, { topics })
  }

  const handleCreate = () => {
    const batch = batches.find((b) => b.id === form.batchId)
    if (!batch || !form.term || !form.topicsText.trim()) return
    const topics: SyllabusTopic[] = form.topicsText.split('\n').map((line) => line.trim()).filter(Boolean).map((title, i) => ({
      title, weekNumber: i + 1, status: 'pending',
    }))
    addSyllabusPlan({
      id: `syl-${generateId()}`,
      batchId: batch.id,
      subject: batch.subject,
      curriculum: batch.curriculum,
      term: form.term,
      topics,
    })
    setShowModal(false)
    setForm({ batchId: batches[0]?.id || '', term: '', topicsText: '' })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Syllabus Plans"
        subtitle="Termly and weekly syllabus plans for all curricula and subjects — click a topic to advance its status"
        badge={<DemoBadge />}
        actions={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> New Plan</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {syllabusPlans.map((plan) => {
          const batch = batches.find((b) => b.id === plan.batchId)
          const completed = plan.topics.filter((t) => t.status === 'completed').length
          const progress = Math.round((completed / plan.topics.length) * 100)
          const progressColor = progress >= 75 ? '#00FFA3' : progress >= 40 ? '#FBBF24' : '#FF6B7A'

          return (
            <div key={plan.id} className="plato-card p-5">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[14px] font-bold text-white/90">{plan.subject} — {plan.curriculum}</p>
                  <p className="text-[12px] text-white/40">{batch?.name} · {plan.term}</p>
                </div>
                <span className="text-[13px] font-bold" style={{ color: progressColor }}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progressColor }} />
              </div>
              <div className="space-y-1">
                {plan.topics.map((topic, i) => {
                  const cfg = STATUS_CONFIG[topic.status]
                  const key = `${plan.id}-${i}`
                  const isExpanded = expandedKey === key
                  const checks = stageChecks[key]
                  return (
                    <div key={i}>
                      <div className="w-full flex items-center gap-2.5 rounded-lg p-1 -mx-1">
                        <button onClick={() => cycleTopic(plan.id, i)} className="flex items-center gap-2.5 flex-1 text-left hover:bg-white/3 rounded-lg transition-colors">
                          <span style={{ color: cfg.color }}>{cfg.icon}</span>
                          <span className="text-[12px] flex-1" style={{ color: topic.status === 'pending' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)' }}>{topic.title}</span>
                        </button>
                        <span className="text-[10px] text-white/25">Wk {topic.weekNumber}</span>
                        <button onClick={() => toggleExpand(plan.id, i)} className="text-white/25 hover:text-white/60 flex-shrink-0">
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                      {isExpanded && checks && (
                        <div className="ml-6 mt-1 mb-2 space-y-1.5 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                          {CHAPTER_STAGES.map((stage, si) => (
                            <button
                              key={si}
                              onClick={() => toggleStage(key, si)}
                              className="w-full flex items-center gap-2 text-left"
                            >
                              {checks[si] ? <CheckCircle2 size={12} className="text-[#00FFA3]" /> : <Circle size={12} className="text-white/20" />}
                              <span className="text-[11px]" style={{ color: checks[si] ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>{stage}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Syllabus Plan">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Batch</label>
            <select className="plato-input" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Term</label>
            <input className="plato-input" placeholder="e.g. Term 3 2024-25" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Topics (one per line, in order)</label>
            <textarea
              className="plato-input min-h-[140px]"
              placeholder={'Forces & Motion\nEnergy & Work\nWaves'}
              value={form.topicsText}
              onChange={(e) => setForm({ ...form, topicsText: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.batchId || !form.term || !form.topicsText.trim()}>Create Plan</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

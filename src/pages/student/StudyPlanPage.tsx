import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Sparkles, CheckCircle2, Circle, Clock, Target } from 'lucide-react'
import type { Subject, StudyTopic } from '@/types'

const PRIORITY_COLOR: Record<StudyTopic['priority'], string> = { high: '#FF6B7A', medium: '#FBBF24', low: '#4D7CFF' }

const TOPIC_BANK: Record<Subject, string[]> = {
  Physics: ['Forces & Free Body Diagrams', 'Circular Motion Practice', 'Past Paper — Mechanics', 'Electricity Revision Sheet'],
  Chemistry: ['Organic Mechanisms Review', 'Titration Calculations', 'Past Paper — Organic Chemistry', 'Periodic Trends Flashcards'],
  Biology: ['Cell Division Diagrams', 'Enzyme Kinetics Practice', 'Past Paper — Genetics', 'Ecosystem Case Studies'],
  Mathematics: ['Integration Techniques', 'Past Paper — Pure 1', 'Statistics Problem Set', 'Vectors Revision'],
  English: ['Unseen Poetry Practice', 'Essay Structure Review', 'Past Paper — Reading Comprehension', 'Vocabulary Builder'],
  'Business Studies': ['Marketing Mix Case Study', 'Past Paper — Business Studies', 'Financial Ratios Practice'],
  Accounting: ['Ledger Entries Practice', 'Past Paper — Accounting', 'Financial Statements Review'],
  'Computer Science': ['Algorithm Tracing Practice', 'Past Paper — Computer Science', 'Binary & Logic Gates Review'],
  Economics: ['Market Structures Essay', 'Past Paper — Macroeconomics', 'Elasticity Calculations'],
  History: ['Source Analysis Practice', 'Past Paper — History', 'Timeline Revision'],
  Geography: ['Case Study Review', 'Past Paper — Geography', 'Map Skills Practice'],
  Arabic: ['Grammar Revision', 'Past Paper — Arabic', 'Vocabulary Builder'],
  French: ['Grammar Revision', 'Past Paper — French', 'Vocabulary Builder'],
}

export default function StudyPlanPage() {
  const { currentUser, students, studyPlans, addStudyPlan, updateStudyPlan } = useAppStore()
  const student = students.find((s) => s.userId === currentUser?.id)
  const [subject, setSubject] = useState<Subject>(student?.subjects[0] || 'Physics')

  const myPlans = studyPlans.filter((p) => p.studentId === student?.id)
  const activePlan = myPlans.find((p) => p.subject === subject)

  const handleGenerate = () => {
    if (!student) return
    const topics: StudyTopic[] = TOPIC_BANK[subject].slice(0, 4).map((title, i) => ({
      id: `sp-${generateId()}`,
      title,
      estimatedHours: [1.5, 1, 2, 1.5][i],
      priority: (['high', 'high', 'medium', 'low'] as const)[i],
      completed: false,
      dueDate: new Date(Date.now() + (i + 1) * 3 * 86400000).toISOString().split('T')[0],
    }))
    if (activePlan) {
      updateStudyPlan(student.id, subject, { topics, generatedAt: new Date().toISOString() })
    } else {
      addStudyPlan({ studentId: student.id, subject, weeklyGoal: 6, topics, generatedAt: new Date().toISOString() })
    }
    toast.success('Study plan generated', `New AI study plan for ${subject} is ready.`)
  }

  const toggleTopic = (topicId: string) => {
    if (!student || !activePlan) return
    const topics = activePlan.topics.map((t) => t.id === topicId ? { ...t, completed: !t.completed } : t)
    updateStudyPlan(student.id, subject, { topics })
  }

  if (!student) return <div className="text-white/30 p-6">No linked student found.</div>

  const completedCount = activePlan?.topics.filter((t) => t.completed).length || 0
  const totalHours = activePlan?.topics.reduce((s, t) => s + t.estimatedHours, 0) || 0

  return (
    <div className="space-y-5">
      <PageHeader
        title="Study Plan"
        subtitle="Demo: auto-generated from a sample topic bank — not yet driven by a real AI model"
        actions={
          <div className="flex gap-2">
            <select className="plato-input text-[13px]" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
              {student.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn-primary" onClick={handleGenerate}><Sparkles size={14} /> {activePlan ? 'Regenerate' : 'Generate'}</button>
          </div>
        }
      />

      {activePlan ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="plato-card p-4 text-center">
              <Target size={16} className="mx-auto mb-2 text-[#4D7CFF]" />
              <p className="text-[20px] font-bold font-display text-white/85">{completedCount}/{activePlan.topics.length}</p>
              <p className="text-[11px] text-white/30 mt-1">Topics Completed</p>
            </div>
            <div className="plato-card p-4 text-center">
              <Clock size={16} className="mx-auto mb-2 text-[#7B61FF]" />
              <p className="text-[20px] font-bold font-display text-white/85">{totalHours}h</p>
              <p className="text-[11px] text-white/30 mt-1">Estimated Total</p>
            </div>
            <div className="plato-card p-4 text-center">
              <Sparkles size={16} className="mx-auto mb-2 text-[#00FFA3]" />
              <p className="text-[20px] font-bold font-display text-white/85">{activePlan.weeklyGoal}h</p>
              <p className="text-[11px] text-white/30 mt-1">Weekly Goal</p>
            </div>
          </div>

          <div className="plato-card overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-white/70">{subject} Plan</h3>
              <p className="text-[11px] text-white/30">Generated {formatDate(activePlan.generatedAt)}</p>
            </div>
            <div className="divide-y divide-white/5">
              {activePlan.topics.map((topic) => (
                <button key={topic.id} onClick={() => toggleTopic(topic.id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/3 transition-colors">
                  {topic.completed ? <CheckCircle2 size={18} className="text-[#00FFA3] flex-shrink-0" /> : <Circle size={18} className="text-white/20 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium ${topic.completed ? 'text-white/40 line-through' : 'text-white/85'}`}>{topic.title}</p>
                    <p className="text-[11px] text-white/30">{topic.estimatedHours}h · Due {topic.dueDate ? formatDate(topic.dueDate) : '—'}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize flex-shrink-0" style={{ background: `${PRIORITY_COLOR[topic.priority]}15`, color: PRIORITY_COLOR[topic.priority] }}>{topic.priority}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyState icon={<Sparkles size={24} />} title="No study plan yet" description={`Generate a sample study plan for ${subject} from our topic bank (demo — not a real AI model yet).`} action={<button className="btn-primary" onClick={handleGenerate}><Sparkles size={14} /> Generate Study Plan</button>} />
      )}
    </div>
  )
}

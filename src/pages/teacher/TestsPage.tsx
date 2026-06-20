import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { FieldError, fieldInputClass } from '@/components/ui/FormField'
import { generateId, formatDate, gradeFromPercentage, getGradeColor, getStatusColor } from '@/lib/utils'
import { assessmentSchema, getFieldErrors } from '@/lib/schemas'
import { Plus, BarChart3, Clock, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TestsPage() {
  const { currentUser, teachers, batches, students, assessments, addAssessment, updateAssessment } = useAppStore()
  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  const myBatches = batches.filter((b) => b.teacherId === teacher?.id)
  const myAssessments = assessments.filter((a) => a.teacherId === teacher?.id)

  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [marks, setMarks] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    batchId: myBatches[0]?.id || '',
    title: '',
    type: 'quiz' as 'quiz' | 'test' | 'mock_exam' | 'assignment',
    date: '',
    maxMarks: '100',
    duration: '60',
    topics: '',
  })
  const [errors, setErrors] = useState<Partial<Record<'title' | 'date' | 'maxMarks' | 'duration', string>>>({})

  const handleCreate = () => {
    if (!teacher) return
    const fieldErrors = getFieldErrors(assessmentSchema, form)
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    const batch = batches.find((b) => b.id === form.batchId)
    addAssessment({
      id: `as-${generateId()}`,
      batchId: form.batchId,
      teacherId: teacher.id,
      title: form.title,
      subject: batch?.subject || 'Physics',
      curriculum: batch?.curriculum || 'IGCSE',
      type: form.type,
      date: form.date,
      maxMarks: Number(form.maxMarks),
      duration: Number(form.duration),
      status: new Date(form.date) > new Date() ? 'upcoming' : 'completed',
      syllabusTopics: form.topics.split(',').map((t) => t.trim()).filter(Boolean),
      results: [],
    })
    setShowModal(false)
    setErrors({})
  }

  const saveResults = (assessmentId: string) => {
    const assessment = myAssessments.find((a) => a.id === assessmentId)
    if (!assessment) return
    const batch = batches.find((b) => b.id === assessment.batchId)
    const results = (batch?.studentIds || []).map((studentId) => {
      const m = Number(marks[studentId] || 0)
      const pct = Math.round((m / assessment.maxMarks) * 100)
      return { studentId, marks: m, percentage: pct, grade: gradeFromPercentage(pct) }
    })
    updateAssessment(assessmentId, { results, status: 'graded' })
    setSelectedId(null)
  }

  const selected = myAssessments.find((a) => a.id === selectedId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tests & Assessments"
        subtitle={`${myAssessments.length} assessments · ${myAssessments.filter((a) => a.status === 'upcoming').length} upcoming`}
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Assessment
          </button>
        }
      />

      {selected ? (
        <div className="space-y-4">
          <button className="btn-ghost" onClick={() => setSelectedId(null)}>← Back</button>

          <div className="plato-card p-5">
            <h2 className="text-xl font-bold text-foreground font-display">{selected.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className={getStatusColor(selected.status)}>{selected.status}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {selected.duration} min</span>
              <span className="flex items-center gap-1"><Star size={12} /> {selected.maxMarks} marks</span>
              <span>📅 {formatDate(selected.date)}</span>
            </div>
            {selected.syllabusTopics && selected.syllabusTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selected.syllabusTopics.map((t) => (
                  <span key={t} className="badge-info">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Enter results */}
          {selected.status !== 'graded' && (
            <div className="plato-card overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-dark-border">
                <h3 className="text-sm font-semibold text-foreground">Enter Results</h3>
                <button className="btn-primary py-2 text-sm" onClick={() => saveResults(selected.id)}>
                  Save Results
                </button>
              </div>
              <div className="divide-y divide-dark-border/50">
                {(batches.find((b) => b.id === selected.batchId)?.studentIds || []).map((sid) => {
                  const student = students.find((s) => s.id === sid)
                  if (!student) return null
                  const pct = marks[sid] ? Math.round((Number(marks[sid]) / selected.maxMarks) * 100) : 0
                  return (
                    <div key={sid} className="flex items-center gap-4 px-5 py-3">
                      <Avatar name={student.name} size="sm" />
                      <p className="flex-1 text-sm font-medium text-foreground">{student.name}</p>
                      <input
                        type="number"
                        min="0"
                        max={selected.maxMarks}
                        placeholder={`0–${selected.maxMarks}`}
                        className="plato-input w-28 text-center"
                        value={marks[sid] || ''}
                        onChange={(e) => setMarks({ ...marks, [sid]: e.target.value })}
                      />
                      {marks[sid] && (
                        <span className={`text-sm font-bold ${getGradeColor(gradeFromPercentage(pct))}`}>
                          {gradeFromPercentage(pct)} ({pct}%)
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Results chart */}
          {selected.status === 'graded' && selected.results.length > 0 && (
            <div className="plato-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={selected.results.map((r) => ({ name: students.find((s) => s.id === r.studentId)?.name?.split(' ')[0] || '?', marks: r.marks, percentage: r.percentage }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, selected.maxMarks]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2940', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="marks" fill="#4D7CFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="overflow-x-auto mt-4">
                <table className="w-full plato-table">
                  <thead><tr><th>Student</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead>
                  <tbody>
                    {selected.results.map((r) => {
                      const student = students.find((s) => s.id === r.studentId)
                      return (
                        <tr key={r.studentId}>
                          <td>
                            <div className="flex items-center gap-2">
                              {student && <Avatar name={student.name} size="xs" />}
                              <span className="font-medium text-foreground">{student?.name}</span>
                            </div>
                          </td>
                          <td className="font-semibold text-foreground">{r.marks}/{selected.maxMarks}</td>
                          <td className="text-muted-foreground">{r.percentage}%</td>
                          <td><span className={`font-bold ${getGradeColor(r.grade)}`}>{r.grade}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myAssessments.map((a) => {
            const batch = batches.find((b) => b.id === a.batchId)
            const avgScore = a.results.length > 0 ? Math.round(a.results.reduce((s, r) => s + r.percentage, 0) / a.results.length) : null

            return (
              <div key={a.id} onClick={() => setSelectedId(a.id)} className="plato-card p-5 cursor-pointer hover:shadow-card-hover hover:border-[#7B61FF]/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center">
                    <BarChart3 size={20} className="text-[#7B61FF]" />
                  </div>
                  <span className={getStatusColor(a.status)}>{a.status}</span>
                </div>
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{batch?.name}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="badge-purple">{a.type.replace('_', ' ')}</span>
                  <span>📅 {formatDate(a.date)}</span>
                </div>
                {avgScore !== null && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#7B61FF]" style={{ width: `${avgScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-[#7B61FF]">{avgScore}% avg</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setErrors({}) }} title="Create Assessment">
        <div className="space-y-4">
          {[
            { label: 'Batch', key: 'batchId', type: 'select' },
            { label: 'Title', key: 'title', placeholder: 'e.g. IGCSE Physics Mock Paper 2' },
            { label: 'Type', key: 'type', type: 'select' },
            { label: 'Date', key: 'date', type: 'date' },
            { label: 'Max Marks', key: 'maxMarks', type: 'number', placeholder: '100' },
            { label: 'Duration (min)', key: 'duration', type: 'number', placeholder: '60' },
            { label: 'Syllabus Topics (comma separated)', key: 'topics', placeholder: 'Forces, Motion, Energy' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{f.label}</label>
              {f.type === 'select' && f.key === 'batchId' ? (
                <select className="plato-input" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}>
                  {myBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              ) : f.type === 'select' && f.key === 'type' ? (
                <select className="plato-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>
                  <option value="quiz">Quiz</option>
                  <option value="test">Test</option>
                  <option value="mock_exam">Mock Exam</option>
                  <option value="assignment">Assignment</option>
                </select>
              ) : (
                <>
                  <input type={f.type || 'text'} className={fieldInputClass(errors[f.key as keyof typeof errors])} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  <FieldError message={errors[f.key as keyof typeof errors]} />
                </>
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => { setShowModal(false); setErrors({}) }}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleCreate} disabled={!form.title || !form.date}>Create</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

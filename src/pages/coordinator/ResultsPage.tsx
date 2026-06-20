import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { formatDate, gradeFromPercentage, getGradeColor } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Award, Eye, Pencil } from 'lucide-react'

export default function ResultsPage() {
  const { batches, students, assessments, updateAssessment } = useAppStore()
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [marks, setMarks] = useState<Record<string, string>>({})

  const activeBatches = batches.filter((b) => b.status === 'active')
  const gradedAssessments = assessments.filter((a) => a.status === 'graded' && a.results.length > 0)
  const filtered = selectedBatch === 'all' ? gradedAssessments : gradedAssessments.filter((a) => a.batchId === selectedBatch)

  // Grade distribution
  const gradeCount: Record<string, number> = { 'A*': 0, A: 0, B: 0, C: 0, D: 0, E: 0, U: 0 }
  filtered.forEach((a) => {
    a.results.forEach((sub) => {
      const grade = gradeFromPercentage(sub.percentage)
      gradeCount[grade] = (gradeCount[grade] || 0) + 1
    })
  })

  const gradeColors: Record<string, string> = { 'A*': '#00FFA3', A: '#4D7CFF', B: '#7B61FF', C: '#FBBF24', D: '#FF9500', E: '#FF6B7A', U: '#64748B' }
  const gradeChartData = Object.entries(gradeCount).map(([grade, count]) => ({ grade, count, color: gradeColors[grade] }))

  // Top performers
  const studentScores: Record<string, { total: number; count: number; name: string }> = {}
  filtered.forEach((a) => {
    a.results.forEach((sub) => {
      const student = students.find((s) => s.id === sub.studentId)
      if (!student) return
      if (!studentScores[sub.studentId]) studentScores[sub.studentId] = { total: 0, count: 0, name: student.name }
      studentScores[sub.studentId].total += Math.round((sub.marks / a.maxMarks) * 100)
      studentScores[sub.studentId].count++
    })
  })

  const rankings = Object.entries(studentScores)
    .map(([id, { total, count, name }]) => ({ id, name, avg: Math.round(total / count), grade: gradeFromPercentage(Math.round(total / count)) }))
    .sort((a, b) => b.avg - a.avg)

  const viewing = assessments.find((a) => a.id === viewingId)
  const editing = assessments.find((a) => a.id === editingId)

  const openEdit = (id: string) => {
    const a = assessments.find((x) => x.id === id)
    if (!a) return
    const seed: Record<string, string> = {}
    a.results.forEach((r) => { seed[r.studentId] = String(r.marks) })
    setMarks(seed)
    setEditingId(id)
  }

  const saveGrades = () => {
    if (!editing) return
    const results = editing.results.map((r) => {
      const m = Number(marks[r.studentId] ?? r.marks)
      const pct = Math.round((m / editing.maxMarks) * 100)
      return { studentId: r.studentId, marks: m, percentage: pct, grade: gradeFromPercentage(pct) }
    })
    updateAssessment(editing.id, { results })
    toast.success('Grades updated', editing.title)
    setEditingId(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Results"
        subtitle={`${filtered.length} graded assessments`}
        badge={<DemoBadge />}
        actions={
          <select className="plato-input text-[13px]" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="all">All Batches</option>
            {activeBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grade distribution chart */}
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={gradeChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="grade" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {gradeChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 performers */}
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Top Performers</h3>
          <div className="space-y-3">
            {rankings.slice(0, 6).map(({ id, name, avg, grade }, idx) => {
              const student = students.find((s) => s.id === id)
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-white/25 w-5">{idx + 1}</span>
                  {student && <Avatar name={name} size="xs" />}
                  <span className="flex-1 text-[13px] text-white/75 font-medium truncate">{name}</span>
                  <span className={`text-[13px] font-bold ${getGradeColor(grade)}`}>{grade}</span>
                  <span className="text-[12px] text-white/40 w-10 text-right">{avg}%</span>
                </div>
              )
            })}
            {rankings.length === 0 && <p className="text-[13px] text-white/30 text-center py-6">No graded results yet.</p>}
          </div>
        </div>
      </div>

      {/* Assessment list */}
      <div className="plato-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-white/70">All Graded Assessments</h3>
        </div>
        <table className="w-full plato-table">
          <thead><tr><th>Assessment</th><th>Subject</th><th>Date</th><th>Submissions</th><th>Avg Score</th><th>Top Grade</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.slice(0, 15).map((a) => {
              const subs = a.results
              const avg = subs.length > 0 ? Math.round(subs.reduce((sum, s) => sum + (s.marks / a.maxMarks) * 100, 0) / subs.length) : 0
              const topGrade = avg > 0 ? gradeFromPercentage(avg) : '—'
              return (
                <tr key={a.id}>
                  <td><p className="font-medium text-[13px] text-white/85">{a.title}</p><p className="text-[10px] text-white/30">{a.type}</p></td>
                  <td className="text-[12px] text-white/55">{a.subject}</td>
                  <td className="text-[12px] text-white/40">{formatDate(a.date)}</td>
                  <td className="text-[12px] text-white/60">{subs.length}</td>
                  <td><span className="text-[13px] font-semibold" style={{ color: avg >= 80 ? '#00FFA3' : avg >= 60 ? '#4D7CFF' : '#FF6B7A' }}>{avg > 0 ? `${avg}%` : '—'}</span></td>
                  <td><span className={`text-[13px] font-bold ${getGradeColor(topGrade)}`}>{topGrade}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost text-[11px]" onClick={() => setViewingId(a.id)}><Eye size={12} /> View Submissions</button>
                      <button className="btn-ghost text-[11px]" onClick={() => openEdit(a.id)}><Pencil size={12} /> Enter Grades</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Award size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-[13px]">No graded assessments for this filter.</p>
          </div>
        )}
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewingId(null)} title={viewing ? `Submissions — ${viewing.title}` : 'Submissions'}>
        {viewing && (
          <div className="space-y-3">
            <p className="text-[12px] text-white/40">{viewing.subject} · {formatDate(viewing.date)} · Out of {viewing.maxMarks} marks</p>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {viewing.results.map((r) => {
                const student = students.find((s) => s.id === r.studentId)
                return (
                  <div key={r.studentId} className="flex items-center gap-3 py-2.5">
                    {student && <Avatar name={student.name} size="xs" />}
                    <span className="flex-1 text-[13px] text-white/75">{student?.name || r.studentId}</span>
                    <span className="text-[12px] text-white/50">{r.marks}/{viewing.maxMarks}</span>
                    <span className="text-[12px] text-white/40 w-10 text-right">{r.percentage}%</span>
                    <span className={`text-[13px] font-bold w-6 text-right ${getGradeColor(r.grade)}`}>{r.grade}</span>
                  </div>
                )
              })}
              {viewing.results.length === 0 && <p className="text-[13px] text-white/30 text-center py-6">No submissions recorded.</p>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditingId(null)} title={editing ? `Enter Grades — ${editing.title}` : 'Enter Grades'}>
        {editing && (
          <div className="space-y-4">
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {editing.results.map((r) => {
                const student = students.find((s) => s.id === r.studentId)
                return (
                  <div key={r.studentId} className="flex items-center gap-3 py-2.5">
                    {student && <Avatar name={student.name} size="xs" />}
                    <span className="flex-1 text-[13px] text-white/75">{student?.name || r.studentId}</span>
                    <input
                      type="number"
                      min="0"
                      max={editing.maxMarks}
                      className="plato-input w-24 text-center"
                      value={marks[r.studentId] ?? ''}
                      onChange={(e) => setMarks((m) => ({ ...m, [r.studentId]: e.target.value }))}
                    />
                    <span className="text-[11px] text-white/30 w-12">/ {editing.maxMarks}</span>
                  </div>
                )
              })}
              {editing.results.length === 0 && <p className="text-[13px] text-white/30 text-center py-6">No submissions to grade yet.</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="btn-primary flex-1 justify-center" onClick={saveGrades}>Save Grades</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

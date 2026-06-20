import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency, formatDate, getStatusColor, getPlanetEmoji, calculateAttendanceRate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { UserCheck, ClipboardList, DollarSign, ArrowRight, MessageSquare } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function ParentDashboard() {
  const { currentUser, parents, students, attendance, homework, assessments, invoices, messages } = useAppStore()

  const parent = parents.find((p) => p.userId === currentUser?.id)
  const myStudents = students.filter((s) => parent?.studentIds.includes(s.id))
  const student = myStudents[0]

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">No student linked to your account.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Contact your branch admin to link your child's profile.</p>
      </div>
    )
  }

  const studentAtt = attendance.filter((a) => a.studentId === student.id)
  const attRate = calculateAttendanceRate(studentAtt.filter((a) => a.status === 'present').length, studentAtt.length)
  const pendingHW = homework.filter((h) => student.batchIds.includes(h.batchId) && h.status === 'assigned').length
  const studentInvoices = invoices.filter((i) => i.studentId === student.id)
  const outstandingFees = studentInvoices.filter((i) => ['pending', 'overdue'].includes(i.status)).reduce((s, i) => s + i.totalAmount, 0)
  const unreadMessages = messages.filter((m) => m.toId === currentUser?.id && !m.isRead).length

  const myAssessments = assessments.filter((a) => a.results.some((r) => r.studentId === student.id))
  const avgScore = myAssessments.length > 0
    ? Math.round(myAssessments.reduce((sum, a) => { const r = a.results.find((r) => r.studentId === student.id); return sum + (r?.percentage || 0) }, 0) / myAssessments.length)
    : 0

  const subjectData = student.subjects.slice(0, 5).map((sub) => {
    const subAssessments = assessments.filter((a) => a.subject === sub && a.results.some((r) => r.studentId === student.id))
    const avg = subAssessments.length > 0
      ? Math.round(subAssessments.reduce((s, a) => { const r = a.results.find((r) => r.studentId === student.id); return s + (r?.percentage || 0) }, 0) / subAssessments.length)
      : 65 + Math.floor(Math.random() * 25)
    return { subject: sub.slice(0, 4), value: avg }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Parent Dashboard" subtitle={`Monitoring ${student.name}`} badge={<DemoBadge />} />

      {/* Student card */}
      <div className="plato-card p-5 bg-gradient-to-br from-[#4D7CFF]/10 to-[#7B61FF]/10 border-[#4D7CFF]/20">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground font-display">{student.name}</h2>
            <p className="text-sm text-muted-foreground">{student.curriculum} · {student.grade}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {getPlanetEmoji(student.planet)} {student.planet}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-[#C6FF00] font-semibold">🔥 {student.streak} day streak</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-[#7B61FF] font-semibold">⚡ {student.xp.toLocaleString()} XP</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#4D7CFF] font-display">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attendance" value={`${attRate}%`} icon={<UserCheck size={18} />} color={attRate >= 80 ? '#00FFA3' : '#FF6B7A'} demo={false} sub={`${studentAtt.length} classes`} />
        <StatCard label="Homework Pending" value={pendingHW} icon={<ClipboardList size={18} />} color="#7B61FF" demo={false} />
        <StatCard label="Outstanding Fees" value={formatCurrency(outstandingFees)} icon={<DollarSign size={18} />} color={outstandingFees > 0 ? '#FF6B7A' : '#00FFA3'} demo={false} />
        <StatCard label="Unread Messages" value={unreadMessages} icon={<MessageSquare size={18} />} color="#4D7CFF" demo={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject performance radar */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Subject Performance</h3>
            <DemoBadge />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={subjectData}>
              <PolarGrid stroke="#1E2940" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#4D7CFF" fill="#4D7CFF" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent assessments */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Results</h3>
            <Link to="/parent/exams" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {myAssessments.slice(0, 4).map((a) => {
              const result = a.results.find((r) => r.studentId === student.id)
              return (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ background: (result?.percentage || 0) >= 80 ? '#00FFA3' : (result?.percentage || 0) >= 60 ? '#C6FF00' : '#FF6B7A' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subject} · {formatDate(a.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{result?.marks}/{a.maxMarks}</p>
                    <p className="text-xs text-muted-foreground">{result?.grade}</p>
                  </div>
                </div>
              )
            })}
            {myAssessments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No results yet.</p>}
          </div>
        </div>
      </div>

      {/* Fee overview */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Fee Status</h3>
          <Link to="/parent/fees" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
            <thead><tr><th>Invoice</th><th>Description</th><th>Amount</th><th>Status</th><th>Due</th><th></th></tr></thead>
            <tbody>
              {studentInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-[#4D7CFF]">{inv.invoiceNumber}</td>
                  <td className="text-sm text-muted-foreground">{inv.items[0]?.description}</td>
                  <td className="font-bold text-foreground">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                  <td><span className={getStatusColor(inv.status)}>{inv.status}</span></td>
                  <td className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</td>
                  <td>
                    {inv.status !== 'paid' && (
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-[#4D7CFF]/10 text-[#4D7CFF] hover:bg-[#4D7CFF]/20 transition-colors">
                        Pay Online
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

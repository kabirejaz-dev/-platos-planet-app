import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Avatar } from '@/components/ui/Avatar'
import { calculateAttendanceRate, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { GraduationCap, Users, BookOpen, UserCheck, ArrowRight, Plus, ClipboardCheck, HeartPulse } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function BranchAdminDashboard() {
  const { currentUser, students, teachers, batches, attendance, branches, invoices, branchRequests } = useAppStore()

  const branchId = currentUser?.branchId
  const branch = branches.find((b) => b.id === branchId)

  const branchStudents = students.filter((s) => s.branchId === branchId && s.status === 'active')
  const branchTeachers = teachers.filter((t) => t.branchId === branchId && t.isActive)
  const branchBatches = batches.filter((b) => b.branchId === branchId && b.status === 'active')

  const today = new Date().toISOString().split('T')[0]
  const todayAtt = attendance.filter((a) => a.date === today && branchBatches.some((b) => b.id === a.batchId))
  const todayRate = calculateAttendanceRate(todayAtt.filter((a) => a.status === 'present').length, todayAtt.length)

  const branchInvoices = invoices.filter((i) => i.branchId === branchId)
  const outstandingInvoices = branchInvoices.filter((i) => i.status === 'pending' || i.status === 'overdue')
  const outstandingTotal = outstandingInvoices.reduce((s, i) => s + (i.totalAmount - (i.paidAmount || 0)), 0)
  const outstandingCurrency = outstandingInvoices[0]?.currency ?? 'AED'
  const pendingBranchRequests = branchRequests.filter((r) => r.branchId === branchId && r.status === 'pending')
  const capacityPct = branch?.capacity ? Math.round((branchStudents.length / branch.capacity) * 100) : null

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayAtt = attendance.filter((a) => a.date === dateStr && branchBatches.some((b) => b.id === a.batchId))
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      present: dayAtt.filter((a) => a.status === 'present').length,
      absent: dayAtt.filter((a) => a.status === 'absent').length,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={branch?.name || 'Branch Dashboard'}
        subtitle={`${branch?.city}, ${branch?.country}`}
        actions={
          <Link to="/branch-admin/students" className="btn-primary">
            <Plus size={16} /> Add Student
          </Link>
        }
      />

      {/* Branch health snapshot */}
      <div className="plato-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse size={16} className="text-[#4D7CFF]" />
          <h3 className="text-sm font-semibold text-foreground">{(branch?.name || 'Branch').toUpperCase()} — HEALTH SNAPSHOT</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Enrolment</p>
            <p className="text-sm font-semibold text-foreground">
              {branchStudents.length}{branch?.capacity ? `/${branch.capacity} students` : ' students'} <span className="text-muted-foreground font-normal">{capacityPct !== null ? `(${capacityPct}% capacity)` : ''}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Attendance today</p>
            <p className="text-sm font-semibold text-foreground">
              {todayAtt.length === 0 ? 'Not marked yet' : `${todayAtt.filter((a) => a.status === 'present').length}/${todayAtt.length} (${todayRate}%)`}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Outstanding fees</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(outstandingTotal, outstandingCurrency)} <span className="text-muted-foreground font-normal">({outstandingInvoices.length} invoice{outstandingInvoices.length === 1 ? '' : 's'})</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pending requests</p>
            <p className="text-sm font-semibold text-foreground">{pendingBranchRequests.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students" value={branchStudents.length} icon={<GraduationCap size={18} />} color="#4D7CFF" progress={{ current: branchStudents.length, max: branch?.capacity || 0 }} />
        <StatCard label="Teachers" value={branchTeachers.length} icon={<Users size={18} />} color="#7B61FF" />
        <StatCard label="Active Batches" value={branchBatches.length} icon={<BookOpen size={18} />} color="#00F0FF" />
        <StatCard
          label="Today Attendance"
          value={todayAtt.length === 0 ? 'Not marked yet' : `${todayRate}%`}
          icon={<UserCheck size={18} />}
          color={todayAtt.length === 0 ? '#FBBF24' : todayRate >= 80 ? '#00FFA3' : '#FF6B7A'}
         
        />
      </div>

      {/* Attendance chart */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Weekly Attendance</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekDays} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" />
            <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2940', borderRadius: 12, fontSize: 12 }} />
            <Bar animationDuration={600} dataKey="present" fill="#00FFA3" radius={[4, 4, 0, 0]} name="Present" />
            <Bar animationDuration={600} dataKey="absent" fill="#FF6B7A" radius={[4, 4, 0, 0]} name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active batches */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Active Batches</h3>
            <Link to="/branch-admin/batches" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {branchBatches.slice(0, 5).map((batch) => {
              const teacher = teachers.find((t) => t.id === batch.teacherId)
              return (
                <div key={batch.id} className="flex items-center gap-3 py-2 border-b border-dark-border/50 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{batch.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher?.name} · {batch.room || 'No room'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{batch.studentIds.length}/{batch.maxCapacity}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              )
            })}
          </div>
          <Link
            to="/branch-admin/attendance"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#FBBF24' }}
          >
            <ClipboardCheck size={15} /> Mark Today's Attendance <ArrowRight size={14} />
          </Link>
        </div>

        {/* Students needing attention */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Students — Low Attendance</h3>
            <Link to="/branch-admin/attendance" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {branchStudents.map((student) => {
              const studentAtt = attendance.filter((a) => a.studentId === student.id)
              const attRate = calculateAttendanceRate(studentAtt.filter((a) => a.status === 'present').length, studentAtt.length)
              if (attRate >= 80 || studentAtt.length === 0) return null
              return (
                <div key={student.id} className="flex items-center gap-3">
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.curriculum}</p>
                  </div>
                  <span className="badge-danger">{attRate}%</span>
                </div>
              )
            }).filter(Boolean).slice(0, 5)}
            {branchStudents.every((s) => {
              const att = attendance.filter((a) => a.studentId === s.id)
              return calculateAttendanceRate(att.filter((a) => a.status === 'present').length, att.length) >= 80 || att.length === 0
            }) && <p className="text-sm text-[#00FFA3] text-center py-4">All students have good attendance! ✓</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { formatCurrency, calculateAttendanceRate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { CalendarCheck, DollarSign, GraduationCap, Users } from 'lucide-react'

export default function BranchReportsPage() {
  const { currentUser, students, attendance, assessments, invoices, batches, teachers } = useAppStore()
  const branchId = currentUser?.branchId

  const branchStudents = students.filter((s) => !branchId || s.branchId === branchId)
  const branchBatchIds = batches.filter((b) => !branchId || b.branchId === branchId).map((b) => b.id)
  const branchAttendance = attendance.filter((a) => branchBatchIds.includes(a.batchId))
  const branchAssessments = assessments.filter((a) => branchBatchIds.includes(a.batchId) && a.status === 'graded')
  const branchInvoices = invoices.filter((i) => !branchId || i.branchId === branchId)
  const branchTeachers = teachers.filter((t) => !branchId || t.branchId === branchId)

  const presentCount = branchAttendance.filter((a) => a.status === 'present' || a.status === 'late').length
  const attendanceRate = calculateAttendanceRate(presentCount, branchAttendance.length)

  const allResults = branchAssessments.flatMap((a) => a.results)
  const avgScore = allResults.length > 0 ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / allResults.length) : 0

  const revenue = branchInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0)
  const outstanding = branchInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.totalAmount, 0)

  // Weekly attendance trend (last 4 weeks)
  const weeks = [3, 2, 1, 0].map((w) => {
    const weekRecords = branchAttendance.filter((a) => {
      const days = Math.floor((Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24))
      return days >= w * 7 && days < (w + 1) * 7
    })
    const present = weekRecords.filter((a) => a.status === 'present' || a.status === 'late').length
    return { week: `Week ${4 - w}`, rate: calculateAttendanceRate(present, weekRecords.length) }
  })

  return (
    <div className="space-y-5">
      <PageHeader title="Branch Reports" subtitle="Comprehensive branch reports including attendance, academics, and revenue" badge={<DemoBadge />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="plato-card p-4 text-center">
          <Users size={18} className="mx-auto mb-2 text-[#4D7CFF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{branchStudents.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Students</p>
        </div>
        <div className="plato-card p-4 text-center">
          <CalendarCheck size={18} className="mx-auto mb-2 text-[#00FFA3]" />
          <p className="text-[20px] font-bold font-display text-[#00FFA3]">{attendanceRate}%</p>
          <p className="text-[11px] text-white/30 mt-1">Attendance Rate</p>
        </div>
        <div className="plato-card p-4 text-center">
          <GraduationCap size={18} className="mx-auto mb-2 text-[#7B61FF]" />
          <p className="text-[20px] font-bold font-display text-white/85">{avgScore}%</p>
          <p className="text-[11px] text-white/30 mt-1">Avg Assessment Score</p>
        </div>
        <div className="plato-card p-4 text-center">
          <DollarSign size={18} className="mx-auto mb-2 text-[#FBBF24]" />
          <p className="text-[16px] font-bold font-display text-white/85">{formatCurrency(revenue)}</p>
          <p className="text-[11px] text-white/30 mt-1">Revenue Collected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Attendance Trend (4 weeks)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeks} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Line type="monotone" dataKey="rate" stroke="#00FFA3" strokeWidth={2} dot={{ fill: '#00FFA3', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="plato-card p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest">Revenue Summary</h3>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/50">Collected</span>
            <span className="text-[14px] font-bold text-[#00FFA3]">{formatCurrency(revenue)}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full bg-[#00FFA3]" style={{ width: `${revenue + outstanding > 0 ? Math.round((revenue / (revenue + outstanding)) * 100) : 0}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/50">Outstanding</span>
            <span className="text-[14px] font-bold text-[#FF6B7A]">{formatCurrency(outstanding)}</span>
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[12px] text-white/50">Active Teachers</span>
            <span className="text-[13px] font-semibold text-white/80">{branchTeachers.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/50">Active Batches</span>
            <span className="text-[13px] font-semibold text-white/80">{branchBatchIds.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { formatDate, getStatusColor } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, TrendingUp, GraduationCap, Clock, Plus } from 'lucide-react'
import { NewEnquiryModal } from '@/components/admissions/NewEnquiryModal'

const STATUS_COLORS: Record<string, string> = {
  new: '#4D7CFF', contacted: '#7B61FF', trial_scheduled: '#FBBF24',
  trial_done: '#00F0FF', enrolled: '#00FFA3', lost: '#FF6B7A',
}

export default function AdmissionsOverviewPage() {
  const { leads, branches } = useAppStore()
  const [showNewEnquiry, setShowNewEnquiry] = useState(false)

  const total = leads.length
  const enrolled = leads.filter((l) => l.status === 'enrolled').length
  const inProgress = leads.filter((l) => !['enrolled', 'lost'].includes(l.status)).length
  const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0

  const byBranch = branches.map((b) => {
    const branchLeads = leads.filter((l) => l.branchId === b.id)
    return {
      branch: b.name,
      total: branchLeads.length,
      enrolled: branchLeads.filter((l) => l.status === 'enrolled').length,
    }
  })

  const statusCounts: Record<string, number> = {}
  leads.forEach((l) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1 })
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace('_', ' '), count, color: STATUS_COLORS[status],
  }))

  const recent = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Admissions Overview"
        subtitle="Consolidated view of all leads and enrolments across branches"
        actions={
          <button className="btn-primary" onClick={() => setShowNewEnquiry(true)}>
            <Plus size={16} /> New Enquiry
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={total} icon={<Users size={18} />} color="#4D7CFF" />
        <StatCard label="Enrolled" value={enrolled} icon={<GraduationCap size={18} />} color="#00FFA3" />
        <StatCard label="In Pipeline" value={inProgress} icon={<Clock size={18} />} color="#FBBF24" />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp size={18} />} color="#7B61FF" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Leads by Branch</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byBranch} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="branch" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar animationDuration={600} dataKey="total" name="Total Leads" fill="#4D7CFF" radius={[6, 6, 0, 0]} />
              <Bar animationDuration={600} dataKey="enrolled" name="Enrolled" fill="#00FFA3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="plato-card p-5">
          <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-widest mb-4">Pipeline by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="status" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar animationDuration={600} dataKey="count" radius={[6, 6, 0, 0]}>
                {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="plato-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-white/70">Recent Leads</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full plato-table">
          <thead><tr><th>Student</th><th>Branch</th><th>Curriculum</th><th>Source</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {recent.map((l) => {
              const branch = branches.find((b) => b.id === l.branchId)
              return (
                <tr key={l.id}>
                  <td><p className="font-medium text-[13px] text-white/85">{l.studentName}</p><p className="text-[11px] text-white/30">{l.parentName}</p></td>
                  <td className="text-[12px] text-white/55">{branch?.name}</td>
                  <td className="text-[12px] text-white/55">{l.curriculum}</td>
                  <td className="text-[12px] text-white/40 capitalize">{l.source.replace('_', ' ')}</td>
                  <td><span className={getStatusColor(l.status)}>{l.status.replace('_', ' ')}</span></td>
                  <td className="text-[12px] text-white/40">{formatDate(l.createdAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      <NewEnquiryModal open={showNewEnquiry} onClose={() => setShowNewEnquiry(false)} />
    </div>
  )
}

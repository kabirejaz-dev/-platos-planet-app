import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, getStatusColor } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Award, Check, X } from 'lucide-react'

const TYPE_LABEL: Record<string, string> = { merit: 'Merit-Based', need_based: 'Need-Based', sibling: 'Sibling Discount', staff: 'Staff Discount' }

export default function ScholarshipsPage() {
  const { scholarships, students, updateScholarship } = useAppStore()
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  const filtered = scholarships
    .filter((s) => filter === 'all' || s.status === 'pending')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  const pendingCount = scholarships.filter((s) => s.status === 'pending').length
  const approvedCount = scholarships.filter((s) => s.status === 'approved').length

  const handleDecision = (id: string, status: 'approved' | 'rejected', requestedPercentage: number) => {
    updateScholarship(id, { status, approvedPercentage: status === 'approved' ? requestedPercentage : 0, reviewedBy: 'current-user' })
    toast.success(`Application ${status}`, status === 'approved' ? `Scholarship of ${requestedPercentage}% approved.` : 'Application has been rejected.')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Scholarships" subtitle={`${pendingCount} pending review · ${approvedCount} approved`} />

      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {(['pending', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize" style={{ background: filter === f ? 'rgba(77,124,255,0.2)' : 'transparent', color: filter === f ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((app) => {
          const student = students.find((s) => s.id === app.studentId)
          return (
            <div key={app.id} className="plato-card p-4 flex items-start gap-4">
              {student && <Avatar name={student.name} size="sm" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-bold text-white/85">{student?.name || 'Unknown Student'}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#7B61FF]/10 text-[#7B61FF]">{TYPE_LABEL[app.type]}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/5 text-white/50">Requested {app.requestedPercentage}%</span>
                </div>
                <p className="text-[12px] text-white/45 mt-1.5">{app.reason}</p>
                <p className="text-[11px] text-white/30 mt-1">{student?.curriculum} · {student?.grade} · Submitted {formatDate(app.submittedAt)}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                {app.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDecision(app.id, 'rejected', app.requestedPercentage)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FF6B7A]/10 text-[#FF6B7A] hover:bg-[#FF6B7A]/20 transition-colors"><X size={14} /></button>
                    <button onClick={() => handleDecision(app.id, 'approved', app.requestedPercentage)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00FFA3]/10 text-[#00FFA3] hover:bg-[#00FFA3]/20 transition-colors"><Check size={14} /></button>
                  </div>
                ) : (
                  <div>
                    <span className={getStatusColor(app.status)}>{app.status}</span>
                    {app.status === 'approved' && <p className="text-[11px] text-white/30 mt-1">{app.approvedPercentage}% granted</p>}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <EmptyState icon={<Award size={24} />} title="No applications" description={filter === 'pending' ? 'No scholarship applications awaiting review.' : 'No applications found.'} />
        )}
      </div>
    </div>
  )
}

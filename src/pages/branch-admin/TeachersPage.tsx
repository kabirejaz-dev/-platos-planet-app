import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Mail, Phone, Star, Award } from 'lucide-react'

export default function TeachersPage() {
  const { currentUser, teachers, batches } = useAppStore()

  const branchTeachers = teachers.filter((t) =>
    currentUser?.branchId ? t.branchId === currentUser.branchId : true
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Teachers"
        subtitle={`${branchTeachers.length} faculty members`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#4D7CFF]">{branchTeachers.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Faculty</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#00FFA3]">{branchTeachers.filter((t) => t.isActive).length}</p>
          <p className="text-[11px] text-white/30 mt-1">Active</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[24px] font-bold font-display text-[#FBBF24]">
            {(branchTeachers.reduce((s, t) => s + t.rating, 0) / (branchTeachers.length || 1)).toFixed(1)}
          </p>
          <p className="text-[11px] text-white/30 mt-1">Avg Rating</p>
        </div>
      </div>

      {/* Teacher cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {branchTeachers.map((teacher) => {
          const myBatches = batches.filter((b) => b.teacherId === teacher.id && b.status === 'active')
          const myStudentCount = new Set(myBatches.flatMap((b) => b.studentIds)).size
          const stars = Math.round(teacher.rating)

          return (
            <div key={teacher.id} className="plato-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <Avatar name={teacher.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-white/90">{teacher.name}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{teacher.qualification}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} fill={i < stars ? '#FBBF24' : 'none'} style={{ color: i < stars ? '#FBBF24' : 'rgba(255,255,255,0.2)' }} />
                    ))}
                    <span className="text-[11px] text-white/30 ml-1">{teacher.rating}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${teacher.isActive ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-white/5 text-white/30'}`}>
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-1">
                {teacher.subjects.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(77,124,255,0.12)', color: '#4D7CFF' }}>{s}</span>
                ))}
              </div>

              {/* Curricula */}
              <div className="flex flex-wrap gap-1">
                {teacher.curriculums.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(123,97,255,0.1)', color: '#7B61FF' }}>{c}</span>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-[16px] font-bold text-[#4D7CFF]">{myBatches.length}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Batches</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-[16px] font-bold text-[#7B61FF]">{myStudentCount}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Students</p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5 pt-1 border-t border-white/5">
                <div className="flex items-center gap-2 text-[11px] text-white/35">
                  <Mail size={11} /> {teacher.email}
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <Phone size={11} /> {teacher.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-[11px] text-white/35">
                  <Award size={11} /> {teacher.experience} years experience
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

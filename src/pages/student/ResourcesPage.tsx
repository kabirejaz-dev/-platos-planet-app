import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { FileText, Presentation, Video, Link2, File, BookOpen } from 'lucide-react'
import type { ClassNote } from '@/types'

const FILE_ICON: Record<ClassNote['fileType'], ReactNode> = {
  pdf: <FileText size={16} />, doc: <File size={16} />, slides: <Presentation size={16} />, video: <Video size={16} />, link: <Link2 size={16} />,
}

export default function ResourcesPage() {
  const { currentUser, students, batches, classNotes, teachers } = useAppStore()
  const student = students.find((s) => s.userId === currentUser?.id)
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  if (!student) return <div className="text-white/30 p-6">No linked student found.</div>

  const myNotes = classNotes
    .filter((n) => student.batchIds.includes(n.batchId))
    .filter((n) => subjectFilter === 'all' || n.subject === subjectFilter)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  const subjects = Array.from(new Set(classNotes.filter((n) => student.batchIds.includes(n.batchId)).map((n) => n.subject)))

  return (
    <div className="space-y-5">
      <PageHeader title="Resources" subtitle="Past papers, notes, and learning materials uploaded by your teachers" badge={<DemoBadge />} />

      <div className="flex gap-1 p-1 rounded-xl w-fit flex-wrap" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {['all', ...subjects].map((s) => (
          <button key={s} onClick={() => setSubjectFilter(s)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all" style={{ background: subjectFilter === s ? 'rgba(77,124,255,0.2)' : 'transparent', color: subjectFilter === s ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myNotes.map((note) => {
          const batch = batches.find((b) => b.id === note.batchId)
          const teacher = teachers.find((t) => t.id === note.teacherId)
          return (
            <div key={note.id} className="plato-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#4D7CFF]/10 text-[#4D7CFF]">{FILE_ICON[note.fileType]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white/85">{note.title}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{batch?.name}</p>
                  {note.description && <p className="text-[11px] text-white/40 mt-1.5">{note.description}</p>}
                  <p className="text-[10px] text-white/25 mt-2">{teacher?.name} · {formatDate(note.uploadedAt)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {myNotes.length === 0 && (
        <EmptyState icon={<BookOpen size={24} />} title="No resources yet" description="Your teachers haven't shared any materials for these subjects yet." />
      )}
    </div>
  )
}

import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { generateId, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Plus, FileText, Presentation, Video, Link2, File, Upload, NotebookPen, Lock, ClipboardList, ArrowRight } from 'lucide-react'
import type { ClassNote, LessonLog } from '@/types'

const FILE_ICON: Record<ClassNote['fileType'], ReactNode> = {
  pdf: <FileText size={16} />, doc: <File size={16} />, slides: <Presentation size={16} />, video: <Video size={16} />, link: <Link2 size={16} />,
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function ClassNotesPage() {
  const { currentUser, teachers, batches, homework, classNotes, lessonLogs, addClassNote, addLessonLog, updateLessonLog } = useAppStore()
  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  const myBatches = batches.filter((b) => b.teacherId === teacher?.id)
  const myNotes = classNotes.filter((n) => n.teacherId === teacher?.id)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  const myLogs = lessonLogs.filter((l) => l.teacherId === teacher?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const [tab, setTab] = useState<'log' | 'materials'>('log')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(myLogs[0]?.id ?? null)
  const [isNewLog, setIsNewLog] = useState(false)
  const [logForm, setLogForm] = useState({ batchId: myBatches[0]?.id || '', date: todayStr(), topicCovered: '', homeworkId: '', nextClassPlan: '', privateNotes: '' })
  const [uploadForm, setUploadForm] = useState({ batchId: myBatches[0]?.id || '', title: '', description: '', fileType: 'pdf' as ClassNote['fileType'] })

  const selectedLog = isNewLog ? null : myLogs.find((l) => l.id === selectedLogId)

  const startNewLog = () => {
    setIsNewLog(true)
    setSelectedLogId(null)
    setLogForm({ batchId: myBatches[0]?.id || '', date: todayStr(), topicCovered: '', homeworkId: '', nextClassPlan: '', privateNotes: '' })
  }

  const openLog = (log: LessonLog) => {
    setIsNewLog(false)
    setSelectedLogId(log.id)
    setLogForm({ batchId: log.batchId, date: log.date, topicCovered: log.topicCovered, homeworkId: log.homeworkId || '', nextClassPlan: log.nextClassPlan, privateNotes: log.privateNotes || '' })
  }

  const saveLog = () => {
    if (!teacher || !logForm.batchId || !logForm.topicCovered) return
    if (isNewLog) {
      const id = `log-${generateId()}`
      addLessonLog({
        id, batchId: logForm.batchId, teacherId: teacher.id, date: logForm.date,
        topicCovered: logForm.topicCovered, homeworkId: logForm.homeworkId || undefined,
        nextClassPlan: logForm.nextClassPlan, privateNotes: logForm.privateNotes || undefined,
      })
      setSelectedLogId(id)
      setIsNewLog(false)
      toast.success('Lesson log saved')
    } else if (selectedLog) {
      updateLessonLog(selectedLog.id, {
        batchId: logForm.batchId, date: logForm.date, topicCovered: logForm.topicCovered,
        homeworkId: logForm.homeworkId || undefined, nextClassPlan: logForm.nextClassPlan,
        privateNotes: logForm.privateNotes || undefined,
      })
      toast.success('Lesson log updated')
    }
  }

  const handleUpload = () => {
    if (!teacher || !uploadForm.batchId || !uploadForm.title) return
    const batch = batches.find((b) => b.id === uploadForm.batchId)
    addClassNote({
      id: `note-${generateId()}`,
      batchId: uploadForm.batchId,
      teacherId: teacher.id,
      title: uploadForm.title,
      description: uploadForm.description || undefined,
      subject: batch?.subject || 'Physics',
      fileType: uploadForm.fileType,
      uploadedAt: new Date().toISOString(),
    })
    toast.success('Note shared', `${uploadForm.title} is now visible to students.`)
    setShowUploadModal(false)
    setUploadForm({ batchId: myBatches[0]?.id || '', title: '', description: '', fileType: 'pdf' })
  }

  const getBatchName = (batchId: string) => batches.find((b) => b.id === batchId)?.name ?? 'Unknown batch'
  const myBatchHomework = homework.filter((h) => h.batchId === logForm.batchId)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Class Notes"
        subtitle="Keep a private lesson-by-lesson log, and share materials with students"
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {([
          { key: 'log', label: 'Lesson Log', icon: <NotebookPen size={13} /> },
          { key: 'materials', label: 'Shared Materials', icon: <Upload size={13} /> },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5"
            style={{ background: tab === t.key ? 'rgba(77,124,255,0.2)' : 'transparent', color: tab === t.key ? '#4D7CFF' : 'rgba(255,255,255,0.4)' }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'log' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* List panel */}
          <div className="plato-card overflow-hidden lg:col-span-1">
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-[13px] font-bold text-white/70">By Class & Date</h3>
              <button onClick={startNewLog} className="text-[#4D7CFF] hover:text-[#7B61FF]" title="New lesson log" aria-label="New lesson log">
                <Plus size={16} />
              </button>
            </div>
            <div className="divide-y max-h-[520px] overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {myLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => openLog(log)}
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{ background: selectedLogId === log.id && !isNewLog ? 'rgba(77,124,255,0.08)' : 'transparent' }}
                >
                  <p className="text-[12px] font-semibold text-white/85 truncate">{getBatchName(log.batchId)}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{formatDate(log.date)}</p>
                  <p className="text-[11px] text-white/40 mt-1 line-clamp-1">{log.topicCovered}</p>
                </button>
              ))}
              {myLogs.length === 0 && !isNewLog && (
                <div className="p-2">
                  <EmptyState icon={<ClipboardList size={22} />} title="No lesson logs yet" description="Log your first class session." action={<button className="btn-primary" onClick={startNewLog}><Plus size={13} /> New Log</button>} />
                </div>
              )}
            </div>
          </div>

          {/* Editor panel */}
          <div className="plato-card p-5 lg:col-span-2">
            {!isNewLog && !selectedLog ? (
              <p className="text-[13px] text-white/30 text-center py-16">Select a lesson log, or create a new one.</p>
            ) : (
              <div className="space-y-4">
                <h3 className="text-[14px] font-bold text-white/85">{isNewLog ? 'New Lesson Log' : 'Edit Lesson Log'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Class</label>
                    <select className="plato-input" value={logForm.batchId} onChange={(e) => setLogForm((f) => ({ ...f, batchId: e.target.value, homeworkId: '' }))}>
                      {myBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Date</label>
                    <input type="date" className="plato-input" value={logForm.date} onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Topic Covered</label>
                  <textarea className="plato-input resize-none h-20" placeholder="What did you teach in this class?" value={logForm.topicCovered} onChange={(e) => setLogForm((f) => ({ ...f, topicCovered: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Homework Set (links to an assignment)</label>
                  <select className="plato-input" value={logForm.homeworkId} onChange={(e) => setLogForm((f) => ({ ...f, homeworkId: e.target.value }))}>
                    <option value="">None</option>
                    {myBatchHomework.map((h) => <option key={h.id} value={h.id}>{h.title} (due {formatDate(h.dueDate)})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Next Class Plan</label>
                  <input className="plato-input" placeholder="What's planned for the next session?" value={logForm.nextClassPlan} onChange={(e) => setLogForm((f) => ({ ...f, nextClassPlan: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={11} /> Private Notes (only you can see this)
                  </label>
                  <textarea className="plato-input resize-none h-16" placeholder="Notes for yourself — not visible to students or parents" value={logForm.privateNotes} onChange={(e) => setLogForm((f) => ({ ...f, privateNotes: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  {!isNewLog && <button className="btn-ghost text-[12px]" onClick={() => { setSelectedLogId(null); setIsNewLog(false) }}>Close</button>}
                  <button className="btn-primary text-[12px]" onClick={saveLog} disabled={!logForm.batchId || !logForm.topicCovered}>
                    {isNewLog ? 'Save Log' : 'Update Log'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => setShowUploadModal(true)}><Plus size={15} /> Upload Note</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myNotes.map((note) => {
              const batch = batches.find((b) => b.id === note.batchId)
              return (
                <div key={note.id} className="plato-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#4D7CFF]/10 text-[#4D7CFF]">
                      {FILE_ICON[note.fileType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white/85">{note.title}</p>
                      <p className="text-[11px] text-white/35 mt-0.5">{batch?.name}</p>
                      {note.description && <p className="text-[11px] text-white/40 mt-1.5">{note.description}</p>}
                      <p className="text-[10px] text-white/25 mt-2">{formatDate(note.uploadedAt)} · {note.subject}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {myNotes.length === 0 && (
            <EmptyState icon={<Upload size={24} />} title="No notes shared yet" description="Upload your first set of lesson notes for your students." action={<button className="btn-primary" onClick={() => setShowUploadModal(true)}><Plus size={13} /> Upload Note</button>} />
          )}
        </div>
      )}

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Class Note">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Batch</label>
            <select className="plato-input" value={uploadForm.batchId} onChange={(e) => setUploadForm((f) => ({ ...f, batchId: e.target.value }))}>
              {myBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Title</label>
            <input className="plato-input" placeholder="e.g. Forces & Motion — Lecture Slides" value={uploadForm.title} onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">Description (optional)</label>
            <input className="plato-input" placeholder="Brief description of the material" value={uploadForm.description} onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">File Type</label>
            <select className="plato-input" value={uploadForm.fileType} onChange={(e) => setUploadForm((f) => ({ ...f, fileType: e.target.value as ClassNote['fileType'] }))}>
              <option value="pdf">PDF</option>
              <option value="doc">Document</option>
              <option value="slides">Slides</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center" onClick={() => setShowUploadModal(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleUpload} disabled={!uploadForm.batchId || !uploadForm.title}>
              <ArrowRight size={14} /> Share with Students
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

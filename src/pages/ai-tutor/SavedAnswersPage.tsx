import { type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from '@/components/ui/Toaster'
import { formatDate } from '@/lib/utils'
import { Bookmark, Brain } from 'lucide-react'

// Renders the limited **bold** + newline markup our simulated responses use,
// without dangerouslySetInnerHTML (avoids any HTML/script injection from message content).
function renderFormatted(content: string): ReactNode {
  const lines = content.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

export default function SavedAnswersPage() {
  const { currentUser, students, conversations, updateConversation } = useAppStore()
  const student = students.find((s) => s.userId === currentUser?.id)

  const savedAnswers = conversations
    .filter((c) => c.studentId === student?.id)
    .flatMap((c) => c.messages.filter((m) => m.role === 'assistant' && m.saved).map((m) => ({ conv: c, msg: m })))
    .sort((a, b) => new Date(b.msg.timestamp).getTime() - new Date(a.msg.timestamp).getTime())

  const unsave = (convId: string, msgId: string) => {
    const conv = conversations.find((c) => c.id === convId)
    if (!conv) return
    updateConversation(convId, { messages: conv.messages.map((m) => (m.id === msgId ? { ...m, saved: false } : m)) })
    toast.success('Removed from saved')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Saved Answers" subtitle="Bookmark AI answers you found useful for later revision" />

      <div className="space-y-4">
        {savedAnswers.map(({ conv, msg }) => (
          <div key={msg.id} className="plato-card p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7B61FF] to-[#00F0FF] flex items-center justify-center flex-shrink-0">
                <Brain size={15} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-white/60">{conv.subject}{conv.topic ? ` · ${conv.topic}` : ''}</p>
                <p className="text-[11px] text-white/30">{formatDate(msg.timestamp)}</p>
              </div>
              <button onClick={() => unsave(conv.id, msg.id)} className="text-[#FBBF24] flex-shrink-0">
                <Bookmark size={16} fill="#FBBF24" />
              </button>
            </div>
            <div className="text-[13px] leading-relaxed text-white/75 whitespace-pre-wrap">
              {renderFormatted(msg.content)}
            </div>
          </div>
        ))}

        {savedAnswers.length === 0 && (
          <EmptyState icon={<Bookmark size={24} />} title="No saved answers yet" description="Save useful AI Tutor answers from the Ask Question tab to revisit them here." />
        )}
      </div>
    </div>
  )
}

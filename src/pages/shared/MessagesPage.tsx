import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { generateId, formatDate, timeAgo } from '@/lib/utils'
import { Send, Mail, Plus } from 'lucide-react'

export default function MessagesPage() {
  const { currentUser, messages, users, teachers, parents, students, batches, markMessageRead, addMessage } = useAppStore()
  const [showCompose, setShowCompose] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState({ to: '', subject: '', body: '' })

  const recipientOptions = (() => {
    if (!currentUser) return []
    if (currentUser.role === 'teacher') {
      const teacher = teachers.find((t) => t.userId === currentUser.id)
      const myBatches = teacher ? batches.filter((b) => b.teacherId === teacher.id) : []
      const myStudentIds = new Set(myBatches.flatMap((b) => b.studentIds))
      const myParentIds = new Set(students.filter((s) => myStudentIds.has(s.id) && s.parentId).map((s) => s.parentId!))
      const parentUserIds = parents.filter((p) => myParentIds.has(p.id)).map((p) => p.userId)
      const staffUserIds = users.filter((u) => u.role === 'coordinator' || u.role === 'branch_admin').map((u) => u.id)
      const allowedIds = new Set([...parentUserIds, ...staffUserIds])
      return users.filter((u) => allowedIds.has(u.id))
    }
    if (currentUser.role === 'parent') {
      const parent = parents.find((p) => p.userId === currentUser.id)
      const myStudentIds = new Set(parent?.studentIds || [])
      const myTeacherIds = new Set(batches.filter((b) => b.studentIds.some((id) => myStudentIds.has(id))).map((b) => b.teacherId))
      const teacherUserIds = teachers.filter((t) => myTeacherIds.has(t.id)).map((t) => t.userId)
      const staffUserIds = users.filter((u) => u.role === 'branch_admin').map((u) => u.id)
      const allowedIds = new Set([...teacherUserIds, ...staffUserIds])
      return users.filter((u) => allowedIds.has(u.id))
    }
    return users.filter((u) => u.id !== currentUser.id)
  })()

  const myMessages = messages
    .filter((m) => m.toId === currentUser?.id || m.fromId === currentUser?.id)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

  const inbox = myMessages.filter((m) => m.toId === currentUser?.id)
  const sent = myMessages.filter((m) => m.fromId === currentUser?.id)
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox')

  const displayed = tab === 'inbox' ? inbox : sent
  const selectedMsg = messages.find((m) => m.id === selected)

  const getUser = (id: string) => users.find((u) => u.id === id)

  const handleSend = () => {
    const toUser = users.find((u) => u.email === form.to || u.id === form.to)
    if (!toUser || !currentUser) return
    addMessage({
      id: `msg-${generateId()}`,
      fromId: currentUser.id,
      toId: toUser.id,
      subject: form.subject,
      body: form.body,
      isRead: false,
      sentAt: new Date().toISOString(),
      type: 'message',
    })
    setShowCompose(false)
    setForm({ to: '', subject: '', body: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle={`${inbox.filter((m) => !m.isRead).length} unread`}
        badge={<DemoBadge />}
        actions={
          <button className="btn-primary" onClick={() => setShowCompose(true)}>
            <Plus size={16} /> Compose
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-240px)] min-h-[400px]">
        {/* List */}
        <div className="plato-card flex flex-col overflow-hidden">
          <div className="flex items-center gap-1 p-3 border-b border-dark-border flex-shrink-0">
            {['inbox', 'sent'].map((t) => (
              <button key={t} onClick={() => setTab(t as typeof tab)} className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-[#4D7CFF] text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-dark-border/50">
            {displayed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No messages.</p>
            ) : (
              displayed.map((msg) => {
                const otherUser = getUser(tab === 'inbox' ? msg.fromId : msg.toId)
                const isUnread = !msg.isRead && tab === 'inbox'
                return (
                  <div
                    key={msg.id}
                    onClick={() => { setSelected(msg.id); if (isUnread) markMessageRead(msg.id) }}
                    className={`p-4 cursor-pointer hover:bg-white/3 transition-colors ${selected === msg.id ? 'bg-[#4D7CFF]/5 border-l-2 border-[#4D7CFF]' : ''} ${isUnread ? 'bg-[#4D7CFF]/3' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={otherUser?.name || '?'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>{otherUser?.name || 'Unknown'}</p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(msg.sentAt)}</span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>{msg.subject}</p>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{msg.body.slice(0, 60)}…</p>
                      </div>
                      {isUnread && <div className="w-2 h-2 rounded-full bg-[#4D7CFF] flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 plato-card flex flex-col overflow-hidden">
          {!selectedMsg ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-dark-border flex items-center justify-center mb-4">
                <Mail size={28} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Select a message to read</p>
              <p className="text-xs text-muted-foreground mt-1">Messages from teachers, finance, and admin appear here.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground font-display">{selectedMsg.subject}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>From: <span className="text-foreground">{getUser(selectedMsg.fromId)?.name}</span></span>
                  <span>To: <span className="text-foreground">{getUser(selectedMsg.toId)?.name}</span></span>
                  <span>{formatDate(selectedMsg.sentAt)}</span>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-white/3 border border-dark-border text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedMsg.body}
              </div>

              {selectedMsg.toId === currentUser?.id && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Quick Reply</p>
                  <div className="flex items-end gap-3">
                    <textarea
                      className="plato-input flex-1 resize-none h-20"
                      placeholder="Type your reply…"
                      id="reply-box"
                    />
                    <button
                      onClick={() => {
                        const body = (document.getElementById('reply-box') as HTMLTextAreaElement).value
                        if (!body.trim() || !currentUser) return
                        addMessage({ id: `msg-${generateId()}`, fromId: currentUser.id, toId: selectedMsg.fromId, subject: `Re: ${selectedMsg.subject}`, body, isRead: false, sentAt: new Date().toISOString(), type: 'message' })
                        ;(document.getElementById('reply-box') as HTMLTextAreaElement).value = ''
                      }}
                      className="btn-primary h-10 px-4"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="New Message">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">To</label>
            <select className="plato-input" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}>
              <option value="">— Select recipient —</option>
              {recipientOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>
              ))}
            </select>
            {recipientOptions.length === 0 && <p className="text-[11px] text-amber-400/80 mt-1.5">No recipients available yet.</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Subject</label>
            <input className="plato-input" placeholder="Message subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Message</label>
            <textarea className="plato-input resize-none h-32" placeholder="Write your message…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-ghost flex-1 justify-center border border-dark-border" onClick={() => setShowCompose(false)}>Cancel</button>
            <button className="btn-primary flex-1 justify-center" onClick={handleSend} disabled={!form.to || !form.subject || !form.body}>
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

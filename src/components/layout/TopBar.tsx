import { Bell, Search, Menu, Command, HelpCircle } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Avatar } from '@/components/ui/Avatar'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { timeAgo } from '@/lib/utils'
import { CommandPalette } from '@/components/ui/CommandPalette'

interface TopBarProps {
  onToggleSidebar: () => void
  onShowTour: () => void
}

const typeColor: Record<string, string> = {
  success: '#00FFA3',
  warning: '#FBBF24',
  error: '#FF6B7A',
  info: '#4D7CFF',
}

export function TopBar({ onToggleSidebar, onShowTour }: TopBarProps) {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useAppStore()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showCmd, setShowCmd] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCmd(true)
      }
      if (e.key === 'Escape') setShowCmd(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!currentUser) return null

  const userNotifs = notifications
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const unread = userNotifs.filter((n) => !n.isRead).length

  return (
    <header
      className="flex items-center justify-between px-5 py-3 flex-shrink-0"
      style={{
        background: 'rgba(8,12,24,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <Menu size={16} />
        </button>

        {/* Search — opens command palette */}
        <button
          onClick={() => setShowCmd(true)}
          className="relative hidden sm:flex items-center gap-2 group"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '7px 12px 7px 10px',
            width: 260,
          }}
        >
          <Search size={14} className="text-white/25 flex-shrink-0" />
          <span className="text-[13px] text-white/20 flex-1 text-left">Search anything…</span>
          <div className="flex items-center gap-0.5 opacity-40">
            <Command size={11} className="text-white/30" />
            <span className="text-white/30" style={{ fontSize: 11 }}>K</span>
          </div>
        </button>
        <CommandPalette open={showCmd} onClose={() => setShowCmd(false)} />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Replay onboarding tour */}
        <button
          onClick={onShowTour}
          aria-label="Replay onboarding tour"
          title="Replay onboarding tour"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <HelpCircle size={16} />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="View notifications"
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-white text-[9px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FF6B7A, #FF4D6A)',
                  boxShadow: '0 0 8px rgba(255,107,122,0.5)',
                  fontSize: 9,
                }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div
                className="absolute right-0 top-11 w-80 z-50 rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(11,15,30,0.96)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-white/90">Notifications</span>
                    {unread > 0 && (
                      <span className="badge-danger">{unread} new</span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead(currentUser.id)}
                      className="text-[11px] font-medium text-[#4D7CFF] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {userNotifs.length === 0 ? (
                    <p className="text-[13px] text-white/30 text-center py-8">No notifications yet</p>
                  ) : (
                    userNotifs.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id)
                          setShowNotifs(false)
                          if (n.link) navigate(n.link)
                        }}
                        className="px-4 py-3 cursor-pointer transition-colors"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: !n.isRead ? 'rgba(77,124,255,0.04)' : 'transparent',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = !n.isRead ? 'rgba(77,124,255,0.04)' : 'transparent' }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                            style={{
                              background: typeColor[n.type] ?? '#4D7CFF',
                              boxShadow: `0 0 6px ${typeColor[n.type] ?? '#4D7CFF'}`,
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-white/90 leading-snug">{n.title}</p>
                            <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-white/25 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {userNotifs.length > 5 && (
                  <div className="px-4 py-2 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[11px] text-white/25">+{userNotifs.length - 5} more</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* User chip */}
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <Avatar name={currentUser.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-[12px] font-semibold text-white/80 leading-tight">{currentUser.name.split(' ')[0]}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

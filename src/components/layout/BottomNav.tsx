import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { getNavItems, roleConfig } from './Sidebar'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const PRIMARY_COUNT = 4

export function BottomNav() {
  const { currentUser, setCurrentUser } = useAppStore()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)

  if (!currentUser) return null

  const allItems = getNavItems(currentUser.role)
  const primary = allItems.slice(0, PRIMARY_COUNT)
  const rest = allItems.slice(PRIMARY_COUNT)
  const rc = roleConfig[currentUser.role]

  return (
    <>
      <nav
        className="md:hidden flex items-stretch flex-shrink-0"
        style={{ background: '#080C18', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {primary.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length <= 2}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-[10px] font-medium transition-colors',
                isActive ? 'text-[#4D7CFF]' : 'text-white/40'
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="truncate max-w-[64px]">{item.label}</span>
          </NavLink>
        ))}
        {rest.length > 0 && (
          <button
            onClick={() => setShowMore(true)}
            aria-label="More navigation options"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-[10px] font-medium text-white/40"
          >
            <Menu size={18} />
            <span>More</span>
          </button>
        )}
      </nav>

      <AnimatePresence>
        {showMore && (
          <motion.div
            className="fixed inset-0 z-[260] flex flex-col md:hidden"
            style={{ background: '#080C18' }}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: rc.color, boxShadow: `0 0 6px ${rc.color}` }} />
                <span className="text-[13px] font-semibold" style={{ color: rc.color }}>{rc.label}</span>
              </div>
              <button onClick={() => setShowMore(false)} aria-label="Close menu" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white/90">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
              {allItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path.split('/').length <= 2}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) => cn('nav-item', isActive && 'active')}
                >
                  <span className="flex-shrink-0 opacity-80">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Avatar name={currentUser.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/90 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setCurrentUser(null); navigate('/login') }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/8"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

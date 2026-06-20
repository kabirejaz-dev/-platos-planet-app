import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CONFETTI_COLORS = ['#4D7CFF', '#7B61FF', '#00FFA3', '#FBBF24', '#FF6B7A', '#00F0FF', '#C6FF00']

interface CelebrationOverlayProps {
  open: boolean
  onClose: () => void
  xp: number
  studentFirstName: string
  itemTitle: string
  durationMs?: number
}

export function CelebrationOverlay({ open, onClose, xp, studentFirstName, itemTitle, durationMs = 2000 }: CelebrationOverlayProps) {
  const confetti = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 6,
    })),
    [open]
  )

  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, durationMs)
    return () => clearTimeout(t)
  }, [open, durationMs, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[400] flex items-center justify-center overflow-hidden pointer-events-none"
          style={{ background: 'rgba(5,8,16,0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {confetti.map((c) => (
            <span
              key={c.id}
              className="absolute top-0 animate-confetti-fall rounded-sm"
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.size * 0.4,
                background: c.color,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}

          <motion.div
            className="relative text-center px-8 py-7 rounded-3xl"
            style={{ background: 'rgba(11,15,30,0.96)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <p className="text-[28px] font-bold font-display text-[#C6FF00] mb-1">⭐ +{xp} XP</p>
            <p className="text-[16px] font-semibold text-white/90">Great work, {studentFirstName}!</p>
            <p className="text-[13px] text-white/45 mt-1">{itemTitle} submitted</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

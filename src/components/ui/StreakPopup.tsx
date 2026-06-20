import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function StreakPopup({ streak, open, onClose }: { streak: number; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-5 right-5 z-[250] flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(11,15,30,0.97)', border: '1px solid rgba(255,107,122,0.3)', boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(255,107,122,0.15)' }}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          <span className="text-[22px]">🔥</span>
          <p className="text-[13px] font-semibold text-white/90">{streak}-day streak! Keep it going!</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

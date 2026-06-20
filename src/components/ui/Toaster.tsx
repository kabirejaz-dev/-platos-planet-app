import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastState, toast as toastApi, type Toast } from '@/hooks/useToast'

const CONFIG = {
  success: { icon: CheckCircle2, color: '#00FFA3', bg: 'rgba(0,255,163,0.08)', border: 'rgba(0,255,163,0.2)' },
  error:   { icon: XCircle,      color: '#FF6B7A', bg: 'rgba(255,107,122,0.08)', border: 'rgba(255,107,122,0.2)' },
  warning: { icon: AlertTriangle,color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)' },
  info:    { icon: Info,         color: '#4D7CFF', bg: 'rgba(77,124,255,0.08)',  border: 'rgba(77,124,255,0.2)' },
}

function ToastItem({ t, onRemove }: { t: Toast; onRemove: (id: string) => void }) {
  const { icon: Icon, color, bg, border } = CONFIG[t.type]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="flex items-start gap-3 px-4 py-3 rounded-2xl min-w-[280px] max-w-sm"
      style={{
        background: 'rgba(11,15,30,0.97)',
        border: `1px solid ${border}`,
        boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), 0 0 20px ${color}18`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: bg }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white/90 leading-snug">{t.title}</p>
        {t.message && <p className="text-[12px] text-white/45 mt-0.5 leading-snug">{t.message}</p>}
      </div>
      <button
        onClick={() => onRemove(t.id)}
        aria-label="Dismiss notification"
        className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
      >
        <X size={13} />
      </button>
    </motion.div>
  )
}

export function Toaster() {
  const { items, setItems, subscribe } = useToastState()

  useEffect(() => subscribe(setItems), [subscribe, setItems])

  const remove = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id))

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem t={t} onRemove={remove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { toastApi as toast }

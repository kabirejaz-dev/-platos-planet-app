import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** When true, closing via Escape/backdrop asks for confirmation instead of closing immediately. */
  isDirty?: boolean
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, size = 'md', isDirty = false }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [confirmClose, setConfirmClose] = useState(false)

  const requestClose = () => {
    if (isDirty) setConfirmClose(true)
    else onClose()
  }

  useEffect(() => {
    if (!open) return
    setConfirmClose(false)

    const node = dialogRef.current
    const firstField = node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    firstField?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        requestClose()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={requestClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative w-full ${sizeMap[size]} bg-dark-card border border-dark-border rounded-t-2xl sm:rounded-2xl shadow-card max-h-[92vh] sm:max-h-[90vh] flex flex-col`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border flex-shrink-0">
              <h2 id={titleId} className="text-lg font-semibold text-foreground font-display">{title}</h2>
              <button
                onClick={requestClose}
                aria-label="Close"
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {confirmClose && (
              <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center p-4" onClick={() => setConfirmClose(false)}>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-2xl p-5 space-y-4"
                  style={{ background: '#0B0F1E', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <p className="text-[13px] text-white/80">You have unsaved changes. Close anyway?</p>
                  <div className="flex justify-end gap-2">
                    <button className="btn-ghost border border-dark-border text-sm" onClick={() => setConfirmClose(false)}>Keep editing</button>
                    <button className="btn-primary text-sm" style={{ background: '#FF6B7A' }} onClick={onClose}>Close anyway</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

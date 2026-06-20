import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { TOUR_STEPS } from '@/lib/tourSteps'
import type { UserRole } from '@/types'

interface OnboardingTourProps {
  role: UserRole
  open: boolean
  onClose: () => void
}

export function OnboardingTour({ role, open, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0)
  const steps = TOUR_STEPS[role] || []

  if (!open || steps.length === 0) return null

  const close = () => { setStep(0); onClose() }
  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,16,0.7)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-sm rounded-3xl p-6"
          style={{
            background: 'rgba(11,15,30,0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={close}
            aria-label="Skip tour"
            className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={16} />
          </button>

          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #4D7CFF 0%, #7B61FF 60%, #00F0FF 100%)' }}
          >
            <Sparkles size={20} className="text-white" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="text-[17px] font-bold text-white font-display leading-tight mb-2">{current.title}</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">{current.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1.5 mt-6 mb-5">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === step ? 20 : 6, background: i === step ? '#4D7CFF' : 'rgba(255,255,255,0.12)' }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={close}
              className="text-[12px] font-medium text-white/40 hover:text-white/70 transition-colors"
            >
              Skip
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-ghost border border-dark-border text-[12px] py-2 px-3 min-h-[36px]"
                >
                  <ArrowLeft size={13} />
                </button>
              )}
              <button
                onClick={() => (isLast ? close() : setStep((s) => s + 1))}
                className="btn-primary text-[12px] py-2 px-4 min-h-[36px]"
              >
                {isLast ? 'Done' : 'Next'} {!isLast && <ArrowRight size={13} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

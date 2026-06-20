import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

const DISMISSED_KEY = 'pp_demo_banner_dismissed'

export function DemoModeBanner() {
  const settings = useAppStore((s) => s.settings)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true')

  if (settings.isLive || dismissed) return null

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 flex-shrink-0 text-[12px]"
      style={{ background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
      <span className="font-semibold">DEMO MODE</span>
      <span className="hidden sm:inline text-amber-200/70">— You're viewing sample data. Complete Setup to go live.</span>
      <Link to="/super-admin/go-live" className="font-semibold hover:underline flex items-center gap-1 flex-shrink-0">
        Setup <ArrowRight size={11} />
      </Link>
      <button onClick={dismiss} aria-label="Dismiss demo mode banner" className="ml-2 text-amber-300/60 hover:text-amber-200 flex-shrink-0">
        <X size={13} />
      </button>
    </div>
  )
}

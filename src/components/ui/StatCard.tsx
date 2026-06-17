import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { DemoBadge } from './DemoBadge'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  change?: number
  changeLabel?: string
  color?: string
  demo?: boolean
  sub?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const start = Date.now()
    const duration = 900
    const from = 0
    const to = value

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  return <>{display.toLocaleString()}</>
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeLabel,
  color = '#4D7CFF',
  demo = true,
  sub,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0
  const isNumeric = typeof value === 'number'

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 group transition-all duration-200"
      style={{
        background: 'rgba(13,17,30,0.85)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = `${color}30`
        el.style.boxShadow = `0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px ${color}15`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(255,255,255,0.06)'
        el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.35)'
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 80% -10%, ${color}12, transparent 60%)` }}
      />

      <div className="flex items-start justify-between relative">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(100,116,139,0.9)' }}>
          {label}
        </span>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${color}25, ${color}10)`,
              border: `1px solid ${color}20`,
              color,
              boxShadow: `0 4px 12px ${color}15`,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex items-end gap-2">
          <span className="text-[28px] font-bold leading-none font-display tracking-tight" style={{ color: '#F1F5F9' }}>
            {isNumeric ? <AnimatedNumber value={value as number} /> : value}
          </span>
          {demo && <DemoBadge />}
        </div>
        {sub && <p className="text-[12px] mt-1" style={{ color: 'rgba(100,116,139,0.8)' }}>{sub}</p>}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 relative">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background: isPositive ? 'rgba(0,255,163,0.08)' : 'rgba(255,107,122,0.08)',
              border: `1px solid ${isPositive ? 'rgba(0,255,163,0.2)' : 'rgba(255,107,122,0.2)'}`,
            }}
          >
            {isPositive
              ? <TrendingUp size={11} style={{ color: '#00FFA3' }} />
              : <TrendingDown size={11} style={{ color: '#FF6B7A' }} />
            }
            <span className="text-[11px] font-semibold" style={{ color: isPositive ? '#00FFA3' : '#FF6B7A' }}>
              {isPositive ? '+' : ''}{change}%
            </span>
          </div>
          {changeLabel && (
            <span className="text-[11px]" style={{ color: 'rgba(100,116,139,0.6)' }}>{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

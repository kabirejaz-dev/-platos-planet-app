import type { ReactNode } from 'react'

export interface Insight {
  icon: string
  text: ReactNode
  tone?: 'amber' | 'purple'
}

export function InsightsStrip({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
      {insights.map((insight, i) => {
        const isPurple = insight.tone === 'purple'
        const color = isPurple ? '#7B61FF' : '#FBBF24'
        return (
          <div
            key={i}
            className="flex items-start gap-2.5 px-4 py-3 rounded-2xl flex-shrink-0 min-w-[260px] max-w-[340px]"
            style={{ background: `${color}0D`, border: `1px solid ${color}30` }}
          >
            <span className="text-[16px] leading-none flex-shrink-0 mt-0.5">{insight.icon}</span>
            <p className="text-[12.5px] leading-snug" style={{ color: 'rgba(241,245,249,0.85)' }}>{insight.text}</p>
          </div>
        )
      })}
    </div>
  )
}

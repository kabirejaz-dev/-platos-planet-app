interface AttendanceRingProps {
  present: number
  total: number
  size?: number
}

export function AttendanceRing({ present, total, size = 36 }: AttendanceRingProps) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const color = pct >= 80 ? '#00FFA3' : pct >= 60 ? '#FBBF24' : '#FF6B7A'

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[9px] font-bold" style={{ color }}>{pct}%</span>
    </div>
  )
}

import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { PLANET_ORDER, PLANET_XP_THRESHOLDS } from '@/types'

const PLANET_EMOJI: Record<string, string> = {
  Mercury: '☿', Venus: '♀', Earth: '🌍', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Neptune: '♆', Pluto: '⚡',
}

const PLANET_COLOR: Record<string, string> = {
  Mercury: '#9CA3AF', Venus: '#FB923C', Earth: '#4D7CFF', Mars: '#FF6B7A',
  Jupiter: '#FBBF24', Saturn: '#C6FF00', Neptune: '#00F0FF', Pluto: '#7B61FF',
}

const CATEGORY_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  attendance: { color: '#00FFA3', bg: 'rgba(0,255,163,0.1)',   label: 'Attendance' },
  academic:   { color: '#4D7CFF', bg: 'rgba(77,124,255,0.1)', label: 'Academic' },
  streak:     { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', label: 'Streak' },
  homework:   { color: '#7B61FF', bg: 'rgba(123,97,255,0.1)', label: 'Homework' },
  special:    { color: '#FF6B7A', bg: 'rgba(255,107,122,0.1)',label: 'Special' },
}

export default function AchievementsPage() {
  const { currentUser, students, achievements } = useAppStore()

  const student = students.find((s) => s.userId === currentUser?.id)
  if (!student) return <div className="text-white/30 p-6">Student profile not found.</div>

  const unlocked = achievements.filter((a) => a.isUnlocked)
  const locked = achievements.filter((a) => !a.isUnlocked)
  const totalXpFromAchievements = unlocked.reduce((sum, a) => sum + a.xpReward, 0)

  const currentPlanetIndex = PLANET_ORDER.indexOf(student.planet)
  const nextPlanet = PLANET_ORDER[currentPlanetIndex + 1]
  const nextThreshold = nextPlanet ? PLANET_XP_THRESHOLDS[nextPlanet] : null
  const currentThreshold = PLANET_XP_THRESHOLDS[student.planet]
  const progressPct = nextThreshold
    ? Math.round(((student.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100

  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" subtitle="Your badges and Planet Journey progress" badge={<DemoBadge />} />

      {/* Planet Journey */}
      <div className="plato-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-bold text-white font-display">Planet Journey</h3>
            <p className="text-[12px] text-white/40 mt-0.5">{student.xp.toLocaleString()} XP total</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-white/60">{unlocked.length} / {achievements.length} badges</p>
            <p className="text-[11px] text-white/30">{totalXpFromAchievements} XP from achievements</p>
          </div>
        </div>

        {/* Planet row */}
        <div className="flex items-center justify-between gap-1 mb-4">
          {PLANET_ORDER.map((planet, i) => {
            const isReached = PLANET_ORDER.indexOf(student.planet) >= i
            const isCurrent = planet === student.planet
            const color = PLANET_COLOR[planet]
            return (
              <div key={planet} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all"
                  style={{
                    background: isReached ? `${color}20` : 'rgba(255,255,255,0.04)',
                    border: isCurrent ? `2px solid ${color}` : isReached ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isCurrent ? `0 0 16px ${color}50` : 'none',
                    filter: isReached ? 'none' : 'grayscale(1) opacity(0.3)',
                  }}
                >
                  {PLANET_EMOJI[planet]}
                </div>
                <p
                  className="text-[9px] font-semibold text-center hidden sm:block"
                  style={{ color: isCurrent ? color : isReached ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.3)' }}
                >
                  {planet}
                </p>
              </div>
            )
          })}
        </div>

        {/* XP progress bar */}
        {nextPlanet && (
          <div>
            <div className="flex justify-between text-[11px] mb-2">
              <span style={{ color: PLANET_COLOR[student.planet] }}>{student.planet}</span>
              <span className="text-white/30">{(nextThreshold! - student.xp).toLocaleString()} XP to {nextPlanet}</span>
              <span style={{ color: PLANET_COLOR[nextPlanet] }}>{nextPlanet}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${PLANET_COLOR[student.planet]}, ${PLANET_COLOR[nextPlanet]})`,
                  boxShadow: `0 0 12px ${PLANET_COLOR[student.planet]}60`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] mt-1 text-white/25">
              <span>{currentThreshold.toLocaleString()} XP</span>
              <span className="font-semibold text-white/50">{progressPct}%</span>
              <span>{nextThreshold!.toLocaleString()} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Streak & stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Current Streak', value: `${student.streak} days`, color: '#FBBF24' },
          { label: 'Badges Earned', value: unlocked.length, color: '#00FFA3' },
          { label: 'XP Earned', value: student.xp.toLocaleString(), color: '#4D7CFF' },
        ].map((s) => (
          <div key={s.label} className="plato-card p-4 text-center">
            <p className="text-[24px] font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Unlocked achievements */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-[14px] font-bold text-white/70 mb-3 flex items-center gap-2">
            <span className="text-[#00FFA3]">✓</span> Earned Badges ({unlocked.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {unlocked.map((achievement) => {
              const cs = CATEGORY_STYLE[achievement.category]
              return (
                <div
                  key={achievement.id}
                  className="plato-card p-4 flex items-start gap-3"
                  style={{ border: `1px solid ${cs.color}20` }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: cs.bg }}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-[13px] font-bold text-white/90">{achievement.title}</p>
                    </div>
                    <p className="text-[11px] text-white/40 leading-snug">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-semibold" style={{ color: cs.color }}>
                        +{achievement.xpReward} XP
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: cs.bg, color: cs.color }}
                      >
                        {cs.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked achievements */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-[14px] font-bold text-white/40 mb-3 flex items-center gap-2">
            <span>🔒</span> Locked ({locked.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {locked.map((achievement) => (
              <div
                key={achievement.id}
                className="plato-card p-4 flex items-start gap-3 opacity-50"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 grayscale"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {achievement.icon}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white/50">{achievement.title}</p>
                  <p className="text-[11px] text-white/25 leading-snug mt-0.5">{achievement.description}</p>
                  <p className="text-[11px] text-white/30 mt-1.5">+{achievement.xpReward} XP on unlock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

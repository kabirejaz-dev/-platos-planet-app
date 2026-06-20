import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { Avatar } from '@/components/ui/Avatar'
import { StreakPopup } from '@/components/ui/StreakPopup'
import { formatDate, getPlanetEmoji, getGradeColor, gradeFromPercentage, calculateAttendanceRate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Brain, Target, BookOpen, Award, ArrowRight, Zap, Flame, Trophy } from 'lucide-react'
import { PLANET_ORDER, PLANET_XP_THRESHOLDS } from '@/types'

const PLANET_COLORS: Record<string, string> = {
  Mercury: '#9CA3AF', Venus: '#FB923C', Earth: '#4D7CFF', Mars: '#FF6B7A',
  Jupiter: '#FBBF24', Saturn: '#C6FF00', Neptune: '#00F0FF', Pluto: '#7B61FF',
}

export default function StudentDashboard() {
  const { currentUser, students, homework, assessments, attendance, achievements } = useAppStore()

  const student = students.find((s) => s.userId === currentUser?.id)
  const [showStreakPopup, setShowStreakPopup] = useState(false)

  useEffect(() => {
    if (!student || student.streak <= 0) return
    const key = `pp_streak_seen_${student.id}`
    const today = new Date().toISOString().split('T')[0]
    if (localStorage.getItem(key) !== today) {
      localStorage.setItem(key, today)
      setShowStreakPopup(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id])

  if (!student) return <div className="text-muted-foreground p-4">Student profile not found.</div>

  const myAtt = attendance.filter((a) => a.studentId === student.id)
  const attRate = calculateAttendanceRate(myAtt.filter((a) => a.status === 'present').length, myAtt.length)
  const myAssessments = assessments.filter((a) => a.results.some((r) => r.studentId === student.id) && a.status === 'graded')
  const avgScore = myAssessments.length > 0
    ? Math.round(myAssessments.reduce((s, a) => { const r = a.results.find((r) => r.studentId === student.id); return s + (r?.percentage || 0) }, 0) / myAssessments.length)
    : 0

  const pendingHW = homework.filter((h) => student.batchIds.includes(h.batchId) && h.status === 'assigned' && !h.submissions.some((s) => s.studentId === student.id))

  const currentPlanetIdx = PLANET_ORDER.indexOf(student.planet)
  const nextPlanet = currentPlanetIdx < PLANET_ORDER.length - 1 ? PLANET_ORDER[currentPlanetIdx + 1] : null
  const nextPlanetXP = nextPlanet ? PLANET_XP_THRESHOLDS[nextPlanet] : student.xp
  const currentPlanetXP = PLANET_XP_THRESHOLDS[student.planet]
  const xpProgress = nextPlanet ? Math.round(((student.xp - currentPlanetXP) / (nextPlanetXP - currentPlanetXP)) * 100) : 100

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked)

  const predictedGrade = gradeFromPercentage(avgScore)
  const weakSubjects = student.subjects.filter((sub) => {
    const subAss = myAssessments.filter((a) => a.subject === sub)
    if (subAss.length === 0) return false
    const avg = subAss.reduce((s, a) => { const r = a.results.find((r) => r.studentId === student.id); return s + (r?.percentage || 0) }, 0) / subAss.length
    return avg < 70
  })

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="relative plato-card p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4D7CFF]/10 via-[#7B61FF]/5 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5" style={{ background: `radial-gradient(circle, ${PLANET_COLORS[student.planet]}, transparent)` }} />

        <div className="relative flex items-center gap-5">
          <Avatar name={student.name} size="xl" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Student Dashboard</p>
            <h1 className="text-2xl font-bold text-foreground font-display">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{student.curriculum} · {student.grade}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-4xl">{getPlanetEmoji(student.planet)}</p>
            <p className="text-sm font-bold mt-1" style={{ color: PLANET_COLORS[student.planet] }}>{student.planet}</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="relative mt-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-[#C6FF00]"><Zap size={13} /> {student.xp.toLocaleString()} XP</span>
              <span className="flex items-center gap-1 font-semibold text-[#FF6B7A]"><Flame size={13} /> {student.streak} day streak</span>
            </div>
            {nextPlanet && <span className="text-muted-foreground">Next: {nextPlanet} ({nextPlanetXP.toLocaleString()} XP)</span>}
          </div>
          <div className={`w-full h-3 bg-dark-border rounded-full overflow-hidden ${nextPlanet && xpProgress >= 90 ? 'animate-amber-pulse' : ''}`}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg, ${PLANET_COLORS[student.planet]}, ${PLANET_COLORS[nextPlanet || student.planet]})` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
            <span>{student.planet}</span>
            {nextPlanet && <span>{nextPlanet}</span>}
          </div>
          {nextPlanet && xpProgress >= 90 && (
            <p className="text-xs text-amber-400 font-medium mt-1.5">Almost there! {(nextPlanetXP - student.xp).toLocaleString()} XP to {nextPlanet} 🪐</p>
          )}
        </div>
      </div>

      <StreakPopup streak={student.streak} open={showStreakPopup} onClose={() => setShowStreakPopup(false)} />

      {/* AI Coach */}
      <div className="plato-card p-5 bg-gradient-to-br from-[#7B61FF]/10 to-[#00F0FF]/5 border-[#7B61FF]/20">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-[#7B61FF]" />
          <h3 className="text-sm font-semibold text-foreground">AI Coach</h3>
          <span className="badge-purple">Powered by Claude</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Exam Readiness</p>
            <p className="text-2xl font-bold text-[#C6FF00] font-display">{attRate >= 80 ? Math.min(avgScore + 5, 98) : avgScore}%</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Predicted Grade</p>
            <p className={`text-2xl font-bold font-display ${getGradeColor(predictedGrade)}`}>{predictedGrade}</p>
          </div>
          <Link to="/student/attendance" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <p className="text-xs text-muted-foreground mb-1">Attendance</p>
            <p className={`text-2xl font-bold font-display ${attRate >= 80 ? 'text-[#00FFA3]' : 'text-[#FF6B7A]'}`}>{attRate}%</p>
          </Link>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
            <p className="text-2xl font-bold text-[#4D7CFF] font-display">{avgScore}%</p>
          </div>
        </div>

        {weakSubjects.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Target size={14} className="text-[#FF6B7A]" />
            <p className="text-xs text-[#FF6B7A] font-medium">Focus areas: {weakSubjects.join(', ')}</p>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <Link to="/student/ai-tutor" className="btn-primary text-sm py-2">
            <Brain size={14} /> Ask AI Tutor
          </Link>
          <Link to="/student/study-plan" className="btn-ghost border border-[#7B61FF]/30 text-[#7B61FF] text-sm py-2">
            <Target size={14} /> Study Plan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending homework */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen size={16} /> Pending Homework
              {pendingHW.length > 0 && <span className="badge-warning">{pendingHW.length}</span>}
            </h3>
            <Link to="/student/homework" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {pendingHW.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm text-[#00FFA3] font-medium">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingHW.map((hw) => (
                <div key={hw.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-dark-border/50">
                  <div className="w-1 h-10 rounded-full bg-amber-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{hw.title}</p>
                    <p className="text-xs text-muted-foreground">Due {formatDate(hw.dueDate)}</p>
                  </div>
                  <span className="text-xs text-amber-400 font-medium">{hw.maxMarks} marks</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent results */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy size={16} /> Recent Results
            </h3>
            <Link to="/student/tests" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {myAssessments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No results yet.</p>
          ) : (
            <div className="space-y-3">
              {myAssessments.slice(0, 4).map((a, idx) => {
                const result = a.results.find((r) => r.studentId === student.id)
                const isTopGrade = result?.grade === 'A' || result?.grade === 'A*'
                return (
                  <motion.div
                    key={a.id}
                    className="flex items-center gap-3 p-2 rounded-xl"
                    style={isTopGrade ? { animation: 'sparkle-border 1s ease-in-out 2' } : undefined}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getGradeColor(result?.grade || 'U')} bg-white/5`}>
                      {result?.grade}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{a.subject}</p>
                      <p className="text-xs text-muted-foreground">{a.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{result?.marks}/{a.maxMarks}</p>
                      <p className="text-xs text-muted-foreground">{result?.percentage}%</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Planet Journey */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Planet Journey</h3>
          <Link to="/student/achievements" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">Achievements <ArrowRight size={12} /></Link>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PLANET_ORDER.map((planet, idx) => {
            const isReached = PLANET_XP_THRESHOLDS[planet] <= student.xp
            const isCurrent = planet === student.planet
            return (
              <div key={planet} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex flex-col items-center gap-1.5 ${!isReached ? 'opacity-30' : ''}`}>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-dark-card shadow-lg scale-110' : ''}`}
                    style={isCurrent ? { boxShadow: `0 0 20px ${PLANET_COLORS[planet]}40, 0 0 0 2px ${PLANET_COLORS[planet]}` } : undefined}
                  >
                    {getPlanetEmoji(planet)}
                  </div>
                  <p className="text-xs font-medium" style={{ color: isReached ? PLANET_COLORS[planet] : '#6B7280' }}>{planet}</p>
                  <p className="text-xs text-muted-foreground">{PLANET_XP_THRESHOLDS[planet].toLocaleString()}</p>
                </div>
                {idx < PLANET_ORDER.length - 1 && (
                  <div className={`h-0.5 w-8 rounded-full ${isReached ? 'bg-[#4D7CFF]' : 'bg-dark-border'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Award size={16} /> Recent Achievements
          </h3>
          <span className="text-xs text-muted-foreground">{unlockedAchievements.length}/{achievements.length} unlocked</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`flex-shrink-0 w-28 p-3 rounded-xl border text-center transition-all ${a.isUnlocked ? 'border-[#C6FF00]/30 bg-[#C6FF00]/5' : 'border-dark-border opacity-40 grayscale'}`}
            >
              <p className="text-3xl mb-1">{a.icon}</p>
              <p className="text-xs font-semibold text-foreground leading-tight">{a.title}</p>
              <p className="text-xs text-[#C6FF00] mt-1">+{a.xpReward} XP</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

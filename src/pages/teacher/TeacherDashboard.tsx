import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { BookOpen, Users, ClipboardList, ArrowRight, Calendar, CheckCircle2, Clock } from 'lucide-react'

export default function TeacherDashboard() {
  const { currentUser, teachers, batches, students, homework, assessments, attendance } = useAppStore()

  const teacher = teachers.find((t) => t.userId === currentUser?.id)
  if (!teacher) return <div className="text-muted-foreground p-4">Teacher profile not found.</div>

  const myBatches = batches.filter((b) => b.teacherId === teacher.id && b.status === 'active')
  const myStudentIds = [...new Set(myBatches.flatMap((b) => b.studentIds))]
  const myStudents = students.filter((s) => myStudentIds.includes(s.id))
  const myHomework = homework.filter((h) => h.teacherId === teacher.id)
  const myAssessments = assessments.filter((a) => a.teacherId === teacher.id)

  const pendingSubmissions = myHomework.reduce((sum, hw) => {
    const submitted = hw.submissions.filter((s) => s.status === 'submitted').length
    return sum + submitted
  }, 0)

  const todayDate = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.filter((a) => a.date === todayDate && myBatches.some((b) => b.id === a.batchId))
  const todayPresent = todayAttendance.filter((a) => a.status === 'present').length

  const upcoming = myAssessments.filter((a) => a.status === 'upcoming')

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${teacher.name.split(' ').slice(-1)[0]}`}
        subtitle={`${teacher.subjects.join(' · ')} · ${teacher.curriculums.join(', ')}`}
        badge={<DemoBadge />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Batches" value={myBatches.length} icon={<BookOpen size={18} />} color="#4D7CFF" demo={false} />
        <StatCard label="Total Students" value={myStudentIds.length} icon={<Users size={18} />} color="#7B61FF" demo={false} />
        <StatCard label="Pending Reviews" value={pendingSubmissions} icon={<ClipboardList size={18} />} color="#FF6B7A" demo={false} sub="Submitted homework" />
        <StatCard label="Today Present" value={`${todayPresent}/${myStudentIds.length}`} icon={<CheckCircle2 size={18} />} color="#00FFA3" demo={false} />
      </div>

      {/* Today's classes */}
      <div className="plato-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Today's Classes</h3>
          <Link to="/teacher/classes" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>

        {myBatches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No active batches.</p>
        ) : (
          <div className="space-y-3">
            {myBatches.map((batch) => {
              const batchStudents = students.filter((s) => batch.studentIds.includes(s.id))
              const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()] as typeof batch.schedule[0]['day']
              const todaySchedule = batch.schedule.find((s) => s.day === today)

              return (
                <div key={batch.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-dark-border/50 hover:border-[#4D7CFF]/30 transition-all">
                  <div className="w-1 h-14 rounded-full bg-[#4D7CFF]" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{batch.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users size={12} /> {batchStudents.length} students
                      </span>
                      {todaySchedule && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} /> {todaySchedule.startTime} – {todaySchedule.endTime}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{batch.room || 'No room'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/teacher/attendance" className="text-xs px-3 py-1.5 rounded-lg bg-[#4D7CFF]/10 text-[#4D7CFF] hover:bg-[#4D7CFF]/20 transition-colors">
                      Mark Attendance
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent homework */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Homework Assignments</h3>
            <Link to="/teacher/homework" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {myHomework.slice(0, 4).map((hw) => {
              const submitted = hw.submissions.length
              const batchStudentCount = batches.find((b) => b.id === hw.batchId)?.studentIds.length || 0
              return (
                <div key={hw.id} className="flex items-center justify-between py-2 border-b border-dark-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{hw.title}</p>
                    <p className="text-xs text-muted-foreground">Due {formatDate(hw.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#00FFA3]">{submitted}/{batchStudentCount}</p>
                    <p className="text-xs text-muted-foreground">submitted</p>
                  </div>
                </div>
              )
            })}
            {myHomework.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No homework assigned.</p>}
          </div>
        </div>

        {/* My students */}
        <div className="plato-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">My Students</h3>
            <Link to="/teacher/progress" className="text-xs text-[#4D7CFF] hover:underline flex items-center gap-1">View progress <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-2">
            {myStudents.slice(0, 6).map((student) => {
              const studentAtt = attendance.filter((a) => a.studentId === student.id && myBatches.some((b) => b.id === a.batchId))
              const presentCount = studentAtt.filter((a) => a.status === 'present').length
              const attRate = studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : 0

              return (
                <div key={student.id} className="flex items-center gap-3 py-2">
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.curriculum} · {student.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${attRate >= 80 ? 'text-[#00FFA3]' : attRate >= 60 ? 'text-amber-400' : 'text-[#FF6B7A]'}`}>
                      {attRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">attendance</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Upcoming assessments */}
      {upcoming.length > 0 && (
        <div className="plato-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Assessments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-[#7B61FF]/5 border border-[#7B61FF]/20">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.subject} · {a.type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar size={12} className="text-[#7B61FF]" />
                  <span className="text-xs text-[#7B61FF] font-medium">{formatDate(a.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

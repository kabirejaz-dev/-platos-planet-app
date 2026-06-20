import { useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { FileText, Download, Users, DollarSign, GraduationCap, CalendarCheck, Loader2, Building2, Star, Target } from 'lucide-react'

type StoreSnapshot = ReturnType<typeof useAppStore.getState>

interface ReportDef {
  id: string
  title: string
  description: string
  icon: ReactNode
  color: string
  buildRows: (s: StoreSnapshot) => (string | number)[][]
  headers: string[]
}

function csvEscape(value: string | number): string {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function buildCSV(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
}

const REPORTS: ReportDef[] = [
  {
    id: 'attendance', title: 'Attendance Report', description: 'Every attendance record across all branches for the current term.',
    icon: <CalendarCheck size={18} />, color: '#4D7CFF',
    headers: ['Date', 'Student', 'Branch', 'Batch', 'Status'],
    buildRows: (s) => s.attendance.map((a) => {
      const student = s.students.find((st) => st.id === a.studentId)
      const batch = s.batches.find((b) => b.id === a.batchId)
      const branch = s.branches.find((b) => b.id === student?.branchId)
      return [a.date, student?.name || a.studentId, branch?.name || '—', batch?.name || a.batchId, a.status]
    }),
  },
  {
    id: 'revenue', title: 'Revenue Report', description: 'Invoiced, collected, and outstanding revenue by branch.',
    icon: <DollarSign size={18} />, color: '#00FFA3',
    headers: ['Invoice #', 'Student', 'Branch', 'Amount', 'Status', 'Due Date'],
    buildRows: (s) => s.invoices.map((i) => {
      const student = s.students.find((st) => st.id === i.studentId)
      const branch = s.branches.find((b) => b.id === i.branchId)
      return [i.invoiceNumber, student?.name || i.studentId, branch?.name || '—', i.totalAmount, i.status, i.dueDate]
    }),
  },
  {
    id: 'academics', title: 'Academic Performance Report', description: 'Grade distribution and curriculum coverage across all branches.',
    icon: <GraduationCap size={18} />, color: '#7B61FF',
    headers: ['Student', 'Subject', 'Curriculum', 'Assessment', 'Percentage', 'Grade'],
    buildRows: (s) => s.assessments.filter((a) => a.status === 'graded').flatMap((a) =>
      a.results.map((r) => {
        const student = s.students.find((st) => st.id === r.studentId)
        return [student?.name || r.studentId, a.subject, a.curriculum, a.title, r.percentage, r.grade]
      })
    ),
  },
  {
    id: 'enrolment', title: 'Enrolment Report', description: 'Lead conversion and enrolment trends by source and branch.',
    icon: <Users size={18} />, color: '#FBBF24',
    headers: ['Student', 'Parent', 'Branch', 'Source', 'Status', 'Created'],
    buildRows: (s) => s.leads.map((l) => {
      const branch = s.branches.find((b) => b.id === l.branchId)
      return [l.studentName, l.parentName, branch?.name || '—', l.source, l.status, l.createdAt]
    }),
  },
  {
    id: 'branch-pnl', title: 'Branch P&L Report', description: 'Collected revenue minus operating expenses, per branch.',
    icon: <Building2 size={18} />, color: '#00F0FF',
    headers: ['Branch', 'Revenue Collected', 'Total Expenses', 'Net P&L'],
    buildRows: (s) => s.branches.map((b) => {
      const revenue = s.invoices.filter((i) => i.branchId === b.id && i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)
      const expenseTotal = s.expenses.filter((e) => e.branchId === b.id).reduce((sum, e) => sum + e.amount, 0)
      return [b.name, revenue, expenseTotal, revenue - expenseTotal]
    }),
  },
  {
    id: 'student-progress', title: 'Student Progress Report', description: 'Per-student attendance rate, average assessment score, and XP.',
    icon: <Target size={18} />, color: '#FF6B7A',
    headers: ['Student', 'Branch', 'Curriculum', 'Attendance %', 'Avg Assessment %', 'XP'],
    buildRows: (s) => s.students.map((st) => {
      const branch = s.branches.find((b) => b.id === st.branchId)
      const records = s.attendance.filter((a) => a.studentId === st.id)
      const present = records.filter((a) => a.status === 'present' || a.status === 'late').length
      const attendanceRate = records.length > 0 ? Math.round((present / records.length) * 100) : 0
      const results = s.assessments.flatMap((a) => a.results.filter((r) => r.studentId === st.id))
      const avgScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0
      return [st.name, branch?.name || '—', st.curriculum, attendanceRate, avgScore, st.xp]
    }),
  },
  {
    id: 'teacher-performance', title: 'Teacher Performance Report', description: 'Per-teacher rating, batch load, and average student score.',
    icon: <Star size={18} />, color: '#C6FF00',
    headers: ['Teacher', 'Branch', 'Rating', 'Batches', 'Avg Student Score %'],
    buildRows: (s) => s.teachers.map((t) => {
      const branch = s.branches.find((b) => b.id === t.branchId)
      const results = s.assessments.filter((a) => a.teacherId === t.id).flatMap((a) => a.results)
      const avgScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0
      return [t.name, branch?.name || '—', t.rating, t.batchIds.length, avgScore]
    }),
  },
  {
    id: 'lead-source-roi', title: 'Lead Source ROI Report', description: 'Campaign spend, leads generated, and conversions by channel.',
    icon: <DollarSign size={18} />, color: '#FBBF24',
    headers: ['Channel', 'Total Budget', 'Leads Generated', 'Conversions', 'Cost per Lead', 'Cost per Conversion'],
    buildRows: (s) => {
      const byChannel: Record<string, { budget: number; leads: number; conversions: number }> = {}
      s.campaigns.forEach((c) => {
        if (!byChannel[c.channel]) byChannel[c.channel] = { budget: 0, leads: 0, conversions: 0 }
        byChannel[c.channel].budget += c.budget
        byChannel[c.channel].leads += c.leadsGenerated
        byChannel[c.channel].conversions += c.conversions
      })
      return Object.entries(byChannel).map(([channel, v]) => [
        channel, v.budget, v.leads, v.conversions,
        v.leads > 0 ? Math.round(v.budget / v.leads) : 0,
        v.conversions > 0 ? Math.round(v.budget / v.conversions) : 0,
      ])
    },
  },
]

export default function ReportsCentrePage() {
  const store = useAppStore()
  const [generating, setGenerating] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ id: string; reportId: string; title: string; generatedAt: string; csv: string; filename: string }>>([])

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerate = async (report: ReportDef) => {
    setGenerating(report.id)
    await new Promise((r) => setTimeout(r, 500))
    const rows = report.buildRows(store)
    const csv = buildCSV(report.headers, rows)
    const filename = `${report.id}-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csv, filename)
    setHistory((h) => [{ id: `${report.id}-${Date.now()}`, reportId: report.id, title: report.title, generatedAt: new Date().toISOString(), csv, filename }, ...h])
    toast.success('Report generated', `${report.title} (CSV) downloaded — ${rows.length} rows.`)
    setGenerating(null)
  }

  const totalRevenue = store.invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0)
  const totalSessions = store.attendance.length
  const totalLeads = store.leads.length

  return (
    <div className="space-y-5">
      <PageHeader title="Reports Centre" subtitle="Generate real CSV exports computed from live platform data" />

      <div className="grid grid-cols-3 gap-3">
        <div className="plato-card p-4 text-center">
          <p className="text-[20px] font-bold font-display text-[#00FFA3]">{formatCurrency(totalRevenue)}</p>
          <p className="text-[11px] text-white/30 mt-1">Revenue Collected</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[20px] font-bold font-display text-[#4D7CFF]">{totalSessions}</p>
          <p className="text-[11px] text-white/30 mt-1">Attendance Records</p>
        </div>
        <div className="plato-card p-4 text-center">
          <p className="text-[20px] font-bold font-display text-[#7B61FF]">{totalLeads}</p>
          <p className="text-[11px] text-white/30 mt-1">Total Leads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map((report) => (
          <div key={report.id} className="plato-card p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${report.color}15`, color: report.color }}>
              {report.icon}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-white/90">{report.title}</p>
              <p className="text-[12px] text-white/40 mt-1">{report.description}</p>
              <button
                className="btn-primary mt-3 text-[12px]"
                disabled={generating === report.id}
                onClick={() => handleGenerate(report)}
              >
                {generating === report.id
                  ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                  : <><FileText size={13} /> Generate CSV</>
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="plato-card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[13px] font-semibold text-white/70">Recently Generated</h3>
          </div>
          <div className="divide-y divide-white/5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-4">
                <FileText size={15} className="text-white/30" />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-white/80">{h.title}</p>
                  <p className="text-[11px] text-white/30">{formatDateTime(h.generatedAt)}</p>
                </div>
                <button className="btn-ghost text-[12px]" onClick={() => downloadCSV(h.csv, h.filename)}><Download size={13} /> Download</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

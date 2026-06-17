import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function formatDateFull(date: string | Date): string {
  return format(new Date(date), 'PPP')
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatCurrency(amount: number, currency = 'AED'): string {
  return `${currency} ${amount.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function calculateAttendanceRate(
  present: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((present / total) * 100)
}

export function gradeFromPercentage(pct: number): string {
  if (pct >= 90) return 'A*'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  if (pct >= 40) return 'E'
  return 'U'
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A*': return 'text-[#00FFA3]'
    case 'A': return 'text-[#4D7CFF]'
    case 'B': return 'text-[#7B61FF]'
    case 'C': return 'text-amber-400'
    case 'D': return 'text-orange-400'
    default: return 'text-[#FF6B7A]'
  }
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-danger',
    present: 'badge-success',
    absent: 'badge-danger',
    late: 'badge-warning',
    excused: 'badge-info',
    paid: 'badge-success',
    pending: 'badge-warning',
    overdue: 'badge-danger',
    waived: 'badge-purple',
    new: 'badge-info',
    contacted: 'badge-purple',
    trial_scheduled: 'badge-warning',
    trial_done: 'badge-info',
    enrolled: 'badge-success',
    lost: 'badge-danger',
    upcoming: 'badge-info',
    completed: 'badge-success',
    graded: 'badge-success',
    assigned: 'badge-warning',
    submitted: 'badge-info',
    missing: 'badge-danger',
    confirmed: 'badge-success',
    cancelled: 'badge-danger',
  }
  return map[status] ?? 'badge-info'
}

export function getPlanetEmoji(planet: string): string {
  const map: Record<string, string> = {
    Mercury: '☿',
    Venus: '♀',
    Earth: '🌍',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Neptune: '♆',
    Pluto: '⚡',
  }
  return map[planet] ?? '🌍'
}

export function getNextPlanet(current: string): string | null {
  const order = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Pluto']
  const idx = order.indexOf(current)
  return idx < order.length - 1 ? order[idx + 1] : null
}

export function daysUntil(date: string): number {
  const d = new Date(date)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

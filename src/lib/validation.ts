import { useRef, useState } from 'react'

// UAE mobile/landline numbers: +971 followed by area code 2/4/5/6/7/8/9 then 7 digits,
// loosely grouped (e.g. "+971 4 123 4567", "+971 50 123 4567").
const UAE_PHONE_RE = /^\+971[\s-]?[2456789]\d{0,1}[\s-]?\d{3}[\s-]?\d{4}$/

export const UAE_PHONE_ERROR = 'Enter a valid UAE phone number (e.g. +971 4 123 4567)'
export const EMAIL_ERROR = 'Enter a valid email address'
export const REQUIRED_ERROR = 'This field is required'

export function isValidUaePhone(value: string): boolean {
  return UAE_PHONE_RE.test(value.trim())
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function rangeError(min: number, max: number): string {
  return `Must be between ${min} and ${max}`
}

// Comma-group a numeric AED amount on blur: "2400" -> "2,400". Leaves partial/invalid input as-is.
export function formatAedOnBlur(value: string): string {
  const num = Number(value.replace(/,/g, ''))
  if (!value.trim() || Number.isNaN(num)) return value
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

// Strip comma grouping so the raw number is editable while focused.
export function parseAedOnFocus(value: string): string {
  return value.replace(/,/g, '')
}

export function aedNumber(value: string): number {
  return Number(value.replace(/,/g, '')) || 0
}

// DD/MM/YYYY display, used everywhere instead of the browser-default locale format.
export function formatDateUAE(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

// Tracks whether a form's current values differ from their initial snapshot.
export function useDirtyForm<T>(initial: T) {
  const initialRef = useRef(initial)
  const [current, setCurrent] = useState<T>(initial)
  const isDirty = JSON.stringify(current) !== JSON.stringify(initialRef.current)
  return { current, setCurrent, isDirty }
}

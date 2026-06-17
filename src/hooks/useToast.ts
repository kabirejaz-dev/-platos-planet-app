import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

let listeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function emit() {
  listeners.forEach((fn) => fn([...toasts]))
}

export const toast = {
  show(type: ToastType, title: string, message?: string) {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, type, title, message }]
    emit()
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      emit()
    }, 3500)
  },
  success: (title: string, message?: string) => toast.show('success', title, message),
  error:   (title: string, message?: string) => toast.show('error',   title, message),
  warning: (title: string, message?: string) => toast.show('warning', title, message),
  info:    (title: string, message?: string) => toast.show('info',    title, message),
}

export function useToastState() {
  const [items, setItems] = useState<Toast[]>([])
  const subscribe = useCallback((fn: (t: Toast[]) => void) => {
    listeners.push(fn)
    return () => { listeners = listeners.filter((l) => l !== fn) }
  }, [])
  return { items, setItems, subscribe }
}

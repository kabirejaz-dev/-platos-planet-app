import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  action?: ToastAction
}

let listeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function emit() {
  listeners.forEach((fn) => fn([...toasts]))
}

export const toast = {
  show(type: ToastType, title: string, message?: string, action?: ToastAction) {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, type, title, message, action }]
    emit()
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      emit()
    }, action ? 7000 : 3500)
  },
  success: (title: string, message?: string, action?: ToastAction) => toast.show('success', title, message, action),
  error:   (title: string, message?: string, action?: ToastAction) => toast.show('error',   title, message, action),
  warning: (title: string, message?: string, action?: ToastAction) => toast.show('warning', title, message, action),
  info:    (title: string, message?: string, action?: ToastAction) => toast.show('info',    title, message, action),
}

export function useToastState() {
  const [items, setItems] = useState<Toast[]>([])
  const subscribe = useCallback((fn: (t: Toast[]) => void) => {
    listeners.push(fn)
    return () => { listeners = listeners.filter((l) => l !== fn) }
  }, [])
  return { items, setItems, subscribe }
}

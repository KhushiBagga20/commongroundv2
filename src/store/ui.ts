/** Transient UI state: toasts and global dialogs. Never persisted. */
import { create } from 'zustand'

export type ToastTone = 'ink' | 'acid' | 'gum' | 'butter' | 'lav' | 'tang'

export interface Toast {
  id: number
  title: string
  body?: string
  tone: ToastTone
  kind?: 'achievement' | 'info'
}

interface UIState {
  toasts: Toast[]
  passOpen: boolean
  shortcutsOpen: boolean
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
  openPass: () => void
  closePass: () => void
  setShortcuts: (open: boolean) => void
}

let nextId = 1

export const useUI = create<UIState>()((set) => ({
  toasts: [],
  passOpen: false,
  shortcutsOpen: false,
  pushToast: (t) => set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id: nextId++ }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  openPass: () => set({ passOpen: true }),
  closePass: () => set({ passOpen: false }),
  setShortcuts: (open) => set({ shortcutsOpen: open }),
}))

export const toast = (t: Omit<Toast, 'id'>) => useUI.getState().pushToast(t)

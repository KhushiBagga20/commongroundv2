import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react'
import { X } from 'lucide-react'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/format'
import { spring } from '@/motion/springs'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Focus trap + Escape + scroll lock + focus restore for any modal surface. */
function useModalBehaviour(open: boolean, panel: React.RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose)
  useLayoutEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const el = panel.current
    const raf = requestAnimationFrame(() => {
      const target = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(FOCUSABLE)
      target?.focus({ preventScroll: true })
    })
    const onKey = (e: KeyboardEvent) => {
      // only the topmost modal listens
      const stack = document.querySelectorAll('[data-modal-open="true"]')
      if (el && stack.length && stack[stack.length - 1] !== el) return
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !el) return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.({ preventScroll: true })
    }
  }, [open, panel])
}

interface SheetProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
  /** desktop width */
  width?: number
  tone?: 'light' | 'dark'
}

/** Side sheet on desktop, draggable bottom sheet on mobile. */
export function Sheet({ open, onClose, label, children, className, width = 520, tone = 'light' }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()
  const controls = useDragControls()
  useModalBehaviour(open, panel, onClose)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 700) onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="overlay-root" key="sheet">
          <motion.div className="overlay-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            data-modal-open="true"
            className={cn('sheet', mobile ? 'sheet--bottom' : 'sheet--side', tone === 'dark' ? 'tone-dark' : 'tone-light', className)}
            style={mobile ? undefined : { width: `min(${width}px, 100vw - 24px)` }}
            initial={mobile ? { y: '100%' } : { x: '105%', rotate: 2 }}
            animate={mobile ? { y: 0 } : { x: 0, rotate: 0 }}
            exit={mobile ? { y: '100%' } : { x: '105%', rotate: 2 }}
            transition={spring.gentle}
            drag={mobile ? 'y' : false}
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={mobile ? onDragEnd : undefined}
          >
            {mobile && <div className="sheet__grip" aria-hidden="true" onPointerDown={(e) => controls.start(e)} />}
            <button type="button" className="sheet__close ink-btn ink-btn--sm ink-btn--icon" onClick={onClose} aria-label="Close">
              <X size={18} strokeWidth={2.6} />
            </button>
            <div className="sheet__body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

interface DialogProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
  dismissable?: boolean
}

/** Centered modal that drops in like a card being placed on a table. */
export function Dialog({ open, onClose, label, children, className, dismissable = true }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null)
  useModalBehaviour(open, panel, onClose)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="overlay-root overlay-root--center" key="dialog">
          <motion.div
            className="overlay-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissable ? onClose : undefined}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            data-modal-open="true"
            className={cn('dialog', className)}
            initial={{ y: 60, rotate: -4, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, rotate: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, rotate: 3, scale: 0.94, opacity: 0, transition: { duration: 0.18 } }}
            transition={spring.bouncy}
          >
            {dismissable && (
              <button type="button" className="dialog__close ink-btn ink-btn--sm ink-btn--icon" onClick={onClose} aria-label="Close">
                <X size={18} strokeWidth={2.6} />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

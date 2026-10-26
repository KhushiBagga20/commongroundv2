import { forwardRef, useRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { useMagnetic } from '@/hooks/pointer'
import { cn } from '@/lib/format'

type Size = 'sm' | 'md' | 'lg'

interface Look {
  face?: string
  fg?: string
  shadow?: string
  size?: Size
  square?: boolean
  icon?: boolean
}

function lookClass({ size = 'md', square, icon }: Look) {
  return cn('ink-btn', size === 'sm' && 'ink-btn--sm', size === 'lg' && 'ink-btn--lg', square && 'ink-btn--square', icon && 'ink-btn--icon')
}

function lookStyle({ face, fg, shadow }: Look, style?: CSSProperties): CSSProperties {
  return { ...(face && { '--face': face }), ...(fg && { '--fg': fg }), ...(shadow && { '--sh': shadow }), ...style } as CSSProperties
}

export type InkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Look & { children: ReactNode; magnetic?: boolean }

/** The tactile button: depresses into its shadow and springs back. */
export const InkButton = forwardRef<HTMLButtonElement, InkButtonProps>(function InkButton(
  { face, fg, shadow, size, square, icon, magnetic, className, style, children, type = 'button', ...rest },
  ref,
) {
  const btn = (
    <button ref={ref} type={type} className={cn(lookClass({ size, square, icon }), className)} style={lookStyle({ face, fg, shadow }, style)} {...rest}>
      {children}
    </button>
  )
  return magnetic ? <Magnet>{btn}</Magnet> : btn
})

export function InkLink({ face, fg, shadow, size, square, icon, magnetic, className, style, children, ...rest }: LinkProps & Look & { magnetic?: boolean }) {
  const link = (
    <Link className={cn(lookClass({ size, square, icon }), className)} style={lookStyle({ face, fg, shadow }, style)} {...rest}>
      {children}
    </Link>
  )
  return magnetic ? <Magnet>{link}</Magnet> : link
}

/** Wrapper that drifts toward the cursor; keeps the press transform on the child. */
export function Magnet({ children, strength, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useMagnetic(ref, { strength })
  return (
    <span ref={ref} className={cn('inline-flex will-change-transform', className)}>
      {children}
    </span>
  )
}

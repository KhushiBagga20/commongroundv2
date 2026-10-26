import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/format'

export interface KeycapProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** colour of the cap when pressed/selected */
  on?: string
  /** resting cap colour */
  cap?: string
  led?: string | false
  legend?: ReactNode
  depth?: number
  radius?: number
  children?: ReactNode
  faceClassName?: string
}

/** Glossy 3D key. Selected states lock the key down and light its LED. */
export const Keycap = forwardRef<HTMLButtonElement, KeycapProps>(function Keycap(
  { on, cap, led, legend, depth, radius, className, faceClassName, style, children, type = 'button', ...rest },
  ref,
) {
  const vars = {
    ...(on && { '--cap-on': on }),
    ...(cap && { '--cap': cap }),
    ...(led && { '--led': led }),
    ...(depth != null && { '--depth': `${depth}px` }),
    ...(radius != null && { '--radius': `${radius}px` }),
    ...style,
  } as CSSProperties
  return (
    <button ref={ref} type={type} className={cn('keycap', className)} style={vars} {...rest}>
      <span className="keycap__base" aria-hidden="true" />
      <span className={cn('keycap__top', faceClassName)}>
        {(legend || led !== false) && (
          <span className="keycap__meta" aria-hidden="true">
            {legend && <span className="keycap__legend">{legend}</span>}
            {led !== false && <span className="keycap__led" />}
          </span>
        )}
        {children}
      </span>
    </button>
  )
})

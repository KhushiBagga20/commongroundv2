export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export function pad(n: number, size = 2): string {
  return String(n).padStart(size, '0')
}

const RTF = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' })

export function timeAgo(iso: string | number, now = Date.now()): string {
  const t = typeof iso === 'number' ? iso : Date.parse(iso)
  const diff = (t - now) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return 'just now'
  if (abs < 3600) return RTF.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return RTF.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 30) return RTF.format(Math.round(diff / 86400), 'day')
  return RTF.format(Math.round(diff / (86400 * 30)), 'month')
}

const DAY = new Intl.DateTimeFormat('en', { weekday: 'short' })
const DATE = new Intl.DateTimeFormat('en', { day: 'numeric' })
const MONTH = new Intl.DateTimeFormat('en', { month: 'short' })
const TIME = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' })
const LONG = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })

export function ticketDate(iso: string) {
  const d = new Date(iso)
  return { day: DAY.format(d), date: DATE.format(d), month: MONTH.format(d), time: TIME.format(d) }
}

export function longDate(t: number | string): string {
  return LONG.format(new Date(t))
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

/**
 * The Hobby Dossier lives in the URL (?h=<id>) so it can be deep-linked and
 * closed with the browser's Back button, without changing the current space.
 */
export function useDossier() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const current = params.get('h')

  const open = useCallback(
    (id: string) => {
      const next = new URLSearchParams(location.search)
      next.set('h', id)
      const pushedFromApp = (location.state as { dossier?: boolean } | null)?.dossier
      // Hopping between dossiers replaces the entry so Back always closes the sheet.
      navigate({ pathname: location.pathname, search: `?${next}` }, { state: { dossier: true }, replace: !!pushedFromApp })
    },
    [navigate, location],
  )

  const close = useCallback(() => {
    if ((location.state as { dossier?: boolean } | null)?.dossier) {
      navigate(-1)
      return
    }
    const next = new URLSearchParams(location.search)
    next.delete('h')
    const search = next.toString()
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true })
  }, [navigate, location])

  return { current, open, close }
}

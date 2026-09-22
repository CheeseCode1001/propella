import { API_URL } from '@/lib/constants'

/**
 * The diagram, graph or table a past question depends on.
 *
 * Bank diagrams are stored as paths on the API ("/static/past-questions/...");
 * anything else is already an absolute URL. The images are line drawings on
 * white, so they keep a white card in dark mode too - inverting them would
 * turn the labels unreadable.
 */
export function QuestionImage({ url, compact = false }: { url: string; compact?: boolean }) {
  const src = url.startsWith('/') ? `${API_URL}${url}` : url
  return (
    // Served cross-origin by the API at its natural size; next/image would
    // need the API host whitelisted per environment for no real gain here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Diagram for this question"
      loading="lazy"
      style={{
        display: 'block',
        maxWidth: '100%',
        maxHeight: compact ? 220 : 380,
        height: 'auto',
        margin: compact ? '8px 0 12px' : '0 0 20px',
        padding: 8,
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-rule)',
        borderRadius: 'var(--radius-sm)',
      }}
    />
  )
}

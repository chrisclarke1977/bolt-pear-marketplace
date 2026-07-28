import type { MarketEvent, Interaction } from '../types'

interface Props {
  event: MarketEvent
  interactions: Interaction[]
  onClick: () => void
}

const PLACEHOLDER_EMOJI: Record<string, string> = {
  tech: '💻',
  music: '🎵',
  market: '🛍️',
  social: '🤝',
  food: '🍽️',
  general: '📅',
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = Date.now()
  const diff = ts - now
  const day = 86400000
  if (diff < 0) return 'Past event'
  if (diff < day) return 'Today'
  if (diff < day * 2) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function EventCard({ event, interactions, onClick }: Props) {
  const emoji = PLACEHOLDER_EMOJI[event.category] || '📅'
  const likeCount = interactions.filter(
    (i) => i.kind === 'like' && i.targetType === 'event' && i.targetIndex === event.index
  ).length
  const commentCount = interactions.filter(
    (i) => i.kind === 'comment' && i.targetType === 'event' && i.targetIndex === event.index
  ).length

  return (
    <div className="event-card" style={{ animationDelay: `${event.index * 40}ms` }} onClick={onClick}>
      {event.image ? (
        <img className="event-image" src={event.image} alt={event.title} loading="lazy" />
      ) : (
        <div className="event-image-placeholder">{emoji}</div>
      )}
      <div className="event-body">
        <div className="event-date-badge">{formatDate(event.date)}</div>
        <div className="event-title">{event.title}</div>
        <div className="event-description">{event.description}</div>
        <div className="event-footer">
          <div className="event-location">📍 {event.location}</div>
          <div className="event-attendees">{event.attendees.length} attending</div>
        </div>
        <div className="event-bottom-row">
          <div className="card-interactions">
            <span className="card-interaction" title="Likes">❤️ {likeCount}</span>
            <span className="card-interaction" title="Comments">💬 {commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import type { Interaction, Listing, MarketEvent } from '../types'

interface Props {
  interactions: Interaction[]
  listings: Listing[]
  events: MarketEvent[]
  query: string
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface FeedItem {
  interaction: Interaction
  targetTitle: string
  targetEmoji: string
}

export function ActivityFeed({ interactions, listings, events, query }: Props) {
  const feedItems = useMemo(() => {
    const sorted = [...interactions].sort((a, b) => b.createdAt - a.createdAt)
    return sorted.map((int) => {
      let targetTitle = 'Unknown'
      let targetEmoji = '📦'
      if (int.targetType === 'listing') {
        const listing = listings.find((l) => l.index === int.targetIndex)
        if (listing) {
          targetTitle = listing.title
          targetEmoji = '📦'
        }
      } else {
        const event = events.find((e) => e.index === int.targetIndex)
        if (event) {
          targetTitle = event.title
          targetEmoji = '📅'
        }
      }
      return { interaction: int, targetTitle, targetEmoji } as FeedItem
    })
  }, [interactions, listings, events])

  if (feedItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-title">No activity yet</div>
        <div className="empty-subtitle">
          {query ? 'Try a different search.' : 'Likes and comments from the network will appear here!'}
        </div>
      </div>
    )
  }

  const filtered = feedItems.filter((item) => {
    const q = query.toLowerCase()
    return !q ||
      item.targetTitle.toLowerCase().includes(q) ||
      item.interaction.peerId.toLowerCase().includes(q) ||
      (item.interaction.text || '').toLowerCase().includes(q)
  })

  return (
    <div className="activity-feed">
      {filtered.map((item, idx) => {
        const { interaction: int, targetTitle, targetEmoji } = item
        return (
          <div key={int.id} className="activity-item" style={{ animationDelay: `${idx * 30}ms` }}>
            <div className="activity-icon-wrap">
              <span className="activity-target-emoji">{targetEmoji}</span>
              <span className="activity-kind-badge">{int.kind === 'like' ? '❤️' : '💬'}</span>
            </div>
            <div className="activity-body">
              <div className="activity-text">
                <span className="activity-peer">{int.peerId.slice(0, 12)}</span>
                {' '}
                {int.kind === 'like' ? 'liked' : 'commented on'}
                {' '}
                <span className="activity-target">{targetTitle}</span>
              </div>
              {int.kind === 'comment' && int.text && (
                <div className="activity-comment-text">"{int.text}"</div>
              )}
              <div className="activity-time">{timeAgo(int.createdAt)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

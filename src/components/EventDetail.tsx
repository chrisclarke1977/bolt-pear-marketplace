import { useState } from 'react'
import type { MarketEvent, PeerInfo, Interaction } from '../types'
import type { MarketClient as MC } from '../marketClient'

interface Props {
  event: MarketEvent
  client: MC
  peerInfo: PeerInfo | null
  interactions: Interaction[]
  onClose: () => void
}

const PLACEHOLDER_EMOJI: Record<string, string> = {
  tech: '💻',
  music: '🎵',
  market: '🛍️',
  social: '🤝',
  food: '🍽️',
  general: '📅',
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

export function EventDetail({ event, client, peerInfo, interactions, onClose }: Props) {
  const [commentText, setCommentText] = useState('')

  const emoji = PLACEHOLDER_EMOJI[event.category] || '📅'
  const isHost = peerInfo?.peerId === event.hostPeerId
  const isAttending = peerInfo ? event.attendees.includes(peerInfo.peerId) : false
  const myPeerId = peerInfo?.peerId || 'mock-peer'

  const itemInteractions = interactions.filter(
    (i) => i.targetType === 'event' && i.targetIndex === event.index
  )
  const likes = itemInteractions.filter((i) => i.kind === 'like')
  const comments = itemInteractions.filter((i) => i.kind === 'comment').sort((a, b) => a.createdAt - b.createdAt)
  const hasLiked = likes.some((l) => l.peerId === myPeerId)
  const myLike = likes.find((l) => l.peerId === myPeerId)

  const handleDelete = () => {
    client.deleteEvent(event.index)
    onClose()
  }

  const handleJoin = () => {
    client.joinEvent(event.index)
  }

  const handleLeave = () => {
    client.leaveEvent(event.index)
  }

  const handleToggleLike = () => {
    if (hasLiked && myLike) {
      client.removeInteraction(myLike.index)
    } else {
      client.addInteraction({
        kind: 'like',
        targetType: 'event',
        targetId: event.id,
        targetIndex: event.index,
      })
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    client.addInteraction({
      kind: 'comment',
      targetType: 'event',
      targetId: event.id,
      targetIndex: event.index,
      text: commentText.trim(),
    })
    setCommentText('')
  }

  const eventDate = new Date(event.date)
  const isPast = event.date < Date.now()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Event details</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {event.image ? (
          <img className="detail-image" src={event.image} alt={event.title} />
        ) : (
          <div className="detail-image-placeholder">{emoji}</div>
        )}
        <div className="detail-content">
          <div className="detail-title">{event.title}</div>
          <div className="event-detail-date">
            {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' at '}
            {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className="event-detail-location">📍 {event.location}</div>
          <div className="detail-meta">
            <span className="detail-badge">{event.category}</span>
            <span className={`detail-badge ${isPast ? 'badge-past' : ''}`}>
              {isPast ? 'Past event' : `${event.attendees.length} attending`}
            </span>
          </div>
          <div className="detail-description">{event.description}</div>
          <div className="detail-seller">
            Host: {event.hostPeerId?.slice(0, 24)}...
          </div>
          <div className="event-attendees-list">
            {event.attendees.length > 0 ? (
              <>
                <div className="attendees-label">Attendees</div>
                <div className="attendees-avatars">
                  {event.attendees.slice(0, 8).map((a, i) => (
                    <div key={i} className="attendee-avatar" title={a}>
                      {a.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {event.attendees.length > 8 && (
                    <div className="attendee-more">+{event.attendees.length - 8}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="attendees-label">No attendees yet — be the first to join!</div>
            )}
          </div>

          <div className="interaction-bar">
            <button className={`like-btn ${hasLiked ? 'liked' : ''}`} onClick={handleToggleLike}>
              <span className="like-icon">{hasLiked ? '❤️' : '🤍'}</span>
              <span className="like-count">{likes.length}</span>
            </button>
          </div>

          <div className="comments-section">
            <div className="comments-header">{comments.length} comments</div>
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="comments-empty">No comments yet. Be the first to comment!</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar">{c.peerId.slice(0, 2).toUpperCase()}</div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author">{c.peerId.slice(0, 12)}</span>
                        <span className="comment-time">{timeAgo(c.createdAt)}</span>
                      </div>
                      <div className="comment-text">{c.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form className="comment-form" onSubmit={handleAddComment}>
              <input
                className="comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                autoFocus
              />
              <button type="submit" className="btn btn-primary comment-submit" disabled={!commentText.trim()}>Post</button>
            </form>
          </div>

          <div className="detail-actions">
            {isHost ? (
              <button className="btn btn-danger" onClick={handleDelete}>Cancel event</button>
            ) : isPast ? null : isAttending ? (
              <button className="btn btn-secondary" onClick={handleLeave}>Leave event</button>
            ) : (
              <button className="btn btn-primary" onClick={handleJoin}>Join event</button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

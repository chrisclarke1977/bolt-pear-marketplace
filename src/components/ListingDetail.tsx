import { useState } from 'react'
import type { Listing, PeerInfo, Interaction } from '../types'
import type { MarketClient as MC } from '../marketClient'

interface Props {
  listing: Listing
  client: MC
  peerInfo: PeerInfo | null
  interactions: Interaction[]
  onClose: () => void
}

const PLACEHOLDER_EMOJI: Record<string, string> = {
  electronics: '📱',
  home: '🏠',
  sports: '⚽',
  music: '🎸',
  clothing: '👕',
  books: '📚',
  general: '📦',
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

export function ListingDetail({ listing, client, peerInfo, interactions, onClose }: Props) {
  const [commentText, setCommentText] = useState('')

  const emoji = PLACEHOLDER_EMOJI[listing.category] || '📦'
  const isOwnListing = peerInfo?.peerId === listing.sellerPeerId
  const myPeerId = peerInfo?.peerId || 'mock-peer'

  const itemInteractions = interactions.filter(
    (i) => i.targetType === 'listing' && i.targetIndex === listing.index
  )
  const likes = itemInteractions.filter((i) => i.kind === 'like')
  const comments = itemInteractions.filter((i) => i.kind === 'comment').sort((a, b) => a.createdAt - b.createdAt)
  const hasLiked = likes.some((l) => l.peerId === myPeerId)
  const myLike = likes.find((l) => l.peerId === myPeerId)

  const handleDelete = () => {
    client.deleteListing(listing.index)
    onClose()
  }

  const handleToggleLike = () => {
    if (hasLiked && myLike) {
      client.removeInteraction(myLike.index)
    } else {
      client.addInteraction({
        kind: 'like',
        targetType: 'listing',
        targetId: listing.id,
        targetIndex: listing.index,
      })
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    client.addInteraction({
      kind: 'comment',
      targetType: 'listing',
      targetId: listing.id,
      targetIndex: listing.index,
      text: commentText.trim(),
    })
    setCommentText('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Listing details</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {listing.image ? (
          <img className="detail-image" src={listing.image} alt={listing.title} />
        ) : (
          <div className="detail-image-placeholder">{emoji}</div>
        )}
        <div className="detail-content">
          <div className="detail-title">{listing.title}</div>
          <div className="detail-price">
            {listing.currency === 'USD' ? '$' : ''}
            {listing.price.toLocaleString()} {listing.currency !== 'USD' ? listing.currency : ''}
          </div>
          <div className="detail-meta">
            <span className="detail-badge">{listing.category}</span>
            <span className="detail-badge">{new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="detail-description">{listing.description}</div>
          <div className="detail-seller">
            Seller peer: {listing.sellerPeerId?.slice(0, 24)}...
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
            {isOwnListing ? (
              <button className="btn btn-danger" onClick={handleDelete}>Delete listing</button>
            ) : (
              <button className="btn btn-primary" onClick={() => alert('Contact initiated with seller peer via Hyperswarm (demo).')}>
                Contact seller
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

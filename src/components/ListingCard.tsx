import type { Listing, Interaction } from '../types'

interface Props {
  listing: Listing
  interactions: Interaction[]
  onClick: () => void
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

export function ListingCard({ listing, interactions, onClick }: Props) {
  const emoji = PLACEHOLDER_EMOJI[listing.category] || '📦'
  const likeCount = interactions.filter(
    (i) => i.kind === 'like' && i.targetType === 'listing' && i.targetIndex === listing.index
  ).length
  const commentCount = interactions.filter(
    (i) => i.kind === 'comment' && i.targetType === 'listing' && i.targetIndex === listing.index
  ).length

  return (
    <div className="listing-card" style={{ animationDelay: `${listing.index * 40}ms` }} onClick={onClick}>
      {listing.image ? (
        <img className="listing-image" src={listing.image} alt={listing.title} loading="lazy" />
      ) : (
        <div className="listing-image-placeholder">{emoji}</div>
      )}
      <div className="listing-body">
        <div className="listing-title">{listing.title}</div>
        <div className="listing-description">{listing.description}</div>
        <div className="listing-footer">
          <div className="listing-price">
            {listing.currency === 'USD' ? '$' : ''}
            {listing.price.toLocaleString()} {listing.currency !== 'USD' ? listing.currency : ''}
          </div>
          <div className="listing-category">{listing.category}</div>
        </div>
        <div className="listing-bottom-row">
          <div className="listing-seller">
            {listing.sellerPeerId?.slice(0, 12)}...
          </div>
          <div className="card-interactions">
            <span className="card-interaction" title="Likes">❤️ {likeCount}</span>
            <span className="card-interaction" title="Comments">💬 {commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

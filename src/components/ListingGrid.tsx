import { useState, useMemo } from 'react'
import type { Listing, Interaction } from '../types'
import { ListingCard } from './ListingCard'

export type ListingSort = 'recent' | 'price-low' | 'price-high' | 'popular'
type PriceFilter = 'all' | 'under-25' | '25-100' | '100-500' | 'over-500'
type ImageFilter = 'all' | 'with-image'

interface Props {
  listings: Listing[]
  interactions: Interaction[]
  onSelect: (listing: Listing) => void
  query: string
}

const SORT_LABELS: Record<ListingSort, string> = {
  'recent': 'Newest',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
  'popular': 'Most Liked',
}

const PRICE_LABELS: Record<PriceFilter, string> = {
  'all': 'Any Price',
  'under-25': 'Under $25',
  '25-100': '$25 – $100',
  '100-500': '$100 – $500',
  'over-500': 'Over $500',
}

function likeCountFor(listing: Listing, interactions: Interaction[]): number {
  return interactions.filter(
    (i) => i.kind === 'like' && i.targetType === 'listing' && i.targetIndex === listing.index
  ).length
}

function matchesPrice(listing: Listing, filter: PriceFilter): boolean {
  switch (filter) {
    case 'under-25': return listing.price < 25
    case '25-100': return listing.price >= 25 && listing.price <= 100
    case '100-500': return listing.price > 100 && listing.price <= 500
    case 'over-500': return listing.price > 500
    default: return true
  }
}

export function ListingGrid({ listings, interactions, onSelect, query }: Props) {
  const [sort, setSort] = useState<ListingSort>('recent')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [imageFilter, setImageFilter] = useState<ImageFilter>('all')

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (!matchesPrice(l, priceFilter)) return false
      if (imageFilter === 'with-image' && !l.image) return false
      return true
    })
  }, [listings, priceFilter, imageFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sort) {
      case 'price-low':
        return arr.sort((a, b) => a.price - b.price)
      case 'price-high':
        return arr.sort((a, b) => b.price - a.price)
      case 'popular':
        return arr.sort((a, b) => likeCountFor(b, interactions) - likeCountFor(a, interactions))
      default:
        return arr.sort((a, b) => b.createdAt - a.createdAt)
    }
  }, [filtered, interactions, sort])

  if (listings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <div className="empty-title">No listings found</div>
        <div className="empty-subtitle">
          {query ? 'Try a different search term.' : 'Be the first to list an item on the network!'}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="filter-sort-bar">
        <div className="filter-group">
          <select
            className="filter-select"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
          >
            {Object.entries(PRICE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={imageFilter}
            onChange={(e) => setImageFilter(e.target.value as ImageFilter)}
          >
            <option value="all">All Items</option>
            <option value="with-image">With Image Only</option>
          </select>
        </div>
        <div className="sort-group">
          <span className="sort-label">Sort by</span>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as ListingSort)}
          >
            {Object.entries(SORT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No matches</div>
          <div className="empty-subtitle">Try adjusting your filters.</div>
        </div>
      ) : (
        <div className="listing-grid">
          {sorted.map((listing) => (
            <ListingCard key={listing.id} listing={listing} interactions={interactions} onClick={() => onSelect(listing)} />
          ))}
        </div>
      )}
    </>
  )
}

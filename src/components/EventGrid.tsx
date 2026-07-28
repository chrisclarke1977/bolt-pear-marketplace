import { useState, useMemo } from 'react'
import type { MarketEvent, Interaction } from '../types'
import { EventCard } from './EventCard'

export type EventSort = 'upcoming' | 'recent' | 'popular'
type TimeFilter = 'all' | 'upcoming' | 'today' | 'this-week' | 'past'

interface Props {
  events: MarketEvent[]
  interactions: Interaction[]
  onSelect: (event: MarketEvent) => void
  query: string
}

const SORT_LABELS: Record<EventSort, string> = {
  'upcoming': 'Upcoming Soonest',
  'recent': 'Newest',
  'popular': 'Most Liked',
}

const TIME_LABELS: Record<TimeFilter, string> = {
  'all': 'All Time',
  'upcoming': 'Upcoming',
  'today': 'Today',
  'this-week': 'This Week',
  'past': 'Past Events',
}

function likeCountFor(event: MarketEvent, interactions: Interaction[]): number {
  return interactions.filter(
    (i) => i.kind === 'like' && i.targetType === 'event' && i.targetIndex === event.index
  ).length
}

function startOfDay(d: Date): number {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c.getTime()
}

function matchesTime(event: MarketEvent, filter: TimeFilter): boolean {
  const now = Date.now()
  const todayStart = startOfDay(new Date())
  const todayEnd = todayStart + 86400000
  const weekEnd = todayStart + 7 * 86400000
  switch (filter) {
    case 'upcoming': return event.date >= now
    case 'today': return event.date >= todayStart && event.date < todayEnd
    case 'this-week': return event.date >= todayStart && event.date < weekEnd
    case 'past': return event.date < now
    default: return true
  }
}

export function EventGrid({ events, interactions, onSelect, query }: Props) {
  const [sort, setSort] = useState<EventSort>('upcoming')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  const filtered = useMemo(() => {
    return events.filter((e) => matchesTime(e, timeFilter))
  }, [events, timeFilter])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sort) {
      case 'recent':
        return arr.sort((a, b) => b.createdAt - a.createdAt)
      case 'popular':
        return arr.sort((a, b) => likeCountFor(b, interactions) - likeCountFor(a, interactions))
      default:
        return arr.sort((a, b) => a.date - b.date)
    }
  }, [filtered, interactions, sort])

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <div className="empty-title">No events found</div>
        <div className="empty-subtitle">
          {query ? 'Try a different search term.' : 'Be the first to create an event on the network!'}
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
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          >
            {Object.entries(TIME_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="sort-group">
          <span className="sort-label">Sort by</span>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as EventSort)}
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
        <div className="event-grid">
          {sorted.map((event) => (
            <EventCard key={event.id} event={event} interactions={interactions} onClick={() => onSelect(event)} />
          ))}
        </div>
      )}
    </>
  )
}

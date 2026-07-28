import { useState, useMemo } from 'react'
import type { MarketEvent } from '../types'

interface Props {
  events: MarketEvent[]
  onSelect: (event: MarketEvent) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function Calendar({ events, onSelect }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startWeekday = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const cells: (Date | null)[] = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, MarketEvent[]>()
    for (const e of events) {
      const d = new Date(e.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        const arr = map.get(key) || []
        arr.push(e)
        map.set(key, arr)
      }
    }
    return map
  }, [events, year, month])

  const today = new Date()
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => { setCurrentDate(new Date()); setSelectedDay(today) }

  const selectedDayEvents = selectedDay
    ? events.filter((e) => isSameDay(new Date(e.date), selectedDay))
    : []

  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date - b.date)
      .slice(0, 5)
  }, [events])

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
        <div className="calendar-month-label">{MONTHS[month]} {year}</div>
        <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, i) => {
          if (!day) return <div key={i} className="calendar-cell empty" />
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
          const dayEvents = eventsByDay.get(key) || []
          const isToday = isSameDay(day, today)
          const isSelected = selectedDay && isSameDay(day, selectedDay)

          return (
            <div
              key={i}
              className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="calendar-day-number">{day.getDate()}</div>
              <div className="calendar-dots">
                {dayEvents.slice(0, 3).map((_, idx) => (
                  <span key={idx} className="calendar-dot" />
                ))}
                {dayEvents.length > 3 && (
                  <span className="calendar-dot-more">+{dayEvents.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button className="calendar-today-btn" onClick={goToday}>Today</button>

      {selectedDay && (
        <div className="calendar-day-events">
          <div className="calendar-day-events-title">
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          {selectedDayEvents.length === 0 ? (
            <div className="calendar-no-events">No events on this day.</div>
          ) : (
            <div className="calendar-event-list">
              {selectedDayEvents
                .sort((a, b) => a.date - b.date)
                .map((e) => (
                  <div key={e.id} className="calendar-event-item" onClick={() => onSelect(e)}>
                    <div className="calendar-event-time">
                      {new Date(e.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div className="calendar-event-info">
                      <div className="calendar-event-title">{e.title}</div>
                      <div className="calendar-event-location">📍 {e.location}</div>
                    </div>
                    <div className="calendar-event-attendees">
                      <svg className="calendar-event-attendees-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {e.attendees.length}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <div className="calendar-upcoming">
        <div className="calendar-upcoming-title">Next 5 Upcoming Events</div>
        {upcomingEvents.length === 0 ? (
          <div className="calendar-no-events">No upcoming events.</div>
        ) : (
          <div className="calendar-event-list">
            {upcomingEvents.map((e) => {
              const d = new Date(e.date)
              return (
                <div key={e.id} className="calendar-event-item" onClick={() => onSelect(e)}>
                  <div className="calendar-upcoming-date">
                    <div className="calendar-upcoming-day">{d.toLocaleDateString('en-US', { day: 'numeric' })}</div>
                    <div className="calendar-upcoming-month">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                  </div>
                  <div className="calendar-event-info">
                    <div className="calendar-event-title">{e.title}</div>
                    <div className="calendar-event-location">📍 {e.location}</div>
                  </div>
                  <div className="calendar-upcoming-time">
                    {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div className="calendar-event-attendees">
                    <svg className="calendar-event-attendees-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {e.attendees.length}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

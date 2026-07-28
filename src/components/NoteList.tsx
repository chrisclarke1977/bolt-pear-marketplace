import { useState, useMemo } from 'react'
import type { Note } from '../types'
import type { MarketClient as MC } from '../marketClient'

interface Props {
  notes: Note[]
  client: MC
  query: string
}

type ColorFilter = 'all' | Note['color']

const COLOR_OPTIONS: { value: Note['color']; label: string }[] = [
  { value: 'yellow', label: 'Yellow' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'pink', label: 'Pink' },
  { value: 'purple', label: 'Purple' },
]

const FILTER_CHIPS: { value: ColorFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...COLOR_OPTIONS,
]

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

export function NoteList({ notes, client, query }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editColor, setEditColor] = useState<Note['color']>('yellow')
  const [colorFilter, setColorFilter] = useState<ColorFilter>('all')

  const filtered = useMemo(() => {
    if (colorFilter === 'all') return notes
    return notes.filter((n) => n.color === colorFilter)
  }, [notes, colorFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })
  }, [filtered])

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <div className="empty-title">No notes yet</div>
        <div className="empty-subtitle">
          {query ? 'Try a different search term.' : 'Jot down an idea or reminder!'}
        </div>
      </div>
    )
  }

  const startEdit = (n: Note) => {
    setEditingIndex(n.index)
    setEditTitle(n.title)
    setEditBody(n.body)
    setEditColor(n.color)
  }

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingIndex === null) return
    client.updateNote(editingIndex, {
      title: editTitle.trim(),
      body: editBody.trim(),
      color: editColor,
    })
    setEditingIndex(null)
  }

  return (
    <div className="note-list-container">
      <div className="filter-sort-bar">
        <div className="filter-group">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              className={`filter-chip ${colorFilter === chip.value ? 'active' : ''}`}
              onClick={() => setColorFilter(chip.value)}
            >
              {chip.value !== 'all' && (
                <span className={`filter-chip-dot ${chip.value}`} />
              )}
              {chip.label}
            </button>
          ))}
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No matches</div>
          <div className="empty-subtitle">Try a different color filter.</div>
        </div>
      ) : (
        <div className="note-grid">
          {sorted.map((n) => {
            const isEditing = editingIndex === n.index
            if (isEditing) {
              return (
                <form key={n.id} className={`note-card note-edit ${editColor}`} onSubmit={saveEdit}>
                  <input className="note-edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" autoFocus />
                  <textarea className="note-edit-body" value={editBody} onChange={(e) => setEditBody(e.target.value)} placeholder="Write your note..." />
                  <div className="note-edit-colors">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`note-color-dot ${c.value} ${editColor === c.value ? 'selected' : ''}`}
                        onClick={() => setEditColor(c.value)}
                        aria-label={c.label}
                      />
                    ))}
                  </div>
                  <div className="note-edit-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingIndex(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save</button>
                  </div>
                </form>
              )
            }
            return (
              <div key={n.id} className={`note-card ${n.color} ${n.pinned ? 'pinned' : ''}`} style={{ animationDelay: `${n.index * 40}ms` }}>
                <div className="note-card-header">
                  <div className="note-card-title">{n.title}</div>
                  <button
                    className={`note-pin-btn ${n.pinned ? 'pinned' : ''}`}
                    onClick={() => client.togglePinNote(n.index)}
                    aria-label={n.pinned ? 'Unpin' : 'Pin'}
                  >
                    {n.pinned ? '📌' : '📍'}
                  </button>
                </div>
                {n.body && <div className="note-card-body">{n.body}</div>}
                <div className="note-card-footer">
                  <span className="note-card-time">{timeAgo(n.updatedAt)}</span>
                  <div className="note-card-actions">
                    <button className="note-action-btn" onClick={() => startEdit(n)} aria-label="Edit note">✎</button>
                    <button className="note-action-btn" onClick={() => client.deleteNote(n.index)} aria-label="Delete note">🗑</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

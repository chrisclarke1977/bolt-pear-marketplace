import { useState } from 'react'
import type { MarketClient } from '../marketClient'
import type { Note } from '../types'

interface Props {
  client: MarketClient
  onClose: () => void
}

const COLOR_OPTIONS: { value: Note['color']; label: string }[] = [
  { value: 'yellow', label: 'Yellow' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'pink', label: 'Pink' },
  { value: 'purple', label: 'Purple' },
]

export function AddNoteModal({ client, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [color, setColor] = useState<Note['color']>('yellow')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() && !body.trim()) { setError('Add a title or some content'); return }

    client.addNote({
      title: title.trim() || 'Untitled',
      body: body.trim(),
      color,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add a note</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="form-textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your note..." rows={5} />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="note-color-picker">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`note-color-dot ${c.value} ${color === c.value ? 'selected' : ''}`}
                    onClick={() => setColor(c.value)}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add note</button>
          </div>
        </form>
      </div>
    </div>
  )
}

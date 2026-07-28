import { useState } from 'react'
import type { MarketClient } from '../marketClient'

interface Props {
  client: MarketClient
  onClose: () => void
}

const CATEGORIES = ['general', 'tech', 'music', 'market', 'social', 'food']

export function CreateEventModal({ client, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('general')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!description.trim()) { setError('Description is required'); return }
    if (!date) { setError('Date is required'); return }
    if (!location.trim()) { setError('Location is required'); return }

    const dateNum = new Date(date).getTime()
    if (isNaN(dateNum)) { setError('Enter a valid date'); return }

    client.addEvent({
      title: title.trim(),
      description: description.trim(),
      date: dateNum,
      location: location.trim(),
      category,
      image: image.trim(),
    })
    onClose()
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create an event</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's the event?" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your event..." />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={date} min={tomorrow} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where is it happening?" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Image URL (optional)</label>
              <input className="form-input" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish to network</button>
          </div>
        </form>
      </div>
    </div>
  )
}

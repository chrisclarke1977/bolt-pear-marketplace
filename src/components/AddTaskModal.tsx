import { useState } from 'react'
import type { MarketClient } from '../marketClient'

interface Props {
  client: MarketClient
  onClose: () => void
}

export function AddTaskModal({ client, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Task title is required'); return }

    client.addTask({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate).getTime() : null,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add a task</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to get done?" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add details..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due date (optional)</label>
                <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add task</button>
          </div>
        </form>
      </div>
    </div>
  )
}

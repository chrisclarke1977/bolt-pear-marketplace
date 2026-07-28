import { useState } from 'react'
import type { MarketClient } from '../marketClient'

interface Props {
  client: MarketClient
  onClose: () => void
}

export function AddContactModal({ client, onClose }: Props) {
  const [name, setName] = useState('')
  const [peerId, setPeerId] = useState('')
  const [note, setNote] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    if (!peerId.trim()) { setError('Peer ID is required'); return }

    client.addContact({
      name: name.trim(),
      contactPeerId: peerId.trim(),
      note: note.trim(),
      avatar: avatar.trim(),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add a contact</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact name" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Peer ID</label>
              <input className="form-input" value={peerId} onChange={(e) => setPeerId(e.target.value)} placeholder="e.g. peer-alpha or a hex key..." />
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="How do you know this peer?" />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL (optional)</label>
              <input className="form-input" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add contact</button>
          </div>
        </form>
      </div>
    </div>
  )
}

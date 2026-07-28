import { useState } from 'react'
import type { Contact } from '../types'
import type { MarketClient as MC } from '../marketClient'

interface Props {
  contact: Contact
  client: MC
  onClose: () => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function ContactDetail({ contact, client, onClose }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(contact.name)
  const [note, setNote] = useState(contact.note)
  const [avatar, setAvatar] = useState(contact.avatar)

  const handleDelete = () => {
    client.deleteContact(contact.index)
    onClose()
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    client.updateContact(contact.index, { name: name.trim(), note: note.trim(), avatar: avatar.trim() })
    setEditing(false)
  }

  const handleContactPeer = () => {
    alert(`Direct channel opened with ${contact.name} via Hyperswarm (demo).`)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Contact details</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {editing ? (
          <form onSubmit={handleSave}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Note</label>
                <textarea className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Avatar URL</label>
                <input className="form-input" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save changes</button>
            </div>
          </form>
        ) : (
          <>
            <div className="contact-detail-header">
              {contact.avatar ? (
                <img className="contact-detail-avatar" src={contact.avatar} alt={contact.name} />
              ) : (
                <div className="contact-detail-avatar-placeholder">{getInitials(contact.name)}</div>
              )}
              <div className="contact-detail-name">{contact.name}</div>
            </div>
            <div className="detail-content">
              <div className="detail-meta">
                <span className="detail-badge">Contact</span>
                <span className="detail-badge">Added {new Date(contact.addedAt).toLocaleDateString()}</span>
              </div>
              {contact.note && <div className="detail-description">{contact.note}</div>}
              <div className="detail-seller">
                Peer ID: {contact.peerId.slice(0, 24)}...
              </div>
              <div className="detail-actions">
                <button className="btn btn-primary" onClick={handleContactPeer}>Contact peer</button>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-danger" onClick={handleDelete}>Remove</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

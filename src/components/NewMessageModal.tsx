import { useState } from 'react'
import type { Contact, PeerInfo } from '../types'
import type { MarketClient } from '../marketClient'

interface Props {
  client: MarketClient
  contacts: Contact[]
  peerInfo: PeerInfo | null
  onClose: () => void
  onStartChat: (peerId: string, peerName: string) => void
}

export function NewMessageModal({ contacts, peerInfo, onClose, onStartChat }: Props) {
  const [selectedPeerId, setSelectedPeerId] = useState('')
  const [customPeerId, setCustomPeerId] = useState('')
  const [error, setError] = useState('')

  const myPeerId = peerInfo?.peerId || 'mock-peer'
  const availableContacts = contacts.filter((c) => c.peerId !== myPeerId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const peerId = selectedPeerId || customPeerId.trim()
    if (!peerId) { setError('Select a contact or enter a peer ID'); return }

    const contact = contacts.find((c) => c.peerId === peerId)
    const peerName = contact?.name || peerId.slice(0, 12)
    onStartChat(peerId, peerName)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">New message</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            {availableContacts.length > 0 && (
              <div className="form-group">
                <label className="form-label">Choose a contact</label>
                <div className="new-message-contact-list">
                  {availableContacts.map((c) => (
                    <button
                      key={c.peerId}
                      type="button"
                      className={`new-message-contact ${selectedPeerId === c.peerId ? 'selected' : ''}`}
                      onClick={() => { setSelectedPeerId(c.peerId); setCustomPeerId('') }}
                    >
                      <div className="new-message-avatar">{c.name.charAt(0).toUpperCase()}</div>
                      <div className="new-message-info">
                        <div className="new-message-name">{c.name}</div>
                        <div className="new-message-peer">{c.peerId.slice(0, 16)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Or enter a peer ID</label>
              <input
                className="form-input"
                value={customPeerId}
                onChange={(e) => { setCustomPeerId(e.target.value); setSelectedPeerId('') }}
                placeholder="peer-id..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Start chat</button>
          </div>
        </form>
      </div>
    </div>
  )
}

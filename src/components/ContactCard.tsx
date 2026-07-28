import type { Contact } from '../types'

interface Props {
  contact: Contact
  onClick: () => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function ContactCard({ contact, onClick }: Props) {
  return (
    <div className="contact-card" style={{ animationDelay: `${contact.index * 40}ms` }} onClick={onClick}>
      {contact.avatar ? (
        <img className="contact-avatar" src={contact.avatar} alt={contact.name} loading="lazy" />
      ) : (
        <div className="contact-avatar-placeholder">{getInitials(contact.name)}</div>
      )}
      <div className="contact-info">
        <div className="contact-name">{contact.name}</div>
        <div className="contact-peer">{contact.peerId.slice(0, 20)}...</div>
        {contact.note && <div className="contact-note">{contact.note}</div>}
      </div>
      <div className="contact-chevron">›</div>
    </div>
  )
}

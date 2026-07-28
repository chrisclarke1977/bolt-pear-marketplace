import type { Contact } from '../types'
import { ContactCard } from './ContactCard'

interface Props {
  contacts: Contact[]
  onSelect: (contact: Contact) => void
  query: string
}

export function ContactList({ contacts, onSelect, query }: Props) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <div className="empty-title">No contacts yet</div>
        <div className="empty-subtitle">
          {query ? 'Try a different search term.' : 'Add peers you meet on the network!'}
        </div>
      </div>
    )
  }

  return (
    <div className="contact-list">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} onClick={() => onSelect(contact)} />
      ))}
    </div>
  )
}

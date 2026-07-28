import { useState, useEffect, useCallback, useRef } from 'react'
import { MarketClient } from './marketClient'
import type { Listing, MarketEvent, Contact, Task, Note, Message, Interaction, PeerInfo, WorkerMessage } from './types'
import { Header } from './components/Header'
import type { View } from './components/Header'
import { ListingGrid } from './components/ListingGrid'
import { CreateListingModal } from './components/CreateListingModal'
import { ListingDetail } from './components/ListingDetail'
import { EventGrid } from './components/EventGrid'
import { CreateEventModal } from './components/CreateEventModal'
import { EventDetail } from './components/EventDetail'
import { Calendar } from './components/Calendar'
import { ContactList } from './components/ContactList'
import { AddContactModal } from './components/AddContactModal'
import { ContactDetail } from './components/ContactDetail'
import { TaskList } from './components/TaskList'
import { AddTaskModal } from './components/AddTaskModal'
import { NoteList } from './components/NoteList'
import { AddNoteModal } from './components/AddNoteModal'
import { MessageList } from './components/MessageList'
import { ChatView } from './components/ChatView'
import { NewMessageModal } from './components/NewMessageModal'
import { ActivityFeed } from './components/ActivityFeed'
import { AccountMenuMobile, type AccountView } from './components/AccountMenu'
import { UpdateBanner } from './components/UpdateBanner'
import { BottomTabBar } from './components/BottomTabBar'

const LISTING_CATEGORIES = ['all', 'general', 'electronics', 'home', 'sports', 'music', 'clothing', 'books']
const EVENT_CATEGORIES = ['all', 'general', 'tech', 'music', 'market', 'social', 'food']

type MobileTab = 'browse' | 'sell' | 'search' | 'events' | 'account'

const ACCOUNT_VIEWS: AccountView[] = ['contacts', 'calendar', 'tasks', 'notes', 'messages', 'activity']

export function App() {
  const clientRef = useRef<MarketClient | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [peerInfo, setPeerInfo] = useState<PeerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [activeChatPeerId, setActiveChatPeerId] = useState<string | null>(null)
  const [activeChatPeerName, setActiveChatPeerName] = useState('')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('browse')
  const [accountSheetOpen, setAccountSheetOpen] = useState(false)
  const [view, setView] = useState<View>('listings')

  if (!clientRef.current) {
    clientRef.current = new MarketClient()
  }
  const client = clientRef.current
  const isMobile = client.isMobile()

  useEffect(() => {
    client.connect()

    const unbind = client.onMessage((msg: WorkerMessage) => {
      if (msg.type === 'listings' && msg.listings) {
        setListings(msg.listings)
        setLoading(false)
      } else if (msg.type === 'events' && msg.events) {
        setEvents(msg.events)
        setLoading(false)
      } else if (msg.type === 'contacts' && msg.contacts) {
        setContacts(msg.contacts)
        setLoading(false)
      } else if (msg.type === 'tasks' && msg.tasks) {
        setTasks(msg.tasks)
        setLoading(false)
      } else if (msg.type === 'notes' && msg.notes) {
        setNotes(msg.notes)
        setLoading(false)
      } else if (msg.type === 'messages' && msg.messages) {
        setMessages(msg.messages)
        setLoading(false)
      } else if (msg.type === 'interactions' && msg.interactions) {
        setInteractions(msg.interactions)
        setLoading(false)
      } else if (msg.type === 'peerInfo') {
        setPeerInfo({ peerId: msg.peerId || '', peerCount: msg.peerCount || 0 })
      } else if (msg.type === 'ready') {
        setPeerInfo({ peerId: msg.peerId || '', peerCount: msg.peerCount || 0 })
        client.requestListings()
        client.requestEvents()
        client.requestContacts()
        client.requestTasks()
        client.requestNotes()
        client.requestMessages()
        client.requestInteractions()
      } else if (msg.type === 'workerStarted') {
        client.requestPeerInfo()
      }
    })

    return unbind
  }, [client])

  const handleApplyUpdate = useCallback(async () => {
    await client.applyUpdate()
    await client.appAfterUpdate()
  }, [client])

  const handleSell = useCallback(() => {
    setShowCreateModal(true)
    setMobileTab('browse')
  }, [])

  const handleSearchTab = useCallback(() => {
    setMobileSearchOpen(true)
    setMobileTab('search')
  }, [])

  const handleBrowseTab = useCallback(() => {
    setMobileSearchOpen(false)
    setMobileTab('browse')
    setView('listings')
  }, [])

  const handleEventsTab = useCallback(() => {
    setMobileSearchOpen(false)
    setMobileTab('events')
    setView('events')
  }, [])

  const handleAccountTab = useCallback(() => {
    setMobileSearchOpen(false)
    setAccountSheetOpen(true)
  }, [])

  const handleAccountSelect = useCallback((v: AccountView) => {
    setMobileTab('account')
    setView(v)
  }, [])

  const handleViewChange = useCallback((v: View) => {
    setView(v)
    setActiveCategory('all')
    setSearchQuery('')
    if (ACCOUNT_VIEWS.includes(v as AccountView)) {
      setMobileTab('account')
    }
  }, [])

  const categories = view === 'events' ? EVENT_CATEGORIES : LISTING_CATEGORIES

  const filteredListings = listings.filter((l) => {
    const matchesCategory = activeCategory === 'all' || l.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  const filteredEvents = events.filter((e) => {
    const matchesCategory = activeCategory === 'all' || e.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.peerId.toLowerCase().includes(q) || c.note.toLowerCase().includes(q)
  })

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase()
    return !q || t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
  })

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase()
    return !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
  })

  const filteredMessages = messages

  const searchPlaceholder = view === 'events'
    ? 'Search events...'
    : view === 'contacts'
      ? 'Search contacts...'
      : view === 'calendar'
        ? 'Search events...'
        : view === 'tasks'
          ? 'Search tasks...'
          : view === 'notes'
            ? 'Search notes...'
            : view === 'messages'
              ? 'Search conversations...'
              : view === 'activity'
                ? 'Search activity...'
                : 'Search listings...'

  return (
    <div className={`app ${isMobile ? 'app-mobile' : ''}`}>
      {showUpdateBanner && (
        <UpdateBanner onApply={handleApplyUpdate} onDismiss={() => setShowUpdateBanner(false)} />
      )}
      <Header
        peerInfo={peerInfo}
        onSearch={setSearchQuery}
        onAddListing={() => setShowCreateModal(true)}
        onAddEvent={() => setShowCreateEventModal(true)}
        onAddContact={() => setShowAddContactModal(true)}
        onAddTask={() => setShowAddTaskModal(true)}
        onAddNote={() => setShowAddNoteModal(true)}
        onAddMessage={() => setShowNewMessageModal(true)}
        isMobile={isMobile}
        view={view}
        onViewChange={handleViewChange}
      />
      <main className={`main-content ${isMobile ? 'main-content-mobile' : ''}`}>
        {view !== 'contacts' && view !== 'calendar' && view !== 'tasks' && view !== 'notes' && view !== 'messages' && view !== 'activity' && (
          <div className="category-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Connecting to P2P network...
          </div>
        ) : view === 'events' ? (
          <EventGrid events={filteredEvents} interactions={interactions} onSelect={setSelectedEvent} query={searchQuery} />
        ) : view === 'calendar' ? (
          <Calendar events={filteredEvents} onSelect={setSelectedEvent} />
        ) : view === 'contacts' ? (
          <ContactList contacts={filteredContacts} onSelect={setSelectedContact} query={searchQuery} />
        ) : view === 'tasks' ? (
          <TaskList tasks={filteredTasks} client={client} query={searchQuery} />
        ) : view === 'notes' ? (
          <NoteList notes={filteredNotes} client={client} query={searchQuery} />
        ) : view === 'messages' ? (
          activeChatPeerId ? (
            <ChatView
              messages={filteredMessages}
              peerInfo={peerInfo}
              client={client}
              chatPeerId={activeChatPeerId}
              chatPeerName={activeChatPeerName}
              onBack={() => setActiveChatPeerId(null)}
            />
          ) : (
            <MessageList
              messages={filteredMessages}
              contacts={filteredContacts}
              peerInfo={peerInfo}
              client={client}
              query={searchQuery}
              onOpenChat={(peerId, peerName) => {
                setActiveChatPeerId(peerId)
                setActiveChatPeerName(peerName)
              }}
            />
          )
        ) : view === 'activity' ? (
          <ActivityFeed
            interactions={interactions}
            listings={listings}
            events={events}
            query={searchQuery}
          />
        ) : (
          <ListingGrid listings={filteredListings} interactions={interactions} onSelect={setSelectedListing} query={searchQuery} />
        )}
      </main>

      {isMobile && (
        <BottomTabBar
          active={mobileTab}
          onBrowse={handleBrowseTab}
          onSell={handleSell}
          onSearch={handleSearchTab}
          onEvents={handleEventsTab}
          onAccount={handleAccountTab}
        />
      )}

      {isMobile && (
        <AccountMenuMobile
          open={accountSheetOpen}
          onClose={() => setAccountSheetOpen(false)}
          onSelect={handleAccountSelect}
        />
      )}

      {isMobile && mobileSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-header">
            <span className="search-icon">🔍</span>
            <input
              className="mobile-search-input"
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className="mobile-search-close" onClick={() => setMobileSearchOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateListingModal client={client} onClose={() => setShowCreateModal(false)} />
      )}

      {showCreateEventModal && (
        <CreateEventModal client={client} onClose={() => setShowCreateEventModal(false)} />
      )}

      {showAddContactModal && (
        <AddContactModal client={client} onClose={() => setShowAddContactModal(false)} />
      )}

      {showAddTaskModal && (
        <AddTaskModal client={client} onClose={() => setShowAddTaskModal(false)} />
      )}

      {showAddNoteModal && (
        <AddNoteModal client={client} onClose={() => setShowAddNoteModal(false)} />
      )}

      {showNewMessageModal && (
        <NewMessageModal
          client={client}
          contacts={contacts}
          peerInfo={peerInfo}
          onClose={() => setShowNewMessageModal(false)}
          onStartChat={(peerId, peerName) => {
            setActiveChatPeerId(peerId)
            setActiveChatPeerName(peerName)
          }}
        />
      )}

      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          client={client}
          peerInfo={peerInfo}
          interactions={interactions}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          client={client}
          peerInfo={peerInfo}
          interactions={interactions}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          client={client}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  )
}

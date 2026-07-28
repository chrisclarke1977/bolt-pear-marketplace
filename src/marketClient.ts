import type { Listing, MarketEvent, Contact, Task, Note, Message, Interaction, WorkerMessage, Pkg } from './types'

// When running inside Electron with the Pear worker, `window.bridge` is available.
// When running in React Native with react-native-bare-kit, `MobileBridge` is used.
// In the browser (Vite dev server), we fall back to an in-memory mock.

interface Bridge {
  pkg(): Pkg
  applyUpdate(): Promise<void>
  appAfterUpdate(): Promise<void>
  startWorker(specifier: string): Promise<boolean>
  onWorkerIPC(specifier: string, listener: (data: Uint8Array) => void): () => void
  onWorkerStdout(specifier: string, listener: (data: Uint8Array) => void): () => void
  onWorkerStderr(specifier: string, listener: (data: Uint8Array) => void): () => void
  onWorkerExit(specifier: string, listener: (code: number) => void): () => void
  writeWorkerIPC(specifier: string, data: Uint8Array): Promise<void>
}

const WORKER_SPECIFIER = '/workers/main.cjs'
const MOBILE_WORKER_SPECIFIER = '/workers/main-mobile.cjs'

type Platform = 'electron' | 'mobile' | 'web'

function detectPlatform(): Platform {
  if (typeof (window as any).bridge !== 'undefined') return 'electron'
  if (typeof (globalThis as any).__PearMobileBridge !== 'undefined') return 'mobile'
  return 'web'
}

// ---- In-memory mock for browser dev ----
class MockMarket {
  private listings: Listing[] = []
  private events: MarketEvent[] = []
  private contacts: Contact[] = []
  private tasks: Task[] = []
  private notes: Note[] = []
  private messages: Message[] = []
  private interactions: Interaction[] = []
  private listeners: ((msg: WorkerMessage) => void)[] = []
  private peerId = 'mock-peer-' + Math.random().toString(36).slice(2, 10)
  private peerCount = 3

  onMessage(cb: (msg: WorkerMessage) => void) {
    this.listeners.push(cb)
  }

  private emit(msg: WorkerMessage) {
    for (const l of this.listeners) l(msg)
  }

  start() {
    const sampleListings: Omit<Listing, 'index'>[] = [
      { id: 's1', title: 'Vintage Camera', description: 'A well-preserved 35mm film camera from the 1980s. Works perfectly.', price: 120, currency: 'USD', category: 'electronics', image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600', sellerPeerId: 'peer-alpha', createdAt: Date.now() - 86400000 },
      { id: 's2', title: 'Handmade Ceramic Mug', description: 'One-of-a-kind stoneware mug, wheel-thrown and glazed by hand.', price: 28, currency: 'USD', category: 'home', image: 'https://images.pexels.com/photos/2689763/pexels-photo-2689763.jpeg?auto=compress&cs=tinysrgb&w=600', sellerPeerId: 'peer-beta', createdAt: Date.now() - 43200000 },
      { id: 's3', title: 'Mountain Bike', description: 'Aluminum frame, 21-speed Shimano gears, recently tuned up.', price: 350, currency: 'USD', category: 'sports', image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=600', sellerPeerId: 'peer-gamma', createdAt: Date.now() - 7200000 },
      { id: 's4', title: 'Mechanical Keyboard', description: 'Hot-swappable PCB, brown switches, PBT keycaps. Barely used.', price: 95, currency: 'USD', category: 'electronics', image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600', sellerPeerId: 'peer-alpha', createdAt: Date.now() - 3600000 },
      { id: 's5', title: 'Acoustic Guitar', description: 'Solid spruce top, mahogany back and sides. Rich, warm tone.', price: 210, currency: 'USD', category: 'music', image: 'https://images.pexels.com/photos/14073222/pexels-photo-14073222.jpeg?auto=compress&cs=tinysrgb&w=600', sellerPeerId: 'peer-delta', createdAt: Date.now() - 1800000 },
    ]
    this.listings = sampleListings.map((s, i) => ({ ...s, index: i }))

    const day = 86400000
    const sampleEvents: Omit<MarketEvent, 'index'>[] = [
      { id: 'e1', title: 'P2P Tech Meetup', description: 'Monthly gathering for peer-to-peer enthusiasts. Demos, lightning talks, and networking.', date: Date.now() + day * 7, location: 'Online / Hyperswarm', category: 'tech', image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=600', hostPeerId: 'peer-alpha', attendees: ['peer-beta', 'peer-gamma'], createdAt: Date.now() - day * 3 },
      { id: 'e2', title: 'Retro Electronics Swap', description: 'Bring your vintage gadgets to trade and sell. Cameras, consoles, keyboards, and more.', date: Date.now() + day * 14, location: 'Community Hall, Berlin', category: 'market', image: 'https://images.pexels.com/photos/4709822/pexels-photo-4709822.jpeg?auto=compress&cs=tinysrgb&w=600', hostPeerId: 'peer-delta', attendees: ['peer-alpha'], createdAt: Date.now() - day * 2 },
      { id: 'e3', title: 'Live Music Night', description: 'Open mic and jam session. Bring an instrument or just enjoy the vibes.', date: Date.now() + day * 3, location: 'The Velvet Lounge, London', category: 'music', image: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=600', hostPeerId: 'peer-beta', attendees: ['peer-gamma', 'peer-delta', 'peer-alpha'], createdAt: Date.now() - day },
    ]
    this.events = sampleEvents.map((s, i) => ({ ...s, index: i }))

    const sampleContacts: Omit<Contact, 'index'>[] = [
      { id: 'c1', name: 'Alice Chen', peerId: 'peer-alpha', note: 'Vintage camera seller. Reliable.', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200', addedAt: Date.now() - 86400000 * 14 },
      { id: 'c2', name: 'Bruno Silva', peerId: 'peer-beta', note: 'Met at the P2P meetup. Makes great ceramics.', avatar: 'https://images.pexels.com/photos/220817/pexels-photo-220817.jpeg?auto=compress&cs=tinysrgb&w=200', addedAt: Date.now() - 86400000 * 7 },
      { id: 'c3', name: 'Clara Ngo', peerId: 'peer-gamma', note: 'Bought my old bike. Cool person.', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200', addedAt: Date.now() - 86400000 * 3 },
    ]
    this.contacts = sampleContacts.map((s, i) => ({ ...s, index: i }))

    const sampleTasks: Omit<Task, 'index'>[] = [
      { id: 't1', title: 'Ship vintage camera to buyer', notes: 'Pack carefully with bubble wrap.', done: false, dueDate: Date.now() + 86400000 * 2, priority: 'high', ownerPeerId: 'mock-peer', createdAt: Date.now() - 3600000 },
      { id: 't2', title: 'Restock ceramic mugs for swap meet', notes: 'Need at least 10 pieces.', done: false, dueDate: Date.now() + 86400000 * 5, priority: 'medium', ownerPeerId: 'mock-peer', createdAt: Date.now() - 7200000 },
      { id: 't3', title: 'Confirm live music venue booking', notes: '', done: true, dueDate: Date.now() - 86400000, priority: 'high', ownerPeerId: 'mock-peer', createdAt: Date.now() - 172800000 },
    ]
    this.tasks = sampleTasks.map((s, i) => ({ ...s, index: i }))

    const sampleNotes: Omit<Note, 'index'>[] = [
      { id: 'n1', title: 'Swap meet prep', body: 'Bring: cash box, price tags, folding table. Setup by 8am.', color: 'yellow', pinned: true, ownerPeerId: 'mock-peer', createdAt: Date.now() - 7200000, updatedAt: Date.now() - 3600000 },
      { id: 'n2', title: 'Buyer follow-ups', body: 'Email Alice about camera shipping. Message Bruno re: ceramic restock.', color: 'blue', pinned: false, ownerPeerId: 'mock-peer', createdAt: Date.now() - 14400000, updatedAt: Date.now() - 10800000 },
      { id: 'n3', title: 'Event ideas', body: 'Pop-up vintage clothing sale? Collaborate with Clara on venue.', color: 'green', pinned: false, ownerPeerId: 'mock-peer', createdAt: Date.now() - 28800000, updatedAt: Date.now() - 28800000 },
    ]
    this.notes = sampleNotes.map((s, i) => ({ ...s, index: i }))

    const sampleMessages: Omit<Message, 'index'>[] = [
      { id: 'm1', fromPeerId: 'peer-alpha', toPeerId: 'mock-peer', text: 'Hey! Is the vintage camera still available?', createdAt: Date.now() - 7200000 },
      { id: 'm2', fromPeerId: 'mock-peer', toPeerId: 'peer-alpha', text: 'Yes it is! Want me to hold it for you?', createdAt: Date.now() - 7100000 },
      { id: 'm3', fromPeerId: 'peer-alpha', toPeerId: 'mock-peer', text: 'That would be great, I can pick it up tomorrow.', createdAt: Date.now() - 7000000 },
      { id: 'm4', fromPeerId: 'peer-beta', toPeerId: 'mock-peer', text: 'Hi, saw your ceramic mug listing. Do you do custom orders?', createdAt: Date.now() - 3600000 },
    ]
    this.messages = sampleMessages.map((s, i) => ({ ...s, index: i }))

    const sampleInteractions: Omit<Interaction, 'index'>[] = [
      { id: 'i1', kind: 'like', targetType: 'listing', targetId: 's1', targetIndex: 0, peerId: 'peer-beta', createdAt: Date.now() - 3600000 },
      { id: 'i2', kind: 'like', targetType: 'listing', targetId: 's1', targetIndex: 0, peerId: 'peer-gamma', createdAt: Date.now() - 3000000 },
      { id: 'i3', kind: 'comment', targetType: 'listing', targetId: 's1', targetIndex: 0, peerId: 'peer-beta', text: 'Great condition! Is the lens included?', createdAt: Date.now() - 2500000 },
      { id: 'i4', kind: 'like', targetType: 'listing', targetId: 's2', targetIndex: 1, peerId: 'peer-alpha', createdAt: Date.now() - 2000000 },
      { id: 'i5', kind: 'comment', targetType: 'listing', targetId: 's3', targetIndex: 2, peerId: 'peer-delta', text: 'What size frame?', createdAt: Date.now() - 1800000 },
      { id: 'i6', kind: 'like', targetType: 'event', targetId: 'e1', targetIndex: 0, peerId: 'peer-delta', createdAt: Date.now() - 1500000 },
      { id: 'i7', kind: 'like', targetType: 'event', targetId: 'e1', targetIndex: 0, peerId: 'peer-beta', createdAt: Date.now() - 1400000 },
      { id: 'i8', kind: 'comment', targetType: 'event', targetId: 'e2', targetIndex: 1, peerId: 'peer-gamma', text: 'Will there be food trucks?', createdAt: Date.now() - 1200000 },
      { id: 'i9', kind: 'like', targetType: 'event', targetId: 'e3', targetIndex: 2, peerId: 'peer-alpha', createdAt: Date.now() - 900000 },
      { id: 'i10', kind: 'like', targetType: 'listing', targetId: 's4', targetIndex: 3, peerId: 'peer-gamma', createdAt: Date.now() - 600000 },
    ]
    this.interactions = sampleInteractions.map((s, i) => ({ ...s, index: i }))

    setTimeout(() => {
      this.emit({ type: 'ready', peerId: this.peerId, peerCount: this.peerCount })
      this.emit({ type: 'listings', listings: [...this.listings] })
      this.emit({ type: 'events', events: [...this.events] })
      this.emit({ type: 'contacts', contacts: [...this.contacts] })
      this.emit({ type: 'tasks', tasks: [...this.tasks] })
      this.emit({ type: 'notes', notes: [...this.notes] })
      this.emit({ type: 'messages', messages: [...this.messages] })
      this.emit({ type: 'interactions', interactions: [...this.interactions] })
    }, 300)
  }

  send(msg: any) {
    if (msg.type === 'addListing') {
      const newListing: Listing = {
        id: this.peerId + '-' + Date.now(),
        title: msg.title,
        description: msg.description,
        price: msg.price,
        currency: msg.currency || 'USD',
        category: msg.category || 'general',
        image: msg.image || '',
        sellerPeerId: this.peerId,
        createdAt: Date.now(),
        index: this.listings.length,
      }
      this.listings.push(newListing)
      this.emit({ type: 'listings', listings: [...this.listings] })
    } else if (msg.type === 'deleteListing') {
      this.listings = this.listings.filter((l) => l.index !== msg.index)
      this.emit({ type: 'listings', listings: [...this.listings] })
    } else if (msg.type === 'requestListings') {
      this.emit({ type: 'listings', listings: [...this.listings] })
    } else if (msg.type === 'addEvent') {
      const newEvent: MarketEvent = {
        id: this.peerId + '-' + Date.now(),
        title: msg.title,
        description: msg.description,
        date: msg.date,
        location: msg.location,
        category: msg.category || 'general',
        image: msg.image || '',
        hostPeerId: this.peerId,
        attendees: [],
        createdAt: Date.now(),
        index: this.events.length,
      }
      this.events.push(newEvent)
      this.emit({ type: 'events', events: [...this.events] })
    } else if (msg.type === 'deleteEvent') {
      this.events = this.events.filter((e) => e.index !== msg.index)
      this.emit({ type: 'events', events: [...this.events] })
    } else if (msg.type === 'joinEvent') {
      this.events = this.events.map((e) => {
        if (e.index === msg.index && !e.attendees.includes(this.peerId)) {
          return { ...e, attendees: [...e.attendees, this.peerId] }
        }
        return e
      })
      this.emit({ type: 'events', events: [...this.events] })
    } else if (msg.type === 'leaveEvent') {
      this.events = this.events.map((e) => {
        if (e.index === msg.index) {
          return { ...e, attendees: e.attendees.filter((a) => a !== this.peerId) }
        }
        return e
      })
      this.emit({ type: 'events', events: [...this.events] })
    } else if (msg.type === 'requestEvents') {
      this.emit({ type: 'events', events: [...this.events] })
    } else if (msg.type === 'addContact') {
      const newContact: Contact = {
        id: this.peerId + '-' + Date.now(),
        name: msg.name,
        peerId: msg.contactPeerId,
        note: msg.note || '',
        avatar: msg.avatar || '',
        addedAt: Date.now(),
        index: this.contacts.length,
      }
      this.contacts.push(newContact)
      this.emit({ type: 'contacts', contacts: [...this.contacts] })
    } else if (msg.type === 'deleteContact') {
      this.contacts = this.contacts.filter((c) => c.index !== msg.index)
      this.emit({ type: 'contacts', contacts: [...this.contacts] })
    } else if (msg.type === 'updateContact') {
      this.contacts = this.contacts.map((c) => {
        if (c.index === msg.index) {
          return {
            ...c,
            name: msg.name !== undefined ? msg.name : c.name,
            note: msg.note !== undefined ? msg.note : c.note,
            avatar: msg.avatar !== undefined ? msg.avatar : c.avatar,
          }
        }
        return c
      })
      this.emit({ type: 'contacts', contacts: [...this.contacts] })
    } else if (msg.type === 'requestContacts') {
      this.emit({ type: 'contacts', contacts: [...this.contacts] })
    } else if (msg.type === 'addTask') {
      const newTask: Task = {
        id: this.peerId + '-' + Date.now(),
        title: msg.title,
        notes: msg.notes || '',
        done: false,
        dueDate: msg.dueDate || null,
        priority: msg.priority || 'medium',
        ownerPeerId: this.peerId,
        createdAt: Date.now(),
        index: this.tasks.length,
      }
      this.tasks.push(newTask)
      this.emit({ type: 'tasks', tasks: [...this.tasks] })
    } else if (msg.type === 'toggleTask') {
      this.tasks = this.tasks.map((t) => t.index === msg.index ? { ...t, done: !t.done } : t)
      this.emit({ type: 'tasks', tasks: [...this.tasks] })
    } else if (msg.type === 'deleteTask') {
      this.tasks = this.tasks.filter((t) => t.index !== msg.index)
      this.emit({ type: 'tasks', tasks: [...this.tasks] })
    } else if (msg.type === 'updateTask') {
      this.tasks = this.tasks.map((t) => {
        if (t.index === msg.index) {
          return {
            ...t,
            title: msg.title !== undefined ? msg.title : t.title,
            notes: msg.notes !== undefined ? msg.notes : t.notes,
            dueDate: msg.dueDate !== undefined ? msg.dueDate : t.dueDate,
            priority: msg.priority !== undefined ? msg.priority : t.priority,
          }
        }
        return t
      })
      this.emit({ type: 'tasks', tasks: [...this.tasks] })
    } else if (msg.type === 'requestTasks') {
      this.emit({ type: 'tasks', tasks: [...this.tasks] })
    } else if (msg.type === 'addNote') {
      const newNote: Note = {
        id: this.peerId + '-' + Date.now(),
        title: msg.title,
        body: msg.body || '',
        color: msg.color || 'yellow',
        pinned: false,
        ownerPeerId: this.peerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        index: this.notes.length,
      }
      this.notes.push(newNote)
      this.emit({ type: 'notes', notes: [...this.notes] })
    } else if (msg.type === 'updateNote') {
      this.notes = this.notes.map((n) => {
        if (n.index === msg.index) {
          return {
            ...n,
            title: msg.title !== undefined ? msg.title : n.title,
            body: msg.body !== undefined ? msg.body : n.body,
            color: msg.color !== undefined ? msg.color : n.color,
            pinned: msg.pinned !== undefined ? msg.pinned : n.pinned,
            updatedAt: Date.now(),
          }
        }
        return n
      })
      this.emit({ type: 'notes', notes: [...this.notes] })
    } else if (msg.type === 'deleteNote') {
      this.notes = this.notes.filter((n) => n.index !== msg.index)
      this.emit({ type: 'notes', notes: [...this.notes] })
    } else if (msg.type === 'togglePinNote') {
      this.notes = this.notes.map((n) => n.index === msg.index ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n)
      this.emit({ type: 'notes', notes: [...this.notes] })
    } else if (msg.type === 'requestNotes') {
      this.emit({ type: 'notes', notes: [...this.notes] })
    } else if (msg.type === 'sendMessage') {
      const newMsg: Message = {
        id: this.peerId + '-' + Date.now(),
        fromPeerId: this.peerId,
        toPeerId: msg.toPeerId,
        text: msg.text,
        createdAt: Date.now(),
        index: this.messages.length,
      }
      this.messages.push(newMsg)
      this.emit({ type: 'messages', messages: [...this.messages] })
    } else if (msg.type === 'requestMessages') {
      this.emit({ type: 'messages', messages: [...this.messages] })
    } else if (msg.type === 'addInteraction') {
      const newInt: Interaction = {
        id: this.peerId + '-' + Date.now(),
        kind: msg.kind,
        targetType: msg.targetType,
        targetId: msg.targetId,
        targetIndex: msg.targetIndex,
        peerId: this.peerId,
        text: msg.text || '',
        createdAt: Date.now(),
        index: this.interactions.length,
      }
      this.interactions.push(newInt)
      this.emit({ type: 'interactions', interactions: [...this.interactions] })
    } else if (msg.type === 'removeInteraction') {
      this.interactions = this.interactions.filter((i) => i.index !== msg.index)
      this.emit({ type: 'interactions', interactions: [...this.interactions] })
    } else if (msg.type === 'requestInteractions') {
      this.emit({ type: 'interactions', interactions: [...this.interactions] })
    } else if (msg.type === 'requestPeerInfo') {
      this.emit({ type: 'peerInfo', peerId: this.peerId, peerCount: this.peerCount })
    }
  }
}

// ---- Public client API ----
export class MarketClient {
  private bridge: Bridge | null = null
  private mock: MockMarket | null = null
  private listeners: ((msg: WorkerMessage) => void)[] = []
  private started = false
  private platform: Platform

  constructor() {
    this.platform = detectPlatform()
  }

  async connect(): Promise<void> {
    if (this.started) return
    this.started = true

    if (this.platform === 'electron') {
      this.bridge = (window as any).bridge as Bridge
      this.bridge.onWorkerIPC(WORKER_SPECIFIER, (data: Uint8Array) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(data)) as WorkerMessage
          this.listeners.forEach((l) => l(msg))
        } catch {
          // ignore non-JSON (e.g. OTA update strings)
        }
      })
      await this.bridge.startWorker(WORKER_SPECIFIER)
    } else if (this.platform === 'mobile') {
      this.bridge = (globalThis as any).__PearMobileBridge as Bridge
      this.bridge.onWorkerIPC(MOBILE_WORKER_SPECIFIER, (data: Uint8Array) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(data)) as WorkerMessage
          this.listeners.forEach((l) => l(msg))
        } catch {
          // ignore non-JSON
        }
      })
      await this.bridge.startWorker(MOBILE_WORKER_SPECIFIER)
    } else {
      this.mock = new MockMarket()
      this.mock.onMessage((msg) => {
        this.listeners.forEach((l) => l(msg))
      })
      this.mock.start()
    }
  }

  onMessage(cb: (msg: WorkerMessage) => void): () => void {
    this.listeners.push(cb)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb)
    }
  }

  send(msg: any): void {
    const specifier = this.platform === 'mobile' ? MOBILE_WORKER_SPECIFIER : WORKER_SPECIFIER
    if (this.bridge) {
      this.bridge.writeWorkerIPC(specifier, new TextEncoder().encode(JSON.stringify(msg)))
    } else if (this.mock) {
      this.mock.send(msg)
    }
  }

  // ---- Listing methods ----
  addListing(data: { title: string; description: string; price: number; currency: string; category: string; image: string }): void {
    this.send({ type: 'addListing', ...data })
  }

  deleteListing(index: number): void {
    this.send({ type: 'deleteListing', index })
  }

  requestListings(): void {
    this.send({ type: 'requestListings' })
  }

  // ---- Event methods ----
  addEvent(data: { title: string; description: string; date: number; location: string; category: string; image: string }): void {
    this.send({ type: 'addEvent', ...data })
  }

  deleteEvent(index: number): void {
    this.send({ type: 'deleteEvent', index })
  }

  joinEvent(index: number): void {
    this.send({ type: 'joinEvent', index })
  }

  leaveEvent(index: number): void {
    this.send({ type: 'leaveEvent', index })
  }

  requestEvents(): void {
    this.send({ type: 'requestEvents' })
  }

  // ---- Contact methods ----
  addContact(data: { name: string; contactPeerId: string; note: string; avatar: string }): void {
    this.send({ type: 'addContact', ...data })
  }

  deleteContact(index: number): void {
    this.send({ type: 'deleteContact', index })
  }

  updateContact(index: number, data: { name?: string; note?: string; avatar?: string }): void {
    this.send({ type: 'updateContact', index, ...data })
  }

  requestContacts(): void {
    this.send({ type: 'requestContacts' })
  }

  // ---- Task methods ----
  addTask(data: { title: string; notes: string; dueDate: number | null; priority: 'low' | 'medium' | 'high' }): void {
    this.send({ type: 'addTask', ...data })
  }

  toggleTask(index: number): void {
    this.send({ type: 'toggleTask', index })
  }

  deleteTask(index: number): void {
    this.send({ type: 'deleteTask', index })
  }

  updateTask(index: number, data: { title?: string; notes?: string; dueDate?: number | null; priority?: 'low' | 'medium' | 'high' }): void {
    this.send({ type: 'updateTask', index, ...data })
  }

  requestTasks(): void {
    this.send({ type: 'requestTasks' })
  }

  // ---- Note methods ----
  addNote(data: { title: string; body: string; color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' }): void {
    this.send({ type: 'addNote', ...data })
  }

  updateNote(index: number, data: { title?: string; body?: string; color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple'; pinned?: boolean }): void {
    this.send({ type: 'updateNote', index, ...data })
  }

  deleteNote(index: number): void {
    this.send({ type: 'deleteNote', index })
  }

  togglePinNote(index: number): void {
    this.send({ type: 'togglePinNote', index })
  }

  requestNotes(): void {
    this.send({ type: 'requestNotes' })
  }

  // ---- Message methods ----
  sendMessage(toPeerId: string, text: string): void {
    this.send({ type: 'sendMessage', toPeerId, text })
  }

  requestMessages(): void {
    this.send({ type: 'requestMessages' })
  }

  // ---- Interaction methods ----
  addInteraction(data: { kind: 'like' | 'comment'; targetType: 'listing' | 'event'; targetId: string; targetIndex: number; text?: string }): void {
    this.send({ type: 'addInteraction', ...data })
  }

  removeInteraction(index: number): void {
    this.send({ type: 'removeInteraction', index })
  }

  requestInteractions(): void {
    this.send({ type: 'requestInteractions' })
  }

  // ---- Common ----
  requestPeerInfo(): void {
    this.send({ type: 'requestPeerInfo' })
  }

  getPkg(): Pkg | null {
    if (this.bridge) return this.bridge.pkg()
    return { name: 'pearmarket', productName: 'PearMarket', version: '1.0.0' }
  }

  async applyUpdate(): Promise<void> {
    if (this.bridge) await this.bridge.applyUpdate()
  }

  async appAfterUpdate(): Promise<void> {
    if (this.bridge) await this.bridge.appAfterUpdate()
  }

  getPlatform(): Platform {
    return this.platform
  }

  isElectron(): boolean {
    return this.platform === 'electron'
  }

  isMobile(): boolean {
    return this.platform === 'mobile'
  }
}

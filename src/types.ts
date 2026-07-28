export interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  category: string
  image: string
  sellerPeerId: string
  createdAt: number
  index: number
}

export interface MarketEvent {
  id: string
  title: string
  description: string
  date: number
  location: string
  category: string
  image: string
  hostPeerId: string
  attendees: string[]
  createdAt: number
  index: number
}

export interface Contact {
  id: string
  name: string
  peerId: string
  note: string
  avatar: string
  addedAt: number
  index: number
}

export interface Task {
  id: string
  title: string
  notes: string
  done: boolean
  dueDate: number | null
  priority: 'low' | 'medium' | 'high'
  ownerPeerId: string
  createdAt: number
  index: number
}

export interface Note {
  id: string
  title: string
  body: string
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
  pinned: boolean
  ownerPeerId: string
  createdAt: number
  updatedAt: number
  index: number
}

export interface Message {
  id: string
  fromPeerId: string
  toPeerId: string
  text: string
  createdAt: number
  index: number
}

export interface Interaction {
  id: string
  kind: 'like' | 'comment'
  targetType: 'listing' | 'event'
  targetId: string
  targetIndex: number
  peerId: string
  text?: string
  createdAt: number
  index: number
}

export interface PeerInfo {
  peerId: string
  peerCount: number
}

export interface WorkerMessage {
  type: 'ready' | 'listings' | 'events' | 'contacts' | 'tasks' | 'notes' | 'messages' | 'interactions' | 'peerInfo' | 'workerStarted' | 'error'
  listings?: Listing[]
  events?: MarketEvent[]
  contacts?: Contact[]
  tasks?: Task[]
  notes?: Note[]
  messages?: Message[]
  interactions?: Interaction[]
  peerId?: string
  peerCount?: number
  message?: string
}

export interface Pkg {
  name: string
  productName: string
  version: string
}

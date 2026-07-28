import { useMemo } from 'react'
import type { Message, Contact, PeerInfo } from '../types'
import type { MarketClient as MC } from '../marketClient'

interface Props {
  messages: Message[]
  contacts: Contact[]
  peerInfo: PeerInfo | null
  client: MC
  query: string
  onOpenChat: (peerId: string, peerName: string) => void
}

interface Conversation {
  peerId: string
  peerName: string
  lastMessage: Message
  unread: number
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function MessageList({ messages, contacts, peerInfo, query, onOpenChat }: Props) {
  const conversations = useMemo(() => {
    const myPeerId = peerInfo?.peerId || 'mock-peer'
    const byPeer = new Map<string, Message[]>()

    for (const m of messages) {
      const otherPeer = m.fromPeerId === myPeerId ? m.toPeerId : m.fromPeerId
      if (!byPeer.has(otherPeer)) byPeer.set(otherPeer, [])
      byPeer.get(otherPeer)!.push(m)
    }

    const convos: Conversation[] = []
    for (const [peerId, msgs] of byPeer) {
      const sorted = msgs.sort((a, b) => a.createdAt - b.createdAt)
      const contact = contacts.find((c) => c.peerId === peerId)
      convos.push({
        peerId,
        peerName: contact?.name || peerId.slice(0, 12),
        lastMessage: sorted[sorted.length - 1],
        unread: 0,
      })
    }

    return convos.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt)
  }, [messages, contacts, peerInfo])

  if (conversations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💬</div>
        <div className="empty-title">No conversations yet</div>
        <div className="empty-subtitle">
          {query ? 'Try a different search.' : 'Start a new conversation with a peer!'}
        </div>
      </div>
    )
  }

  const filtered = conversations.filter((c) => {
    const q = query.toLowerCase()
    return !q || c.peerName.toLowerCase().includes(q) || c.peerId.toLowerCase().includes(q)
  })

  return (
    <div className="conversation-list">
      {filtered.map((c) => {
        const isMe = c.lastMessage.fromPeerId === (peerInfo?.peerId || 'mock-peer')
        return (
          <div
            key={c.peerId}
            className="conversation-item"
            onClick={() => onOpenChat(c.peerId, c.peerName)}
            style={{ animationDelay: `${conversations.indexOf(c) * 40}ms` }}
          >
            <div className="conversation-avatar">
              {c.peerName.charAt(0).toUpperCase()}
            </div>
            <div className="conversation-body">
              <div className="conversation-header-row">
                <span className="conversation-name">{c.peerName}</span>
                <span className="conversation-time">{formatTime(c.lastMessage.createdAt)}</span>
              </div>
              <div className="conversation-preview">
                {isMe && <span className="conversation-prefix">You: </span>}
                {c.lastMessage.text.length > 60
                  ? c.lastMessage.text.slice(0, 60) + '...'
                  : c.lastMessage.text}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

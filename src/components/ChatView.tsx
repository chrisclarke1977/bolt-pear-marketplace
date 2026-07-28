import { useState, useRef, useEffect } from 'react'
import type { Message, PeerInfo } from '../types'
import type { MarketClient as MC } from '../marketClient'

interface Props {
  messages: Message[]
  peerInfo: PeerInfo | null
  client: MC
  chatPeerId: string
  chatPeerName: string
  onBack: () => void
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function ChatView({ messages, peerInfo, client, chatPeerId, chatPeerName, onBack }: Props) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const myPeerId = peerInfo?.peerId || 'mock-peer'

  const chatMessages = messages
    .filter((m) =>
      (m.fromPeerId === myPeerId && m.toPeerId === chatPeerId) ||
      (m.fromPeerId === chatPeerId && m.toPeerId === myPeerId)
    )
    .sort((a, b) => a.createdAt - b.createdAt)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages.length])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    client.sendMessage(chatPeerId, input.trim())
    setInput('')
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={onBack} aria-label="Back">←</button>
        <div className="chat-avatar">{chatPeerName.charAt(0).toUpperCase()}</div>
        <div className="chat-peer-info">
          <div className="chat-peer-name">{chatPeerName}</div>
          <div className="chat-peer-id">{chatPeerId.slice(0, 16)}</div>
        </div>
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {chatMessages.length === 0 ? (
          <div className="chat-empty">No messages yet. Say hello!</div>
        ) : (
          chatMessages.map((m) => {
            const isMe = m.fromPeerId === myPeerId
            return (
              <div key={m.id} className={`chat-bubble-row ${isMe ? 'mine' : 'theirs'}`}>
                <div className={`chat-bubble ${isMe ? 'mine' : 'theirs'}`}>
                  <div className="chat-bubble-text">{m.text}</div>
                  <div className="chat-bubble-time">{formatTimestamp(m.createdAt)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          autoFocus
        />
        <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import type { PeerInfo } from '../types'

export type AccountView = 'contacts' | 'calendar' | 'tasks' | 'notes' | 'messages' | 'activity'

interface AccountMenuItem {
  view: AccountView
  label: string
  icon: string
}

const MENU_ITEMS: AccountMenuItem[] = [
  { view: 'contacts', label: 'Contacts', icon: '👥' },
  { view: 'calendar', label: 'Calendar', icon: '🗓️' },
  { view: 'tasks', label: 'Tasks', icon: '✓' },
  { view: 'notes', label: 'Notes', icon: '📝' },
  { view: 'messages', label: 'Messages', icon: '💬' },
  { view: 'activity', label: 'Activity', icon: '📊' },
]

interface DesktopProps {
  peerInfo: PeerInfo | null
  activeView: AccountView | null
  onSelect: (view: AccountView) => void
}

export function AccountMenuDesktop({ peerInfo, activeView, onSelect }: DesktopProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleSelect = (view: AccountView) => {
    onSelect(view)
    setOpen(false)
  }

  const isActive = activeView !== null

  return (
    <div className="account-menu-wrap" ref={ref}>
      <button
        className={`account-trigger ${isActive ? 'active' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="account-avatar">
          {peerInfo?.peerId?.charAt(0).toUpperCase() || 'P'}
        </span>
        <span className="account-label">Account</span>
        <span className={`account-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="account-dropdown">
          <div className="account-dropdown-header">
            <div className="account-dropdown-avatar">
              {peerInfo?.peerId?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="account-dropdown-info">
              <div className="account-dropdown-peer">My Account</div>
              <div className="account-dropdown-id">
                {peerInfo?.peerId?.slice(0, 20) || '...'}...
              </div>
            </div>
          </div>
          <div className="account-dropdown-items">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.view}
                className={`account-dropdown-item ${activeView === item.view ? 'active' : ''}`}
                onClick={() => handleSelect(item.view)}
              >
                <span className="account-item-icon">{item.icon}</span>
                <span className="account-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface MobileProps {
  open: boolean
  onClose: () => void
  onSelect: (view: AccountView) => void
}

export function AccountMenuMobile({ open, onClose, onSelect }: MobileProps) {
  const handleSelect = (view: AccountView) => {
    onSelect(view)
    onClose()
  }

  if (!open) return null

  return (
    <div className="account-sheet-overlay" onClick={onClose}>
      <div className="account-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="account-sheet-handle" />
        <div className="account-sheet-title">Account</div>
        <div className="account-sheet-items">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.view}
              className="account-sheet-item"
              onClick={() => handleSelect(item.view)}
            >
              <span className="account-item-icon">{item.icon}</span>
              <span className="account-item-label">{item.label}</span>
              <span className="account-item-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

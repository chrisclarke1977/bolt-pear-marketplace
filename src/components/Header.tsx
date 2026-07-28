import { useState, useEffect } from 'react'
import type { PeerInfo } from '../types'
import { AccountMenuDesktop, type AccountView } from './AccountMenu'

export type View = 'listings' | 'events' | AccountView

interface Props {
  peerInfo: PeerInfo | null
  onSearch: (query: string) => void
  onAddListing: () => void
  onAddEvent: () => void
  onAddContact: () => void
  onAddTask: () => void
  onAddNote: () => void
  onAddMessage: () => void
  isMobile: boolean
  view: View
  onViewChange: (view: View) => void
}

export function Header({ peerInfo, onSearch, onAddListing, onAddEvent, onAddContact, onAddTask, onAddNote, onAddMessage, isMobile, view, onViewChange }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const addButton = view === 'events'
    ? <button className="btn btn-primary" onClick={onAddEvent}>+ Event</button>
    : view === 'contacts'
      ? <button className="btn btn-primary" onClick={onAddContact}>+ Contact</button>
      : view === 'calendar'
        ? <button className="btn btn-primary" onClick={onAddEvent}>+ Event</button>
        : view === 'tasks'
          ? <button className="btn btn-primary" onClick={onAddTask}>+ Task</button>
          : view === 'notes'
            ? <button className="btn btn-primary" onClick={onAddNote}>+ Note</button>
            : view === 'messages'
              ? <button className="btn btn-primary" onClick={onAddMessage}>+ Message</button>
              : <button className="btn btn-primary" onClick={onAddListing}>+ Sell</button>

  const accountViews: AccountView[] = ['contacts', 'calendar', 'tasks', 'notes', 'messages', 'activity']
  const activeAccountView = accountViews.includes(view as AccountView) ? (view as AccountView) : null

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-icon">P</div>
          {!isMobile && 'PearMarket'}
        </div>

        {!isMobile && (
          <div className="nav-tabs">
            <button
              className={`nav-tab ${view === 'listings' ? 'active' : ''}`}
              onClick={() => onViewChange('listings')}
            >
              Listings
            </button>
            <button
              className={`nav-tab ${view === 'events' ? 'active' : ''}`}
              onClick={() => onViewChange('events')}
            >
              Events
            </button>
          </div>
        )}

        {!isMobile && (
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        <div className="header-actions">
          {peerInfo && (
            <div className="peer-status" title={`Your peer ID: ${peerInfo.peerId?.slice(0, 16)}...`}>
              <span className={`peer-dot ${peerInfo.peerCount > 0 ? 'online' : ''}`} />
              {!isMobile && (
                <span>{peerInfo.peerCount} {peerInfo.peerCount === 1 ? 'peer' : 'peers'}</span>
              )}
            </div>
          )}
          {!isMobile && addButton}
          {!isMobile && (
            <AccountMenuDesktop
              peerInfo={peerInfo}
              activeView={activeAccountView}
              onSelect={(v) => onViewChange(v)}
            />
          )}
        </div>
      </div>
    </header>
  )
}

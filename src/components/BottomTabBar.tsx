interface Props {
  active: 'browse' | 'sell' | 'search' | 'events' | 'account'
  onBrowse: () => void
  onSell: () => void
  onSearch: () => void
  onEvents: () => void
  onAccount: () => void
}

export function BottomTabBar({ active, onBrowse, onSell, onSearch, onEvents, onAccount }: Props) {
  return (
    <nav className="bottom-tab-bar">
      <button
        className={`tab-item ${active === 'browse' ? 'active' : ''}`}
        onClick={onBrowse}
      >
        <span className="tab-icon">🏠</span>
        <span className="tab-label">Browse</span>
      </button>
      <button
        className={`tab-item ${active === 'events' ? 'active' : ''}`}
        onClick={onEvents}
      >
        <span className="tab-icon">📅</span>
        <span className="tab-label">Events</span>
      </button>
      <button
        className={`tab-item tab-sell ${active === 'sell' ? 'active' : ''}`}
        onClick={onSell}
      >
        <span className="tab-sell-button">+</span>
        <span className="tab-label">Sell</span>
      </button>
      <button
        className={`tab-item ${active === 'account' ? 'active' : ''}`}
        onClick={onAccount}
      >
        <span className="tab-icon">👤</span>
        <span className="tab-label">Account</span>
      </button>
      <button
        className={`tab-item ${active === 'search' ? 'active' : ''}`}
        onClick={onSearch}
      >
        <span className="tab-icon">🔍</span>
        <span className="tab-label">Search</span>
      </button>
    </nav>
  )
}

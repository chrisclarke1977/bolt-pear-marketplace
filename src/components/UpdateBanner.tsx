interface Props {
  onApply: () => void
  onDismiss: () => void
}

export function UpdateBanner({ onApply, onDismiss }: Props) {
  return (
    <div className="update-banner">
      <span>A new version of PearMarket is available via P2P update.</span>
      <div className="update-banner-actions">
        <button className="btn btn-secondary" onClick={onDismiss}>Later</button>
        <button className="btn btn-primary" onClick={onApply}>Apply update</button>
      </div>
    </div>
  )
}

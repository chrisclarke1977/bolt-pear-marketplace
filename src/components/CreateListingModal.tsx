import { useState } from 'react'
import type { MarketClient } from '../marketClient'

interface Props {
  client: MarketClient
  onClose: () => void
}

const CATEGORIES = ['general', 'electronics', 'home', 'sports', 'music', 'clothing', 'books']

export function CreateListingModal({ client, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [category, setCategory] = useState('general')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!description.trim()) { setError('Description is required'); return }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) { setError('Enter a valid price'); return }

    client.addListing({
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      currency,
      category,
      image: image.trim(),
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">List a new item</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you selling?" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your item..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price</label>
                <input className="form-input" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="BTC">BTC (₿)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Image URL (optional)</label>
              <input className="form-input" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish to network</button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import type { Task } from '../types'
import type { MarketClient as MC } from '../marketClient'

interface Props {
  tasks: Task[]
  client: MC
  query: string
}

type StatusFilter = 'all' | 'active' | 'done'
type PriorityFilter = 'all' | 'high' | 'medium' | 'low'

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Tasks' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Completed' },
]

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Any Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' },
]

function formatDueDate(ts: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(d)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff <= 7) return `In ${diff}d`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TaskList({ tasks, client, query }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [editDueDate, setEditDueDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter === 'active' && t.done) return false
      if (statusFilter === 'done' && !t.done) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      return true
    })
  }, [tasks, statusFilter, priorityFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      const pri = { high: 0, medium: 1, low: 2 }
      if (pri[a.priority] !== pri[b.priority]) return pri[a.priority] - pri[b.priority]
      return (a.dueDate || Infinity) - (b.dueDate || Infinity)
    })
  }, [filtered])

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✓</div>
        <div className="empty-title">No tasks yet</div>
        <div className="empty-subtitle">
          {query ? 'Try a different search term.' : 'Add a task to stay organized!'}
        </div>
      </div>
    )
  }

  const startEdit = (t: Task) => {
    setEditingIndex(t.index)
    setEditTitle(t.title)
    setEditNotes(t.notes)
    setEditPriority(t.priority)
    setEditDueDate(t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : '')
  }

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingIndex === null) return
    client.updateTask(editingIndex, {
      title: editTitle.trim(),
      notes: editNotes.trim(),
      priority: editPriority,
      dueDate: editDueDate ? new Date(editDueDate).getTime() : null,
    })
    setEditingIndex(null)
  }

  return (
    <div className="task-list-container">
      <div className="filter-sort-bar">
        <div className="filter-group">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-chip ${statusFilter === opt.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="sort-group">
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No matches</div>
          <div className="empty-subtitle">Try adjusting your filters.</div>
        </div>
      ) : (
        <div className="task-list">
          {sorted.map((t) => {
            const isEditing = editingIndex === t.index
            if (isEditing) {
              return (
                <form key={t.id} className="task-edit-card" onSubmit={saveEdit}>
                  <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Task title" autoFocus />
                  <textarea className="form-textarea" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes (optional)" />
                  <div className="task-edit-row">
                    <select className="form-input" value={editPriority} onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}>
                      <option value="low">Low priority</option>
                      <option value="medium">Medium priority</option>
                      <option value="high">High priority</option>
                    </select>
                    <input className="form-input" type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                  </div>
                  <div className="task-edit-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingIndex(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save</button>
                  </div>
                </form>
              )
            }
            const due = formatDueDate(t.dueDate)
            const overdue = t.dueDate && t.dueDate < Date.now() && !t.done
            return (
              <div key={t.id} className={`task-card ${t.done ? 'done' : ''}`} style={{ animationDelay: `${t.index * 40}ms` }}>
                <button
                  className={`task-checkbox ${t.done ? 'checked' : ''}`}
                  onClick={() => client.toggleTask(t.index)}
                  aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {t.done && '✓'}
                </button>
                <div className="task-body">
                  <div className="task-title">{t.title}</div>
                  {t.notes && <div className="task-notes">{t.notes}</div>}
                  <div className="task-meta">
                    <span className={`task-priority priority-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                    {due && <span className={`task-due ${overdue ? 'overdue' : ''}`}>{due}</span>}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="task-action-btn" onClick={() => startEdit(t)} aria-label="Edit task">✎</button>
                  <button className="task-action-btn" onClick={() => client.deleteTask(t.index)} aria-label="Delete task">🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'

const initialForm = {
  title: '',
  description: '',
  priority: 'low'
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value))
}

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(initialForm)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [apiStatus, setApiStatus] = useState('checking')

  async function loadTasks() {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Could not load tasks')
      setTasks(await response.json())
      setApiStatus('online')
      setMessage('')
    } catch (error) {
      setApiStatus('offline')
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function createTask(event) {
    event.preventDefault()
    if (!form.title.trim()) return

    try {
      setSaving(true)
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not create task')
      setTasks((current) => [data, ...current])
      setForm(initialForm)
      setMessage('Task created successfully.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateTask(id, updates) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not update task')
      setTasks((current) => current.map((task) => (task._id === id ? data : task)))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not delete task')
      setTasks((current) => current.filter((task) => task._id !== id))
      setMessage('Task deleted.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'completed').length
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks
    return tasks.filter((task) => task.status === filter)
  }, [filter, tasks])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">✦</div>
          <div>
            <div className="brand-name">TaskForge</div>
            <div className="brand-subtitle">Work, forged better.</div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          <button className="nav-item active">⌂ <span>Dashboard</span></button>
          <button className="nav-item" onClick={() => setFilter('all')}>☷ <span>All Tasks</span></button>
          <button className="nav-item" onClick={() => setFilter('todo')}>⚑ <span>To Do</span></button>
          <button className="nav-item" onClick={() => setFilter('completed')}>✓ <span>Completed</span></button>
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-icon">🚀</div>
          <h3>Build better</h3>
          <p>One task at a time. Keep shipping.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className={`status-dot ${apiStatus}`} />
            API {apiStatus === 'online' ? 'online' : apiStatus === 'offline' ? 'offline' : 'checking'}
          </div>
          <div className="profile-chip"><span className="avatar">NS</span> Neel Solanki</div>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">PERSONAL PRODUCTIVITY</p>
            <h1>Welcome to TaskForge 👋</h1>
            <p className="hero-copy">Organize your work, track your progress, and keep the important things moving.</p>
          </div>
          <div className="hero-art">
            <div className="sun" />
            <div className="mountain mountain-one" />
            <div className="mountain mountain-two" />
            <div className="river" />
            <div className="hero-art-text">Stay focused<span>Small steps make big progress.</span></div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card blue"><span className="stat-icon">☷</span><div><small>Total Tasks</small><strong>{stats.total}</strong></div></div>
          <div className="stat-card green"><span className="stat-icon">✓</span><div><small>Completed</small><strong>{stats.completed}</strong></div></div>
          <div className="stat-card amber"><span className="stat-icon">◷</span><div><small>Pending</small><strong>{stats.pending}</strong></div></div>
        </section>

        <section className="workspace-grid">
          <form className="card create-card" onSubmit={createTask}>
            <div className="card-heading"><div className="heading-icon">＋</div><div><h2>Create New Task</h2><p>Turn the next idea into an actionable item.</p></div></div>

            <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Enter task title..." maxLength={120} required /></label>
            <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Enter task description..." rows="4" maxLength={500} /></label>
            <label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select></label>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Task'}</button>
            {message && <div className="message" role="status">{message}</div>}
          </form>

          <div className="card insight-card">
            <span className="insight-label">TODAY'S FLOW</span>
            <h2>Progress is a practice.</h2>
            <p>Break large delivery goals into small, visible tasks and close the loop every day.</p>
            <div className="progress-ring"><div><strong>{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</strong><span>complete</span></div></div>
          </div>
        </section>

        <section className="card tasks-card">
          <div className="tasks-header">
            <div><h2>Task List</h2><p>Manage your work from one place.</p></div>
            <div className="filter-tabs">
              {['all', 'todo', 'in-progress', 'completed'].map((option) => (
                <button key={option} className={filter === option ? 'selected' : ''} onClick={() => setFilter(option)}>{option === 'all' ? 'All' : option.replace('-', ' ')}</button>
              ))}
            </div>
          </div>

          {loading ? <div className="empty-state">Loading tasks…</div> : filteredTasks.length === 0 ? (
            <div className="empty-state">No tasks in this filter. Create your next task above.</div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <article className="task-row" key={task._id}>
                  <div className={`task-symbol ${task.priority}`}>{task.status === 'completed' ? '✓' : task.priority === 'high' ? '!' : '•'}</div>
                  <div className="task-main">
                    <h3>{task.title}</h3>
                    <p>{task.description || 'No description provided.'}</p>
                  </div>
                  <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                  <span className={`badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
                  <time>{formatDate(task.createdAt)}</time>
                  <div className="task-actions">
                    {task.status !== 'completed' && <button onClick={() => updateTask(task._id, { status: 'completed' })}>Complete</button>}
                    {task.status === 'completed' && <button className="secondary" onClick={() => updateTask(task._id, { status: 'todo' })}>Reopen</button>}
                    <button className="delete" onClick={() => deleteTask(task._id)} aria-label={`Delete ${task.title}`}>⌫</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer>TaskForge <span>•</span> Your tasks. Our priority. <span>•</span> v1.0.0</footer>
      </main>
    </div>
  )
}

export default App

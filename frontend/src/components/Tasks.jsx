import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import { Modal, EmptyState, formatDate } from './Shared';
import {
  IconPlus, IconTrash, IconEdit, IconCheckSquare, IconFlag, IconRefreshCw, IconClipboard,
} from './Icons';

const COLUMNS = [
  { key: 'todo', label: 'To Do', Icon: IconClipboard, color: 'var(--text-secondary)' },
  { key: 'in_progress', label: 'In Progress', Icon: IconRefreshCw, color: 'var(--accent-amber)' },
  { key: 'done', label: 'Done', Icon: IconCheckSquare, color: 'var(--accent-green)' },
];

const PRIORITIES = ['low', 'medium', 'high'];

const PRIORITY_CONFIG = {
  high: { color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.12)', label: 'High' },
  medium: { color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.12)', label: 'Medium' },
  low: { color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.12)', label: 'Low' },
};

function TaskForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    priority: initial.priority || 'medium',
    status: initial.status || 'todo',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = () => {
    if (!form.title.trim()) return alert('Title is required.');
    onSave(form);
  };

  return (
    <Modal title={initial.id ? 'Edit Task' : 'New Task'} onClose={onClose} onSave={handleSave}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input className="form-input" placeholder="Task title…" value={form.title} onChange={set('title')} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: '80px' }}
          placeholder="Details…"
          value={form.description}
          onChange={set('description')}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={set('status')}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span
      className="priority-indicator"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <IconFlag size={11} />
      {cfg.label}
    </span>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-desc">{task.description}</div>}
      <div className="task-card-meta">
        <PriorityBadge priority={task.priority} />
        <button
          className="btn btn-danger btn-sm btn-icon"
          style={{ opacity: 0.7 }}
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          title="Delete"
        >
          <IconTrash size={12} />
        </button>
      </div>
      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {COLUMNS.filter(c => c.key !== task.status).map(c => (
          <button
            key={c.key}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '10px', padding: '4px 8px', color: c.color, gap: '4px' }}
            onClick={(e) => { e.stopPropagation(); onStatusChange(task, c.key); }}
          >
            <c.Icon size={10} /> {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = () =>
    getTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await updateTask(modal.id, data);
    else await createTask(data);
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    load();
  };

  const handleStatusChange = async (task, newStatus) => {
    await updateTask(task.id, { ...task, status: newStatus });
    load();
  };

  const byStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Task Board</h2>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <IconPlus size={14} /> New Task
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="task-board">
          {COLUMNS.map(col => {
            const colTasks = byStatus(col.key);
            return (
              <div className="task-column" key={col.key} style={{ borderTop: `3px solid ${col.color}` }}>
                <div className="task-column-header">
                  <div className="task-column-title" style={{ color: col.color }}>
                    <col.Icon size={14} />
                    {col.label}
                  </div>
                  <span className="task-count">{colTasks.length}</span>
                </div>
                <div className="task-list">
                  {colTasks.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
                      No tasks
                    </div>
                  )}
                  {colTasks.map(t => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={setModal}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <TaskForm
          initial={modal === 'new' ? {} : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

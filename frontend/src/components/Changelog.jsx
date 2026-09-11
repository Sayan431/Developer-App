import { useState, useEffect } from 'react';
import { getChangelog, createChangelog, updateChangelog, deleteChangelog, getProjects } from '../api';
import { EmptyState } from './Shared';
import { IconPlus, IconEdit, IconTrash, IconGitCommit, IconCalendar, IconX, IconCheck } from './Icons';

function EntryForm({ initial = {}, projects = [], onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title:      initial.title      || '',
    date:       initial.date       || today,
    project_id: initial.project_id || '',
    items:      (initial.items || []).join('\n'),
  });

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = () => {
    if (!form.title.trim()) return alert('Title is required.');
    const items = form.items.split('\n').map(s => s.trim()).filter(Boolean);
    onSave({ ...form, items, project_id: form.project_id || null });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial.id ? 'Edit Entry' : 'New Changelog Entry'}</h3>
          <button className="modal-close" onClick={onClose}><IconX size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="What did you work on?" value={form.title} onChange={set('title')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={set('date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Project (optional)</label>
              <select className="form-select" value={form.project_id} onChange={set('project_id')}>
                <option value="">— No project —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Items (one per line)</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '140px' }}
              placeholder={"Fixed authentication bug\nAdded dark mode toggle\nRefactored API layer"}
              value={form.items}
              onChange={set('items')}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Entry</button>
        </div>
      </div>
    </div>
  );
}

function groupByDate(entries) {
  const groups = {};
  for (const e of entries) {
    const key = e.date || e.created_at?.slice(0, 10) || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatDisplayDate(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

export default function Changelog() {
  const [entries, setEntries]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);

  const load = () =>
    Promise.all([getChangelog(), getProjects()])
      .then(([ch, pr]) => { setEntries(ch); setProjects(pr); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await updateChangelog(modal.id, data);
    else            await createChangelog(data);
    setModal(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await deleteChangelog(id); load();
  };

  const grouped = groupByDate(entries);
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Changelog</h2>
          <p className="page-subtitle">{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} logged</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <IconPlus size={14} /> Log Today
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : entries.length === 0 ? (
        <EmptyState icon={<IconGitCommit size={40} />} title="No entries yet" desc="Start logging what you work on each day." />
      ) : (
        <div style={{ maxWidth: '720px' }}>
          {grouped.map(([date, dayEntries]) => (
            <div key={date} style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
              {/* Timeline spine */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-purple)', border: '2px solid var(--bg-primary)', marginTop: '4px', flexShrink: 0 }} />
                <div style={{ width: '2px', flex: 1, background: 'var(--border)', marginTop: '6px' }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: '8px' }}>
                {/* Date header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <IconCalendar size={13} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {formatDisplayDate(date)}
                  </span>
                </div>

                {/* Entries for this day */}
                {dayEntries.map(entry => {
                  const proj = entry.project_id ? projectMap[entry.project_id] : null;
                  return (
                    <div key={entry.id} className="card" style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <IconGitCommit size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{entry.title}</span>
                            {proj && (
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: `${proj.color}18`, color: proj.color, fontWeight: '600' }}>
                                {proj.name}
                              </span>
                            )}
                          </div>
                          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(entry.items || []).map((item, i) => (
                              <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(entry)}>
                            <IconEdit size={12} />
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(entry.id)}>
                            <IconTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <EntryForm
          initial={modal === 'new' ? {} : modal}
          projects={projects}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

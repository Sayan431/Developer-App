import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api';
import { Modal, EmptyState, formatDate } from './Shared';
import { IconPlus, IconEdit, IconTrash, IconFolder, IconFolderOpen, IconSearch } from './Icons';

const COLORS = ['#6c63ff', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#22d3ee', '#a78bfa', '#ef4444'];

function ProjectForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    name:        initial.name        || '',
    description: initial.description || '',
    color:       initial.color       || '#6c63ff',
  });

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = () => {
    if (!form.name.trim()) return alert('Project name is required.');
    onSave(form);
  };

  return (
    <Modal title={initial.id ? 'Edit Project' : 'New Project'} onClose={onClose} onSave={handleSave}>
      <div className="form-group">
        <label className="form-label">Project Name</label>
        <input className="form-input" placeholder="My Awesome App" value={form.name} onChange={set('name')} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" placeholder="A short description…" value={form.description} onChange={set('description')} />
      </div>
      <div className="form-group">
        <label className="form-label">Color</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setForm({ ...form, color: c })}
              style={{
                width: '28px', height: '28px', borderRadius: '50%', background: c,
                border: form.color === c ? '3px solid white' : '3px solid transparent',
                cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none',
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card"
      style={{ borderLeft: `4px solid ${project.color}`, position: 'relative', cursor: 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Actions */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(project)}>
          <IconEdit size={12} />
        </button>
        <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(project.id)}>
          <IconTrash size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', background: `${project.color}18`, border: `1px solid ${project.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {hovered
            ? <IconFolderOpen size={22} style={{ color: project.color }} />
            : <IconFolder     size={22} style={{ color: project.color }} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px', paddingRight: '60px' }}>{project.name}</div>
          {project.description && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '10px' }}>
              {project.description}
            </div>
          )}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Created {formatDate(project.created_at)}
          </div>
        </div>
      </div>

      {/* Color indicator dots */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '99px', background: i < 2 ? project.color : 'var(--border)' }} />
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [search, setSearch]     = useState('');

  const load = () =>
    getProjects().then(setProjects).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await updateProject(modal.id, data);
    else            await createProject(data);
    setModal(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id); load();
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Projects</h2>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <IconPlus size={14} /> New Project
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <span className="search-icon"><IconSearch size={14} /></span>
          <input
            className="form-input search-input"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<IconFolder size={40} />} title="No projects yet" desc="Organize your work into projects." />
      ) : (
        <div className="grid-auto">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onEdit={setModal} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal && (
        <ProjectForm
          initial={modal === 'new' ? {} : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

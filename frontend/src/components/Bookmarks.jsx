import { useState, useEffect } from 'react';
import { getBookmarks, createBookmark, updateBookmark, deleteBookmark } from '../api';
import { Modal, EmptyState, formatDate } from './Shared';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconBookmark, IconLink, IconTag, IconX } from './Icons';

const CATEGORIES = ['General', 'Docs', 'Tools', 'References', 'APIs', 'Design', 'Learning'];

const CAT_COLORS = {
  General:    '#6c63ff',
  Docs:       '#3b82f6',
  Tools:      '#10b981',
  References: '#f59e0b',
  APIs:       '#ec4899',
  Design:     '#22d3ee',
  Learning:   '#a78bfa',
};

function BookmarkForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       initial.title       || '',
    url:         initial.url         || '',
    description: initial.description || '',
    category:    initial.category    || 'General',
    tags:        (initial.tags || []).join(', '),
  });

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSave = () => {
    if (!form.title.trim() || !form.url.trim()) return alert('Title and URL are required.');
    let url = form.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    onSave({ ...form, url, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
  };

  return (
    <Modal title={initial.id ? 'Edit Bookmark' : 'Add Bookmark'} onClose={onClose} onSave={handleSave}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input className="form-input" placeholder="MDN Web Docs" value={form.title} onChange={set('title')} />
      </div>
      <div className="form-group">
        <label className="form-label">URL</label>
        <input className="form-input" placeholder="https://developer.mozilla.org" value={form.url} onChange={set('url')} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" placeholder="Short description…" value={form.description} onChange={set('description')} />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.category} onChange={set('category')}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Tags (comma-separated)</label>
        <input className="form-input" placeholder="css, web, frontend…" value={form.tags} onChange={set('tags')} />
      </div>
    </Modal>
  );
}

function BookmarkCard({ bm, onEdit, onDelete }) {
  const color = CAT_COLORS[bm.category] || '#6c63ff';
  const domain = (() => { try { return new URL(bm.url).hostname; } catch { return bm.url; } })();

  return (
    <div
      className="card"
      style={{ position: 'relative', cursor: 'pointer', borderLeft: `3px solid ${color}`, transition: 'all 0.2s' }}
      onClick={() => window.open(bm.url, '_blank', 'noopener')}
    >
      {/* Actions */}
      <div className="note-actions" onClick={e => e.stopPropagation()}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); onEdit(bm); }}>
          <IconEdit size={12} />
        </button>
        <button className="btn btn-danger btn-sm btn-icon" onClick={e => { e.stopPropagation(); onDelete(bm.id); }}>
          <IconTrash size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Favicon */}
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt=""
            style={{ width: '20px', height: '20px', borderRadius: '4px' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bm.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <IconLink size={10} /> {domain}
          </div>
          {bm.description && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bm.description}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '99px', background: `${color}18`, color }}>
              {bm.category}
            </span>
            {(bm.tags || []).slice(0, 3).map(t => (
              <span key={t} className="tag tag-blue" style={{ fontSize: '10px' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const load = () =>
    getBookmarks().then(setBookmarks).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await updateBookmark(modal.id, data);
    else            await createBookmark(data);
    setModal(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bookmark?')) return;
    await deleteBookmark(id); load();
  };

  const filtered = bookmarks.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q);
    const matchCat    = catFilter === 'all' || b.category === catFilter;
    return matchSearch && matchCat;
  });

  const usedCats = ['all', ...new Set(bookmarks.map(b => b.category))];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Bookmarks</h2>
          <p className="page-subtitle">{bookmarks.length} saved link{bookmarks.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <IconPlus size={14} /> Add Bookmark
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input
            className="form-input search-input"
            placeholder="Search bookmarks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {usedCats.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<IconBookmark size={40} />} title="No bookmarks yet" desc="Save your favourite dev links, docs and resources." />
      ) : (
        <div className="grid-auto">
          {filtered.map(bm => <BookmarkCard key={bm.id} bm={bm} onEdit={setModal} onDelete={handleDelete} />)}
        </div>
      )}

      {modal && (
        <BookmarkForm
          initial={modal === 'new' ? {} : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

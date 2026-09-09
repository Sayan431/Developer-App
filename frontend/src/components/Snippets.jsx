import { useState, useEffect } from 'react';
import { getSnippets, createSnippet, updateSnippet, deleteSnippet } from '../api';
import { Modal, EmptyState, getLangColor, formatDate } from './Shared';
import {
  IconPlus, IconSearch, IconEdit, IconTrash, IconCopy, IconCheck, IconClipboard,
} from './Icons';

const LANGUAGES = [
  'javascript','typescript','python','html','css','json',
  'shell','bash','rust','go','java','cpp','other',
];

function SnippetForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    title:    initial.title    || '',
    code:     initial.code     || '',
    language: initial.language || 'javascript',
    tags:     (initial.tags || []).join(', '),
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = () => {
    if (!form.title.trim() || !form.code.trim()) return alert('Title and code are required.');
    onSave({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
  };

  return (
    <Modal title={initial.id ? 'Edit Snippet' : 'New Snippet'} onClose={onClose} onSave={handleSave}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input className="form-input" placeholder="Snippet title…" value={form.title} onChange={set('title')} />
      </div>
      <div className="form-group">
        <label className="form-label">Language</label>
        <select className="form-select" value={form.language} onChange={set('language')}>
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Code</label>
        <textarea className="form-textarea code-textarea" placeholder="// your code here…" value={form.code} onChange={set('code')} />
      </div>
      <div className="form-group">
        <label className="form-label">Tags (comma-separated)</label>
        <input className="form-input" placeholder="react, hooks, api…" value={form.tags} onChange={set('tags')} />
      </div>
    </Modal>
  );
}

function SnippetCard({ snippet, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const langColor = getLangColor(snippet.language);

  return (
    <div className="snippet-card">
      <div className="snippet-header">
        <div className="snippet-header-left">
          <div className="snippet-lang-dot" style={{ background: langColor }} />
          <span className="snippet-title">{snippet.title}</span>
        </div>
        <div className="snippet-actions">
          <button className="btn btn-ghost btn-sm btn-icon" title="Copy" onClick={copy}>
            {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => onEdit(snippet)}>
            <IconEdit size={13} />
          </button>
          <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => onDelete(snippet.id)}>
            <IconTrash size={13} />
          </button>
        </div>
      </div>
      <pre className="snippet-code">{snippet.code}</pre>
      <div className="snippet-footer">
        <span className="tag" style={{ background: `${langColor}22`, color: langColor }}>
          {snippet.language}
        </span>
        {snippet.tags.map(t => <span key={t} className="tag tag-blue">{t}</span>)}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
          {formatDate(snippet.created_at)}
        </span>
      </div>
    </div>
  );
}

export default function Snippets() {
  const [snippets, setSnippets]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [search, setSearch]       = useState('');
  const [langFilter, setLangFilter] = useState('all');

  const load = () =>
    getSnippets().then(setSnippets).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await updateSnippet(modal.id, data);
    else            await createSnippet(data);
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this snippet?')) return;
    await deleteSnippet(id);
    load();
  };

  const filtered = snippets.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                        s.code.toLowerCase().includes(search.toLowerCase());
    const matchLang   = langFilter === 'all' || s.language === langFilter;
    return matchSearch && matchLang;
  });

  const langs = ['all', ...new Set(snippets.map(s => s.language))];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Code Snippets</h2>
          <p className="page-subtitle">{snippets.length} snippet{snippets.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <IconPlus size={14} /> New Snippet
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon"><IconSearch size={14} /></span>
          <input
            className="form-input search-input"
            placeholder="Search snippets…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={langFilter}
          onChange={e => setLangFilter(e.target.value)}
        >
          {langs.map(l => <option key={l} value={l}>{l === 'all' ? 'All languages' : l}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconClipboard size={40} />}
          title="No snippets yet"
          desc="Save your favourite code snippets here."
        />
      ) : (
        <div className="grid-auto">
          {filtered.map(s => (
            <SnippetCard key={s.id} snippet={s} onEdit={setModal} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal && (
        <SnippetForm
          initial={modal === 'new' ? {} : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

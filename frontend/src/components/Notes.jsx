import { useState, useEffect } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from '../api';
import { Modal, EmptyState, formatDate } from './Shared';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconFileText } from './Icons';

function NoteForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    title:   initial.title   || '',
    content: initial.content || '',
  });

  const handleSave = () => {
    if (!form.title.trim()) return alert('Title is required.');
    onSave(form);
  };

  return (
    <Modal title={initial.id ? 'Edit Note' : 'New Note'} onClose={onClose} onSave={handleSave}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          placeholder="Note title…"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: '200px' }}
          placeholder="Write your note here…"
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
        />
      </div>
    </Modal>
  );
}

const NOTE_ACCENTS = [
  'rgba(108,99,255,0.08)',
  'rgba(59,130,246,0.08)',
  'rgba(16,185,129,0.08)',
  'rgba(245,158,11,0.08)',
  'rgba(236,72,153,0.08)',
];

const NOTE_BORDER_ACCENTS = [
  'rgba(108,99,255,0.25)',
  'rgba(59,130,246,0.25)',
  'rgba(16,185,129,0.25)',
  'rgba(245,158,11,0.25)',
  'rgba(236,72,153,0.25)',
];

export default function Notes() {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [search, setSearch]   = useState('');

  const load = () =>
    getNotes().then(setNotes).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await updateNote(modal.id, data);
    else            await createNote(data);
    setModal(null);
    load();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    await deleteNote(id);
    load();
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dev Notes</h2>
          <p className="page-subtitle">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <IconPlus size={14} /> New Note
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <span className="search-icon"><IconSearch size={14} /></span>
          <input
            className="form-input search-input"
            placeholder="Search notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconFileText size={40} />}
          title="No notes yet"
          desc="Keep your dev thoughts and references here."
        />
      ) : (
        <div className="notes-grid">
          {filtered.map((note, i) => (
            <div
              key={note.id}
              className="note-card"
              style={{
                background: NOTE_ACCENTS[i % NOTE_ACCENTS.length],
                borderColor: NOTE_BORDER_ACCENTS[i % NOTE_BORDER_ACCENTS.length],
              }}
              onClick={() => setModal(note)}
            >
              <div className="note-actions">
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  title="Edit"
                  onClick={e => { e.stopPropagation(); setModal(note); }}
                >
                  <IconEdit size={12} />
                </button>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  title="Delete"
                  onClick={e => handleDelete(note.id, e)}
                >
                  <IconTrash size={12} />
                </button>
              </div>
              <div className="note-card-title">{note.title}</div>
              <div className="note-card-content">{note.content}</div>
              <div className="note-card-meta">Updated {formatDate(note.updated_at)}</div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <NoteForm
          initial={modal === 'new' ? {} : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

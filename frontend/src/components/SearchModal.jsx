import { useState, useEffect, useCallback } from 'react';
import { getSnippets, getTasks, getNotes, getBookmarks } from '../api';
import { IconSearch, IconX, IconClipboard, IconCheckSquare, IconFileText, IconBookmark } from './Icons';

export default function SearchModal({ onClose, onNavigate }) {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState({ snippets: [], tasks: [], notes: [], bookmarks: [] });
  const [allData, setAllData] = useState({ snippets: [], tasks: [], notes: [], bookmarks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSnippets(), getTasks(), getNotes(), getBookmarks()])
      .then(([snippets, tasks, notes, bookmarks]) => {
        setAllData({ snippets, tasks, notes, bookmarks });
        setResults({ snippets, tasks, notes, bookmarks });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults(allData);
      return;
    }
    setResults({
      snippets:  allData.snippets.filter(s  => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)),
      tasks:     allData.tasks.filter(t     => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)),
      notes:     allData.notes.filter(n     => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)),
      bookmarks: allData.bookmarks.filter(b => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)),
    });
  }, [query, allData]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const total = results.snippets.length + results.tasks.length + results.notes.length + results.bookmarks.length;

  const SECTIONS = [
    { key: 'snippets',  label: 'Snippets',  page: 'snippets',  Icon: IconClipboard,   color: '#6c63ff' },
    { key: 'tasks',     label: 'Tasks',     page: 'tasks',     Icon: IconCheckSquare, color: '#3b82f6' },
    { key: 'notes',     label: 'Notes',     page: 'notes',     Icon: IconFileText,    color: '#10b981' },
    { key: 'bookmarks', label: 'Bookmarks', page: 'bookmarks', Icon: IconBookmark,    color: '#f59e0b' },
  ];

  return (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={onClose} />
      
      {/* Search Dropdown Dialog */}
      <div style={{ 
        position: 'fixed', top: '64px', right: '28px', 
        background: 'var(--bg-card)', 
        border: '1px solid var(--accent-purple)', 
        borderRadius: 'var(--radius-lg)', width: '440px', maxHeight: '80vh', 
        display: 'flex', flexDirection: 'column', 
        boxShadow: '0 12px 40px rgba(0,0,0,0.2), 0 0 20px rgba(108,99,255,0.15)', zIndex: 1000,
        animation: 'slideUp 0.15s ease'
      }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <IconSearch size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            autoFocus
            placeholder="Search snippets, tasks, notes, bookmarks…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
          />
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconX size={12} /> Esc
          </button>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', padding: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Searching…</div>
          ) : total === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
              No results for "{query}"
            </div>
          ) : (
            SECTIONS.map(({ key, label, page, Icon, color }) => {
              const items = results[key];
              if (!items.length) return null;
              return (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', padding: '4px 8px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={12} style={{ color }} />
                    {label}
                    <span style={{ background: 'var(--border)', borderRadius: '99px', padding: '1px 6px', fontSize: '10px', marginLeft: '2px' }}>{items.length}</span>
                  </div>
                  {items.slice(0, 5).map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(page); onClose(); }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', padding: '10px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title || item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {item.content || item.description || item.url || item.code?.slice(0, 60) || ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {total > 0 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
            {total} result{total !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
    </>
  );
}


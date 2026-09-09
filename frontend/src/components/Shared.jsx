import { useState, useEffect } from 'react';
import { getHealth } from '../api';
import { IconX, IconServer } from './Icons';

const LANG_COLORS = {
  javascript: '#f7df1e', python: '#3572A5', typescript: '#3178c6',
  html: '#e34c26', css: '#563d7c', json: '#292929',
  shell: '#4eaa25', bash: '#4eaa25', rust: '#dea584',
  go: '#00add8', java: '#b07219', cpp: '#f34b7d',
};

export function getLangColor(lang) {
  return LANG_COLORS[(lang || '').toLowerCase()] || '#888';
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function Modal({ title, onClose, onSave, children, saveLabel = 'Save' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <IconX size={14} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {onSave && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Spinner() {
  return <div className="spinner" />;
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ opacity: 0.3 }}>{icon}</div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-desc">{desc}</div>
    </div>
  );
}

export function StatusBadge({ code }) {
  const cls = code >= 500 ? 'status-5xx' : code >= 400 ? 'status-4xx' : 'status-2xx';
  return <span className={`status-badge ${cls}`}>{code}</span>;
}

export function BackendStatus() {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    getHealth().then(() => setOnline(true)).catch(() => setOnline(false));
    const id = setInterval(() => {
      getHealth().then(() => setOnline(true)).catch(() => setOnline(false));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="sidebar-status"
      style={{
        background: online === false ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
        borderColor: online === false ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
        color: online === false ? 'var(--accent-red)' : 'var(--accent-green)',
      }}
    >
      <IconServer size={13} />
      <div
        className="status-dot"
        style={{
          background: online === null ? '#888' : online ? '#10b981' : '#ef4444',
        }}
      />
      {online === null ? 'Connecting…' : online ? 'Backend online' : 'Backend offline'}
    </div>
  );
}

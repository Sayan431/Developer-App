import { useState, useEffect } from 'react';
import { getSnippets, getTasks, getNotes } from '../api';
import {
  IconClipboard, IconCheckSquare, IconFileText, IconGlobe,
  IconCode, IconLightbulb, IconArrowRight, IconTrendingUp,
  IconActivity, IconDatabase,
} from './Icons';

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ Icon, label, value, color, gradient }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div
      className="stat-value"
      style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
    >
      {value}
    </div>
    <div className="stat-label">{label}</div>
  </div>
);

// ── Quick action row ───────────────────────────────────────────────────────
const QuickAction = ({ Icon, label, sub, color, onClick }) => (
  <button
    className="btn btn-ghost"
    style={{ justifyContent: 'flex-start', gap: '14px', padding: '12px 14px' }}
    onClick={onClick}
  >
    <div style={{
      width: '36px', height: '36px',
      background: `${color}18`,
      borderRadius: 'var(--radius-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={17} style={{ color }} />
    </div>
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
    <IconArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
  </button>
);

const QUICK_ACTIONS = [
  { Icon: IconClipboard,   label: 'Browse Snippets',   sub: 'View and copy saved code',    page: 'snippets', color: '#6c63ff' },
  { Icon: IconCheckSquare, label: 'Open Task Board',    sub: 'Manage your dev tasks',       page: 'tasks',    color: '#3b82f6' },
  { Icon: IconFileText,    label: 'Write a Note',       sub: 'Capture ideas & references',  page: 'notes',    color: '#10b981' },
  { Icon: IconGlobe,       label: 'Test an API',        sub: 'Make live HTTP requests',     page: 'api',      color: '#f59e0b' },
];

const STATUS_COLORS = {
  todo:        { dot: 'var(--text-muted)',   label: 'To Do',       Icon: IconDatabase },
  in_progress: { dot: 'var(--accent-amber)', label: 'In Progress', Icon: IconActivity },
  done:        { dot: 'var(--accent-green)', label: 'Done',        Icon: IconCheckSquare },
};

export default function Dashboard({ onNavigate }) {
  const [stats, setStats]   = useState({ snippets: 0, tasks: 0, notes: 0 });
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSnippets(), getTasks(), getNotes()])
      .then(([snippets, tasks, notes]) => {
        setStats({ snippets: snippets.length, tasks: tasks.length, notes: notes.length });
        setTasks(tasks.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const taskCounts = {
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="page">

      {/* ── Hero banner ── */}
      <div style={{
        marginBottom: '28px', padding: '28px',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(59,130,246,0.08))',
        border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '56px', height: '56px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconCode size={26} style={{ color: '#9b93ff' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              Welcome to{' '}
              <span style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                DevHub
              </span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Your all-in-one developer productivity dashboard — snippets, tasks, notes & API testing.
            </p>
          </div>
        </div>
        <div style={{
          marginTop: '16px', padding: '12px 14px',
          background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.12)',
          borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
        }}>
          <IconLightbulb size={15} style={{ color: 'var(--accent-amber)', marginTop: '1px', flexShrink: 0 }} />
          <span>Use the <strong style={{ color: 'var(--text-primary)' }}>API Tester</strong> to proxy requests through the backend — no CORS issues! Quick-load presets are available for common endpoints.</span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatCard Icon={IconClipboard}   label="Code Snippets" value={loading ? '—' : stats.snippets} color="#6c63ff" gradient="linear-gradient(135deg,#6c63ff,#9b93ff)" />
        <StatCard Icon={IconCheckSquare} label="Total Tasks"   value={loading ? '—' : stats.tasks}    color="#3b82f6" gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
        <StatCard Icon={IconFileText}    label="Dev Notes"     value={loading ? '—' : stats.notes}    color="#10b981" gradient="linear-gradient(135deg,#10b981,#34d399)" />
      </div>

      <div className="grid-2">

        {/* ── Task Overview ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconTrendingUp size={15} style={{ color: 'var(--accent-purple)' }} />
              Task Overview
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tasks')}>
              View all <IconArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            {Object.entries(taskCounts).map(([key, count]) => {
              const cfg = STATUS_COLORS[key];
              return (
                <div key={key} style={{
                  flex: 1, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                  padding: '12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: cfg.dot }}>{count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{cfg.label}</div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          {stats.tasks > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Completion</span>
                <span>{Math.round((taskCounts.done / stats.tasks) * 100)}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(taskCounts.done / stats.tasks) * 100}%`,
                  background: 'var(--gradient-main)', borderRadius: '99px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="card">
          <h3 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {QUICK_ACTIONS.map(a => (
              <QuickAction key={a.page} {...a} onClick={() => onNavigate(a.page)} />
            ))}
          </div>
        </div>

      </div>

      {/* ── Recent tasks feed ── */}
      {tasks.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconActivity size={15} style={{ color: 'var(--accent-purple)' }} />
              Recent Tasks
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tasks')}>
              View all <IconArrowRight size={12} />
            </button>
          </div>
          {tasks.map(t => {
            const cfg = STATUS_COLORS[t.status];
            return (
              <div key={t.id} className="activity-item">
                <div className="activity-dot" style={{ background: cfg.dot }} />
                <div>
                  <div className="activity-text" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                    {t.title}
                  </div>
                  <div className="activity-time">
                    {cfg.label} · {t.priority} priority
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

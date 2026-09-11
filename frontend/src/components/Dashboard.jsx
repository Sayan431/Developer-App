import { useState, useEffect } from 'react';
import { getSnippets, getTasks, getNotes, getBookmarks, getProjects, getChangelog, getEnvSets } from '../api';
import {
  IconClipboard, IconCheckSquare, IconFileText, IconGlobe,
  IconCode, IconLightbulb, IconArrowRight, IconTrendingUp,
  IconActivity, IconDatabase, IconBookmark, IconFolder,
  IconGitCommit, IconKey, IconEye, IconBraces, IconTimer, IconClock
} from './Icons';

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ Icon, label, value, color, gradient }) => (
  <div 
    className="stat-card" 
    style={{ 
      border: `1px solid ${color}60`, 
      boxShadow: `0 8px 24px ${color}15, 0 0 0 1px ${color}10 inset` 
    }}
  >
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

// ── Recent Activity Item ───────────────────────────────────────────────────
const RecentItem = ({ Icon, title, sub, color, type, onClick }) => (
  <button
    className="btn btn-ghost"
    style={{ 
      justifyContent: 'flex-start', 
      gap: '14px', 
      padding: '12px',
      border: `1px solid ${color}30`,
      marginBottom: '10px',
      width: '100%'
    }}
    onClick={onClick}
  >
    <div style={{
      width: '36px', height: '36px',
      background: `${color}18`,
      borderRadius: 'var(--radius-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={16} style={{ color }} />
    </div>
    <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title || 'Untitled'}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {sub}
      </div>
    </div>
    <div style={{ fontSize: '11px', fontWeight: '600', color, padding: '2px 8px', background: `${color}15`, borderRadius: '99px' }}>
      {type}
    </div>
  </button>
);

const STATUS_COLORS = {
  todo:        { dot: 'var(--text-muted)',   label: 'To Do',       Icon: IconDatabase },
  in_progress: { dot: 'var(--accent-amber)', label: 'In Progress', Icon: IconActivity },
  done:        { dot: 'var(--accent-green)', label: 'Done',        Icon: IconCheckSquare },
};

export default function Dashboard({ onNavigate }) {
  const [stats, setStats]     = useState({ snippets: 0, tasks: 0, notes: 0, bookmarks: 0, projects: 0, changelog: 0, envsets: 0 });
  const [tasks, setTasks]     = useState([]);
  const [recentFeed, setRecentFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSnippets(), getTasks(), getNotes(), getBookmarks(), getProjects(), getChangelog(), getEnvSets()])
      .then(([snippets, tasks, notes, bookmarks, projects, changelog, envsets]) => {
        setStats({
          snippets:  snippets.length,
          tasks:     tasks.length,
          notes:     notes.length,
          bookmarks: bookmarks.length,
          projects:  projects.length,
          changelog: changelog.length,
          envsets:   envsets.length,
        });
        
        // Task overview
        setTasks(tasks.slice(0, 5));

        // Build recent feed by interleaving latest items
        const recent = [];
        const rev = (arr) => [...arr].reverse();
        const s = rev(snippets), c = rev(changelog), n = rev(notes), b = rev(bookmarks);
        
        for (let i = 0; i < 3; i++) {
          if (c[i]) recent.push({ id: `c-${c[i].id}`, type: 'Log',     title: c[i].title, sub: c[i].date, Icon: IconGitCommit, color: '#a78bfa', page: 'changelog' });
          if (s[i]) recent.push({ id: `s-${s[i].id}`, type: 'Snippet', title: s[i].title, sub: s[i].language, Icon: IconClipboard, color: '#6c63ff', page: 'snippets' });
          if (n[i]) recent.push({ id: `n-${n[i].id}`, type: 'Note',    title: n[i].title, sub: n[i].content?.slice(0, 40) || '...', Icon: IconFileText, color: '#10b981', page: 'notes' });
          if (b[i]) recent.push({ id: `b-${b[i].id}`, type: 'Link',    title: b[i].title, sub: b[i].url?.slice(0, 40), Icon: IconBookmark, color: '#ec4899', page: 'bookmarks' });
        }
        setRecentFeed(recent.slice(0, 6)); // Show latest 6 mixed items
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const taskCounts = {
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  };

  const v = (key) => loading ? '—' : stats[key];

  return (
    <div className="page" style={{ padding: '24px 28px' }}>

      {/* ── Hero banner ── */}
      <div style={{
        marginBottom: '20px', padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(59,130,246,0.08))',
        border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-xl)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
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
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px', color: 'var(--text-primary)' }}>
              Welcome to{' '}
              <span style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                DevHub
              </span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Your all-in-one developer productivity workspace.
            </p>
          </div>
        </div>
        
        {/* Ctrl+K tip on right side */}
        <div style={{
          padding: '12px 14px', background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.12)',
          borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <IconLightbulb size={15} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
          <span>Press <strong style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>Ctrl+K</strong> to search workspace</span>
        </div>
      </div>

      {/* ── Stats row 1 – Core ── */}
      <div className="grid-3" style={{ marginBottom: '14px' }}>
        <StatCard Icon={IconClipboard}   label="Snippets" value={v('snippets')}  color="#6c63ff" gradient="linear-gradient(135deg,#6c63ff,#9b93ff)" />
        <StatCard Icon={IconCheckSquare} label="Tasks"    value={v('tasks')}     color="#3b82f6" gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
        <StatCard Icon={IconFileText}    label="Notes"    value={v('notes')}     color="#10b981" gradient="linear-gradient(135deg,#10b981,#34d399)" />
      </div>

      {/* ── Stats row 2 – New features ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '18px' }}>
        <StatCard Icon={IconBookmark}    label="Bookmarks"  value={v('bookmarks')} color="#ec4899" gradient="linear-gradient(135deg,#ec4899,#f472b6)" />
        <StatCard Icon={IconFolder}      label="Projects"   value={v('projects')}  color="#22d3ee" gradient="linear-gradient(135deg,#22d3ee,#67e8f9)" />
        <StatCard Icon={IconGitCommit}   label="Changelog"  value={v('changelog')} color="#a78bfa" gradient="linear-gradient(135deg,#a78bfa,#c4b5fd)" />
        <StatCard Icon={IconKey}         label="Env Sets"   value={v('envsets')}   color="#f59e0b" gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" />
      </div>

      <div className="grid-2" style={{ gap: '20px' }}>

        {/* ── Task Overview ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
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

          {stats.tasks > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Completion</span>
                <span>{Math.round((taskCounts.done / stats.tasks) * 100)}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(taskCounts.done / stats.tasks) * 100}%`,
                  background: 'var(--gradient-main)', borderRadius: '99px', transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {tasks.length > 0 && (
            <div>
              <h3 style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                <IconActivity size={15} style={{ color: 'var(--accent-purple)' }} />
                Recent Tasks
              </h3>
              {tasks.map(t => {
                const cfg = STATUS_COLORS[t.status];
                return (
                  <div key={t.id} className="activity-item">
                    <div className="activity-dot" style={{ background: cfg.dot }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="activity-text" style={{ color: 'var(--text-primary)', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
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

        {/* ── Recent Activity Feed ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <IconClock size={15} style={{ color: 'var(--accent-amber)' }} />
              Recent Activity
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentFeed.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No recent activity yet.
              </div>
            ) : (
              recentFeed.map(item => (
                <RecentItem key={item.id} {...item} onClick={() => onNavigate(item.page)} />
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

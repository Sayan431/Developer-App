import { useState, useEffect, useCallback } from 'react';
import './index.css';
import Dashboard         from './components/Dashboard';
import Snippets          from './components/Snippets';
import Tasks             from './components/Tasks';
import Notes             from './components/Notes';
import ApiTester         from './components/ApiTester';
import Bookmarks         from './components/Bookmarks';
import Pomodoro          from './components/Pomodoro';
import MarkdownPreviewer from './components/MarkdownPreviewer';
import JsonFormatter     from './components/JsonFormatter';
import EnvManager        from './components/EnvManager';
import Projects          from './components/Projects';
import Changelog         from './components/Changelog';
import SearchModal       from './components/SearchModal';
import {
  IconHome, IconClipboard, IconCheckSquare, IconFileText, IconGlobe, IconZap,
  IconBookmark, IconTimer, IconEye, IconBraces, IconKey, IconFolder, IconGitCommit,
  IconSearch, IconSun, IconMoon,
} from './components/Icons';

// ── Navigation groups ───────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { key: 'snippets',  icon: <IconClipboard size={16} />,   label: 'Snippets' },
      { key: 'tasks',     icon: <IconCheckSquare size={16} />, label: 'Tasks' },
      { key: 'notes',     icon: <IconFileText size={16} />,    label: 'Notes' },
      { key: 'api',       icon: <IconGlobe size={16} />,       label: 'API Tester' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { key: 'markdown',  icon: <IconEye size={16} />,         label: 'Markdown' },
      { key: 'json',      icon: <IconBraces size={16} />,      label: 'JSON Formatter' },
      { key: 'pomodoro',  icon: <IconTimer size={16} />,       label: 'Pomodoro' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { key: 'bookmarks', icon: <IconBookmark size={16} />,    label: 'Bookmarks' },
      { key: 'envvars',   icon: <IconKey size={16} />,         label: 'Env Variables' },
      { key: 'projects',  icon: <IconFolder size={16} />,      label: 'Projects' },
      { key: 'changelog', icon: <IconGitCommit size={16} />,   label: 'Changelog' },
    ],
  },
];

const PAGE_META = {
  dashboard: { title: 'Dashboard',          subtitle: 'Overview of your dev workspace' },
  snippets:  { title: 'Code Snippets',       subtitle: 'Reusable code fragments' },
  tasks:     { title: 'Task Board',          subtitle: 'Manage and track your work' },
  notes:     { title: 'Dev Notes',           subtitle: 'Ideas, references & documentation' },
  api:       { title: 'API Tester',          subtitle: 'Test HTTP endpoints live' },
  markdown:  { title: 'Markdown Previewer',  subtitle: 'Write and preview markdown in real-time' },
  json:      { title: 'JSON Formatter',      subtitle: 'Format, validate and analyze JSON' },
  pomodoro:  { title: 'Pomodoro Timer',      subtitle: 'Stay focused with timed work sessions' },
  bookmarks: { title: 'Bookmarks',           subtitle: 'Your saved developer links' },
  envvars:   { title: 'Env Variables',       subtitle: 'Manage environment variables per project' },
  projects:  { title: 'Projects',            subtitle: 'Organise your work into projects' },
  changelog: { title: 'Changelog',           subtitle: 'Track what you work on each day' },
};

function App() {
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('devhub-theme') || 'dark');
  const [searchOpen, setSearchOpen] = useState(false);
  const meta = PAGE_META[page] || PAGE_META.dashboard;

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devhub-theme', theme);
  }, [theme]);

  // Ctrl+K shortcut
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(s => !s);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'snippets':  return <Snippets />;
      case 'tasks':     return <Tasks />;
      case 'notes':     return <Notes />;
      case 'api':       return <ApiTester />;
      case 'markdown':  return <MarkdownPreviewer />;
      case 'json':      return <JsonFormatter />;
      case 'pomodoro':  return <Pomodoro />;
      case 'bookmarks': return <Bookmarks />;
      case 'envvars':   return <EnvManager />;
      case 'projects':  return <Projects />;
      case 'changelog': return <Changelog />;
      default:          return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="logo-icon">
              <IconZap size={18} />
            </div>
            <div>
              <div className="logo-text">Dev<span>Hub</span></div>
              <div className="logo-badge">Developer Workspace</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* ── Dashboard standalone ── */}
          <button
            className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => setPage('dashboard')}
            style={{ marginBottom: '4px' }}
          >
            <span className="nav-item-icon"><IconHome size={16} /></span>
            Dashboard
          </button>

          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="nav-section-label">{group.label}</div>
              {group.items.map(item => (
                <button
                  key={item.key}
                  className={`nav-item ${page === item.key ? 'active' : ''}`}
                  onClick={() => setPage(item.key)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="topbar-actions">
            {/* Search trigger */}
            <button
              className="btn"
              onClick={() => setSearchOpen(true)}
              style={{
                width: '260px',
                justifyContent: 'flex-start',
                gap: '10px',
                color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                fontWeight: '500'
              }}
            >
              <IconSearch size={15} style={{ color: 'var(--text-muted)' }} />
              <span style={{ flex: 1, textAlign: 'left', fontSize: '13px' }}>Search workspace...</span>
              <span style={{ 
                fontFamily: "'JetBrains Mono', monospace", 
                fontSize: '10px', 
                padding: '2px 6px', 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border)', 
                borderRadius: '4px', 
                color: 'var(--text-muted)',
                fontWeight: '600'
              }}>
                Ctrl K
              </span>
            </button>

            {/* Theme toggle */}
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
          </div>
        </header>

        <main>
          {renderPage()}
        </main>
      </div>

      {/* ── Global Search Modal ── */}
      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          onNavigate={(p) => { setPage(p); setSearchOpen(false); }}
        />
      )}
    </div>
  );
}

export default App;

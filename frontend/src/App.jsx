import { useState } from 'react';
import './index.css';
import { BackendStatus } from './components/Shared';
import Dashboard from './components/Dashboard';
import Snippets from './components/Snippets';
import Tasks from './components/Tasks';
import Notes from './components/Notes';
import ApiTester from './components/ApiTester';
import {
  IconHome,
  IconClipboard,
  IconCheckSquare,
  IconFileText,
  IconGlobe,
  IconZap,
} from './components/Icons';

const NAV_ITEMS = [
  { key: 'dashboard', icon: <IconHome size={16} />,        label: 'Dashboard' },
  { key: 'snippets',  icon: <IconClipboard size={16} />,   label: 'Snippets' },
  { key: 'tasks',     icon: <IconCheckSquare size={16} />, label: 'Tasks' },
  { key: 'notes',     icon: <IconFileText size={16} />,    label: 'Notes' },
  { key: 'api',       icon: <IconGlobe size={16} />,       label: 'API Tester' },
];

const PAGE_META = {
  dashboard: { title: 'Dashboard',    subtitle: 'Overview of your dev workspace' },
  snippets:  { title: 'Code Snippets', subtitle: 'Reusable code fragments' },
  tasks:     { title: 'Task Board',   subtitle: 'Manage and track your work' },
  notes:     { title: 'Dev Notes',    subtitle: 'Ideas, references & documentation' },
  api:       { title: 'API Tester',   subtitle: 'Test HTTP endpoints live' },
};

function App() {
  const [page, setPage] = useState('dashboard');
  const meta = PAGE_META[page];

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'snippets':  return <Snippets />;
      case 'tasks':     return <Tasks />;
      case 'notes':     return <Notes />;
      case 'api':       return <ApiTester />;
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
          <div className="nav-section-label">Workspace</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`nav-item ${page === item.key ? 'active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <BackendStatus />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
              API: localhost:8000
            </div>
          </div>
        </header>

        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;

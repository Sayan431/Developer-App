import { useState } from 'react';
import { IconBraces, IconCopy, IconCheck, IconX, IconDownload } from './Icons';

function getStats(obj, depth = 0) {
  if (typeof obj !== 'object' || obj === null) return { keys: 0, depth };
  const keys = Object.keys(obj).length + (Array.isArray(obj) ? 0 : Object.keys(obj).length);
  let maxDepth = depth;
  let totalKeys = Array.isArray(obj) ? obj.length : Object.keys(obj).length;
  for (const val of Object.values(obj)) {
    if (typeof val === 'object' && val !== null) {
      const sub = getStats(val, depth + 1);
      maxDepth = Math.max(maxDepth, sub.depth);
      totalKeys += sub.keys;
    }
  }
  return { keys: totalKeys, depth: maxDepth };
}

function syntaxHighlight(json) {
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
      let cls = 'color:#f97316'; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'color:#a78bfa' : 'color:#34d399'; // key : string
      } else if (/true|false/.test(match)) {
        cls = 'color:#60a5fa';
      } else if (/null/.test(match)) {
        cls = 'color:#9ca3af';
      }
      return `<span style="${cls}">${match}</span>`;
    });
}

export default function JsonFormatter() {
  const [input, setInput]     = useState('');
  const [output, setOutput]   = useState('');
  const [error, setError]     = useState('');
  const [minify, setMinify]   = useState(false);
  const [stats, setStats]     = useState(null);
  const [copied, setCopied]   = useState(false);

  const format = (raw = input, mini = minify) => {
    if (!raw.trim()) { setOutput(''); setError(''); setStats(null); return; }
    try {
      const parsed = JSON.parse(raw);
      const formatted = mini
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      const s = getStats(parsed);
      setStats({
        keys:  s.keys,
        depth: s.depth,
        size:  new Blob([formatted]).size,
        type:  Array.isArray(parsed) ? `Array[${parsed.length}]` : 'Object',
      });
    } catch (e) {
      setError(e.message);
      setOutput('');
      setStats(null);
    }
  };

  const handleInput = (val) => {
    setInput(val);
    format(val, minify);
  };

  const toggleMinify = () => {
    const next = !minify;
    setMinify(next);
    format(input, next);
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'formatted.json';
    a.click();
  };

  const clear = () => { setInput(''); setOutput(''); setError(''); setStats(null); };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">JSON Formatter</h2>
          <p className="page-subtitle">Paste JSON to format, validate and analyze it</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${minify ? 'btn-primary' : 'btn-ghost'}`}
            onClick={toggleMinify}
            title="Toggle minified output"
          >
            {minify ? 'Prettify' : 'Minify'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={copy} disabled={!output}>
            {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={download} disabled={!output}>
            <IconDownload size={13} /> Save
          </button>
          <button className="btn btn-ghost btn-sm" onClick={clear}>
            <IconX size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
          <span style={{ color: 'var(--accent-green)' }}>✓ Valid JSON</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>Type: <strong style={{ color: 'var(--text-primary)' }}>{stats.type}</strong></span>
          <span style={{ color: 'var(--text-secondary)' }}>Keys: <strong style={{ color: 'var(--text-primary)' }}>{stats.keys}</strong></span>
          <span style={{ color: 'var(--text-secondary)' }}>Depth: <strong style={{ color: 'var(--text-primary)' }}>{stats.depth}</strong></span>
          <span style={{ color: 'var(--text-secondary)' }}>Size: <strong style={{ color: 'var(--text-primary)' }}>{stats.size} B</strong></span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--accent-red)' }}>
          <IconX size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
          <span><strong>Invalid JSON:</strong> {error}</span>
        </div>
      )}

      {/* Panes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: 'calc(100vh - 280px)', minHeight: '360px' }}>
        {/* Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }} />
            Raw Input
          </div>
          <textarea
            value={input}
            onChange={e => handleInput(e.target.value)}
            style={{ flex: 1, background: 'var(--bg-input)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px', color: 'var(--text-primary)', resize: 'none', outline: 'none', lineHeight: '1.7' }}
            placeholder={'Paste your JSON here…\n\n{\n  "example": true\n}'}
            onFocus={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.8)' : 'var(--accent-purple)'}
            onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}
          />
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconBraces size={12} />
            Formatted Output
          </div>
          <div
            style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px', lineHeight: '1.7', overflowY: 'auto', whiteSpace: 'pre', overflowX: 'auto' }}
            dangerouslySetInnerHTML={{ __html: output ? syntaxHighlight(output) : '<span style="color:var(--text-muted)">Formatted output will appear here…</span>' }}
          />
        </div>
      </div>
    </div>
  );
}

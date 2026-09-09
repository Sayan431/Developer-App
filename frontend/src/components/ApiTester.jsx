import { useState } from 'react';
import { testApi } from '../api';
import { StatusBadge } from './Shared';
import { IconSend, IconAlertCircle, IconGlobe } from './Icons';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_STYLES = {
  GET:    { color: 'var(--accent-green)',  bg: 'rgba(16,185,129,0.15)',  border: 'var(--accent-green)' },
  POST:   { color: 'var(--accent-blue)',   bg: 'rgba(59,130,246,0.15)',  border: 'var(--accent-blue)' },
  PUT:    { color: 'var(--accent-amber)',  bg: 'rgba(245,158,11,0.15)',  border: 'var(--accent-amber)' },
  PATCH:  { color: 'var(--accent-pink)',   bg: 'rgba(236,72,153,0.15)',  border: 'var(--accent-pink)' },
  DELETE: { color: 'var(--accent-red)',    bg: 'rgba(239,68,68,0.15)',   border: 'var(--accent-red)' },
};

const SAMPLE_REQUESTS = [
  { label: 'Posts — GET',    method: 'GET',  url: 'https://jsonplaceholder.typicode.com/posts/1', headers: '', body: '' },
  { label: 'Posts — Create', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', headers: 'Content-Type: application/json', body: '{"title":"foo","body":"bar","userId":1}' },
  { label: 'HTTPBin — GET',  method: 'GET',  url: 'https://httpbin.org/get', headers: '', body: '' },
  { label: 'HTTPBin — POST', method: 'POST', url: 'https://httpbin.org/post', headers: '', body: '{"hello":"world"}' },
  { label: 'DevHub Health',  method: 'GET',  url: 'http://localhost:8000/health', headers: '', body: '' },
];

export default function ApiTester() {
  const [method,  setMethod]  = useState('GET');
  const [url,     setUrl]     = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState('');
  const [body,    setBody]    = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const parseHeaders = (raw) => {
    const obj = {};
    raw.split('\n').forEach(line => {
      const [k, ...v] = line.split(':');
      if (k?.trim()) obj[k.trim()] = v.join(':').trim();
    });
    return obj;
  };

  const handleSend = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await testApi({ method, url, headers: parseHeaders(headers), body: body || null });
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (s) => {
    setMethod(s.method);
    setUrl(s.url);
    setHeaders(s.headers);
    setBody(s.body);
    setResult(null);
    setError(null);
  };

  const prettyJson = (v) => {
    try { return JSON.stringify(typeof v === 'string' ? JSON.parse(v) : v, null, 2); }
    catch { return String(v); }
  };

  const currentMethodStyle = METHOD_STYLES[method] || {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">API Tester</h2>
          <p className="page-subtitle">Test HTTP endpoints directly from your dashboard</p>
        </div>
      </div>

      {/* Sample Requests */}
      <div style={{ marginBottom: '20px' }}>
        <div className="form-label" style={{ marginBottom: '8px' }}>Quick Load</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SAMPLE_REQUESTS.map(s => {
            const ms = METHOD_STYLES[s.method] || {};
            return (
              <button key={s.label} className="btn btn-ghost btn-sm" onClick={() => loadSample(s)}>
                <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: ms.color }}>
                  {s.method}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="api-tester-grid">
        {/* Request Panel */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="form-label" style={{ marginBottom: '10px' }}>HTTP Method</div>
            <div className="method-select">
              {METHODS.map(m => {
                const ms = METHOD_STYLES[m];
                const isActive = method === m;
                return (
                  <button
                    key={m}
                    className="method-btn"
                    style={isActive ? {
                      background: ms.bg,
                      color: ms.color,
                      borderColor: ms.border,
                    } : {}}
                    onClick={() => setMethod(m)}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            <div className="form-group">
              <label className="form-label">URL</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* method pill inline */}
                <span style={{
                  fontSize: '11px', fontFamily: 'JetBrains Mono', fontWeight: 700,
                  padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                  background: currentMethodStyle.bg, color: currentMethodStyle.color,
                  border: `1px solid ${currentMethodStyle.border}`,
                  whiteSpace: 'nowrap',
                }}>
                  {method}
                </span>
                <input
                  className="form-input mono"
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Headers (one per line: Key: Value)</label>
              <textarea
                className="form-textarea code-textarea"
                style={{ minHeight: '80px' }}
                placeholder={'Authorization: Bearer token\nContent-Type: application/json'}
                value={headers}
                onChange={e => setHeaders(e.target.value)}
              />
            </div>

            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="form-group">
                <label className="form-label">Request Body (JSON)</label>
                <textarea
                  className="form-textarea code-textarea"
                  placeholder='{"key": "value"}'
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSend}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Sending…</>
                : <><IconSend size={13} /> Send Request</>
              }
            </button>
          </div>
        </div>

        {/* Response Panel */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="form-label">Response</div>
              {result && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusBadge code={result.status_code} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    {result.elapsed_ms}ms
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '12px',
                color: 'var(--accent-red)', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <IconAlertCircle size={14} /> {error}
              </div>
            )}

            <pre className="response-panel">
              {loading
                ? 'Sending request…'
                : result
                  ? prettyJson(result.body)
                  : 'Send a request to see the response here'}
            </pre>

            {result && (
              <details style={{ marginTop: '12px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)', userSelect: 'none' }}>
                  Response Headers ({Object.keys(result.headers).length})
                </summary>
                <pre className="response-panel" style={{ marginTop: '8px', minHeight: 'auto', maxHeight: '150px' }}>
                  {Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

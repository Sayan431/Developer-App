import { useState, useCallback } from 'react';
import { IconEye, IconCopy, IconCheck, IconX, IconDownload } from './Icons';

// Lightweight built-in markdown parser
function parseMarkdown(md) {
  if (!md) return '';
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Fenced code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre style="background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:14px;overflow-x:auto;"><code style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#a9b1d6;">${code.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-input);padding:2px 6px;border-radius:4px;font-family:\'JetBrains Mono\',monospace;font-size:0.9em;color:var(--accent-cyan);">$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;margin:20px 0 8px;color:var(--text-primary);">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:700;margin:24px 0 10px;color:var(--text-primary);">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:26px;font-weight:800;margin:24px 0 12px;color:var(--text-primary);">$1</h1>')
    // Bold / Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid var(--accent-purple);padding:8px 14px;margin:12px 0;color:var(--text-secondary);font-style:italic;">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:20px 0;">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent-purple);text-decoration:underline;">$1</a>')
    // Unordered list
    .replace(/^\- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>)/gs, '<ul style="padding-left:20px;margin:10px 0;">$1</ul>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;">$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p style="margin:10px 0;line-height:1.7;color:var(--text-secondary);">')
    // Single newlines
    .replace(/\n/g, '<br/>');

  return `<p style="margin:10px 0;line-height:1.7;color:var(--text-secondary);">${html}</p>`;
}

const SAMPLE = `# Welcome to Markdown Previewer

Write **bold**, *italic*, or ~~strikethrough~~ text.

## Code Example

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('DevHub'));
\`\`\`

Inline \`code\` also works.

## Lists

- Feature one
- Feature two
- Feature three

> Blockquotes look great for callouts.

[Visit DevHub](https://github.com)
`;

export default function MarkdownPreviewer() {
  const [source, setSource] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const charCount  = source.length;
  const wordCount  = source.trim() ? source.trim().split(/\s+/).length : 0;
  const lineCount  = source.split('\n').length;

  const copy = () => {
    navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([source], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.md';
    a.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Markdown Previewer</h2>
          <p className="page-subtitle">Write markdown on the left, see it rendered on the right</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={copy}>
            {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            {copied ? 'Copied!' : 'Copy source'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={download}>
            <IconDownload size={13} /> Download .md
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSource('')}>
            <IconX size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span><strong style={{ color: 'var(--text-secondary)' }}>{charCount}</strong> characters</span>
        <span><strong style={{ color: 'var(--text-secondary)' }}>{wordCount}</strong> words</span>
        <span><strong style={{ color: 'var(--text-secondary)' }}>{lineCount}</strong> lines</span>
      </div>

      {/* Split pane */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: 'calc(100vh - 260px)', minHeight: '400px' }}>
        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }} />
            Markdown Source
          </div>
          <textarea
            value={source}
            onChange={e => setSource(e.target.value)}
            style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--text-primary)', resize: 'none', outline: 'none', lineHeight: '1.7', tabSize: 2 }}
            placeholder="Write your markdown here…"
            onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconEye size={12} />
            Preview
          </div>
          <div
            style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(source) }}
          />
        </div>
      </div>
    </div>
  );
}

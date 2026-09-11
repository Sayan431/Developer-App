import { useState, useEffect } from 'react';
import { getEnvSets, createEnvSet, updateEnvSet, deleteEnvSet } from '../api';
import { EmptyState } from './Shared';
import { IconPlus, IconTrash, IconEdit, IconEye, IconEyeOff, IconCopy, IconCheck, IconKey, IconDownload, IconX } from './Icons';

function EnvSetForm({ initial = {}, onSave, onClose }) {
  const [name, setName] = useState(initial.project_name || '');
  const [vars, setVars] = useState(
    (initial.vars || []).length > 0
      ? initial.vars
      : [{ key: '', value: '', secret: false }]
  );

  const addRow = () => setVars([...vars, { key: '', value: '', secret: false }]);
  const removeRow = (i) => setVars(vars.filter((_, idx) => idx !== i));
  const update = (i, field, val) => setVars(vars.map((v, idx) => idx === i ? { ...v, [field]: val } : v));

  const handleSave = () => {
    if (!name.trim()) return alert('Project name is required.');
    const valid = vars.filter(v => v.key.trim());
    onSave({ project_name: name, vars: valid });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{initial.id ? 'Edit Env Set' : 'New Env Set'}</h3>
          <button className="modal-close" onClick={onClose}><IconX size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" placeholder="my-project" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '8px' }}>Variables</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {vars.map((v, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '6px', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    placeholder="KEY"
                    value={v.key}
                    onChange={e => update(i, 'key', e.target.value)}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                  />
                  <input
                    className="form-input"
                    placeholder="value"
                    type={v.secret ? 'password' : 'text'}
                    value={v.value}
                    onChange={e => update(i, 'value', e.target.value)}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                  />
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => update(i, 'secret', !v.secret)}
                    title={v.secret ? 'Mark as public' : 'Mark as secret'}
                  >
                    {v.secret ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeRow(i)}>
                    <IconTrash size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }} onClick={addRow}>
              <IconPlus size={13} /> Add variable
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function EnvCard({ envset, onEdit, onDelete, onCopyAll, onExport }) {
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied]     = useState(null);

  const copyVal = (key, val) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleReveal = (key) => setRevealed(r => ({ ...r, [key]: !r[key] }));

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconKey size={16} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px' }}>{envset.project_name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(envset.vars || []).length} variable{(envset.vars || []).length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onExport(envset)} title="Export .env file">
            <IconDownload size={12} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onCopyAll(envset)} title="Copy all as .env">
            <IconCopy size={12} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(envset)}>
            <IconEdit size={13} />
          </button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(envset.id)}>
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(envset.vars || []).map((v, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto auto', gap: '8px', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--accent-purple)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.key}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.secret && !revealed[v.key] ? '••••••••••••' : v.value}
            </span>
            {v.secret && (
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleReveal(v.key)} style={{ padding: '4px' }}>
                {revealed[v.key] ? <IconEyeOff size={12} /> : <IconEye size={12} />}
              </button>
            )}
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => copyVal(v.key, v.value)} style={{ padding: '4px' }}>
              {copied === v.key ? <IconCheck size={12} /> : <IconCopy size={12} />}
            </button>
          </div>
        ))}
        {!(envset.vars || []).length && (
          <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No variables added yet</div>
        )}
      </div>
    </div>
  );
}

export default function EnvManager() {
  const [envsets, setEnvsets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);

  const load = () =>
    getEnvSets().then(setEnvsets).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (modal?.id) await updateEnvSet(modal.id, data);
    else            await createEnvSet(data);
    setModal(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this env set?')) return;
    await deleteEnvSet(id); load();
  };

  const handleCopyAll = (envset) => {
    const text = (envset.vars || []).map(v => `${v.key}=${v.value}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleExport = (envset) => {
    const text = (envset.vars || []).map(v => `${v.key}=${v.value}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${envset.project_name}.env`;
    a.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Env Variables</h2>
          <p className="page-subtitle">Manage environment variables per project</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <IconPlus size={14} /> New Env Set
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : envsets.length === 0 ? (
        <EmptyState icon={<IconKey size={40} />} title="No env sets yet" desc="Create env sets to manage variables across your projects." />
      ) : (
        <div className="grid-2">
          {envsets.map(es => (
            <EnvCard
              key={es.id}
              envset={es}
              onEdit={setModal}
              onDelete={handleDelete}
              onCopyAll={handleCopyAll}
              onExport={handleExport}
            />
          ))}
        </div>
      )}

      {modal && (
        <EnvSetForm
          initial={modal === 'new' ? {} : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

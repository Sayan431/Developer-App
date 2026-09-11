import { useState, useEffect, useRef, useCallback } from 'react';
import { IconTimer, IconPlay, IconPause, IconRotateCcw, IconCheck } from './Icons';

const MODES = [
  { key: 'focus',  label: 'Focus',       minutes: 25, color: '#6c63ff' },
  { key: 'short',  label: 'Short Break', minutes: 5,  color: '#10b981' },
  { key: 'long',   label: 'Long Break',  minutes: 15, color: '#3b82f6' },
  { key: 'custom', label: 'Custom',      minutes: 30, color: '#f59e0b' },
];

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (_) {}
}

const RADIUS = 90;
const CIRC   = 2 * Math.PI * RADIUS;

export default function Pomodoro() {
  const [modeIdx, setModeIdx]       = useState(0);
  const [customMin, setCustomMin]   = useState(30);
  const [seconds, setSeconds]       = useState(MODES[0].minutes * 60);
  const [running, setRunning]       = useState(false);
  const [sessions, setSessions]     = useState(0);
  const [completed, setCompleted]   = useState(false);
  const intervalRef                 = useRef(null);

  const mode    = MODES[modeIdx];
  const total   = (mode.key === 'custom' ? customMin : mode.minutes) * 60;
  const pct     = seconds / total;
  const dashoffset = CIRC * (1 - pct);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const notify = useCallback(() => {
    beep();
    setCompleted(true);
    if (Notification.permission === 'granted') {
      new Notification('DevHub Pomodoro', { body: `${mode.label} session complete! 🎉`, icon: '/favicon.ico' });
    }
    if (mode.key === 'focus') setSessions(s => s + 1);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); notify(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, notify]);

  const selectMode = (i) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setCompleted(false);
    setModeIdx(i);
    const m = MODES[i];
    setSeconds((m.key === 'custom' ? customMin : m.minutes) * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setCompleted(false);
    setSeconds(total);
  };

  const toggle = () => {
    if (completed) { reset(); return; }
    if (Notification.permission === 'default') Notification.requestPermission();
    setRunning(r => !r);
  };

  const handleCustomChange = (val) => {
    const m = Math.max(1, Math.min(120, Number(val)));
    setCustomMin(m);
    if (!running) setSeconds(m * 60);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Pomodoro Timer</h2>
          <p className="page-subtitle">Stay focused with timed work sessions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: '13px' }}>
          <IconCheck size={14} style={{ color: 'var(--accent-green)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Sessions completed:</span>
          <strong style={{ color: 'var(--accent-green)', fontSize: '16px' }}>{sessions}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', paddingTop: '20px' }}>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '6px' }}>
          {MODES.map((m, i) => (
            <button
              key={m.key}
              onClick={() => selectMode(i)}
              style={{
                padding: '8px 18px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                background: modeIdx === i ? m.color : 'none',
                color: modeIdx === i ? '#fff' : 'var(--text-secondary)',
                fontFamily: 'Inter, sans-serif', fontWeight: '600', fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Custom minutes input */}
        {mode.key === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <label>Duration:</label>
            <input
              type="number" min="1" max="120"
              value={customMin}
              onChange={e => handleCustomChange(e.target.value)}
              style={{ width: '70px', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'Inter', textAlign: 'center', outline: 'none' }}
            />
            <span>minutes</span>
          </div>
        )}

        {/* Circular timer */}
        <div style={{ position: 'relative', width: '260px', height: '260px' }}>
          <svg width="260" height="260" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="130" cy="130" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="130" cy="130" r={RADIUS}
              fill="none"
              stroke={completed ? 'var(--accent-green)' : mode.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
            />
          </svg>
          {/* Time display */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <div style={{ fontSize: '52px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-2px', color: completed ? 'var(--accent-green)' : 'var(--text-primary)' }}>
              {mm}:{ss}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {completed ? '🎉 Done!' : mode.label}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={reset}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
            title="Reset"
          >
            <IconRotateCcw size={18} />
          </button>

          <button
            onClick={toggle}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              border: 'none',
              background: completed ? 'var(--accent-green)' : running ? `rgba(${mode.key === 'focus' ? '108,99,255' : mode.key === 'short' ? '16,185,129' : '59,130,246'},0.9)` : mode.color,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: `0 0 24px ${mode.color}50`,
              transition: 'all 0.2s',
            }}
            title={running ? 'Pause' : 'Start'}
          >
            {running ? <IconPause size={26} /> : <IconPlay size={26} fill="#fff" />}
          </button>

          <div style={{ width: '48px', height: '48px' }} /> {/* Spacer */}
        </div>

        {/* Tips */}
        <div style={{ maxWidth: '400px', padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6' }}>
          💡 Work for <strong style={{ color: 'var(--text-secondary)' }}>25 minutes</strong>, then take a <strong style={{ color: 'var(--text-secondary)' }}>5-minute break</strong>. After <strong style={{ color: 'var(--text-secondary)' }}>4 sessions</strong>, take a <strong style={{ color: 'var(--text-secondary)' }}>15-minute break</strong>.
        </div>
      </div>
    </div>
  );
}

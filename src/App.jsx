import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import * as XLSX from "xlsx";

const SUPABASE_URL = "https://ygxmiuguerjdrgfubvwu.supabase.co";
const SUPABASE_KEY = "sb_publishable_2BJPARkVzhGvDqKkb5Bx5Q_cSqd4iTg";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0d0f0e; --surface: #151816; --card: #1b1e1c; --border: #2a2e2b;
    --accent: #b5f23e; --accent2: #3ef2a0; --danger: #f25a3e; --warn: #f2a53e;
    --text: #e8ede9; --muted: #6b7570;
    --font-h: 'Syne', sans-serif; --font-b: 'DM Sans', sans-serif; --r: 12px;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-b); min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  input, button, select { font-family: var(--font-b); } button { cursor: pointer; border: none; background: none; } input { outline: none; }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px 0; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; overflow-y: auto; }
  .sidebar-logo { padding: 0 20px 28px; font-family: var(--font-h); font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--accent); }
  .sidebar-logo span { color: var(--text); }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 20px; font-size: 13.5px; color: var(--muted); cursor: pointer; border-left: 2px solid transparent; transition: all 0.15s; user-select: none; }
  .nav-item:hover { color: var(--text); background: rgba(181,242,62,0.04); }
  .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(181,242,62,0.06); }
  .nav-icon { font-size: 16px; width: 18px; text-align: center; }
  .nav-section { font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); padding: 18px 20px 6px; opacity: 0.5; }
  .sidebar-bottom { margin-top: auto; padding: 0 20px; }
  .logout-btn { width: 100%; padding: 10px 14px; border-radius: var(--r); font-size: 13px; color: var(--muted); background: var(--card); border: 1px solid var(--border); display: flex; align-items: center; gap: 8px; transition: all 0.15s; }
  .logout-btn:hover { color: var(--danger); border-color: var(--danger); }
  .user-info { font-size: 11px; color: var(--muted); margin-bottom: 10px; padding: 8px 12px; background: var(--card); border-radius: var(--r); border: 1px solid var(--border); word-break: break-all; }
  .main { margin-left: 220px; flex: 1; padding: 36px 40px; min-height: 100vh; }
  .page-header { margin-bottom: 32px; }
  .page-title { font-family: var(--font-h); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .page-sub { font-size: 13px; color: var(--muted); margin-top: 4px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 22px; }
  .card-title { font-family: var(--font-h); font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; }
  .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .stat-value { font-family: var(--font-h); font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .stat-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 3px 8px; border-radius: 99px; margin-top: 8px; }
  .badge-up { background: rgba(62,242,160,0.12); color: var(--accent2); }
  .badge-down { background: rgba(242,90,62,0.12); color: var(--danger); }
  .badge-neutral { background: rgba(107,117,112,0.2); color: var(--muted); }
  .badge-warn { background: rgba(242,165,62,0.12); color: var(--warn); }
  .input-group { margin-bottom: 16px; }
  .input-label { font-size: 12px; color: var(--muted); margin-bottom: 6px; display: block; letter-spacing: 0.3px; }
  .input-field { width: 100%; padding: 11px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); color: var(--text); font-size: 14px; transition: border-color 0.15s; }
  .input-field:focus { border-color: var(--accent); }
  .input-field::placeholder { color: var(--muted); }
  .btn { padding: 11px 22px; border-radius: var(--r); font-size: 13.5px; font-weight: 500; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--accent); color: #0d0f0e; font-weight: 700; }
  .btn-primary:hover { background: #c8f55a; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-secondary { background: var(--card); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background: rgba(242,90,62,0.15); color: var(--danger); border: 1px solid rgba(242,90,62,0.25); }
  .btn-danger:hover { background: rgba(242,90,62,0.25); }
  .btn-warn { background: rgba(242,165,62,0.15); color: var(--warn); border: 1px solid rgba(242,165,62,0.25); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--border); font-weight: 500; }
  td { padding: 12px 14px; font-size: 13.5px; border-bottom: 1px solid rgba(42,46,43,0.5); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); background-image: radial-gradient(circle at 20% 50%, rgba(181,242,62,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(62,242,160,0.04) 0%, transparent 40%); }
  .login-card { width: 400px; background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 40px; }
  .login-logo { font-family: var(--font-h); font-size: 22px; font-weight: 800; color: var(--accent); margin-bottom: 6px; }
  .login-sub { font-size: 13px; color: var(--muted); margin-bottom: 32px; }
  .login-footer { font-size: 12px; color: var(--muted); text-align: center; margin-top: 20px; }
  .login-footer a { color: var(--accent); cursor: pointer; }
  .scanner-area { border: 2px dashed var(--border); border-radius: var(--r); padding: 24px; text-align: center; transition: border-color 0.2s; cursor: pointer; }
  .scanner-area.active { border-color: var(--accent); background: rgba(181,242,62,0.04); }
  .scanner-feedback { margin-top: 12px; padding: 10px 14px; border-radius: var(--r); font-size: 13px; font-weight: 500; }
  .feedback-success { background: rgba(62,242,160,0.1); color: var(--accent2); border: 1px solid rgba(62,242,160,0.2); }
  .feedback-error { background: rgba(242,90,62,0.1); color: var(--danger); border: 1px solid rgba(242,90,62,0.25); }
  .forecast-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
  .fp-up { background: rgba(62,242,160,0.12); color: var(--accent2); border: 1px solid rgba(62,242,160,0.2); }
  .fp-down { background: rgba(242,90,62,0.12); color: var(--danger); border: 1px solid rgba(242,90,62,0.2); }
  .custom-tooltip { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-size: 12px; }
  .tooltip-label { color: var(--muted); margin-bottom: 4px; }
  .tooltip-value { font-family: var(--font-h); font-size: 16px; font-weight: 700; color: var(--accent); }
  .tooltip-pred { font-family: var(--font-h); font-size: 14px; font-weight: 600; color: var(--accent2); }
  .alert { padding: 12px 16px; border-radius: var(--r); font-size: 13px; margin-bottom: 16px; }
  .alert-success { background: rgba(62,242,160,0.08); color: var(--accent2); border: 1px solid rgba(62,242,160,0.2); }
  .alert-error { background: rgba(242,90,62,0.08); color: var(--danger); border: 1px solid rgba(242,90,62,0.2); }
  .alert-info { background: rgba(181,242,62,0.08); color: var(--accent); border: 1px solid rgba(181,242,62,0.2); }
  .alert-warn { background: rgba(242,165,62,0.08); color: var(--warn); border: 1px solid rgba(242,165,62,0.2); }
  .stock-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 500; }
  .stock-ok { background: rgba(62,242,160,0.1); color: var(--accent2); }
  .stock-low { background: rgba(242,165,62,0.12); color: #f2a53e; }
  .stock-out { background: rgba(242,90,62,0.12); color: var(--danger); }
  .exp-ok { background: rgba(62,242,160,0.1); color: var(--accent2); }
  .exp-soon { background: rgba(242,165,62,0.12); color: var(--warn); }
  .exp-expired { background: rgba(242,90,62,0.12); color: var(--danger); }
  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; background: var(--bg); }
  .tab-row { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .tab-btn { padding: 8px 18px; border-radius: var(--r); font-size: 13px; font-weight: 500; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; transition: all 0.15s; }
  .tab-btn.active { background: var(--accent); color: #0d0f0e; font-weight: 700; border-color: var(--accent); }
  .tab-btn:hover:not(.active) { border-color: var(--accent); color: var(--accent); }
  .item-row { display: grid; grid-template-columns: 2fr 1fr 1fr 80px 36px; gap: 8px; align-items: center; margin-bottom: 8px; }
  .item-row-header { display: grid; grid-template-columns: 2fr 1fr 1fr 80px 36px; gap: 8px; margin-bottom: 6px; }
  .total-box { background: var(--surface); border: 1px solid var(--accent); border-radius: var(--r); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
  .total-label { font-size: 13px; color: var(--muted); }
  .total-value { font-family: var(--font-h); font-size: 24px; font-weight: 800; color: var(--accent); }
  .empty-state { text-align: center; padding: 48px 24px; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-family: var(--font-h); font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .empty-sub { color: var(--muted); font-size: 13px; margin-bottom: 20px; }
  .search-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: var(--card); border: 1px solid var(--border); border-radius: var(--r); z-index: 50; max-height: 200px; overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  .search-option { padding: 10px 14px; font-size: 13px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .search-option:last-child { border-bottom: none; }
  .search-option:hover { background: rgba(181,242,62,0.06); color: var(--accent); }
  .pos-wrap { display: grid; grid-template-columns: 1fr 360px; gap: 20px; min-height: 70vh; }
  .pos-cart { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); display: flex; flex-direction: column; }
  .pos-cart-header { padding: 16px 20px; border-bottom: 1px solid var(--border); font-family: var(--font-h); font-weight: 700; font-size: 15px; }
  .pos-cart-items { flex: 1; overflow-y: auto; padding: 12px; }
  .pos-cart-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; margin-bottom: 6px; background: var(--surface); border: 1px solid var(--border); }
  .pos-cart-item-name { flex: 1; font-size: 13.5px; font-weight: 500; }
  .pos-cart-item-price { font-family: var(--font-h); font-weight: 700; color: var(--accent); font-size: 14px; min-width: 70px; text-align: right; }
  .pos-cart-footer { padding: 16px 20px; border-top: 1px solid var(--border); }
  .pos-total { font-family: var(--font-h); font-size: 28px; font-weight: 800; color: var(--accent); margin-bottom: 12px; }
  .pos-total-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .qty-control { display: flex; align-items: center; gap: 4px; }
  .qty-btn { width: 26px; height: 26px; border-radius: 6px; background: var(--border); color: var(--text); font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: background 0.1s; }
  .qty-btn:hover { background: var(--accent); color: #0d0f0e; }
  .qty-num { font-family: var(--font-h); font-weight: 700; font-size: 14px; min-width: 24px; text-align: center; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; width: 100%; max-width: 480px; }
  .modal-title { font-family: var(--font-h); font-size: 18px; font-weight: 800; margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .help-step { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; }
  .help-num { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: #0d0f0e; font-family: var(--font-h); font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .help-text { flex: 1; }
  .help-text strong { font-weight: 600; color: var(--text); display: block; margin-bottom: 4px; }
  .help-text span { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .drop-zone { border: 2px dashed var(--border); border-radius: var(--r); padding: 32px; text-align: center; transition: all 0.2s; cursor: pointer; }
  .drop-zone.drag-over { border-color: var(--accent); background: rgba(181,242,62,0.04); }
  @media print {
    .sidebar, .no-print { display: none !important; }
    .main { margin-left: 0 !important; padding: 0 !important; }
    body { background: white !important; color: black !important; }
    .card { border: 1px solid #ccc !important; background: white !important; }
    table { font-size: 11px !important; }
    th, td { color: black !important; border-color: #ccc !important; }
  }
  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .sidebar { width: 60px; }
    .sidebar-logo, .nav-item span, .nav-section, .user-info { display: none; }
    .main { margin-left: 60px; padding: 24px 16px; }
    .grid-2 { grid-template-columns: 1fr; }
    .pos-wrap { grid-template-columns: 1fr; }
    .item-row { grid-template-columns: 1fr 60px 60px 60px 36px; }
  }
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.actual || 0 };
  const xs = points.map((_, i) => i), ys = points.map((p) => p.actual);
  const sumX = xs.reduce((a, b) => a + b, 0), sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0), sumXX = xs.reduce((a, x) => a + x * x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  return { slope, intercept: (sumY - slope * sumX) / n };
}

function buildChartData(history, forecastDays = 7) {
  if (!history.length) return { chartData: [], slope: 0 };
  const recent = history.slice(-14);
  const { slope, intercept } = linearRegression(recent);
  const base = history.map((h, i) => ({ ...h, line: Math.round(intercept + slope * i) }));
  const lastDate = new Date();
  for (let i = 1; i <= forecastDays; i++) {
    const d = new Date(); d.setDate(lastDate.getDate() + i);
    base.push({ date: d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }), actual: null, predicted: Math.max(0, Math.round(intercept + slope * (recent.length - 1 + i))) });
  }
  return { chartData: base, slope };
}

function expiryStatus(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const exp = new Date(dateStr);
  const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { cls: "exp-expired", label: "Expired", days: diff };
  if (diff <= 7) return { cls: "exp-soon", label: `Expires in ${diff}d`, days: diff };
  return { cls: "exp-ok", label: `Exp: ${exp.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`, days: diff };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === "actual");
  const pred = payload.find((p) => p.dataKey === "predicted");
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {actual?.value != null && <div className="tooltip-value">₱{actual.value.toLocaleString()}</div>}
      {pred?.value != null && <div className="tooltip-pred">Forecast: ₱{pred.value.toLocaleString()}</div>}
    </div>
  );
}

function ProductSearch({ products, value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const filtered = products.filter(p => p.name.toLowerCase().includes(value.toLowerCase()) || p.barcode?.includes(value));
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <input className="input-field" placeholder="Search product..." value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} />
      {open && filtered.length > 0 && (
        <div className="search-dropdown">
          {filtered.map(p => (
            <div key={p.id} className="search-option" onMouseDown={() => { onSelect(p); setOpen(false); }}>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
              <span style={{ color: "var(--accent)", marginLeft: 8 }}>₱{p.price}</span>
              <span style={{ color: "var(--muted)", fontSize: 11, marginLeft: 8 }}>{p.stock} left</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PASSWORD CONFIRM MODAL ────────────────────────────────────────────────────
function PasswordModal({ title, subtitle, onConfirm, onCancel, recordPin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  const confirm = () => {
    if (!pw) return setErr("Enter your record protection password.");
    if (!recordPin) return setErr("No record protection password set. Please set one in Settings first.");
    if (pw !== recordPin) { setErr("Wrong password. Try again."); return; }
    onConfirm();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🔐 {title}</div>
        <div className="modal-sub">{subtitle}</div>
        {!recordPin && <div className="alert alert-warn">⚠️ No record protection password set yet. Go to Settings to create one first.</div>}
        <div className="input-group">
          <label className="input-label">Record protection password</label>
          <div style={{ position: "relative" }}>
            <input className="input-field" type={show ? "text" : "password"} placeholder="••••••••" value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              autoFocus style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16, padding: 4 }}>{show ? "🙈" : "👁️"}</button>
          </div>
        </div>
        {err && <div className="alert alert-error">{err}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={confirm}>Confirm →</button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", storeName: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async () => {
    setErr(""); setLoading(true);
    try {
      if (!form.email || !form.password) { setErr("Please fill in all fields."); return; }
      if (mode === "register") {
        if (!form.storeName) { setErr("Enter your store name."); return; }
        const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (error) { setErr(error.message); return; }
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, store_name: form.storeName });
          onLogin({ ...data.user, storeName: form.storeName });
        } else { setErr("Check your email to confirm your account, then sign in."); }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) { setErr(error.message); return; }
        const { data: profile } = await supabase.from("profiles").select("store_name").eq("id", data.user.id).single();
        onLogin({ ...data.user, storeName: profile?.store_name || data.user.email });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">SalesForecast</div>
        <div className="login-sub">{mode === "login" ? "Sign in to your store" : "Create your store account"}</div>
        {err && <div className="alert alert-error">{err}</div>}
        {mode === "register" && (
          <div className="input-group">
            <label className="input-label">Store name</label>
            <input className="input-field" placeholder="Aling Nena's Sari-Sari" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input-field" type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handle()} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <div style={{ position: "relative" }}>
            <input className="input-field" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handle()} style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16, padding: 4 }}>{showPass ? "🙈" : "👁️"}</button>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 8, justifyContent: "center" }} onClick={handle} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in →" : "Create account →"}
        </button>
        <div className="login-footer">
          {mode === "login" ? <>No account? <a onClick={() => setMode("register")}>Register free</a></> : <>Already have one? <a onClick={() => setMode("login")}>Sign in</a></>}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ sales, products }) {
  const history = sales.map(s => ({ date: s.date, actual: s.amount }));
  const { chartData, slope } = buildChartData(history, 7);
  const trending = slope >= 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const todaySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + (s.amount || 0), 0);
  const yesterdaySales = sales.filter(s => s.date === yesterday).reduce((sum, s) => sum + (s.amount || 0), 0);
  const weekTotal = sales.filter(s => { const d = new Date(s.date); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; }).reduce((sum, s) => sum + (s.amount || 0), 0);
  const pct = yesterdaySales ? (((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1) : 0;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.low_threshold).length;
  const outStock = products.filter((p) => p.stock === 0).length;
  const expiredSoon = products.filter(p => { const s = expiryStatus(p.expiry_date); return s && s.days <= 7; }).length;

  return (
    <div>
      <div className="page-header"><div className="page-title">Dashboard</div><div className="page-sub">Sales overview and 7-day forecast</div></div>
      {expiredSoon > 0 && <div className="alert alert-warn" style={{ marginBottom: 20 }}>⚠️ {expiredSoon} product{expiredSoon > 1 ? "s" : ""} expiring within 7 days! Check your Inventory.</div>}
      {sales.length === 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No sales data yet</div>
            <div className="empty-sub">Start recording your daily sales to see forecasts and trends here.</div>
            <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>→ Go to "Record Sales" or use the POS to start selling</div>
          </div>
        </div>
      )}
      {sales.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Today's Sales</div><div className="stat-value" style={{ color: "var(--accent)" }}>₱{todaySales.toLocaleString()}</div><div className={`stat-badge ${Number(pct) >= 0 ? "badge-up" : "badge-down"}`}>{Number(pct) >= 0 ? "▲" : "▼"} {Math.abs(pct)}% vs yesterday</div></div>
          <div className="stat-card"><div className="stat-label">This Week</div><div className="stat-value">₱{weekTotal.toLocaleString()}</div><div className="stat-badge badge-neutral">Last 7 days</div></div>
          <div className="stat-card"><div className="stat-label">Sales Trend</div><div className="stat-value" style={{ color: trending ? "var(--accent2)" : "var(--danger)", fontSize: 20 }}>{trending ? "↑ Going up" : "↓ Going down"}</div><div className={`stat-badge ${trending ? "badge-up" : "badge-down"}`}>{trending ? "Positive" : "Negative"} slope</div></div>
          <div className="stat-card"><div className="stat-label">Stock Alerts</div><div className="stat-value" style={{ color: outStock > 0 ? "var(--danger)" : "var(--accent2)" }}>{lowStock + outStock}</div><div className="stat-badge badge-down">{outStock} out · {lowStock} low</div></div>
        </div>
      )}
      {sales.length >= 3 && (
        <div className="card">
          <div className="card-title">Sales history + 7-day forecast</div>
          <div className={`forecast-pill ${trending ? "fp-up" : "fp-down"}`}>{trending ? "📈 Sales predicted to go UP next week" : "📉 Sales predicted to go DOWN next week"}</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#6b7570", fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: "#6b7570", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={history[history.length - 1]?.date} stroke="rgba(181,242,62,0.3)" strokeDasharray="4 4" label={{ value: "Today", fill: "#b5f23e", fontSize: 11 }} />
              <Line type="monotone" dataKey="actual" stroke="#b5f23e" strokeWidth={2} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="#3ef2a0" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            <span><span style={{ color: "var(--accent)" }}>—</span> Actual sales</span>
            <span><span style={{ color: "var(--accent2)" }}>- -</span> Predicted (7 days, based on last 14 days)</span>
          </div>
        </div>
      )}
      {sales.length > 0 && sales.length < 3 && (
        <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
          <div style={{ fontFamily: "var(--font-h)", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Almost there!</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Add at least 3 days of sales data to see your forecast. You have {sales.length} so far!</div>
        </div>
      )}
    </div>
  );
}

// ── POS PAGE ──────────────────────────────────────────────────────────────────
function POSPage({ products, onUpdateProducts, onAddSale, userId }) {
  const [cart, setCart] = useState([]);
  const [scanCode, setScanCode] = useState("");
  const [scanFocus, setScanFocus] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const scanRef = useRef();
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const addToCart = useCallback((prod) => {
    if (prod.stock <= 0) { setFeedback({ type: "error", text: `${prod.name} is out of stock!` }); setTimeout(() => setFeedback(null), 2500); return; }
    setCart(prev => {
      const existing = prev.find(i => i.id === prod.id);
      if (existing) {
        if (existing.qty >= prod.stock) { setFeedback({ type: "error", text: `Only ${prod.stock} left!` }); setTimeout(() => setFeedback(null), 2500); return prev; }
        return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...prod, qty: 1 }];
    });
    setFeedback({ type: "success", text: `✓ ${prod.name} added` });
    setTimeout(() => setFeedback(null), 1500);
  }, [products]);

  const handleScan = useCallback((code) => {
    if (!code.trim()) return;
    const prod = products.find(p => p.barcode === code.trim());
    if (prod) addToCart(prod);
    else { setFeedback({ type: "error", text: `Barcode ${code} not found` }); setTimeout(() => setFeedback(null), 2500); }
    setScanCode("");
  }, [products, addToCart]);

  const updateQty = (id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const checkout = async () => {
    if (!cart.length) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const time = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
    const note = cart.map(i => `${i.name} x${i.qty}`).join(", ");
    const entry = { user_id: userId, date: today, amount: total, note, time };
    const { error } = await supabase.from("sales").insert(entry);
    if (error) { setLoading(false); return; }
    for (const item of cart) await supabase.from("products").update({ stock: Math.max(0, item.stock - item.qty) }).eq("id", item.id);
    onUpdateProducts(products.map(p => { const s = cart.find(i => i.id === p.id); return s ? { ...p, stock: Math.max(0, p.stock - s.qty) } : p; }));
    onAddSale(entry);
    setReceipt({ items: [...cart], total, date: today, time });
    setCart([]);
    setLoading(false);
  };

  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)) : products;

  if (receipt) return (
    <div>
      <div className="page-header"><div className="page-title">POS — Point of Sale</div></div>
      <div className="card" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
        <div style={{ fontFamily: "var(--font-h)", fontSize: 20, fontWeight: 800, color: "var(--accent2)", marginBottom: 4 }}>Sale Complete!</div>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>{receipt.date} {receipt.time}</div>
        <div className="table-wrap" style={{ marginBottom: 16 }}>
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {receipt.items.map((i, idx) => (
                <tr key={idx}><td>{i.name}</td><td style={{ color: "var(--muted)" }}>{i.qty}</td><td style={{ fontFamily: "var(--font-h)", fontWeight: 700, color: "var(--accent)" }}>₱{(i.qty * i.price).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontFamily: "var(--font-h)", fontSize: 28, fontWeight: 800, color: "var(--accent)", marginBottom: 20 }}>Total: ₱{receipt.total.toLocaleString()}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => setReceipt(null)}>New Sale →</button>
          <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Print Receipt</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header"><div className="page-title">POS — Point of Sale</div><div className="page-sub">Scan barcodes or search products to build a sale</div></div>
      <div className="pos-wrap">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Barcode Scanner</div>
            <div className={`scanner-area ${scanFocus ? "active" : ""}`} onClick={() => scanRef.current?.focus()}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{scanFocus ? "Ready — scan now" : "Click to activate scanner"}</div>
              <input ref={scanRef} className="input-field" style={{ maxWidth: 280, margin: "0 auto", textAlign: "center", letterSpacing: 2 }}
                placeholder="Barcode..." value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan(scanCode)}
                onFocus={() => setScanFocus(true)} onBlur={() => setScanFocus(false)} />
            </div>
            {feedback && <div className={`scanner-feedback ${feedback.type === "success" ? "feedback-success" : "feedback-error"}`}>{feedback.text}</div>}
          </div>
          <div className="card">
            <div className="card-title">Or search and click a product</div>
            <div className="input-group"><input className="input-field" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {filtered.map(p => (
                <button key={p.id} onClick={() => addToCart(p)} style={{ background: p.stock === 0 ? "rgba(42,46,43,0.5)" : "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "12px", textAlign: "left", cursor: p.stock === 0 ? "not-allowed" : "pointer", opacity: p.stock === 0 ? 0.5 : 1, transition: "border-color 0.15s" }}
                  onMouseEnter={e => { if (p.stock > 0) e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "var(--text)" }}>{p.name}</div>
                  <div style={{ color: "var(--accent)", fontFamily: "var(--font-h)", fontWeight: 700, fontSize: 14 }}>₱{p.price}</div>
                  <div style={{ fontSize: 11, color: p.stock === 0 ? "var(--danger)" : "var(--muted)", marginTop: 2 }}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</div>
                </button>
              ))}
              {filtered.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, gridColumn: "1/-1", padding: "16px 0" }}>No products found.</div>}
            </div>
          </div>
        </div>
        <div className="pos-cart">
          <div className="pos-cart-header">🛒 Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})</div>
          <div className="pos-cart-items">
            {cart.length === 0 && <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)", fontSize: 13 }}><div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>Scan or click a product to add</div>}
            {cart.map(item => (
              <div key={item.id} className="pos-cart-item">
                <div className="pos-cart-item-name">{item.name}</div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
                <div className="pos-cart-item-price">₱{(item.qty * item.price).toLocaleString()}</div>
                <button onClick={() => removeFromCart(item.id)} style={{ color: "var(--danger)", fontSize: 16, padding: "0 4px" }}>✕</button>
              </div>
            ))}
          </div>
          <div className="pos-cart-footer">
            <div className="pos-total-label">Total</div>
            <div className="pos-total">₱{total.toLocaleString()}</div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "14px" }} onClick={checkout} disabled={loading || cart.length === 0}>
              {loading ? "Processing..." : `Checkout — ₱${total.toLocaleString()}`}
            </button>
            {cart.length > 0 && <button className="btn btn-danger" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setCart([])}>Clear Cart</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SALES ENTRY ───────────────────────────────────────────────────────────────
function SalesEntry({ sales, onAdd, onUpdate, onDelete, userId, products, onUpdateProducts, recordPin }) {
  const [tab, setTab] = useState("quick");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qForm, setQForm] = useState({ date: new Date().toISOString().slice(0, 10), time: "", amount: "", note: "" });
  const [iDate, setIDate] = useState(new Date().toISOString().slice(0, 10));
  const [iTime, setITime] = useState("");
  const [iNote, setINote] = useState("");
  const [items, setItems] = useState([{ search: "", product: null, qty: 1, price: 0 }]);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  // Print state
  const [printFrom, setPrintFrom] = useState("");
  const [printTo, setPrintTo] = useState("");
  const [printData, setPrintData] = useState(null);

  // Edit/delete state
  const [editSale, setEditSale] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pwModal, setPwModal] = useState(null); // { action: 'edit'|'delete', sale }

  const iTotal = items.reduce((s, i) => s + (i.product ? i.qty * i.price : 0), 0);
  const addItem = () => setItems([...items, { search: "", product: null, qty: 1, price: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, changes) => setItems(items.map((it, i) => i === idx ? { ...it, ...changes } : it));
  const selectProduct = (idx, prod) => updateItem(idx, { search: prod.name, product: prod, price: prod.price, qty: 1 });

  const submitQuick = async () => {
    if (!qForm.amount || isNaN(qForm.amount) || Number(qForm.amount) <= 0) return setMsg({ type: "error", text: "Enter a valid sales amount (₱)." });
    setLoading(true);
    const entry = { user_id: userId, date: qForm.date, time: qForm.time || null, amount: Number(qForm.amount), note: qForm.note };
    const { error } = await supabase.from("sales").insert(entry);
    setLoading(false);
    if (error) return setMsg({ type: "error", text: error.message });
    onAdd(entry);
    setMsg({ type: "success", text: `₱${Number(qForm.amount).toLocaleString()} recorded ✓` });
    setQForm({ date: new Date().toISOString().slice(0, 10), time: "", amount: "", note: "" });
    setTimeout(() => setMsg(null), 3000);
  };

  const submitItemized = async () => {
    const validItems = items.filter(i => i.product && i.qty > 0);
    if (!validItems.length) return setMsg({ type: "error", text: "Add at least one product." });
    for (const it of validItems) {
      if (it.qty > it.product.stock) return setMsg({ type: "error", text: `Not enough stock for ${it.product.name}. Only ${it.product.stock} left.` });
    }
    setLoading(true);
    const total = validItems.reduce((s, i) => s + i.qty * i.price, 0);
    const note = iNote || validItems.map(i => `${i.product.name} x${i.qty}`).join(", ");
    const entry = { user_id: userId, date: iDate, time: iTime || null, amount: total, note };
    const { error } = await supabase.from("sales").insert(entry);
    if (error) { setLoading(false); return setMsg({ type: "error", text: error.message }); }
    for (const it of validItems) await supabase.from("products").update({ stock: it.product.stock - it.qty }).eq("id", it.product.id);
    onUpdateProducts(products.map(p => { const s = validItems.find(i => i.product.id === p.id); return s ? { ...p, stock: p.stock - s.qty } : p; }));
    onAdd(entry);
    setLoading(false);
    setMsg({ type: "success", text: `₱${total.toLocaleString()} itemized sale recorded ✓` });
    setItems([{ search: "", product: null, qty: 1, price: 0 }]);
    setINote(""); setITime("");
    setTimeout(() => setMsg(null), 4000);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const parsed = rows.map(r => ({
          date: r.date || r.Date || r.DATE || "",
          amount: Number(r.amount || r.Amount || r.AMOUNT || r.sales || r.Sales || 0),
          note: r.note || r.Note || r.NOTE || "",
          time: r.time || r.Time || ""
        })).filter(r => r.date && r.amount > 0);
        if (!parsed.length) return setMsg({ type: "error", text: "No valid rows found. Make sure your file has 'date' and 'amount' columns." });
        setPreview(parsed); setTab("import");
      } catch { setMsg({ type: "error", text: "Could not read file. Make sure it's a valid .xlsx or .csv file." }); }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) parseFile(file); };

  const confirmImport = async () => {
    if (!preview?.length) return;
    setLoading(true);
    const entries = preview.map(r => ({ ...r, user_id: userId }));
    const { error } = await supabase.from("sales").insert(entries);
    setLoading(false);
    if (error) return setMsg({ type: "error", text: error.message });
    entries.forEach(e => onAdd(e));
    setMsg({ type: "success", text: `✓ ${entries.length} sales records imported!` });
    setPreview(null); setTab("quick");
    setTimeout(() => setMsg(null), 4000);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["date", "amount", "note", "time"],
      ["2026-05-01", 2500, "Morning sales", "09:00 AM"],
      ["2026-05-02", 3100, "", ""],
      ["2026-05-03", 1800, "Rainy day", "02:30 PM"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "sales_template.xlsx");
  };

  const generatePrint = () => {
    if (!printFrom || !printTo) return setMsg({ type: "error", text: "Select a date range to print." });
    const filtered = sales.filter(s => s.date >= printFrom && s.date <= printTo).sort((a, b) => a.date.localeCompare(b.date));
    if (!filtered.length) return setMsg({ type: "error", text: "No sales found in that date range." });
    setPrintData(filtered);
  };

  const doPrint = () => window.print();

  // Edit sale
  const startEdit = (sale) => setPwModal({ action: "edit", sale });
  const startDelete = (sale) => setPwModal({ action: "delete", sale });

  const confirmEdit = async () => {
    const { error } = await supabase.from("sales").update({ date: editForm.date, amount: Number(editForm.amount), note: editForm.note, time: editForm.time || null }).eq("id", editSale.id);
    if (error) return;
    onUpdate({ ...editSale, ...editForm, amount: Number(editForm.amount) });
    setEditSale(null);
    setMsg({ type: "success", text: "Sale updated ✓" });
    setTimeout(() => setMsg(null), 3000);
  };

  const confirmDelete = async (sale) => {
    const target = sale || deleteTarget;
    if (!target) return;
    const { error } = await supabase.from("sales").delete().eq("id", target.id);
    if (error) return;
    onDelete(target.id);
    setDeleteTarget(null);
    setMsg({ type: "success", text: "Sale record deleted ✓" });
    setTimeout(() => setMsg(null), 3000);
  };

  const history = sales.map(s => ({ date: s.date, actual: s.amount }));
  const { chartData, slope } = buildChartData(history, 30);
  const trending = slope >= 0;

  if (printData) return (
    <div>
      <div className="no-print" style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button className="btn btn-primary" onClick={doPrint}>🖨️ Print Now</button>
        <button className="btn btn-secondary" onClick={() => setPrintData(null)}>← Back</button>
      </div>
      <div style={{ background: "white", color: "black", padding: 32, borderRadius: 12 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>SalesForecast — Sales Report</div>
          <div style={{ fontSize: 14, color: "#666" }}>{printFrom} to {printTo}</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Total records: {printData.length} · Total sales: ₱{printData.reduce((s, r) => s + r.amount, 0).toLocaleString()}</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Date</th>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Time</th>
              <th style={{ padding: "10px 12px", textAlign: "right", borderBottom: "2px solid #ddd" }}>Amount</th>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {printData.map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "9px 12px" }}>{s.date}</td>
                <td style={{ padding: "9px 12px", color: "#888" }}>{s.time || "—"}</td>
                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700 }}>₱{s.amount?.toLocaleString()}</td>
                <td style={{ padding: "9px 12px", color: "#666" }}>{s.note || "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f0f0f0", fontWeight: 800 }}>
              <td colSpan={2} style={{ padding: "12px" }}>TOTAL</td>
              <td style={{ padding: "12px", textAlign: "right" }}>₱{printData.reduce((s, r) => s + r.amount, 0).toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div style={{ marginTop: 24, fontSize: 11, color: "#aaa", textAlign: "center" }}>Generated by SalesForecast · {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );

  return (
    <div>
      {pwModal && (
        <PasswordModal
          title={pwModal.action === "edit" ? "Confirm Edit" : "Confirm Delete"}
          subtitle={pwModal.action === "edit" ? `You are about to edit a sales record.` : `You are about to permanently delete this sales record.`}
          recordPin={recordPin}
          onConfirm={() => {
            if (pwModal.action === "edit") { setEditSale(pwModal.sale); setEditForm({ date: pwModal.sale.date, amount: pwModal.sale.amount, note: pwModal.sale.note || "", time: pwModal.sale.time || "" }); }
            else { confirmDelete(pwModal.sale); }
            setPwModal(null);
          }}
          onCancel={() => setPwModal(null)}
        />
      )}

      {editSale && (
        <div className="modal-overlay" onClick={() => setEditSale(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Edit Sale Record</div>
            <div className="modal-sub">Update the details below</div>
            <div className="input-group"><label className="input-label">Date</label><input className="input-field" type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Time (optional)</label><input className="input-field" type="time" value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Amount (₱)</label><input className="input-field" type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Note</label><input className="input-field" value={editForm.note} onChange={e => setEditForm({ ...editForm, note: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={confirmEdit}>Save Changes →</button>
              <button className="btn btn-secondary" onClick={() => setEditSale(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header"><div className="page-title">Record Sales</div><div className="page-sub">Log sales manually, itemized, or import from Excel</div></div>
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="tab-row">
            <button className={`tab-btn ${tab === "quick" ? "active" : ""}`} onClick={() => setTab("quick")}>⚡ Quick</button>
            <button className={`tab-btn ${tab === "itemized" ? "active" : ""}`} onClick={() => setTab("itemized")}>🧾 Itemized</button>
            <button className={`tab-btn ${tab === "import" ? "active" : ""}`} onClick={() => setTab("import")}>📂 Import Excel</button>
            <button className={`tab-btn ${tab === "print" ? "active" : ""}`} onClick={() => setTab("print")}>🖨️ Print</button>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {tab === "quick" && (
            <>
              <div className="grid-2">
                <div className="input-group"><label className="input-label">Date</label><input className="input-field" type="date" value={qForm.date} onChange={(e) => setQForm({ ...qForm, date: e.target.value })} /></div>
                <div className="input-group"><label className="input-label">Time (optional)</label><input className="input-field" type="time" value={qForm.time} onChange={(e) => setQForm({ ...qForm, time: e.target.value })} /></div>
              </div>
              <div className="input-group"><label className="input-label">Total sales amount (₱)</label><input className="input-field" type="number" placeholder="e.g. 2500" value={qForm.amount} onChange={(e) => setQForm({ ...qForm, amount: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submitQuick()} /></div>
              <div className="input-group"><label className="input-label">Note (optional)</label><input className="input-field" placeholder="e.g. holiday, rainy day..." value={qForm.note} onChange={(e) => setQForm({ ...qForm, note: e.target.value })} /></div>
              <button className="btn btn-primary" onClick={submitQuick} disabled={loading}>{loading ? "Saving..." : "Save Sales Record →"}</button>
            </>
          )}

          {tab === "itemized" && (
            <>
              <div className="grid-2" style={{ marginBottom: 12 }}>
                <div className="input-group" style={{ marginBottom: 0 }}><label className="input-label">Date</label><input className="input-field" type="date" value={iDate} onChange={(e) => setIDate(e.target.value)} /></div>
                <div className="input-group" style={{ marginBottom: 0 }}><label className="input-label">Time (optional)</label><input className="input-field" type="time" value={iTime} onChange={(e) => setITime(e.target.value)} /></div>
              </div>
              <div className="input-group"><label className="input-label">Note (optional)</label><input className="input-field" placeholder="e.g. morning sales..." value={iNote} onChange={(e) => setINote(e.target.value)} /></div>
              <div style={{ marginTop: 8 }}>
                <div className="item-row-header">
                  {["Product","Qty","Price","Subtotal",""].map((h, i) => <span key={i} style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</span>)}
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <ProductSearch products={products} value={item.search} onChange={(v) => updateItem(idx, { search: v, product: null })} onSelect={(p) => selectProduct(idx, p)} />
                    <input className="input-field" type="number" min="1" value={item.qty} onChange={(e) => updateItem(idx, { qty: Math.max(1, parseInt(e.target.value) || 1) })} style={{ padding: "11px 8px", textAlign: "center" }} />
                    <input className="input-field" type="number" value={item.price} onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })} style={{ padding: "11px 8px" }} />
                    <div style={{ fontFamily: "var(--font-h)", fontWeight: 700, color: "var(--accent)", fontSize: 14, textAlign: "right" }}>₱{(item.qty * item.price).toLocaleString()}</div>
                    <button className="btn btn-danger" style={{ padding: "8px 10px", fontSize: 14 }} onClick={() => removeItem(idx)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "9px" }} onClick={addItem}>+ Add another product</button>
              </div>
              <div className="total-box"><span className="total-label">Total Sale Amount</span><span className="total-value">₱{iTotal.toLocaleString()}</span></div>
              <button className="btn btn-primary" onClick={submitItemized} disabled={loading || iTotal === 0}>{loading ? "Saving..." : `Save Itemized Sale — ₱${iTotal.toLocaleString()} →`}</button>
            </>
          )}

          {tab === "import" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Upload your Excel or CSV file with sales data</div>
                <button className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 12 }} onClick={downloadTemplate}>⬇ Download Template</button>
              </div>
              {!preview ? (
                <div className={`drop-zone ${dragOver ? "drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop your Excel file here</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>or click to browse — supports .xlsx and .csv</div>
                  <div className="alert alert-info" style={{ textAlign: "left", fontSize: 12 }}>File must have columns: <strong>date</strong> (YYYY-MM-DD), <strong>amount</strong>, <strong>note</strong>, <strong>time</strong> (all optional except date and amount)</div>
                  <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" style={{ display: "none" }} onChange={(e) => e.target.files[0] && parseFile(e.target.files[0])} />
                </div>
              ) : (
                <>
                  <div className="alert alert-success">{preview.length} rows found and ready to import</div>
                  <div className="table-wrap" style={{ marginBottom: 16, maxHeight: 240, overflowY: "auto" }}>
                    <table>
                      <thead><tr><th>Date</th><th>Time</th><th>Amount</th><th>Note</th></tr></thead>
                      <tbody>
                        {preview.slice(0, 50).map((r, i) => (
                          <tr key={i}>
                            <td style={{ color: "var(--muted)" }}>{r.date}</td>
                            <td style={{ color: "var(--muted)" }}>{r.time || "—"}</td>
                            <td style={{ fontFamily: "var(--font-h)", fontWeight: 700, color: "var(--accent)" }}>₱{r.amount.toLocaleString()}</td>
                            <td style={{ color: "var(--muted)", fontSize: 12 }}>{r.note || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-primary" onClick={confirmImport} disabled={loading}>{loading ? "Importing..." : `Import ${preview.length} records →`}</button>
                    <button className="btn btn-secondary" onClick={() => setPreview(null)}>Cancel</button>
                  </div>
                </>
              )}
            </>
          )}

          {tab === "print" && (
            <>
              <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>Select a date range to generate a printable sales report</div>
              <div className="grid-2">
                <div className="input-group"><label className="input-label">From date</label><input className="input-field" type="date" value={printFrom} onChange={e => setPrintFrom(e.target.value)} /></div>
                <div className="input-group"><label className="input-label">To date</label><input className="input-field" type="date" value={printTo} onChange={e => setPrintTo(e.target.value)} /></div>
              </div>
              <button className="btn btn-primary" onClick={generatePrint}>Generate Print Preview →</button>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title">30-day forecast</div>
          {sales.length < 3 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📈</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Add at least 3 sales records to see your forecast.</div>
            </div>
          ) : (
            <>
              <div className={`forecast-pill ${trending ? "fp-up" : "fp-down"}`}>{trending ? "📈 Next 30 days: GROWTH expected" : "📉 Next 30 days: DECLINE expected"}</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7570", fontSize: 10 }} tickLine={false} axisLine={false} interval={9} />
                  <YAxis tick={{ fill: "#6b7570", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(1)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="actual" stroke="#b5f23e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#3ef2a0" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent records ({sales.length})</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Time</th><th>Amount</th><th>Note</th><th>Actions</th></tr></thead>
            <tbody>
              {[...sales].reverse().slice(0, 30).map((s, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--muted)" }}>{s.date}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{s.time || "—"}</td>
                  <td style={{ fontFamily: "var(--font-h)", fontWeight: 700, color: "var(--accent)" }}>₱{s.amount?.toLocaleString()}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{s.note || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => startEdit(s)}>✏️ Edit</button>
                      <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => startDelete(s)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan={5} style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>No sales recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── FORECAST ──────────────────────────────────────────────────────────────────
function ForecastPage({ sales }) {
  const [period, setPeriod] = useState(7);
  const history = sales.map(s => ({ date: s.date, actual: s.amount }));
  const { chartData, slope } = buildChartData(history, period);
  const trending = slope >= 0;
  const lastActual = history[history.length - 1]?.actual || 0;
  const predicted = Math.max(0, Math.round(lastActual + slope * period));

  if (sales.length < 3) return (
    <div>
      <div className="page-header"><div className="page-title">Sales Forecast</div></div>
      <div className="card"><div className="empty-state"><div className="empty-icon">📈</div><div className="empty-title">Not enough data yet</div><div className="empty-sub">Add at least 3 days of sales records to generate a forecast.</div></div></div>
    </div>
  );

  return (
    <div>
      <div className="page-header"><div className="page-title">Sales Forecast</div><div className="page-sub">Predicted trend based on your last 14 days of sales</div></div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-label">Trend direction</div><div className="stat-value" style={{ color: trending ? "var(--accent2)" : "var(--danger)", fontSize: 22 }}>{trending ? "Going UP ↑" : "Going DOWN ↓"}</div></div>
        <div className="stat-card"><div className="stat-label">Slope (per day)</div><div className="stat-value" style={{ fontSize: 24 }}>₱{Math.abs(slope).toFixed(0)}</div><div className={`stat-badge ${trending ? "badge-up" : "badge-down"}`}>{trending ? "gaining" : "losing"} per day avg</div></div>
        <div className="stat-card"><div className="stat-label">Predicted in {period} days</div><div className="stat-value" style={{ color: "var(--accent)", fontSize: 24 }}>₱{predicted.toLocaleString()}</div></div>
      </div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Forecast chart</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[7, 14, 30].map((d) => <button key={d} className={`btn ${period === d ? "btn-primary" : "btn-secondary"}`} style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => setPeriod(d)}>{d} days</button>)}
          </div>
        </div>
        <div className={`forecast-pill ${trending ? "fp-up" : "fp-down"}`}>{trending ? `📈 Expected to GROW by ₱${(slope * period).toFixed(0)} over next ${period} days` : `📉 Expected to DROP by ₱${Math.abs(slope * period).toFixed(0)} over next ${period} days`}</div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#6b7570", fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 8)} />
            <YAxis tick={{ fill: "#6b7570", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={history[history.length - 1]?.date} stroke="rgba(181,242,62,0.3)" strokeDasharray="4 4" label={{ value: "Today", fill: "#b5f23e", fontSize: 11 }} />
            <Line type="monotone" dataKey="actual" stroke="#b5f23e" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="predicted" stroke="#3ef2a0" strokeWidth={2.5} strokeDasharray="6 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          <span><span style={{ color: "var(--accent)" }}>—</span> Actual sales</span>
          <span><span style={{ color: "var(--accent2)" }}>- -</span> Forecast ({period} days)</span>
        </div>
      </div>
    </div>
  );
}

// ── INVENTORY ─────────────────────────────────────────────────────────────────
function Inventory({ products, onUpdate, userId }) {
  const [scanCode, setScanCode] = useState("");
  const [scanFocus, setScanFocus] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [addMode, setAddMode] = useState("none");
  const [saving, setSaving] = useState(false);
  const [newProd, setNewProd] = useState({ barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10, expiry_date: "" });
  const [bulkRows, setBulkRows] = useState(Array(3).fill(null).map(() => ({ barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10, expiry_date: "" })));
  const UNITS = ["pc","pack","bottle","sachet","stick","box","can","kg","g"];

  const handleScan = useCallback(async (code) => {
    if (!code.trim()) return;
    const prod = products.find((p) => p.barcode === code.trim());
    if (prod) {
      const newStock = prod.stock + 1;
      await supabase.from("products").update({ stock: newStock }).eq("id", prod.id);
      onUpdate(products.map((p) => p.id === prod.id ? { ...p, stock: newStock } : p));
      setFeedback({ type: "success", text: `✓ Scanned: ${prod.name} — stock now ${newStock} ${prod.unit}` });
    } else {
      setFeedback({ type: "error", text: `Barcode ${code} not found. Add it below.` });
    }
    setScanCode("");
    setTimeout(() => setFeedback(null), 4000);
  }, [products, onUpdate]);

  const adjustStock = async (prod, delta) => {
    const newStock = Math.max(0, prod.stock + delta);
    await supabase.from("products").update({ stock: newStock }).eq("id", prod.id);
    onUpdate(products.map((p) => p.id === prod.id ? { ...p, stock: newStock } : p));
  };

  const saveEdit = async (prod) => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty < 0) return;
    await supabase.from("products").update({ stock: qty }).eq("id", prod.id);
    onUpdate(products.map((p) => p.id === prod.id ? { ...p, stock: qty } : p));
    setEditId(null);
  };

  const deleteProduct = async (prod) => {
    if (!window.confirm(`Delete "${prod.name}"?`)) return;
    await supabase.from("products").delete().eq("id", prod.id);
    onUpdate(products.filter(p => p.id !== prod.id));
  };

  const addSingleProduct = async () => {
    if (!newProd.name) return;
    setSaving(true);
    const entry = { ...newProd, user_id: userId, price: Number(newProd.price), stock: Number(newProd.stock), low_threshold: Number(newProd.low_threshold), expiry_date: newProd.expiry_date || null };
    const { data, error } = await supabase.from("products").insert(entry).select().single();
    setSaving(false);
    if (error) return;
    onUpdate([...products, data]);
    setNewProd({ barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10, expiry_date: "" });
    setAddMode("none");
  };

  const addBulkProducts = async () => {
    const valid = bulkRows.filter(r => r.name.trim());
    if (!valid.length) return;
    setSaving(true);
    const entries = valid.map(r => ({ ...r, user_id: userId, price: Number(r.price), stock: Number(r.stock), low_threshold: Number(r.low_threshold), expiry_date: r.expiry_date || null }));
    const { data, error } = await supabase.from("products").insert(entries).select();
    setSaving(false);
    if (error) return;
    onUpdate([...products, ...data]);
    setBulkRows(Array(3).fill(null).map(() => ({ barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10, expiry_date: "" })));
    setAddMode("none");
  };

  const stockStatus = (p) => {
    if (p.stock === 0) return { cls: "stock-out", label: "Out of stock" };
    if (p.stock <= p.low_threshold) return { cls: "stock-low", label: "Low stock" };
    return { cls: "stock-ok", label: `${p.stock} ${p.unit}` };
  };

  const expiredCount = products.filter(p => { const s = expiryStatus(p.expiry_date); return s && s.days < 0; }).length;
  const expiringSoon = products.filter(p => { const s = expiryStatus(p.expiry_date); return s && s.days >= 0 && s.days <= 7; }).length;

  return (
    <div>
      <div className="page-header"><div className="page-title">Inventory</div><div className="page-sub">Scan barcodes or manage stock manually</div></div>

      {(expiredCount > 0 || expiringSoon > 0) && (
        <div style={{ marginBottom: 20 }}>
          {expiredCount > 0 && <div className="alert alert-error">🚨 {expiredCount} product{expiredCount > 1 ? "s have" : " has"} already expired! Remove them immediately.</div>}
          {expiringSoon > 0 && <div className="alert alert-warn">⚠️ {expiringSoon} product{expiringSoon > 1 ? "s are" : " is"} expiring within 7 days.</div>}
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">USB Barcode Scanner</div>
        <div className={`scanner-area ${scanFocus ? "active" : ""}`} onClick={() => document.getElementById("invScan")?.focus()}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{scanFocus ? "Ready — scan now" : "Click to activate scanner"}</div>
          <input id="invScan" className="input-field" style={{ maxWidth: 280, margin: "0 auto", textAlign: "center", letterSpacing: 2 }}
            placeholder="Barcode..." value={scanCode}
            onChange={(e) => setScanCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan(scanCode)}
            onFocus={() => setScanFocus(true)} onBlur={() => setScanFocus(false)} />
        </div>
        {feedback && <div className={`scanner-feedback ${feedback.type === "success" ? "feedback-success" : "feedback-error"}`}>{feedback.text}</div>}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className={`btn ${addMode === "single" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAddMode(addMode === "single" ? "none" : "single")}>+ Add Single Product</button>
        <button className={`btn ${addMode === "bulk" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAddMode(addMode === "bulk" ? "none" : "bulk")}>+ Bulk Add Products</button>
      </div>

      {addMode === "single" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Add single product</div>
          <div className="grid-3">
            <div className="input-group"><label className="input-label">Barcode / SKU</label><input className="input-field" placeholder="Scan or type" value={newProd.barcode} onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Product name *</label><input className="input-field" placeholder="e.g. Pepsi 330ml" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Price (₱)</label><input className="input-field" type="number" placeholder="25" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Starting stock</label><input className="input-field" type="number" placeholder="0" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Unit</label><select className="input-field" value={newProd.unit} onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Low stock alert at</label><input className="input-field" type="number" placeholder="10" value={newProd.low_threshold} onChange={(e) => setNewProd({ ...newProd, low_threshold: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Expiry date (optional)</label><input className="input-field" type="date" value={newProd.expiry_date} onChange={(e) => setNewProd({ ...newProd, expiry_date: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={addSingleProduct} disabled={saving}>{saving ? "Saving..." : "Save Product →"}</button>
            <button className="btn btn-secondary" onClick={() => setAddMode("none")}>Cancel</button>
          </div>
        </div>
      )}

      {addMode === "bulk" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Bulk add products</div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 36px", gap: 8, marginBottom: 6, minWidth: 900 }}>
              {["Barcode","Name *","Price","Stock","Unit","Low Alert","Expiry Date",""].map((h, i) => <span key={i} style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</span>)}
            </div>
            {bulkRows.map((row, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 36px", gap: 8, marginBottom: 8, alignItems: "center", minWidth: 900 }}>
                <input className="input-field" placeholder="Barcode" value={row.barcode} onChange={(e) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, barcode: e.target.value } : r))} style={{ padding: "9px 10px" }} />
                <input className="input-field" placeholder="Product name" value={row.name} onChange={(e) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))} style={{ padding: "9px 10px" }} />
                <input className="input-field" type="number" placeholder="0" value={row.price} onChange={(e) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, price: e.target.value } : r))} style={{ padding: "9px 10px" }} />
                <input className="input-field" type="number" placeholder="0" value={row.stock} onChange={(e) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, stock: e.target.value } : r))} style={{ padding: "9px 10px" }} />
                <select className="input-field" value={row.unit} onChange={(e) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, unit: e.target.value } : r))} style={{ padding: "9px 10px" }}>{UNITS.map(u => <option key={u}>{u}</option>)}</select>
                <input className="input-field" type="number" placeholder="10" value={row.low_threshold} onChange={(e) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, low_threshold: e.target.value } : r))} style={{ padding: "9px 10px" }} />
                <input className="input-field" type="date" value={row.expiry_date} onChange={(e) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, expiry_date: e.target.value } : r))} style={{ padding: "9px 10px" }} />
                <button className="btn btn-danger" style={{ padding: "8px 10px" }} onClick={() => setBulkRows(bulkRows.filter((_, i) => i !== idx))}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setBulkRows([...bulkRows, { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10, expiry_date: "" }])}>+ Add row</button>
            <button className="btn btn-primary" onClick={addBulkProducts} disabled={saving}>{saving ? "Saving..." : "Save All →"}</button>
            <button className="btn btn-secondary" onClick={() => setAddMode("none")}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">All products ({products.length})</div>
        {products.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-title">No products yet</div><div className="empty-sub">Add your first product using the buttons above.</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Barcode</th><th>Price</th><th>Stock</th><th>Expiry</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p) => {
                  const s = stockStatus(p);
                  const exp = expiryStatus(p.expiry_date);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 12 }}>{p.barcode || "—"}</td>
                      <td style={{ color: "var(--accent)", fontFamily: "var(--font-h)", fontWeight: 700 }}>₱{p.price}</td>
                      <td>
                        {editId === p.id ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input className="input-field" type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} style={{ width: 80, padding: "6px 10px" }} autoFocus onKeyDown={(e) => e.key === "Enter" && saveEdit(p)} />
                            <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => saveEdit(p)}>✓</button>
                            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setEditId(null)}>✕</button>
                          </div>
                        ) : <span className={`stock-pill ${s.cls}`}>{s.label}</span>}
                      </td>
                      <td>{exp ? <span className={`stock-pill ${exp.cls}`}>{exp.label}</span> : <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: 13 }} onClick={() => adjustStock(p, -1)}>−</button>
                          <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: 13 }} onClick={() => adjustStock(p, +1)}>+</button>
                          <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => { setEditId(p.id); setEditQty(p.stock); }}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => deleteProduct(p)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ user, recordPin, onPinChange }) {
  const [tab, setTab] = useState("pin");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Change login password
  const [newLoginPw, setNewLoginPw] = useState("");
  const [confirmLoginPw, setConfirmLoginPw] = useState("");
  const [showNewLogin, setShowNewLogin] = useState(false);
  const [showConfirmLogin, setShowConfirmLogin] = useState(false);

  const savePin = async () => {
    if (recordPin && !currentPin) return setMsg({ type: "error", text: "Enter your current record password first." });
    if (recordPin && currentPin !== recordPin) return setMsg({ type: "error", text: "Current record password is wrong." });
    if (!newPin) return setMsg({ type: "error", text: "Enter a new record password." });
    if (newPin !== confirmPin) return setMsg({ type: "error", text: "Passwords do not match." });
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ record_pin: newPin }).eq("id", user.id);
    setSaving(false);
    if (error) return setMsg({ type: "error", text: error.message });
    onPinChange(newPin);
    setCurrentPin(""); setNewPin(""); setConfirmPin("");
    setMsg({ type: "success", text: "Record protection password updated successfully ✓" });
    setTimeout(() => setMsg(null), 3000);
  };

  const saveLoginPassword = async () => {
    if (!newLoginPw) return setMsg({ type: "error", text: "Enter a new password." });
    if (newLoginPw !== confirmLoginPw) return setMsg({ type: "error", text: "Passwords do not match." });
    if (newLoginPw.length < 6) return setMsg({ type: "error", text: "Password must be at least 6 characters." });
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newLoginPw });
    setSaving(false);
    if (error) return setMsg({ type: "error", text: error.message });
    setNewLoginPw(""); setConfirmLoginPw("");
    setMsg({ type: "success", text: "Login password updated successfully ✓" });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">Settings</div><div className="page-sub">Manage your store security and account</div></div>

      <div className="tab-row" style={{ marginBottom: 24 }}>
        <button className={`tab-btn ${tab === "pin" ? "active" : ""}`} onClick={() => { setTab("pin"); setMsg(null); }}>🔐 Record Password</button>
        <button className={`tab-btn ${tab === "account" ? "active" : ""}`} onClick={() => { setTab("account"); setMsg(null); }}>👤 Login Password</button>
      </div>

      {tab === "pin" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-title">Record Protection Password</div>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            This password is required when <strong>editing or deleting</strong> any sales record. Keep it separate from your login password for extra security.
          </div>
          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          {recordPin ? (
            <div className="input-group">
              <label className="input-label">Current record password</label>
              <div style={{ position: "relative" }}>
                <input className="input-field" type={showCurrent ? "text" : "password"} placeholder="••••••••" value={currentPin} onChange={e => setCurrentPin(e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16, padding: 4 }}>{showCurrent ? "🙈" : "👁️"}</button>
              </div>
            </div>
          ) : (
            <div className="alert alert-warn" style={{ marginBottom: 16 }}>⚠️ No record password set yet. Create one below to protect your sales records.</div>
          )}
          <div className="input-group">
            <label className="input-label">{recordPin ? "New record password" : "Create record password"}</label>
            <div style={{ position: "relative" }}>
              <input className="input-field" type={showNew ? "text" : "password"} placeholder="••••••••" value={newPin} onChange={e => setNewPin(e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16, padding: 4 }}>{showNew ? "🙈" : "👁️"}</button>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Confirm new record password</label>
            <div style={{ position: "relative" }}>
              <input className="input-field" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} onKeyDown={e => e.key === "Enter" && savePin()} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16, padding: 4 }}>{showConfirm ? "🙈" : "👁️"}</button>
            </div>
          </div>
          <button className="btn btn-primary" onClick={savePin} disabled={saving}>{saving ? "Saving..." : recordPin ? "Update Record Password →" : "Set Record Password →"}</button>
        </div>
      )}

      {tab === "account" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-title">Change Login Password</div>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            This changes the password you use to <strong>log in</strong> to SalesForecast.
          </div>
          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <div style={{ marginBottom: 12, padding: "10px 14px", background: "var(--surface)", borderRadius: "var(--r)", border: "1px solid var(--border)", fontSize: 13, color: "var(--muted)" }}>
            Account: <span style={{ color: "var(--text)" }}>{user.email}</span>
          </div>
          <div className="input-group">
            <label className="input-label">New login password</label>
            <div style={{ position: "relative" }}>
              <input className="input-field" type={showNewLogin ? "text" : "password"} placeholder="Min. 6 characters" value={newLoginPw} onChange={e => setNewLoginPw(e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowNewLogin(!showNewLogin)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16, padding: 4 }}>{showNewLogin ? "🙈" : "👁️"}</button>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Confirm new login password</label>
            <div style={{ position: "relative" }}>
              <input className="input-field" type={showConfirmLogin ? "text" : "password"} placeholder="••••••••" value={confirmLoginPw} onChange={e => setConfirmLoginPw(e.target.value)} onKeyDown={e => e.key === "Enter" && saveLoginPassword()} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirmLogin(!showConfirmLogin)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 16, padding: 4 }}>{showConfirmLogin ? "🙈" : "👁️"}</button>
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveLoginPassword} disabled={saving}>{saving ? "Saving..." : "Update Login Password →"}</button>
        </div>
      )}
    </div>
  );
}

// ── HELP PAGE ─────────────────────────────────────────────────────────────────
function HelpPage() {
  const sections = [
    { icon: "🚀", title: "Getting Started", steps: [
      { title: "Create your account", desc: "Click 'Register free' on the login page. Enter your store name, email, and password." },
      { title: "Add your products", desc: "Go to Inventory → click 'Add Single Product' or 'Bulk Add Products' to add all your items with their prices and stock counts." },
      { title: "Start recording sales", desc: "Go to Record Sales or use the POS page to start logging your daily sales." },
    ]},
    { icon: "🛒", title: "POS — Point of Sale (Live Selling)", steps: [
      { title: "Open the POS page", desc: "Click 'POS' in the sidebar. This is your cashier screen for live transactions." },
      { title: "Scan or search products", desc: "Plug in your USB barcode scanner and scan items — they'll be added to the cart automatically. Or search and click a product." },
      { title: "Checkout", desc: "Click 'Checkout' when done. The sale is saved and stock is automatically deducted. You can also print the receipt." },
    ]},
    { icon: "💰", title: "Recording Sales", steps: [
      { title: "⚡ Quick Sale", desc: "Enter the date, optional time, and total amount. Best for end-of-day totals." },
      { title: "🧾 Itemized Sale", desc: "Search and add products one by one. Totals are calculated automatically and stock is deducted when saved." },
      { title: "📂 Import from Excel", desc: "Download the template, fill it in (date, amount, note, time), then upload it. Great for importing past records." },
      { title: "🖨️ Print Sales Report", desc: "Select a date range (e.g. June to March) and click Generate Print Preview. Then click Print Now for a hard copy." },
    ]},
    { icon: "✏️", title: "Editing & Deleting Sales", steps: [
      { title: "Edit a record", desc: "In Recent Records, click the ✏️ Edit button next to any sale. You will be asked to enter your password for protection before editing." },
      { title: "Delete a record", desc: "Click the 🗑️ Delete button next to any sale. You must enter your password to confirm the deletion." },
    ]},
    { icon: "📦", title: "Managing Inventory", steps: [
      { title: "Add expiry date", desc: "When adding a product, fill in the Expiry Date field. Products expiring within 7 days will show an orange warning. Expired products show in red." },
      { title: "USB Barcode Scanner", desc: "Click the scanner area to activate it, then scan a barcode — it adds +1 stock to that product automatically." },
      { title: "Adjust stock manually", desc: "Use the + and − buttons or click Edit to set an exact stock count." },
      { title: "Delete a product", desc: "Click the Delete button next to any product to remove it from your inventory." },
    ]},
    { icon: "📈", title: "Understanding the Forecast", steps: [
      { title: "How it works", desc: "The app uses linear regression on your last 14 days of sales to predict future trends." },
      { title: "Going UP or DOWN", desc: "If your recent sales trend is going upward, the forecast shows 📈 Going UP. If it's going down, it shows 📉 Going DOWN." },
      { title: "Switch periods", desc: "On the Forecast page, switch between 7-day, 14-day, and 30-day predictions." },
    ]},
  ];

  return (
    <div>
      <div className="page-header"><div className="page-title">Help & Instructions</div><div className="page-sub">Step-by-step guide to using SalesForecast</div></div>
      {sections.map((sec, si) => (
        <div key={si} className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 28 }}>{sec.icon}</div>
            <div style={{ fontFamily: "var(--font-h)", fontSize: 17, fontWeight: 800 }}>{sec.title}</div>
          </div>
          {sec.steps.map((step, i) => (
            <div key={i} className="help-step">
              <div className="help-num">{i + 1}</div>
              <div className="help-text"><strong>{step.title}</strong><span>{step.desc}</span></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordPin, setRecordPin] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("store_name, record_pin").eq("id", session.user.id).single();
        setUser({ ...session.user, storeName: profile?.store_name || session.user.email });
        if (profile?.record_pin) setRecordPin(profile.record_pin);
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); setSales([]); setProducts([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("sales").select("*").eq("user_id", user.id).order("date", { ascending: true }).then(({ data }) => setSales(data || []));
    supabase.from("products").select("*").eq("user_id", user.id).order("name").then(({ data }) => setProducts(data || []));
  }, [user]);

  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  const handleUpdateSale = (updated) => setSales(prev => prev.map(s => s.id === updated.id ? updated : s));
  const handleDeleteSale = (id) => setSales(prev => prev.filter(s => s.id !== id));

  if (loading) return (<><style>{CSS}</style><div className="loading-screen"><div className="spinner"></div><div style={{ color: "var(--muted)", fontSize: 13 }}>Loading SalesForecast...</div></div></>);
  if (!user) return (<><style>{CSS}</style><LoginPage onLogin={setUser} /></>);

  const NAV = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "pos", icon: "🛒", label: "POS" },
    { id: "sales", icon: "💰", label: "Record Sales" },
    { id: "forecast", icon: "📈", label: "Forecast" },
    { id: "inventory", icon: "📦", label: "Inventory" },
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "help", icon: "❓", label: "Help" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-logo">Sales<span>Forecast</span></div>
          <div className="nav-section">Menu</div>
          {NAV.map((n) => (
            <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
          <div className="sidebar-bottom">
            <div className="user-info"><span>{user.storeName}</span></div>
            <button className="logout-btn" onClick={logout}>🚪 <span>Sign out</span></button>
          </div>
        </nav>
        <main className="main">
          {page === "dashboard" && <Dashboard sales={sales} products={products} />}
          {page === "pos" && <POSPage products={products} onUpdateProducts={setProducts} onAddSale={(s) => setSales([...sales, s])} userId={user.id} />}
          {page === "sales" && <SalesEntry sales={sales} onAdd={(s) => setSales([...sales, s])} onUpdate={handleUpdateSale} onDelete={handleDeleteSale} userId={user.id} products={products} onUpdateProducts={setProducts} recordPin={recordPin} />}
          {page === "forecast" && <ForecastPage sales={sales} />}
          {page === "inventory" && <Inventory products={products} onUpdate={setProducts} userId={user.id} />}
          {page === "settings" && <SettingsPage user={user} recordPin={recordPin} onPinChange={setRecordPin} />}
          {page === "help" && <HelpPage />}
        </main>
      </div>
    </>
  );
}

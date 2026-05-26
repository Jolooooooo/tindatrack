import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const SUPABASE_URL = "https://ygxmiuguerjdrgfubvwu.supabase.co";
const SUPABASE_KEY = "sb_publishable_2BJPARkVzhGvDqKkb5Bx5Q_cSqd4iTg";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0d0f0e; --surface: #151816; --card: #1b1e1c; --border: #2a2e2b;
    --accent: #b5f23e; --accent2: #3ef2a0; --danger: #f25a3e;
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
  .scanner-area { border: 2px dashed var(--border); border-radius: var(--r); padding: 32px; text-align: center; transition: border-color 0.2s; cursor: pointer; }
  .scanner-area.active { border-color: var(--accent); background: rgba(181,242,62,0.04); }
  .scanner-icon { font-size: 36px; margin-bottom: 12px; }
  .scanner-feedback { margin-top: 16px; padding: 12px 16px; border-radius: var(--r); font-size: 13px; font-weight: 500; }
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
  .stock-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 500; }
  .stock-ok { background: rgba(62,242,160,0.1); color: var(--accent2); }
  .stock-low { background: rgba(242,165,62,0.12); color: #f2a53e; }
  .stock-out { background: rgba(242,90,62,0.12); color: var(--danger); }
  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; background: var(--bg); }
  .tab-row { display: flex; gap: 8px; margin-bottom: 20px; }
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
  .bulk-grid { display: grid; grid-template-columns: repeat(5, 1fr) 36px; gap: 8px; align-items: center; margin-bottom: 8px; }
  .bulk-header { display: grid; grid-template-columns: repeat(5, 1fr) 36px; gap: 8px; margin-bottom: 6px; }
  .search-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: var(--card); border: 1px solid var(--border); border-radius: var(--r); z-index: 50; max-height: 200px; overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  .search-option { padding: 10px 14px; font-size: 13px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .search-option:last-child { border-bottom: none; }
  .search-option:hover { background: rgba(181,242,62,0.06); color: var(--accent); }
  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .sidebar { width: 60px; }
    .sidebar-logo, .nav-item span, .nav-section, .user-info { display: none; }
    .main { margin-left: 60px; padding: 24px 16px; }
    .grid-2 { grid-template-columns: 1fr; }
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
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function buildChartData(history, forecastDays = 7) {
  if (!history.length) return { chartData: [], slope: 0 };
  const { slope, intercept } = linearRegression(history);
  const base = history.map((h, i) => ({ ...h, line: Math.round(intercept + slope * i) }));
  const lastDate = new Date();
  for (let i = 1; i <= forecastDays; i++) {
    const d = new Date(); d.setDate(lastDate.getDate() + i);
    const label = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    base.push({ date: label, actual: null, predicted: Math.max(0, Math.round(intercept + slope * (history.length - 1 + i))) });
  }
  return { chartData: base, slope };
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
        } else {
          setErr("Check your email to confirm your account, then sign in.");
        }
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
  const todaySales = history[history.length - 1]?.actual || 0;
  const yesterdaySales = history[history.length - 2]?.actual || 0;
  const pct = yesterdaySales ? (((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1) : 0;
  const weekTotal = history.slice(-7).reduce((s, d) => s + (d.actual || 0), 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.low_threshold).length;
  const outStock = products.filter((p) => p.stock === 0).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Sales overview and 7-day forecast</div>
      </div>
      {sales.length === 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No sales data yet</div>
            <div className="empty-sub">Start recording your daily sales to see forecasts and trends here.</div>
            <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>→ Go to "Record Sales" to add your first entry</div>
          </div>
        </div>
      )}
      {sales.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Today's Sales</div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>₱{todaySales.toLocaleString()}</div>
            <div className={`stat-badge ${Number(pct) >= 0 ? "badge-up" : "badge-down"}`}>{Number(pct) >= 0 ? "▲" : "▼"} {Math.abs(pct)}% vs yesterday</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Week</div>
            <div className="stat-value">₱{weekTotal.toLocaleString()}</div>
            <div className="stat-badge badge-neutral">Last 7 days</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sales Trend</div>
            <div className="stat-value" style={{ color: trending ? "var(--accent2)" : "var(--danger)", fontSize: 20 }}>{trending ? "↑ Going up" : "↓ Going down"}</div>
            <div className={`stat-badge ${trending ? "badge-up" : "badge-down"}`}>{trending ? "Positive" : "Negative"} slope</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Stock Alerts</div>
            <div className="stat-value" style={{ color: outStock > 0 ? "var(--danger)" : "var(--accent2)" }}>{lowStock + outStock}</div>
            <div className="stat-badge badge-down">{outStock} out · {lowStock} low</div>
          </div>
        </div>
      )}
      {sales.length >= 3 && (
        <div className="card">
          <div className="card-title">Sales history + 7-day forecast</div>
          <div className={`forecast-pill ${trending ? "fp-up" : "fp-down"}`}>
            {trending ? "📈 Sales predicted to go UP next week" : "📉 Sales predicted to go DOWN next week"}
          </div>
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
            <span><span style={{ color: "var(--accent2)" }}>- -</span> Predicted (7 days)</span>
          </div>
        </div>
      )}
      {sales.length > 0 && sales.length < 3 && (
        <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
          <div style={{ fontFamily: "var(--font-h)", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Almost there!</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Add at least 3 days of sales data to see your forecast chart. You have {sales.length} so far!</div>
        </div>
      )}
    </div>
  );
}

// ── PRODUCT SEARCH DROPDOWN ───────────────────────────────────────────────────
function ProductSearch({ products, value, onChange, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const filtered = products.filter(p => p.name.toLowerCase().includes(value.toLowerCase()) || p.barcode?.includes(value));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
              <span style={{ color: "var(--muted)", fontSize: 11, marginLeft: 8 }}>{p.stock} {p.unit} left</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SALES ENTRY ───────────────────────────────────────────────────────────────
function SalesEntry({ sales, onAdd, userId, products, onUpdateProducts }) {
  const [tab, setTab] = useState("quick");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quick sale
  const [qForm, setQForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });

  // Itemized sale
  const [iDate, setIDate] = useState(new Date().toISOString().slice(0, 10));
  const [iNote, setINote] = useState("");
  const [items, setItems] = useState([{ search: "", product: null, qty: 1, price: 0 }]);

  const iTotal = items.reduce((s, i) => s + (i.product ? i.qty * i.price : 0), 0);

  const addItem = () => setItems([...items, { search: "", product: null, qty: 1, price: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, changes) => setItems(items.map((it, i) => i === idx ? { ...it, ...changes } : it));

  const selectProduct = (idx, prod) => {
    updateItem(idx, { search: prod.name, product: prod, price: prod.price, qty: 1 });
  };

  const submitQuick = async () => {
    if (!qForm.amount || isNaN(qForm.amount) || Number(qForm.amount) <= 0)
      return setMsg({ type: "error", text: "Enter a valid sales amount (₱)." });
    setLoading(true);
    const entry = { user_id: userId, date: qForm.date, amount: Number(qForm.amount), note: qForm.note };
    const { error } = await supabase.from("sales").insert(entry);
    setLoading(false);
    if (error) return setMsg({ type: "error", text: error.message });
    onAdd(entry);
    setMsg({ type: "success", text: `₱${Number(qForm.amount).toLocaleString()} recorded for ${qForm.date} ✓` });
    setQForm({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });
    setTimeout(() => setMsg(null), 3000);
  };

  const submitItemized = async () => {
    const validItems = items.filter(i => i.product && i.qty > 0);
    if (!validItems.length) return setMsg({ type: "error", text: "Add at least one product to the sale." });

    // Check stock
    for (const it of validItems) {
      if (it.qty > it.product.stock)
        return setMsg({ type: "error", text: `Not enough stock for ${it.product.name}. Only ${it.product.stock} ${it.product.unit} left.` });
    }

    setLoading(true);
    const total = validItems.reduce((s, i) => s + i.qty * i.price, 0);
    const note = iNote || validItems.map(i => `${i.product.name} x${i.qty}`).join(", ");
    const entry = { user_id: userId, date: iDate, amount: total, note };
    const { error } = await supabase.from("sales").insert(entry);
    if (error) { setLoading(false); return setMsg({ type: "error", text: error.message }); }

    // Deduct stock
    for (const it of validItems) {
      const newStock = it.product.stock - it.qty;
      await supabase.from("products").update({ stock: newStock }).eq("id", it.product.id);
    }
    const updatedProducts = products.map(p => {
      const sold = validItems.find(i => i.product.id === p.id);
      return sold ? { ...p, stock: p.stock - sold.qty } : p;
    });
    onUpdateProducts(updatedProducts);
    onAdd(entry);
    setLoading(false);
    setMsg({ type: "success", text: `₱${total.toLocaleString()} itemized sale recorded ✓ — stock updated automatically` });
    setItems([{ search: "", product: null, qty: 1, price: 0 }]);
    setINote("");
    setTimeout(() => setMsg(null), 4000);
  };

  const history = sales.map(s => ({ date: s.date, actual: s.amount }));
  const { chartData, slope } = buildChartData(history, 30);
  const trending = slope >= 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Record Sales</div>
        <div className="page-sub">Log your daily sales — quick total or itemized per product</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="tab-row">
            <button className={`tab-btn ${tab === "quick" ? "active" : ""}`} onClick={() => setTab("quick")}>⚡ Quick Sale</button>
            <button className={`tab-btn ${tab === "itemized" ? "active" : ""}`} onClick={() => setTab("itemized")}>🧾 Itemized Sale</button>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {tab === "quick" && (
            <>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="input-field" type="date" value={qForm.date} onChange={(e) => setQForm({ ...qForm, date: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Total sales amount (₱)</label>
                <input className="input-field" type="number" placeholder="e.g. 2500" value={qForm.amount} onChange={(e) => setQForm({ ...qForm, amount: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submitQuick()} />
              </div>
              <div className="input-group">
                <label className="input-label">Note (optional)</label>
                <input className="input-field" placeholder="e.g. holiday, rainy day..." value={qForm.note} onChange={(e) => setQForm({ ...qForm, note: e.target.value })} />
              </div>
              <button className="btn btn-primary" onClick={submitQuick} disabled={loading}>{loading ? "Saving..." : "Save Sales Record →"}</button>
            </>
          )}

          {tab === "itemized" && (
            <>
              <div className="grid-2" style={{ marginBottom: 12 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Date</label>
                  <input className="input-field" type="date" value={iDate} onChange={(e) => setIDate(e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Note (optional)</label>
                  <input className="input-field" placeholder="e.g. morning sales..." value={iNote} onChange={(e) => setINote(e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div className="item-row-header">
                  <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Product</span>
                  <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Qty</span>
                  <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Price</span>
                  <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Subtotal</span>
                  <span></span>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <ProductSearch
                      products={products}
                      value={item.search}
                      onChange={(v) => updateItem(idx, { search: v, product: null })}
                      onSelect={(p) => selectProduct(idx, p)}
                    />
                    <input className="input-field" type="number" min="1" value={item.qty}
                      onChange={(e) => updateItem(idx, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                      style={{ padding: "11px 8px", textAlign: "center" }} />
                    <input className="input-field" type="number" value={item.price}
                      onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                      style={{ padding: "11px 8px" }} />
                    <div style={{ fontFamily: "var(--font-h)", fontWeight: 700, color: "var(--accent)", fontSize: 14, textAlign: "right" }}>
                      ₱{(item.qty * item.price).toLocaleString()}
                    </div>
                    <button className="btn btn-danger" style={{ padding: "8px 10px", fontSize: 14 }} onClick={() => removeItem(idx)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: "9px" }} onClick={addItem}>+ Add another product</button>
              </div>

              <div className="total-box">
                <span className="total-label">Total Sale Amount</span>
                <span className="total-value">₱{iTotal.toLocaleString()}</span>
              </div>
              <button className="btn btn-primary" onClick={submitItemized} disabled={loading || iTotal === 0}>
                {loading ? "Saving..." : `Save Itemized Sale — ₱${iTotal.toLocaleString()} →`}
              </button>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title">30-day forecast</div>
          {sales.length < 3 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📈</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Add at least 3 sales records to see your forecast here.</div>
            </div>
          ) : (
            <>
              <div className={`forecast-pill ${trending ? "fp-up" : "fp-down"}`}>
                {trending ? "📈 Next 30 days: GROWTH expected" : "📉 Next 30 days: DECLINE expected"}
              </div>
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
            <thead><tr><th>Date</th><th>Amount</th><th>Note</th></tr></thead>
            <tbody>
              {[...sales].reverse().slice(0, 20).map((s, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--muted)" }}>{s.date}</td>
                  <td style={{ fontFamily: "var(--font-h)", fontWeight: 700, color: "var(--accent)" }}>₱{s.amount?.toLocaleString()}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{s.note || "—"}</td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan={3} style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>No sales recorded yet.</td></tr>}
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
      <div className="card"><div className="empty-state">
        <div className="empty-icon">📈</div>
        <div className="empty-title">Not enough data yet</div>
        <div className="empty-sub">Add at least 3 days of sales records to generate a forecast.</div>
      </div></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sales Forecast</div>
        <div className="page-sub">Predicted trend based on your sales history</div>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Trend direction</div>
          <div className="stat-value" style={{ color: trending ? "var(--accent2)" : "var(--danger)", fontSize: 22 }}>{trending ? "Going UP ↑" : "Going DOWN ↓"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Slope (per day)</div>
          <div className="stat-value" style={{ fontSize: 24 }}>₱{Math.abs(slope).toFixed(0)}</div>
          <div className={`stat-badge ${trending ? "badge-up" : "badge-down"}`}>{trending ? "gaining" : "losing"} per day avg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Predicted in {period} days</div>
          <div className="stat-value" style={{ color: "var(--accent)", fontSize: 24 }}>₱{predicted.toLocaleString()}</div>
        </div>
      </div>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Forecast chart</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[7, 14, 30].map((d) => (
              <button key={d} className={`btn ${period === d ? "btn-primary" : "btn-secondary"}`} style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => setPeriod(d)}>{d} days</button>
            ))}
          </div>
        </div>
        <div className={`forecast-pill ${trending ? "fp-up" : "fp-down"}`}>
          {trending ? `📈 Expected to GROW by ₱${(slope * period).toFixed(0)} over next ${period} days` : `📉 Expected to DROP by ₱${Math.abs(slope * period).toFixed(0)} over next ${period} days`}
        </div>
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
          <span><span style={{ color: "var(--accent2)" }}>- -</span> Forecast ({period} days ahead)</span>
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
  const [addMode, setAddMode] = useState("none"); // none | single | bulk
  const [saving, setSaving] = useState(false);

  // Single product form
  const [newProd, setNewProd] = useState({ barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 });

  // Bulk product rows
  const [bulkRows, setBulkRows] = useState([
    { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 },
    { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 },
    { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 },
  ]);

  const addBulkRow = () => setBulkRows([...bulkRows, { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 }]);
  const removeBulkRow = (idx) => setBulkRows(bulkRows.filter((_, i) => i !== idx));
  const updateBulkRow = (idx, field, val) => setBulkRows(bulkRows.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  const handleScan = useCallback(async (code) => {
    if (!code.trim()) return;
    const prod = products.find((p) => p.barcode === code.trim());
    if (prod) {
      const newStock = prod.stock + 1;
      await supabase.from("products").update({ stock: newStock }).eq("id", prod.id);
      onUpdate(products.map((p) => p.id === prod.id ? { ...p, stock: newStock } : p));
      setFeedback({ type: "success", text: `✓ Scanned: ${prod.name} — stock now ${newStock} ${prod.unit}` });
    } else {
      setFeedback({ type: "error", text: `Barcode ${code} not found. Add it manually below.` });
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
    if (!window.confirm(`Delete "${prod.name}" from inventory?`)) return;
    await supabase.from("products").delete().eq("id", prod.id);
    onUpdate(products.filter(p => p.id !== prod.id));
  };

  const addSingleProduct = async () => {
    if (!newProd.name) return;
    setSaving(true);
    const entry = { ...newProd, user_id: userId, price: Number(newProd.price), stock: Number(newProd.stock), low_threshold: Number(newProd.low_threshold) };
    const { data, error } = await supabase.from("products").insert(entry).select().single();
    setSaving(false);
    if (error) return;
    onUpdate([...products, data]);
    setNewProd({ barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 });
    setAddMode("none");
  };

  const addBulkProducts = async () => {
    const valid = bulkRows.filter(r => r.name.trim());
    if (!valid.length) return;
    setSaving(true);
    const entries = valid.map(r => ({ ...r, user_id: userId, price: Number(r.price), stock: Number(r.stock), low_threshold: Number(r.low_threshold) }));
    const { data, error } = await supabase.from("products").insert(entries).select();
    setSaving(false);
    if (error) return;
    onUpdate([...products, ...data]);
    setBulkRows([
      { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 },
      { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 },
      { barcode: "", name: "", price: "", stock: "", unit: "pc", low_threshold: 10 },
    ]);
    setAddMode("none");
  };

  const stockStatus = (p) => {
    if (p.stock === 0) return { cls: "stock-out", label: "Out of stock" };
    if (p.stock <= p.low_threshold) return { cls: "stock-low", label: "Low stock" };
    return { cls: "stock-ok", label: `${p.stock} ${p.unit}` };
  };

  const UNITS = ["pc","pack","bottle","sachet","stick","box","can","kg","g"];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Inventory</div>
        <div className="page-sub">Scan barcodes or manage stock manually</div>
      </div>

      {/* Scanner */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">USB Barcode Scanner</div>
        <div className={`scanner-area ${scanFocus ? "active" : ""}`} onClick={() => document.getElementById("scanInput")?.focus()}>
          <div className="scanner-icon">📷</div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>
            {scanFocus ? "Ready — scan a barcode now" : "Click here to activate scanner"}
          </div>
          <input id="scanInput" className="input-field" style={{ maxWidth: 320, margin: "0 auto", textAlign: "center", letterSpacing: 2 }}
            placeholder="Barcode number..." value={scanCode}
            onChange={(e) => setScanCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan(scanCode)}
            onFocus={() => setScanFocus(true)} onBlur={() => setScanFocus(false)} />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>USB scanner types the barcode → auto adds +1 stock</div>
        </div>
        {feedback && <div className={`scanner-feedback ${feedback.type === "success" ? "feedback-success" : "feedback-error"}`}>{feedback.text}</div>}
      </div>

      {/* Add buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className={`btn ${addMode === "single" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAddMode(addMode === "single" ? "none" : "single")}>+ Add Single Product</button>
        <button className={`btn ${addMode === "bulk" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAddMode(addMode === "bulk" ? "none" : "bulk")}>+ Bulk Add Products</button>
      </div>

      {/* Single add form */}
      {addMode === "single" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Add single product</div>
          <div className="grid-3">
            <div className="input-group"><label className="input-label">Barcode / SKU</label><input className="input-field" placeholder="Scan or type barcode" value={newProd.barcode} onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Product name *</label><input className="input-field" placeholder="e.g. Pepsi 330ml" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Price (₱)</label><input className="input-field" type="number" placeholder="25" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Starting stock</label><input className="input-field" type="number" placeholder="0" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Unit</label>
              <select className="input-field" value={newProd.unit} onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Low stock alert at</label><input className="input-field" type="number" placeholder="10" value={newProd.low_threshold} onChange={(e) => setNewProd({ ...newProd, low_threshold: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={addSingleProduct} disabled={saving}>{saving ? "Saving..." : "Save Product →"}</button>
            <button className="btn btn-secondary" onClick={() => setAddMode("none")}>Cancel</button>
          </div>
        </div>
      )}

      {/* Bulk add form */}
      {addMode === "bulk" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Bulk add products — fill in as many rows as you need</div>
          <div className="bulk-header">
            {["Barcode","Name *","Price (₱)","Stock","Unit","Low Alert",""].map((h, i) => (
              <span key={i} style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</span>
            ))}
          </div>
          {bulkRows.map((row, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr 36px", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input className="input-field" placeholder="Barcode" value={row.barcode} onChange={(e) => updateBulkRow(idx, "barcode", e.target.value)} style={{ padding: "9px 10px" }} />
              <input className="input-field" placeholder="Product name" value={row.name} onChange={(e) => updateBulkRow(idx, "name", e.target.value)} style={{ padding: "9px 10px" }} />
              <input className="input-field" type="number" placeholder="0" value={row.price} onChange={(e) => updateBulkRow(idx, "price", e.target.value)} style={{ padding: "9px 10px" }} />
              <input className="input-field" type="number" placeholder="0" value={row.stock} onChange={(e) => updateBulkRow(idx, "stock", e.target.value)} style={{ padding: "9px 10px" }} />
              <select className="input-field" value={row.unit} onChange={(e) => updateBulkRow(idx, "unit", e.target.value)} style={{ padding: "9px 10px" }}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              <input className="input-field" type="number" placeholder="10" value={row.low_threshold} onChange={(e) => updateBulkRow(idx, "low_threshold", e.target.value)} style={{ padding: "9px 10px" }} />
              <button className="btn btn-danger" style={{ padding: "8px 10px" }} onClick={() => removeBulkRow(idx)}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={addBulkRow}>+ Add row</button>
            <button className="btn btn-primary" onClick={addBulkProducts} disabled={saving}>{saving ? "Saving..." : `Save All Products →`}</button>
            <button className="btn btn-secondary" onClick={() => setAddMode("none")}>Cancel</button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="card">
        <div className="card-title">All products ({products.length})</div>
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No products yet</div>
            <div className="empty-sub">Add your first product using the buttons above.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Product</th><th>Barcode</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const s = stockStatus(p);
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
                        ) : (<span className={`stock-pill ${s.cls}`}>{s.label}</span>)}
                      </td>
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

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("store_name").eq("id", session.user.id).single();
        setUser({ ...session.user, storeName: profile?.store_name || session.user.email });
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

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen">
        <div className="spinner"></div>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>Loading SalesForecast...</div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{CSS}</style>
      <LoginPage onLogin={setUser} />
    </>
  );

  const NAV = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "sales", icon: "💰", label: "Record Sales" },
    { id: "forecast", icon: "📈", label: "Forecast" },
    { id: "inventory", icon: "📦", label: "Inventory" },
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
          {page === "sales" && <SalesEntry sales={sales} onAdd={(s) => setSales([...sales, s])} userId={user.id} products={products} onUpdateProducts={setProducts} />}
          {page === "forecast" && <ForecastPage sales={sales} />}
          {page === "inventory" && <Inventory products={products} onUpdate={setProducts} userId={user.id} />}
        </main>
      </div>
    </>
  );
}

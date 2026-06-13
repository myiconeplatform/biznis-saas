import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ============ COLORS ============
const C = {
  bg: "#0f1117", surface: "#1a1d2e", card: "#222538",
  accent: "#6c63ff", accentLight: "#8b85ff", green: "#22d3a0",
  orange: "#f97316", red: "#ef4444", yellow: "#facc15",
  text: "#e8eaf6", muted: "#7b80a0", border: "#2e3250",
};

// ============ LOGIN PAGE ============
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email oswa modpass enkòrèk!");
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ background: C.surface, borderRadius: 16, padding: 40, width: 360, border: `1px solid ${C.border}` }}>
        <h1 style={{ color: C.accentLight, marginBottom: 8, fontSize: 24 }}>BiznisPro</h1>
        <p style={{ color: C.muted, marginBottom: 24, fontSize: 14 }}>Konekte nan kont ou</p>
        {error && <div style={{ background: "#ef444422", color: C.red, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} />
        <input type="password" placeholder="Modpass" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14, marginBottom: 20, boxSizing: "border-box" }} />
        <button onClick={handleLogin} disabled={loading}
          style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {loading ? "Koneksyon..." : "Konekte"}
        </button>
      </div>
    </div>
  );
}

// ============ CEO DASHBOARD ============
function CEODashboard({ user, onLogout }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("tenants").select("*");
    setTenants(data || []);
    setLoading(false);
  }

  async function addTenant() {
    const name = prompt("Non kliyan nouvo a:");
    const email = prompt("Email kliyan an:");
    if (!name) return;
    const { error } = await supabase.from("tenants").insert({ name, email, status: "aktif" });
    if (!error) loadData();
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif", color: C.text }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ color: C.accentLight, fontWeight: 800, fontSize: 20 }}>👑 BiznisPro</span>
          <span style={{ color: C.muted, fontSize: 13, marginLeft: 12 }}>Dashboard CEO</span>
        </div>
        <button onClick={onLogout} style={{ background: C.red + "33", color: C.red, border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          Dekonekte
        </button>
      </div>

      <div style={{ padding: 28 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
          <div style={{ background: C.card, borderRadius: 14, padding: 20, borderTop: `3px solid ${C.green}` }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.green }}>{tenants.length}</div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Total Kliyan</div>
          </div>
          <div style={{ background: C.card, borderRadius: 14, padding: 20, borderTop: `3px solid ${C.accent}` }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.accentLight }}>{tenants.filter(t => t.status === "aktif").length}</div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Kliyan Aktif</div>
          </div>
          <div style={{ background: C.card, borderRadius: 14, padding: 20, borderTop: `3px solid ${C.orange}` }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.orange }}>{tenants.filter(t => t.status !== "aktif").length}</div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase" }}>Kliyan Inaktif</div>
          </div>
        </div>

        {/* Tenants List */}
        <div style={{ background: C.card, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>🏢 Lis Kliyan yo</h2>
            <button onClick={addTenant} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              + Ajoute Kliyan
            </button>
          </div>

          {loading ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Chajman...</div>
          ) : tenants.length === 0 ? (
            <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Pa gen kliyan encore</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>Non</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>Email</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>Telefòn</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>Estati</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: C.muted, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>Dat</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id}>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, borderBottom: `1px solid ${C.border}18` }}>{t.name}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: C.muted, borderBottom: `1px solid ${C.border}18` }}>{t.email}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: C.muted, borderBottom: `1px solid ${C.border}18` }}>{t.phone}</td>
                    <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}18` }}>
                      <span style={{ background: t.status === "aktif" ? C.green + "22" : C.red + "22", color: t.status === "aktif" ? C.green : C.red, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted, borderBottom: `1px solid ${C.border}18` }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ TENANT DASHBOARD ============
function TenantDashboard({ user, profile, onLogout }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif", color: C.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
        <h2 style={{ color: C.accentLight }}>Byenveni!</h2>
        <p style={{ color: C.muted }}>Dashboard kliyan ap vini byento...</p>
        <button onClick={onLogout} style={{ background: C.red + "33", color: C.red, border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginTop: 20 }}>
          Dekonekte
        </button>
      </div>
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: "sans-serif" }}>
      Chajman...
    </div>
  );

  if (!session) return <LoginPage />;

  if (profile?.role === "ceo") return <CEODashboard user={session.user} onLogout={handleLogout} />;

  return <TenantDashboard user={session.user} profile={profile} onLogout={handleLogout} />;
}

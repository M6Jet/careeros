"use client";
import { useEffect, useState } from "react";

export default function GithubPage() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/github/sync").then(r => (r.ok ? r.json() : null)).then(p => {
      if (p) { setProfile(p); setUsername(p.username); }
    }).catch(() => {});
  }, []);

  async function connect() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/github/sync", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, token: token || undefined }),
    });
    const data = await r.json();
    if (r.ok) { setProfile(data); setMsg("Connected ✓"); setToken(""); }
    else setMsg(data.error ?? "Failed");
    setBusy(false);
  }

  const stats = profile?.stats;
  return (
    <div>
      <h1>GitHub</h1>
      <div className="card">
        <b>Connect your GitHub</b>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>
          Username alone works for public data. For private repos or higher rate limits, add a
          Personal Access Token (github.com → Settings → Developer settings → Tokens → classic,
          scope: <code>repo</code> or none for public-only).
        </p>
        <input placeholder="GitHub username" value={username} onChange={e => setUsername(e.target.value)} style={inp} />
        <input placeholder="Personal Access Token (optional)" type="password" value={token} onChange={e => setToken(e.target.value)} style={inp} />
        <button onClick={connect} disabled={busy || !username} style={btn}>{busy ? "Syncing…" : profile ? "Re-sync" : "Connect"}</button>
        {msg && <span style={{ marginLeft: 10, fontSize: 13 }}>{msg}</span>}
      </div>
      {stats && (
        <div className="card">
          <b>@{profile.username}</b>
          <div style={{ display: "flex", gap: 24, margin: "12px 0", fontSize: 14 }}>
            <span>📦 {stats.publicRepos} repos</span>
            <span>⭐ {stats.stars} stars</span>
            <span>💾 {stats.commits} recent commits</span>
            <span>🔀 {stats.prs} recent PRs</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Top languages: {Object.entries(stats.languages ?? {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([l]) => l).join(", ") || "—"}
          </div>
          <table style={{ width: "100%", marginTop: 12, fontSize: 13, borderCollapse: "collapse" }}>
            <tbody>
              {(stats.repos ?? []).slice(0, 15).map((r: any) => (
                <tr key={r.name} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 4px" }}><a href={r.url} target="_blank" style={{ color: "var(--accent)" }}>{r.name}</a></td>
                  <td style={{ color: "var(--muted)" }}>{r.language ?? ""}</td>
                  <td>⭐ {r.stars}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
const inp: React.CSSProperties = { display: "block", width: "100%", maxWidth: 420, padding: "9px 12px", marginBottom: 10,
  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14 };
const btn: React.CSSProperties = { padding: "9px 18px", background: "var(--accent)", color: "#fff",
  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" };

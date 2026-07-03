"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (mode === "signup") {
        const r = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!r.ok) { setErr((await r.json()).error ?? "Signup failed"); setBusy(false); return; }
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) setErr("Invalid email or password");
      else window.location.href = "/";
    } catch { setErr("Something went wrong — try again"); }
    setBusy(false);
  }

  return (
    <div style={{ maxWidth: 380, margin: "60px auto" }}>
      <div className="card">
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>🚀 CareerOS</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </p>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inp} />
          )}
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
          <input type="password" required placeholder="Password (8+ characters)" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
          {err && <div style={{ color: "#f85149", fontSize: 13, marginBottom: 10 }}>{err}</div>}
          <button type="submit" disabled={busy} style={btn}>
            {busy ? "…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 14 }}>
          {mode === "login" ? "No account? " : "Already have an account? "}
          <a style={{ color: "var(--accent)", cursor: "pointer" }}
             onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </a>
        </p>
      </div>
    </div>
  );
}
const inp: React.CSSProperties = { display: "block", width: "100%", padding: "10px 12px", marginBottom: 10,
  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 14 };
const btn: React.CSSProperties = { width: "100%", padding: "10px", background: "var(--accent)", color: "#fff",
  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" };

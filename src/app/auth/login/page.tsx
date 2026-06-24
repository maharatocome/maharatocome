"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email, password, redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #6366F1, #10B981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={24} color="white" fill="white" />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 800, background: "linear-gradient(135deg, #6366F1, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MAHARAtoCOME</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "6px" }}>Bon retour !</h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Connectez-vous à votre compte professionnel</p>
        </div>



        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="form-label">Adresse email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                id="login-email"
                type="email"
                className="input-field"
                style={{ paddingLeft: "38px" }}
                placeholder="vous@exemple.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Mot de passe</label>
              <Link href="/auth/forgot-password" style={{ fontSize: "12px", color: "var(--color-primary)", textDecoration: "none" }}>Mot de passe oublié ?</Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input type="password" minLength={6} className="input-field" style={{ paddingLeft: "40px" }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px" }}>
              <AlertCircle size={14} color="#F87171" />
              <span style={{ fontSize: "13px", color: "#F87171" }}>{error}</span>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ justifyContent: "center", padding: "13px", marginTop: "4px", fontSize: "15px" }}
          >
            {loading ? "Connexion..." : <><span>Se connecter</span> <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="divider" style={{ marginTop: "24px" }} />
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Pas encore de compte ?{" "}
          <Link href="/auth/register" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

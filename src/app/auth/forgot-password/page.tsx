"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) setError(data.error || "Une erreur est survenue.");
      else setMessage("Si cet e-mail existe, un lien de réinitialisation vous a été envoyé.");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>
      <Navbar />
      <div className="page-container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="glass-card" style={{ maxWidth: "400px", width: "100%", padding: "40px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Mail size={24} color="#6366F1" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Mot de passe oublié ?</h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
          </div>

          {error && (
            <div style={{ padding: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#EF4444", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
              {error}
            </div>
          )}

          {message ? (
            <div style={{ padding: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", color: "#22C55E", fontSize: "14px", marginBottom: "24px", textAlign: "center" }}>
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label className="form-label">Adresse e-mail</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input type="email" className="input-field" style={{ paddingLeft: "40px" }} placeholder="vous@exemple.dz" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: "12px", fontSize: "15px", marginTop: "8px", display: "flex", justifyContent: "center", gap: "8px" }} disabled={loading}>
                {loading ? "Envoi en cours..." : <><Send size={16} /> Envoyer le lien</>}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center" }}>
            <Link href="/auth/login" style={{ fontSize: "14px", color: "var(--color-text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-primary)")} onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}>
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!token) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Lien invalide ou expiré.</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) setError(data.error || "Une erreur est survenue.");
      else {
        setMessage("Votre mot de passe a été réinitialisé avec succès.");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card" style={{ maxWidth: "400px", width: "100%", padding: "40px", margin: "auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Lock size={24} color="#6366F1" />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Nouveau mot de passe</h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Veuillez choisir un nouveau mot de passe sécurisé.</p>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#EF4444", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
          {error}
        </div>
      )}

      {message ? (
        <div style={{ padding: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", color: "#22C55E", fontSize: "14px", marginBottom: "24px", textAlign: "center" }}>
          <CheckCircle size={24} style={{ display: "block", margin: "0 auto 10px" }} />
          {message}
          <p style={{ fontSize: "12px", marginTop: "10px" }}>Redirection vers la page de connexion...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="form-label">Nouveau mot de passe</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input type="password" minLength={6} className="input-field" style={{ paddingLeft: "40px" }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="form-label">Confirmer le mot de passe</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input type="password" minLength={6} className="input-field" style={{ paddingLeft: "40px" }} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "12px", fontSize: "15px", marginTop: "8px" }} disabled={loading}>
            {loading ? "Enregistrement..." : "Réinitialiser mon mot de passe"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>
      <Navbar />
      <div className="page-container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <Suspense fallback={<div>Chargement...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Zap, Mail, Lock, User, MapPin, Briefcase, ArrowRight, AlertCircle } from "lucide-react";

const ALGERIAN_CITIES = ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Sétif", "Tlemcen", "Béjaïa", "Tizi Ouzou", "Djelfa", "Sidi Bel Abbès", "Biskra", "Médéa", "Mostaganem", "Skikda", "Ouargla", "Chlef", "Tiaret", "Remote"];

const ACCOUNT_TYPES = [
  { value: "EXPERT", label: "💼 Expert", desc: "Je propose mes services" },
  { value: "PME", label: "🏢 PME / Entreprise", desc: "Je recherche des talents" },
  { value: "CHERCHEUR", label: "🎓 Chercheur d'emploi", desc: "Je recherche une opportunité" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", password: "", title: "", city: "Alger", type: "EXPERT", bio: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim()) {
      setError("Le prénom et le nom sont obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const name = `${form.prenom.trim()} ${form.nom.trim()}`;
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'inscription.");
        setLoading(false);
        return;
      }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/");
    } catch {
      setError("Erreur réseau.");
      setLoading(false);
    }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #6366F1, #10B981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <span style={{ fontSize: "22px", fontWeight: 800, background: "linear-gradient(135deg, #6366F1, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MAHARAtoCOME</span>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Rejoignez la communauté</h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Connectez votre talent au marché algérien</p>
        </div>

        {/* Type selector */}
        <div style={{ marginBottom: "20px" }}>
          <label className="form-label">Type de compte</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => update("type", t.value)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
                  background: form.type === t.value ? "var(--color-primary-light)" : "var(--color-bg-elevated)",
                  border: `1px solid ${form.type === t.value ? "var(--color-primary)" : "var(--color-border)"}`,
                  borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>{t.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="form-label">Prénom *</label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input id="reg-prenom" type="text" className="input-field" style={{ paddingLeft: "34px" }} placeholder="Karim" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} required minLength={2} />
              </div>
            </div>
            <div>
              <label className="form-label">Nom *</label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input id="reg-nom" type="text" className="input-field" style={{ paddingLeft: "34px" }} placeholder="Benali" value={form.nom} onChange={(e) => update("nom", e.target.value)} required minLength={2} />
              </div>
            </div>
          </div>
          <div>
            <label className="form-label">Titre professionnel</label>
            <div style={{ position: "relative" }}>
              <Briefcase size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input type="text" className="input-field" style={{ paddingLeft: "34px" }} placeholder="Dev Full Stack" value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Email *</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input id="reg-email" type="email" className="input-field" style={{ paddingLeft: "34px" }} placeholder="vous@exemple.dz" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="form-label">Mot de passe *</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input id="reg-password" type="password" className="input-field" style={{ paddingLeft: "34px" }} placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
              </div>
            </div>
            <div>
              <label className="form-label">Ville</label>
              <div style={{ position: "relative" }}>
                <MapPin size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
                <select className="select-field" style={{ paddingLeft: "34px" }} value={form.city} onChange={(e) => update("city", e.target.value)}>
                  {ALGERIAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Bio courte</label>
            <textarea className="textarea-field" style={{ minHeight: "80px" }} placeholder="Décrivez votre expertise en quelques lignes..." value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px" }}>
              <AlertCircle size={14} color="#F87171" />
              <span style={{ fontSize: "13px", color: "#F87171" }}>{error}</span>
            </div>
          )}

          <button id="reg-submit" type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: "center", padding: "13px", fontSize: "15px" }}>
            {loading ? "Création..." : <><span>Créer mon profil</span> <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="divider" style={{ marginTop: "20px" }} />
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Déjà un compte ?{" "}
          <Link href="/auth/login" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

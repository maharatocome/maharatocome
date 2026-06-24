"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Send, MapPin, DollarSign, Clock, X, Info } from "lucide-react";

const ALGERIAN_CITIES = ["Alger","Oran","Constantine","Annaba","Blida","Batna","Sétif","Tlemcen","Béjaïa","Tizi Ouzou","Remote","Toutes les villes"];

interface Skill { id: string; name: string; category: string; }

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = (session?.user as { id?: string })?.id;

  const [form, setForm] = useState({ type: "OFFRE", title: "", content: "", budget: "", duration: "", location: "Remote" });
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    fetch("/api/skills").then((r) => r.json()).then((d) => setAllSkills(Array.isArray(d) ? d : []));
  }, [status, router]);

  function toggleSkill(skill: Skill) {
    setSelectedSkills((prev) =>
      prev.find((s) => s.id === skill.id) ? prev.filter((s) => s.id !== skill.id) : [...prev, skill]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedSkills.length === 0) { setError("Sélectionnez au moins un tag de compétence."); return; }
    if (!userId) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userId, skillIds: selectedSkills.map((s) => s.id) }),
    });
    setLoading(false);
    if (res.ok) router.push("/");
    else setError("Erreur lors de la publication.");
  }

  // Group skills by category
  const grouped = allSkills.reduce((acc: Record<string, Skill[]>, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "60px", maxWidth: "720px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "24px" }}>Publier une annonce</h1>

        <form onSubmit={handleSubmit}>
          {/* Type selector */}
          <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
            <label className="form-label">Type d'annonce *</label>
            <div className="type-toggle" style={{ maxWidth: "400px" }}>
              <button type="button" className={`type-btn ${form.type === "OFFRE" ? "active-offre" : ""}`} onClick={() => setForm((f) => ({ ...f, type: "OFFRE" }))}>
                ✦ Je propose (Offre)
              </button>
              <button type="button" className={`type-btn ${form.type === "RECHERCHE" ? "active-recherche" : ""}`} onClick={() => setForm((f) => ({ ...f, type: "RECHERCHE" }))}>
                ◎ Je recherche
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "12px", padding: "10px 12px", background: form.type === "OFFRE" ? "var(--color-offer-bg)" : "var(--color-search-bg)", borderRadius: "8px", border: `1px solid ${form.type === "OFFRE" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
              <Info size={14} color={form.type === "OFFRE" ? "#10B981" : "#F59E0B"} style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                {form.type === "OFFRE" ? "Vous proposez une compétence ou un service. Ex: expert développeur disponible, designer UX disponible." : "Vous cherchez une compétence ou un prestataire. Ex: startup cherche développeur, PME cherche designer."}
              </p>
            </div>
          </div>

          {/* Contenu */}
          <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
            <div style={{ marginBottom: "14px" }}>
              <label className="form-label">Titre de l'annonce *</label>
              <input type="text" className="input-field" placeholder={form.type === "OFFRE" ? "Ex: Développeur React disponible pour missions" : "Ex: Startup cherche designer UI/UX"} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Description détaillée *</label>
              <textarea className="textarea-field" style={{ minHeight: "160px" }} placeholder="Décrivez en détail votre offre ou besoin : compétences, niveau requis, contexte, livrables attendus..." value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
            </div>
          </div>

          {/* Détails */}
          <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "14px" }}>Informations complémentaires</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="form-label"><Clock size={12} style={{ verticalAlign: "middle" }} /> Durée</label>
                <input type="text" className="input-field" placeholder="Ex: 3 mois, CDI" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
              </div>
              <div>
                <label className="form-label"><MapPin size={12} style={{ verticalAlign: "middle" }} /> Localisation</label>
                <select className="select-field" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}>
                  {ALGERIAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tags de compétences */}
          <div className="glass-card" style={{ padding: "20px", marginBottom: "20px" }}>
            <label className="form-label">Tags de compétences * <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(obligatoire, visible en bas du post)</span></label>

            {selectedSkills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px", padding: "10px", background: "var(--color-bg-elevated)", borderRadius: "10px" }}>
                {selectedSkills.map((s) => (
                  <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", background: "var(--color-primary)", color: "white", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                    {s.name}
                    <button type="button" onClick={() => toggleSkill(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "0", display: "flex" }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {Object.entries(grouped).map(([category, skills]) => (
              <div key={category} style={{ marginBottom: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{category}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {skills.map((s) => (
                    <span key={s.id} className={`skill-tag ${selectedSkills.find((sel) => sel.id === s.id) ? "selected" : ""}`} onClick={() => toggleSkill(s)}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", marginBottom: "16px", color: "#F87171", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn-secondary" onClick={() => router.back()}>Annuler</button>
            <button id="submit-post" type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px 24px", fontSize: "15px" }}>
              <Send size={15} /> {loading ? "Publication..." : "Publier l'annonce"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

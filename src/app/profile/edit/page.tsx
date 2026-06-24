"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Save, Plus, Trash2, MapPin, Briefcase, Globe, Phone, Camera } from "lucide-react";
import { useRef } from "react";

const ALGERIAN_CITIES = ["Alger","Oran","Constantine","Annaba","Blida","Batna","Sétif","Tlemcen","Béjaïa","Tizi Ouzou","Djelfa","Sidi Bel Abbès","Biskra","Médéa","Mostaganem","Skikda","Ouargla","Chlef","Tiaret","Remote"];
const LEVELS = [{ value: "DEBUTANT", label: "Débutant" }, { value: "INTERMEDIAIRE", label: "Intermédiaire" }, { value: "EXPERT", label: "Expert" }];

interface Skill { id: string; name: string; category: string; }
interface UserSkillEntry { skillId: string; skillName: string; level: string; }

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = (session?.user as { id?: string })?.id;

  const [form, setForm] = useState({ name: "", title: "", bio: "", city: "Alger", phone: "", website: "", type: "EXPERT" });
  const [avatar, setAvatar] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkillEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetch(`/api/users/${userId}`).then((r) => r.json()),
      fetch("/api/skills").then((r) => r.json()),
    ]).then(([user, skills]) => {
      setForm({ name: user.name || "", title: user.title || "", bio: user.bio || "", city: user.city || "Alger", phone: user.phone || "", website: user.website || "", type: user.type || "EXPERT" });
      setAvatar(user.avatar || "");
      setUserSkills(user.skills?.map((us: { skill: Skill; level: string }) => ({ skillId: us.skill.id, skillName: us.skill.name, level: us.level })) || []);
      setAllSkills(Array.isArray(skills) ? skills : []);
      setLoading(false);
    });
  }, [userId]);

  function update(key: string, value: string) { setForm((f) => ({ ...f, [key]: value })); }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo trop lourde (max 2 Mo)."); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  function addSkill(skillId: string) {
    const skill = allSkills.find((s) => s.id === skillId);
    if (!skill || userSkills.find((us) => us.skillId === skillId)) return;
    setUserSkills((prev) => [...prev, { skillId, skillName: skill.name, level: "INTERMEDIAIRE" }]);
  }

  const [customSkill, setCustomSkill] = useState("");

  function handleAddCustomSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && customSkill.trim()) {
      e.preventDefault();
      const name = customSkill.trim();
      if (userSkills.find((us) => us.skillName.toLowerCase() === name.toLowerCase())) return;
      setUserSkills((prev) => [...prev, { skillId: `temp-${Date.now()}`, skillName: name, level: "INTERMEDIAIRE" }]);
      setCustomSkill("");
    }
  }

  function removeSkill(skillId: string) { setUserSkills((prev) => prev.filter((us) => us.skillId !== skillId)); }
  function updateSkillLevel(skillId: string, level: string) { setUserSkills((prev) => prev.map((us) => us.skillId === skillId ? { ...us, level } : us)); }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avatar, skills: userSkills.map((us) => ({ name: us.skillName, level: us.level })) }),
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); router.push(`/profile/${userId}`); }, 1500);
  }

  if (loading || status === "loading") return (
    <div><Navbar />
      <div className="page-container" style={{ paddingTop: "40px" }}>
        <div className="glass-card" style={{ padding: "32px" }}>
          <div className="skeleton" style={{ height: 24, width: "30%", marginBottom: "20px" }} />
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44, marginBottom: "16px" }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "60px", maxWidth: "720px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800 }}>Modifier mon profil</h1>
          <button id="save-profile" className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? "Sauvegarde..." : success ? "✓ Sauvegardé !" : "Sauvegarder"}
          </button>
        </div>

        {/* Photo de profil */}
        <div className="glass-card" style={{ padding: "24px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "18px", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Photo de profil</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: "relative" }}>
              <div className="avatar" style={{ width: "72px", height: "72px", fontSize: "22px", flexShrink: 0 }}>
                {avatar ? <img src={avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : getInitials(form.name || "?")}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", border: "2px solid var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Camera size={12} color="white" />
              </button>
            </div>
            <div>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>Choisissez une photo (max 2 Mo)</p>
              <button type="button" className="btn-ghost" style={{ fontSize: "13px" }} onClick={() => fileInputRef.current?.click()}>
                <Camera size={14} /> Changer la photo
              </button>
              {avatar && <button type="button" className="btn-ghost" style={{ fontSize: "13px", color: "var(--color-text-muted)", marginLeft: "8px" }} onClick={() => setAvatar("")}>Supprimer</button>}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        {/* Infos de base */}
        <div className="glass-card" style={{ padding: "24px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "18px", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Informations personnelles</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="form-label">Nom complet *</label>
              <input type="text" className="input-field" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Karim Benali" />
            </div>
            <div>
              <label className="form-label">Titre professionnel</label>
              <div style={{ position: "relative" }}>
                <Briefcase size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input type="text" className="input-field" style={{ paddingLeft: "32px" }} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Développeur Full Stack" />
              </div>
            </div>
            <div>
              <label className="form-label">Ville</label>
              <div style={{ position: "relative" }}>
                <MapPin size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
                <select className="select-field" style={{ paddingLeft: "32px" }} value={form.city} onChange={(e) => update("city", e.target.value)}>
                  {ALGERIAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Type de compte</label>
              <select className="select-field" value={form.type} onChange={(e) => update("type", e.target.value)}>
                <option value="EXPERT">💼 Expert</option>
                <option value="PME">🏢 PME / Entreprise</option>
                <option value="CHERCHEUR">🎓 Chercheur d'emploi</option>
              </select>
            </div>
            <div>
              <label className="form-label">Téléphone</label>
              <div style={{ position: "relative" }}>
                <Phone size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input type="text" className="input-field" style={{ paddingLeft: "32px" }} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+213 555 12 34 56" />
              </div>
            </div>
            <div>
              <label className="form-label">Site web / Portfolio</label>
              <div style={{ position: "relative" }}>
                <Globe size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input type="text" className="input-field" style={{ paddingLeft: "32px" }} value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://monsite.dz" />
              </div>
            </div>
          </div>
          <div style={{ marginTop: "14px" }}>
            <label className="form-label">Bio</label>
            <textarea className="textarea-field" value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Décrivez votre expertise, vos spécialités et ce que vous apportez..." />
          </div>
        </div>

        {/* Compétences */}
        <div className="glass-card" style={{ padding: "24px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "18px", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Compétences</h2>

          {/* Picker */}
          <div style={{ marginBottom: "16px" }}>
            <label className="form-label">Ajouter une compétence</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select className="select-field" style={{ flex: 1, minWidth: "200px" }} id="skill-picker" onChange={(e) => { if (e.target.value) { addSkill(e.target.value); e.target.value = ""; } }}>
                <option value="">Sélectionner une compétence existante...</option>
                {allSkills.filter((s) => !userSkills.find((us) => us.skillId === s.id)).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
              <input 
                type="text" 
                className="input-field" 
                style={{ flex: 1, minWidth: "200px" }}
                placeholder="Ou tapez une compétence et appuyez sur Entrée..." 
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={handleAddCustomSkill}
              />
            </div>
          </div>

          {userSkills.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Aucune compétence sélectionnée</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {userSkills.map((us) => (
                <div key={us.skillId} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--color-bg-elevated)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
                  <span style={{ flex: 1, fontSize: "14px", fontWeight: 500 }}>{us.skillName}</span>
                  <select className="select-field" style={{ width: "160px" }} value={us.level} onChange={(e) => updateSkillLevel(us.skillId, e.target.value)}>
                    {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                  <button onClick={() => removeSkill(us.skillId)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={() => router.back()} className="btn-secondary">Annuler</button>
          <button id="save-profile-bottom" className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}

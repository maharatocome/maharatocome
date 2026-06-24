"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Globe, Phone, Briefcase, Calendar, Download, Edit, Star, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string; name: string; title?: string; bio?: string; city?: string;
  phone?: string; website?: string; type: string; createdAt: string; avatar?: string;
  skills: { skill: { id: string; name: string; category: string }; level: string }[];
  experiences: { id: string; title: string; company: string; location?: string; startDate: string; endDate?: string; current: boolean; description?: string }[];
  posts: { id: string; type: string; title: string; content: string; tags: { skill: { name: string } }[]; createdAt: string }[];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function levelLabel(level: string) {
  const map: Record<string, string> = { EXPERT: "Expert", INTERMEDIAIRE: "Intermédiaire", DEBUTANT: "Débutant" };
  return map[level] || level;
}

function levelClass(level: string) {
  const map: Record<string, string> = { EXPERT: "level-expert", INTERMEDIAIRE: "level-intermediaire", DEBUTANT: "level-debutant" };
  return map[level] || "";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = (session?.user as { id?: string })?.id === id;

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((d) => { setUser(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "40px" }}>
        <div className="glass-card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
            <div className="skeleton avatar-xl" style={{ borderRadius: "50%" }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 24, width: "40%", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: 14, width: "30%" }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 80 }} />
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div><Navbar />
      <div className="page-container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <div className="glass-card" style={{ padding: "48px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>👤</div>
          <p style={{ color: "var(--color-text-secondary)" }}>Profil introuvable</p>
        </div>
      </div>
    </div>
  );

  const typeClass = user.type === "EXPERT" ? "type-expert" : user.type === "PME" ? "type-pme" : "type-chercheur";

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "60px", maxWidth: "900px" }}>

        {/* Profile Header Card */}
        <div className="glass-card" style={{ padding: "32px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
            <div className="avatar avatar-xl" style={{ flexShrink: 0, boxShadow: "0 0 0 4px rgba(99,102,241,0.2)" }}>
              {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(user.name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "6px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--color-text-primary)" }}>{user.name}</h1>
                <span className={`user-type-badge ${typeClass}`}>{user.type}</span>
              </div>
              {user.title && <p style={{ fontSize: "16px", color: "var(--color-primary)", fontWeight: 600, marginBottom: "8px" }}>{user.title}</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "12px" }}>
                {user.city && <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--color-text-secondary)" }}><MapPin size={13} />{user.city}</span>}
                {user.website && <a href={user.website} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--color-primary)", textDecoration: "none" }}><Globe size={13} />{user.website}</a>}
                {user.phone && <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--color-text-secondary)" }}><Phone size={13} />{user.phone}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--color-text-muted)" }}><Calendar size={13} />Membre depuis {formatDate(user.createdAt)}</span>
              </div>
              {user.bio && <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: "600px" }}>{user.bio}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {isOwner && (
                <Link href="/profile/edit" className="btn-secondary" style={{ fontSize: "13px", padding: "8px 14px" }}>
                  <Edit size={14} /> Modifier
                </Link>
              )}
              <Link href={`/portfolio/${id}`} className="btn-primary" style={{ fontSize: "13px", padding: "8px 14px" }}>
                <Download size={14} /> Portfolio
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Compétences */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Star size={16} color="#6366F1" /> Compétences
            </h2>
            {user.skills.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Aucune compétence ajoutée</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {user.skills.map((us) => (
                  <div key={us.skill.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>{us.skill.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "6px" }}>{us.skill.category}</span>
                    </div>
                    <span className={levelClass(us.level)}>{levelLabel(us.level)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expériences */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Briefcase size={16} color="#6366F1" /> Expériences
            </h2>
            {user.experiences.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Aucune expérience ajoutée</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {user.experiences.map((exp) => (
                  <div key={exp.id} style={{ paddingLeft: "12px", borderLeft: "2px solid var(--color-primary)" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>{exp.title}</div>
                    <div style={{ fontSize: "13px", color: "var(--color-primary)", marginBottom: "3px" }}>{exp.company}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={11} />
                      {formatDate(exp.startDate)} — {exp.current ? "Présent" : exp.endDate ? formatDate(exp.endDate) : ""}
                      {exp.location && <><MapPin size={11} style={{ marginLeft: "6px" }} />{exp.location}</>}
                    </div>
                    {exp.description && <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Publications récentes */}
        {user.posts.length > 0 && (
          <div className="glass-card" style={{ padding: "24px", marginTop: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Publications récentes</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {user.posts.map((p) => (
                <div key={p.id} style={{ padding: "14px", background: "var(--color-bg-elevated)", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span className={p.type === "OFFRE" ? "badge-offre" : "badge-recherche"}>{p.type === "OFFRE" ? "Offre" : "Recherche"}</span>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>{p.title}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {p.tags.map((t, i) => <span key={i} className="skill-tag">{t.skill.name}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

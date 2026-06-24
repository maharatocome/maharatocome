"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, DollarSign, ChevronDown, Search, SlidersHorizontal, Zap, Users, Briefcase, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface Skill { id: string; name: string; category: string; }
interface Post {
  id: string;
  type: string;
  title: string;
  content: string;
  duration?: string;
  location?: string;
  createdAt: string;
  user: { id: string; name: string; title?: string; city?: string; type: string; avatar?: string };
  tags: { skill: Skill }[];
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function PostCard({ post, currentUserId }: { post: Post; currentUserId?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [contacting, setContacting] = useState(false);
  const router = useRouter();

  async function handleContact() {
    if (!currentUserId) { router.push("/auth/login"); return; }
    setContacting(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: post.user.id, postRef: post.id, postTitle: post.title }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/messages/${data.id}`);
    } else {
      setContacting(false);
    }
  }
  return (
    <article className="glass-card animate-in" style={{ padding: "20px", marginBottom: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
        <Link href={`/profile/${post.user.id}`}>
          <div className="avatar" style={{ fontSize: "15px", flexShrink: 0 }}>
            {post.user.avatar ? <img src={post.user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(post.user.name || "User")}
          </div>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <Link href={`/profile/${post.user.id}`} style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)", textDecoration: "none" }}>
              {post.user.name || "Utilisateur Anonyme"}
            </Link>
            <span className={`user-type-badge type-${post.user.type.toLowerCase()}`}>{post.user.type}</span>
          </div>
          {post.user.title && <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>{post.user.title}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            {post.user.city && <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={11} />{post.user.city}</span>}
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "3px" }}><Clock size={11} />{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <span className={post.type === "OFFRE" ? "badge-offre" : "badge-recherche"}>
          {post.type === "OFFRE" ? "✦ Offre" : "◎ Recherche"}
        </span>
      </div>

      {/* Content */}
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "8px", lineHeight: 1.4 }}>{post.title}</h2>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "8px" }}>
        {expanded ? post.content : post.content.slice(0, 150) + (post.content.length > 150 ? "..." : "")}
      </p>
      {post.content.length > 150 && (
        <button onClick={() => setExpanded(!expanded)} style={{ fontSize: "13px", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
          {expanded ? "Voir moins" : "Voir plus"} <ChevronDown size={13} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      )}

      {/* Meta infos */}
      {(post.duration || post.location) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "14px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
          {post.duration && <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={13} />{post.duration}</span>}
          {post.location && <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={13} />{post.location}</span>}
        </div>
      )}

      {/* Tags + Bouton Contacter */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
          {post.tags.map((t) => (
            <span key={t.skill.id} className="skill-tag">{t.skill.name}</span>
          ))}
        </div>
        {(!currentUserId || currentUserId !== post.user.id) && (
          <button
            onClick={handleContact}
            disabled={contacting}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 18px",
              borderRadius: "10px",
              background: contacting ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
              border: "none",
              color: "white",
              fontSize: "13px",
              fontWeight: 700,
              cursor: contacting ? "not-allowed" : "pointer",
              flexShrink: 0,
              boxShadow: contacting ? "none" : "0 4px 14px rgba(99,102,241,0.45)",
              transition: "all 0.2s",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => {
              if (!contacting) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.6)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.45)";
            }}
          >
            <Zap size={14} style={{ fill: "white", color: "white", flexShrink: 0 }} />
            {contacting ? "Connexion..." : "Contacter"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;
  const [liveAvatar, setLiveAvatar] = useState<string>("");

  // Charger l'avatar live depuis la DB pour la sidebar
  useEffect(() => {
    if (!currentUserId) { setLiveAvatar(""); return; }
    fetch(`/api/users/${currentUserId}`)
      .then((r) => r.json())
      .then((data) => setLiveAvatar(data?.avatar || ""))
      .catch(() => {});
  }, [currentUserId]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "ALL", skill: "", search: "" });

  async function fetchPosts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.type !== "ALL") params.set("type", filter.type);
    if (filter.skill) params.set("skill", filter.skill);
    if (filter.search) params.set("search", filter.search);
    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, [filter]);

  useEffect(() => {
    fetch("/api/skills").then((r) => r.json()).then((d) => setSkills(Array.isArray(d) ? d : []));
    fetch("/api/users").then((r) => r.json()).then((d) => setRecentUsers(Array.isArray(d) ? d : []));
  }, []);

  const stats = { posts: posts.length, offres: posts.filter(p => p.type === "OFFRE").length, recherches: posts.filter(p => p.type === "RECHERCHE").length };

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>

        {/* Hero welcome (not logged in) */}
        {!session && (
          <div className="glass-card hero-gradient" style={{ padding: "48px 40px", textAlign: "center", marginBottom: "32px", background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 70%)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "var(--color-primary-light)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", marginBottom: "20px" }}>
              <Zap size={14} color="var(--color-primary)" />
              <span style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: 600 }}>Plateforme #1 des talents algériens</span>
            </div>
            <h1 style={{ fontSize: "42px", fontWeight: 900, lineHeight: 1.2, marginBottom: "16px", background: "linear-gradient(135deg, #111827 0%, #4F46E5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Connectez votre talent<br />au marché algérien
            </h1>
            <p style={{ fontSize: "17px", color: "var(--color-text-secondary)", marginBottom: "28px", maxWidth: "560px", margin: "0 auto 28px" }}>
              Trouvez des experts qualifiés, publiez vos offres, et boostez votre carrière avec l&apos;algorithme de matching intelligent MAHARAtoCOME.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/register" className="btn-primary" style={{ fontSize: "15px", padding: "13px 28px" }}>Créer mon profil gratuit</Link>
              <Link href="/auth/login" className="btn-secondary" style={{ fontSize: "15px", padding: "13px 28px" }}>Voir les offres</Link>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--color-border)" }}>
              {[{ label: "Experts actifs", value: "500+" }, { label: "PME inscrites", value: "120+" }, { label: "Missions publiées", value: "1 200+" }].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-primary)" }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="feed-grid">
          {/* LEFT SIDEBAR */}
          <aside className="sidebar-left">
            {session && (
              <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                <Link href={`/profile/${(session.user as { id?: string }).id}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div className="avatar">
                      {liveAvatar
                        ? <img src={liveAvatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : getInitials(session.user?.name || "")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)" }}>{session.user?.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--color-primary)" }}>Voir mon profil →</div>
                    </div>
                  </div>
                </Link>
                <div className="divider" />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Link href="/posts/create" className="btn-primary" style={{ justifyContent: "center" }}>Publier une offre</Link>
                  <Link href="/matching" className="btn-secondary" style={{ justifyContent: "center" }}>Voir les matchings</Link>
                </div>
              </div>
            )}
            <div className="glass-card" style={{ padding: "16px" }}>
              <p className="section-title">Statistiques</p>
              {[{ icon: <Briefcase size={15} />, label: "Publications", val: stats.posts }, { icon: <TrendingUp size={15} />, label: "Offres actives", val: stats.offres }, { icon: <Users size={15} />, label: "Recherches", val: stats.recherches }].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-text-secondary)" }}>{s.icon}{s.label}</span>
                  <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN FEED */}
          <main>
            {/* Filters */}
            <div className="glass-card" style={{ padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: "34px" }}
                    placeholder="Rechercher..."
                    value={filter.search}
                    onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                  />
                </div>
                <div className="type-toggle">
                  {["ALL", "OFFRE", "RECHERCHE"].map((t) => (
                    <button
                      key={t}
                      className={`type-btn ${filter.type === t ? (t === "OFFRE" ? "active-offre" : t === "RECHERCHE" ? "active-recherche" : "") : ""}`}
                      style={filter.type === t && t === "ALL" ? { background: "var(--color-primary-light)", color: "var(--color-primary)", border: "1px solid rgba(99,102,241,0.3)" } : {}}
                      onClick={() => setFilter((f) => ({ ...f, type: t }))}
                    >
                      {t === "ALL" ? "Tous" : t === "OFFRE" ? "Offres" : "Recherches"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill filter chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <SlidersHorizontal size={13} style={{ color: "var(--color-text-muted)" }} />
                <span className={`skill-tag ${filter.skill === "" ? "selected" : ""}`} onClick={() => setFilter((f) => ({ ...f, skill: "" }))}>Tous</span>
                {skills.slice(0, 10).map((s) => (
                  <span key={s.id} className={`skill-tag ${filter.skill === s.name ? "selected" : ""}`} onClick={() => setFilter((f) => ({ ...f, skill: f.skill === s.name ? "" : s.name }))}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: "8px" }} />
                      <div className="skeleton" style={{ height: 12, width: "60%" }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ height: 16, marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: 12, marginBottom: "4px" }} />
                  <div className="skeleton" style={{ height: 12, width: "80%" }} />
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>Aucun post trouvé</p>
                <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginTop: "4px" }}>Essayez de modifier vos filtres</p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} currentUserId={currentUserId} />)
            )}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="sidebar-right">
            <div className="glass-card" style={{ padding: "16px", marginBottom: "16px" }}>
              <p className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><Zap size={14} /> Compétences populaires</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    className={`skill-tag ${filter.skill === s.name ? "selected" : ""}`}
                    onClick={() => setFilter((f) => ({ ...f, skill: f.skill === s.name ? "" : s.name }))}
                    style={{ border: "none" }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "16px" }}>
              <p className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}><Users size={14} /> Nouveaux Talents</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {recentUsers.map((u) => (
                  <Link key={u.id} href={`/profile/${u.id}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                    <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
                      {u.avatar ? <img src={u.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(u.name || "User")}
                    </div>
                    <div style={{ minWidth: 0 }}>
                       <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || "Utilisateur Anonyme"}</div>
                      {u.title && <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.title}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

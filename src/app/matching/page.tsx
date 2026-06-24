"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Target, Zap, MapPin, ArrowRight, TrendingUp } from "lucide-react";

interface MatchResult {
  offer: { id: string; title: string; user: { id: string; name: string; title?: string; city?: string; type: string; avatar?: string }; tags: { skill: { name: string } }[]; location?: string };
  search: { id: string; title: string; user: { id: string; name: string; title?: string; city?: string; type: string; avatar?: string }; tags: { skill: { name: string } }[]; location?: string };
  score: number;
  commonSkills: string[];
  explanation: string;
}

function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(); }

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#6366F1" : "#F59E0B";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", border: `3px solid ${color}`, background: `${color}15`, flexShrink: 0 }}>
      <span style={{ fontSize: "16px", fontWeight: 800, color }}>{score}%</span>
    </div>
  );
}

function UserMiniCard({ user, type }: { user: MatchResult["offer"]["user"]; type: "OFFRE" | "RECHERCHE" }) {
  return (
    <Link href={`/profile/${user.id}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flex: 1 }}>
      <div className="avatar avatar-sm">
        {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(user.name)}
      </div>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)" }}>{user.name}</div>
        {user.title && <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{user.title}</div>}
        {user.city && <div style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={10} />{user.city}</div>}
      </div>
    </Link>
  );
}

export default function MatchingPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matching").then((r) => r.json()).then((d) => { setMatches(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const topMatches = matches.filter((m) => m.score >= 70);
  const goodMatches = matches.filter((m) => m.score >= 40 && m.score < 70);
  const potentialMatches = matches.filter((m) => m.score < 40);

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "60px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", background: "var(--color-primary-light)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", marginBottom: "14px" }}>
            <Target size={14} color="#A5B4FC" />
            <span style={{ fontSize: "13px", color: "#A5B4FC", fontWeight: 600 }}>Algorithme de matching IA</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, marginBottom: "8px" }}>Paires Offres ↔ Recherches</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
            Notre algorithme analyse les compétences communes pour connecter automatiquement les bonnes personnes.
          </p>
        </div>

        {/* Stats banner */}
        <div className="glass-card" style={{ padding: "20px", marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { label: "Excellent match (≥70%)", val: topMatches.length, color: "#10B981" },
            { label: "Bon match (40-69%)", val: goodMatches.length, color: "#6366F1" },
            { label: "Match potentiel (<40%)", val: potentialMatches.length, color: "#F59E0B" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "12px" }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Algorithm explanation */}
        <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "24px", background: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <Zap size={16} color="#6366F1" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#A5B4FC" }}>Comment fonctionne le matching ?</span>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: 1.6 }}>
                Le score est calculé avec l'indice de Jaccard : <strong style={{ color: "var(--color-text-primary)" }}>compétences communes ÷ union des compétences × 100</strong>. Un bonus de +10 pts est accordé si les deux parties sont dans la même ville. Seuls les matches ≥20% sont affichés.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ padding: "20px", marginBottom: "14px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: 12, width: "80%", marginBottom: "6px" }} />
                  <div className="skeleton" style={{ height: 12, width: "40%" }} />
                </div>
              </div>
            </div>
          ))
        ) : matches.length === 0 ? (
          <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔗</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Aucun matching trouvé</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px" }}>Publiez des offres et des recherches pour que l'algorithme puisse trouver des correspondances.</p>
            <Link href="/posts/create" className="btn-primary">Publier une annonce</Link>
          </div>
        ) : (
          <>
            {topMatches.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <TrendingUp size={16} color="#10B981" />
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#10B981" }}>Excellent match — Score ≥ 70%</h2>
                </div>
                {topMatches.map((m, i) => <MatchCard key={i} match={m} />)}
              </div>
            )}
            {goodMatches.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <TrendingUp size={16} color="#6366F1" />
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#6366F1" }}>Bon match — Score 40-69%</h2>
                </div>
                {goodMatches.map((m, i) => <MatchCard key={i} match={m} />)}
              </div>
            )}
            {potentialMatches.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <TrendingUp size={16} color="#F59E0B" />
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#F59E0B" }}>Match potentiel — Score &lt; 40%</h2>
                </div>
                {potentialMatches.map((m, i) => <MatchCard key={i} match={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: MatchResult }) {
  return (
    <article className="glass-card animate-in" style={{ padding: "20px", marginBottom: "14px" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <ScoreRing score={match.score} />
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center" }}>
          {/* Offer side */}
          <div style={{ padding: "12px", background: "var(--color-offer-bg)", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>✦ Offre</div>
            <UserMiniCard user={match.offer.user} type="OFFRE" />
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.4 }}>{match.offer.title}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <ArrowRight size={18} color="var(--color-text-muted)" />
          </div>

          {/* Search side */}
          <div style={{ padding: "12px", background: "var(--color-search-bg)", borderRadius: "10px", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>◎ Recherche</div>
            <UserMiniCard user={match.search.user} type="RECHERCHE" />
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.4 }}>{match.search.title}</p>
          </div>
        </div>
      </div>

      {/* Common skills + explanation */}
      <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
          {match.commonSkills.map((skill) => (
            <span key={skill} className="skill-tag selected" style={{ fontSize: "11px" }}>{skill}</span>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{match.explanation}</p>
      </div>
    </article>
  );
}

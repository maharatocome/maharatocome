"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Briefcase, User, Zap, LogOut, PlusCircle, Menu, X, Target, MessageSquare } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveAvatar, setLiveAvatar] = useState<string>("");

  const userId = (session?.user as { id?: string })?.id;

  // Charger l'avatar frais depuis la DB (pas depuis le token JWT qui est figé au login)
  useEffect(() => {
    if (!userId) { setLiveAvatar(""); return; }
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => { if (data?.avatar) setLiveAvatar(data.avatar); else setLiveAvatar(""); })
      .catch(() => {});
  }, [userId]);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        <Zap size={22} style={{ fill: "currentColor" }} />
        MAHARAtoCOME
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }} className="hidden-mobile">
        {session ? (
          <>
            <Link href="/" className="btn-ghost">
              <Briefcase size={16} /> Feed
            </Link>
            <Link href="/matching" className="btn-ghost">
              <Target size={16} /> Matching
            </Link>
            <Link href="/messages" className="btn-ghost">
              <MessageSquare size={16} /> Messages
            </Link>
            <Link href="/posts/create" className="btn-primary" style={{ padding: "8px 16px" }}>
              <PlusCircle size={16} /> Publier
            </Link>
            <Link
              href={`/profile/${(session.user as { id?: string }).id}`}
              style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginLeft: "8px" }}
            >
              <div className="avatar avatar-sm" style={{ fontSize: "13px" }}>
                {liveAvatar
                  ? <img src={liveAvatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : initials}
              </div>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                {session.user?.name?.split(" ")[0]}
              </span>
            </Link>
            <button
              className="btn-ghost"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              style={{ marginLeft: "4px" }}
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn-ghost">Connexion</Link>
            <Link href="/auth/register" className="btn-primary">Créer un compte</Link>
          </>
        )}
      </div>

      <button
        className="btn-ghost show-mobile"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ padding: "8px" }}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {menuOpen && (
        <div style={{
          position: "absolute", top: "64px", left: 0, right: 0,
          background: "rgba(10,15,30,0.97)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-border)", padding: "16px 24px",
          display: "flex", flexDirection: "column", gap: "8px", zIndex: 200,
        }}>
          {session ? (
            <>
              <Link href="/" className="btn-ghost" onClick={() => setMenuOpen(false)}><Briefcase size={16} /> Feed</Link>
              <Link href="/matching" className="btn-ghost" onClick={() => setMenuOpen(false)}><Target size={16} /> Matching</Link>
              <Link href="/messages" className="btn-ghost" onClick={() => setMenuOpen(false)}><MessageSquare size={16} /> Messages</Link>
              <Link href="/posts/create" className="btn-primary" onClick={() => setMenuOpen(false)}><PlusCircle size={16} /> Publier</Link>
              <Link href={`/profile/${(session.user as { id?: string }).id}`} className="btn-ghost" onClick={() => setMenuOpen(false)}><User size={16} /> Mon profil</Link>
              <button className="btn-ghost" onClick={() => signOut({ callbackUrl: "/auth/login" })}><LogOut size={15} /> Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link href="/auth/register" className="btn-primary" onClick={() => setMenuOpen(false)}>Créer un compte</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .hidden-mobile { display: flex; }
        .show-mobile { display: none; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none; }
          .show-mobile { display: flex; }
        }
      `}</style>
    </nav>
  );
}

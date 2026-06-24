"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MessageSquare, Zap, Clock } from "lucide-react";

interface Participant {
  user: { id: string; name: string; avatar?: string; title?: string };
}
interface LastMessage {
  content: string;
  createdAt: string;
}
interface Conversation {
  id: string;
  postTitle?: string;
  updatedAt: string;
  participants: Participant[];
  messages: LastMessage[];
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

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => { setConversations(Array.isArray(data) ? data : []); setLoading(false); });
  }, [session]);

  if (loading || status === "loading") return (
    <div><Navbar />
      <div className="page-container" style={{ paddingTop: "40px", maxWidth: "720px" }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: "12px", marginBottom: "12px" }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "60px", maxWidth: "720px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <MessageSquare size={22} color="var(--color-primary)" />
          <h1 style={{ fontSize: "22px", fontWeight: 800 }}>Messagerie</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
            <MessageSquare size={40} color="var(--color-text-muted)" style={{ marginBottom: "16px" }} />
            <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", marginBottom: "8px" }}>Aucune conversation pour l&apos;instant</p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Cliquez sur &quot;Contacter&quot; sur une publication pour démarrer une conversation.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {conversations.map((conv) => {
              const other = conv.participants.find((p) => p.user.id !== currentUserId)?.user;
              const lastMsg = conv.messages[0];
              return (
                <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: "none" }}>
                  <div className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                    <div className="avatar" style={{ fontSize: "14px", flexShrink: 0, width: "44px", height: "44px" }}>
                      {other?.avatar ? <img src={other.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : getInitials(other?.name || "?")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)" }}>{other?.name || "Utilisateur"}</span>
                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={10} />{timeAgo(conv.updatedAt)}
                        </span>
                      </div>
                      {conv.postTitle && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
                          <Zap size={10} style={{ fill: "var(--color-primary)", color: "var(--color-primary)", flexShrink: 0 }} />
                          <span style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.postTitle}</span>
                        </div>
                      )}
                      {lastMsg ? (
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMsg.content}</p>
                      ) : (
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic" }}>Nouvelle conversation</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

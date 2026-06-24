"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Send, ArrowLeft, Zap } from "lucide-react";

interface Sender { id: string; name: string; avatar?: string; }
interface Message { id: string; content: string; createdAt: string; sender: Sender; }
interface Participant { user: { id: string; name: string; avatar?: string; title?: string; type: string; }; }
interface Conversation {
  id: string;
  postRef?: string;
  postTitle?: string;
  participants: Participant[];
  messages: Message[];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default function ConversationPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUserId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (!session || !params.id) return;
    fetch(`/api/conversations/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setConversation(data); setLoading(false); });
  }, [session, params.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const other = conversation?.participants.find((p) => p.user.id !== currentUserId)?.user;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: params.id, content: message.trim() }),
    });
    if (res.ok) {
      const newMsg = await res.json();
      setConversation((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
      setMessage("");
      inputRef.current?.focus();
    }
    setSending(false);
  }

  if (loading) return (
    <div><Navbar />
      <div className="page-container" style={{ paddingTop: "40px", maxWidth: "720px" }}>
        <div className="skeleton" style={{ height: 400, borderRadius: "16px" }} />
      </div>
    </div>
  );

  if (!conversation) return (
    <div><Navbar />
      <div className="page-container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Conversation introuvable.</p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "20px", maxWidth: "720px" }}>

        {/* Header */}
        <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
          <Link href="/messages" style={{ color: "var(--color-text-muted)", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={20} />
          </Link>
          <Link href={`/profile/${other?.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <div className="avatar avatar-sm" style={{ fontSize: "13px", flexShrink: 0 }}>
              {other?.avatar ? <img src={other.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : getInitials(other?.name || "?")}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary)" }}>{other?.name}</div>
              {other?.title && <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{other.title}</div>}
            </div>
          </Link>
        </div>

        {/* Référence publication */}
        {conversation.postTitle && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "var(--color-primary-light)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", marginBottom: "16px" }}>
            <Zap size={14} style={{ fill: "var(--color-primary)", color: "var(--color-primary)", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: 600 }}>
              Contact suite à la publication : &quot;{conversation.postTitle}&quot;
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="glass-card" style={{ padding: "20px", marginBottom: "16px", minHeight: "360px", maxHeight: "500px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {conversation.messages.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
              <Zap size={28} style={{ fill: "var(--color-primary)", color: "var(--color-primary)", opacity: 0.5 }} />
              <p style={{ color: "var(--color-text-muted)", fontSize: "13px", textAlign: "center" }}>
                {conversation.postTitle
                  ? `Démarrez la conversation à propos de "${conversation.postTitle}"`
                  : "Démarrez la conversation"}
              </p>
            </div>
          ) : (
            <>
              {conversation.messages.map((msg, i) => {
                const isMine = msg.sender.id === currentUserId;
                const showDate = i === 0 || formatDate(msg.createdAt) !== formatDate(conversation.messages[i - 1].createdAt);
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div style={{ textAlign: "center", margin: "8px 0" }}>
                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", background: "var(--color-bg-elevated)", padding: "3px 10px", borderRadius: "10px" }}>
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                      {!isMine && (
                        <div className="avatar" style={{ width: "28px", height: "28px", fontSize: "10px", flexShrink: 0 }}>
                          {msg.sender.avatar ? <img src={msg.sender.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : getInitials(msg.sender.name)}
                        </div>
                      )}
                      <div style={{ maxWidth: "70%" }}>
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isMine ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "var(--color-bg-elevated)",
                          color: isMine ? "white" : "var(--color-text-primary)",
                          fontSize: "14px",
                          lineHeight: 1.5,
                          border: isMine ? "none" : "1px solid var(--color-border)",
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "3px", textAlign: isMine ? "right" : "left" }}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrire un message..."
            style={{ flex: 1 }}
            autoFocus
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!message.trim() || sending}
            style={{ padding: "0 20px", flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

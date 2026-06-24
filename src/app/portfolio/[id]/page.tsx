"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Download, MapPin, Globe, Phone, Briefcase, Star, Clock } from "lucide-react";

interface UserProfile {
  id: string; name: string; title?: string; bio?: string; city?: string;
  phone?: string; website?: string; type: string; createdAt: string;
  skills: { skill: { id: string; name: string; category: string }; level: string }[];
  experiences: { id: string; title: string; company: string; location?: string; startDate: string; endDate?: string; current: boolean; description?: string }[];
  posts: { id: string; type: string; title: string; content: string; tags: { skill: { name: string } }[]; createdAt: string }[];
}

function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(); }
function formatDate(dateStr: string) { return new Date(dateStr).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); }
function levelLabel(level: string) { const m: Record<string, string> = { EXPERT: "Expert", INTERMEDIAIRE: "Intermédiaire", DEBUTANT: "Débutant" }; return m[level] || level; }

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then((r) => r.json()).then((d) => { setUser(d); setLoading(false); });
  }, [id]);

  async function exportPDF() {
    setPrinting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      if (!portfolioRef.current) return;
      const canvas = await html2canvas(portfolioRef.current, { scale: 2, backgroundColor: "#0A0F1E", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      let yPos = 0;
      let remaining = imgH;
      while (remaining > 0) {
        if (yPos > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -yPos, pageW, imgH);
        yPos += pageH;
        remaining -= pageH;
      }
      pdf.save(`portfolio-${user?.name?.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } catch (e) { console.error(e); }
    setPrinting(false);
  }

  if (loading) return (
    <div><Navbar />
      <div className="page-container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <div className="skeleton" style={{ height: 400, borderRadius: "16px" }} />
      </div>
    </div>
  );

  if (!user) return (
    <div><Navbar />
      <div className="page-container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Profil introuvable</p>
      </div>
    </div>
  );

  const typeColors: Record<string, string> = { EXPERT: "#6366F1", PME: "#10B981", CHERCHEUR: "#F59E0B" };
  const accentColor = typeColors[user.type] || "#6366F1";

  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ paddingTop: "28px", paddingBottom: "60px", maxWidth: "860px" }}>
        {/* Export button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", gap: "10px" }}>
          <button id="export-pdf" className="btn-primary" onClick={exportPDF} disabled={printing}>
            <Download size={15} /> {printing ? "Génération PDF..." : "Exporter en PDF"}
          </button>
        </div>

        {/* Portfolio Document */}
        <div ref={portfolioRef} style={{ background: "#0A0F1E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden" }}>
          {/* Header band */}
          <div style={{ background: `linear-gradient(135deg, ${accentColor}22, #0F172A)`, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "40px 40px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: `linear-gradient(135deg, ${accentColor}, #10B981)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 800, color: "white", flexShrink: 0, boxShadow: `0 0 0 4px ${accentColor}33` }}>
                {getInitials(user.name)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#F9FAFB" }}>{user.name}</h1>
                  <span style={{ fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44`, textTransform: "uppercase", letterSpacing: "0.5px" }}>{user.type}</span>
                </div>
                {user.title && <p style={{ fontSize: "17px", color: accentColor, fontWeight: 600, marginBottom: "10px" }}>{user.title}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  {user.city && <span style={{ fontSize: "13px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "5px" }}><MapPin size={13} />{user.city}, Algérie</span>}
                  {user.phone && <span style={{ fontSize: "13px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "5px" }}><Phone size={13} />{user.phone}</span>}
                  {user.website && <span style={{ fontSize: "13px", color: accentColor, display: "flex", alignItems: "center", gap: "5px" }}><Globe size={13} />{user.website}</span>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
            {/* Left column */}
            <div>
              {/* Bio */}
              {user.bio && (
                <div style={{ marginBottom: "28px" }}>
                  <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "16px", height: "2px", background: accentColor, display: "inline-block" }}></span>À propos
                  </h2>
                  <p style={{ fontSize: "14px", color: "#D1D5DB", lineHeight: 1.7 }}>{user.bio}</p>
                </div>
              )}

              {/* Compétences */}
              {user.skills.length > 0 && (
                <div>
                  <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "16px", height: "2px", background: accentColor, display: "inline-block" }}></span>Compétences
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {user.skills.map((us) => (
                      <div key={us.skill.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#F3F4F6" }}>{us.skill.name}</span>
                          <span style={{ fontSize: "11px", color: "#6B7280" }}>{levelLabel(us.level)}</span>
                        </div>
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: "2px", background: `linear-gradient(90deg, ${accentColor}, #10B981)`, width: us.level === "EXPERT" ? "90%" : us.level === "INTERMEDIAIRE" ? "60%" : "30%", transition: "width 0.3s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div>
              {/* Expériences */}
              {user.experiences.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "16px", height: "2px", background: accentColor, display: "inline-block" }}></span>Expériences
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {user.experiences.map((exp) => (
                      <div key={exp.id} style={{ paddingLeft: "16px", borderLeft: `2px solid ${accentColor}44`, position: "relative" }}>
                        <div style={{ position: "absolute", left: "-5px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", background: accentColor }} />
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#F9FAFB", marginBottom: "2px" }}>{exp.title}</div>
                        <div style={{ fontSize: "13px", color: accentColor, fontWeight: 600, marginBottom: "4px" }}>{exp.company}</div>
                        <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Clock size={11} />
                          {formatDate(exp.startDate)} — {exp.current ? "Présent" : exp.endDate ? formatDate(exp.endDate) : ""}
                          {exp.location && <><MapPin size={11} style={{ marginLeft: "4px" }} />{exp.location}</>}
                        </div>
                        {exp.description && <p style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.6 }}>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publications récentes */}
              {user.posts.length > 0 && (
                <div>
                  <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "16px", height: "2px", background: accentColor, display: "inline-block" }}></span>Publications récentes
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {user.posts.slice(0, 3).map((p) => (
                      <div key={p.id} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: p.type === "OFFRE" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: p.type === "OFFRE" ? "#10B981" : "#F59E0B", textTransform: "uppercase" }}>{p.type}</span>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#E5E7EB" }}>{p.title}</span>
                        </div>
                        {p.tags.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {p.tags.map((t, i) => (
                              <span key={i} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}>{t.skill.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#4B5563" }}>Généré via MAHARAtoCOME — Plateforme professionnelle algérienne</span>
            <span style={{ fontSize: "12px", color: "#4B5563" }}>{new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

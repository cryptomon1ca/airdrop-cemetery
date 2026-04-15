"use client";

import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { projects, type Project } from "@/data/projects";
import { useLivePrices } from "@/hooks/useLivePrices";

const categoryBg: Record<string, string> = {
  DeFi:   "#FF6B00",
  L2:     "#00BBBB",
  Social: "#F0C040",
  GameFi: "#9B7FE8",
  Meme:   "#FF5090",
};

const statusMap = {
  dead:      { label: "已死亡", icon: "💀", bg: "#8B0000" },
  dying:     { label: "垂死中", icon: "📉", bg: "#7a3800" },
  surviving: { label: "存活中", icon: "🫀", bg: "#1a5c2a" },
};

function BlockRating({ value, max, color }: { value: number; max: number; color: string }) {
  const filled = Math.round(value);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 16, height: 16, background: i < filled ? color : "#E8E0C8", border: "1.5px solid #000" }} />
      ))}
    </div>
  );
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const project: Project | undefined = projects.find(p => p.id === id);

  if (!project) notFound();

  // Live prices (shared cache with main page)
  const { prices: livePrices, lastUpdated } = useLivePrices(projects);
  const live = livePrices[project.id];

  const displayPrice = live?.currentPrice ?? project.currentPrice;
  const displayChange = live?.priceChange ?? project.priceChange;
  const change24h = live?.priceChange24h;

  const catBg = categoryBg[project.category] ?? "#FFD700";
  const status = statusMap[project.status];
  const tvlColor = project.tvlRetention < 20 ? "#CC0000" : project.tvlRetention < 60 ? "#FF8C00" : "#228B22";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFD700; font-family: 'DM Sans', sans-serif; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      {/* Top nav bar */}
      <div style={{ background: "#000", borderBottom: "4px solid #000", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "2px solid #FFD700", color: "#FFD700", padding: "6px 16px", fontSize: 12, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          ← 返回墓地
        </button>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: "#FFD700", textTransform: "uppercase" }}>
          🪦 空投墓地 GRAVEYARD
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: status.bg, border: "2px solid #555", padding: "5px 12px", fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {status.icon} {status.label}
          </div>
        </div>
      </div>

      {/* Hero header */}
      <div style={{ background: catBg, borderBottom: "4px solid #000" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", marginBottom: 8 }}>
                {project.category} · TGE {project.tgeDate}
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", color: "#000", lineHeight: 0.9, marginBottom: 10, letterSpacing: "0.01em" }}>
                {project.name}
              </h1>
              <div style={{ fontSize: 16, color: "rgba(0,0,0,0.55)", fontWeight: 800, marginBottom: 16 }}>
                \ {project.symbol}
              </div>
              <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7, maxWidth: 520, opacity: 0.75 }}>
                {project.description}
              </p>
            </div>

            {/* Crash badge - big */}
            <div style={{ background: "#CC0000", border: "4px solid #000", padding: "20px 28px", textAlign: "center", boxShadow: "6px 6px 0 #000", flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: "#ffaaaa", textTransform: "uppercase", marginBottom: 6 }}>总崩跌幅度</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {displayChange}%
              </div>
              <div style={{ fontSize: 11, color: "#ffaaaa", fontWeight: 700, letterSpacing: "0.1em", marginTop: 4 }}>
                ${project.athPrice} → ${displayPrice}
              </div>
              {change24h !== undefined && (
                <div style={{ fontSize: 10, color: change24h >= 0 ? "#aaffaa" : "#ffaaaa", marginTop: 4, fontWeight: 700 }}>
                  {change24h >= 0 ? "▲" : "▼"} {Math.abs(change24h)}% 24h
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Price timeline */}
            <section style={{ background: "#fff", border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
              <div style={{ background: "#000", padding: "10px 16px", borderBottom: "3px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", textTransform: "uppercase" }}>💸 价格轨迹</span>
                {lastUpdated && <span style={{ fontSize: 9, color: "#888", letterSpacing: "0.06em" }}>🟢 {lastUpdated}</span>}
              </div>
              <div style={{ padding: 20, display: "flex", gap: 12, alignItems: "stretch" }}>
                <div style={{ flex: 1, border: "2px solid #000", padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#888", textTransform: "uppercase", marginBottom: 6 }}>🚀 TGE ATH</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#aaa", textDecoration: "line-through", lineHeight: 1 }}>
                    ${project.athPrice}
                  </div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>TGE: {project.tgeDate}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: "#ccc", fontWeight: 900 }}>→</div>
                <div style={{ flex: 1, border: "3px solid #CC0000", padding: "14px 16px", background: "#fff5f5" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#CC0000", textTransform: "uppercase", marginBottom: 6 }}>📉 当前价格</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#CC0000", lineHeight: 1 }}>
                    ${displayPrice}
                  </div>
                  <div style={{ fontSize: 11, color: "#CC0000", marginTop: 6 }}>跌幅 {displayChange}%</div>
                  {change24h !== undefined && (
                    <div style={{ fontSize: 10, color: change24h >= 0 ? "#228B22" : "#CC0000", marginTop: 3, fontWeight: 700 }}>
                      {change24h >= 0 ? "▲" : "▼"} {Math.abs(change24h)}% 24h
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Metrics */}
            <section style={{ background: "#fff", border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
              <div style={{ background: "#000", padding: "10px 16px", borderBottom: "3px solid #000" }}>
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", textTransform: "uppercase" }}>📊 核心指标</span>
              </div>
              <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "TVL 留存率", val: `${project.tvlRetention}%`, sub: "相对峰值" },
                  { label: "炒作等级", val: project.hypeLevel ?? "—", sub: "曾经有多热" },
                  { label: "社区背刺", val: `${project.communityBackstab}/10`, sub: "被坑程度" },
                  { label: "当前现价", val: `$${displayPrice}`, sub: "惨烈现价" },
                ].map(item => (
                  <div key={item.label} style={{ border: "2px solid #000", padding: "12px 14px" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#000", lineHeight: 1 }}>{item.val}</div>
                    <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* Block ratings */}
              <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555" }}>TVL 留存率</span>
                  <BlockRating value={project.tvlRetention / 20} max={5} color={tvlColor} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555" }}>背刺程度</span>
                  <BlockRating value={project.communityBackstab / 2} max={5} color="#CC0000" />
                </div>
              </div>
            </section>

            {/* Links */}
            {project.links && (
              <section style={{ background: "#fff", border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
                <div style={{ background: "#000", padding: "10px 16px", borderBottom: "3px solid #000" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", textTransform: "uppercase" }}>🔗 相关链接</span>
                </div>
                <div style={{ padding: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {project.links.website && (
                    <a href={project.links.website} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 800, padding: "8px 16px", background: "#000", color: "#FFD700", letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-block" }}>
                      🌐 官网 →
                    </a>
                  )}
                  {project.links.twitter && (
                    <a href={project.links.twitter} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 800, padding: "8px 16px", background: "#000", color: "#FFD700", letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-block" }}>
                      𝕏 Twitter →
                    </a>
                  )}
                  {project.links.coinGecko && (
                    <a href={project.links.coinGecko} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 800, padding: "8px 16px", background: "#000", color: "#FFD700", letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-block" }}>
                      🦎 CoinGecko →
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Death reasons */}
            {project.reasons.length > 0 && (
              <section style={{ background: "#fff", border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
                <div style={{ background: "#CC0000", padding: "10px 16px", borderBottom: "3px solid #000" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase" }}>☠ 死亡原因</span>
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {project.reasons.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "#fff5f5", borderLeft: "4px solid #CC0000" }}>
                      <span style={{ color: "#CC0000", flexShrink: 0, fontWeight: 900, marginTop: 1 }}>▸</span>
                      <span style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Controversies */}
            {project.controversies.length > 0 && (
              <section style={{ background: "#fff", border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
                <div style={{ background: "#FF8C00", padding: "10px 16px", borderBottom: "3px solid #000" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#000", textTransform: "uppercase" }}>⚠ 争议事件</span>
                </div>
                <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {project.controversies.map((c, i) => (
                    <span key={i} style={{ fontSize: 13, fontWeight: 700, padding: "6px 14px", background: "#FFF3E0", border: "2px solid #FF8C00", color: "#8B4500" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Status card */}
            <section style={{ background: status.bg, border: "3px solid #000", boxShadow: "5px 5px 0 #000", padding: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{status.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#fff", lineHeight: 1, marginBottom: 8 }}>
                {status.label}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                {project.status === "dead" && "该项目已完全归零，代币价值趋近于零，社区已解散。"}
                {project.status === "dying" && "该项目仍在运营，但价值已大幅缩水，生态萎缩严重。"}
                {project.status === "surviving" && "该项目相对幸存，但距离 TGE 高点仍有较大差距。"}
              </div>
              {project.deathDate && (
                <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  💀 死亡日期：{project.deathDate}
                </div>
              )}
            </section>

            {/* Navigation to other projects */}
            <section style={{ background: "#fff", border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
              <div style={{ background: "#000", padding: "10px 16px", borderBottom: "3px solid #000" }}>
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", textTransform: "uppercase" }}>🪦 其他亡灵</span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {projects
                  .filter(p => p.id !== project.id && p.status === "dead")
                  .slice(0, 5)
                  .map(p => {
                    const bg = categoryBg[p.category] ?? "#FFD700";
                    return (
                      <button
                        key={p.id}
                        onClick={() => router.push(`/project/${p.id}`)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#fff", border: "2px solid #000", cursor: "pointer", textAlign: "left", width: "100%" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f5f0d8")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, background: bg, border: "1.5px solid #000", display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 900, color: "#CC0000", fontFamily: "monospace" }}>{p.priceChange}%</span>
                      </button>
                    );
                  })}
                <button
                  onClick={() => router.push("/")}
                  style={{ marginTop: 4, padding: "8px 12px", background: "#FFD700", border: "2.5px solid #000", cursor: "pointer", fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  查看全部墓地 →
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#000", borderTop: "4px solid #000", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#555", fontWeight: 700 }}>数据仅供娱乐参考，不构成投资建议</span>
        <button
          onClick={() => router.back()}
          style={{ fontSize: 11, fontWeight: 800, padding: "6px 16px", background: "none", border: "2px solid #555", color: "#555", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          ← 返回
        </button>
      </div>
    </>
  );
}

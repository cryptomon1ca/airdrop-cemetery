"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { projects, categories, type Category, type Project } from "@/data/projects";
import { useLivePrices, type LivePriceMap } from "@/hooks/useLivePrices";

// ─── Maps ──────────────────────────────────────────────────────────────────
const statusMap = {
  dead:      { label: "已死亡", icon: "💀", color: "#8B0000", bg: "#8B0000" },
  dying:     { label: "垂死中", icon: "📉", color: "#7a3800", bg: "#7a3800" },
  surviving: { label: "存活中", icon: "🫀", color: "#1a5c2a", bg: "#1a5c2a" },
};

const categoryColors: Record<string, string> = {
  DeFi:   "#d4500a",
  L2:     "#0a6b6b",
  Social: "#8B6914",
  GameFi: "#4a3a7a",
  Meme:   "#8a2060",
};

const categoryBg: Record<string, string> = {
  DeFi:   "#FF6B00",
  L2:     "#00BBBB",
  Social: "#F0C040",
  GameFi: "#9B7FE8",
  Meme:   "#FF5090",
};

type SortKey = "drop" | "date" | "backstab" | "fdv";

// ─── Block Rating (like loot-drop's square indicators) ─────────────────────
function BlockRating({ value, max, color }: { value: number; max: number; color: string }) {
  const blocks = Math.round(max);
  const filled = Math.round(value);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: blocks }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 14, height: 14,
            background: i < filled ? color : "#E8E0C8",
            border: "1.5px solid #000",
          }}
        />
      ))}
    </div>
  );
}

// ─── Ticker bar ────────────────────────────────────────────────────────────
function TickerBar() {
  const stats = [
    { icon: "💀", val: projects.length, label: "DEAD AIRDROPS" },
    { icon: "📉", val: `${Math.round(projects.reduce((a,p) => a + Math.abs(p.priceChange), 0) / projects.length)}%`, label: "AVG CRASH" },
    { icon: "🔥", val: `${projects.filter(p => p.status === "dead").length}`, label: "归零项目" },
    { icon: "🗓", val: "2024-2025", label: "覆盖时间" },
    { icon: "📊", val: `${Math.max(...projects.map(p => Math.abs(p.priceChange)))}%`, label: "最惨跌幅" },
    { icon: "🔪", val: `${Math.max(...projects.map(p => p.communityBackstab))}/10`, label: "最高背刺" },
  ];
  const items = [...stats, ...stats];

  return (
    <div style={{ background: "#000", borderTop: "3px solid #000", borderBottom: "3px solid #000", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-flex", animation: "ticker 20s linear infinite" }}>
        {items.map((s, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 24px", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#FFD700", textTransform: "uppercase" }}>
            <span>{s.icon}</span>
            <span style={{ color: "#fff" }}>{s.val}</span>
            <span style={{ color: "#888" }}>{s.label}</span>
            <span style={{ color: "#444", marginLeft: 8 }}>//</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

// ─── Project Card ──────────────────────────────────────────────────────────
function ProjectCard({ project, index, livePrice }: { project: Project; index: number; livePrice?: { currentPrice: number; priceChange: number; priceChange24h: number } }) {
  const router = useRouter();
  const catBg = categoryBg[project.category];
  const status = statusMap[project.status];

  // Use live price if available, fall back to static
  const displayPrice = livePrice?.currentPrice ?? project.currentPrice;
  const displayChange = livePrice?.priceChange ?? project.priceChange;
  const change24h = livePrice?.priceChange24h;

  return (
    <div
      onClick={() => router.push(`/project/${project.id}`)}
      style={{
        background: "#fff",
        border: "3px solid #000",
        boxShadow: "5px 5px 0 #000",
        transition: "transform 0.1s, box-shadow 0.1s",
        animation: `fadeInUp 0.3s ease-out both`,
        animationDelay: `${index * 50}ms`,
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px, -2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "7px 7px 0 #000";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translate(0, 0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "5px 5px 0 #000";
      }}
    >
      {/* Card header - colored by category */}
      <div style={{ background: catBg, borderBottom: "3px solid #000", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#000" }}>{project.category}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#000", opacity: 0.6 }}>TGE {project.tgeDate}</span>
      </div>

      {/* Title + burn badges */}
      <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", color: "#000", lineHeight: 1.1, fontFamily: "Georgia, serif" }}>{project.name}</div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>\\{project.symbol}</div>
        </div>
        {/* Crash % badge - red explosive style */}
        <div style={{ background: "#CC0000", border: "2.5px solid #000", padding: "5px 10px", textAlign: "center", flexShrink: 0, boxShadow: "3px 3px 0 #000", minWidth: 72 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontFamily: "Georgia, serif", lineHeight: 1 }}>{displayChange}%</div>
          <div style={{ fontSize: 8, color: "#ffaaaa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>崩跌</div>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: "0 14px 10px" }}>
        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description}</p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1.5px dashed #ccc", margin: "0 14px" }} />

      {/* Price */}
      <div style={{ padding: "8px 14px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CC0000" }}>价格轨迹</div>
          {change24h !== undefined && (
            <div style={{ fontSize: 9, fontWeight: 800, color: change24h >= 0 ? "#228B22" : "#CC0000", letterSpacing: "0.04em" }}>
              {change24h >= 0 ? "▲" : "▼"}{Math.abs(change24h)}% 24h
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span style={{ color: "#999", textDecoration: "line-through", fontFamily: "monospace", fontWeight: 700 }}>${project.athPrice}</span>
          <span style={{ color: "#ccc" }}>→</span>
          <span style={{ color: "#CC0000", fontFamily: "monospace", fontWeight: 900 }}>${displayPrice}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1.5px dashed #ccc", margin: "8px 14px" }} />

      {/* Block indicators */}
      <div style={{ padding: "4px 14px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#555" }}>TVL 留存</span>
          <BlockRating value={project.tvlRetention / 20} max={5} color={project.tvlRetention < 20 ? "#CC0000" : project.tvlRetention < 60 ? "#FF8C00" : "#228B22"} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#555" }}>背刺程度</span>
          <BlockRating value={project.communityBackstab / 2} max={5} color="#CC0000" />
        </div>
      </div>

      {/* Death cause footer */}
      <div style={{ background: status.bg, borderTop: "3px solid #000", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12 }}>💀</span>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>{status.label}</span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>查看档案 →</span>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({
  selectedCategory, setSelectedCategory, sortKey, setSortKey, searchQuery, setSearchQuery, onNominate,
}: {
  selectedCategory: Category;
  setSelectedCategory: (c: Category) => void;
  sortKey: SortKey;
  setSortKey: (s: SortKey) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onNominate: () => void;
}) {
  return (
    <aside style={{ width: 220, flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto", background: "#FFD700", borderRight: "4px solid #000", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <div style={{ background: "#000", padding: "14px 16px", borderBottom: "4px solid #000" }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", color: "#FFD700", textTransform: "uppercase" }}>🪦 NAVIGATE</div>
      </div>

      {/* Search */}
      <div style={{ padding: "12px 14px", borderBottom: "3px solid #000" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>🔍</span>
          <input
            type="text"
            placeholder="搜索墓地..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: 28, paddingRight: 8, paddingTop: 7, paddingBottom: 7, fontSize: 12, fontWeight: 700, border: "2.5px solid #000", background: "#fff", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Category filter */}
      <div style={{ padding: "12px 14px", borderBottom: "3px solid #000" }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>📁 分类筛选</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                textAlign: "left",
                padding: "7px 10px",
                fontSize: 12,
                fontWeight: 800,
                border: "2.5px solid #000",
                cursor: "pointer",
                letterSpacing: "0.04em",
                background: selectedCategory === cat ? "#000" : "#fff",
                color: selectedCategory === cat ? "#FFD700" : "#000",
              }}
            >
              {cat === "All" ? "📋 全部" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div style={{ padding: "12px 14px", borderBottom: "3px solid #000" }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#000", marginBottom: 8 }}>📊 排序方式</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {([
            ["drop", "📉 跌幅最惨"],
            ["backstab", "🔪 背刺最狠"],
            ["fdv",  "📊 TVL最惨"],
            ["date", "📅 最新入坑"],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              style={{
                textAlign: "left",
                padding: "7px 10px",
                fontSize: 12,
                fontWeight: 800,
                border: "2.5px solid #000",
                cursor: "pointer",
                background: sortKey === key ? "#000" : "#fff",
                color: sortKey === key ? "#FFD700" : "#000",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Nominate button */}
      <div style={{ padding: "16px 14px", marginTop: "auto" }}>
        <button
          onClick={onNominate}
          style={{
            width: "100%",
            padding: "11px 10px",
            background: "#CC0000",
            border: "2.5px solid #000",
            boxShadow: "3px 3px 0 #000",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: "#fff",
            textTransform: "uppercase",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px,-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "5px 5px 0 #000";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #000";
          }}
        >
          🪦 我要提名
        </button>
        <div style={{ fontSize: 9, color: "#888", marginTop: 6, textAlign: "center", letterSpacing: "0.06em" }}>提名下一个空投受害者</div>
      </div>
    </aside>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [showNominate, setShowNominate] = useState(false);
  const [nomProject, setNomProject] = useState("");
  const [nomReason, setNomReason] = useState("");
  const [nomSubmitted, setNomSubmitted] = useState(false);

  // Live price fetching with localStorage cache (12h TTL)
  const { prices: livePrices, loading: pricesLoading, lastUpdated } = useLivePrices(projects);

  const stats = useMemo(() => ({
    total: projects.length,
    dead: projects.filter(p => p.status === "dead").length,
    avgDrop: Math.round(projects.reduce((a, p) => a + Math.abs(p.priceChange), 0) / projects.length),
  }), []);

  const filtered = useMemo(() => {
    let list = projects.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      return matchCat && (!q || p.name.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q));
    });
    if (sortKey === "drop")     list = [...list].sort((a, b) => a.priceChange - b.priceChange);
    if (sortKey === "date")     list = [...list].sort((a, b) => b.tgeDate.localeCompare(a.tgeDate));
    if (sortKey === "backstab") list = [...list].sort((a, b) => b.communityBackstab - a.communityBackstab);
    if (sortKey === "fdv")      list = [...list].sort((a, b) => a.tvlRetention - b.tvlRetention);
    return list;
  }, [selectedCategory, searchQuery, sortKey]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFD700; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* Ticker */}
      <TickerBar />

      {/* Hero */}
      <div style={{ background: "#FFD700", borderBottom: "4px solid #000", padding: "40px 24px 36px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#000", color: "#FFD700", fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", padding: "5px 14px", marginBottom: 16 }}>
          💀 OVER {stats.total} DEAD AIRDROPS
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', 'DM Sans', sans-serif", fontSize: "clamp(56px, 10vw, 96px)", fontWeight: 900, letterSpacing: "0.01em", color: "#000", lineHeight: 0.95, marginBottom: 16 }}>
          空投墓地<br />
          <span style={{ color: "#CC0000" }}>GRAVEYARD</span>
        </h1>
        <p style={{ fontSize: 14, color: "#333", maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>
          收录那些空投后归零的加密项目。数据驱动，黑色幽默，警示后人。<br />
          <span style={{ color: "#CC0000", fontWeight: 800 }}>Loot the wreckage.</span>
        </p>

        {/* Stat badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {[
            { num: stats.total, label: "收录项目" },
            { num: stats.dead, label: "已归零" },
            { num: `${stats.avgDrop}%`, label: "平均崩跌" },
          ].map(({ num, label }) => (
            <div key={label} style={{ background: "#000", border: "3px solid #000", padding: "10px 20px", boxShadow: "4px 4px 0 #888" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em", lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortKey={sortKey}
          setSortKey={setSortKey}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNominate={() => { setShowNominate(true); setNomSubmitted(false); setNomProject(""); setNomReason(""); }}
        />

        {/* Main grid */}
        <main style={{ flex: 1, padding: "24px 20px", minHeight: "100vh" }}>
          {/* Result count */}
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8B6000", marginBottom: 16 }}>
            RESULTS — {filtered.length} 具尸体
          </div>

          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} livePrice={livePrices[p.id]} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🪦</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#8B6000", marginBottom: 12 }}>没有找到匹配的尸体</p>
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 20px", background: "#000", color: "#FFD700", border: "none", cursor: "pointer" }}
              >清除筛选 →</button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div style={{ background: "#000", borderTop: "4px solid #000", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#555", fontWeight: 700 }}>数据仅供娱乐参考，不构成投资建议</span>
        <span style={{ fontSize: 11, color: "#555", fontWeight: 700, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6 }}>
          {pricesLoading ? (
            <span style={{ color: "#FFD700" }}>⟳ 加载价格中...</span>
          ) : lastUpdated ? (
            <span>🟢 价格更新：{lastUpdated}</span>
          ) : (
            <span>价格更新：静态数据</span>
          )}
        </span>
      </div>

      {/* ── 提名弹窗 ── */}
      {showNominate && (
        <div
          onClick={() => setShowNominate(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#FFD700", border: "4px solid #000", boxShadow: "8px 8px 0 #000", width: 460, maxWidth: "100%" }}
          >
            {/* Header */}
            <div style={{ background: "#000", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", color: "#FFD700", textTransform: "uppercase" }}>🪦 提名入墓</span>
              <button
                onClick={() => setShowNominate(false)}
                style={{ background: "none", border: "none", color: "#FFD700", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}
              >✕</button>
            </div>

            {nomSubmitted ? (
              /* Success state */
              <div style={{ padding: "40px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>💀</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.04em", marginBottom: 8 }}>已收到提名</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>感谢你的墓志铭贡献<br />我们会审核后决定是否收录</div>
                <button
                  onClick={() => setShowNominate(false)}
                  style={{ marginTop: 20, padding: "10px 24px", background: "#000", border: "2.5px solid #000", color: "#FFD700", fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
                >关闭</button>
              </div>
            ) : (
              /* Form */
              <div style={{ padding: "24px" }}>
                <div style={{ fontSize: 12, color: "#333", marginBottom: 20, lineHeight: 1.6 }}>
                  发现了一个空投后归零的项目？提名它进入墓地，让更多人引以为戒。
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#333", display: "block", marginBottom: 6 }}>
                    项目名称 / Symbol *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Berachain / BERA"
                    value={nomProject}
                    onChange={e => setNomProject(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontWeight: 700, border: "2.5px solid #000", background: "#fff", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#333", display: "block", marginBottom: 6 }}>
                    为什么它该进墓地？
                  </label>
                  <textarea
                    placeholder="说说它怎么背刺了你，跌了多少，有什么丑闻..."
                    value={nomReason}
                    onChange={e => setNomReason(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: "2.5px solid #000", background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowNominate(false)}
                    style={{ flex: 1, padding: "11px", background: "#fff", border: "2.5px solid #000", cursor: "pointer", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em" }}
                  >取消</button>
                  <button
                    onClick={() => { if (nomProject.trim()) setNomSubmitted(true); }}
                    disabled={!nomProject.trim()}
                    style={{
                      flex: 2, padding: "11px",
                      background: nomProject.trim() ? "#CC0000" : "#ccc",
                      border: "2.5px solid #000",
                      boxShadow: nomProject.trim() ? "3px 3px 0 #000" : "none",
                      cursor: nomProject.trim() ? "pointer" : "not-allowed",
                      fontSize: 13, fontWeight: 900, color: "#fff",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}
                  >
                    💀 提交提名
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountMenu } from "./useProfile";
import { fetchProjects, createProject, deleteProject } from "./api";


const ProgramIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect x="30" y="20" width="140" height="90" rx="12" fill="#1a1f2e" stroke="#6C63FF" strokeWidth="2.5"/>
    <rect x="38" y="30" width="124" height="66" rx="6" fill="#0d1117"/>
    <rect x="46" y="38" width="30" height="5" rx="2.5" fill="#6C63FF"/>
    <rect x="80" y="38" width="50" height="5" rx="2.5" fill="#00E5FF"/>
    <rect x="52" y="50" width="20" height="5" rx="2.5" fill="#f4b400"/>
    <rect x="76" y="50" width="35" height="5" rx="2.5" fill="#ff8c42"/>
    <rect x="52" y="62" width="45" height="5" rx="2.5" fill="#00E5FF"/>
    <rect x="46" y="74" width="30" height="5" rx="2.5" fill="#6C63FF"/>
  </svg>
);

const DrawIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect x="20" y="30" width="160" height="110" rx="10" fill="#1a1f2e" stroke="#00C853" strokeWidth="2.5"/>
    <rect x="28" y="38" width="144" height="94" rx="6" fill="#0d1117"/>
    <path d="M45 120 C65 85 85 125 105 90 C125 55 145 105 168 72" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="6 3"/>
    <rect x="88" y="78" width="22" height="18" rx="4" fill="#00C853"/>
    <rect x="91" y="81" width="5" height="5" rx="1" fill="#FFEB3B"/>
    <rect x="100" y="81" width="5" height="5" rx="1" fill="#FFEB3B"/>
    <circle cx="98" cy="69" r="3" fill="#FFEB3B"/>
  </svg>
);

const Stars = () => {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:Math.random()*2+0.4, delay:Math.random()*3, dur:Math.random()*2+2,
  }));
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {stars.map(s => <div key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", opacity:0.3, animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite alternate` }}/>)}
    </div>
  );
};

const MODES = [
  { type:"program", title:"البرمجة", emoji:"⚙️", desc:"استخدم الكتل البرمجية للتحكم في الروبوت!", btnLabel:"ابدأ البرمجة", bg:"linear-gradient(160deg,#1a1040,#2a1a6e,#0f0a2e)", border:"rgba(108,99,255,0.6)", glow:"rgba(108,99,255,0.3)", btnBg:"linear-gradient(135deg,#6C63FF,#9C63FF)", illustration:<ProgramIllustration/> },
  { type:"draw",    title:"ارسم واتبع", emoji:"✏️", desc:"ارسم مساراً بيدك وشاهد الروبوت يتبعه!", btnLabel:"ابدأ الرسم",    bg:"linear-gradient(160deg,#0a2016,#0d3320,#051209)", border:"rgba(0,200,83,0.6)",   glow:"rgba(0,200,83,0.28)",   btnBg:"linear-gradient(135deg,#00C853,#00897B)", illustration:<DrawIllustration/> },
];

export default function HomePage() {
  const navigate = useNavigate();

  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showPrompt,  setShowPrompt]  = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [error,       setError]       = useState("");
  const [creating,    setCreating]    = useState(false);
  const [hoveredMode, setHoveredMode] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetchProjects()
      .then(data => setProjects(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openPrompt = (type) => { setProjectType(type); setProjectName(""); setError(""); setShowPrompt(true); };

  const handleCreate = async () => {
    if (!projectName.trim()) { setError("يرجى كتابة اسم المشروع"); return; }
    try {
      setCreating(true);
      const p = await createProject(projectName.trim(), projectType);
      setProjects(prev => [p, ...prev]);
      setShowPrompt(false);
      navigate(`/${projectType}`, { state: { projectName: p.name, projectId: p._id } });
    } catch {
      setError("تعذّر إنشاء المشروع، تحقق من اتصالك");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p._id !== id));
    try { await deleteProject(id); } catch {}
  };

  const handleOpen = (p) => {
    setShowSidebar(false);
    navigate(`/${p.type}`, { state: { projectName: p.name, projectId: p._id } });
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("ar-TN");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; width:100%; overflow:hidden; background:#07090f; }

        @keyframes twinkle    { from{opacity:0.1} to{opacity:0.65} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn    { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn      { from{opacity:0;transform:translate(-50%,-50%) scale(0.9)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes welcomeFade{ from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }

        /* ── Mode cards ── */
        .mode-col {
          flex:1;
          display:flex;
          flex-direction:column;
          gap:12px;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mode-col:hover {
          transform: translateY(-6px) scale(1.02);
        }
        .mode-card-inner {
          flex:1;
          border-radius:24px;
          padding:16px 14px;
          backdrop-filter:blur(10px);
          display:flex;
          flex-direction:column;
          gap:10px;
          overflow:hidden;
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
          cursor: pointer;
        }

        /* ── Start button ── */
        .start-btn {
          width:100%;
          padding:13px 0;
          border:none;
          color:#fff;
          border-radius:14px;
          font-size:clamp(14px,3.5vw,17px);
          font-weight:800;
          cursor:pointer;
          font-family:'Tajawal',sans-serif;
          touch-action:manipulation;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, filter 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .start-btn::after {
          content:'';
          position:absolute;
          inset:0;
          background:rgba(255,255,255,0);
          transition: background 0.2s ease;
        }
        .start-btn:hover {
          transform: scale(1.04) translateY(-2px);
          filter: brightness(1.15);
        }
        .start-btn:hover::after {
          background: rgba(255,255,255,0.08);
        }
        .start-btn:active {
          transform: scale(0.97);
        }

        /* ── Top bar buttons ── */
        .topbar-btn {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, box-shadow 0.2s ease;
        }
        .topbar-btn:hover {
          transform: scale(1.12);
          background: rgba(255,255,255,0.18) !important;
          box-shadow: 0 0 16px rgba(255,255,255,0.15);
        }
        .topbar-btn:active {
          transform: scale(0.95);
        }

        /* ── Sidebar project items ── */
        .proj-item {
          transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease !important;
          cursor: pointer;
        }
        .proj-item:hover {
          transform: translateX(4px) !important;
          background: rgba(255,255,255,0.08) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
        }

        /* ── Delete button ── */
        .del-btn {
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.18s ease !important;
        }
        .del-btn:hover {
          transform: scale(1.25) !important;
          background: rgba(255,107,107,0.25) !important;
        }

        /* ── Sidebar ── */
        .sidebar-scroll { flex:1; overflow-y:auto; padding:10px; scrollbar-width:thin; scrollbar-color:rgba(108,99,255,0.4) rgba(255,255,255,0.04); }
        .sidebar-scroll::-webkit-scrollbar { width:4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.4); border-radius:2px; }

        /* ── Modal ── */
        .modal-inner { overflow-y:auto; scrollbar-width:thin; }
        .modal-inner::-webkit-scrollbar { width:4px; }
        .modal-inner::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.4); border-radius:2px; }

        /* ── Modal buttons ── */
        .modal-btn {
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), filter 0.18s ease, opacity 0.18s ease !important;
        }
        .modal-btn:hover:not(:disabled) {
          transform: scale(1.03) translateY(-1px) !important;
          filter: brightness(1.1) !important;
        }
        .modal-btn:active:not(:disabled) {
          transform: scale(0.97) !important;
        }
      `}</style>

      <div style={{ position:"fixed", inset:0, zIndex:0, transition:"background 0.6s", background: hoveredMode ? MODES.find(m=>m.type===hoveredMode)?.bg || MODES[0].bg : MODES[0].bg }}/>
      <Stars/>

      <div style={{ position:"relative", zIndex:1, height:"100vh", width:"100vw", display:"flex", flexDirection:"column", fontFamily:"'Tajawal',sans-serif", color:"#fff", direction:"rtl", overflow:"hidden" }}>

        {/* TOP BAR */}
        <div style={{ height:50, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", background:"rgba(0,0,0,0.28)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)", zIndex:20, overflow:"visible" }}>
          
          {/* Projects button — RIGHT side (rtl) */}
          <button
            className="topbar-btn"
            onClick={() => setShowSidebar(true)}
            style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.14)", color:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, touchAction:"manipulation" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/></svg>
            <span style={{ fontSize:8, fontWeight:800, lineHeight:1 }}>{projects.length}</span>
          </button>

          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(15px,4vw,21px)", background:"linear-gradient(90deg,#fff,rgba(255,255,255,0.65))", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}></h1>

          {/* Account — LEFT side (rtl) */}
          <div className="topbar-btn" style={{ borderRadius:50 }}>
            <AccountMenu navigate={navigate}/>
          </div>
        </div>

        {/* WELCOME BAR */}
        <div className="welcome-bar" style={{ flexShrink:0, textAlign:"center", padding:"8px 20px", background:"rgba(0,0,0,0.18)", borderBottom:"1px solid rgba(255,255,255,0.05)", animation:"welcomeFade 0.5s ease both" }}>
          <p style={{ fontFamily:"'Tajawal',sans-serif", fontSize:"clamp(12px,3vw,15px)", fontWeight:700, color:"rgba(255,255,255,0.65)", margin:0, letterSpacing:0.3 }}>
            أهلاً بك! اختر نشاطك المفضل!
          </p>
        </div>

        {/* CARDS */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 20px 12px", overflow:"hidden" }}>
          <div style={{ display:"flex", flexDirection:"row", gap:16, width:"100%", maxWidth:900, height:"100%", maxHeight:360, animation:"fadeIn 0.45s ease both" }}>
            {MODES.map(mode => (
              <div
                key={mode.type}
                className="mode-col"
                onMouseEnter={() => setHoveredMode(mode.type)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                <div
                  className="mode-card-inner"
                  style={{
                    background:"rgba(0,0,0,0.32)",
                    border:`2px solid ${hoveredMode===mode.type ? mode.border : mode.border.replace("0.6","0.35")}`,
                    boxShadow: hoveredMode===mode.type
                      ? `0 16px 50px ${mode.glow}, 0 0 0 1px ${mode.border}`
                      : `0 8px 30px ${mode.glow.replace("0.28","0.12")}`,
                  }}
                  onClick={() => openPrompt(mode.type)}
                >
                  <div style={{ flex:1, borderRadius:14, overflow:"hidden", minHeight:0 }}>{mode.illustration}</div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{
                      fontSize:"clamp(20px,4vw,32px)",
                      marginBottom:3,
                      display:"inline-block",
                      transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                      transform: hoveredMode===mode.type ? "scale(1.3) rotate(-5deg)" : "scale(1)",
                    }}>{mode.emoji}</div>
                    <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:"clamp(15px,3vw,22px)", fontWeight:900, color:"#fff", marginBottom:4 }}>{mode.title}</h2>
                    <p style={{ fontSize:"clamp(11px,2vw,13px)", color:"rgba(255,255,255,0.55)", lineHeight:1.6, fontWeight:600 }}>{mode.desc}</p>
                  </div>
                </div>
                <button
                  className="start-btn"
                  style={{
                    background: mode.btnBg,
                    boxShadow: hoveredMode===mode.type
                      ? `0 8px 28px ${mode.glow}`
                      : `0 4px 14px ${mode.glow.replace("0.28","0.15")}`,
                    flexShrink:0,
                  }}
                  onClick={() => openPrompt(mode.type)}
                >
                  {mode.btnLabel} ←
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SIDEBAR — opens to the RIGHT since direction is rtl */}
      {showSidebar && (
        <>
          <div onClick={() => setShowSidebar(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.58)", zIndex:100 }}/>
          <div style={{
            position:"fixed",
            right:0,        /* ← RIGHT side to match the button */
            top:0,
            bottom:0,
            width:"min(82vw,290px)",
            background:"#0d1117",
            borderLeft:"1px solid rgba(255,255,255,0.07)",
            zIndex:110,
            display:"flex",
            flexDirection:"column",
            animation:"slideInRight 0.26s ease both",
            boxShadow:"-4px 0 28px rgba(0,0,0,0.6)",
          }}>
            <style>{`
              @keyframes slideInRight { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
            `}</style>
            <div style={{ padding:"16px 14px 12px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, direction:"rtl" }}>
              <div>
                <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:"#fff" }}>مشاريعي ☁️</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600, marginTop:1 }}>{loading ? "جاري التحميل..." : `${projects.length} مشروع مزامن`}</div>
              </div>
              <button
                className="topbar-btn"
                onClick={() => setShowSidebar(false)}
                style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:9, width:30, height:30, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <div className="sidebar-scroll" style={{ direction:"rtl" }}>
              {loading ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(255,255,255,0.3)", fontSize:13 }}>
                  <div style={{ width:28, height:28, border:"3px solid rgba(108,99,255,0.5)", borderTopColor:"#6C63FF", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 10px" }}/>
                  جاري التحميل...
                </div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign:"center", padding:"36px 16px", color:"rgba(255,255,255,0.22)", fontSize:13, fontWeight:600 }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📭</div>لا توجد مشاريع بعد
                </div>
              ) : projects.map(p => (
                <div key={p._id} className="proj-item" onClick={() => handleOpen(p)}
                  style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${p.type==="program"?"rgba(108,99,255,0.22)":"rgba(0,200,83,0.22)"}`, borderRadius:11, padding:"10px 11px", marginBottom:7, display:"flex", alignItems:"center", gap:9, direction:"rtl" }}>
                  <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:p.type==="program"?"rgba(108,99,255,0.18)":"rgba(0,200,83,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
                    {p.type==="program"?"⚙️":"✏️"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>{p.type==="program"?"برمجة":"رسم"} • {fmtDate(p.createdAt)}</div>
                  </div>
                  <button className="del-btn" onClick={(e) => handleDelete(p._id,e)} style={{ background:"rgba(255,107,107,0.1)", border:"none", color:"#FF6B6B", borderRadius:7, width:24, height:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, touchAction:"manipulation" }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* NEW PROJECT MODAL */}
      {showPrompt && (
        <>
          <div onClick={() => setShowPrompt(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(92vw,400px)", zIndex:310, animation:"popIn 0.22s ease both" }}>
            <div className="modal-inner" style={{ background:"#161b22", border:`1.5px solid ${projectType==="program"?"rgba(108,99,255,0.5)":"rgba(0,200,83,0.5)"}`, borderRadius:22, padding:"22px 20px", boxShadow:"0 24px 60px rgba(0,0,0,0.8)", direction:"rtl" }}>
              <div style={{ textAlign:"center", marginBottom:16 }}>
                <div style={{ fontSize:32, marginBottom:6 }}>{projectType==="program"?"⚙️":"✏️"}</div>
                <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:18, fontWeight:900, color:"#fff", marginBottom:4 }}>مشروع جديد</h2>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600 }}>{projectType==="program"?"مشروع برمجة":"مشروع رسم واتبع"}</p>
              </div>
              <label style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.5)", fontFamily:"'Tajawal',sans-serif", display:"block", marginBottom:7 }}>اسم المشروع</label>
              <input type="text" value={projectName}
                onChange={e => { setProjectName(e.target.value); setError(""); }}
                onKeyDown={e => e.key==="Enter" && handleCreate()}
                placeholder="مثال: مشروع الروبوت 🤖"
                style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,0.06)", border:`1.5px solid ${error?"rgba(255,107,107,0.6)":"rgba(255,255,255,0.12)"}`, borderRadius:11, color:"#fff", fontSize:15, fontFamily:"'Tajawal',sans-serif", outline:"none", direction:"rtl", marginBottom:error?6:14, transition:"border-color 0.2s ease" }}
              />
              {error && <div style={{ color:"#FF6B6B", fontSize:12, fontWeight:700, marginBottom:12 }}>⚠️ {error}</div>}
              <div style={{ display:"flex", gap:10 }}>
                <button className="modal-btn" onClick={() => setShowPrompt(false)} style={{ flex:1, padding:"11px 0", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:11, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>إلغاء</button>
                <button className="modal-btn" onClick={handleCreate} disabled={creating} style={{ flex:2, padding:"11px 0", background:projectType==="program"?"linear-gradient(135deg,#6C63FF,#9C63FF)":"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:11, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation", opacity:creating?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {creating ? <><div style={{ width:14, height:14, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> جاري...</> : "إنشاء المشروع ✨"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
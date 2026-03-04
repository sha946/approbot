import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AccountMenu, useProfile, Avatar } from "./useProfile";

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
    <rect x="80" y="74" width="40" height="5" rx="2.5" fill="#9c27b0" opacity="0.8"/>
    <rect x="148" y="95" width="22" height="18" rx="4" fill="#6C63FF"/>
    <rect x="151" y="99" width="5" height="5" rx="1" fill="#00E5FF"/>
    <rect x="159" y="99" width="5" height="5" rx="1" fill="#00E5FF"/>
    <rect x="155" y="89" width="6" height="7" rx="2" fill="#6C63FF"/>
    <circle cx="158" cy="88" r="2.5" fill="#FF6B6B"/>
  </svg>
);

const DrawIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect x="20" y="40" width="160" height="100" rx="10" fill="#1a1f2e" stroke="#00C853" strokeWidth="2.5"/>
    <rect x="28" y="48" width="144" height="84" rx="6" fill="#0d1117"/>
    <path d="M45 110 C60 85 80 120 100 90 C120 60 140 100 160 75" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="6 3"/>
    <rect x="90" y="80" width="20" height="16" rx="4" fill="#00C853"/>
    <rect x="93" y="83" width="5" height="5" rx="1" fill="#FFEB3B"/>
    <rect x="102" y="83" width="5" height="5" rx="1" fill="#FFEB3B"/>
    <rect x="96" y="73" width="6" height="8" rx="2" fill="#00C853"/>
    <circle cx="99" cy="72" r="2.5" fill="#FFEB3B"/>
  </svg>
);

const Stars = () => {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    size: Math.random()*2+0.5, delay: Math.random()*3, duration: Math.random()*2+2,
  }));
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {stars.map(s => (
        <div key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", opacity:0.35, animation:`twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
    </div>
  );
};

const MODES = [
  {
    type: "program",
    title: "البرمجة",
    emoji: "⚙️",
    desc: "استخدم الكتل البرمجية للتحكم في الروبوت وتعليمه ما تريد!",
    btnLabel: "ابدأ البرمجة",
    bg: "linear-gradient(160deg, #1a1040 0%, #2a1a6e 60%, #0f0a2e 100%)",
    border: "rgba(108,99,255,0.6)",
    glow: "rgba(108,99,255,0.35)",
    btnBg: "linear-gradient(135deg,#6C63FF,#9C63FF)",
    illustration: <ProgramIllustration />,
  },
  {
    type: "draw",
    title: "ارسم واتبع",
    emoji: "✏️",
    desc: "ارسم مساراً بيدك وشاهد الروبوت يتبعه بدقة!",
    btnLabel: "ابدأ الرسم",
    bg: "linear-gradient(160deg, #0a2016 0%, #0d3320 60%, #051209 100%)",
    border: "rgba(0,200,83,0.6)",
    glow: "rgba(0,200,83,0.3)",
    btnBg: "linear-gradient(135deg,#00C853,#00897B)",
    illustration: <DrawIllustration />,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const projectsKey = `projects_${currentUser?.username || "guest"}`;

  const [showPrompt, setShowPrompt]   = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [projects, setProjects]       = useState(JSON.parse(localStorage.getItem(projectsKey) || "[]"));
  const [error, setError]             = useState("");
  const [activeIdx, setActiveIdx]     = useState(0);
  const carouselRef                   = useRef(null);

  const openPrompt = (type) => { setProjectType(type); setProjectName(""); setError(""); setShowPrompt(true); };

  const handleCreate = () => {
    if (!projectName.trim()) { setError("يرجى كتابة اسم المشروع"); return; }
    const newProject = { id: Date.now(), name: projectName.trim(), type: projectType, createdAt: new Date().toLocaleDateString("ar-TN") };
    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem(projectsKey, JSON.stringify(updated));
    setShowPrompt(false);
    navigate(`/${projectType}`, { state: { projectName: newProject.name } });
  };

  const handleDeleteProject = (id, e) => {
    e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem(projectsKey, JSON.stringify(updated));
  };

  const handleOpenProject = (project) => {
    setShowSidebar(false);
    navigate(`/${project.type}`, { state: { projectName: project.name } });
  };

  const handleScroll = (e) => {
    const el = e.target;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIdx(idx);
  };

  const scrollTo = (idx) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: idx * carouselRef.current.offsetWidth, behavior:"smooth" });
    }
    setActiveIdx(idx);
  };

  const activeMode = MODES[activeIdx] || MODES[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; width:100%; overflow:hidden; background:#07090f; }

        @keyframes twinkle  { from{opacity:0.15} to{opacity:0.7} }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn    { from{opacity:0;transform:translate(-50%,-50%) scale(0.9)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes slideUp  { from{transform:translateY(100%)} to{transform:translateY(0)} }

        /* Carousel */
        .carousel {
          display: flex;
          width: 100%;
          height: 100%;
          overflow-x: scroll;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .carousel::-webkit-scrollbar { display: none; }

        .carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          scroll-snap-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 24px 28px;
          position: relative;
          overflow: hidden;
          transition: opacity 0.3s;
        }

        .card-inner {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          animation: fadeIn 0.5s ease both;
        }

        .start-btn {
          width: 100%; padding: 15px 0;
          border: none; color: #fff; border-radius: 16px;
          font-size: clamp(15px,4vw,18px); font-weight: 800;
          cursor: pointer; font-family: 'Tajawal',sans-serif;
          touch-action: manipulation;
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.5px;
        }
        .start-btn:active { transform: scale(0.97); }

        .dot { width:8px; height:8px; border-radius:50%; cursor:pointer; transition:all 0.3s; border:none; }
        .dot.active { width:24px; border-radius:4px; }

        .project-item:hover { background:rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Fixed BG */}
      <div style={{ position:"fixed", inset:0, zIndex:0, transition:"background 0.6s ease", background: activeMode.bg }} />
      <Stars />

      <div style={{ position:"relative", zIndex:1, height:"100vh", width:"100vw", display:"flex", flexDirection:"column", fontFamily:"'Tajawal',sans-serif", color:"#fff", direction:"rtl", overflow:"hidden" }}>

        {/* TOP BAR */}
        <div style={{ height:56, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", background:"rgba(0,0,0,0.25)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)", zIndex:20 }}>
          <button onClick={() => setShowSidebar(true)}
            style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.15)", color:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, touchAction:"manipulation" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/></svg>
            <span style={{ fontSize:9, fontWeight:800 }}>{projects.length}</span>
          </button>

          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(16px,4vw,22px)", background:"linear-gradient(90deg,#fff,rgba(255,255,255,0.7))", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            🤖 روبوت كيدز
          </h1>

          <AccountMenu navigate={navigate} />
        </div>

        {/* CAROUSEL */}
        <div ref={carouselRef} className="carousel" onScroll={handleScroll} style={{ flex:1 }}>
          {MODES.map((mode, idx) => (
            <div key={mode.type} className="carousel-slide">
              {/* Glow orb */}
              <div style={{ position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)", width:"60vw", height:"60vw", maxWidth:400, maxHeight:400, borderRadius:"50%", background:`radial-gradient(circle, ${mode.glow} 0%, transparent 70%)`, pointerEvents:"none" }} />

              <div className="card-inner">
                {/* Big illustration card */}
                <div style={{
                  width:"100%",
                  background:"rgba(0,0,0,0.3)",
                  border:`2px solid ${mode.border}`,
                  borderRadius:28,
                  padding:"24px 20px 20px",
                  backdropFilter:"blur(10px)",
                  boxShadow:`0 12px 48px ${mode.glow}`,
                  display:"flex", flexDirection:"column", gap:16,
                }}>
                  {/* Illustration */}
                  <div style={{ width:"100%", height:"clamp(140px,30vw,220px)", borderRadius:16, overflow:"hidden" }}>
                    {mode.illustration}
                  </div>

                  {/* Info */}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"clamp(28px,7vw,40px)", marginBottom:6 }}>{mode.emoji}</div>
                    <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:"clamp(20px,5vw,28px)", fontWeight:900, color:"#fff", marginBottom:8 }}>
                      {mode.title}
                    </h2>
                    <p style={{ fontSize:"clamp(13px,3vw,15px)", color:"rgba(255,255,255,0.6)", lineHeight:1.7, fontWeight:600 }}>
                      {mode.desc}
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="start-btn"
                  style={{ background: mode.btnBg, boxShadow:`0 6px 24px ${mode.glow}` }}
                  onClick={() => openPrompt(mode.type)}>
                  {mode.btnLabel} ←
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DOTS INDICATOR */}
        <div style={{ height:40, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"rgba(0,0,0,0.2)" }}>
          {MODES.map((_, idx) => (
            <button key={idx} className={`dot ${activeIdx===idx?"active":""}`}
              style={{ background: activeIdx===idx ? "#fff" : "rgba(255,255,255,0.3)" }}
              onClick={() => scrollTo(idx)}
            />
          ))}
        </div>
      </div>

      {/* SIDEBAR */}
      {showSidebar && (
        <>
          <div onClick={() => setShowSidebar(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100 }} />
          <div style={{ position:"fixed", left:0, top:0, bottom:0, width:"min(85vw,300px)", background:"#0d1117", borderRight:"1px solid rgba(255,255,255,0.08)", zIndex:110, display:"flex", flexDirection:"column", animation:"slideIn 0.28s ease both", boxShadow:"4px 0 30px rgba(0,0,0,0.6)" }}>
            <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:17, color:"#fff" }}>مشاريعي 📁</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:600, marginTop:2 }}>{projects.length} مشروع</div>
              </div>
              <button onClick={() => setShowSidebar(false)} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"10px" }}>
              {projects.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(255,255,255,0.25)", fontSize:14, fontWeight:600 }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>📭</div>لا توجد مشاريع بعد
                </div>
              ) : projects.map(project => (
                <div key={project.id} className="project-item" onClick={() => handleOpenProject(project)}
                  style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${project.type==="program"?"rgba(108,99,255,0.25)":"rgba(0,200,83,0.25)"}`, borderRadius:12, padding:"11px 12px", marginBottom:8, cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"background 0.15s" }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:project.type==="program"?"rgba(108,99,255,0.2)":"rgba(0,200,83,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                    {project.type==="program"?"⚙️":"✏️"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{project.name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:600 }}>{project.type==="program"?"برمجة":"رسم"} • {project.createdAt}</div>
                  </div>
                  <button onClick={(e)=>handleDeleteProject(project.id,e)} style={{ background:"rgba(255,107,107,0.12)", border:"none", color:"#FF6B6B", borderRadius:8, width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, touchAction:"manipulation" }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* NEW PROJECT MODAL */}
      {showPrompt && (
        <>
          <div onClick={() => setShowPrompt(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300 }} />
          <div style={{
            position:"fixed", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:"min(92vw,400px)",
            background:"#161b22",
            border:`1.5px solid ${projectType==="program"?"rgba(108,99,255,0.5)":"rgba(0,200,83,0.5)"}`,
            borderRadius:24, padding:"26px 22px",
            zIndex:310, animation:"popIn 0.22s ease both",
            boxShadow:"0 24px 60px rgba(0,0,0,0.8)",
          }}>
            <div style={{ textAlign:"center", marginBottom:18 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>{projectType==="program"?"⚙️":"✏️"}</div>
              <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:20, fontWeight:900, color:"#fff", marginBottom:4 }}>مشروع جديد</h2>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600 }}>{projectType==="program"?"مشروع برمجة":"مشروع رسم واتبع"}</p>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.5)", fontFamily:"'Tajawal',sans-serif", display:"block", marginBottom:8 }}>اسم المشروع</label>
              <input
                type="text" value={projectName}
                onChange={e => { setProjectName(e.target.value); setError(""); }}
                onKeyDown={e => e.key==="Enter" && handleCreate()}
                placeholder="مثال: مشروع الروبوت 🤖"
                style={{ width:"100%", padding:"13px 14px", background:"rgba(255,255,255,0.06)", border:`1.5px solid ${error?"rgba(255,107,107,0.6)":"rgba(255,255,255,0.12)"}`, borderRadius:12, color:"#fff", fontSize:15, fontFamily:"'Tajawal',sans-serif", outline:"none", direction:"rtl" }}
              />
              {error && <div style={{ color:"#FF6B6B", fontSize:12, fontWeight:700, marginTop:6 }}>⚠️ {error}</div>}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowPrompt(false)} style={{ flex:1, padding:"12px 0", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>إلغاء</button>
              <button onClick={handleCreate} style={{ flex:2, padding:"12px 0", background:projectType==="program"?"linear-gradient(135deg,#6C63FF,#9C63FF)":"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>إنشاء المشروع ✨</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
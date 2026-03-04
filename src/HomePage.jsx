import { useState } from "react";
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
  const stars = Array.from({ length: 25 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    size: Math.random()*2+0.5, delay: Math.random()*3, duration: Math.random()*2+2,
  }));
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {stars.map(s => (
        <div key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", opacity:0.4, animation:`twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
    </div>
  );
};

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { min-height:100%; width:100%; background:#07090f; }
        @keyframes twinkle  { from{opacity:0.2} to{opacity:0.8} }
        @keyframes floatUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes titlePop { 0%{opacity:0;transform:scale(0.88)} 100%{opacity:1;transform:scale(1)} }
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn    { from{opacity:0;transform:translate(-50%,-50%) scale(0.9)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }

        .mode-card {
          cursor:pointer; border-radius:20px; padding:20px 18px;
          display:flex; flex-direction:column; align-items:center; gap:12px;
          position:relative; overflow:hidden;
          transition:transform 0.25s, box-shadow 0.25s;
          animation:floatUp 0.6s ease both;
        }
        .mode-card:active { transform:scale(0.97) !important; }
        @media(hover:hover){ .mode-card:hover { transform:translateY(-6px) scale(1.02); } }
        .card-program { background:linear-gradient(145deg,#1a1040,#0f0a2e); border:2px solid rgba(108,99,255,0.4); box-shadow:0 8px 32px rgba(108,99,255,0.2); animation-delay:0.1s; }
        .card-draw    { background:linear-gradient(145deg,#0a2016,#051209); border:2px solid rgba(0,200,83,0.4); box-shadow:0 8px 32px rgba(0,200,83,0.15); animation-delay:0.22s; }
        .btn-program  { background:linear-gradient(135deg,#6C63FF,#9C63FF); box-shadow:0 4px 16px rgba(108,99,255,0.4); }
        .btn-draw     { background:linear-gradient(135deg,#00C853,#00897B); box-shadow:0 4px 16px rgba(0,200,83,0.35); }
        .project-item:hover { background:rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 20% 30%,#0e0a2a 0%,#07090f 60%)", zIndex:0 }} />
      <Stars />

      {/* Scrollable container */}
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Tajawal',sans-serif", color:"#fff", direction:"rtl" }}>

        {/* Top bar */}
        <div style={{ position:"sticky", top:0, zIndex:50, height:52, background:"rgba(7,9,15,0.88)", backdropFilter:"blur(14px)", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", flexShrink:0 }}>
          <button onClick={() => setShowSidebar(true)}
            style={{ width:40, height:40, borderRadius:12, background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.35)", color:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, touchAction:"manipulation" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/></svg>
            <span style={{ fontSize:9, fontWeight:800 }}>{projects.length}</span>
          </button>
          <AccountMenu navigate={navigate} />
        </div>

        {/* Content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 16px 40px" }}>

          {/* Title */}
          <div style={{ textAlign:"center", marginBottom:28, animation:"titlePop 0.5s ease both" }}>
            <div style={{ fontSize:11, letterSpacing:4, color:"rgba(255,255,255,0.4)", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>🤖 مرحباً بك</div>
            <h1 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:"clamp(24px,7vw,48px)", fontWeight:900, lineHeight:1.2, background:"linear-gradient(135deg,#fff 0%,#a78bfa 40%,#00E5FF 80%,#fff 100%)", backgroundSize:"200% auto", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 4s linear infinite" }}>
              لنبرمج معاً! 🚀
            </h1>
            <p style={{ marginTop:8, color:"rgba(255,255,255,0.45)", fontSize:"clamp(13px,3.5vw,16px)", fontWeight:600 }}>اختر نشاطك المفضل</p>
          </div>

          {/* Cards grid — 1 col on mobile, 2 on tablet+ */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, width:"100%", maxWidth:700 }}>
            <div className="mode-card card-program" onClick={() => openPrompt("program")}>
              <div style={{ width:"100%", height:120 }}><ProgramIllustration /></div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>⚙️</div>
                <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:"clamp(17px,4vw,21px)", fontWeight:800, color:"#fff", marginBottom:5 }}>البرمجة</h2>
                <p style={{ fontSize:"clamp(12px,3vw,13px)", color:"rgba(255,255,255,0.5)", lineHeight:1.6, fontWeight:600 }}>استخدم الكتل البرمجية للتحكم في الروبوت!</p>
              </div>
              <button className="btn-program" style={{ width:"100%", padding:"12px 0", border:"none", color:"#fff", borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>ابدأ البرمجة ←</button>
            </div>

            <div className="mode-card card-draw" onClick={() => openPrompt("draw")}>
              <div style={{ width:"100%", height:120 }}><DrawIllustration /></div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>✏️</div>
                <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:"clamp(17px,4vw,21px)", fontWeight:800, color:"#fff", marginBottom:5 }}>ارسم واتبع</h2>
                <p style={{ fontSize:"clamp(12px,3vw,13px)", color:"rgba(255,255,255,0.5)", lineHeight:1.6, fontWeight:600 }}>ارسم مساراً وشاهد الروبوت يتبعه!</p>
              </div>
              <button className="btn-draw" style={{ width:"100%", padding:"12px 0", border:"none", color:"#fff", borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>ابدأ الرسم ←</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <>
          <div onClick={() => setShowSidebar(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200 }} />
          <div style={{ position:"fixed", left:0, top:0, bottom:0, width:"min(85vw,300px)", background:"#0d1117", borderRight:"1px solid rgba(255,255,255,0.08)", zIndex:210, display:"flex", flexDirection:"column", animation:"slideIn 0.28s ease both", boxShadow:"4px 0 30px rgba(0,0,0,0.6)" }}>
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
                  <button onClick={(e)=>handleDeleteProject(project.id,e)} style={{ background:"rgba(255,107,107,0.12)", border:"none", color:"#FF6B6B", borderRadius:8, width:26, height:26, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* New project modal */}
      {showPrompt && (
        <>
          <div onClick={() => setShowPrompt(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:300 }} />
          <div style={{
            position:"fixed", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:"min(92vw,400px)",
            background:"#161b22",
            border:`1.5px solid ${projectType==="program"?"rgba(108,99,255,0.4)":"rgba(0,200,83,0.4)"}`,
            borderRadius:22, padding:"24px 20px",
            zIndex:310, animation:"popIn 0.22s ease both",
            boxShadow:"0 24px 60px rgba(0,0,0,0.7)",
          }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:32, marginBottom:6 }}>{projectType==="program"?"⚙️":"✏️"}</div>
              <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:19, fontWeight:900, color:"#fff", marginBottom:4 }}>مشروع جديد</h2>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600 }}>{projectType==="program"?"مشروع برمجة":"مشروع رسم واتبع"}</p>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.5)", fontFamily:"'Tajawal',sans-serif", display:"block", marginBottom:7 }}>اسم المشروع</label>
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
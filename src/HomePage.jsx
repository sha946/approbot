import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountMenu, useProfile, Avatar } from "./useProfile";

// ── Illustrations ──────────────────────────────────────────────
const ProgramIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect x="30" y="20" width="140" height="90" rx="12" fill="#1a1f2e" stroke="#6C63FF" strokeWidth="2.5"/>
    <rect x="38" y="30" width="124" height="66" rx="6" fill="#0d1117"/>
    <rect x="46" y="38" width="30" height="5" rx="2.5" fill="#6C63FF"/>
    <rect x="80" y="38" width="50" height="5" rx="2.5" fill="#00E5FF"/>
    <rect x="52" y="50" width="20" height="5" rx="2.5" fill="#f4b400"/>
    <rect x="76" y="50" width="35" height="5" rx="2.5" fill="#ff8c42"/>
    <rect x="115" y="50" width="25" height="5" rx="2.5" fill="#6C63FF"/>
    <rect x="52" y="62" width="45" height="5" rx="2.5" fill="#00E5FF"/>
    <rect x="101" y="62" width="20" height="5" rx="2.5" fill="#FF6B6B"/>
    <rect x="46" y="74" width="30" height="5" rx="2.5" fill="#6C63FF"/>
    <rect x="80" y="74" width="40" height="5" rx="2.5" fill="#9c27b0" opacity="0.8"/>
    <rect x="46" y="86" width="55" height="5" rx="2.5" fill="#f4b400"/>
    <rect x="88" y="110" width="24" height="8" rx="2" fill="#1a1f2e" stroke="#6C63FF" strokeWidth="1.5"/>
    <rect x="72" y="118" width="56" height="6" rx="3" fill="#1a1f2e" stroke="#6C63FF" strokeWidth="1.5"/>
    <rect x="148" y="95" width="22" height="18" rx="4" fill="#6C63FF"/>
    <rect x="151" y="99" width="5" height="5" rx="1" fill="#00E5FF"/>
    <rect x="159" y="99" width="5" height="5" rx="1" fill="#00E5FF"/>
    <rect x="152" y="107" width="10" height="3" rx="1.5" fill="#fff" opacity="0.5"/>
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
    <rect x="94" y="91" width="10" height="2.5" rx="1.5" fill="#fff" opacity="0.7"/>
    <rect x="96" y="73" width="6" height="8" rx="2" fill="#00C853"/>
    <circle cx="99" cy="72" r="2.5" fill="#FFEB3B"/>
    <rect x="87" y="94" width="6" height="4" rx="2" fill="#00C853"/>
    <rect x="107" y="94" width="6" height="4" rx="2" fill="#00C853"/>
  </svg>
);

const Stars = () => {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random()*100, y: Math.random()*100,
    size: Math.random()*2.5+0.5, delay: Math.random()*3, duration: Math.random()*2+2,
  }));
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {stars.map(s => (
        <div key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", opacity:0.4, animation:`twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const { getProfile } = useProfile();

  // ── Per-user storage key ───────────────────────────────────────
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
        html, body, #root { height:100%; width:100%; overflow:hidden; background:#07090f; }
        @keyframes twinkle  { from{opacity:0.2;transform:scale(1)} to{opacity:0.8;transform:scale(1.4)} }
        @keyframes floatUp  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes titlePop { 0%{opacity:0;transform:scale(0.8) translateY(-20px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes orb1     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes orb2     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,30px)} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn    { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        .mode-card { cursor:pointer; border-radius:28px; padding:32px 28px 28px; display:flex; flex-direction:column; align-items:center; gap:18px; position:relative; overflow:hidden; transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),box-shadow 0.3s ease; animation:floatUp 0.7s ease both; }
        .mode-card:hover { transform:translateY(-10px) scale(1.03) !important; }
        .mode-card .card-img { transition:transform 0.4s ease; }
        .mode-card:hover .card-img { transform:scale(1.06) translateY(-4px); }
        .card-program { background:linear-gradient(145deg,#1a1040 0%,#0f0a2e 100%); border:2px solid rgba(108,99,255,0.4); box-shadow:0 8px 40px rgba(108,99,255,0.2); animation-delay:0.2s; }
        .card-program:hover { box-shadow:0 20px 60px rgba(108,99,255,0.45) !important; border-color:rgba(108,99,255,0.8) !important; }
        .card-draw { background:linear-gradient(145deg,#0a2016 0%,#051209 100%); border:2px solid rgba(0,200,83,0.4); box-shadow:0 8px 40px rgba(0,200,83,0.15); animation-delay:0.4s; }
        .card-draw:hover { box-shadow:0 20px 60px rgba(0,200,83,0.4) !important; border-color:rgba(0,200,83,0.8) !important; }
        .btn-program { background:linear-gradient(135deg,#6C63FF,#9C63FF); box-shadow:0 4px 20px rgba(108,99,255,0.5); }
        .btn-draw    { background:linear-gradient(135deg,#00C853,#00897B); box-shadow:0 4px 20px rgba(0,200,83,0.4); }
        .project-item:hover { background:rgba(255,255,255,0.08) !important; }
      `}</style>

      <div style={{ height:"100vh", width:"100vw", background:"radial-gradient(ellipse at 20% 50%,#0e0a2a 0%,#07090f 60%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Tajawal',sans-serif", color:"#fff", position:"relative", overflow:"hidden", padding:"20px 16px" }}>

        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"10%", left:"5%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(108,99,255,0.12) 0%,transparent 70%)", animation:"orb1 8s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", bottom:"15%", right:"8%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,200,83,0.1) 0%,transparent 70%)", animation:"orb2 10s ease-in-out infinite" }}/>
        </div>
        <Stars />

        <div style={{ position:"absolute", top:16, right:16, zIndex:20 }}>
          <AccountMenu navigate={navigate} />
        </div>

        <button onClick={() => setShowSidebar(true)} title="مشاريعي" style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", width:48, height:48, borderRadius:14, background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.35)", color:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, zIndex:10, boxShadow:"0 4px 16px rgba(108,99,255,0.2)", transition:"background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(108,99,255,0.3)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(108,99,255,0.15)"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/></svg>
          <span style={{ fontSize:9, fontWeight:800 }}>{projects.length}</span>
        </button>

        {showSidebar && (
          <>
            <div onClick={() => setShowSidebar(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:20 }} />
            <div style={{ position:"fixed", left:0, top:0, bottom:0, width:300, background:"#0d1117", borderRight:"1px solid rgba(255,255,255,0.08)", zIndex:30, display:"flex", flexDirection:"column", animation:"slideIn 0.3s ease both", boxShadow:"4px 0 30px rgba(0,0,0,0.5)" }}>
              <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#fff" }}>مشاريعي 📁</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:600, marginTop:2 }}>{projects.length} مشروع</div>
                </div>
                <button onClick={() => setShowSidebar(false)} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:10, width:34, height:34, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
                {projects.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(255,255,255,0.25)", fontSize:14, fontWeight:600 }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📭</div>لا توجد مشاريع بعد
                  </div>
                ) : projects.map(project => (
                  <div key={project.id} className="project-item" onClick={() => handleOpenProject(project)} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${project.type==="program"?"rgba(108,99,255,0.25)":"rgba(0,200,83,0.25)"}`, borderRadius:12, padding:"12px 14px", marginBottom:8, cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}>
                    <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:project.type==="program"?"rgba(108,99,255,0.2)":"rgba(0,200,83,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                      {project.type==="program"?"⚙️":"✏️"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{project.name}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:600 }}>{project.type==="program"?"برمجة":"رسم"} • {project.createdAt}</div>
                    </div>
                    <button onClick={(e)=>handleDeleteProject(project.id,e)} style={{ background:"rgba(255,107,107,0.12)", border:"none", color:"#FF6B6B", borderRadius:8, width:28, height:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🗑</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {showPrompt && (
          <>
            <div onClick={() => setShowPrompt(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:40 }} />
            <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"90%", maxWidth:420, background:"#161b22", border:`1.5px solid ${projectType==="program"?"rgba(108,99,255,0.4)":"rgba(0,200,83,0.4)"}`, borderRadius:24, padding:"32px 28px", zIndex:50, animation:"popIn 0.25s cubic-bezier(.34,1.56,.64,1) both", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" }}>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ fontSize:40, marginBottom:10 }}>{projectType==="program"?"⚙️":"✏️"}</div>
                <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:20, fontWeight:900, color:"#fff", marginBottom:6 }}>مشروع جديد</h2>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600 }}>{projectType==="program"?"مشروع برمجة":"مشروع رسم واتبع"}</p>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.5)", fontFamily:"'Tajawal',sans-serif", display:"block", marginBottom:8 }}>اسم المشروع</label>
                <input autoFocus type="text" value={projectName} onChange={e=>{setProjectName(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleCreate()} placeholder="مثال: مشروع الروبوت الذكي 🤖" style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${error?"rgba(255,107,107,0.6)":"rgba(255,255,255,0.1)"}`, borderRadius:12, color:"#fff", fontSize:14, fontFamily:"'Tajawal',sans-serif", outline:"none", direction:"rtl" }} />
                {error && <div style={{ color:"#FF6B6B", fontSize:12, fontWeight:700, marginTop:6 }}>⚠️ {error}</div>}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setShowPrompt(false)} style={{ flex:1, padding:"11px 0", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif" }}>إلغاء</button>
                <button onClick={handleCreate} style={{ flex:2, padding:"11px 0", background:projectType==="program"?"linear-gradient(135deg,#6C63FF,#9C63FF)":"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif" }}>إنشاء المشروع ✨</button>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign:"center", marginBottom:48, animation:"titlePop 0.6s cubic-bezier(.34,1.56,.64,1) both", zIndex:1 }}>
          <div style={{ fontSize:14, letterSpacing:4, color:"rgba(255,255,255,0.4)", fontWeight:700, marginBottom:12, textTransform:"uppercase" }}>🤖 مرحباً بك</div>
          <h1 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:"clamp(28px,5vw,52px)", fontWeight:900, lineHeight:1.2, background:"linear-gradient(135deg,#fff 0%,#a78bfa 40%,#00E5FF 80%,#fff 100%)", backgroundSize:"200% auto", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 4s linear infinite" }}>
            لنبرمج معاً! 🚀
          </h1>
          <p style={{ marginTop:12, color:"rgba(255,255,255,0.45)", fontSize:16, fontWeight:600 }}>اختر نشاطك المفضل</p>
        </div>

        <div style={{ display:"flex", gap:28, flexWrap:"wrap", justifyContent:"center", alignItems:"stretch", zIndex:1, width:"100%", maxWidth:760 }}>
          <div className="mode-card card-program" onClick={()=>openPrompt("program")} style={{ flex:"1 1 300px", maxWidth:340 }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:150, height:150, borderRadius:"50%", background:"radial-gradient(circle,rgba(108,99,255,0.25) 0%,transparent 70%)", pointerEvents:"none" }}/>
            <div className="card-img" style={{ width:"100%", height:160 }}><ProgramIllustration /></div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>⚙️</div>
              <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:22, fontWeight:800, color:"#fff", marginBottom:8 }}>البرمجة</h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.6, fontWeight:600 }}>استخدم الكتل البرمجية للتحكم في الروبوت وتعليمه ما تريد!</p>
            </div>
            <button className="btn-program" style={{ width:"100%", padding:"13px 0", border:"none", color:"#fff", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", transition:"transform 0.15s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>ابدأ البرمجة ←</button>
          </div>
          <div className="mode-card card-draw" onClick={()=>openPrompt("draw")} style={{ flex:"1 1 300px", maxWidth:340 }}>
            <div style={{ position:"absolute", top:-40, left:-40, width:150, height:150, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,200,83,0.2) 0%,transparent 70%)", pointerEvents:"none" }}/>
            <div className="card-img" style={{ width:"100%", height:160 }}><DrawIllustration /></div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>✏️</div>
              <h2 style={{ fontFamily:"'Tajawal',sans-serif", fontSize:22, fontWeight:800, color:"#fff", marginBottom:8 }}>ارسم واتبع</h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.6, fontWeight:600 }}>ارسم مساراً بيدك وشاهد الروبوت يتبعه بدقة!</p>
            </div>
            <button className="btn-draw" style={{ width:"100%", padding:"13px 0", border:"none", color:"#fff", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", transition:"transform 0.15s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>ابدأ الرسم ←</button>
          </div>
        </div>
      </div>
    </>
  );
}
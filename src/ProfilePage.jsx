import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile, Avatar } from "./useProfile";

const AVATARS = [
  { emoji: "🤖", bg: "#6C63FF" }, { emoji: "🦁", bg: "#f4b400" },
  { emoji: "🐼", bg: "#444" },   { emoji: "🦊", bg: "#ff8c42" },
  { emoji: "🐸", bg: "#00C853" }, { emoji: "🐯", bg: "#ff6b35" },
  { emoji: "🦋", bg: "#9c27b0" }, { emoji: "🐬", bg: "#03a9f4" },
  { emoji: "🦄", bg: "#e91e63" }, { emoji: "🐉", bg: "#00897B" },
  { emoji: "🦅", bg: "#5C81A6" }, { emoji: "🐺", bg: "#546e7a" },
  { emoji: "🌟", bg: "#f9a825" }, { emoji: "🔥", bg: "#e53935" },
  { emoji: "⚡", bg: "#fdd835" }, { emoji: "🌈", bg: "#00BCD4" },
  { emoji: "🎮", bg: "#7B1FA2" }, { emoji: "🚀", bg: "#1565C0" },
  { emoji: "💎", bg: "#00ACC1" }, { emoji: "🎯", bg: "#D84315" },
];

const ArrowBackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const { getProfile, setProfile } = useProfile();
  const [profile, setLocal] = useState(getProfile());
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [showPicker, setShowPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ── Per-user projects ──────────────────────────────────────────
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const projectsKey = `projects_${currentUser?.username || "guest"}`;
  const allProjects = JSON.parse(localStorage.getItem(projectsKey) || "[]");

  const handleSave = () => {
    if (!editName.trim() || !editUsername.trim()) { setError("يرجى ملء جميع الحقول"); return; }
    const updated = { ...profile, name: editName.trim(), username: editUsername.trim() };
    setProfile(updated);
    setLocal(updated);
    setEditing(false);
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePickAvatar = (av) => {
    const updated = { ...profile, avatar: av.emoji, avatarBg: av.bg };
    setProfile(updated);
    setLocal(updated);
    setShowPicker(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; background:#07090f; }
        input::placeholder { color:rgba(255,255,255,0.2); }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn    { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes savedPop { 0%{opacity:0;transform:translateY(10px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0} }
        .avatar-option { transition: transform 0.15s, box-shadow 0.15s; cursor:pointer; }
        .avatar-option:hover { transform: scale(1.12); }
      `}</style>

      <div style={{ minHeight:"100vh", background:"radial-gradient(ellipse at 30% 20%,#0e0a2a 0%,#07090f 60%)", fontFamily:"'Tajawal',sans-serif", color:"#fff", direction:"rtl" }}>

        {/* App bar */}
        <div style={{ height:60, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 20px", gap:12, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,0.5)" }}>
          <button onClick={() => navigate(-1)} style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#fff", borderRadius:12, width:40, height:40, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}
          ><ArrowBackIcon /></button>
          <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, background:"linear-gradient(90deg,#6C63FF,#00E5FF)", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            الملف الشخصي
          </span>
        </div>

        {/* Content */}
        <div style={{ maxWidth:480, margin:"0 auto", padding:"32px 20px", animation:"fadeUp 0.5s ease both" }}>
          <div style={{ background:"rgba(22,27,34,0.85)", border:"1.5px solid rgba(255,255,255,0.08)", borderRadius:24, padding:"36px 28px", marginBottom:20, textAlign:"center", backdropFilter:"blur(16px)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>

            {/* Avatar */}
            <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
              <div style={{ width:96, height:96, borderRadius:"50%", background:profile.avatarBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, border:"3px solid rgba(255,255,255,0.15)", boxShadow:`0 8px 32px ${profile.avatarBg}66` }}>
                {profile.avatar}
              </div>
              <button onClick={() => setShowPicker(true)} style={{ position:"absolute", bottom:0, right:0, width:30, height:30, borderRadius:"50%", background:"#6C63FF", border:"2px solid #07090f", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✏️</button>
            </div>

            <div style={{ fontFamily:"'Tajawal',sans-serif", fontSize:22, fontWeight:900, color:"#fff", marginBottom:4 }}>{profile.name}</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.4)", fontWeight:600, marginBottom:24 }}>@{profile.username}</div>

            {/* Stats — per user */}
            <div style={{ display:"flex", justifyContent:"center", gap:32, marginBottom:24 }}>
              {[
                { label:"المشاريع", value: allProjects.length },
                { label:"البرمجة",  value: allProjects.filter(p => p.type === "program").length },
                { label:"الرسم",    value: allProjects.filter(p => p.type === "draw").length },
              ].map((s, i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#fff", fontFamily:"'Fredoka One',cursive" }}>{s.value}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Edit */}
            {!editing ? (
              <button onClick={() => { setEditing(true); setEditName(profile.name); setEditUsername(profile.username); }}
                style={{ padding:"10px 28px", background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.4)", color:"#a78bfa", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(108,99,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(108,99,255,0.15)"}
              >✏️ تعديل الملف الشخصي</button>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12, textAlign:"right" }}>
                <div>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:700, display:"block", marginBottom:6 }}>الاسم الكامل</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(108,99,255,0.4)", borderRadius:12, color:"#fff", fontSize:14, fontFamily:"'Tajawal',sans-serif", outline:"none", direction:"rtl" }} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:700, display:"block", marginBottom:6 }}>اسم المستخدم</label>
                  <input value={editUsername} onChange={e => setEditUsername(e.target.value)} style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(108,99,255,0.4)", borderRadius:12, color:"#fff", fontSize:14, fontFamily:"'Tajawal',sans-serif", outline:"none", direction:"rtl" }} />
                </div>
                {error && <div style={{ color:"#FF6B6B", fontSize:12, fontWeight:700 }}>⚠️ {error}</div>}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setEditing(false); setError(""); }} style={{ flex:1, padding:"10px 0", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif" }}>إلغاء</button>
                  <button onClick={handleSave} style={{ flex:2, padding:"10px 0", background:"linear-gradient(135deg,#6C63FF,#9C63FF)", border:"none", color:"#fff", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", boxShadow:"0 4px 16px rgba(108,99,255,0.4)" }}>حفظ التغييرات ✓</button>
                </div>
              </div>
            )}
          </div>

          {/* Saved toast */}
          {saved && (
            <div style={{ position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", background:"#00C853", color:"#fff", padding:"12px 28px", borderRadius:14, fontSize:14, fontWeight:800, fontFamily:"'Tajawal',sans-serif", boxShadow:"0 8px 24px rgba(0,200,83,0.4)", animation:"savedPop 2.5s ease forwards", zIndex:200, whiteSpace:"nowrap" }}>
              ✅ تم الحفظ بنجاح!
            </div>
          )}
        </div>

        {/* Avatar Picker Modal */}
        {showPicker && (
          <>
            <div onClick={() => setShowPicker(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200 }} />
            <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"90%", maxWidth:420, background:"#161b22", border:"1.5px solid rgba(108,99,255,0.3)", borderRadius:24, padding:"28px 24px", zIndex:210, animation:"popIn 0.22s cubic-bezier(.34,1.56,.64,1) both", boxShadow:"0 24px 60px rgba(0,0,0,0.7)" }}>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#fff", marginBottom:4 }}>اختر صورة الملف</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)", fontWeight:600 }}>انقر على الأيقونة التي تعجبك</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
                {AVATARS.map((av, i) => (
                  <div key={i} className="avatar-option" onClick={() => handlePickAvatar(av)}
                    style={{ width:"100%", aspectRatio:"1", borderRadius:16, background:av.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, border:profile.avatar===av.emoji?"3px solid #fff":"3px solid transparent", boxShadow:profile.avatar===av.emoji?`0 0 16px ${av.bg}`:"none" }}>
                    {av.emoji}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowPicker(false)} style={{ marginTop:20, width:"100%", padding:"11px 0", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif" }}>
                إلغاء
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
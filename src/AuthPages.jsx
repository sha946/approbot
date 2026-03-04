import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Robot Logo ─────────────────────────────────────────────────
const RobotLogo = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
    <rect x="16" y="20" width="32" height="28" rx="6" fill="#6C63FF" stroke="#fff" strokeWidth="2"/>
    <rect x="22" y="26" width="8" height="8" rx="2" fill="#00E5FF"/>
    <rect x="34" y="26" width="8" height="8" rx="2" fill="#00E5FF"/>
    <rect x="24" y="38" width="16" height="4" rx="2" fill="#fff" opacity="0.6"/>
    <rect x="28" y="10" width="8" height="10" rx="3" fill="#6C63FF" stroke="#fff" strokeWidth="2"/>
    <circle cx="32" cy="9" r="3" fill="#FF6B6B"/>
    <rect x="4" y="28" width="10" height="6" rx="3" fill="#6C63FF" stroke="#fff" strokeWidth="2"/>
    <rect x="50" y="28" width="10" height="6" rx="3" fill="#6C63FF" stroke="#fff" strokeWidth="2"/>
    <rect x="22" y="48" width="8" height="8" rx="3" fill="#6C63FF" stroke="#fff" strokeWidth="2"/>
    <rect x="34" y="48" width="8" height="8" rx="3" fill="#6C63FF" stroke="#fff" strokeWidth="2"/>
  </svg>
);

// ── Shared Input ───────────────────────────────────────────────
const Input = ({ label, type = "text", value, onChange, placeholder, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: "'Tajawal',sans-serif" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%", padding: icon ? "12px 42px 12px 14px" : "12px 14px",
          background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: 12, color: "#fff", fontSize: 14,
          fontFamily: "'Tajawal',sans-serif", outline: "none",
          transition: "border-color 0.2s, background 0.2s",
          direction: "rtl",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(108,99,255,0.7)"; e.target.style.background = "rgba(108,99,255,0.08)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
      />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════
// CREATE ACCOUNT PAGE
// ══════════════════════════════════════════════════════════════
export function CreateAccountPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
  if (!form.name || !form.username || !form.password || !form.confirm) {
    setError("يرجى ملء جميع الحقول"); return;
  }
  if (form.password !== form.confirm) {
    setError("كلمة المرور غير متطابقة"); return;
  }
  if (form.password.length < 6) {
    setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return;
  }
  try {
    const res = await fetch('https://my-backend-production-64d0.up.railway.app/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, username: form.username, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/home');
  } catch {
    setError("تعذّر الاتصال بالخادم");
  }
};

  return (
    <Page>
      <Card>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <RobotLogo />
          </div>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
            إنشاء حساب جديد
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'Tajawal',sans-serif", fontWeight: 600 }}>
            انضم إلينا وابدأ رحلتك مع الروبوت!
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="الاسم الكامل" value={form.name}     onChange={set("name")}     placeholder="مثال: محمد أحمد"   icon="👤"/>
          <Input label="اسم المستخدم" value={form.username}  onChange={set("username")}  placeholder="مثال: robot_kid"   icon="🎮"/>
          <Input label="كلمة المرور"  value={form.password}  onChange={set("password")}  placeholder="6 أحرف على الأقل" icon="🔒" type="password"/>
          <Input label="تأكيد كلمة المرور" value={form.confirm} onChange={set("confirm")} placeholder="أعد كتابة كلمة المرور" icon="🔑" type="password"/>

          {error && (
            <div style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, padding: "10px 14px", color: "#FF6B6B", fontSize: 13, fontFamily: "'Tajawal',sans-serif", fontWeight: 700, textAlign: "center" }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleSubmit} style={{
            marginTop: 4, width: "100%", padding: "13px 0",
            background: "linear-gradient(135deg,#6C63FF,#9C63FF)",
            border: "none", color: "#fff", borderRadius: 13,
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Tajawal',sans-serif",
            boxShadow: "0 4px 20px rgba(108,99,255,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(108,99,255,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,99,255,0.4)"; }}
          >
            إنشاء الحساب 🚀
          </button>
        </div>

        {/* Footer link */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'Tajawal',sans-serif", fontWeight: 600 }}>
            لديك حساب بالفعل؟{" "}
          </span>
          <button onClick={() => navigate("/login")} style={{
            background: "none", border: "none", color: "#6C63FF",
            fontSize: 14, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Tajawal',sans-serif", textDecoration: "underline",
          }}>
            سجّل الدخول
          </button>
        </div>
      </Card>
    </Page>
  );
}

// ══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════════════════════
export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
  if (!form.username || !form.password) {
    setError("يرجى ملء جميع الحقول"); return;
  }
  try {
    const res = await fetch('https://my-backend-production-64d0.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/home');
  } catch {
    setError("تعذّر الاتصال بالخادم");
  }
};

  return (
    <Page>
      <Card>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <RobotLogo />
          </div>
          <h1 style={{ fontFamily: "'Tajawal',sans-serif", fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
            مرحباً بعودتك! 👋
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'Tajawal',sans-serif", fontWeight: 600 }}>
            سجّل دخولك وتابع مغامرتك
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="اسم المستخدم" value={form.username} onChange={set("username")} placeholder="أدخل اسم المستخدم" icon="🎮"/>
          <Input label="كلمة المرور"  value={form.password} onChange={set("password")} placeholder="أدخل كلمة المرور"  icon="🔒" type="password"/>

          {error && (
            <div style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, padding: "10px 14px", color: "#FF6B6B", fontSize: 13, fontFamily: "'Tajawal',sans-serif", fontWeight: 700, textAlign: "center" }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleSubmit} style={{
            marginTop: 4, width: "100%", padding: "13px 0",
            background: "linear-gradient(135deg,#6C63FF,#9C63FF)",
            border: "none", color: "#fff", borderRadius: 13,
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Tajawal',sans-serif",
            boxShadow: "0 4px 20px rgba(108,99,255,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(108,99,255,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = "0 4px 20px rgba(108,99,255,0.4)"; }}
          >
            تسجيل الدخول ✨
          </button>
        </div>

        {/* Footer link */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'Tajawal',sans-serif", fontWeight: 600 }}>
            ليس لديك حساب؟{" "}
          </span>
          <button onClick={() => navigate("/register")} style={{
            background: "none", border: "none", color: "#6C63FF",
            fontSize: 14, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Tajawal',sans-serif", textDecoration: "underline",
          }}>
            أنشئ حساباً
          </button>
        </div>
      </Card>
    </Page>
  );
}

// ── Shared layout wrappers ─────────────────────────────────────
function Page({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; background: #07090f; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{
        minHeight: "100vh", width: "100%",
        background: "radial-gradient(ellipse at 30% 40%, #0e0a2a 0%, #07090f 65%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, direction: "rtl",
      }}>
        {children}
      </div>
    </>
  );
}

function Card({ children }) {
  return (
    <div style={{
      width: "100%", maxWidth: 420,
      background: "rgba(22,27,34,0.85)",
      backdropFilter: "blur(16px)",
      border: "1.5px solid rgba(255,255,255,0.08)",
      borderRadius: 24, padding: "36px 32px",
      boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      animation: "fadeUp 0.5s cubic-bezier(.4,1.2,.6,1) both",
    }}>
      {children}
    </div>
  );
}
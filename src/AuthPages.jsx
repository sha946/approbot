import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const Input = ({ label, type = "text", value, onChange, placeholder, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: "100%", padding: icon ? "11px 42px 11px 14px" : "11px 14px",
          background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: 12, color: "#fff", fontSize: 14,
          fontFamily: "'Tajawal',sans-serif", outline: "none",
          transition: "border-color 0.2s, background 0.2s", direction: "rtl", boxSizing: "border-box",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(108,99,255,0.7)"; e.target.style.background = "rgba(108,99,255,0.08)"; }}
        onBlur={e =>  { e.target.style.borderColor = "rgba(255,255,255,0.1)";  e.target.style.background = "rgba(255,255,255,0.05)"; }}
      />
    </div>
  </div>
);

export function CreateAccountPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.username || !form.password || !form.confirm) { setError("يرجى ملء جميع الحقول"); return; }
    if (form.password !== form.confirm) { setError("كلمة المرور غير متطابقة"); return; }
    if (form.password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    try {
      const res = await fetch('https://my-backend-production-64d0.up.railway.app/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch { setError("تعذّر الاتصال بالخادم"); }
  };

  return (
    <Page>
      {/* Portrait: single column card. Landscape: logo left + form right */}
      <div className="auth-layout">
        <div className="auth-logo-col">
          <RobotLogo />
          <h1 className="auth-title">إنشاء حساب جديد</h1>
          <p className="auth-sub">انضم إلينا وابدأ رحلتك مع الروبوت!</p>
        </div>
        <div className="auth-form-col">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="الاسم الكامل"          value={form.name}     onChange={set("name")}     placeholder="مثال: محمد أحمد"        icon="👤"/>
            <Input label="اسم المستخدم"           value={form.username} onChange={set("username")} placeholder="مثال: robot_kid"        icon=""/>
            <Input label="كلمة المرور"    type="password" value={form.password} onChange={set("password")} placeholder="6 أحرف على الأقل"     icon="🔒"/>
            <Input label="تأكيد كلمة المرور" type="password" value={form.confirm}  onChange={set("confirm")}  placeholder="أعد كتابة كلمة المرور" icon="🔑"/>
            {error && <div className="error-box">⚠️ {error}</div>}
            <button onClick={handleSubmit} className="submit-btn">إنشاء الحساب 🚀</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <span className="link-text">لديك حساب بالفعل؟ </span>
            <button onClick={() => navigate("/login")} className="link-btn">سجّل الدخول</button>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError("يرجى ملء جميع الحقول"); return; }
    try {
      const res = await fetch('https://my-backend-production-64d0.up.railway.app/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch { setError("تعذّر الاتصال بالخادم"); }
  };

  return (
    <Page>
      <div className="auth-layout">
        <div className="auth-logo-col">
          <RobotLogo />
          <h1 className="auth-title">مرحباً بعودتك! </h1>
          <p className="auth-sub">سجّل دخولك وتابع مغامرتك</p>
        </div>
        <div className="auth-form-col">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="اسم المستخدم" value={form.username} onChange={set("username")} placeholder="أدخل اسم المستخدم" icon="🎮"/>
            <Input label="كلمة المرور" type="password" value={form.password} onChange={set("password")} placeholder="أدخل كلمة المرور" icon="🔒"/>
            {error && <div className="error-box">⚠️ {error}</div>}
            <button onClick={handleSubmit} className="submit-btn">تسجيل الدخول </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <span className="link-text">ليس لديك حساب؟ </span>
            <button onClick={() => navigate("/register")} className="link-btn">أنشئ حساباً</button>
          </div>
        </div>
      </div>
    </Page>
  );
}

function Page({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; background: #07090f; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* Scrollable full page */
        .auth-page-wrap {
          min-height: 100vh; width: 100%;
          background: radial-gradient(ellipse at 30% 40%, #0e0a2a 0%, #07090f 65%);
          display: flex; align-items: center; justify-content: center;
          padding: 20px 16px;
          direction: rtl;
          overflow-y: auto;
          overflow-x: hidden;
          /* Custom scrollbar */
          scrollbar-width: thin;
          scrollbar-color: rgba(108,99,255,0.5) rgba(255,255,255,0.05);
        }
        .auth-page-wrap::-webkit-scrollbar { width: 6px; }
        .auth-page-wrap::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 3px; }
        .auth-page-wrap::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.5); border-radius: 3px; }

        /* Card */
        .auth-card {
          width: 100%; max-width: 820px;
          background: rgba(22,27,34,0.88);
          backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: clamp(20px,4vw,36px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
          animation: fadeUp 0.45s cubic-bezier(.4,1.2,.6,1) both;
        }

        /* Portrait: stack vertically */
        .auth-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
        .auth-logo-col {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 8px;
        }
        .auth-form-col { width: 100%; }

        /* Landscape (short screens or wide phones in landscape) */
        @media (orientation: landscape) and (max-height: 520px),
               (min-width: 640px) {
          .auth-layout {
            flex-direction: row;
            align-items: center;
            gap: 32px;
          }
          .auth-logo-col {
            flex: 0 0 200px;
            min-width: 160px;
            border-left: 1px solid rgba(255,255,255,0.07);
            padding-left: 28px;
          }
          .auth-form-col { flex: 1; }
        }

        .auth-title {
          font-family: 'Tajawal',sans-serif;
          font-size: clamp(17px,4vw,22px);
          font-weight: 900; color: #fff;
        }
        .auth-sub {
          color: rgba(255,255,255,0.4);
          font-size: clamp(12px,2.5vw,14px);
          font-family: 'Tajawal',sans-serif; font-weight: 600;
        }
        .error-box {
          background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.3);
          border-radius: 10px; padding: 10px 14px; color: #FF6B6B;
          font-size: 13px; font-family: 'Tajawal',sans-serif; font-weight: 700; text-align: center;
        }
        .submit-btn {
          margin-top: 4px; width: 100%; padding: 13px 0;
          background: linear-gradient(135deg,#6C63FF,#9C63FF);
          border: none; color: #fff; border-radius: 13px;
          font-size: clamp(14px,4vw,16px); font-weight: 800; cursor: pointer;
          font-family: 'Tajawal',sans-serif;
          box-shadow: 0 4px 20px rgba(108,99,255,0.4);
          transition: transform 0.15s; touch-action: manipulation;
        }
        .submit-btn:active { transform: scale(0.98); }
        .link-text { color: rgba(255,255,255,0.4); font-size: 14px; font-family: 'Tajawal',sans-serif; font-weight: 600; }
        .link-btn  { background: none; border: none; color: #6C63FF; font-size: 14px; font-weight: 800; cursor: pointer; font-family: 'Tajawal',sans-serif; text-decoration: underline; touch-action: manipulation; }
      `}</style>
      <div className="auth-page-wrap">
        <div className="auth-card">
          {children}
        </div>
      </div>
    </>
  );
}
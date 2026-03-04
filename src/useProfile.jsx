// ── useProfile hook ────────────────────────────────────────────
export function useProfile() {
  const getProfile = () => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "null") || {
        username: localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")).username
          : "مستخدم",
        name: localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")).name
          : "مستخدم جديد",
        avatar: "🤖",
        avatarBg: "#6C63FF",
      };
    } catch {
      return { username: "مستخدم", name: "مستخدم جديد", avatar: "🤖", avatarBg: "#6C63FF" };
    }
  };

  const setProfile = (data) => {
    localStorage.setItem("profile", JSON.stringify(data));
  };

  return { getProfile, setProfile };
}

// ── Avatar display helper ──────────────────────────────────────
export function Avatar({ size = 36, profile, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: profile?.avatarBg || "#6C63FF",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, flexShrink: 0,
      border: "2px solid rgba(255,255,255,0.2)",
      ...style,
    }}>
      {profile?.avatar || "🤖"}
    </div>
  );
}

// ── AccountMenu component ──────────────────────────────────────
import { useState, useEffect, useRef } from "react";

export function AccountMenu({ navigate }) {
  const { getProfile } = useProfile();
  const [open, setOpen]       = useState(false);
  const [profile, setProfile] = useState(getProfile());
  const menuRef               = useRef(null);

  useEffect(() => { if (open) setProfile(getProfile()); }, [open]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: open ? "rgba(108,99,255,0.3)" : "rgba(108,99,255,0.15)",
          border: "1.5px solid rgba(108,99,255,0.4)",
          borderRadius: 12, width: 40, height: 40,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
          padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(108,99,255,0.3)"}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "rgba(108,99,255,0.15)"; }}
      >
        <Avatar size={30} profile={profile} style={{ border: "none" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 48, right: 0,
          width: 220, background: "#161b22",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          zIndex: 999,
          animation: "menuPop 0.18s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          <style>{`@keyframes menuPop{from{opacity:0;transform:scale(0.9) translateY(-8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar size={40} profile={profile} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Tajawal',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, fontFamily: "'Tajawal',sans-serif" }}>
                @{profile.username}
              </div>
            </div>
          </div>

          {[
            { icon: "👤", label: "عرض الملف الشخصي", action: () => { setOpen(false); navigate("/profile"); } },
            { icon: "🔄", label: "تبديل الحساب",       action: handleSwitchAccount },
            { icon: "🚪", label: "تسجيل الخروج",       action: handleLogout, danger: true },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              style={{
                width: "100%", padding: "11px 16px",
                background: "transparent",
                border: "none", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                color: item.danger ? "#FF6B6B" : "#fff",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", fontFamily: "'Tajawal',sans-serif",
                fontSize: 14, fontWeight: 700, textAlign: "right",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = item.danger ? "rgba(255,107,107,0.1)" : "rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
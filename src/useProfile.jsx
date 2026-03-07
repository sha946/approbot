import { useState, useEffect, useRef } from "react";

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

// ── Saved accounts helpers ─────────────────────────────────────
function getSavedAccounts() {
  try {
    return JSON.parse(localStorage.getItem("saved_accounts") || "[]");
  } catch { return []; }
}

function saveAccount(user, token) {
  const accounts = getSavedAccounts();
  const existing = accounts.findIndex(a => a.username === user.username);
  const entry = {
    username:  user.username  || "مستخدم",
    name:      user.name      || user.username || "مستخدم",
    avatar:    user.avatar    || "🤖",
    avatarBg:  user.avatarBg  || "#6C63FF",
    token,
  };
  if (existing >= 0) accounts[existing] = entry;
  else accounts.unshift(entry);
  localStorage.setItem("saved_accounts", JSON.stringify(accounts));
}

function removeAccount(username) {
  const accounts = getSavedAccounts().filter(a => a.username !== username);
  localStorage.setItem("saved_accounts", JSON.stringify(accounts));
}

function persistCurrentAccount() {
  try {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    if (token && user?.username) saveAccount(user, token);
  } catch {}
}

function SwitchPasswordModal({ acc, onCancel, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const handleConfirm = async () => {
    if (!password) { setError("أدخل كلمة المرور"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://my-backend-production-64d0.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: acc.username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("كلمة المرور غير صحيحة ❌");
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
      onSuccess({ ...acc, token: data.token }, data.user);
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter")  handleConfirm();
    if (e.key === "Escape") onCancel();
  };

  return (
    // FIXED: backdrop — clicking it calls onCancel cleanly
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        direction: "rtl",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* FIXED: single stopPropagation on the card, no ref needed */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: "#161b22", border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: "28px 24px", width: 300, maxWidth: "90vw",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          animation: "modalPop 0.18s ease both",
        }}
      >
        <style>{`
          @keyframes modalPop { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
          .modal-cancel-btn:hover { background: rgba(255,255,255,0.12) !important; }
          .modal-confirm-btn:not(:disabled):hover { opacity: 0.88; }
        `}</style>

        {/* Account info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: acc.avatarBg || "#6C63FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, border: "2px solid rgba(255,255,255,0.15)",
          }}>
            {acc.avatar || "🤖"}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Tajawal',sans-serif" }}>{acc.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Tajawal',sans-serif" }}>@{acc.username}</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'Tajawal',sans-serif", fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
          أدخل كلمة المرور للتبديل إلى هذا الحساب
        </div>

        {/* Password input — FIXED: onChange no longer clears error so red border persists */}
        <div style={{ position: "relative", marginBottom: error ? 8 : 14 }}>
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔒</span>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)} // FIXED: removed setError("") here
            onKeyDown={handleKey}
            placeholder="كلمة المرور"
            style={{
              width: "100%", padding: "11px 38px 11px 14px",
              background: error ? "rgba(255,107,107,0.07)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${error ? "rgba(255,107,107,0.7)" : "rgba(255,255,255,0.12)"}`,
              borderRadius: 12, color: "#fff", fontSize: 14,
              fontFamily: "'Tajawal',sans-serif", outline: "none",
              direction: "rtl", boxSizing: "border-box",
              transition: "border-color 0.2s, background 0.2s",
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: "rgba(255,107,107,0.13)",
            border: "1px solid rgba(255,107,107,0.4)",
            borderRadius: 9, padding: "9px 12px",
            color: "#FF6B6B", fontSize: 13,
            fontFamily: "'Tajawal',sans-serif", fontWeight: 700,
            textAlign: "center", marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="modal-cancel-btn"
            onClick={onCancel} // FIXED: clean direct call, no interference
            style={{
              flex: 1, padding: "10px 0",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)", borderRadius: 11,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Tajawal',sans-serif",
              transition: "background 0.15s",
            }}
          >إلغاء</button>
          <button
            className="modal-confirm-btn"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "10px 0",
              background: loading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg,#6C63FF,#9C63FF)",
              border: "none", color: "#fff", borderRadius: 11,
              fontSize: 13, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Tajawal',sans-serif",
              transition: "opacity 0.15s",
            }}
          >{loading ? "جاري التحقق..." : "دخول"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar component ───────────────────────────────────────────
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
export function AccountMenu({ navigate }) {
  const { getProfile } = useProfile();
  const [open,        setOpen]        = useState(false);
  const [profile,     setProfileSt]   = useState(getProfile());
  const [menuPos,     setMenuPos]     = useState({ top: 0, left: 0 });
  const [showSwitch,  setShowSwitch]  = useState(false);
  const [accounts,    setAccounts]    = useState([]);
  const [switchingAcc, setSwitchingAcc] = useState(null); // account pending password
  const menuRef = useRef(null);
  const btnRef  = useRef(null);

  useEffect(() => { persistCurrentAccount(); }, []);

  useEffect(() => {
    if (open) {
      setProfileSt(getProfile());
      setAccounts(getSavedAccounts());
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const menuWidth = 240;
        const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
        setMenuPos({ top: rect.bottom + 8, left });
      }
    } else {
      setShowSwitch(false);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    navigate("/login");
  };

  // Step 1: user clicks an account → show password modal
  const handleSwitchRequest = (acc) => {
    setSwitchingAcc(acc);
    setOpen(false);
  };

  // Step 2: password verified → switch
  const handleSwitchConfirmed = (acc, freshUser) => {
    localStorage.setItem("token", acc.token);
    localStorage.setItem("user", JSON.stringify(freshUser || { username: acc.username, name: acc.name }));
    localStorage.setItem("profile", JSON.stringify({
      username: acc.username,
      name:     freshUser?.name || acc.name,
      avatar:   acc.avatar,
      avatarBg: acc.avatarBg,
    }));
    persistCurrentAccount();
    setSwitchingAcc(null);
    window.location.reload();
  };

  const handleRemoveAccount = (e, username) => {
    e.stopPropagation();
    removeAccount(username);
    setAccounts(getSavedAccounts());
    if (username === profile.username) handleLogout();
  };

  const currentUsername = profile.username;
  const otherAccounts   = accounts.filter(a => a.username !== currentUsername);

  const menuItems = [
    { icon: "👤", label: "عرض الملف الشخصي", action: () => { setOpen(false); navigate("/profile"); } },
    {
      icon: "🔄", label: "تبديل الحساب",
      action: () => setShowSwitch(v => !v),
      badge: otherAccounts.length > 0 ? otherAccounts.length : null,
      hasSubmenu: true,
      active: showSwitch,
    },
    { icon: "🚪", label: "تسجيل الخروج", action: handleLogout, danger: true },
  ];

  return (
    <>
      {/* Password modal — rendered outside the menu so it's always on top */}
      {switchingAcc && (
        <SwitchPasswordModal
          acc={switchingAcc}
          onCancel={() => setSwitchingAcc(null)}
          onSuccess={handleSwitchConfirmed}
        />
      )}

      <div style={{ position: "relative", zIndex: 9999 }}>
        <button
          ref={btnRef}
          onClick={() => setOpen(v => !v)}
          className="account-menu-trigger"
          style={{
            background: open ? "rgba(108,99,255,0.3)" : "rgba(108,99,255,0.15)",
            border: "1.5px solid rgba(108,99,255,0.4)",
            borderRadius: 12, width: 40, height: 40,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s, transform 0.2s",
            padding: 0,
          }}
        >
          <Avatar size={30} profile={profile} style={{ border: "none" }} />
        </button>

        {open && (
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: 240,
              background: "#161b22",
              border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              zIndex: 9999,
              direction: "rtl",
            }}
          >
            <style>{`
              @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
              .account-menu-trigger:hover { background: rgba(108,99,255,0.3) !important; transform: scale(1.1); }
              .menu-item-btn { transition: background 0.15s, transform 0.15s !important; }
              .menu-item-btn:hover { background: rgba(255,255,255,0.06) !important; transform: translateX(-3px) !important; }
              .menu-item-btn.danger:hover { background: rgba(255,107,107,0.1) !important; }
              .menu-item-btn.active-submenu:hover { background: rgba(108,99,255,0.15) !important; }
              .acc-item { transition: background 0.15s, transform 0.15s !important; cursor: pointer; }
              .acc-item:hover { background: rgba(255,255,255,0.07) !important; transform: translateX(-3px) !important; }
              .acc-remove { transition: opacity 0.15s, transform 0.15s !important; opacity: 0; }
              .acc-item:hover .acc-remove { opacity: 1 !important; }
              .acc-remove:hover { transform: scale(1.2) !important; }
              .add-account-btn { transition: background 0.15s !important; }
              .add-account-btn:hover { background: rgba(108,99,255,0.22) !important; }
            `}</style>

            {/* Current user header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar size={40} profile={profile} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Tajawal',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.name}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, fontFamily: "'Tajawal',sans-serif" }}>
                  @{profile.username}
                </div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00C853", flexShrink: 0, boxShadow: "0 0 6px #00C853" }}/>
            </div>

            {/* Menu items */}
            {menuItems.map((item, i) => (
              <div key={i}>
                <button
                  className={`menu-item-btn${item.danger ? " danger" : ""}${item.active ? " active-submenu" : ""}`}
                  onClick={item.action}
                  style={{
                    width: "100%", padding: "11px 16px",
                    background: item.active ? "rgba(108,99,255,0.1)" : "transparent",
                    border: "none",
                    borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    color: item.danger ? "#FF6B6B" : "#fff",
                    display: "flex", alignItems: "center", gap: 10,
                    cursor: "pointer", fontFamily: "'Tajawal',sans-serif",
                    fontSize: 14, fontWeight: 700, textAlign: "right",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ background: "#6C63FF", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 800, padding: "1px 7px", minWidth: 18, textAlign: "center" }}>
                      {item.badge}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", transition: "transform 0.2s", transform: showSwitch ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
                  )}
                </button>

                {/* Account switcher submenu */}
                {item.hasSubmenu && showSwitch && (
                  <div style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.05)", animation: "slideDown 0.2s ease both" }}>
                    {otherAccounts.length === 0 ? (
                      <div style={{ padding: "14px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📱</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600, fontFamily: "'Tajawal',sans-serif" }}>
                          لا توجد حسابات أخرى محفوظة
                        </div>
                      </div>
                    ) : (
                      <div>
                        {otherAccounts.map((acc, idx) => (
                          <div
                            key={acc.username}
                            className="acc-item"
                            onClick={() => handleSwitchRequest(acc)}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "10px 16px",
                              borderBottom: idx < otherAccounts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            }}
                          >
                            <Avatar size={34} profile={acc} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "'Tajawal',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {acc.name}
                              </div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, fontFamily: "'Tajawal',sans-serif" }}>
                                @{acc.username}
                              </div>
                            </div>
                            <button
                              className="acc-remove"
                              onClick={(e) => handleRemoveAccount(e, acc.username)}
                              style={{ background: "rgba(255,107,107,0.12)", border: "none", color: "#FF6B6B", borderRadius: 6, width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}
                              title="إزالة الحساب"
                            >✕</button>
                          </div>
                        ))}
                        <div style={{ padding: "8px 16px 10px" }}>
                          <button
                            className="add-account-btn"
                            onClick={() => { setOpen(false); localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}
                            style={{ width: "100%", padding: "8px 0", background: "rgba(108,99,255,0.12)", border: "1.5px solid rgba(108,99,255,0.25)", color: "#a78bfa", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Tajawal',sans-serif" }}
                          >
                            + إضافة حساب جديد
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
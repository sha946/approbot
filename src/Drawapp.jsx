import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveDraw, loadDraw } from "./api";

const ArrowBackIcon  = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>);
const TrashIcon      = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>);
const UndoIcon       = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>);
const PlayIcon       = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>);
const BluetoothIcon  = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/></svg>);
const PenIcon        = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>);
const EraserIcon     = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.03 20h7.66l8.72-8.72c.79-.78.79-2.05 0-2.83l-4.85-4.86c-.39-.39-.9-.59-1.42-.59zM6 20l-2-2 5-5 2 2-5 5z"/></svg>);
const SaveIcon       = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>);
const SettingsIcon   = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>);
const RobotFaceIcon  = () => (<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><rect x="12" y="18" width="40" height="32" rx="8" fill="#00C853" stroke="#fff" strokeWidth="2"/><rect x="18" y="24" width="10" height="10" rx="3" fill="#FFEB3B"/><rect x="36" y="24" width="10" height="10" rx="3" fill="#FFEB3B"/><rect x="20" y="38" width="24" height="5" rx="2.5" fill="#fff" opacity="0.8"/><rect x="27" y="8" width="10" height="11" rx="4" fill="#00C853" stroke="#fff" strokeWidth="2"/><circle cx="32" cy="7" r="3.5" fill="#FFEB3B"/><rect x="2" y="26" width="10" height="8" rx="4" fill="#00C853" stroke="#fff" strokeWidth="2"/><rect x="52" y="26" width="10" height="8" rx="4" fill="#00C853" stroke="#fff" strokeWidth="2"/><rect x="20" y="50" width="10" height="9" rx="4" fill="#00C853" stroke="#fff" strokeWidth="2"/><rect x="34" y="50" width="10" height="9" rx="4" fill="#00C853" stroke="#fff" strokeWidth="2"/></svg>);

function simplifyPath(points, tolerance = 8) {
  if (points.length < 3) return points;
  function perpendicularDist(p, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x, dy = lineEnd.y - lineStart.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len === 0) return Math.sqrt((p.x-lineStart.x)**2 + (p.y-lineStart.y)**2);
    return Math.abs(dx*(lineStart.y-p.y) - (lineStart.x-p.x)*dy) / len;
  }
  function rdp(pts, start, end, eps, result) {
    let maxDist = 0, maxIdx = 0;
    for (let i = start+1; i < end; i++) { const d = perpendicularDist(pts[i], pts[start], pts[end]); if (d > maxDist) { maxDist = d; maxIdx = i; } }
    if (maxDist > eps) { rdp(pts, start, maxIdx, eps, result); result.push(pts[maxIdx]); rdp(pts, maxIdx, end, eps, result); }
  }
  const result = [points[0]];
  rdp(points, 0, points.length-1, tolerance, result);
  result.push(points[points.length-1]);
  return result;
}

function pathToCommands(strokes, speedPct = 60) {
  const commands = [];
  const PX_TO_MS = 2.5;
  const SPEED = Math.round((speedPct/100)*255);
  commands.push(`SP:${SPEED};`);
  let prevAngle = null;
  for (const stroke of strokes) {
    const pts = simplifyPath(stroke, 10);
    if (pts.length < 2) continue;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const angle = Math.atan2(dy, dx) * (180/Math.PI);
      if (prevAngle !== null) {
        let delta = angle - prevAngle;
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        const absDelta = Math.abs(delta);
        if (absDelta > 5) { const turnMs = Math.round(absDelta*3); if (delta < 0) commands.push(`L:${turnMs};`); else commands.push(`R:${turnMs};`); }
      }
      const moveMs = Math.round(dist * PX_TO_MS);
      if (moveMs > 10) commands.push(`F:${moveMs};`);
      prevAngle = angle;
    }
    commands.push(`S:0;`);
    prevAngle = null;
  }
  commands.push(`S:0;`);
  return commands;
}

const BLE_SERVICE = "0000ffe0-0000-1000-8000-00805f9b34fb";
const BLE_CHAR    = "0000ffe1-0000-1000-8000-00805f9b34fb";

async function sendChunked(characteristic, fullString) {
  const encoder = new TextEncoder();
  const chunkSize = 20;
  for (let i = 0; i < fullString.length; i += chunkSize) {
    await characteristic.writeValue(encoder.encode(fullString.slice(i, i+chunkSize)));
    await new Promise(r => setTimeout(r, 50));
  }
}

export default function DrawApp() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const projectName = location.state?.projectName || "مشروعي ✏️";
  const projectId   = location.state?.projectId;

  const canvasRef     = useRef(null);
  const ctxRef        = useRef(null);
  const isDrawing     = useRef(false);
  const currentStroke = useRef([]);
  const strokesRef    = useRef([]);

  const [strokes,     setStrokes]    = useState([]);
  const [tool,        setTool]       = useState("pen");
  const [penColor,    setPenColor]   = useState("#00E5FF");
  const [penSize,     setPenSize]    = useState(5);
  const [speed,       setSpeed]      = useState(60);
  const [btDevice,    setBtDevice]   = useState(null);
  const [btChar,      setBtChar]     = useState(null);
  const [btStatus,    setBtStatus]   = useState("disconnected");
  const [sendStatus,  setSendStatus] = useState("");
  const [saveStatus,  setSaveStatus] = useState("");
  const [showPanel,   setShowPanel]  = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // ── Redraw ───────────────────────────────────────────────────────
  const redrawAll = useCallback((strokeList) => {
    const canvas = canvasRef.current, ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let x = 20; x < canvas.width; x += 30)
      for (let y = 20; y < canvas.height; y += 30) { ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill(); }
    for (const stroke of strokeList) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth   = stroke.size;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      ctx.stroke();
    }
  }, []);

  // Keep ref in sync + redraw on state change
  useEffect(() => {
    strokesRef.current = strokes;
    redrawAll(strokes);
  }, [strokes, redrawAll]);

  // Resize — uses ref so it never sees stale strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctxRef.current = ctx;
      redrawAll(strokesRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redrawAll]);

  // Load from backend
  useEffect(() => {
    if (!projectId) { setLoadingData(false); return; }
    loadDraw(projectId)
      .then(data => {
        const saved = data?.drawSave;
        if (saved?.strokes?.length > 0) {
          setStrokes(saved.strokes);
          if (saved.speed) setSpeed(saved.speed);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [projectId]);

  // ── Drawing ──────────────────────────────────────────────────────
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const onPointerDown = (e) => { e.preventDefault(); isDrawing.current = true; currentStroke.current = [getPos(e)]; };
  const onPointerMove = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getPos(e);
    currentStroke.current.push(pos);
    const ctx = ctxRef.current, pts = currentStroke.current;
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = tool === "eraser" ? "#161b22" : penColor;
    ctx.lineWidth   = tool === "eraser" ? 30 : penSize;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.moveTo(pts[pts.length-2].x, pts[pts.length-2].y);
    ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
    ctx.stroke();
  };
  const onPointerUp = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pts = [...currentStroke.current];
    currentStroke.current = [];
    if (pts.length < 2) return;
    const newStroke = tool === "eraser"
      ? { points: pts, color: "#161b22", size: 30, isEraser: true }
      : { points: pts, color: penColor, size: penSize };
    const updated = [...strokesRef.current, newStroke];
    strokesRef.current = updated;
    setStrokes(updated);
    redrawAll(updated);
  };

  // ── Actions ──────────────────────────────────────────────────────
  const handleUndo  = () => setStrokes(prev => prev.slice(0, -1));
  const handleClear = () => setStrokes([]);

  const handleSave = async () => {
    if (!projectId) return;
    try {
      await saveDraw(projectId, { strokes, speed });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus(""), 2500);
    }
  };

  // ── Bluetooth ────────────────────────────────────────────────────
  const handleConnect = async () => {
    try {
      setBtStatus("connecting");
      const device = await navigator.bluetooth.requestDevice({ filters: [{ services: [BLE_SERVICE] }], optionalServices: [BLE_SERVICE] });
      device.addEventListener("gattserverdisconnected", () => { setBtStatus("disconnected"); setBtChar(null); setBtDevice(null); });
      const server  = await device.gatt.connect();
      const service = await server.getPrimaryService(BLE_SERVICE);
      const char    = await service.getCharacteristic(BLE_CHAR);
      setBtDevice(device); setBtChar(char); setBtStatus("connected");
    } catch { setBtStatus("disconnected"); }
  };
  const handleDisconnect = () => { btDevice?.gatt?.disconnect(); setBtStatus("disconnected"); setBtChar(null); setBtDevice(null); };

  const handleSend = async () => {
    if (!btChar) { alert("وصّل الروبوت أولاً عبر البلوتوث!"); return; }
    const penStrokes = strokes.filter(s => !s.isEraser).map(s => s.points);
    if (penStrokes.length === 0) { alert("ارسم مساراً أولاً!"); return; }
    const cmds = pathToCommands(penStrokes, speed);
    try {
      setSendStatus("sending");
      await sendChunked(btChar, cmds.join(""));
      setSendStatus("done");
      setTimeout(() => setSendStatus(""), 3000);
    } catch { setSendStatus("error"); setTimeout(() => setSendStatus(""), 3000); }
  };

  const btColor = btStatus === "connected" ? "#00C853" : btStatus === "connecting" ? "#f4b400" : "#aaa";
  const COLORS  = ["#00E5FF","#FFEB3B","#FF6B6B","#00C853","#FF9800","#CE93D8","#ffffff"];
  const penStrokes = strokes.filter(s => !s.isEraser);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; width:100%; overflow:hidden; background:#0d1117; }

        .tool-btn { background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.1); color:#fff; border-radius:12px; width:44px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.18s; font-size:18px; flex-shrink:0; touch-action:manipulation; }
        .tool-btn:hover  { background:rgba(255,255,255,0.14); }
        .tool-btn.active { background:rgba(0,229,255,0.18); border-color:#00E5FF; box-shadow:0 0 12px rgba(0,229,255,0.3); }
        .color-dot { width:26px; height:26px; border-radius:50%; cursor:pointer; border:2.5px solid transparent; transition:all 0.18s; flex-shrink:0; touch-action:manipulation; }
        .color-dot:hover    { transform:scale(1.2); }
        .color-dot.selected { border-color:#fff; box-shadow:0 0 0 2px rgba(255,255,255,0.4); }
        .send-btn { background:linear-gradient(135deg,#00C853,#00897B); border:none; color:#fff; border-radius:14px; font-size:15px; font-weight:800; cursor:pointer; font-family:'Tajawal',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 20px rgba(0,200,83,0.35); transition:all 0.2s; touch-action:manipulation; }
        .send-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .action-btn { width:100%; border-radius:13px; padding:13px 0; font-size:15px; font-weight:800; cursor:pointer; font-family:'Tajawal',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; touch-action:manipulation; border:none; }
        canvas { touch-action:none; cursor:crosshair; display:block; }

        @keyframes float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulse-green { 0%,100%{box-shadow:0 0 0 0 rgba(0,200,83,0.5)} 50%{box-shadow:0 0 0 8px rgba(0,200,83,0)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes popIn       { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
        @keyframes slideUp     { from{transform:translateY(100%)} to{transform:translateY(0)} }

        .left-toolbar { display:flex; }
        .right-panel  { display:flex; }
        .bottom-bar   { display:none; }

        @media (max-width:700px) {
          .left-toolbar { display:none !important; }
          .right-panel  { display:none !important; }
          .bottom-bar   { display:flex !important; }
        }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100vw", background:"#0d1117", color:"#fff", fontFamily:"'Tajawal',sans-serif", overflow:"hidden" }}>

        {/* ── APP BAR ── */}
        <div style={{ height:56, flexShrink:0, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 12px", gap:10, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,0.5)" }}>
          <button onClick={() => navigate("/home")} className="tool-btn" style={{ width:40, height:40 }}><ArrowBackIcon /></button>
          <div style={{ flex:1, textAlign:"center" }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(15px,4vw,20px)", background:"linear-gradient(90deg,#00C853,#00E5FF,#FFEB3B)", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {projectName}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.05)", border:`1px solid ${btColor}40`, borderRadius:20, padding:"5px 10px" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:btColor, animation:btStatus==="connected"?"pulse-green 2s infinite":"none", flexShrink:0 }}/>
            <span style={{ fontSize:11, fontWeight:700, color:btColor, whiteSpace:"nowrap" }}>
              {btStatus==="connected" ? "متصل" : btStatus==="connecting" ? "..." : "غير متصل"}
            </span>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>

          {/* LEFT TOOLBAR — desktop */}
          <div className="left-toolbar" style={{ width:68, flexShrink:0, flexDirection:"column", alignItems:"center", padding:"12px 0", gap:10, borderRight:"1px solid rgba(255,255,255,0.06)", background:"rgba(22,27,34,0.85)", zIndex:10, overflowY:"auto" }}>
            <button className={`tool-btn ${tool==="pen"?"active":""}`} onClick={() => setTool("pen")}><PenIcon /></button>
            <button className={`tool-btn ${tool==="eraser"?"active":""}`} onClick={() => setTool("eraser")}><EraserIcon /></button>
            <div style={{ width:36, height:1, background:"rgba(255,255,255,0.1)", margin:"2px 0" }}/>
            {COLORS.map(c => (
              <div key={c} className={`color-dot ${penColor===c?"selected":""}`} style={{ background:c }} onClick={() => { setPenColor(c); setTool("pen"); }} />
            ))}
            <div style={{ width:36, height:1, background:"rgba(255,255,255,0.1)", margin:"2px 0" }}/>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:penSize*2+6, height:penSize*2+6, borderRadius:"50%", background:penColor, minWidth:8, minHeight:8, maxWidth:34, maxHeight:34 }}/>
              <input type="range" min={2} max={20} value={penSize} onChange={e => setPenSize(+e.target.value)}
                style={{ writingMode:"vertical-lr", direction:"rtl", height:70, accentColor:penColor, cursor:"pointer" }} />
            </div>
            <div style={{ flex:1 }}/>
            <button className="tool-btn" onClick={handleUndo}><UndoIcon /></button>
            <button className="tool-btn" onClick={handleClear} style={{ marginBottom:8 }}><TrashIcon /></button>
          </div>

          {/* CANVAS */}
          <div style={{ flex:1, position:"relative", minWidth:0, minHeight:0, background:"#161b22", overflow:"hidden" }}>
            {loadingData && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(22,27,34,0.85)", zIndex:10 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                  <div style={{ width:32, height:32, border:"3px solid rgba(0,200,83,0.3)", borderTopColor:"#00C853", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                  <span style={{ color:"#aaa", fontSize:13, fontWeight:700 }}>جاري تحميل المشروع...</span>
                </div>
              </div>
            )}
            {strokes.length === 0 && !loadingData && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", gap:12, opacity:0.35 }}>
                <div style={{ animation:"float 3s ease-in-out infinite" }}><RobotFaceIcon /></div>
                <p style={{ fontSize:"clamp(14px,4vw,18px)", fontWeight:700, color:"#fff", textAlign:"center" }}>ارسم مسار الروبوت هنا!</p>
                <p style={{ fontSize:12, color:"#aaa" }}>استخدم إصبعك أو الفأرة</p>
              </div>
            )}
            <canvas ref={canvasRef} style={{ width:"100%", height:"100%" }}
              onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
            />
            {saveStatus === "saved" && (
              <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", background:"rgba(108,99,255,0.95)", border:"1px solid #a78bfa", borderRadius:12, padding:"10px 22px", fontSize:14, fontWeight:800, color:"#fff", animation:"popIn 0.25s ease", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(108,99,255,0.5)", whiteSpace:"nowrap", zIndex:10 }}>
                ✅ تم حفظ المشروع!
              </div>
            )}
            {saveStatus === "error" && (
              <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", background:"rgba(255,107,107,0.95)", border:"1px solid #FF6B6B", borderRadius:12, padding:"10px 22px", fontSize:14, fontWeight:800, color:"#fff", animation:"popIn 0.25s ease", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", zIndex:10 }}>
                ❌ فشل الحفظ، تحقق من الاتصال
              </div>
            )}
          </div>

          {/* RIGHT PANEL — desktop */}
          <div className="right-panel" style={{ width:190, flexShrink:0, flexDirection:"column", padding:12, gap:12, borderLeft:"1px solid rgba(255,255,255,0.06)", background:"rgba(22,27,34,0.85)", zIndex:10, overflowY:"auto" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"rgba(0,200,83,0.07)", border:"1.5px solid rgba(0,200,83,0.2)", borderRadius:14, padding:12 }}>
              <div style={{ animation:"float 3s ease-in-out infinite" }}><RobotFaceIcon /></div>
              <div style={{ fontSize:12, fontWeight:700, color:btStatus==="connected"?"#00C853":"#aaa", textAlign:"center" }}>
                {btStatus==="connected" ? "✓ الروبوت جاهز!" : "غير متصل"}
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:12 }}>
              <div style={{ fontSize:11, color:"#aaa", fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>السرعة</div>
              <input type="range" min={20} max={100} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width:"100%", accentColor:"#00C853", cursor:"pointer" }} />
              <div style={{ textAlign:"center", fontSize:18, fontWeight:900, color:"#00C853", fontFamily:"'Fredoka One',cursive", marginTop:4 }}>{speed}%</div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:12, display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                <span style={{ color:"#aaa", fontWeight:600 }}>الخطوط</span>
                <span style={{ color:"#00E5FF", fontWeight:800 }}>{penStrokes.length}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                <span style={{ color:"#aaa", fontWeight:600 }}>الأوامر</span>
                <span style={{ color:"#f4b400", fontWeight:800 }}>{pathToCommands(penStrokes.map(s => s.points), speed).length}</span>
              </div>
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={handleSave} style={{ background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.4)", color:"#a78bfa", borderRadius:12, padding:"9px 0", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7, width:"100%", touchAction:"manipulation" }}>
              <SaveIcon /> حفظ
            </button>
            {btStatus !== "connected" ? (
              <button onClick={handleConnect} disabled={btStatus==="connecting"} style={{ background:"linear-gradient(135deg,#1565c0,#0d47a1)", border:"none", color:"#fff", borderRadius:12, padding:"10px 0", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:btStatus==="connecting"?0.7:1, touchAction:"manipulation" }}>
                {btStatus==="connecting" ? <><span style={{ width:14, height:14, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/> جاري...</> : <><BluetoothIcon /> ربط البلوتوث</>}
              </button>
            ) : (
              <button onClick={handleDisconnect} style={{ background:"rgba(255,107,107,0.15)", border:"1px solid rgba(255,107,107,0.4)", color:"#FF6B6B", borderRadius:12, padding:"10px 0", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>🔌 قطع الاتصال</button>
            )}
            <button className="send-btn" onClick={handleSend} disabled={sendStatus==="sending" || penStrokes.length===0} style={{ padding:"12px 0", width:"100%" }}>
              {sendStatus==="sending" ? <><span style={{ width:16, height:16, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/> إرسال...</> : sendStatus==="done" ? "✅ تم!" : sendStatus==="error" ? "❌ خطأ" : <><PlayIcon /> أرسل للروبوت</>}
            </button>
          </div>
        </div>

        {/* ── BOTTOM BAR — mobile only ── */}
        <div className="bottom-bar" style={{ height:60, flexShrink:0, background:"rgba(22,27,34,0.98)", borderTop:"1px solid rgba(255,255,255,0.08)", alignItems:"center", justifyContent:"space-between", padding:"0 10px", gap:6, zIndex:100 }}>
          {/* Drawing tools */}
          <button className={`tool-btn ${tool==="pen"?"active":""}`}    style={{ width:40, height:40 }} onClick={() => setTool("pen")}><PenIcon /></button>
          <button className={`tool-btn ${tool==="eraser"?"active":""}`} style={{ width:40, height:40 }} onClick={() => setTool("eraser")}><EraserIcon /></button>
          <button className="tool-btn" style={{ width:40, height:40 }} onClick={handleUndo}><UndoIcon /></button>
          <button className="tool-btn" style={{ width:40, height:40 }} onClick={handleClear}><TrashIcon /></button>

          {/* Divider */}
          <div style={{ width:1, height:30, background:"rgba(255,255,255,0.1)", flexShrink:0 }}/>

          {/* Save */}
          <button onClick={handleSave} className="tool-btn" style={{ width:40, height:40, borderColor:"rgba(108,99,255,0.5)", color:"#a78bfa" }}><SaveIcon /></button>

          {/* Bluetooth */}
          <button onClick={btStatus==="connected" ? handleDisconnect : handleConnect} className="tool-btn"
            style={{ width:40, height:40, borderColor:`${btColor}60`, color:btColor, background: btStatus==="connected"?"rgba(0,200,83,0.12)":"rgba(255,255,255,0.06)" }}>
            {btStatus==="connecting"
              ? <span style={{ width:14, height:14, border:`2px solid ${btColor}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>
              : <BluetoothIcon />}
          </button>

          {/* Send */}
          <button className="send-btn" onClick={handleSend} disabled={sendStatus==="sending" || penStrokes.length===0}
            style={{ padding:"0 14px", height:40, borderRadius:12, fontSize:13, flexShrink:0 }}>
            {sendStatus==="sending"
              ? <span style={{ width:14, height:14, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>
              : sendStatus==="done" ? "✅" : sendStatus==="error" ? "❌" : <><PlayIcon /><span style={{ fontSize:12 }}>إرسال</span></>}
          </button>

          {/* Settings (speed + color + pen size) */}
          <button onClick={() => setShowPanel(true)} className="tool-btn" style={{ width:40, height:40 }}><SettingsIcon /></button>
        </div>

        {/* ── MOBILE SETTINGS PANEL ── */}
        {showPanel && (
          <>
            <div onClick={() => setShowPanel(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200 }} />
            <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#161b22", borderTop:"1.5px solid rgba(0,200,83,0.3)", borderRadius:"22px 22px 0 0", padding:"20px 18px 36px", zIndex:210, animation:"slideUp 0.3s ease", display:"flex", flexDirection:"column", gap:14, maxHeight:"85vh", overflowY:"auto" }}>

              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#fff" }}>الإعدادات ⚙️</span>
                <button onClick={() => setShowPanel(false)} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:10, width:34, height:34, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>

              {/* Colors */}
              <div>
                <div style={{ fontSize:12, color:"#aaa", fontWeight:700, marginBottom:10 }}>اللون</div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {COLORS.map(c => (
                    <div key={c} className={`color-dot ${penColor===c?"selected":""}`}
                      style={{ background:c, width:32, height:32 }}
                      onClick={() => { setPenColor(c); setTool("pen"); }} />
                  ))}
                </div>
              </div>

              {/* Pen size */}
              <div>
                <div style={{ fontSize:12, color:"#aaa", fontWeight:700, marginBottom:8 }}>حجم القلم: <span style={{ color:penColor }}>{penSize}</span></div>
                <input type="range" min={2} max={20} value={penSize} onChange={e => setPenSize(+e.target.value)} style={{ width:"100%", accentColor:penColor }} />
              </div>

              {/* Speed */}
              <div>
                <div style={{ fontSize:12, color:"#aaa", fontWeight:700, marginBottom:8 }}>سرعة الروبوت: <span style={{ color:"#00C853" }}>{speed}%</span></div>
                <input type="range" min={20} max={100} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width:"100%", accentColor:"#00C853" }} />
              </div>

              <div style={{ height:1, background:"rgba(255,255,255,0.08)" }}/>

              {/* Save button */}
              <button className="action-btn" onClick={() => { handleSave(); setShowPanel(false); }}
                style={{ background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.4)", color:"#a78bfa" }}>
                <SaveIcon /> حفظ المشروع
              </button>

              {/* Bluetooth button */}
              {btStatus !== "connected" ? (
                <button className="action-btn" onClick={handleConnect} disabled={btStatus==="connecting"}
                  style={{ background:"linear-gradient(135deg,#1565c0,#0d47a1)", color:"#fff", opacity:btStatus==="connecting"?0.7:1 }}>
                  {btStatus==="connecting"
                    ? <><span style={{ width:16, height:16, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/> جاري الاتصال...</>
                    : <><BluetoothIcon /> ربط البلوتوث</>}
                </button>
              ) : (
                <button className="action-btn" onClick={handleDisconnect}
                  style={{ background:"rgba(255,107,107,0.15)", border:"1px solid rgba(255,107,107,0.4)", color:"#FF6B6B" }}>
                  🔌 قطع الاتصال
                </button>
              )}

              {/* Send button */}
              <button className="send-btn action-btn" onClick={() => { handleSend(); setShowPanel(false); }}
                disabled={sendStatus==="sending" || penStrokes.length===0}
                style={{ padding:"13px 0" }}>
                {sendStatus==="sending"
                  ? <><span style={{ width:16, height:16, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/> إرسال...</>
                  : <><PlayIcon /> أرسل للروبوت</>}
              </button>

            </div>
          </>
        )}

      </div>
    </>
  );
}
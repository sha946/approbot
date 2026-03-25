import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Blockly from "blockly";
import { saveKids, loadKids } from "./api";

const ESP32_IP = "192.168.1.42";

const enc = (svg) =>
  "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${inner}</svg>`;

function ledGrid(onCells) {
  let s = "";
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const on = onCells.some(([rr, cc]) => rr === r && cc === c);
      s += `<rect x="${6 + c * 7}" y="${6 + r * 7}" width="5" height="5" rx="1"
              fill="${on ? "white" : "rgba(255,255,255,0.18)"}"/>`;
    }
  return s;
}

const C = { move:"#ff2ca0", light:"#34a2fd", sound:"#741B7C", control:"#00af0f" };

const ICO_FORWARD      = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.move}"/><polygon points="32,10 56,54 8,54" fill="white"/>`));
const ICO_BACKWARD     = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.move}"/><polygon points="32,54 56,10 8,10" fill="white"/>`));
const ICO_RIGHT        = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.move}"/><polygon points="56,32 12,10 12,54" fill="white"/>`));
const ICO_LEFT         = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.move}"/><polygon points="8,32 52,10 52,54" fill="white"/>`));
const ICO_DANCE        = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.move}"/><circle cx="32" cy="14" r="7" fill="white"/><line x1="32" y1="21" x2="32" y2="42" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="32" y1="27" x2="14" y2="20" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="32" y1="27" x2="50" y2="36" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="32" y1="42" x2="18" y2="56" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="32" y1="42" x2="46" y2="56" stroke="white" stroke-width="4" stroke-linecap="round"/>`));
const ICO_STOPMOVE     = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.move}"/><rect x="14" y="14" width="36" height="36" rx="6" fill="white"/>`));
const ICO_SMILE        = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.light}"/>${ledGrid([[1,2],[1,5],[2,2],[2,5],[4,1],[4,6],[5,2],[5,5],[6,3],[6,4]])}`));
const ICO_SAD          = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.light}"/>${ledGrid([[1,2],[1,5],[2,2],[2,5],[4,3],[4,4],[5,2],[5,5],[6,1],[6,6]])}`));
const ICO_LOVE         = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.light}"/>${ledGrid([[0,1],[0,2],[0,5],[0,6],[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[4,2],[4,3],[4,4],[4,5],[5,3],[5,4]])}`));
const ICO_ANGRY        = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.light}"/>${ledGrid([[0,0],[0,7],[1,1],[1,6],[2,2],[2,5],[4,3],[4,4],[5,2],[5,5],[6,1],[6,6]])}`));
const ICO_COOL         = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.light}"/>${ledGrid([[0,1],[0,2],[0,5],[0,6],[1,0],[1,1],[1,2],[1,5],[1,6],[1,7],[2,1],[2,2],[2,5],[2,6],[4,1],[4,6],[5,2],[5,5],[6,3],[6,4]])}`));
const ICO_CLEAR        = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.light}"/>${ledGrid([])}<line x1="12" y1="12" x2="52" y2="52" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9"/><line x1="52" y1="12" x2="12" y2="52" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9"/>`));

// ── Animal icons — PNG files from public/animals/
const ICO_CAT     = "/animals/cat.png";
const ICO_DOG     = "/animals/dog.png";
const ICO_HORSE   = "/animals/horse.png";
const ICO_COW     = "/animals/cow.png";
const ICO_PIG     = "/animals/pig.png";
const ICO_LION    = "/animals/lion.png";
const ICO_MONKEY  = "/animals/monkey.png";
const ICO_CHICKEN = "/animals/chicken.png";

const ICO_WAIT         = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.control}"/><rect x="10" y="6" width="44" height="5" rx="2.5" fill="white"/><rect x="10" y="53" width="44" height="5" rx="2.5" fill="white"/><polygon points="12,11 52,11 32,32" fill="white"/><polygon points="12,53 52,53 32,32" fill="rgba(255,255,255,0.55)"/>`));
const ICO_REPEAT_N     = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.control}"/><path d="M16,40 A18,18 0 1,1 42,56" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/><polygon points="9,54 5,36 23,40" fill="white"/>`));
const ICO_LOOP_FOREVER = enc(wrap(`<circle cx="32" cy="32" r="31" fill="${C.control}"/><path d="M32,32 C32,20 20,14 14,20 C8,26 8,38 14,44 C20,50 32,44 32,32 C32,20 44,14 50,20 C56,26 56,38 50,44 C44,50 32,44 32,32 Z" fill="none" stroke="white" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>`));
const ICO_STOP_ALL     = enc(wrap(`<circle cx="32" cy="32" r="31" fill="#E53935"/><circle cx="32" cy="32" r="22" fill="white"/><rect x="19" y="19" width="26" height="26" rx="4" fill="#E53935"/>`));

const TAB_MOVE    = enc(wrap(`<circle cx="32" cy="32" r="30" fill="${C.move}"/><polygon points="32,12 54,52 10,52" fill="white"/>`));
const TAB_LIGHT   = enc(wrap(`<circle cx="32" cy="32" r="30" fill="${C.light}"/><circle cx="32" cy="28" r="12" fill="white"/>${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return`<line x1="${(32+14*Math.cos(r)).toFixed(1)}" y1="${(28+14*Math.sin(r)).toFixed(1)}" x2="${(32+20*Math.cos(r)).toFixed(1)}" y2="${(28+20*Math.sin(r)).toFixed(1)}" stroke="white" stroke-width="3" stroke-linecap="round"/>`;}).join("")}`));
const TAB_SOUND   = enc(wrap(`<circle cx="32" cy="32" r="30" fill="${C.sound}"/><polygon points="10,22 26,22 38,12 38,52 26,42 10,42" fill="white"/><path d="M42,24 Q50,32 42,40" fill="none" stroke="white" stroke-width="4.5" stroke-linecap="round"/><path d="M46,18 Q58,32 46,46" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round"/>`));
const TAB_CONTROL = enc(wrap(`<circle cx="32" cy="32" r="30" fill="${C.control}"/><rect x="10" y="8" width="44" height="5" rx="2.5" fill="white"/><rect x="10" y="51" width="44" height="5" rx="2.5" fill="white"/><polygon points="12,13 52,13 32,32" fill="white"/><polygon points="12,51 52,51 32,32" fill="rgba(255,255,255,0.55)"/>`));

// ─────────────────────────────────────────────────────────────
function registerBlocks() {
  const def = (name, iconUrl, colour, prev, next, container) => {
    if (Blockly.Blocks[name]) return;
    Blockly.Blocks[name] = {
      init() {
        this.appendDummyInput().appendField(new Blockly.FieldImage(iconUrl, 56, 56, " "));
        if (container) this.appendStatementInput("BODY");
        if (prev) this.setPreviousStatement(true, null);
        if (next) this.setNextStatement(true, null);
        this.setColour(colour);
      },
    };
  };

  // ── kb_repN: repeat N times block with clickable +/- buttons ──
  if (!Blockly.Blocks["kb_repN"]) {
    Blockly.Blocks["kb_repN"] = {
      init() {
        const btnSvg = (symbol) => {
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="8" fill="rgba(0,0,0,0.30)"/><text x="20" y="30" text-anchor="middle" font-size="26" font-weight="900" font-family="Nunito,sans-serif" fill="white">${symbol}</text></svg>`;
          return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
        };

        const minusImg = new Blockly.FieldImage(btnSvg("−"), 40, 40, "−");
        const plusImg  = new Blockly.FieldImage(btnSvg("+"), 40, 40, "+");

        minusImg.setOnClickHandler(() => {
          const v = Number(this.getFieldValue("TIMES"));
          if (v > 1) this.setFieldValue(String(v - 1), "TIMES");
          return false;
        });

        plusImg.setOnClickHandler(() => {
          const v = Number(this.getFieldValue("TIMES"));
          if (v < 20) this.setFieldValue(String(v + 1), "TIMES");
          return false;
        });

        this.appendDummyInput()
          .appendField(new Blockly.FieldImage(ICO_REPEAT_N, 56, 56, " "))
          .appendField(minusImg)
          .appendField(new Blockly.FieldNumber(3, 1, 20, 1), "TIMES")
          .appendField(plusImg);

        this.appendStatementInput("BODY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(C.control);
      },
    };
  }

  // Move
  def("kb_fwd",   ICO_FORWARD,      C.move,    true,  true);
  def("kb_bwd",   ICO_BACKWARD,     C.move,    true,  true);
  def("kb_rgt",   ICO_RIGHT,        C.move,    true,  true);
  def("kb_lft",   ICO_LEFT,         C.move,    true,  true);
  def("kb_dance", ICO_DANCE,        C.move,    true,  true);
  def("kb_stop",  ICO_STOPMOVE,     C.move,    true,  true);

  // Light
  def("kb_smile", ICO_SMILE,        C.light,   true,  true);
  def("kb_sad",   ICO_SAD,          C.light,   true,  true);
  def("kb_love",  ICO_LOVE,         C.light,   true,  true);
  def("kb_angry", ICO_ANGRY,        C.light,   true,  true);
  def("kb_cool",  ICO_COOL,         C.light,   true,  true);
  def("kb_clear", ICO_CLEAR,        C.light,   true,  true);

  // Sound — animals
  def("kb_cat",     ICO_CAT,     C.sound, true, true);
  def("kb_dog",     ICO_DOG,     C.sound, true, true);
  def("kb_horse",   ICO_HORSE,   C.sound, true, true);
  def("kb_cow",     ICO_COW,     C.sound, true, true);
  def("kb_pig",     ICO_PIG,     C.sound, true, true);
  def("kb_lion",    ICO_LION,    C.sound, true, true);
  def("kb_monkey",  ICO_MONKEY,  C.sound, true, true);
  def("kb_chicken", ICO_CHICKEN, C.sound, true, true);

  // Control
  def("kb_wait",    ICO_WAIT,         C.control, true,  true);
  def("kb_repInf",  ICO_LOOP_FOREVER, C.control, false, false, true);
  def("kb_stopAll", ICO_STOP_ALL,     "#E53935", true,  false);
}

const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category", name: " ", colour: C.move,
      cssConfig: { row: "catRow catMove", label: "catLabel" },
      contents: [
        { kind: "block", type: "kb_fwd" },
        { kind: "block", type: "kb_bwd" },
        { kind: "block", type: "kb_rgt" },
        { kind: "block", type: "kb_lft" },
        { kind: "block", type: "kb_dance" },
        
      ],
    },
    {
      kind: "category", name: " ", colour: C.light,
      cssConfig: { row: "catRow catLight", label: "catLabel" },
      contents: [
       
      ],
    },
    {
      kind: "category", name: " ", colour: C.sound,
      cssConfig: { row: "catRow catSound", label: "catLabel" },
      contents: [
        { kind: "block", type: "kb_cat" },
        { kind: "block", type: "kb_dog" },
        { kind: "block", type: "kb_horse" },
        { kind: "block", type: "kb_cow" },
        { kind: "block", type: "kb_pig" },
        { kind: "block", type: "kb_lion" },
        { kind: "block", type: "kb_monkey" },
        { kind: "block", type: "kb_chicken" },
      ],
    },
    {
      kind: "category", name: " ", colour: C.control,
      cssConfig: { row: "catRow catCtrl", label: "catLabel" },
      contents: [
        { kind: "block", type: "kb_wait" },
        { kind: "block", type: "kb_repN" },
        { kind: "block", type: "kb_repInf" },
        
      ],
    },
  ],
};

function buildJSON(ws) {
  const G = Blockly.JavaScript;
  const inner = (b, key) => {
    let s = "", c = b.getInputTargetBlock(key);
    while (c) { s += G[c.type]?.(c) ?? ""; c = c.getNextBlock(); }
    return s.replace(/,\s*$/, "");
  };

  // Move
  G["kb_fwd"]   = () => `{"cmd":"move_forward","power":60,"duration":1},`;
  G["kb_bwd"]   = () => `{"cmd":"move_backward","power":60,"duration":1},`;
  G["kb_rgt"]   = () => `{"cmd":"turn_right","power":60,"duration":0.5},`;
  G["kb_lft"]   = () => `{"cmd":"turn_left","power":60,"duration":0.5},`;
  G["kb_dance"] = () => `{"cmd":"dance"},`;
  G["kb_stop"]  = () => `{"cmd":"stop","duration":1},`;

  // Light
  G["kb_smile"] = () => `{"cmd":"show_leds","pattern":"SMILE"},`;
  G["kb_sad"]   = () => `{"cmd":"show_leds","pattern":"SAD"},`;
  G["kb_love"]  = () => `{"cmd":"show_leds","pattern":"LOVE"},`;
  G["kb_angry"] = () => `{"cmd":"show_leds","pattern":"ANGRY"},`;
  G["kb_cool"]  = () => `{"cmd":"show_leds","pattern":"COOL"},`;
  G["kb_clear"] = () => `{"cmd":"clear_screen"},`;

  // Sound — animals
  G["kb_cat"]     = () => `{"cmd":"animal_sound","sound":"CAT"},`;
  G["kb_dog"]     = () => `{"cmd":"animal_sound","sound":"DOG"},`;
  G["kb_horse"]   = () => `{"cmd":"animal_sound","sound":"HORSE"},`;
  G["kb_cow"]     = () => `{"cmd":"animal_sound","sound":"COW"},`;
  G["kb_pig"]     = () => `{"cmd":"animal_sound","sound":"PIG"},`;
  G["kb_lion"]    = () => `{"cmd":"animal_sound","sound":"LION"},`;
  G["kb_monkey"]  = () => `{"cmd":"animal_sound","sound":"MONKEY"},`;
  G["kb_chicken"] = () => `{"cmd":"animal_sound","sound":"CHICKEN"},`;

  // Control
  G["kb_wait"]    = () => `{"cmd":"wait","seconds":1},`;
  G["kb_stopAll"] = () => `{"cmd":"stop_all"},`;
  G["kb_repN"] = (b) => {
    const times = b.getFieldValue("TIMES") || 1;
    return `{"cmd":"repeat","times":${times},"body":[${inner(b,"BODY")}]},`;
  };
  G["kb_repInf"]  = (b) => `{"cmd":"loop_forever","body":[${inner(b,"BODY")}]},`;

  let code = "", b = ws.getTopBlocks(true)[0];
  while (b) { code += G[b.type]?.(b) ?? ""; b = b.getNextBlock(); }
  return `{"program":[${code.replace(/,\s*$/, "")}]}`;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function KidsRobotApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName = "مشروعي", projectId } = location.state || {};

  const divRef = useRef(null);
  const wsRef  = useRef(null);

  const [cnt,       setCnt]       = useState(0);
  const [running,   setRun]       = useState(false);
  const [result,    setResult]    = useState(null);
  const [win,       setWin]       = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.id = "kids-blockly-css";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
      .blocklyToolboxDiv { right:0!important;left:auto!important;border-left:2px solid rgba(255,255,255,0.12)!important;border-right:none!important;background:#1a1a2e!important;padding:8px 0!important; }
      .blocklyFlyoutBackground{fill:#16213e!important}.blocklyMainBackground{fill:#0f0f23!important}
      .blocklyScrollbarHandle{fill:rgba(255,255,255,0.25)!important}
      .blocklyPath{filter:drop-shadow(0 4px 10px rgba(0,0,0,0.55))}
      .catRow{border-radius:14px!important;margin:5px 7px!important;width:54px!important;height:54px!important;display:flex!important;align-items:center!important;justify-content:center!important;background-size:40px 40px!important;background-repeat:no-repeat!important;background-position:center!important;transition:opacity 0.15s,transform 0.15s!important}
      .catRow:hover{opacity:0.85!important;transform:scale(1.06)!important}
      .blocklyTreeSelected .catRow{outline:3px solid white!important;outline-offset:2px!important}
      .catLabel{display:none!important}.blocklyTreeRowContentContainer{justify-content:center!important}
      .catMove{background-image:url("${TAB_MOVE}")!important}
      .catLight{background-image:url("${TAB_LIGHT}")!important}
      .catSound{background-image:url("${TAB_SOUND}")!important}
      .catCtrl{background-image:url("${TAB_CONTROL}")!important}
      .blocklyZoom>image,.blocklyTrash>image{filter:invert(1) opacity(0.45)}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes pulse-conn{0%,100%{box-shadow:0 0 0 0 rgba(0,200,83,0.5)}50%{box-shadow:0 0 0 8px rgba(0,200,83,0)}}
    `;
    document.head.appendChild(s);
    return () => document.getElementById("kids-blockly-css")?.remove();
  }, []);

  useEffect(() => {
    registerBlocks();
    const div = divRef.current;
    if (!div) return;
    const raf = requestAnimationFrame(() => {
      const theme = Blockly.Theme.defineTheme("kidsTheme", {
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: "#0f0f23",
          toolboxBackgroundColour:   "#1a1a2e",
          toolboxForegroundColour:   "#ffffff",
          flyoutBackgroundColour:    "#16213e",
          flyoutForegroundColour:    "#ffffff",
          flyoutOpacity:             0.98,
          scrollbarColour:           "rgba(255,255,255,0.22)",
        },
        fontStyle: { family: "Nunito, sans-serif", size: 12 },
      });
      wsRef.current = Blockly.inject(div, {
        toolbox:   TOOLBOX,
        scrollbars: true,
        trashcan:   true,
        rtl:        true,
        zoom:  { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.4, scaleSpeed: 1.2 },
        grid:  { spacing: 26, length: 4, colour: "rgba(255,255,255,0.04)", snap: true },
        theme,
        renderer: "zelos",
      });

      if (projectId) {
        loadKids(projectId).then(({ kidsSave }) => {
          if (kidsSave && wsRef.current) {
            try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(kidsSave), wsRef.current); } catch {}
          }
        }).catch(() => {});
      }

      const resize = () => {
        if (!wsRef.current) return;
        Blockly.svgResize(wsRef.current);
        const tb = div.querySelector(".blocklyToolboxDiv");
        if (tb) tb.style.height = div.clientHeight + "px";
      };
      resize();
      wsRef.current.addChangeListener(() => setCnt(wsRef.current?.getAllBlocks(false).length ?? 0));
      const ro = new ResizeObserver(resize);
      ro.observe(div);
      window.addEventListener("resize", resize);
      return () => { ro.disconnect(); window.removeEventListener("resize", resize); };
    });
    return () => { cancelAnimationFrame(raf); wsRef.current?.dispose(); wsRef.current = null; };
  }, []);

  const handleSave = async () => {
    if (!wsRef.current || !projectId || saving) return;
    setSaving(true);
    try {
      const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(wsRef.current));
      await saveKids(projectId, xml);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {}
    setSaving(false);
  };

  const run = async () => {
    if (!wsRef.current || running || cnt === 0) return;
    setRun(true); setResult(null);
    let payload;
    try { payload = buildJSON(wsRef.current); JSON.parse(payload); }
    catch { setResult("err"); setRun(false); return; }
    try {
      const res = await fetch(`http://${ESP32_IP}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      if (res.ok) { setResult("ok"); setWin(true); setTimeout(() => setWin(false), 2800); }
      else setResult("err");
    } catch { setResult("err"); }
    setRun(false);
    setTimeout(() => setResult(null), 3000);
  };

  const iconBtn = (extra = {}) => ({
    height: 38, borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "background 0.15s, transform 0.12s",
    fontFamily: "'Nunito',sans-serif",
    ...extra,
  });

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;width:100%;overflow:hidden}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{to{transform:translateY(-160px) scale(.1);opacity:0}}
        @keyframes pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        .ib:hover{background:rgba(255,255,255,0.15)!important;transform:scale(1.05)!important}
        .ib:active{transform:scale(0.93)!important}
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column",
        height: "100vh", width: "100vw",
        background: "#0f0f23", fontFamily: "'Nunito',sans-serif",
        overflow: "hidden", direction: "rtl",
      }}>

        {/* ── BAR 1 ── */}
        <div style={{
          height: 52, flexShrink: 0,
          display: "flex", alignItems: "center",
          padding: "0 12px", gap: 10,
          background: "#12122a",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          zIndex: 21, direction: "rtl",
        }}>
          <button className="ib" onClick={() => navigate(-1)}
            style={iconBtn({ width: 38, padding: 0 })} title="رجوع">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>

          <span style={{ fontSize: 15, fontWeight: 900, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {projectName}
          </span>
        </div>

        {/* ── BAR 2 ── */}
        <div style={{
          height: 48, flexShrink: 0,
          display: "flex", alignItems: "center",
          padding: "0 10px", gap: 6,
          background: "#0d0d20",
          borderBottom: "2px solid rgba(255,255,255,0.07)",
          zIndex: 20, direction: "rtl",
        }}>
          {/* undo */}
          <button className="ib" onClick={() => wsRef.current?.undo(false)}
            style={iconBtn({ width: 38, padding: 0 })} title="تراجع">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </button>

          {/* redo */}
          <button className="ib" onClick={() => wsRef.current?.undo(true)}
            style={iconBtn({ width: 38, padding: 0 })} title="أعد">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </button>

          {/* save */}
          <button className="ib" onClick={handleSave}
            disabled={saving || !projectId}
            title="حفظ"
            style={iconBtn({
              padding: "0 14px", gap: 6, fontWeight: 900, fontSize: 13,
              background: saved
                ? "linear-gradient(135deg,#00E676,#00897B)"
                : "linear-gradient(135deg,#FFD600,#FF9500)",
              border: "none",
              boxShadow: saved ? "0 3px 12px rgba(0,230,118,0.4)" : "0 3px 12px rgba(255,214,0,0.35)",
              opacity: saving ? 0.7 : 1,
              cursor: !projectId ? "not-allowed" : "pointer",
            })}>
            {saving
              ? <div style={{ width: 15, height: 15, border: "2.5px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
              : saved
                ? <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                : <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
            }
            حفظ
          </button>

          <div style={{ flex: 1 }}/>

          {/* block count */}
          <div style={{
            height: 38, borderRadius: 10,
            background: cnt > 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 5, padding: "0 12px", flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="rgba(255,255,255,0.45)">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6z"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 900, color: cnt > 0 ? "white" : "rgba(255,255,255,0.28)" }}>
              {cnt} كتلة
            </span>
          </div>

          {/* start */}
          <button className="ib" onClick={run}
            disabled={running || cnt === 0}
            style={iconBtn({
              padding: "0 18px", gap: 7, fontWeight: 900, fontSize: 14,
              background: cnt === 0 ? "rgba(255,255,255,0.06)"
                : running ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg,#4CAF50,#2E7D32)",
              border: "none",
              boxShadow: cnt > 0 && !running ? "0 3px 14px rgba(76,175,80,0.45)" : "none",
              opacity: cnt === 0 ? 0.35 : 1,
              cursor: cnt === 0 ? "not-allowed" : "pointer",
            })}>
            {running
              ? <div style={{ width: 17, height: 17, border: "2.5px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
              : <svg viewBox="0 0 24 24" width="19" height="19" fill="white"><path d="M8 5v14l11-7z"/></svg>
            }
            {!running && "ابدأ"}
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* LEFT PANEL */}
          <div style={{
            width: 175, flexShrink: 0,
            display: "flex", flexDirection: "column",
            padding: "14px 12px", gap: 14,
            background: "rgba(18,18,42,0.95)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            zIndex: 10, overflowY: "auto", direction: "rtl",
          }}>
            {/* Robot card */}
            <div style={{
              background: "rgba(22,27,50,0.9)",
              border: `1.5px solid ${connected ? "rgba(0,200,83,0.45)" : "rgba(108,99,255,0.35)"}`,
              borderRadius: 18, padding: "16px 12px",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 10,
              transition: "border-color 0.3s",
            }}>
              <div style={{ width: 72, height: 72, animation: "float 3s ease-in-out infinite" }}>
                <svg viewBox="0 0 64 64" fill="none" style={{ width: "100%", height: "100%" }}>
                  <rect x="16" y="20" width="32" height="28" rx="6"
                    fill={connected ? "#00C853" : "#6C63FF"} stroke="#fff" strokeWidth="2"/>
                  <rect x="22" y="26" width="8" height="8" rx="2"
                    fill={connected ? "#FFEB3B" : "#00E5FF"}/>
                  <rect x="34" y="26" width="8" height="8" rx="2"
                    fill={connected ? "#FFEB3B" : "#00E5FF"}/>
                  <rect x="24" y="38" width="16" height="4" rx="2" fill="white" opacity="0.8"/>
                  <rect x="28" y="10" width="8" height="10" rx="3"
                    fill={connected ? "#00C853" : "#6C63FF"} stroke="#fff" strokeWidth="2"/>
                  <circle cx="32" cy="9" r="3" fill={connected ? "#FFEB3B" : "#FF6B6B"}/>
                  <rect x="4"  y="28" width="10" height="6" rx="3"
                    fill={connected ? "#00C853" : "#6C63FF"} stroke="#fff" strokeWidth="2"/>
                  <rect x="50" y="28" width="10" height="6" rx="3"
                    fill={connected ? "#00C853" : "#6C63FF"} stroke="#fff" strokeWidth="2"/>
                  <rect x="22" y="48" width="8" height="8" rx="3"
                    fill={connected ? "#00C853" : "#6C63FF"} stroke="#fff" strokeWidth="2"/>
                  <rect x="34" y="48" width="8" height="8" rx="3"
                    fill={connected ? "#00C853" : "#6C63FF"} stroke="#fff" strokeWidth="2"/>
                  {connected && <>
                    <circle cx="52" cy="14" r="6" fill="#00C853"/>
                    <path d="M49 14l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </>}
                </svg>
              </div>

              <div style={{ fontSize: 13, fontWeight: 800, color: connected ? "#00C853" : "rgba(255,255,255,0.5)" }}>
                {connected ? "✓ متصل" : "غير متصل"}
              </div>

              <button onClick={() => setConnected(v => !v)} style={{
                width: "100%", padding: "10px 0", borderRadius: 12,
                border: connected ? "1.5px solid rgba(0,200,83,0.5)" : "none",
                cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                color: connected ? "#00C853" : "#fff",
                background: connected ? "rgba(0,200,83,0.13)" : "linear-gradient(135deg,#00b4db,#0083b0)",
                animation: connected ? "pulse-conn 2s infinite" : "none",
                transition: "all 0.25s",
                boxShadow: connected ? "none" : "0 4px 14px rgba(0,131,176,0.4)",
              }}>
                {connected ? "قطع الاتصال" : "ربط الجهاز"}
              </button>
            </div>

            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 13 }}></span> 
            </div>
          </div>

          {/* BLOCKLY */}
          <div ref={divRef} style={{ flex: 1, minHeight: 0, position: "relative" }}/>
        </div>

        {/* ERROR */}
        {result === "err" && (
          <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 300, animation: "pop .3s ease", background: "#C62828", borderRadius: 18, padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Nunito',sans-serif", fontWeight: 900, color: "white", fontSize: 14 }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            خطأ في الاتصال
          </div>
        )}

        {/* WIN */}
        {win && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} style={{ position: "absolute", left: `${4 + (i * 4.7) % 92}%`, top: `${36 + (i * 7) % 42}%`, fontSize: [26, 20, 30, 18, 24][i % 5], animation: `up 1s ease-out ${i * .08}s forwards` }}>
                {["⭐","🎉","✨","🌟","💫","🎊","🏆"][i % 7]}
              </span>
            ))}
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#00E676,#00897B)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pop .4s cubic-bezier(.34,1.56,.64,1)", boxShadow: "0 0 70px rgba(0,230,118,.7)" }}>
              <svg viewBox="0 0 24 24" width="66" height="66" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as Blockly from "blockly";
import { AccountMenu, useProfile } from "./useProfile";

const ArrowBackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);
const UndoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
  </svg>
);
const RedoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
  </svg>
);
const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);
const RobotIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
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
const ConnectedRobotIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect x="16" y="20" width="32" height="28" rx="6" fill="#00C853" stroke="#fff" strokeWidth="2"/>
    <rect x="22" y="26" width="8" height="8" rx="2" fill="#FFEB3B"/>
    <rect x="34" y="26" width="8" height="8" rx="2" fill="#FFEB3B"/>
    <rect x="24" y="38" width="16" height="4" rx="2" fill="#fff" opacity="0.9"/>
    <rect x="28" y="10" width="8" height="10" rx="3" fill="#00C853" stroke="#fff" strokeWidth="2"/>
    <circle cx="32" cy="9" r="3" fill="#FFEB3B"/>
    <rect x="4" y="28" width="10" height="6" rx="3" fill="#00C853" stroke="#fff" strokeWidth="2"/>
    <rect x="50" y="28" width="10" height="6" rx="3" fill="#00C853" stroke="#fff" strokeWidth="2"/>
    <rect x="22" y="48" width="8" height="8" rx="3" fill="#00C853" stroke="#fff" strokeWidth="2"/>
    <rect x="34" y="48" width="8" height="8" rx="3" fill="#00C853" stroke="#fff" strokeWidth="2"/>
    <circle cx="52" cy="14" r="6" fill="#FFEB3B"/>
    <path d="M49 14l2 2 4-4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LED_PATTERNS = {
  FULL:       [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  PLUS:       [0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0],
  X:          [1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
  FRAME:      [1,1,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,1,1],
  HEART:      [0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0],
  SMILE:      [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0],
  ARROW_UP:   [0,0,1,0,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,0,0,1,0,0],
  ARROW_DOWN: [0,0,1,0,0,0,0,1,0,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0,0],
};

function generateLedIcon(patternKey, size = 40) {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grid = LED_PATTERNS[patternKey];
  const padding = 2;
  const dotSize = (size - padding * 2) / 5;
  ctx.fillStyle = "#1565c0";
  ctx.roundRect(0, 0, size, size, 4); ctx.fill();
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const lit = grid[row * 5 + col];
      ctx.beginPath();
      ctx.arc(padding + col * dotSize + dotSize * 0.5, padding + row * dotSize + dotSize * 0.5, dotSize * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = lit ? "#ffffff" : "#1976d2"; ctx.fill();
    }
  }
  return canvas.toDataURL("image/png");
}

function buildLedDropdownOptions() {
  return Object.keys(LED_PATTERNS).map(key => {
    const dataUri = generateLedIcon(key, 40);
    return [{ src: dataUri, width: 40, height: 40, alt: key }, key];
  });
}

function registerBlocks() {
  const def = (name, fn) => { if (!Blockly.Blocks[name]) Blockly.Blocks[name] = { init: fn }; };

  def("show_number",   function() { this.appendDummyInput().appendField("اعرض رقم").appendField(new Blockly.FieldNumber(0),"NUMBER"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#ff8c42"); });
  def("show_leds",     function() { this.appendDummyInput().appendField("اعرض أيقونة").appendField(new Blockly.FieldDropdown(buildLedDropdownOptions),"PATTERN"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#ff8c42"); });
  def("show_text",     function() { this.appendDummyInput().appendField("اعرض نص").appendField(new Blockly.FieldTextInput("مرحبا"),"TEXT"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#ff8c42"); });
  def("clear_screen",  function() { this.appendDummyInput().appendField("امسح الشاشة"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#ff8c42"); });
  def("forever",       function() { this.appendStatementInput("DO").appendField("دائماً"); this.setColour("#ff8c42"); });
  def("on_start",      function() { this.appendStatementInput("DO").appendField("عند البدء"); this.setColour("#ff8c42"); });
  def("pause_ms",      function() { this.appendDummyInput().appendField("انتظر").appendField(new Blockly.FieldNumber(100,0),"TIME").appendField("مللي ثانية"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#ff8c42"); });
  def("repeat_times",  function() { this.appendDummyInput().appendField("كرر").appendField(new Blockly.FieldNumber(10,1),"TIMES").appendField("مرات"); this.appendStatementInput("DO").appendField("افعل"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#f4b400"); });
  def("while_loop",    function() { this.appendValueInput("CONDITION").setCheck("Boolean").appendField("طالما"); this.appendStatementInput("DO").appendField("افعل"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#f4b400"); });
  def("for_loop",      function() { this.appendDummyInput().appendField("من").appendField(new Blockly.FieldNumber(1),"FROM").appendField("إلى").appendField(new Blockly.FieldNumber(10),"TO").appendField("المؤشر").appendField(new Blockly.FieldVariable("i"),"VAR"); this.appendStatementInput("DO").appendField("افعل"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#f4b400"); });
  def("every_ms",      function() { this.appendDummyInput().appendField("كل").appendField(new Blockly.FieldNumber(500,1),"MS").appendField("مللي ثانية"); this.appendStatementInput("DO").appendField("افعل"); this.setColour("#f4b400"); });
  def("loop_pause",    function() { this.appendDummyInput().appendField("توقف مؤقت"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#f4b400"); });
  def("loop_continue", function() { this.appendDummyInput().appendField("تابع"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#f4b400"); });
  def("play_melody",   function() { this.appendDummyInput().appendField("شغّل لحن").appendField(new Blockly.FieldDropdown([["دوري دو مي سول","DODO"],["ميلودي النجوم","STARS"],["نغمة البداية","STARTUP"],["نغمة مرحبا","HELLO"],["نغمة الانتصار","WIN"],["نغمة الخسارة","LOSE"],["نغمة تنبيه","ALERT"]]),"MELODY"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#9c27b0"); });
  def("set_volume",    function() { this.appendDummyInput().appendField("اضبط الصوت على").appendField(new Blockly.FieldNumber(50,0,100),"VOLUME").appendField("%"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#9c27b0"); });
  def("stop_sounds",   function() { this.appendDummyInput().appendField("أوقف كل الأصوات"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#9c27b0"); });
  def("led_on",        function() { this.appendDummyInput().appendField("أضِئ عند x").appendField(new Blockly.FieldNumber(0,0,4),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,4),"Y"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#03a9f4"); });
  def("led_toggle",    function() { this.appendDummyInput().appendField("فعّل/عطّل عند x").appendField(new Blockly.FieldNumber(0,0,4),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,4),"Y"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#03a9f4"); });
  def("led_off",       function() { this.appendDummyInput().appendField("أطفئ عند x").appendField(new Blockly.FieldNumber(0,0,4),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,4),"Y"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#03a9f4"); });
  def("math_operation",function() { this.appendDummyInput().appendField(new Blockly.FieldNumber(0),"A").appendField(new Blockly.FieldDropdown([["+","ADD"],["−","MINUS"],["×","MULTIPLY"],["÷","DIVIDE"],["^","POWER"]]),"OP").appendField(new Blockly.FieldNumber(0),"B"); this.setInputsInline(true); this.setOutput(true,"Number"); this.setColour("#5C81A6"); });
  def("math_remainder",function() { this.appendDummyInput().appendField("باقي قسمة").appendField(new Blockly.FieldNumber(10),"A").appendField("على").appendField(new Blockly.FieldNumber(3),"B"); this.setInputsInline(true); this.setOutput(true,"Number"); this.setColour("#5C81A6"); });
  def("math_min",      function() { this.appendDummyInput().appendField("أصغر قيمة بين").appendField(new Blockly.FieldNumber(0),"A").appendField("و").appendField(new Blockly.FieldNumber(0),"B"); this.setInputsInline(true); this.setOutput(true,"Number"); this.setColour("#5C81A6"); });
  def("math_max",      function() { this.appendDummyInput().appendField("أكبر قيمة بين").appendField(new Blockly.FieldNumber(0),"A").appendField("و").appendField(new Blockly.FieldNumber(0),"B"); this.setInputsInline(true); this.setOutput(true,"Number"); this.setColour("#5C81A6"); });
  def("math_random",   function() { this.appendDummyInput().appendField("اختر عشوائياً من").appendField(new Blockly.FieldNumber(1),"FROM").appendField("إلى").appendField(new Blockly.FieldNumber(10),"TO"); this.setOutput(true,"Number"); this.setColour("#5C81A6"); });

  let FieldLedMatrix;
  if (!Blockly.Blocks["__led_matrix_registered__"]) {
    FieldLedMatrix = class extends Blockly.Field {
      constructor(value) {
        super(value || "0".repeat(25));
        this.SERIALIZABLE = true; this.CURSOR = "default";
        this.GRID_SIZE = 5; this.CELL_SIZE = 22; this.CELL_GAP = 4; this.PADDING = 8;
        this.cellRects_ = []; this.isDragging_ = false; this.dragValue_ = null;
      }
      static fromJson(o) { return new FieldLedMatrix(o["value"]); }
      getValue() { return this.value_ || "0".repeat(25); }
      doClassValidation_(v) { if (typeof v !== "string" || v.length !== 25 || !/^[01]+$/.test(v)) return null; return v; }
      initView() { this.svgGroup_ = Blockly.utils.dom.createSvgElement("g", {}, this.fieldGroup_); this.updateSize_(); this.renderGrid_(); }
      updateSize_() { const t = this.GRID_SIZE * this.CELL_SIZE + (this.GRID_SIZE - 1) * this.CELL_GAP + this.PADDING * 2; this.size_.width = t; this.size_.height = t; }
      getIdxFromClient_(cx, cy) {
        const r = this.svgGroup_.getBoundingClientRect();
        const step = this.CELL_SIZE + this.CELL_GAP;
        const col = Math.floor((cx - r.left - this.PADDING) / step);
        const row = Math.floor((cy - r.top - this.PADDING) / step);
        if (col < 0 || col >= this.GRID_SIZE || row < 0 || row >= this.GRID_SIZE) return -1;
        return row * this.GRID_SIZE + col;
      }
      toggleCell_(idx, forced) {
        if (idx < 0) return;
        const arr = this.getValue().split("");
        arr[idx] = forced !== undefined ? forced : (arr[idx] === "1" ? "0" : "1");
        this.setValue(arr.join(""));
      }
      renderGrid_() {
        while (this.svgGroup_.firstChild) this.svgGroup_.removeChild(this.svgGroup_.firstChild);
        this.cellRects_ = [];
        const grid = this.getValue(); const step = this.CELL_SIZE + this.CELL_GAP;
        for (let row = 0; row < this.GRID_SIZE; row++) {
          for (let col = 0; col < this.GRID_SIZE; col++) {
            const idx = row * this.GRID_SIZE + col;
            const rect = Blockly.utils.dom.createSvgElement("rect", { x: this.PADDING + col * step, y: this.PADDING + row * step, width: this.CELL_SIZE, height: this.CELL_SIZE, rx: 4, ry: 4, fill: grid[idx] === "1" ? "#ffffff" : "#2196f3", stroke: "rgba(0,0,0,0.2)", "stroke-width": "1" }, this.svgGroup_);
            this.cellRects_.push(rect);
          }
        }
        const total = this.GRID_SIZE * this.CELL_SIZE + (this.GRID_SIZE - 1) * this.CELL_GAP + this.PADDING * 2;
        const overlay = Blockly.utils.dom.createSvgElement("rect", { x: 0, y: 0, width: total, height: total, fill: "transparent", style: "cursor:pointer;touch-action:none;" }, this.svgGroup_);
        overlay.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); overlay.setPointerCapture(e.pointerId); const idx = this.getIdxFromClient_(e.clientX, e.clientY); if (idx < 0) return; const arr = this.getValue().split(""); this.dragValue_ = arr[idx] === "1" ? "0" : "1"; this.isDragging_ = true; this.toggleCell_(idx, this.dragValue_); });
        overlay.addEventListener("pointermove", (e) => { if (!this.isDragging_) return; e.preventDefault(); e.stopPropagation(); this.toggleCell_(this.getIdxFromClient_(e.clientX, e.clientY), this.dragValue_); });
        overlay.addEventListener("pointerup", (e) => { e.preventDefault(); e.stopPropagation(); this.isDragging_ = false; this.dragValue_ = null; });
      }
      doValueUpdate_(v) {
        super.doValueUpdate_(v);
        if (this.svgGroup_) {
          if (this.cellRects_.length === 25) { const g = v || "0".repeat(25); this.cellRects_.forEach((r, i) => r.setAttribute("fill", g[i] === "1" ? "#ffffff" : "#2196f3")); }
          else { this.renderGrid_(); }
        }
      }
      showEditor_() {}
    };
    try { Blockly.fieldRegistry.register("field_led_matrix", FieldLedMatrix); } catch (e) {}
    Blockly.Blocks["__led_matrix_registered__"] = { _class: FieldLedMatrix, init: function() {} };
  } else {
    FieldLedMatrix = Blockly.Blocks["__led_matrix_registered__"]._class;
  }

  def("show_leds_matrix", function() {
    this.appendDummyInput().appendField("اعرض LEDs");
    this.appendDummyInput().appendField(new FieldLedMatrix("0".repeat(25)), "MATRIX");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#ff8c42");
  });
}

const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    { kind:"category", name:"⚙️ تحكم",  colour:"#ff8c42", contents:[{kind:"block",type:"show_number"},{kind:"block",type:"show_leds"},{kind:"block",type:"show_leds_matrix"},{kind:"block",type:"show_text"},{kind:"block",type:"clear_screen"},{kind:"block",type:"forever"},{kind:"block",type:"on_start"},{kind:"block",type:"pause_ms"}] },
    { kind:"category", name:"🔁 كرر",   colour:"#f4b400", contents:[{kind:"block",type:"repeat_times"},{kind:"block",type:"while_loop"},{kind:"block",type:"for_loop"},{kind:"block",type:"every_ms"},{kind:"block",type:"loop_pause"},{kind:"block",type:"loop_continue"}] },
    { kind:"category", name:"🎵 أصوات", colour:"#9c27b0", contents:[{kind:"block",type:"play_melody"},{kind:"block",type:"set_volume"},{kind:"block",type:"stop_sounds"}] },
    { kind:"category", name:"💡 أضواء", colour:"#03a9f4", contents:[{kind:"block",type:"led_on"},{kind:"block",type:"led_toggle"},{kind:"block",type:"led_off"}] },
    { kind:"category", name:"🔢 حساب",  colour:"#5C81A6", contents:[{kind:"block",type:"math_operation"},{kind:"block",type:"math_remainder"},{kind:"block",type:"math_min"},{kind:"block",type:"math_max"},{kind:"block",type:"math_random"}] },
  ],
};

// ── Storage helpers ────────────────────────────────────────────────────────────
function getSaveKey(projectName) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = user?.username || "guest";
  const safeName = projectName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_");
  return `blocks_save_${username}_${safeName}`;
}

// ── Puzzle piece SVG for the hint ─────────────────────────────────────────────
const PuzzleIcon = () => (
  <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="8" width="20" height="20" rx="4" fill="#6C63FF" opacity="0.8"/>
    <rect x="36" y="8" width="20" height="20" rx="4" fill="#ff8c42" opacity="0.8"/>
    <rect x="8" y="36" width="20" height="20" rx="4" fill="#00E5FF" opacity="0.8"/>
    <rect x="36" y="36" width="20" height="20" rx="4" fill="#f4b400" opacity="0.8"/>
    <path d="M28 16 Q32 12 36 16" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M16 28 Q12 32 16 36" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M28 48 Q32 52 36 48" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M48 28 Q52 32 48 36" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
);

export default function RobotApp() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const projectName = location.state?.projectName || "مشروعي 🚀";

  const blocklyDivRef = useRef(null);
  const workspaceRef  = useRef(null);

  const [isConnected,    setIsConnected]    = useState(false);
  const [questionActive, setQuestionActive] = useState(false);
  const [saveStatus,     setSaveStatus]     = useState("");
  const [blockCount,     setBlockCount]     = useState(0); // track blocks for hint

  useEffect(() => {
    registerBlocks();
    const div = blocklyDivRef.current;
    if (!div) return;

    const frameId = requestAnimationFrame(() => {
      workspaceRef.current = Blockly.inject(div, {
        toolbox: TOOLBOX,
        scrollbars: true,
        trashcan: true,
        zoom: { controls:true, wheel:true, startScale:1.0, maxScale:3, minScale:0.3, scaleSpeed:1.2 },
        grid: { spacing:20, length:3, colour:"rgba(255,255,255,0.05)", snap:true },
        theme: Blockly.Theme.defineTheme("darkTheme", {
          base: Blockly.Themes.Classic,
          componentStyles: {
            workspaceBackgroundColour: "#161b22",
            toolboxBackgroundColour:   "#0d1117",
            toolboxForegroundColour:   "#ffffff",
            flyoutBackgroundColour:    "#1c2128",
            flyoutForegroundColour:    "#ffffff",
            flyoutOpacity: 0.97,
            scrollbarColour: "rgba(255,255,255,0.2)",
          },
        }),
      });
      Blockly.svgResize(workspaceRef.current);

      // ── Auto-load saved blocks ──────────────────────────────────────────────
      const key = getSaveKey(projectName);
      const savedXml = localStorage.getItem(key);
      if (savedXml) {
        try {
          const xml = Blockly.utils.xml.textToDom(savedXml);
          Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
        } catch (e) {
          console.warn("Could not restore saved blocks:", e);
        }
      }

      // ── Listen for block changes to update hint ─────────────────────────────
      workspaceRef.current.addChangeListener(() => {
        const count = workspaceRef.current?.getAllBlocks(false).length ?? 0;
        setBlockCount(count);
      });

      // Set initial count (in case blocks were loaded from save)
      setBlockCount(workspaceRef.current.getAllBlocks(false).length);
    });

    const onResize = () => {
      if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUndo = () => workspaceRef.current?.undo(false);
  const handleRedo = () => workspaceRef.current?.undo(true);

  const handleSave = () => {
    if (!workspaceRef.current) return;
    try {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.utils.xml.domToText(xml);
      localStorage.setItem(getSaveKey(projectName), xmlText);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  const handleRun = () => {
    if (!workspaceRef.current) return;
    const count = workspaceRef.current.getAllBlocks(false).length;
    alert(`✅ تم إرسال ${count} كتلة إلى الروبوت!`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&family=Fredoka+One&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; width:100%; overflow:hidden; background:#0d1117; }
        .blocklyToolboxDiv     { background:#0d1117 !important; border-right:1px solid rgba(255,255,255,0.08) !important; }
        .blocklyTreeRow        { border-radius:8px !important; margin:2px 6px !important; transition:background 0.15s !important; }
        .blocklyTreeRow:hover  { background:rgba(255,255,255,0.07) !important; }
        .blocklyTreeSelected   { background:rgba(108,99,255,0.25) !important; border-left:3px solid #6C63FF !important; }
        .blocklyTreeLabel      { font-family:'Tajawal',sans-serif !important; font-size:14px !important; font-weight:700 !important; }
        .blocklyFlyoutBackground { fill:#1c2128 !important; }
        .blocklyScrollbarHandle  { fill:rgba(255,255,255,0.2) !important; }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(0,200,83,0.5)} 50%{box-shadow:0 0 0 8px rgba(0,200,83,0)} }
        @keyframes popIn   { 0%{opacity:0;transform:translateX(-50%) scale(0.8)} 100%{opacity:1;transform:translateX(-50%) scale(1)} }
        @keyframes fadeOut { 0%{opacity:1} 100%{opacity:0} }
        @keyframes arrowBounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-10px)} }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100vw", background:"#0d1117", color:"#fff", fontFamily:"'Tajawal',sans-serif", overflow:"hidden" }}>

        {/* APP BAR */}
        <div style={{ height:60, flexShrink:0, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 16px", gap:12, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,0.5)" }}>
          <button onClick={() => navigate("/home")}
            style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#fff", borderRadius:12, width:40, height:40, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}
          >
            <ArrowBackIcon />
          </button>
          <div style={{ flex:1, textAlign:"center" }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, background:"linear-gradient(90deg,#6C63FF,#00E5FF,#FF6B6B)", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {projectName}
            </span>
          </div>
          <AccountMenu navigate={navigate} />
        </div>

        {/* BODY */}
        <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>

          {/* LEFT PANEL */}
          <div style={{ width:196, flexShrink:0, display:"flex", flexDirection:"column", padding:12, gap:12, borderRight:"1px solid rgba(255,255,255,0.06)", background:"rgba(22,27,34,0.7)", overflowY:"auto", zIndex:10 }}>
            <div style={{ background:"rgba(108,99,255,0.12)", border:"1.5px solid rgba(108,99,255,0.3)", borderRadius:16, padding:14 }}>
              <div style={{ fontSize:11, color:"#aaa", marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>المهمة</div>
              <p style={{ fontSize:13, color:"#e0e0ff", lineHeight:1.7, marginBottom:12, fontWeight:600 }}>
                {questionActive ? "🎯 اجعل الروبوت يعرض قلباً وينتظر ثانيتين، ثم يمسح الشاشة." : "انقر على 'ابدأ' لعرض السؤال الأول..."}
              </p>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setQuestionActive(true)} style={{ flex:1, background:questionActive?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6C63FF,#9C63FF)", border:"none", color:"#fff", borderRadius:10, padding:"7px 0", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", opacity:questionActive?0.45:1 }}>▶ ابدأ</button>
                <button onClick={() => setQuestionActive(false)} style={{ flex:1, background:questionActive?"rgba(255,107,107,0.2)":"rgba(255,255,255,0.05)", border:"1px solid rgba(255,107,107,0.3)", color:"#FF6B6B", borderRadius:10, padding:"7px 0", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", opacity:questionActive?1:0.4 }}>⏸ استأنف</button>
              </div>
            </div>

            <div style={{ background:"rgba(22,27,34,0.9)", border:`1.5px solid ${isConnected?"rgba(0,200,83,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:16, padding:14, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div style={{ animation:"float 3s ease-in-out infinite" }}>
                {isConnected ? <ConnectedRobotIcon /> : <RobotIcon />}
              </div>
              <div style={{ fontSize:12, color:isConnected?"#00C853":"#aaa", fontWeight:700 }}>
                {isConnected ? "✓ متصل بالروبوت" : "غير متصل"}
              </div>
              <button onClick={() => setIsConnected(v => !v)}
                style={{ width:"100%", padding:"9px 0", background:isConnected?"rgba(0,200,83,0.15)":"linear-gradient(135deg,#00b4db,#0083b0)", border:isConnected?"1.5px solid rgba(0,200,83,0.5)":"none", color:isConnected?"#00C853":"#fff", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", animation:isConnected?"pulse 2s infinite":"none" }}>
                {isConnected ? "🔌 قطع الاتصال" : "🔗 ربط الجهاز"}
              </button>
            </div>
          </div>

          {/* BLOCKLY AREA */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0, overflow:"hidden" }}>

            {/* Top bar */}
            <div style={{ height:52, flexShrink:0, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 16px", gap:10 }}>
              <button onClick={handleUndo} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:8, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><UndoIcon /></button>
              <button onClick={handleRedo} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:8, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><RedoIcon /></button>
              
              <button onClick={handleSave}
                style={{ background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.4)", color:"#a78bfa", borderRadius:10, padding:"7px 16px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", display:"flex", alignItems:"center", gap:7, transition:"all 0.18s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(108,99,255,0.28)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(108,99,255,0.15)"}
              >
                <SaveIcon />
                {saveStatus === "saved" ? "✅ تم الحفظ!" : "حفظ"}
              </button>
            </div>

            {/* BLOCKLY DIV + HINT OVERLAY */}
            <div style={{ flex:1, minHeight:0, minWidth:0, position:"relative" }}>

              {/* ── Empty workspace hint — hidden once blocks exist ── */}
              {blockCount === 0 && (
                <div style={{
                  position:"absolute", inset:0, display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  pointerEvents:"none", gap:20, zIndex:5,
                }}>
                 

                  {/* Main hint text */}
                  <div style={{ textAlign:"center", opacity:0.45 }}>
                    <p style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:"'Tajawal',sans-serif", marginBottom:8 }}>
                      أسقط الكتل هنا! 🧩
                    </p>
                    
                  </div>

                

                
                </div>
              )}

              <div ref={blocklyDivRef} style={{ position:"absolute", inset:0 }} />

              {/* Save toast */}
              {saveStatus === "saved" && (
                <div style={{ position:"absolute", bottom:80, left:"50%", transform:"translateX(-50%)", background:"rgba(108,99,255,0.95)", border:"1px solid #a78bfa", borderRadius:12, padding:"10px 22px", fontSize:14, fontWeight:800, color:"#fff", animation:"popIn 0.25s ease", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(108,99,255,0.5)", whiteSpace:"nowrap", zIndex:50 }}>
                  ✅ تم حفظ المشروع!
                </div>
              )}
            </div>

            {/* Run button */}
            <div style={{ padding:"12px 20px", flexShrink:0, background:"rgba(22,27,34,0.98)", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"flex-end" }}>
              <button onClick={handleRun}
                onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(0,200,83,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,200,83,0.35)"; }}
                style={{ background:"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:14, padding:"12px 32px", fontSize:16, fontWeight:800, cursor:"pointer", fontFamily:"'Fredoka One',cursive", letterSpacing:1, display:"flex", alignItems:"center", gap:10, boxShadow:"0 4px 20px rgba(0,200,83,0.35)", transition:"all 0.2s" }}>
                <PlayIcon /> ابدأ التشغيل
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
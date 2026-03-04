import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as Blockly from "blockly";
import { AccountMenu, useProfile } from "./useProfile";

const ArrowBackIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>);
const UndoIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>);
const RedoIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>);
const PlayIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>);
const SaveIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>);
const MenuIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>);

const RobotIcon = () => (
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

const ConnectedRobotIcon = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
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
  FULL:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  PLUS:[0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0],
  X:[1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
  FRAME:[1,1,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,1,1,1,1],
  HEART:[0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0],
  SMILE:[0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0],
  ARROW_UP:[0,0,1,0,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,0,0,1,0,0],
  ARROW_DOWN:[0,0,1,0,0,0,0,1,0,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0,0],
};

function generateLedIcon(patternKey, size=40) {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grid = LED_PATTERNS[patternKey];
  const padding = 2, dotSize = (size-padding*2)/5;
  ctx.fillStyle = "#1565c0"; ctx.roundRect(0,0,size,size,4); ctx.fill();
  for (let row=0; row<5; row++) for (let col=0; col<5; col++) {
    const lit = grid[row*5+col];
    ctx.beginPath();
    ctx.arc(padding+col*dotSize+dotSize*0.5, padding+row*dotSize+dotSize*0.5, dotSize*0.35, 0, Math.PI*2);
    ctx.fillStyle = lit?"#ffffff":"#1976d2"; ctx.fill();
  }
  return canvas.toDataURL("image/png");
}

function buildLedDropdownOptions() {
  return Object.keys(LED_PATTERNS).map(key => {
    const dataUri = generateLedIcon(key, 40);
    return [{ src:dataUri, width:40, height:40, alt:key }, key];
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
  def("play_melody",   function() { this.appendDummyInput().appendField("شغّل لحن").appendField(new Blockly.FieldDropdown([["دوري دو مي سول","DODO"],["ميلودي النجوم","STARS"],["نغمة البداية","STARTUP"]]),"MELODY"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#9c27b0"); });
  def("led_on",        function() { this.appendDummyInput().appendField("أضِئ x").appendField(new Blockly.FieldNumber(0,0,4),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,4),"Y"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#03a9f4"); });
  def("led_off",       function() { this.appendDummyInput().appendField("أطفئ x").appendField(new Blockly.FieldNumber(0,0,4),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,4),"Y"); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#03a9f4"); });
  def("math_operation",function() { this.appendDummyInput().appendField(new Blockly.FieldNumber(0),"A").appendField(new Blockly.FieldDropdown([["+","ADD"],["−","MINUS"],["×","MULTIPLY"],["÷","DIVIDE"]]),"OP").appendField(new Blockly.FieldNumber(0),"B"); this.setInputsInline(true); this.setOutput(true,"Number"); this.setColour("#5C81A6"); });
  def("math_random",   function() { this.appendDummyInput().appendField("عشوائي من").appendField(new Blockly.FieldNumber(1),"FROM").appendField("إلى").appendField(new Blockly.FieldNumber(10),"TO"); this.setOutput(true,"Number"); this.setColour("#5C81A6"); });

  let FieldLedMatrix;
  if (!Blockly.Blocks["__led_matrix_registered__"]) {
    FieldLedMatrix = class extends Blockly.Field {
      constructor(value) { super(value||"0".repeat(25)); this.SERIALIZABLE=true; this.CURSOR="default"; this.GRID_SIZE=5; this.CELL_SIZE=22; this.CELL_GAP=4; this.PADDING=8; this.cellRects_=[]; this.isDragging_=false; this.dragValue_=null; }
      static fromJson(o) { return new FieldLedMatrix(o["value"]); }
      getValue() { return this.value_||"0".repeat(25); }
      doClassValidation_(v) { if (typeof v!=="string"||v.length!==25||!/^[01]+$/.test(v)) return null; return v; }
      initView() { this.svgGroup_=Blockly.utils.dom.createSvgElement("g",{},this.fieldGroup_); this.updateSize_(); this.renderGrid_(); }
      updateSize_() { const t=this.GRID_SIZE*this.CELL_SIZE+(this.GRID_SIZE-1)*this.CELL_GAP+this.PADDING*2; this.size_.width=t; this.size_.height=t; }
      getIdxFromClient_(cx,cy) { const r=this.svgGroup_.getBoundingClientRect(); const step=this.CELL_SIZE+this.CELL_GAP; const col=Math.floor((cx-r.left-this.PADDING)/step); const row=Math.floor((cy-r.top-this.PADDING)/step); if (col<0||col>=this.GRID_SIZE||row<0||row>=this.GRID_SIZE) return -1; return row*this.GRID_SIZE+col; }
      toggleCell_(idx,forced) { if (idx<0) return; const arr=this.getValue().split(""); arr[idx]=forced!==undefined?forced:(arr[idx]==="1"?"0":"1"); this.setValue(arr.join("")); }
      renderGrid_() {
        while (this.svgGroup_.firstChild) this.svgGroup_.removeChild(this.svgGroup_.firstChild);
        this.cellRects_=[];
        const grid=this.getValue(); const step=this.CELL_SIZE+this.CELL_GAP;
        for (let row=0;row<this.GRID_SIZE;row++) for (let col=0;col<this.GRID_SIZE;col++) {
          const idx=row*this.GRID_SIZE+col;
          const rect=Blockly.utils.dom.createSvgElement("rect",{x:this.PADDING+col*step,y:this.PADDING+row*step,width:this.CELL_SIZE,height:this.CELL_SIZE,rx:4,ry:4,fill:grid[idx]==="1"?"#ffffff":"#2196f3",stroke:"rgba(0,0,0,0.2)","stroke-width":"1"},this.svgGroup_);
          this.cellRects_.push(rect);
        }
        const total=this.GRID_SIZE*this.CELL_SIZE+(this.GRID_SIZE-1)*this.CELL_GAP+this.PADDING*2;
        const overlay=Blockly.utils.dom.createSvgElement("rect",{x:0,y:0,width:total,height:total,fill:"transparent",style:"cursor:pointer;touch-action:none;"},this.svgGroup_);
        overlay.addEventListener("pointerdown",(e)=>{e.preventDefault();e.stopPropagation();overlay.setPointerCapture(e.pointerId);const idx=this.getIdxFromClient_(e.clientX,e.clientY);if(idx<0)return;const arr=this.getValue().split("");this.dragValue_=arr[idx]==="1"?"0":"1";this.isDragging_=true;this.toggleCell_(idx,this.dragValue_);});
        overlay.addEventListener("pointermove",(e)=>{if(!this.isDragging_)return;e.preventDefault();e.stopPropagation();this.toggleCell_(this.getIdxFromClient_(e.clientX,e.clientY),this.dragValue_);});
        overlay.addEventListener("pointerup",(e)=>{e.preventDefault();e.stopPropagation();this.isDragging_=false;this.dragValue_=null;});
      }
      doValueUpdate_(v) { super.doValueUpdate_(v); if (this.svgGroup_) { if (this.cellRects_.length===25){const g=v||"0".repeat(25);this.cellRects_.forEach((r,i)=>r.setAttribute("fill",g[i]==="1"?"#ffffff":"#2196f3"));}else{this.renderGrid_();}}}
      showEditor_() {}
    };
    try { Blockly.fieldRegistry.register("field_led_matrix",FieldLedMatrix); } catch(e) {}
    Blockly.Blocks["__led_matrix_registered__"]={ _class:FieldLedMatrix, init:function(){} };
  } else { FieldLedMatrix=Blockly.Blocks["__led_matrix_registered__"]._class; }

  def("show_leds_matrix",function(){this.appendDummyInput().appendField("اعرض LEDs");this.appendDummyInput().appendField(new FieldLedMatrix("0".repeat(25)),"MATRIX");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
}

const TOOLBOX = {
  kind:"categoryToolbox",
  contents:[
    {kind:"category",name:"⚙️ تحكم",colour:"#ff8c42",contents:[{kind:"block",type:"show_number"},{kind:"block",type:"show_leds"},{kind:"block",type:"show_leds_matrix"},{kind:"block",type:"show_text"},{kind:"block",type:"clear_screen"},{kind:"block",type:"forever"},{kind:"block",type:"on_start"},{kind:"block",type:"pause_ms"}]},
    {kind:"category",name:"🔁 كرر",colour:"#f4b400",contents:[{kind:"block",type:"repeat_times"},{kind:"block",type:"while_loop"}]},
    {kind:"category",name:"🎵 أصوات",colour:"#9c27b0",contents:[{kind:"block",type:"play_melody"}]},
    {kind:"category",name:"💡 أضواء",colour:"#03a9f4",contents:[{kind:"block",type:"led_on"},{kind:"block",type:"led_off"}]},
    {kind:"category",name:"🔢 حساب",colour:"#5C81A6",contents:[{kind:"block",type:"math_operation"},{kind:"block",type:"math_random"}]},
  ],
};

function getSaveKey(projectName) {
  const user = JSON.parse(localStorage.getItem("user")||"{}");
  const username = user?.username||"guest";
  const safeName = projectName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g,"_");
  return `blocks_save_${username}_${safeName}`;
}

export default function RobotApp() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const projectName = location.state?.projectName||"مشروعي 🚀";

  const blocklyDivRef = useRef(null);
  const workspaceRef  = useRef(null);

  const [isConnected,    setIsConnected]    = useState(false);
  const [questionActive, setQuestionActive] = useState(false);
  const [saveStatus,     setSaveStatus]     = useState("");
  const [blockCount,     setBlockCount]     = useState(0);
  const [showPanel,      setShowPanel]      = useState(false); // mobile bottom sheet

  useEffect(() => {
    registerBlocks();
    const div = blocklyDivRef.current;
    if (!div) return;

    const frameId = requestAnimationFrame(() => {
      workspaceRef.current = Blockly.inject(div, {
        toolbox: TOOLBOX,
        scrollbars: true,
        trashcan: true,
        zoom: { controls:true, wheel:true, startScale:0.9, maxScale:3, minScale:0.3, scaleSpeed:1.2 },
        grid: { spacing:20, length:3, colour:"rgba(255,255,255,0.05)", snap:true },
        theme: Blockly.Theme.defineTheme("darkTheme", {
          base: Blockly.Themes.Classic,
          componentStyles: {
            workspaceBackgroundColour:"#161b22",
            toolboxBackgroundColour:"#0d1117",
            toolboxForegroundColour:"#ffffff",
            flyoutBackgroundColour:"#1c2128",
            flyoutForegroundColour:"#ffffff",
            flyoutOpacity:0.97,
            scrollbarColour:"rgba(255,255,255,0.2)",
          },
        }),
      });
      Blockly.svgResize(workspaceRef.current);

      const key = getSaveKey(projectName);
      const savedXml = localStorage.getItem(key);
      if (savedXml) {
        try {
          const xml = Blockly.utils.xml.textToDom(savedXml);
          Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
        } catch(e) {}
      }

      workspaceRef.current.addChangeListener(() => {
        const count = workspaceRef.current?.getAllBlocks(false).length??0;
        setBlockCount(count);
      });
      setBlockCount(workspaceRef.current.getAllBlocks(false).length);
    });

    const onResize = () => { if (workspaceRef.current) Blockly.svgResize(workspaceRef.current); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (workspaceRef.current) { workspaceRef.current.dispose(); workspaceRef.current=null; }
    };
  }, []);

  const handleUndo = () => workspaceRef.current?.undo(false);
  const handleRedo = () => workspaceRef.current?.undo(true);

  const handleSave = () => {
    if (!workspaceRef.current) return;
    try {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      localStorage.setItem(getSaveKey(projectName), Blockly.utils.xml.domToText(xml));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2500);
    } catch(e) {}
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
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

        /* Hide left panel on small screens */
        @media (max-width: 640px) {
          .left-panel  { display:none !important; }
          .mobile-bar  { display:flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-bar  { display:none !important; }
        }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100vw", background:"#0d1117", color:"#fff", fontFamily:"'Tajawal',sans-serif", overflow:"hidden" }}>

        {/* APP BAR */}
        <div style={{ height:56, flexShrink:0, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 12px", gap:10, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,0.5)" }}>
          <button onClick={() => navigate("/home")}
            style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#fff", borderRadius:12, width:38, height:38, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, touchAction:"manipulation" }}>
            <ArrowBackIcon />
          </button>
          <div style={{ flex:1, textAlign:"center", minWidth:0 }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(14px,4vw,20px)", background:"linear-gradient(90deg,#6C63FF,#00E5FF,#FF6B6B)", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", display:"block" }}>
              {projectName}
            </span>
          </div>
          {/* Mobile: show panel button */}
          <button className="mobile-bar" onClick={() => setShowPanel(true)}
            style={{ background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.35)", color:"#fff", borderRadius:10, width:38, height:38, cursor:"pointer", alignItems:"center", justifyContent:"center", flexShrink:0, touchAction:"manipulation" }}>
            <MenuIcon />
          </button>
          {/* Desktop: account menu */}
          <div style={{ flexShrink:0 }}><AccountMenu navigate={navigate} /></div>
        </div>

        {/* TOOLBAR ROW */}
        <div style={{ height:48, flexShrink:0, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 12px", gap:8 }}>
          <button onClick={handleUndo} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:8, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", touchAction:"manipulation" }}><UndoIcon /></button>
          <button onClick={handleRedo} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:8, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", touchAction:"manipulation" }}><RedoIcon /></button>
          <button onClick={handleSave}
            style={{ background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.4)", color:"#a78bfa", borderRadius:10, padding:"7px 14px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", display:"flex", alignItems:"center", gap:6, touchAction:"manipulation" }}>
            <SaveIcon />
            <span>{saveStatus==="saved"?"✅ تم!":"حفظ"}</span>
          </button>
          <div style={{ flex:1 }}/>
          <button onClick={handleRun}
            style={{ background:"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:12, padding:"8px 18px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Fredoka One',cursive", display:"flex", alignItems:"center", gap:8, boxShadow:"0 3px 14px rgba(0,200,83,0.35)", touchAction:"manipulation" }}>
            <PlayIcon /> ابدأ
          </button>
        </div>

        {/* BODY */}
        <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>

          {/* LEFT PANEL — desktop only */}
          <div className="left-panel" style={{ width:190, flexShrink:0, display:"flex", flexDirection:"column", padding:12, gap:12, borderRight:"1px solid rgba(255,255,255,0.06)", background:"rgba(22,27,34,0.7)", overflowY:"auto", zIndex:10 }}>
            <div style={{ background:"rgba(108,99,255,0.12)", border:"1.5px solid rgba(108,99,255,0.3)", borderRadius:14, padding:12 }}>
              <div style={{ fontSize:11, color:"#aaa", marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>المهمة</div>
              <p style={{ fontSize:13, color:"#e0e0ff", lineHeight:1.7, marginBottom:10, fontWeight:600 }}>
                {questionActive ? "🎯 اجعل الروبوت يعرض قلباً وينتظر ثانيتين." : "انقر 'ابدأ' لعرض السؤال..."}
              </p>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setQuestionActive(true)} style={{ flex:1, background:questionActive?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6C63FF,#9C63FF)", border:"none", color:"#fff", borderRadius:10, padding:"7px 0", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", opacity:questionActive?0.45:1 }}>▶ ابدأ</button>
                <button onClick={() => setQuestionActive(false)} style={{ flex:1, background:questionActive?"rgba(255,107,107,0.2)":"rgba(255,255,255,0.05)", border:"1px solid rgba(255,107,107,0.3)", color:"#FF6B6B", borderRadius:10, padding:"7px 0", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", opacity:questionActive?1:0.4 }}>⏸ إيقاف</button>
              </div>
            </div>
            <div style={{ background:"rgba(22,27,34,0.9)", border:`1.5px solid ${isConnected?"rgba(0,200,83,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:14, padding:12, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div style={{ animation:"float 3s ease-in-out infinite" }}>{isConnected?<ConnectedRobotIcon/>:<RobotIcon/>}</div>
              <div style={{ fontSize:12, color:isConnected?"#00C853":"#aaa", fontWeight:700 }}>{isConnected?"✓ متصل":"غير متصل"}</div>
              <button onClick={() => setIsConnected(v => !v)}
                style={{ width:"100%", padding:"9px 0", background:isConnected?"rgba(0,200,83,0.15)":"linear-gradient(135deg,#00b4db,#0083b0)", border:isConnected?"1.5px solid rgba(0,200,83,0.5)":"none", color:isConnected?"#00C853":"#fff", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", animation:isConnected?"pulse 2s infinite":"none", touchAction:"manipulation" }}>
                {isConnected?"🔌 قطع الاتصال":"🔗 ربط الجهاز"}
              </button>
            </div>
          </div>

          {/* BLOCKLY AREA */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0, overflow:"hidden", position:"relative" }}>
            {blockCount === 0 && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:5, opacity:0.4 }}>
                <p style={{ fontSize:"clamp(16px,4vw,20px)", fontWeight:800, color:"#fff", fontFamily:"'Tajawal',sans-serif" }}>أسقط الكتل هنا! 🧩</p>
              </div>
            )}
            <div ref={blocklyDivRef} style={{ position:"absolute", inset:0 }} />
            {saveStatus==="saved" && (
              <div style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", background:"rgba(108,99,255,0.95)", border:"1px solid #a78bfa", borderRadius:12, padding:"10px 20px", fontSize:14, fontWeight:800, color:"#fff", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(108,99,255,0.5)", whiteSpace:"nowrap", zIndex:50, animation:"popIn 0.25s ease" }}>
                ✅ تم حفظ المشروع!
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM SHEET */}
        {showPanel && (
          <>
            <div onClick={() => setShowPanel(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200 }} />
            <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#161b22", borderTop:"1.5px solid rgba(108,99,255,0.3)", borderRadius:"20px 20px 0 0", padding:"20px 20px 32px", zIndex:210, animation:"slideUp 0.28s ease", display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#fff" }}>لوحة التحكم</span>
                <button onClick={() => setShowPanel(false)} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:10, width:32, height:32, cursor:"pointer", fontSize:15 }}>✕</button>
              </div>

              {/* Task */}
              <div style={{ background:"rgba(108,99,255,0.12)", border:"1.5px solid rgba(108,99,255,0.3)", borderRadius:14, padding:14 }}>
                <div style={{ fontSize:12, color:"#aaa", marginBottom:6, fontWeight:600 }}>المهمة</div>
                <p style={{ fontSize:13, color:"#e0e0ff", lineHeight:1.7, marginBottom:10, fontWeight:600 }}>
                  {questionActive ? "🎯 اجعل الروبوت يعرض قلباً وينتظر ثانيتين." : "انقر 'ابدأ' لعرض السؤال..."}
                </p>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setQuestionActive(true); setShowPanel(false); }} style={{ flex:1, background:"linear-gradient(135deg,#6C63FF,#9C63FF)", border:"none", color:"#fff", borderRadius:10, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>▶ ابدأ</button>
                  <button onClick={() => setQuestionActive(false)} style={{ flex:1, background:"rgba(255,107,107,0.15)", border:"1px solid rgba(255,107,107,0.3)", color:"#FF6B6B", borderRadius:10, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>⏸ إيقاف</button>
                </div>
              </div>

              {/* Connect */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(22,27,34,0.9)", border:`1.5px solid ${isConnected?"rgba(0,200,83,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:14, padding:"12px 16px" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:isConnected?"#00C853":"#aaa" }}>{isConnected?"✓ متصل بالروبوت":"غير متصل"}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600, marginTop:2 }}>الحالة الحالية</div>
                </div>
                <button onClick={() => setIsConnected(v => !v)}
                  style={{ background:isConnected?"rgba(0,200,83,0.15)":"linear-gradient(135deg,#00b4db,#0083b0)", border:isConnected?"1.5px solid rgba(0,200,83,0.5)":"none", color:isConnected?"#00C853":"#fff", borderRadius:12, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>
                  {isConnected?"🔌 قطع":"🔗 ربط"}
                </button>
              </div>

              {/* Run */}
              <button onClick={() => { handleRun(); setShowPanel(false); }}
                style={{ background:"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:14, padding:"14px 0", fontSize:16, fontWeight:800, cursor:"pointer", fontFamily:"'Fredoka One',cursive", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 20px rgba(0,200,83,0.4)", touchAction:"manipulation" }}>
                <PlayIcon /> ابدأ التشغيل
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
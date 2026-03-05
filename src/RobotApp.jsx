import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as Blockly from "blockly";
import { AccountMenu } from "./useProfile";
import { saveBlocks } from "./api";

const ArrowBackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>);
const UndoIcon      = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>);
const RedoIcon      = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>);
const PlayIcon      = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>);
const SaveIcon      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>);
const MenuIcon      = () => (<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>);

/* Responsive robot icon — uses % sizes, no fixed px */
const RobotIcon = ({ connected }) => (
  <svg viewBox="0 0 64 64" fill="none" style={{ width:"100%", height:"100%", maxWidth:64, maxHeight:64 }}>
    <rect x="16" y="20" width="32" height="28" rx="6" fill={connected?"#00C853":"#6C63FF"} stroke="#fff" strokeWidth="2"/>
    <rect x="22" y="26" width="8" height="8" rx="2" fill={connected?"#FFEB3B":"#00E5FF"}/>
    <rect x="34" y="26" width="8" height="8" rx="2" fill={connected?"#FFEB3B":"#00E5FF"}/>
    <rect x="24" y="38" width="16" height="4" rx="2" fill="#fff" opacity={connected?0.9:0.6}/>
    <rect x="28" y="10" width="8" height="10" rx="3" fill={connected?"#00C853":"#6C63FF"} stroke="#fff" strokeWidth="2"/>
    <circle cx="32" cy="9" r="3" fill={connected?"#FFEB3B":"#FF6B6B"}/>
    <rect x="4"  y="28" width="10" height="6" rx="3" fill={connected?"#00C853":"#6C63FF"} stroke="#fff" strokeWidth="2"/>
    <rect x="50" y="28" width="10" height="6" rx="3" fill={connected?"#00C853":"#6C63FF"} stroke="#fff" strokeWidth="2"/>
    <rect x="22" y="48" width="8" height="8" rx="3" fill={connected?"#00C853":"#6C63FF"} stroke="#fff" strokeWidth="2"/>
    <rect x="34" y="48" width="8" height="8" rx="3" fill={connected?"#00C853":"#6C63FF"} stroke="#fff" strokeWidth="2"/>
    {connected && <><circle cx="52" cy="14" r="6" fill="#FFEB3B"/><path d="M49 14l2 2 4-4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>}
  </svg>
);

/* ── LED patterns ── */
const LED_PATTERNS={FULL:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],PLUS:[0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0],X:[1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1],HEART:[0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0],SMILE:[0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0],ARROW_UP:[0,0,1,0,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,0,0,1,0,0]};
function genLedIcon(key,size=40){const c=document.createElement("canvas");c.width=c.height=size;const ctx=c.getContext("2d");const g=LED_PATTERNS[key];const pad=2,ds=(size-pad*2)/5;ctx.fillStyle="#1565c0";ctx.roundRect(0,0,size,size,4);ctx.fill();for(let r=0;r<5;r++)for(let col=0;col<5;col++){ctx.beginPath();ctx.arc(pad+col*ds+ds*.5,pad+r*ds+ds*.5,ds*.35,0,Math.PI*2);ctx.fillStyle=g[r*5+col]?"#fff":"#1976d2";ctx.fill();}return c.toDataURL();}
function buildLedOpts(){return Object.keys(LED_PATTERNS).map(k=>[{src:genLedIcon(k,40),width:40,height:40,alt:k},k]);}

function registerBlocks(){
  const def=(n,fn)=>{if(!Blockly.Blocks[n])Blockly.Blocks[n]={init:fn};};
  def("show_number",   function(){this.appendDummyInput().appendField("اعرض رقم").appendField(new Blockly.FieldNumber(0),"NUMBER");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("show_leds",     function(){this.appendDummyInput().appendField("اعرض أيقونة").appendField(new Blockly.FieldDropdown(buildLedOpts),"PATTERN");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("show_text",     function(){this.appendDummyInput().appendField("اعرض نص").appendField(new Blockly.FieldTextInput("مرحبا"),"TEXT");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("clear_screen",  function(){this.appendDummyInput().appendField("امسح الشاشة");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("forever",       function(){this.appendStatementInput("DO").appendField("دائماً");this.setColour("#ff8c42");});
  def("on_start",      function(){this.appendStatementInput("DO").appendField("عند البدء");this.setColour("#ff8c42");});
  def("pause_ms",      function(){this.appendDummyInput().appendField("انتظر").appendField(new Blockly.FieldNumber(100,0),"TIME").appendField("مللي ثانية");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("repeat_times",  function(){this.appendDummyInput().appendField("كرر").appendField(new Blockly.FieldNumber(10,1),"TIMES").appendField("مرات");this.appendStatementInput("DO").appendField("افعل");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("while_loop",    function(){this.appendValueInput("CONDITION").setCheck("Boolean").appendField("طالما");this.appendStatementInput("DO").appendField("افعل");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("play_melody",   function(){this.appendDummyInput().appendField("شغّل لحن").appendField(new Blockly.FieldDropdown([["دوري دو مي سول","DODO"],["ميلودي النجوم","STARS"],["نغمة البداية","STARTUP"]]),"MELODY");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#9c27b0");});
  def("led_on",        function(){this.appendDummyInput().appendField("أضِئ x").appendField(new Blockly.FieldNumber(0,0,4),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,4),"Y");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");});
  def("led_off",       function(){this.appendDummyInput().appendField("أطفئ x").appendField(new Blockly.FieldNumber(0,0,4),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,4),"Y");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");});
  def("math_operation",function(){this.appendDummyInput().appendField(new Blockly.FieldNumber(0),"A").appendField(new Blockly.FieldDropdown([["+","ADD"],["−","MINUS"],["×","MULTIPLY"],["÷","DIVIDE"]]),"OP").appendField(new Blockly.FieldNumber(0),"B");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("math_random",   function(){this.appendDummyInput().appendField("عشوائي من").appendField(new Blockly.FieldNumber(1),"FROM").appendField("إلى").appendField(new Blockly.FieldNumber(10),"TO");this.setOutput(true,"Number");this.setColour("#5C81A6");});

  let FLM;
  if(!Blockly.Blocks["__flm__"]){
    FLM=class extends Blockly.Field{
      constructor(v){super(v||"0".repeat(25));this.SERIALIZABLE=true;this.CURSOR="default";this.G=5;this.C=22;this.GAP=4;this.P=8;this.rects=[];this.drag=false;this.dv=null;}
      static fromJson(o){return new FLM(o["value"]);}
      getValue(){return this.value_||"0".repeat(25);}
      doClassValidation_(v){if(typeof v!=="string"||v.length!==25||!/^[01]+$/.test(v))return null;return v;}
      initView(){this.sg=Blockly.utils.dom.createSvgElement("g",{},this.fieldGroup_);this.updateSize_();this.renderGrid_();}
      updateSize_(){const t=this.G*this.C+(this.G-1)*this.GAP+this.P*2;this.size_.width=t;this.size_.height=t;}
      getIdx(cx,cy){const r=this.sg.getBoundingClientRect();const s=this.C+this.GAP;const col=Math.floor((cx-r.left-this.P)/s);const row=Math.floor((cy-r.top-this.P)/s);if(col<0||col>=this.G||row<0||row>=this.G)return -1;return row*this.G+col;}
      toggle(idx,forced){if(idx<0)return;const a=this.getValue().split("");a[idx]=forced!==undefined?forced:(a[idx]==="1"?"0":"1");this.setValue(a.join(""));}
      renderGrid_(){
        while(this.sg.firstChild)this.sg.removeChild(this.sg.firstChild);
        this.rects=[];const g=this.getValue();const s=this.C+this.GAP;
        for(let r=0;r<this.G;r++)for(let c=0;c<this.G;c++){const idx=r*this.G+c;const rect=Blockly.utils.dom.createSvgElement("rect",{x:this.P+c*s,y:this.P+r*s,width:this.C,height:this.C,rx:4,ry:4,fill:g[idx]==="1"?"#fff":"#2196f3",stroke:"rgba(0,0,0,0.2)","stroke-width":"1"},this.sg);this.rects.push(rect);}
        const t=this.G*this.C+(this.G-1)*this.GAP+this.P*2;
        const ov=Blockly.utils.dom.createSvgElement("rect",{x:0,y:0,width:t,height:t,fill:"transparent",style:"cursor:pointer;touch-action:none;"},this.sg);
        ov.addEventListener("pointerdown",(e)=>{e.preventDefault();e.stopPropagation();ov.setPointerCapture(e.pointerId);const idx=this.getIdx(e.clientX,e.clientY);if(idx<0)return;const a=this.getValue().split("");this.dv=a[idx]==="1"?"0":"1";this.drag=true;this.toggle(idx,this.dv);});
        ov.addEventListener("pointermove",(e)=>{if(!this.drag)return;e.preventDefault();e.stopPropagation();this.toggle(this.getIdx(e.clientX,e.clientY),this.dv);});
        ov.addEventListener("pointerup",(e)=>{e.preventDefault();e.stopPropagation();this.drag=false;this.dv=null;});
      }
      doValueUpdate_(v){super.doValueUpdate_(v);if(this.sg){if(this.rects.length===25){const g=v||"0".repeat(25);this.rects.forEach((r,i)=>r.setAttribute("fill",g[i]==="1"?"#fff":"#2196f3"));}else{this.renderGrid_();}}}
      showEditor_(){}
    };
    try{Blockly.fieldRegistry.register("field_led_matrix",FLM);}catch(e){}
    Blockly.Blocks["__flm__"]={_c:FLM,init:function(){}};
  }else{FLM=Blockly.Blocks["__flm__"]._c;}
  def("show_leds_matrix",function(){this.appendDummyInput().appendField("اعرض LEDs");this.appendDummyInput().appendField(new FLM("0".repeat(25)),"MATRIX");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
}

const TOOLBOX={kind:"categoryToolbox",contents:[
  {kind:"category",name:"⚙️ تحكم",colour:"#ff8c42",contents:[{kind:"block",type:"show_number"},{kind:"block",type:"show_leds"},{kind:"block",type:"show_leds_matrix"},{kind:"block",type:"show_text"},{kind:"block",type:"clear_screen"},{kind:"block",type:"forever"},{kind:"block",type:"on_start"},{kind:"block",type:"pause_ms"}]},
  {kind:"category",name:"🔁 كرر",colour:"#f4b400",contents:[{kind:"block",type:"repeat_times"},{kind:"block",type:"while_loop"}]},
  {kind:"category",name:"🎵 أصوات",colour:"#9c27b0",contents:[{kind:"block",type:"play_melody"}]},
  {kind:"category",name:"💡 أضواء",colour:"#03a9f4",contents:[{kind:"block",type:"led_on"},{kind:"block",type:"led_off"}]},
  {kind:"category",name:"🔢 حساب",colour:"#5C81A6",contents:[{kind:"block",type:"math_operation"},{kind:"block",type:"math_random"}]},
]};

export default function RobotApp() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const projectName = location.state?.projectName || "مشروعي 🚀";
  const projectId   = location.state?.projectId;    // MongoDB _id passed from HomePage

  const blocklyDivRef = useRef(null);
  const workspaceRef  = useRef(null);

  const [connected,  setConnected]  = useState(false);
  const [taskActive, setTaskActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");   // "" | "saving" | "saved" | "error"
  const [blockCount, setBlockCount] = useState(0);
  const [showPanel,  setShowPanel]  = useState(false);

  useEffect(() => {
    registerBlocks();
    const div = blocklyDivRef.current;
    if (!div) return;
    const fid = requestAnimationFrame(() => {
      workspaceRef.current = Blockly.inject(div, {
        toolbox:TOOLBOX, scrollbars:true, trashcan:true,
        zoom:{controls:true,wheel:true,startScale:0.9,maxScale:3,minScale:0.3,scaleSpeed:1.2},
        grid:{spacing:20,length:3,colour:"rgba(255,255,255,0.05)",snap:true},
        theme: Blockly.Theme.defineTheme("dark",{
          base:Blockly.Themes.Classic,
          componentStyles:{ workspaceBackgroundColour:"#161b22",toolboxBackgroundColour:"#0d1117",toolboxForegroundColour:"#ffffff",flyoutBackgroundColour:"#1c2128",flyoutForegroundColour:"#ffffff",flyoutOpacity:0.97,scrollbarColour:"rgba(255,255,255,0.2)" },
        }),
      });
      Blockly.svgResize(workspaceRef.current);

      // Load saved blocks from backend project object (passed via state or fall back to localStorage)
      const saved = location.state?.blocksSave || localStorage.getItem(`blocks_${projectId||projectName}`);
      if (saved) { try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(saved), workspaceRef.current); } catch(e){} }

      workspaceRef.current.addChangeListener(() => setBlockCount(workspaceRef.current?.getAllBlocks(false).length??0));
      setBlockCount(workspaceRef.current.getAllBlocks(false).length);
    });
    const onResize=()=>{ if(workspaceRef.current) Blockly.svgResize(workspaceRef.current); };
    window.addEventListener("resize",onResize);
    return()=>{ cancelAnimationFrame(fid); window.removeEventListener("resize",onResize); workspaceRef.current?.dispose(); workspaceRef.current=null; };
  }, []);

  const handleSave = async () => {
    if (!workspaceRef.current) return;
    try {
      const xml = Blockly.utils.xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current));
      setSaveStatus("saving");
      if (projectId) {
        await saveBlocks(projectId, xml);
      } else {
        localStorage.setItem(`blocks_${projectName}`, xml);   // fallback
      }
      setSaveStatus("saved"); setTimeout(()=>setSaveStatus(""),2500);
    } catch(e) { setSaveStatus("error"); setTimeout(()=>setSaveStatus(""),2500); }
  };

  const handleRun = () => alert(`✅ تم إرسال ${workspaceRef.current?.getAllBlocks(false).length||0} كتلة إلى الروبوت!`);

  const saveBtnLabel = saveStatus==="saving"?"جاري..." : saveStatus==="saved"?"✅ تم!" : saveStatus==="error"?"❌ خطأ" : "حفظ";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&family=Fredoka+One&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; width:100%; overflow:hidden; background:#0d1117; }
        .blocklyToolboxDiv      { background:#0d1117 !important; border-right:1px solid rgba(255,255,255,0.08) !important; }
        .blocklyTreeRow         { border-radius:8px !important; margin:2px 6px !important; transition:background 0.15s !important; }
        .blocklyTreeRow:hover   { background:rgba(255,255,255,0.07) !important; }
        .blocklyTreeSelected    { background:rgba(108,99,255,0.22) !important; border-left:3px solid #6C63FF !important; }
        .blocklyTreeLabel       { font-family:'Tajawal',sans-serif !important; font-size:13px !important; font-weight:700 !important; }
        .blocklyFlyoutBackground{ fill:#1c2128 !important; }
        .blocklyScrollbarHandle { fill:rgba(255,255,255,0.2) !important; }

        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(0,200,83,0.5)} 50%{box-shadow:0 0 0 8px rgba(0,200,83,0)} }
        @keyframes popIn   { 0%{opacity:0;transform:translateX(-50%) scale(0.82)} 100%{opacity:1;transform:translateX(-50%) scale(1)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        /* ─ Left panel ─ */
        .left-panel { width:200px; flex-shrink:0; display:flex; flex-direction:column; background:rgba(22,27,34,0.75); border-right:1px solid rgba(255,255,255,0.06); }
        .panel-scroll { flex:1; overflow-y:auto; padding:10px; scrollbar-width:thin; scrollbar-color:rgba(108,99,255,0.4) rgba(255,255,255,0.04); }
        .panel-scroll::-webkit-scrollbar { width:4px; }
        .panel-scroll::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.4); border-radius:2px; }

        /* Robot icon container — fluid size */
        .robot-icon-wrap { width:clamp(36px,8vw,56px); height:clamp(36px,8vw,56px); margin:0 auto; animation:float 3s ease-in-out infinite; }

        /* Landscape: narrow panel */
        @media (orientation:landscape) and (max-height:500px) {
          .left-panel  { width:150px !important; }
          .app-bar     { height:42px !important; }
          .toolbar-row { height:38px !important; }
        }
        /* Mobile: hide left panel, show menu btn */
        @media (max-width:640px) {
          .left-panel      { display:none !important; }
          .mobile-menu-btn { display:flex !important; }
        }
        @media (min-width:641px) { .mobile-menu-btn { display:none !important; } }

        /* Sheet */
        .sheet-scroll { overflow-y:auto; max-height:70vh; scrollbar-width:thin; scrollbar-color:rgba(108,99,255,0.4) transparent; }
        .sheet-scroll::-webkit-scrollbar { width:4px; }
        .sheet-scroll::-webkit-scrollbar-thumb { background:rgba(108,99,255,0.4); border-radius:2px; }
        
          .blocklyToolboxDiv {
            width: 110px !important;
            overflow: visible !important;
          }
          .blocklyTreeRow {
            width: 100% !important;
            padding-right: 8px !important;
            padding-left: 4px !important;
          }
          .blocklyTreeLabel {
            white-space: nowrap !important;
            overflow: visible !important;
            font-size: 12px !important;
          }
          .blocklyTreeRowContentContainer {
            overflow: visible !important;
          }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100vw", background:"#0d1117", color:"#fff", fontFamily:"'Tajawal',sans-serif", overflow:"hidden" }}>

        {/* APP BAR */}
        <div className="app-bar" style={{ height:52, flexShrink:0, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", padding:"0 12px", gap:10, zIndex:100, boxShadow:"0 2px 16px rgba(0,0,0,0.5)" }}>
          <button onClick={() => navigate("/home")} style={{ background:"rgba(255,255,255,0.08)", border:"none", color:"#fff", borderRadius:11, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, touchAction:"manipulation" }}><ArrowBackIcon/></button>
          <div style={{ flex:1, textAlign:"center", minWidth:0 }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(13px,3.5vw,19px)", background:"linear-gradient(90deg,#6C63FF,#00E5FF,#FF6B6B)", backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", display:"block" }}>{projectName}</span>
          </div>
          <button className="mobile-menu-btn" onClick={() => setShowPanel(true)} style={{ background:"rgba(108,99,255,0.15)", border:"1.5px solid rgba(108,99,255,0.35)", color:"#fff", borderRadius:10, width:36, height:36, cursor:"pointer", alignItems:"center", justifyContent:"center", flexShrink:0, touchAction:"manipulation" }}><MenuIcon/></button>
          <div style={{ flexShrink:0 }}><AccountMenu navigate={navigate}/></div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar-row" style={{ height:44, flexShrink:0, background:"rgba(22,27,34,0.98)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", padding:"0 10px", gap:7 }}>
          <button onClick={() => workspaceRef.current?.undo(false)} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", touchAction:"manipulation" }}><UndoIcon/></button>
          <button onClick={() => workspaceRef.current?.undo(true)}  style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", touchAction:"manipulation" }}><RedoIcon/></button>
          <button onClick={handleSave} disabled={saveStatus==="saving"} style={{ background:"rgba(108,99,255,0.14)", border:"1.5px solid rgba(108,99,255,0.38)", color:"#a78bfa", borderRadius:9, padding:"6px 12px", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", display:"flex", alignItems:"center", gap:5, touchAction:"manipulation", opacity:saveStatus==="saving"?0.7:1 }}>
            {saveStatus==="saving" ? <div style={{ width:12, height:12, border:"2px solid #a78bfa", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> : <SaveIcon/>}
            <span>{saveBtnLabel}</span>
          </button>
          <div style={{ flex:1 }}/>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:700 }}>{blockCount} كتلة</div>
          <button onClick={handleRun} style={{ background:"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:11, padding:"7px 16px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Fredoka One',cursive", display:"flex", alignItems:"center", gap:6, boxShadow:"0 3px 12px rgba(0,200,83,0.33)", touchAction:"manipulation" }}>
            <PlayIcon/> ابدأ
          </button>
        </div>

        {/* BODY */}
        <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>

          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="panel-scroll">
              {/* Task card */}
              <div style={{ background:"rgba(108,99,255,0.11)", border:"1.5px solid rgba(108,99,255,0.28)", borderRadius:13, padding:11, marginBottom:10 }}>
                <div style={{ fontSize:10, color:"#aaa", marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>المهمة</div>
                <p style={{ fontSize:12, color:"#e0e0ff", lineHeight:1.7, marginBottom:8, fontWeight:600 }}>
                  {taskActive ? "🎯 اجعل الروبوت يعرض قلباً وينتظر ثانيتين." : "انقر 'ابدأ' لعرض السؤال..."}
                </p>
                <div style={{ display:"flex", gap:5 }}>
                  <button onClick={() => setTaskActive(true)}  style={{ flex:1, background:taskActive?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6C63FF,#9C63FF)", border:"none", color:"#fff", borderRadius:9, padding:"6px 0", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", opacity:taskActive?0.4:1, touchAction:"manipulation" }}>▶ ابدأ</button>
                  <button onClick={() => setTaskActive(false)} style={{ flex:1, background:taskActive?"rgba(255,107,107,0.18)":"rgba(255,255,255,0.04)", border:"1px solid rgba(255,107,107,0.28)", color:"#FF6B6B", borderRadius:9, padding:"6px 0", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", opacity:taskActive?1:0.38, touchAction:"manipulation" }}>⏸ إيقاف</button>
                </div>
              </div>

              {/* Connect card */}
              <div style={{ background:"rgba(22,27,34,0.9)", border:`1.5px solid ${connected?"rgba(0,200,83,0.38)":"rgba(255,255,255,0.09)"}`, borderRadius:13, padding:11, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                {/* Responsive robot icon */}
                <div className="robot-icon-wrap"><RobotIcon connected={connected}/></div>
                <div style={{ fontSize:11, color:connected?"#00C853":"#aaa", fontWeight:700 }}>{connected?"✓ متصل":"غير متصل"}</div>
                <button onClick={() => setConnected(v=>!v)}
                  style={{ width:"100%", padding:"8px 0", background:connected?"rgba(0,200,83,0.13)":"linear-gradient(135deg,#00b4db,#0083b0)", border:connected?"1.5px solid rgba(0,200,83,0.45)":"none", color:connected?"#00C853":"#fff", borderRadius:9, fontSize:"clamp(10px,2.5vw,12px)", fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", animation:connected?"pulse 2s infinite":"none", touchAction:"manipulation" }}>
                  {connected?"🔌 قطع":"🔗 ربط الجهاز"}
                </button>
              </div>

              {/* Cloud save info */}
              {projectId && (
                <div style={{ marginTop:10, fontSize:10, color:"rgba(255,255,255,0.25)", textAlign:"center", fontWeight:600 }}>
                  ☁️ يُحفظ تلقائياً على الخادم
                </div>
              )}
            </div>
          </div>

          {/* BLOCKLY */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0, overflow:"hidden", position:"relative" }}>
            {blockCount === 0 && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:5, opacity:0.35 }}>
                <p style={{ fontSize:"clamp(14px,4vw,18px)", fontWeight:800, color:"#fff", fontFamily:"'Tajawal',sans-serif" }}>أسقط الكتل هنا! 🧩</p>
              </div>
            )}
            <div ref={blocklyDivRef} style={{ position:"absolute", inset:0 }}/>
            {(saveStatus==="saved"||saveStatus==="error") && (
              <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", background:saveStatus==="error"?"rgba(255,107,107,0.95)":"rgba(108,99,255,0.95)", border:`1px solid ${saveStatus==="error"?"#FF6B6B":"#a78bfa"}`, borderRadius:11, padding:"9px 18px", fontSize:13, fontWeight:800, color:"#fff", display:"flex", alignItems:"center", gap:7, boxShadow:"0 4px 20px rgba(0,0,0,0.4)", whiteSpace:"nowrap", zIndex:50, animation:"popIn 0.24s ease" }}>
                {saveStatus==="saved" ? "✅ تم الحفظ على الخادم!" : "❌ فشل الحفظ، تحقق من الاتصال"}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM SHEET */}
        {showPanel && (
          <>
            <div onClick={() => setShowPanel(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200 }}/>
            <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#161b22", borderTop:"1.5px solid rgba(108,99,255,0.3)", borderRadius:"18px 18px 0 0", zIndex:210, animation:"slideUp 0.26s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
                <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:17, color:"#fff" }}>لوحة التحكم</span>
                <button onClick={() => setShowPanel(false)} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"#fff", borderRadius:9, width:30, height:30, cursor:"pointer", fontSize:14 }}>✕</button>
              </div>
              <div className="sheet-scroll" style={{ padding:"14px 18px 32px", display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"rgba(108,99,255,0.11)", border:"1.5px solid rgba(108,99,255,0.28)", borderRadius:13, padding:13 }}>
                  <div style={{ fontSize:11, color:"#aaa", marginBottom:6, fontWeight:700 }}>المهمة</div>
                  <p style={{ fontSize:13, color:"#e0e0ff", lineHeight:1.7, marginBottom:10, fontWeight:600 }}>
                    {taskActive ? "🎯 اجعل الروبوت يعرض قلباً وينتظر ثانيتين." : "انقر 'ابدأ' لعرض السؤال..."}
                  </p>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => { setTaskActive(true); setShowPanel(false); }} style={{ flex:1, background:"linear-gradient(135deg,#6C63FF,#9C63FF)", border:"none", color:"#fff", borderRadius:10, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>▶ ابدأ</button>
                    <button onClick={() => setTaskActive(false)} style={{ flex:1, background:"rgba(255,107,107,0.14)", border:"1px solid rgba(255,107,107,0.28)", color:"#FF6B6B", borderRadius:10, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>⏸ إيقاف</button>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(22,27,34,0.9)", border:`1.5px solid ${connected?"rgba(0,200,83,0.38)":"rgba(255,255,255,0.09)"}`, borderRadius:13, padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:40, height:40 }}><RobotIcon connected={connected}/></div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:connected?"#00C853":"#aaa" }}>{connected?"✓ متصل":"غير متصل"}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", fontWeight:600 }}>حالة الروبوت</div>
                    </div>
                  </div>
                  <button onClick={() => setConnected(v=>!v)} style={{ background:connected?"rgba(0,200,83,0.13)":"linear-gradient(135deg,#00b4db,#0083b0)", border:connected?"1.5px solid rgba(0,200,83,0.45)":"none", color:connected?"#00C853":"#fff", borderRadius:11, padding:"9px 14px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Tajawal',sans-serif", touchAction:"manipulation" }}>
                    {connected?"🔌 قطع":"🔗 ربط"}
                  </button>
                </div>
                <button onClick={() => { handleRun(); setShowPanel(false); }} style={{ background:"linear-gradient(135deg,#00C853,#00897B)", border:"none", color:"#fff", borderRadius:13, padding:"13px 0", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Fredoka One',cursive", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 18px rgba(0,200,83,0.38)", touchAction:"manipulation" }}>
                  <PlayIcon/> ابدأ التشغيل
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
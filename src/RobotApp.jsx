import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as Blockly from "blockly";

import { saveBlocks, loadBlocks } from "./api";

const ArrowBackIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>);
const UndoIcon      = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>);
const RedoIcon      = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>);
const PlayIcon      = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>);
const SaveIcon      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>);
const CheckIcon     = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>);
const MenuIcon      = () => (<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>);

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

// ── 8x8 LED face patterns ─────────────────────────────────────────────────────
const FACE_PATTERNS = {
  SMILE:     [0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
  BIG_SMILE: [0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
  SAD:       [0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  SURPRISED: [0,0,1,0,0,1,0,0,0,1,1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0],
  NEUTRAL:   [0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  WINK:      [0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
  ANGRY:     [1,0,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  LOVE:      [0,1,1,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  CONFUSED:  [0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
  COOL:      [0,1,1,0,0,1,1,0,1,1,1,0,0,1,1,1,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
};
const FACE_LABELS = {SMILE:"سعيد",BIG_SMILE:"مبتهج",SAD:"حزين",SURPRISED:"متفاجئ",NEUTRAL:"محايد",WINK:"غمزة",ANGRY:"غاضب",LOVE:"محب",CONFUSED:"محتار",COOL:"رائع"};
function genFaceIcon(key,size=44){
  const c=document.createElement("canvas");c.width=c.height=size;
  const ctx=c.getContext("2d");const g=FACE_PATTERNS[key];
  const G=8,pad=3,gap=1;const cell=(size-pad*2-gap*(G-1))/G;
  ctx.fillStyle="#0a1628";ctx.roundRect(0,0,size,size,5);ctx.fill();
  for(let r=0;r<G;r++)for(let col=0;col<G;col++){
    const x=pad+col*(cell+gap),y=pad+r*(cell+gap);
    ctx.beginPath();ctx.roundRect(x,y,cell,cell,2);
    ctx.fillStyle=g[r*G+col]?"#00e5ff":"#0d2137";ctx.fill();
  }
  return c.toDataURL();
}
function buildFaceOpts(){return Object.keys(FACE_PATTERNS).map(k=>[{src:genFaceIcon(k,44),width:44,height:44,alt:FACE_LABELS[k]},k]);}

// ─────────────────────────────────────────────────────────────────────────────
function registerBlocks(){
  const def=(n,fn)=>{if(!Blockly.Blocks[n])Blockly.Blocks[n]={init:fn};};

  // Arabic overrides
  Blockly.Blocks["logic_boolean"]={init:function(){this.appendDummyInput().appendField(new Blockly.FieldDropdown([["صحيح","TRUE"],["خطأ","FALSE"]]),"BOOL");this.setOutput(true,"Boolean");this.setColour("#5C81A6");}};
  Blockly.Blocks["literal_number"]={init:function(){this.appendDummyInput().appendField(new Blockly.FieldNumber(0),"NUM");this.setOutput(true,"Number");this.setColour("#5C81A6");}};
  Blockly.Blocks["literal_text"]={init:function(){this.appendDummyInput().appendField('"').appendField(new Blockly.FieldTextInput("نص"),"TEXT").appendField('"');this.setOutput(true,"String");this.setColour("#5C81A6");}};
  Blockly.Blocks["literal_bool"]={init:function(){this.appendDummyInput().appendField(new Blockly.FieldDropdown([["صحيح","TRUE"],["خطأ","FALSE"]]),"BOOL");this.setOutput(true,"Boolean");this.setColour("#5C81A6");}};

  // ── Movement ────────────────────────────────────────────────────────────
  def("move_forward",function(){this.appendDummyInput().appendField("تقدم إلى الأمام بقوة").appendField(new Blockly.FieldNumber(50,0,100),"POWER").appendField("% لمدة").appendField(new Blockly.FieldNumber(1,0),"DURATION").appendField("ثانية");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("move_backward",function(){this.appendDummyInput().appendField("ارجع إلى الوراء بقوة").appendField(new Blockly.FieldNumber(50,0,100),"POWER").appendField("% لمدة").appendField(new Blockly.FieldNumber(1,0),"DURATION").appendField("ثانية");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("turn_right",function(){this.appendDummyInput().appendField("انعطف إلى اليمين بقوة").appendField(new Blockly.FieldNumber(50,0,100),"POWER").appendField("% لمدة").appendField(new Blockly.FieldNumber(1,0),"DURATION").appendField("ثانية");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("turn_left",function(){this.appendDummyInput().appendField("انعطف إلى اليسار بقوة").appendField(new Blockly.FieldNumber(50,0,100),"POWER").appendField("% لمدة").appendField(new Blockly.FieldNumber(1,0),"DURATION").appendField("ثانية");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("dance",function(){this.appendDummyInput().appendField("ارقص");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});
  def("stop_move",function(){this.appendDummyInput().appendField("توقف عن التحرك لمدة").appendField(new Blockly.FieldNumber(1,0),"DURATION").appendField("ثانية");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#ff8c42");});

  // ── Display ─────────────────────────────────────────────────────────────
  def("show_text_screen",function(){this.appendDummyInput().appendField("اعرض النص").appendField(new Blockly.FieldTextInput("مرحبا"),"TEXT").appendField("على الشاشة");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("show_number_screen",function(){this.appendDummyInput().appendField("اعرض رقم").appendField(new Blockly.FieldNumber(0),"NUM").appendField("على الشاشة");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("show_leds",function(){this.appendDummyInput().appendField("اعرض أيقونة").appendField(new Blockly.FieldDropdown(buildFaceOpts),"PATTERN");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("clear_screen",function(){this.appendDummyInput().appendField("امسح الشاشة");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("led_on",function(){this.appendDummyInput().appendField("أضِئ x").appendField(new Blockly.FieldNumber(0,0,7),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,7),"Y");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("led_off",function(){this.appendDummyInput().appendField("أطفئ x").appendField(new Blockly.FieldNumber(0,0,7),"X").appendField("y").appendField(new Blockly.FieldNumber(0,0,7),"Y");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("led_on_range",function(){this.appendDummyInput().appendField("أضِئ من x").appendField(new Blockly.FieldNumber(0,0,7),"X1").appendField("y").appendField(new Blockly.FieldNumber(0,0,7),"Y1").appendField("إلى x").appendField(new Blockly.FieldNumber(7,0,7),"X2").appendField("y").appendField(new Blockly.FieldNumber(7,0,7),"Y2");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});
  def("led_off_range",function(){this.appendDummyInput().appendField("أطفئ من x").appendField(new Blockly.FieldNumber(0,0,7),"X1").appendField("y").appendField(new Blockly.FieldNumber(0,0,7),"Y1").appendField("إلى x").appendField(new Blockly.FieldNumber(7,0,7),"X2").appendField("y").appendField(new Blockly.FieldNumber(7,0,7),"Y2");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});

  // LED Matrix custom field
  let FLM;
  if(!Blockly.Blocks["__flm__"]){
    FLM=class extends Blockly.Field{
      constructor(v){super(v||"0".repeat(64));this.SERIALIZABLE=true;this.CURSOR="default";this.G=8;this.C=18;this.GAP=3;this.P=6;this.rects=[];this.drag=false;this.dv=null;}
      static fromJson(o){return new FLM(o["value"]);}
      getValue(){return this.value_||"0".repeat(64);}
      doClassValidation_(v){if(typeof v!=="string"||v.length!==64||!/^[01]+$/.test(v))return null;return v;}
      initView(){this.sg=Blockly.utils.dom.createSvgElement("g",{},this.fieldGroup_);this.updateSize_();this.renderGrid_();}
      updateSize_(){const t=this.G*this.C+(this.G-1)*this.GAP+this.P*2;this.size_.width=t;this.size_.height=t;}
      getIdx(cx,cy){const r=this.sg.getBoundingClientRect();const s=this.C+this.GAP;const col=Math.floor((cx-r.left-this.P)/s);const row=Math.floor((cy-r.top-this.P)/s);if(col<0||col>=this.G||row<0||row>=this.G)return -1;return row*this.G+col;}
      toggle(idx,forced){if(idx<0)return;const a=this.getValue().split("");a[idx]=forced!==undefined?forced:(a[idx]==="1"?"0":"1");this.setValue(a.join(""));}
      renderGrid_(){
        while(this.sg.firstChild)this.sg.removeChild(this.sg.firstChild);this.rects=[];
        const g=this.getValue();const s=this.C+this.GAP;
        for(let r=0;r<this.G;r++)for(let c=0;c<this.G;c++){const idx=r*this.G+c;const rect=Blockly.utils.dom.createSvgElement("rect",{x:this.P+c*s,y:this.P+r*s,width:this.C,height:this.C,rx:3,ry:3,fill:g[idx]==="1"?"#fff":"#2196f3",stroke:"rgba(0,0,0,0.2)","stroke-width":"1"},this.sg);this.rects.push(rect);}
        const t=this.G*this.C+(this.G-1)*this.GAP+this.P*2;
        const ov=Blockly.utils.dom.createSvgElement("rect",{x:0,y:0,width:t,height:t,fill:"transparent",style:"cursor:pointer;touch-action:none;"},this.sg);
        ov.addEventListener("pointerdown",(e)=>{e.preventDefault();e.stopPropagation();ov.setPointerCapture(e.pointerId);const idx=this.getIdx(e.clientX,e.clientY);if(idx<0)return;const a=this.getValue().split("");this.dv=a[idx]==="1"?"0":"1";this.drag=true;this.toggle(idx,this.dv);});
        ov.addEventListener("pointermove",(e)=>{if(!this.drag)return;e.preventDefault();e.stopPropagation();this.toggle(this.getIdx(e.clientX,e.clientY),this.dv);});
        ov.addEventListener("pointerup",(e)=>{e.preventDefault();e.stopPropagation();this.drag=false;this.dv=null;});
      }
      doValueUpdate_(v){super.doValueUpdate_(v);if(this.sg){if(this.rects.length===64){const g=v||"0".repeat(64);this.rects.forEach((r,i)=>r.setAttribute("fill",g[i]==="1"?"#fff":"#2196f3"));}else{this.renderGrid_();}}}
      showEditor_(){}
    };
    try{Blockly.fieldRegistry.register("field_led_matrix",FLM);}catch(e){}
    Blockly.Blocks["__flm__"]={_c:FLM,init:function(){}};
  }else{FLM=Blockly.Blocks["__flm__"]._c;}
  def("show_leds_matrix",function(){this.appendDummyInput().appendField("اعرض LEDs");this.appendDummyInput().appendField(new FLM("0".repeat(64)),"MATRIX");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#f4b400");});

  // ── if / expandable ─────────────────────────────────────────────────────
  def("if_expandable",function(){
    this.elseIfCount_=0;this.hasElse_=false;this.elseIfIndices_=[];
    const plusSVG="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='white' stroke='rgba(0,0,0,0.15)' stroke-width='1'/><path d='M12 7v10M7 12h10' stroke='%2300897B' stroke-width='2.5' stroke-linecap='round'/></svg>";
    const minusSVG="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='white' stroke='rgba(0,0,0,0.15)' stroke-width='1'/><path d='M7 12h10' stroke='%23e53935' stroke-width='2.5' stroke-linecap='round'/></svg>";
    this.appendValueInput("CONDITION").setCheck("Boolean").appendField("إذا");
    this.appendDummyInput("THEN_LABEL").appendField("ثم");
    this.appendStatementInput("DO");
    this.appendDummyInput("PLUS_ROW").appendField(new Blockly.FieldImage(plusSVG,20,20,"+",()=>this.addBranch_()));
    this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");
    this.rebuild_=function(){
      const toRemove=[];
      for(const input of this.inputList){if(input.name!=="CONDITION"&&input.name!=="THEN_LABEL"&&input.name!=="DO")toRemove.push(input.name);}
      toRemove.forEach(name=>this.removeInput(name,true));
      for(const idx of this.elseIfIndices_){
        const inp=this.appendValueInput(`ELSEIF${idx}`).setCheck("Boolean").appendField(new Blockly.FieldImage(minusSVG,20,20,"-",()=>this.removeElseIf_(idx))).appendField("أخرى إذا");
        if(!inp.connection.targetBlock()){try{const s=this.workspace.newBlock("logic_boolean");s.setFieldValue("FALSE","BOOL");s.setShadow(true);s.initSvg();s.render();s.outputConnection.connect(inp.connection);}catch(e){}}
        this.appendDummyInput(`ELSEIF_THEN${idx}`).appendField("ثم");
        this.appendStatementInput(`DO_ELSEIF${idx}`);
      }
      if(this.hasElse_){this.appendDummyInput("MINUS_ELSE").appendField(new Blockly.FieldImage(minusSVG,20,20,"-",()=>this.removeElse_())).appendField("أخرى");this.appendStatementInput("ELSE");}
      this.appendDummyInput("PLUS_ROW").appendField(new Blockly.FieldImage(plusSVG,20,20,"+",()=>this.addBranch_()));
    };
    this.addBranch_=function(){if(!this.hasElse_){this.hasElse_=true;}else{const idx=this.elseIfCount_++;this.elseIfIndices_.push(idx);}this.rebuild_();};
    this.removeElseIf_=function(idx){const i=this.getInput(`ELSEIF${idx}`);if(i?.connection?.targetBlock())i.connection.targetBlock().unplug(false);const s=this.getInput(`DO_ELSEIF${idx}`);if(s?.connection?.targetBlock())s.connection.targetBlock().unplug(false);this.elseIfIndices_=this.elseIfIndices_.filter(x=>x!==idx);this.rebuild_();};
    this.removeElse_=function(){const i=this.getInput("ELSE");if(i?.connection?.targetBlock())i.connection.targetBlock().unplug(false);this.hasElse_=false;this.rebuild_();};
  });

  // ── switch / اختر ─────────────────────────────────────────────────────
  // Shadows are injected via domToBlock (reliable at runtime) not workspace.newBlock in init.
  def("switch_block",function(){
    this.caseCount_=0;this.caseIndices_=[];this.hasDefault_=false;
    const plusSVG="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='white' stroke='rgba(0,0,0,0.15)' stroke-width='1'/><path d='M12 7v10M7 12h10' stroke='%2300897B' stroke-width='2.5' stroke-linecap='round'/></svg>";
    const minusSVG="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='white' stroke='rgba(0,0,0,0.15)' stroke-width='1'/><path d='M7 12h10' stroke='%23e53935' stroke-width='2.5' stroke-linecap='round'/></svg>";
    // Helper: attach a shadow literal_number to a value input connection
    const attachNumShadow=(conn)=>{
      if(!conn||conn.targetBlock())return;
      try{
        const xml=Blockly.utils.xml.textToDom('<xml><shadow type="literal_number"><field name="NUM">0</field></shadow></xml>');
        const s=Blockly.Xml.domToBlock(xml.firstChild,this.workspace);
        s.outputConnection.connect(conn);
      }catch(e){}
    };
    this.appendValueInput("EXPR").appendField("اختر");
    this.appendDummyInput("PLUS_ROW").appendField(new Blockly.FieldImage(plusSVG,20,20,"+",()=>this.addCase_()));
    this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");
    // Attach shadow to EXPR after block is rendered (first-change hook)
    this._exprShadowDone=false;
    this.setOnChange(function(e){
      if(!this._exprShadowDone){
        this._exprShadowDone=true;
        const inp=this.getInput("EXPR");
        if(inp)attachNumShadow(inp.connection);
      }
    });
    this.rebuild_=function(){
      const toRemove=[];
      for(const inp of this.inputList){if(inp.name!=="EXPR")toRemove.push(inp.name);}
      toRemove.forEach(n=>this.removeInput(n,true));
      for(const idx of this.caseIndices_){
        const vi=this.appendValueInput(`CASE_VAL${idx}`).appendField(new Blockly.FieldImage(minusSVG,20,20,"-",()=>this.removeCase_(idx))).appendField("حالة");
        this.appendStatementInput(`CASE_DO${idx}`).appendField("افعل");
        // attach shadow after rebuild via deferred call
        const conn=vi.connection;
        setTimeout(()=>attachNumShadow(conn),0);
      }
      if(this.hasDefault_){
        this.appendDummyInput("DEFAULT_LABEL").appendField(new Blockly.FieldImage(minusSVG,20,20,"-",()=>this.removeDefault_())).appendField("افتراضي");
        this.appendStatementInput("DEFAULT_DO").appendField("افعل");
      }
      this.appendDummyInput("PLUS_ROW").appendField(new Blockly.FieldImage(plusSVG,20,20,"+",()=>this.addCase_()));
    };
    this.addCase_=function(){
      if(!this.hasDefault_){this.hasDefault_=true;}
      else{const idx=this.caseCount_++;this.caseIndices_.push(idx);}
      this.rebuild_();
    };
    this.removeCase_=function(idx){
      const vi=this.getInput(`CASE_VAL${idx}`);if(vi?.connection?.targetBlock())vi.connection.targetBlock().unplug(false);
      const si=this.getInput(`CASE_DO${idx}`);if(si?.connection?.targetBlock())si.connection.targetBlock().unplug(false);
      this.caseIndices_=this.caseIndices_.filter(i=>i!==idx);this.rebuild_();
    };
    this.removeDefault_=function(){
      const si=this.getInput("DEFAULT_DO");if(si?.connection?.targetBlock())si.connection.targetBlock().unplug(false);
      this.hasDefault_=false;this.rebuild_();
    };
  });

  // ── Loops ────────────────────────────────────────────────────────────────

  def("repeat_times",function(){
    this.appendDummyInput().appendField("كرر").appendField(new Blockly.FieldNumber(10,1),"TIMES").appendField("مرات");
    this.appendStatementInput("DO").appendField("افعل");
    this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");
  });

  def("loop_forever",function(){
    this.appendStatementInput("DO").appendField("إلى الأبد");
    this.setColour("#03a9f4");
  });

  def("for_loop",function(){
    this.appendDummyInput().appendField("عد مع").appendField(new Blockly.FieldTextInput("i"),"VAR")
      .appendField("من").appendField(new Blockly.FieldNumber(0),"FROM")
      .appendField("إلى").appendField(new Blockly.FieldNumber(7),"TO")
      .appendField("بالخطوة").appendField(new Blockly.FieldNumber(1,1),"STEP");
    this.appendStatementInput("DO").appendField("افعل");
    this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");
  });

  // ── طالما — condition socket gets TRUE shadow via first-change hook ──────────
  def("while_loop",function(){
    this.appendValueInput("CONDITION").setCheck("Boolean").appendField("طالما");
    this.appendStatementInput("DO").appendField("افعل");
    this.setInputsInline(false);
    this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");
    this._condShadowDone=false;
    this.setOnChange(function(){
      if(this._condShadowDone)return;
      this._condShadowDone=true;
      const inp=this.getInput("CONDITION");
      if(!inp||inp.connection.targetBlock())return;
      try{
        const xml=Blockly.utils.xml.textToDom('<xml><shadow type="logic_boolean"><field name="BOOL">TRUE</field></shadow></xml>');
        const s=Blockly.Xml.domToBlock(xml.firstChild,this.workspace);
        s.outputConnection.connect(inp.connection);
      }catch(e){}
    });
  });

  // ── كرر / حتى — DO-WHILE — condition socket gets FALSE shadow via first-change hook ──
  def("repeat_until",function(){
    this.appendDummyInput("TOP_LABEL").appendField("كرر");
    this.appendStatementInput("DO").appendField("افعل");
    this.appendValueInput("CONDITION").setCheck("Boolean").appendField("حتى");
    this.setInputsInline(false);
    this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");
    this._condShadowDone=false;
    this.setOnChange(function(){
      if(this._condShadowDone)return;
      this._condShadowDone=true;
      const inp=this.getInput("CONDITION");
      if(!inp||inp.connection.targetBlock())return;
      try{
        const xml=Blockly.utils.xml.textToDom('<xml><shadow type="logic_boolean"><field name="BOOL">FALSE</field></shadow></xml>');
        const s=Blockly.Xml.domToBlock(xml.firstChild,this.workspace);
        s.outputConnection.connect(inp.connection);
      }catch(e){}
    });
  });

  def("loop_break",function(){this.appendDummyInput().appendField("استراحة");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");});
  def("loop_continue",function(){this.appendDummyInput().appendField("متابعة");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#03a9f4");});

  // ── Sound ────────────────────────────────────────────────────────────────
  def("play_melody",function(){this.appendDummyInput().appendField("شغّل لحن").appendField(new Blockly.FieldDropdown([["دوري دو مي سول","DODO"],["ميلودي النجوم","STARS"],["نغمة البداية","STARTUP"]]),"MELODY");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#9c27b0");});
  def("play_note",function(){
    this.appendDummyInput().appendField("شغّل نغمة")
      .appendField(new Blockly.FieldDropdown([["دو","C"],["ري","D"],["مي","E"],["فا","F"],["صول","G"],["لا","A"],["سي","B"]]),"NOTE")
      .appendField("مدة").appendField(new Blockly.FieldNumber(500,50,4000),"DURATION_MS").appendField("مللي‌ثانية");
    this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#9c27b0");
  });
  def("set_volume",function(){this.appendDummyInput().appendField("اضبط مستوى الصوت إلى").appendField(new Blockly.FieldNumber(50,0,100),"VOLUME").appendField("%");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#9c27b0");});
  def("speaker_off",function(){this.appendDummyInput().appendField("أطفئ مكبر الصوت 🔇");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#9c27b0");});
  def("speaker_on",function(){this.appendDummyInput().appendField("شغّل مكبر الصوت 🔊");this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#9c27b0");});

  // ── Variables ────────────────────────────────────────────────────────────
  def("var_set",function(){this.appendDummyInput().appendField("تعيين").appendField(new Blockly.FieldTextInput("i"),"VAR").appendField("إلى");this.appendValueInput("VALUE").setCheck("Number");this.setInputsInline(true);this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#e67e22");});
  def("var_change",function(){this.appendDummyInput().appendField("تغيير").appendField(new Blockly.FieldTextInput("i"),"VAR").appendField("بمقدار");this.appendValueInput("AMOUNT").setCheck("Number");this.setInputsInline(true);this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#e67e22");});
  def("var_set_string",function(){this.appendDummyInput().appendField("تعيين").appendField(new Blockly.FieldTextInput("ch"),"VAR").appendField("إلى");this.appendValueInput("VALUE").setCheck("String");this.setInputsInline(true);this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#e67e22");});
  def("var_set_bool",function(){this.appendDummyInput().appendField("تعيين").appendField(new Blockly.FieldTextInput("x"),"VAR").appendField("إلى");this.appendValueInput("VALUE").setCheck("Boolean");this.setInputsInline(true);this.setPreviousStatement(true);this.setNextStatement(true);this.setColour("#e67e22");});
  def("var_get",function(){this.appendDummyInput().appendField(new Blockly.FieldTextInput("i"),"VAR");this.setOutput(true,null);this.setColour("#e67e22");});
  def("literal_text",function(){this.appendDummyInput().appendField('"').appendField(new Blockly.FieldTextInput("نص"),"TEXT").appendField('"');this.setOutput(true,"String");this.setColour("#e67e22");});
  def("literal_number",function(){this.appendDummyInput().appendField(new Blockly.FieldNumber(0),"NUM");this.setOutput(true,"Number");this.setColour("#e67e22");});
  def("literal_bool",function(){this.appendDummyInput().appendField(new Blockly.FieldDropdown([["صحيح","TRUE"],["خطأ","FALSE"]]),"BOOL");this.setOutput(true,"Boolean");this.setColour("#e67e22");});

  // ── Operators ────────────────────────────────────────────────────────────
  def("op_add",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("+");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("op_subtract",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("-");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("op_multiply",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("×");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("op_divide",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("÷");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("op_modulo",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("mod");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("math_random",function(){this.appendDummyInput().appendField("عشوائي من").appendField(new Blockly.FieldNumber(1),"FROM").appendField("إلى").appendField(new Blockly.FieldNumber(10),"TO");this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("math_abs",function(){this.appendValueInput("A").setCheck("Number").appendField("قيمة مطلقة");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  // math_round REMOVED
  def("op_less",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("<");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_greater",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField(">");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_equals",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("=");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_lte",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("<=");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_gte",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField(">=");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_not_equal",function(){this.appendValueInput("A").setCheck("Number");this.appendDummyInput().appendField("≠");this.appendValueInput("B").setCheck("Number");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_and",function(){this.appendValueInput("A").setCheck("Boolean");this.appendDummyInput().appendField("و");this.appendValueInput("B").setCheck("Boolean");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_or",function(){this.appendValueInput("A").setCheck("Boolean");this.appendDummyInput().appendField("أو");this.appendValueInput("B").setCheck("Boolean");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_not",function(){this.appendValueInput("A").setCheck("Boolean").appendField("ليس");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_length",function(){this.appendValueInput("TEXT").setCheck("String").appendField("طول");this.setInputsInline(true);this.setOutput(true,"Number");this.setColour("#5C81A6");});
  def("op_contains",function(){this.appendValueInput("TEXT").setCheck("String");this.appendDummyInput().appendField("يحتوي");this.appendValueInput("SEARCH").setCheck("String");this.appendDummyInput().appendField("؟");this.setInputsInline(true);this.setOutput(true,"Boolean");this.setColour("#5C81A6");});
  def("op_concat",function(){this.appendValueInput("A").setCheck("String");this.appendDummyInput().appendField("+");this.appendValueInput("B").setCheck("String");this.setInputsInline(true);this.setOutput(true,"String");this.setColour("#5C81A6");});
}

// ── Shadow helpers ────────────────────────────────────────────────────────────
const numShadow  = (n=0)    => `<shadow type="literal_number"><field name="NUM">${n}</field></shadow>`;
const boolShadow = (v="TRUE")=> `<shadow type="logic_boolean"><field name="BOOL">${v}</field></shadow>`;
const strShadow  = (t="نص") => `<shadow type="literal_text"><field name="TEXT">${t}</field></shadow>`;
const xmlBlock   = (type,inner="") => ({kind:"block",type,blockxml:`<block type="${type}">${inner}</block>`});

const TOOLBOX={kind:"categoryToolbox",contents:[
  {kind:"category",name:"⚙️ تحكم",colour:"#ff8c42",contents:[
    {kind:"block",type:"move_forward"},
    {kind:"block",type:"move_backward"},
    {kind:"block",type:"turn_right"},
    {kind:"block",type:"turn_left"},
    {kind:"block",type:"dance"},
    {kind:"block",type:"stop_move"},
  ]},
  {kind:"category",name:"🔁 كرر",colour:"#03a9f4",contents:[
    // if
    xmlBlock("if_expandable",`<value name="CONDITION">${boolShadow()}</value>`),
    // switch — EXPR gets a number shadow
    xmlBlock("switch_block",`<value name="EXPR">${numShadow(0)}</value>`),
    // loops
    {kind:"block",type:"repeat_times"},
    {kind:"block",type:"loop_forever"},
    {kind:"block",type:"for_loop"},
    // while — shadow defined in toolbox xml AND via setOnChange hook
    xmlBlock("while_loop",`<value name="CONDITION">${boolShadow("TRUE")}</value>`),
    // do-while — shadow defined in toolbox xml AND via setOnChange hook
    xmlBlock("repeat_until",`<value name="CONDITION">${boolShadow("FALSE")}</value>`),
    {kind:"block",type:"loop_break"},
    {kind:"block",type:"loop_continue"},
  ]},
  {kind:"category",name:"🎵 أصوات",colour:"#9c27b0",contents:[
    {kind:"block",type:"play_melody"},
    {kind:"block",type:"play_note"},
    {kind:"block",type:"set_volume"},
    {kind:"block",type:"speaker_off"},
    {kind:"block",type:"speaker_on"},
  ]},
  {kind:"category",name:"💡 أضواء",colour:"#f4b400",contents:[
    {kind:"block",type:"show_text_screen"},
    {kind:"block",type:"show_number_screen"},
    {kind:"block",type:"show_leds"},
    {kind:"block",type:"show_leds_matrix"},
    {kind:"block",type:"clear_screen"},
    {kind:"block",type:"led_on"},
    {kind:"block",type:"led_off"},
    {kind:"block",type:"led_on_range"},
    {kind:"block",type:"led_off_range"},
  ]},
  // ❌ حساسات category REMOVED
  {kind:"category",name:"📦 المتغيرات",colour:"#e67e22",contents:[
    {kind:"label",text:"── أعداد ──"},
    xmlBlock("var_set",       `<value name="VALUE">${numShadow(0)}</value>`),
    xmlBlock("var_change",    `<value name="AMOUNT">${numShadow(1)}</value>`),
    {kind:"block",type:"var_get"},
    {kind:"label",text:"── نصوص ──"},
    xmlBlock("var_set_string",`<value name="VALUE">${strShadow()}</value>`),
    {kind:"label",text:"── منطقية ──"},
    xmlBlock("var_set_bool",  `<value name="VALUE">${boolShadow("TRUE")}</value>`),
    {kind:"label",text:"── قيم مباشرة ──"},
    {kind:"block",type:"literal_text"},
    {kind:"block",type:"literal_number"},
    {kind:"block",type:"literal_bool"},
  ]},
  {kind:"category",name:"🔢 المشغلات",colour:"#5C81A6",contents:[
    {kind:"label",text:"── حساب ──"},
    xmlBlock("op_add",      `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    xmlBlock("op_subtract", `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    xmlBlock("op_multiply", `<value name="A">${numShadow(1)}</value><value name="B">${numShadow(1)}</value>`),
    xmlBlock("op_divide",   `<value name="A">${numShadow(1)}</value><value name="B">${numShadow(1)}</value>`),
    xmlBlock("op_modulo",   `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(2)}</value>`),
    {kind:"block",type:"math_random"},
    xmlBlock("math_abs",    `<value name="A">${numShadow(0)}</value>`),
    // math_round REMOVED from toolbox
    {kind:"label",text:"── مقارنة ──"},
    xmlBlock("op_less",     `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    xmlBlock("op_greater",  `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    xmlBlock("op_lte",      `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    xmlBlock("op_gte",      `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    xmlBlock("op_equals",   `<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    xmlBlock("op_not_equal",`<value name="A">${numShadow(0)}</value><value name="B">${numShadow(0)}</value>`),
    {kind:"label",text:"── منطق ──"},
    xmlBlock("op_and",`<value name="A">${boolShadow()}</value><value name="B">${boolShadow()}</value>`),
    xmlBlock("op_or", `<value name="A">${boolShadow()}</value><value name="B">${boolShadow()}</value>`),
    xmlBlock("op_not",`<value name="A">${boolShadow()}</value>`),
    {kind:"label",text:"── نصوص ──"},
    xmlBlock("op_length",  `<value name="TEXT">${strShadow()}</value>`),
    xmlBlock("op_contains",`<value name="TEXT">${strShadow()}</value><value name="SEARCH">${strShadow("ابحث")}</value>`),
    xmlBlock("op_concat",  `<value name="A">${strShadow("مرحبا ")}</value><value name="B">${strShadow("عالم")}</value>`),
  ]},
  // ❌ دوال category REMOVED
]};

// ── Save button ───────────────────────────────────────────────────────────────
function SaveButton({saving,saved,onSave,disabled,style={}}){
  return(
    <button onClick={onSave} disabled={saving||disabled} style={{
      height:38,borderRadius:9,padding:"0 14px",gap:6,fontWeight:900,fontSize:13,
      background:saved?"linear-gradient(135deg,#00E676,#00897B)":"linear-gradient(135deg,#1565c0,#0d47a1)",
      border:"none",color:"white",
      boxShadow:saved?"0 3px 12px rgba(0,230,118,0.4)":"0 3px 12px rgba(21,101,192,0.4)",
      opacity:saving?0.7:1,cursor:disabled?"not-allowed":"pointer",
      display:"flex",alignItems:"center",justifyContent:"center",
      flexShrink:0,transition:"background 0.3s",fontFamily:"'Tajawal',sans-serif",
      touchAction:"manipulation",...style,
    }}>
      {saving?<div style={{width:15,height:15,border:"2.5px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>:saved?<CheckIcon/>:<SaveIcon/>}
      حفظ
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RobotApp(){
  const navigate    = useNavigate();
  const location    = useLocation();
  const projectName = location.state?.projectName||"مشروعي 🚀";
  const projectId   = location.state?.projectId;

  const blocklyDivRef = useRef(null);
  const workspaceRef  = useRef(null);
  const textareaRef   = useRef(null);
  const gutterRef     = useRef(null);

  const [connected,   setConnected]   = useState(false);
  const [taskActive,  setTaskActive]  = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [blockCount,  setBlockCount]  = useState(0);
  const [showPanel,   setShowPanel]   = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [view,        setView]        = useState("blocks");
  const [pythonCode,  setPythonCode]  = useState("");
  const [copied,      setCopied]      = useState(false);

  const lineCount = pythonCode.split("\n").length;

  const loadXml=(xml)=>{
    if(!xml||!workspaceRef.current)return;
    try{Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml),workspaceRef.current);}catch(e){}
  };

  useEffect(()=>{
    registerBlocks();
    const div=blocklyDivRef.current;
    if(!div)return;
    const fixH=()=>{const tb=div.querySelector('.blocklyToolboxDiv');if(tb)tb.style.height=div.clientHeight+'px';};
    const fid=requestAnimationFrame(async()=>{
      workspaceRef.current=Blockly.inject(div,{
        toolbox:TOOLBOX,scrollbars:true,trashcan:true,rtl:true,
        zoom:{controls:true,wheel:true,startScale:0.9,maxScale:3,minScale:0.3,scaleSpeed:1.2},
        grid:{spacing:20,length:3,colour:"rgba(255,255,255,0.05)",snap:true},
        theme:Blockly.Theme.defineTheme("dark",{
          base:Blockly.Themes.Classic,
          componentStyles:{workspaceBackgroundColour:"#161b22",toolboxBackgroundColour:"#0d1117",toolboxForegroundColour:"#ffffff",flyoutBackgroundColour:"#1c2128",flyoutForegroundColour:"#ffffff",flyoutOpacity:0.97,scrollbarColour:"rgba(255,255,255,0.2)"},
        }),
      });
      Blockly.svgResize(workspaceRef.current);fixH();
      workspaceRef.current.addChangeListener(()=>setBlockCount(workspaceRef.current?.getAllBlocks(false).length??0));
      if(projectId){try{const data=await loadBlocks(projectId);if(data?.blocksSave)loadXml(data.blocksSave);}catch(e){}}
      setLoadingData(false);
      setBlockCount(workspaceRef.current.getAllBlocks(false).length);
    });
    const onResize=()=>{if(workspaceRef.current)Blockly.svgResize(workspaceRef.current);fixH();};
    window.addEventListener("resize",onResize);
    const ro=new ResizeObserver(fixH);ro.observe(div);
    return()=>{cancelAnimationFrame(fid);window.removeEventListener("resize",onResize);ro.disconnect();workspaceRef.current?.dispose();workspaceRef.current=null;};
  },[]);

  const handleTextareaScroll=(e)=>{if(gutterRef.current)gutterRef.current.scrollTop=e.target.scrollTop;};
  const handleKeyDown=(e)=>{
    if(e.key==="Tab"){
      e.preventDefault();
      const ta=e.target,s=ta.selectionStart,en=ta.selectionEnd;
      const nv=pythonCode.substring(0,s)+"    "+pythonCode.substring(en);
      setPythonCode(nv);
      requestAnimationFrame(()=>{ta.selectionStart=ta.selectionEnd=s+4;});
    }
  };

  const generatePython=()=>{
    if(!workspaceRef.current)return;
    const indent=(code,lvl=1)=>code.split("\n").map(l=>"    ".repeat(lvl)+l).join("\n");

    const genExpr=(block)=>{
      if(!block)return"0";
      const A=()=>genExpr(block.getInputTargetBlock("A"));
      const B=()=>genExpr(block.getInputTargetBlock("B"));
      switch(block.type){
        case"op_add":        return`(${A()} + ${B()})`;
        case"op_subtract":   return`(${A()} - ${B()})`;
        case"op_multiply":   return`(${A()} * ${B()})`;
        case"op_divide":     return`(${A()} / ${B()})`;
        case"op_modulo":     return`(${A()} % ${B()})`;
        case"op_less":       return`${A()} < ${B()}`;
        case"op_greater":    return`${A()} > ${B()}`;
        case"op_equals":     return`${A()} == ${B()}`;
        case"op_lte":        return`${A()} <= ${B()}`;
        case"op_gte":        return`${A()} >= ${B()}`;
        case"op_not_equal":  return`${A()} != ${B()}`;
        case"op_and":        return`${A()} and ${B()}`;
        case"op_or":         return`${A()} or ${B()}`;
        case"op_not":        return`not ${A()}`;
        case"op_length":     return`len(${genExpr(block.getInputTargetBlock("TEXT"))})`;
        case"op_contains":   return`${genExpr(block.getInputTargetBlock("SEARCH"))} in ${genExpr(block.getInputTargetBlock("TEXT"))}`;
        case"op_concat":     return`str(${A()}) + str(${B()})`;
        case"math_random":   return`random.randint(${block.getFieldValue("FROM")},${block.getFieldValue("TO")})`;
        case"math_abs":      return`abs(${A()})`;
        case"literal_bool":  return block.getFieldValue("BOOL")==="TRUE"?"True":"False";
        case"literal_number":return`${block.getFieldValue("NUM")}`;
        case"literal_text":  return`"${block.getFieldValue("TEXT")}"`;
        case"var_get":       return block.getFieldValue("VAR");
        default: return`0`;
      }
    };

    const genBlock=(block)=>{
      if(!block)return"";
      const stmts=(name)=>{
        const child=block.getInputTargetBlock(name);
        if(!child)return indent("pass");
        const lines=[];let cur=child;
        while(cur){const l=genBlock(cur);if(l)lines.push(l);cur=cur.getNextBlock?.()??null;}
        return lines.length?indent(lines.join("\n")):indent("pass");
      };
      switch(block.type){
        case"move_forward":       return`robot.move_forward(power=${block.getFieldValue("POWER")},duration=${block.getFieldValue("DURATION")})`;
        case"move_backward":      return`robot.move_backward(power=${block.getFieldValue("POWER")},duration=${block.getFieldValue("DURATION")})`;
        case"turn_right":         return`robot.turn_right(power=${block.getFieldValue("POWER")},duration=${block.getFieldValue("DURATION")})`;
        case"turn_left":          return`robot.turn_left(power=${block.getFieldValue("POWER")},duration=${block.getFieldValue("DURATION")})`;
        case"dance":              return`robot.dance()`;
        case"stop_move":          return`robot.stop(duration=${block.getFieldValue("DURATION")})`;
        case"show_text_screen":   return`robot.display.show_text("${block.getFieldValue("TEXT")}")`;
        case"show_number_screen": return`robot.display.show_number(${block.getFieldValue("NUM")})`;
        case"show_leds":          return`robot.display.show_icon("${block.getFieldValue("PATTERN").toLowerCase()}")`;
        case"show_leds_matrix":   return`robot.display.show_matrix("${block.getFieldValue("MATRIX")}")`;
        case"clear_screen":       return`robot.display.clear()`;
        case"led_on":             return`robot.display.led_on(x=${block.getFieldValue("X")},y=${block.getFieldValue("Y")})`;
        case"led_off":            return`robot.display.led_off(x=${block.getFieldValue("X")},y=${block.getFieldValue("Y")})`;
        case"led_on_range":       return`robot.display.led_on_range(x1=${block.getFieldValue("X1")},y1=${block.getFieldValue("Y1")},x2=${block.getFieldValue("X2")},y2=${block.getFieldValue("Y2")})`;
        case"led_off_range":      return`robot.display.led_off_range(x1=${block.getFieldValue("X1")},y1=${block.getFieldValue("Y1")},x2=${block.getFieldValue("X2")},y2=${block.getFieldValue("Y2")})`;
        case"play_melody":        return`robot.sound.play_melody("${block.getFieldValue("MELODY").toLowerCase()}")`;
        case"play_note":          return`robot.sound.play_note("${block.getFieldValue("NOTE")}",${block.getFieldValue("DURATION_MS")})`;
        case"set_volume":         return`robot.sound.set_volume(${block.getFieldValue("VOLUME")})`;
        case"speaker_off":        return`robot.sound.off()`;
        case"speaker_on":         return`robot.sound.on()`;
        case"repeat_times":       return`for _ in range(${block.getFieldValue("TIMES")}):\n${stmts("DO")}`;
        case"loop_forever":       return`while True:\n${stmts("DO")}`;
        case"for_loop":           return`for ${block.getFieldValue("VAR")} in range(${block.getFieldValue("FROM")},${block.getFieldValue("TO")}+1,${block.getFieldValue("STEP")}):\n${stmts("DO")}`;
        case"while_loop":{const c=genExpr(block.getInputTargetBlock("CONDITION"));return`while ${c}:\n${stmts("DO")}`;}
        case"repeat_until":{const c=genExpr(block.getInputTargetBlock("CONDITION"));return`while True:\n${stmts("DO")}\n    if ${c}: break`;}
        case"loop_break":         return`break`;
        case"loop_continue":      return`continue`;
        case"if_expandable":{
          const cond=genExpr(block.getInputTargetBlock("CONDITION"));
          let code=`if ${cond}:\n${stmts("DO")}`;
          for(const idx of(block.elseIfIndices_||[])){code+=`\nelif ${genExpr(block.getInputTargetBlock(`ELSEIF${idx}`))}:\n${stmts(`DO_ELSEIF${idx}`)}`;}
          if(block.getInput("ELSE"))code+=`\nelse:\n${stmts("ELSE")}`;
          return code;
        }
        case"switch_block":{
          const expr=genExpr(block.getInputTargetBlock("EXPR"));
          const indices=block.caseIndices_||[];
          let code="";
          indices.forEach((idx,i)=>{
            const val=genExpr(block.getInputTargetBlock(`CASE_VAL${idx}`));
            code+=`${i>0?"\n":""}${i===0?"if":"elif"} ${expr} == ${val}:\n${stmts(`CASE_DO${idx}`)}`;
          });
          if(block.hasDefault_){code+=indices.length>0?`\nelse:\n${stmts("DEFAULT_DO")}`:`if True:\n${stmts("DEFAULT_DO")}`;}
          return code||"# اختر (فارغ)";
        }
        case"var_set":        return`${block.getFieldValue("VAR")} = ${genExpr(block.getInputTargetBlock("VALUE"))}`;
        case"var_change":     return`${block.getFieldValue("VAR")} += ${genExpr(block.getInputTargetBlock("AMOUNT"))}`;
        case"var_set_string": return`${block.getFieldValue("VAR")} = ${genExpr(block.getInputTargetBlock("VALUE"))}`;
        case"var_set_bool":   return`${block.getFieldValue("VAR")} = ${genExpr(block.getInputTargetBlock("VALUE"))}`;
        case"var_get":        return block.getFieldValue("VAR");
        case"literal_text":   return`"${block.getFieldValue("TEXT")}"`;
        case"literal_number": return`${block.getFieldValue("NUM")}`;
        case"literal_bool":   return block.getFieldValue("BOOL")==="TRUE"?"True":"False";
        case"func_define":    return`def ${block.getFieldValue("NAME")}():\n${stmts("BODY")}`;
        case"func_call":      return`${block.getFieldValue("NAME")}()`;
        case"func_return":    return`return ${genExpr(block.getInputTargetBlock("VALUE"))}`;
        case"op_modulo":      return`(${genExpr(block.getInputTargetBlock("A"))} % ${genExpr(block.getInputTargetBlock("B"))})`;
        case"math_abs":       return`abs(${genExpr(block.getInputTargetBlock("A"))})`;
        case"op_concat":      return`str(${genExpr(block.getInputTargetBlock("A"))}) + str(${genExpr(block.getInputTargetBlock("B"))})`;
        case"op_not_equal":   return`${genExpr(block.getInputTargetBlock("A"))} != ${genExpr(block.getInputTargetBlock("B"))}`;
        default: return`# [${block.type}]`;
      }
    };

    const topBlocks=workspaceRef.current.getTopBlocks(true);
    const code=["import time","import math","import random",""];
    topBlocks.forEach(block=>{
      let cur=block;
      while(cur){const l=genBlock(cur);if(l)code.push(l);cur=cur.getNextBlock?.()??null;}
      code.push("");
    });
    if(topBlocks.length===0)code.push("# لا توجد كتل بعد — أضف كتلاً من اللوحة\n# أو اكتب كودك هنا مباشرة!");
    setPythonCode(code.join("\n"));
    setView("python");
  };

  const handleCopy=()=>navigator.clipboard?.writeText(pythonCode).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  const handleSave=async()=>{
    if(!workspaceRef.current||!projectId||saving)return;
    setSaving(true);
    try{const xml=Blockly.utils.xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current));await saveBlocks(projectId,xml);setSaved(true);setTimeout(()=>setSaved(false),2200);}catch(e){}
    setSaving(false);
  };
  const handleRun=()=>alert(`تم إرسال ${workspaceRef.current?.getAllBlocks(false).length||0} كتلة إلى الروبوت!`);

  const TabSwitcher=({size="sm"})=>{
    const big=size==="lg";
    return(
      <div style={{display:"flex",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,padding:3,gap:2}}>
        <button onClick={()=>setView("blocks")} style={{background:view==="blocks"?"rgba(108,99,255,0.85)":"transparent",border:"none",color:"#fff",borderRadius:999,padding:big?"8px 18px":"5px 13px",fontSize:big?14:12,fontWeight:800,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",display:"flex",alignItems:"center",gap:5,boxShadow:view==="blocks"?"0 2px 8px rgba(108,99,255,0.4)":"none",transition:"background 0.18s,box-shadow 0.18s",touchAction:"manipulation"}}>🧩 الكتل</button>
        <button onClick={generatePython} style={{background:view==="python"?"#fff":"transparent",border:"none",color:view==="python"?"#1a1a2e":"rgba(255,255,255,0.8)",borderRadius:999,padding:big?"8px 18px":"5px 13px",fontSize:big?14:12,fontWeight:800,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",display:"flex",alignItems:"center",gap:5,boxShadow:view==="python"?"0 2px 8px rgba(255,255,255,0.15)":"none",transition:"background 0.18s,color 0.18s,box-shadow 0.18s",touchAction:"manipulation"}}>
          <span style={{fontSize:big?16:14,lineHeight:1}}>🐍</span><span>Python</span><span style={{opacity:0.45,fontSize:9,marginLeft:1}}>▾</span>
        </button>
      </div>
    );
  };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&family=Fredoka+One&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;width:100%;overflow:hidden;background:#0d1117;}
        .blocklyToolboxDiv{background:#0d1117!important;border-left:1px solid rgba(255,255,255,0.08)!important;}
        .blocklyTreeRow{border-radius:8px!important;margin:2px 6px!important;transition:background 0.15s!important;}
        .blocklyTreeRow:hover{background:rgba(255,255,255,0.07)!important;}
        .blocklyTreeSelected{background:rgba(108,99,255,0.22)!important;border-right:3px solid #6C63FF!important;}
        .blocklyTreeLabel{font-family:'Tajawal',sans-serif!important;font-size:13px!important;font-weight:700!important;white-space:nowrap!important;}
        .blocklyFlyoutBackground{fill:#1c2128!important;}
        .blocklyScrollbarHandle{fill:rgba(255,255,255,0.2)!important;}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,200,83,0.5)}50%{box-shadow:0 0 0 8px rgba(0,200,83,0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .left-panel{width:200px;flex-shrink:0;display:flex;flex-direction:column;background:rgba(22,27,34,0.75);border-right:1px solid rgba(255,255,255,0.06);}
        .panel-scroll{flex:1;overflow-y:auto;padding:10px;scrollbar-width:thin;scrollbar-color:rgba(108,99,255,0.4) rgba(255,255,255,0.04);}
        .panel-scroll::-webkit-scrollbar{width:4px;}
        .panel-scroll::-webkit-scrollbar-thumb{background:rgba(108,99,255,0.4);border-radius:2px;}
        .robot-icon-wrap{width:clamp(36px,8vw,56px);height:clamp(36px,8vw,56px);margin:0 auto;animation:float 3s ease-in-out infinite;}
        .py-view{animation:fadeIn 0.2s ease;}
        .py-editor-wrap{flex:1;display:flex;flex-direction:row;overflow:hidden;background:#0d1117;direction:ltr;}
        .py-gutter{flex-shrink:0;width:44px;overflow:hidden;background:#0d1117;border-right:1px solid rgba(255,255,255,0.06);padding:16px 0 24px;user-select:none;pointer-events:none;}
        .py-gutter-inner{display:flex;flex-direction:column;}
        .py-gutter-line{height:1.65em;line-height:1.65em;text-align:right;padding-right:10px;font-size:12px;font-family:'Fira Code','Cascadia Code','Courier New',monospace;color:#3d4f61;}
        .py-textarea{flex:1;resize:none;border:none;outline:none;background:transparent;color:#e2e8f0;font-size:13px;line-height:1.65em;font-family:'Fira Code','Cascadia Code','Courier New',monospace;padding:16px 16px 24px 12px;caret-color:#00e5ff;overflow:auto;scrollbar-width:thin;scrollbar-color:rgba(108,99,255,0.35) transparent;white-space:pre;tab-size:4;direction:ltr;}
        .py-textarea::-webkit-scrollbar{width:6px;height:6px;}
        .py-textarea::-webkit-scrollbar-thumb{background:rgba(108,99,255,0.35);border-radius:3px;}
        .py-textarea::selection{background:rgba(108,99,255,0.38);}
        .py-textarea:focus{outline:none;}
        @media(orientation:landscape) and (max-height:500px){.left-panel{width:150px!important;}.app-bar{height:42px!important;}.toolbar-row{height:38px!important;}}
        @media(max-width:640px){.left-panel{display:none!important;}.mobile-menu-btn{display:flex!important;}}
        @media(min-width:641px){.mobile-menu-btn{display:none!important;}}
        .sheet-scroll{overflow-y:auto;max-height:70vh;scrollbar-width:thin;scrollbar-color:rgba(108,99,255,0.4) transparent;}
        .sheet-scroll::-webkit-scrollbar{width:4px;}
        .sheet-scroll::-webkit-scrollbar-thumb{background:rgba(108,99,255,0.4);border-radius:2px;}
      `}</style>

      <div style={{display:"flex",flexDirection:"column",height:"100vh",width:"100vw",background:"#0d1117",color:"#fff",fontFamily:"'Tajawal',sans-serif",overflow:"hidden"}}>

        {/* APP BAR */}
        <div className="app-bar" style={{height:52,flexShrink:0,background:"rgba(22,27,34,0.98)",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",padding:"0 12px",gap:10,zIndex:100,boxShadow:"0 2px 16px rgba(0,0,0,0.5)"}}>
          <button onClick={()=>navigate("/home")} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",borderRadius:11,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,touchAction:"manipulation"}}><ArrowBackIcon/></button>
          <div style={{flex:1,textAlign:"center",minWidth:0}}>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:"clamp(13px,3.5vw,19px)",background:"linear-gradient(90deg,#6C63FF,#00E5FF,#FF6B6B)",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"block"}}>{projectName}</span>
          </div>
          <button className="mobile-menu-btn" onClick={()=>setShowPanel(true)} style={{background:"rgba(108,99,255,0.15)",border:"1.5px solid rgba(108,99,255,0.35)",color:"#fff",borderRadius:10,width:36,height:36,cursor:"pointer",alignItems:"center",justifyContent:"center",flexShrink:0,touchAction:"manipulation"}}><MenuIcon/></button>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar-row" style={{height:44,flexShrink:0,background:"rgba(22,27,34,0.98)",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",padding:"0 10px",position:"relative",direction:"ltr"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,direction:"ltr"}}>
            <SaveButton saving={saving} saved={saved} onSave={handleSave} disabled={!projectId}/>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontWeight:700}}>{blockCount} كتلة</div>
            <button onClick={handleRun} style={{background:"linear-gradient(135deg,#00C853,#00897B)",border:"none",color:"#fff",borderRadius:11,padding:"7px 16px",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Fredoka One',cursive",display:"flex",alignItems:"center",gap:6,boxShadow:"0 3px 12px rgba(0,200,83,0.33)",touchAction:"manipulation"}}><PlayIcon/> ابدأ</button>
          </div>
          <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",zIndex:1}}><TabSwitcher size="sm"/></div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:7}}>
            <button onClick={()=>workspaceRef.current?.undo(false)} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",touchAction:"manipulation"}}><UndoIcon/></button>
            <button onClick={()=>workspaceRef.current?.undo(true)}  style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#fff",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",touchAction:"manipulation"}}><RedoIcon/></button>
          </div>
        </div>

        {/* BODY */}
        <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>

          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="panel-scroll">
              <div style={{background:"rgba(108,99,255,0.11)",border:"1.5px solid rgba(108,99,255,0.28)",borderRadius:13,padding:11,marginBottom:10}}>
                <div style={{fontSize:10,color:"#aaa",marginBottom:6,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>المهمة</div>
                <p style={{fontSize:12,color:"#e0e0ff",lineHeight:1.7,marginBottom:8,fontWeight:600}}>{taskActive?"اجعل الروبوت يعرض قلباً وينتظر ثانيتين.":"انقر 'ابدأ' لعرض السؤال..."}</p>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>setTaskActive(true)}  style={{flex:1,background:taskActive?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#6C63FF,#9C63FF)",border:"none",color:"#fff",borderRadius:9,padding:"6px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",opacity:taskActive?0.4:1,touchAction:"manipulation"}}>▶ ابدأ</button>
                  <button onClick={()=>setTaskActive(false)} style={{flex:1,background:taskActive?"rgba(255,107,107,0.18)":"rgba(255,255,255,0.04)",border:"1px solid rgba(255,107,107,0.28)",color:"#FF6B6B",borderRadius:9,padding:"6px 0",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",opacity:taskActive?1:0.38,touchAction:"manipulation"}}>⏸ إيقاف</button>
                </div>
              </div>
              <div style={{background:"rgba(22,27,34,0.9)",border:`1.5px solid ${connected?"rgba(0,200,83,0.38)":"rgba(255,255,255,0.09)"}`,borderRadius:13,padding:11,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div className="robot-icon-wrap"><RobotIcon connected={connected}/></div>
                <div style={{fontSize:11,color:connected?"#00C853":"#aaa",fontWeight:700}}>{connected?"✓ متصل":"غير متصل"}</div>
                <button onClick={()=>setConnected(v=>!v)} style={{width:"100%",padding:"8px 0",background:connected?"rgba(0,200,83,0.13)":"linear-gradient(135deg,#00b4db,#0083b0)",border:connected?"1.5px solid rgba(0,200,83,0.45)":"none",color:connected?"#00C853":"#fff",borderRadius:9,fontSize:"clamp(10px,2.5vw,12px)",fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",animation:connected?"pulse 2s infinite":"none",touchAction:"manipulation"}}>
                  {connected?"قطع الاتصال":"ربط الجهاز"}
                </button>
              </div>
              <div style={{marginTop:10,fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center",fontWeight:600}}>يُحفظ على الخادم</div>
            </div>
          </div>

          {/* MAIN */}
          <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,minHeight:0,overflow:"hidden",position:"relative"}}>
            {loadingData&&(<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(22,27,34,0.9)",zIndex:10}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}><div style={{width:32,height:32,border:"3px solid rgba(108,99,255,0.3)",borderTopColor:"#6C63FF",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><span style={{color:"#aaa",fontSize:13,fontWeight:700}}>جاري تحميل المشروع...</span></div></div>)}
            {blockCount===0&&!loadingData&&view==="blocks"&&(<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:5,opacity:0.35}}><p style={{fontSize:"clamp(14px,4vw,18px)",fontWeight:800,color:"#fff",fontFamily:"'Tajawal',sans-serif"}}>أسقط الكتل هنا! 🧩</p></div>)}
            <div ref={blocklyDivRef} style={{position:"absolute",inset:0,visibility:view==="python"?"hidden":"visible"}}/>

            {view==="python"&&(
              <div className="py-view" style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",background:"#0d1117"}}>
                <div style={{height:40,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",background:"rgba(22,27,34,0.98)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#c792ea",fontFamily:"'Fira Code','Courier New',monospace"}}>robot_program.py</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontWeight:600}}>— {lineCount} سطر</span>
                  </div>
                  <button onClick={handleCopy} style={{background:copied?"rgba(0,200,83,0.18)":"rgba(255,255,255,0.07)",border:copied?"1px solid rgba(0,200,83,0.4)":"1px solid rgba(255,255,255,0.1)",color:copied?"#00C853":"#aaa",borderRadius:8,padding:"4px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",transition:"all 0.2s"}}>
                    {copied?"✓ تم النسخ":"نسخ"}
                  </button>
                </div>
                <div className="py-editor-wrap">
                  <div className="py-gutter" ref={gutterRef}>
                    <div className="py-gutter-inner">
                      {Array.from({length:lineCount},(_,i)=><div key={i} className="py-gutter-line">{i+1}</div>)}
                    </div>
                  </div>
                  <textarea ref={textareaRef} className="py-textarea" value={pythonCode} onChange={e=>setPythonCode(e.target.value)} onScroll={handleTextareaScroll} onKeyDown={handleKeyDown} spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" placeholder="# اكتب كودك هنا..."/>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM SHEET */}
        {showPanel&&(
          <>
            <div onClick={()=>setShowPanel(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200}}/>
            <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#161b22",borderTop:"1.5px solid rgba(108,99,255,0.3)",borderRadius:"18px 18px 0 0",zIndex:210,animation:"slideUp 0.26s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
                <span style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:"#fff"}}>لوحة التحكم</span>
                <button onClick={()=>setShowPanel(false)} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#fff",borderRadius:9,width:30,height:30,cursor:"pointer",fontSize:14}}>✕</button>
              </div>
              <div className="sheet-scroll" style={{padding:"14px 18px 32px",display:"flex",flexDirection:"column",gap:12}}>
                <TabSwitcher size="lg"/>
                <div style={{background:"rgba(108,99,255,0.11)",border:"1.5px solid rgba(108,99,255,0.28)",borderRadius:13,padding:13}}>
                  <div style={{fontSize:11,color:"#aaa",marginBottom:6,fontWeight:700}}>المهمة</div>
                  <p style={{fontSize:13,color:"#e0e0ff",lineHeight:1.7,marginBottom:10,fontWeight:600}}>{taskActive?"اجعل الروبوت يعرض قلباً وينتظر ثانيتين.":"انقر 'ابدأ' لعرض السؤال..."}</p>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setTaskActive(true);setShowPanel(false);}} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#9C63FF)",border:"none",color:"#fff",borderRadius:10,padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",touchAction:"manipulation"}}>▶ ابدأ</button>
                    <button onClick={()=>setTaskActive(false)} style={{flex:1,background:"rgba(255,107,107,0.14)",border:"1px solid rgba(255,107,107,0.28)",color:"#FF6B6B",borderRadius:10,padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",touchAction:"manipulation"}}>⏸ إيقاف</button>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(22,27,34,0.9)",border:`1.5px solid ${connected?"rgba(0,200,83,0.38)":"rgba(255,255,255,0.09)"}`,borderRadius:13,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:40,height:40}}><RobotIcon connected={connected}/></div>
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:connected?"#00C853":"#aaa"}}>{connected?"✓ متصل":"غير متصل"}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",fontWeight:600}}>حالة الروبوت</div>
                    </div>
                  </div>
                  <button onClick={()=>setConnected(v=>!v)} style={{background:connected?"rgba(0,200,83,0.13)":"linear-gradient(135deg,#00b4db,#0083b0)",border:connected?"1.5px solid rgba(0,200,83,0.45)":"none",color:connected?"#00C853":"#fff",borderRadius:11,padding:"9px 14px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",touchAction:"manipulation"}}>
                    {connected?"قطع الاتصال":"ربط"}
                  </button>
                </div>
                <SaveButton saving={saving} saved={saved} onSave={()=>{handleSave();setShowPanel(false);}} disabled={!projectId} style={{height:46,borderRadius:13,fontSize:14,width:"100%"}}/>
                <button onClick={()=>{handleRun();setShowPanel(false);}} style={{background:"linear-gradient(135deg,#00C853,#00897B)",border:"none",color:"#fff",borderRadius:13,padding:"13px 0",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Fredoka One',cursive",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 18px rgba(0,200,83,0.38)",touchAction:"manipulation"}}>
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
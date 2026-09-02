"use strict";

const COLORS={event:"#875cff",movement:"#168bdb",gpio:"#27a56f",control:"#e3821e",variable:"#e34f91",logic:"#e15b4f",utility:"#657080"};
const CATEGORIES=[
  ["EVENTOS",[["start","Ao iniciar"],["forever","Repetir sempre"]]],
  ["MOTOR A",[["motor_a_forward","Motor A para frente"],["motor_a_backward","Motor A para trás"],["motor_a_stop","Parar Motor A"]]],
  ["MOTOR B",[["motor_b_forward","Motor B para frente"],["motor_b_backward","Motor B para trás"],["motor_b_stop","Parar Motor B"]]],
  ["GPIO",[["gpio","Definir saída GPIO"],["pulse","Pulso na GPIO"]]],
  ["CONTROLE",[["wait","Esperar"],["repeat","Repetir vezes"],["if","Se... então"],["ifelse","Se... senão"]]],
  ["VARIÁVEIS",[["setvar","Definir variável"],["changevar","Alterar variável"]]],
  ["UTILIDADES",[["comment","Comentário"]]]
];
const DEF={
  start:{color:COLORS.event,fields:{},children:true},forever:{color:COLORS.event,fields:{},children:true},
  motor_a_forward:{color:COLORS.movement,fields:{power:"255"}},motor_a_backward:{color:COLORS.movement,fields:{power:"255"}},motor_a_stop:{color:COLORS.movement,fields:{}},
  motor_b_forward:{color:COLORS.movement,fields:{power:"255"}},motor_b_backward:{color:COLORS.movement,fields:{power:"255"}},motor_b_stop:{color:COLORS.movement,fields:{}},
  gpio:{color:COLORS.gpio,fields:{slot:"0",level:"HIGH"}},pulse:{color:COLORS.gpio,fields:{slot:"0",level:"HIGH",duration:"500"}},
  wait:{color:COLORS.control,fields:{duration:"1000"}},repeat:{color:COLORS.control,fields:{count:"3"},children:true},
  if:{color:COLORS.logic,fields:{variable:"contador",operator:"<",value:"5"},children:true},ifelse:{color:COLORS.logic,fields:{variable:"contador",operator:"<",value:"5"},children:true,elseChildren:true},
  setvar:{color:COLORS.variable,fields:{variable:"contador",value:"0"}},changevar:{color:COLORS.variable,fields:{variable:"contador",value:"1"}},
  comment:{color:COLORS.utility,fields:{text:"Minha etapa"}}
};
const LABEL=Object.fromEntries(CATEGORIES.flatMap(([,items])=>items));
const ROLES=["Motor A — frente","Motor A — trás","Motor B — frente","Motor B — trás"];
const DEFAULT_HARDWARE=[{pin:18,role:0},{pin:32,role:1},{pin:27,role:2},{pin:26,role:3}];
let state={name:"meu_carrinho",hardware:structuredClone(DEFAULT_HARDWARE),blocks:[]};
let history=[],dragData=null,saveTimer=null;
const $=s=>document.querySelector(s), workspace=$("#workspace");

function uid(){return "b"+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function newBlock(type){const d=DEF[type];return{id:uid(),type,fields:{...d.fields},children:d.children?[]:undefined,elseChildren:d.elseChildren?[]:undefined}}
function clone(v){return JSON.parse(JSON.stringify(v))}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeName(v,fallback="variavel"){let s=String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_]/g,"_").replace(/^([^a-zA-Z_])/,"_$1");return s||fallback}
function notify(text,error=false){const el=$("#message");el.textContent=text;el.classList.toggle("error",error);clearTimeout(el._timer);el._timer=setTimeout(()=>el.textContent="",4500)}
function pushHistory(){history.push(clone(state));if(history.length>40)history.shift()}
function changed(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{localStorage.setItem("ctrlForgeBlocksV2",JSON.stringify(state))},250);renderSummary();renderPreviewDebounced()}

function renderHardware(){
  const colors=["#35b8ff","#875cff","#ff9e38","#35d58a"];
  $("#hardwareGrid").innerHTML=state.hardware.map((h,i)=>`<div class="hardware-card" style="--color:${colors[i]}"><span>SAÍDA ${i+1}</span><label><span>NÚMERO DA GPIO</span><input class="pin-input" data-index="${i}" type="number" min="0" max="48" value="${h.pin}"></label><label><span>FUNÇÃO DESTA SAÍDA</span><select class="role-input" data-index="${i}">${ROLES.map((r,j)=>`<option value="${j}" ${h.role===j?"selected":""}>${r}</option>`).join("")}</select></label></div>`).join("");
  document.querySelectorAll(".pin-input").forEach(el=>el.addEventListener("change",()=>{pushHistory();state.hardware[+el.dataset.index].pin=+el.value;validateHardware();changed()}));
  document.querySelectorAll(".role-input").forEach(el=>el.addEventListener("change",()=>{pushHistory();state.hardware[+el.dataset.index].role=+el.value;validateHardware();changed()}));validateHardware();
}
function validateHardware(){const pins=state.hardware.map(h=>h.pin),roles=state.hardware.map(h=>h.role);let msg="Configuração válida.";let ok=true;if(pins.some(p=>!Number.isInteger(p)||p<0||p>48)){msg="Use GPIOs inteiras entre 0 e 48.";ok=false}else if(new Set(pins).size<4){msg="Os quatro números de GPIO precisam ser diferentes.";ok=false}else if(new Set(roles).size<4){msg="Cada função precisa estar associada uma única vez.";ok=false}$("#hardwareStatus").textContent=msg;$("#hardwareStatus").style.color=ok?"var(--green)":"var(--red)";return ok}

function clearDropPosition(){document.querySelectorAll(".drop-before").forEach(el=>el.classList.remove("drop-before"));document.querySelectorAll(".drop-at-end").forEach(el=>el.classList.remove("drop-at-end"))}
function dropIndex(zone,clientY,paint=false){
  const blocks=[...zone.querySelectorAll(":scope > .block:not(.dragging)")];
  const before=blocks.find(el=>clientY<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2);
  if(paint){clearDropPosition();if(before)before.classList.add("drop-before");else zone.classList.add("drop-at-end")}
  return before?blocks.indexOf(before):blocks.length;
}
function freshCopy(block){const copy=clone(block);walk([copy],b=>{b.id=uid();return false});return copy}
function duplicateBlock(id){let source,list,index;walk(state.blocks,(b,parent)=>{if(b.id===id){source=b;list=parent;index=parent.indexOf(b);return true}});if(!source)return;pushHistory();list.splice(index+1,0,freshCopy(source));renderWorkspace();changed()}

function renderPalette(){
  $("#palette").innerHTML=CATEGORIES.map(([cat,items])=>`<div class="category-title">${cat}</div>${items.map(([type,label])=>`<div class="palette-item" draggable="true" data-type="${type}" style="--block:${DEF[type].color}"><i></i>${label}</div>`).join("")}`).join("");
  document.querySelectorAll(".palette-item").forEach(el=>{el.addEventListener("click",()=>addBlock(el.dataset.type));el.addEventListener("dragstart",e=>{dragData={source:"palette",type:el.dataset.type};e.dataTransfer.effectAllowed="copy"});el.addEventListener("dragend",()=>{dragData=null;clearDropPosition()})});
}
function addBlock(type,target=state.blocks){pushHistory();target.push(newBlock(type));renderWorkspace();changed()}
function fieldHTML(b){const f=b.fields,pinOptions=state.hardware.map((h,i)=>`<option value="${i}" ${+f.slot===i?"selected":""}>GPIO ${h.pin}</option>`).join("");
  switch(b.type){
    case"motor_a_forward":case"motor_a_backward":case"motor_b_forward":case"motor_b_backward":return `<span>potência</span> ${input(b.id,"power",f.power,"number")} <span>0–255</span>`;
    case"gpio":return `${pinOptionsSelect(pinOptions,b.id,"slot")} <span>em</span> ${select(b.id,"level",[["HIGH","LIGADO"],["LOW","DESLIGADO"]],f.level)}`;
    case"pulse":return `${pinOptionsSelect(pinOptions,b.id,"slot")} <span>em</span> ${select(b.id,"level",[["HIGH","LIGADO"],["LOW","DESLIGADO"]],f.level)} <span>por</span> ${input(b.id,"duration",f.duration,"number")} <span>ms</span>`;
    case"wait":return `${input(b.id,"duration",f.duration,"number")} <span>milissegundos</span>`;
    case"repeat":return `${input(b.id,"count",f.count,"number")} <span>vezes</span>`;
    case"if":case"ifelse":return `${input(b.id,"variable",f.variable,"text","var-name")} ${select(b.id,"operator",[["==","="],["!=","≠"],["<","<"],["<=","≤"],[">",">"],[">=","≥"]],f.operator)} ${input(b.id,"value",f.value,"number")}`;
    case"setvar":return `${input(b.id,"variable",f.variable,"text","var-name")} <span>para</span> ${input(b.id,"value",f.value,"number")}`;
    case"changevar":return `${input(b.id,"variable",f.variable,"text","var-name")} <span>por</span> ${input(b.id,"value",f.value,"number")}`;
    case"comment":return input(b.id,"text",f.text,"text");default:return"";
  }}
function input(id,key,value,type="text",cls=""){const range=key==="power"?'min="0" max="255"':"";return `<input class="block-field ${cls}" data-id="${id}" data-key="${key}" type="${type}" value="${esc(value)}" ${type==="number"?'step="1"':""} ${range}>`}
function select(id,key,opts,value){return `<select class="block-field" data-id="${id}" data-key="${key}">${opts.map(([v,l])=>`<option value="${v}" ${String(value)===v?"selected":""}>${l}</option>`).join("")}</select>`}
function pinOptionsSelect(opts,id,key){return `<select class="block-field" data-id="${id}" data-key="${key}">${opts}</select>`}
function renderBlock(b){return `<div class="block" draggable="true" data-id="${b.id}" data-type="${b.type}" style="--block:${DEF[b.type].color}"><div class="block-head"><span class="block-title">${LABEL[b.type]}</span><span class="block-fields">${fieldHTML(b)}</span><button class="block-duplicate" data-duplicate="${b.id}" title="Duplicar bloco" aria-label="Duplicar bloco">⧉</button><button class="block-remove" data-remove="${b.id}" title="Remover bloco" aria-label="Remover bloco">×</button></div>${DEF[b.type].children?`<div class="block-body dropzone" data-parent="${b.id}" data-branch="children">${b.children.map(renderBlock).join("")}</div>`:""}${DEF[b.type].elseChildren?`<div class="block-else-label">SENÃO</div><div class="block-body dropzone" data-parent="${b.id}" data-branch="elseChildren">${b.elseChildren.map(renderBlock).join("")}</div>`:""}</div>`}
function renderWorkspace(){
  workspace.querySelectorAll(":scope > .block").forEach(e=>e.remove());workspace.insertAdjacentHTML("beforeend",state.blocks.map(renderBlock).join(""));workspace.classList.toggle("has-blocks",state.blocks.length>0);bindBlocks();updateCount();
}
function walk(list,cb){for(const b of list){if(cb(b,list))return b;if(b.children){const r=walk(b.children,cb);if(r)return r}if(b.elseChildren){const r=walk(b.elseChildren,cb);if(r)return r}}return null}
function findBlock(id){let found;walk(state.blocks,b=>{if(b.id===id){found=b;return true}});return found}
function removeBlock(id){let removed;walk(state.blocks,(b,list)=>{if(b.id===id){removed=b;list.splice(list.indexOf(b),1);return true}});return removed}
function targetList(zone){if(zone.dataset.zone==="root")return state.blocks;const p=findBlock(zone.dataset.parent);return p?p[zone.dataset.branch]:state.blocks}
function contains(block,id){if(block.id===id)return true;return [...(block.children||[]),...(block.elseChildren||[])].some(x=>contains(x,id))}
function bindBlocks(){
  document.querySelectorAll(".block").forEach(el=>{el.addEventListener("dragstart",e=>{if(e.target.closest("input,select,button")){e.preventDefault();return}dragData={source:"workspace",id:el.dataset.id};el.classList.add("dragging");e.dataTransfer.effectAllowed="move";e.stopPropagation()});el.addEventListener("dragend",()=>{el.classList.remove("dragging");dragData=null;clearDropPosition()})});
  document.querySelectorAll(".block-field").forEach(el=>el.addEventListener("change",()=>{pushHistory();const b=findBlock(el.dataset.id);if(b)b.fields[el.dataset.key]=el.value;changed()}));
  document.querySelectorAll("[data-remove]").forEach(el=>el.addEventListener("click",()=>{pushHistory();removeBlock(el.dataset.remove);renderWorkspace();changed()}));document.querySelectorAll("[data-duplicate]").forEach(el=>el.addEventListener("click",()=>duplicateBlock(el.dataset.duplicate)));bindDropzones();
}
function bindDropzones(){document.querySelectorAll(".dropzone").forEach(zone=>{zone.addEventListener("dragover",e=>{e.preventDefault();e.stopPropagation();zone.classList.add("drag-over");dropIndex(zone,e.clientY,true)});zone.addEventListener("dragleave",e=>{if(!zone.contains(e.relatedTarget)){zone.classList.remove("drag-over");clearDropPosition()}});zone.addEventListener("drop",e=>{e.preventDefault();e.stopPropagation();zone.classList.remove("drag-over");if(!dragData)return;const index=dropIndex(zone,e.clientY);clearDropPosition();pushHistory();const list=targetList(zone);if(dragData.source==="palette")list.splice(index,0,newBlock(dragData.type));else{const moving=findBlock(dragData.id);const parent=zone.dataset.parent?findBlock(zone.dataset.parent):null;if(!moving||parent&&contains(moving,parent.id)){history.pop();dragData=null;return}removeBlock(dragData.id);list.splice(index,0,moving)}dragData=null;renderWorkspace();changed()})})}
function updateCount(){const count=[];walk(state.blocks,b=>count.push(b));$("#blockCount").textContent=`${count.length} bloco${count.length===1?"":"s"}`}

function collectVariables(){const vars=new Set();walk(state.blocks,b=>{if(["setvar","changevar","if","ifelse"].includes(b.type))vars.add(safeName(b.fields.variable));});return [...vars]}
function mappedPins(){const out={};state.hardware.forEach(h=>out[h.role]=h.pin);return{lf:out[0],lr:out[1],rf:out[2],rr:out[3]}}
function n(v,min=0,max=2147483647){const x=Math.trunc(Number(v));return Number.isFinite(x)?Math.min(max,Math.max(min,x)):0}
function lineFor(b,indent){const I="  ".repeat(indent),f=b.fields,child=(arr,level)=>arr.map(x=>lineFor(x,level)).filter(Boolean).join("\n");
  switch(b.type){
    case"start":return child(b.children,indent);
    case"forever":return `${I}while (true) {\n${child(b.children,indent+1)}\n${I}}`;
    case"motor_a_forward":return `${I}motorAFrente(${n(f.power,0,255)});`;
    case"motor_a_backward":return `${I}motorATras(${n(f.power,0,255)});`;
    case"motor_a_stop":return `${I}pararMotorA();`;
    case"motor_b_forward":return `${I}motorBFrente(${n(f.power,0,255)});`;
    case"motor_b_backward":return `${I}motorBTras(${n(f.power,0,255)});`;
    case"motor_b_stop":return `${I}pararMotorB();`;
    case"gpio":return `${I}digitalWrite(GPIO_${+f.slot+1}, ${f.level==="LOW"?"LOW":"HIGH"});`;
    case"pulse":{const a=f.level==="LOW"?"LOW":"HIGH",z=a==="HIGH"?"LOW":"HIGH";return `${I}digitalWrite(GPIO_${+f.slot+1}, ${a});\n${I}delay(${n(f.duration)});\n${I}digitalWrite(GPIO_${+f.slot+1}, ${z});`}
    case"wait":return `${I}delay(${n(f.duration)});`;
    case"repeat":{const loop="i_"+b.id.slice(-5).replace(/[^a-z0-9]/gi,"");return `${I}for (int ${loop} = 0; ${loop} < ${n(f.count,0,1000000)}; ${loop}++) {\n${child(b.children,indent+1)}\n${I}}`}
    case"if":return `${I}if (${safeName(f.variable)} ${f.operator} ${n(f.value,-2147483648)}) {\n${child(b.children,indent+1)}\n${I}}`;
    case"ifelse":return `${I}if (${safeName(f.variable)} ${f.operator} ${n(f.value,-2147483648)}) {\n${child(b.children,indent+1)}\n${I}} else {\n${child(b.elseChildren,indent+1)}\n${I}}`;
    case"setvar":return `${I}${safeName(f.variable)} = ${n(f.value,-2147483648)};`;
    case"changevar":return `${I}${safeName(f.variable)} += ${n(f.value,-2147483648)};`;
    case"comment":return `${I}// ${String(f.text||"").replace(/[\r\n]+/g," ").slice(0,100)}`;default:return"";
  }}
function generateFirmware(){
  if(!validateHardware())throw new Error("Corrija a configuração das GPIOs antes de exportar.");
  const p=mappedPins(),vars=collectVariables(),starts=state.blocks.filter(b=>b.type==="start"),runs=state.blocks.filter(b=>b.type!=="start");
  const setupProgram=starts.flatMap(b=>b.children).map(b=>lineFor(b,1)).filter(Boolean).join("\n")||"  // Nenhum bloco de inicialização.";
  const loopProgram=runs.map(b=>lineFor(b,1)).filter(Boolean).join("\n")||"  // Adicione blocos na área de programação.\n  delay(10);";
  return `/*\n * ${safeName(state.name,"meu_carrinho")}.ino\n * Gerado por CTRL.FORGE BLOCKS V2\n * Controle independente dos motores com PWM de 0 a 255\n */\n\nconst int GPIO_1 = ${state.hardware[0].pin};\nconst int GPIO_2 = ${state.hardware[1].pin};\nconst int GPIO_3 = ${state.hardware[2].pin};\nconst int GPIO_4 = ${state.hardware[3].pin};\n\nconst int MOTOR_A_FRENTE = ${p.lf};\nconst int MOTOR_A_TRAS   = ${p.lr};\nconst int MOTOR_B_FRENTE = ${p.rf};\nconst int MOTOR_B_TRAS   = ${p.rr};\n${vars.length?"\n// Variáveis criadas nos blocos\n"+vars.map(v=>`long ${v} = 0;`).join("\n")+"\n":""}\nvoid pararMotorA() {\n  analogWrite(MOTOR_A_FRENTE, 0);\n  analogWrite(MOTOR_A_TRAS, 0);\n}\n\nvoid pararMotorB() {\n  analogWrite(MOTOR_B_FRENTE, 0);\n  analogWrite(MOTOR_B_TRAS, 0);\n}\n\nvoid motorAFrente(int potencia) {\n  potencia = constrain(potencia, 0, 255);\n  analogWrite(MOTOR_A_TRAS, 0);\n  analogWrite(MOTOR_A_FRENTE, potencia);\n}\n\nvoid motorATras(int potencia) {\n  potencia = constrain(potencia, 0, 255);\n  analogWrite(MOTOR_A_FRENTE, 0);\n  analogWrite(MOTOR_A_TRAS, potencia);\n}\n\nvoid motorBFrente(int potencia) {\n  potencia = constrain(potencia, 0, 255);\n  analogWrite(MOTOR_B_TRAS, 0);\n  analogWrite(MOTOR_B_FRENTE, potencia);\n}\n\nvoid motorBTras(int potencia) {\n  potencia = constrain(potencia, 0, 255);\n  analogWrite(MOTOR_B_FRENTE, 0);\n  analogWrite(MOTOR_B_TRAS, potencia);\n}\n\nvoid setup() {\n  pinMode(GPIO_1, OUTPUT); pinMode(GPIO_2, OUTPUT);\n  pinMode(GPIO_3, OUTPUT); pinMode(GPIO_4, OUTPUT);\n  pararMotorA();\n  pararMotorB();\n\n${setupProgram}\n}\n\nvoid loop() {\n${loopProgram}\n}\n`;
}
let previewTimer;function renderPreviewDebounced(){clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,180)}function renderPreview(){try{$("#codePreview").textContent=generateFirmware()}catch(e){$("#codePreview").textContent="// "+e.message}}
function renderSummary(){const vars=collectVariables();$("#summary").innerHTML=`<b>HARDWARE</b><br>${state.hardware.map((h,i)=>`GPIO ${h.pin}: ${ROLES[h.role]}`).join("<br>")}<br><br><b>PROGRAMA</b><br>${document.querySelectorAll(".block").length} blocos • ${vars.length} variáve${vars.length===1?"l":"is"}`}
function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function projectData(){return{format:"CTRL.FORGE-BLOCKS",version:2,...state}}
function migrateBlocks(list){return list.flatMap(b=>{if(b.children)b.children=migrateBlocks(b.children);if(b.elseChildren)b.elseChildren=migrateBlocks(b.elseChildren);const pairs={forward:[["motor_a_forward",255],["motor_b_forward",255]],backward:[["motor_a_backward",255],["motor_b_backward",255]],left:[["motor_a_backward",255],["motor_b_forward",255]],right:[["motor_a_forward",255],["motor_b_backward",255]],stop:[["motor_a_stop"],["motor_b_stop"]]};if(!pairs[b.type])return DEF[b.type]?[b]:[];return pairs[b.type].map(([type,power])=>{const x=newBlock(type);if(power!==undefined)x.fields.power=String(power);return x})})}
function restore(data){if(!data||data.format&&data.format!=="CTRL.FORGE-BLOCKS"||!Array.isArray(data.blocks)||!Array.isArray(data.hardware))throw new Error("Arquivo de projeto incompatível.");pushHistory();state={name:String(data.name||"meu_carrinho"),hardware:data.hardware.slice(0,4).map(h=>({pin:+h.pin,role:+h.role})),blocks:migrateBlocks(data.blocks)};$("#projectName").value=state.name;renderHardware();renderWorkspace();changed()}

$("#resetHardware").addEventListener("click",()=>{pushHistory();state.hardware=structuredClone(DEFAULT_HARDWARE);renderHardware();renderWorkspace();changed()});
$("#projectName").addEventListener("input",e=>{state.name=e.target.value;changed()});
$("#undoBtn").addEventListener("click",()=>{if(!history.length)return notify("Nada para desfazer.",true);state=history.pop();$("#projectName").value=state.name;renderHardware();renderWorkspace();changed()});
$("#clearWorkspace").addEventListener("click",()=>{if(!state.blocks.length)return;pushHistory();state.blocks=[];renderWorkspace();changed();notify("Área de programação limpa.")});
$("#saveProject").addEventListener("click",()=>{state.name=$("#projectName").value;localStorage.setItem("ctrlForgeBlocksV2",JSON.stringify(state));download(`${safeName(state.name,"projeto")}.ctrlforge.json`,JSON.stringify(projectData(),null,2),"application/json");notify("Projeto salvo no navegador e baixado.")});
$("#loadProject").addEventListener("click",()=>$("#projectFile").click());
$("#projectFile").addEventListener("change",async e=>{try{restore(JSON.parse(await e.target.files[0].text()));notify("Projeto carregado com sucesso.")}catch(err){notify(err.message,true)}e.target.value=""});
$("#refreshCode").addEventListener("click",()=>{renderPreview();notify("Prévia atualizada.")});
$("#generate").addEventListener("click",()=>{try{const code=generateFirmware();download(`${safeName(state.name,"meu_carrinho")}.ino`,code,"text/x-c++src");$("#codePreview").textContent=code;notify("Arquivo .ino gerado com sucesso!")}catch(e){notify(e.message,true)}});
$("#copyCode").addEventListener("click",async()=>{try{const code=generateFirmware();await navigator.clipboard.writeText(code);notify("Código copiado para a área de transferência.")}catch(e){try{const t=document.createElement("textarea");t.value=generateFirmware();document.body.appendChild(t);t.select();document.execCommand("copy");t.remove();notify("Código copiado.")}catch(err){notify(err.message,true)}}});

function init(){renderPalette();const saved=localStorage.getItem("ctrlForgeBlocksV2");if(saved){try{const parsed=JSON.parse(saved);if(parsed.hardware&&parsed.blocks){state=parsed;state.blocks=migrateBlocks(state.blocks)}}catch{}}if(!state.blocks.length){const start=newBlock("start"),set=newBlock("setvar"),forever=newBlock("forever"),motorA=newBlock("motor_a_forward"),motorB=newBlock("motor_b_forward"),wait=newBlock("wait"),stopA=newBlock("motor_a_stop"),stopB=newBlock("motor_b_stop");start.children.push(set);forever.children.push(motorA,motorB,wait,stopA,stopB);state.blocks=[start,forever]}$("#projectName").value=state.name;renderHardware();renderWorkspace();renderSummary();renderPreview();changed()}
init();

const layouts = {"joystick": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Joystick duplo</title>\n<style>\n*{box-sizing:border-box;user-select:none;-webkit-user-select:none}body{margin:0;background:radial-gradient(circle at 50% 0,#27233f,#101116 55%);color:#fff;font-family:Arial,sans-serif;height:100vh;overflow:hidden;touch-action:none}\n.head{height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid #ffffff12}.head b{letter-spacing:.14em;font-size:12px}.head span{color:#9f8cff;font-size:11px}\n.stage{height:calc(100vh - 62px);display:flex;align-items:center;justify-content:center;gap:min(12vw,100px);padding:20px}\n.unit{text-align:center}.unit label{display:block;font-size:11px;letter-spacing:.14em;color:#888;margin-bottom:13px}\n.track{width:78px;height:min(58vh,340px);border-radius:40px;background:#171921;border:1px solid #343746;position:relative;box-shadow:inset 0 0 28px #0008}\n.track:before{content:\"\";position:absolute;left:17px;right:17px;top:50%;height:1px;background:#555}\n.knob{position:absolute;left:50%;top:50%;width:58px;height:58px;border-radius:50%;background:linear-gradient(145deg,#b09cff,#6f58ff);box-shadow:0 8px 24px #765eff55;transform:translate(-50%,-50%)}\n.val{margin-top:12px;font-weight:bold;color:#b5a6ff}\n</style>\n</head>\n<body>\n\n<div class=\"head\"><b>DUAL STICKS</b><span>2 motores independentes</span></div>\n<div class=\"stage\">\n  <div class=\"unit\"><label>MOTOR ESQUERDO</label><div class=\"track\" data-m=\"A\"><div class=\"knob\"></div></div><div class=\"val\">0</div></div>\n  <div class=\"unit\"><label>MOTOR DIREITO</label><div class=\"track\" data-m=\"B\"><div class=\"knob\"></div></div><div class=\"val\">0</div></div>\n</div>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('.track').forEach(track=>{\n const knob=track.querySelector('.knob'),val=track.parentElement.querySelector('.val'),m=track.dataset.m;\n let active=false;\n function move(e){const r=track.getBoundingClientRect();let y=clamp(e.clientY-r.top,29,r.height-29),c=r.height/2,span=c-29,s=Math.round((c-y)/span*255);\n knob.style.top=y+'px';val.textContent=(s>0?'+':'')+s;\n if(m==='A')sendSigned(s,lastB===999?0:lastB);else sendSigned(lastA===999?0:lastA,s)}\n function reset(){knob.style.top='50%';val.textContent='0';if(m==='A')sendSigned(0,lastB===999?0:lastB,true);else sendSigned(lastA===999?0:lastA,0,true)}\n track.onpointerdown=e=>{active=true;track.setPointerCapture?.(e.pointerId);move(e)};\n track.onpointermove=e=>{if(active)move(e)};track.onpointerup=()=>{active=false;reset()};track.onpointercancel=()=>{active=false;reset()}\n});\n</script>\n</body>\n</html>", "buttons": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Botões</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#081018;color:white;font-family:Arial,sans-serif;height:100vh;overflow:hidden}\nheader{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #173044}header b{font-size:12px;letter-spacing:.16em;color:#64d8ff}header span{font-size:11px;color:#72889a}\nmain{height:calc(100vh - 60px);display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:18px}\n.motor{display:grid;grid-template-rows:auto 1fr 1fr 1fr 1fr;gap:9px}.motor h3{margin:0 0 3px;font-size:12px;color:#8ba0af;letter-spacing:.12em}\nbutton{border:0;border-radius:14px;color:#fff;font-weight:800;touch-action:none}.f2{background:#05a865}.f1{background:#087d57}.r1{background:#b64b35}.r2{background:#e23434}.stop{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);width:150px;height:42px;background:#fff;color:#111;border-radius:999px}\nbutton:active{filter:brightness(1.3);transform:scale(.98)}\n</style>\n</head>\n<body>\n\n<header><b>DIRECT BUTTONS</b><span>segure para mover</span></header>\n<main>\n <section class=\"motor\"><h3>ESQUERDO</h3><button class=\"f2\" data-on=\"AF_A_ON\" data-off=\"AF_A_OFF\">FRENTE • 100%</button><button class=\"f1\" data-on=\"AF_B_ON\" data-off=\"AF_B_OFF\">FRENTE • 70%</button><button class=\"r1\" data-on=\"AR_B_ON\" data-off=\"AR_B_OFF\">RÉ • 70%</button><button class=\"r2\" data-on=\"AR_A_ON\" data-off=\"AR_A_OFF\">RÉ • 100%</button></section>\n <section class=\"motor\"><h3>DIREITO</h3><button class=\"f2\" data-on=\"BF_A_ON\" data-off=\"BF_A_OFF\">FRENTE • 100%</button><button class=\"f1\" data-on=\"BF_B_ON\" data-off=\"BF_B_OFF\">FRENTE • 70%</button><button class=\"r1\" data-on=\"BR_B_ON\" data-off=\"BR_B_OFF\">RÉ • 70%</button><button class=\"r2\" data-on=\"BR_A_ON\" data-off=\"BR_A_OFF\">RÉ • 100%</button></section>\n</main><button class=\"stop\" onclick=\"stopAll()\">PARAR</button>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('[data-on]').forEach(b=>{let down=false;\n const on=()=>{if(down)return;down=true;fetch('/'+b.dataset.on).catch(()=>{})};\n const off=()=>{if(!down)return;down=false;fetch('/'+b.dataset.off).catch(()=>{})};\n b.onpointerdown=on;b.onpointerup=off;b.onpointerleave=off;b.onpointercancel=off;\n});\n</script>\n</body>\n</html>", "sliders": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Sliders</title>\n<style>\n*{box-sizing:border-box}body{margin:0;background:#0b0d10;color:#f4f4f4;font-family:Arial,sans-serif;height:100vh;overflow:hidden}\nheader{height:66px;display:flex;align-items:center;padding:0 22px;border-bottom:1px solid #222}header b{font-size:12px;letter-spacing:.18em}\nmain{height:calc(100vh - 66px);display:grid;grid-template-columns:1fr 1fr;gap:30px;padding:30px}\n.motor{display:flex;flex-direction:column;justify-content:center;gap:22px}.motor h2{font-size:14px;color:#777;letter-spacing:.12em;margin:0}\n.switch{display:grid;grid-template-columns:1fr;gap:8px}.switch button{border:1px solid #333;background:#15171a;color:#aaa;border-radius:9px;padding:13px}.switch button.active{background:#fff;color:#111;border-color:#fff}\ninput[type=range]{width:100%;accent-color:#ff4f7b}.number{font-size:52px;font-weight:900;letter-spacing:-.06em}.number small{font-size:12px;color:#666}\n.stop{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);border:0;background:#ff4f7b;color:#fff;border-radius:999px;padding:12px 26px;font-weight:bold}\n@media(max-width:700px){\nmain{grid-template-columns:1fr;gap:18px;padding:18px;overflow:auto;height:calc(100vh - 66px)}\n.motor{min-height:300px}\n.number{font-size:42px}\n}\n</style>\n</head>\n<body>\n\n<header><b>PRECISION SLIDERS</b></header>\n<main>\n<section class=\"motor\" data-m=\"A\"><h2>MOTOR ESQUERDO</h2><div class=\"number\">0 <small>/255</small></div><div class=\"switch\"><button class=\"active\" data-d=\"U\">FRENTE</button><button data-d=\"D\">RÉ</button></div><input type=\"range\" min=\"0\" max=\"255\" value=\"0\"></section>\n<section class=\"motor\" data-m=\"B\"><h2>MOTOR DIREITO</h2><div class=\"number\">0 <small>/255</small></div><div class=\"switch\"><button class=\"active\" data-d=\"U\">FRENTE</button><button data-d=\"D\">RÉ</button></div><input type=\"range\" min=\"0\" max=\"255\" value=\"0\"></section>\n</main><button class=\"stop\" onclick=\"stopAll()\">PARAR</button>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('.motor').forEach(s=>{let d='U',m=s.dataset.m,r=s.querySelector('input'),n=s.querySelector('.number');\n s.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{d=b.dataset.d;s.querySelectorAll('[data-d]').forEach(x=>x.classList.remove('active'));b.classList.add('active')});\n r.oninput=()=>{n.firstChild.nodeValue=r.value+' ';let v=(d==='U'?1:-1)*Number(r.value);if(m==='A')sendSigned(v,lastB===999?0:lastB);else sendSigned(lastA===999?0:lastA,v)};\n});\n</script>\n</body>\n</html>", "arcade": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Arcade</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:linear-gradient(145deg,#160722,#061429);color:white;font-family:Arial,sans-serif;height:100vh;overflow:hidden;touch-action:none}\nheader{height:60px;padding:0 22px;display:flex;align-items:center;justify-content:space-between}header b{letter-spacing:.2em;font-size:12px;color:#ff5fd2}header span{color:#6de8ff;font-size:11px}\nmain{height:calc(100vh - 60px);display:grid;grid-template-columns:1fr 1fr;gap:26px;padding:20px 28px 82px}.pad{display:grid;place-items:center;position:relative;border-radius:30px;background:#ffffff08;border:1px solid #ffffff12}\n.ring{width:min(30vw,220px);height:min(30vw,220px);border-radius:50%;border:14px solid #3a2050;background:#100d19;position:relative}.knob{position:absolute;left:50%;top:50%;width:72px;height:72px;border-radius:50%;background:linear-gradient(145deg,#ff5fd2,#7d49ff);transform:translate(-50%,-50%);box-shadow:0 0 30px #ff5fd255}\n.tag{position:absolute;top:16px;left:18px;font-size:10px;letter-spacing:.13em;color:#8b7999}.stop{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);border:0;background:#6de8ff;color:#031017;border-radius:999px;padding:12px 28px;font-weight:900}\n</style>\n</head>\n<body>\n\n<header><b>NEON ARCADE</b><span>arraste verticalmente</span></header>\n<main><div class=\"pad\" data-m=\"A\"><div class=\"tag\">LEFT</div><div class=\"ring\"><div class=\"knob\"></div></div></div><div class=\"pad\" data-m=\"B\"><div class=\"tag\">RIGHT</div><div class=\"ring\"><div class=\"knob\"></div></div></div></main>\n<button class=\"stop\" onclick=\"stopAll()\">STOP</button>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('.pad').forEach(p=>{const k=p.querySelector('.knob'),m=p.dataset.m;let active=false;\n function move(e){let r=p.querySelector('.ring').getBoundingClientRect(),dy=clamp(e.clientY-(r.top+r.height/2),-62,62),v=Math.round(-dy/62*255);k.style.transform=`translate(-50%,calc(-50% + ${dy}px))`;if(m==='A')sendSigned(v,lastB===999?0:lastB);else sendSigned(lastA===999?0:lastA,v)}\n p.onpointerdown=e=>{active=true;p.setPointerCapture?.(e.pointerId);move(e)};p.onpointermove=e=>{if(active)move(e)};p.onpointerup=()=>{active=false;k.style.transform='translate(-50%,-50%)';if(m==='A')sendSigned(0,lastB===999?0:lastB,true);else sendSigned(lastA===999?0:lastA,0,true)}\n});\n</script>\n</body>\n</html>", "tank": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Tank Drive</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#090b08;color:#e9efe5;font-family:Arial,sans-serif;height:100vh;overflow:hidden}\nheader{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid #26321f}header b{font-size:12px;letter-spacing:.18em;color:#b6d77d}\nmain{height:calc(100vh - 58px);display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:20px 24px 76px}.track{display:grid;grid-template-rows:1fr 1fr;gap:12px}.track button{border:1px solid #33442b;background:#151c12;color:#dce9d2;border-radius:20px;font-size:34px}.track button:active{background:#92b85a;color:#0b0f08}.stop{position:fixed;left:20px;right:20px;bottom:14px;height:48px;border:0;border-radius:12px;background:#d7e7c3;color:#10150c;font-weight:900}\n</style>\n</head>\n<body>\n\n<header><b>TANK DRIVE</b><span>cada lado é independente</span></header>\n<main><div class=\"track\"><button data-v=\"255\" data-m=\"A\">▲</button><button data-v=\"-255\" data-m=\"A\">▼</button></div><div class=\"track\"><button data-v=\"255\" data-m=\"B\">▲</button><button data-v=\"-255\" data-m=\"B\">▼</button></div></main><button class=\"stop\" onclick=\"stopAll()\">PARAR</button>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('[data-v]').forEach(b=>{let down=false,m=b.dataset.m,v=Number(b.dataset.v);\n const on=()=>{down=true;if(m==='A')sendSigned(v,lastB===999?0:lastB,true);else sendSigned(lastA===999?0:lastA,v,true)};\n const off=()=>{if(!down)return;down=false;if(m==='A')sendSigned(0,lastB===999?0:lastB,true);else sendSigned(lastA===999?0:lastA,0,true)};\n b.onpointerdown=on;b.onpointerup=off;b.onpointerleave=off;b.onpointercancel=off;\n});\n</script>\n</body>\n</html>", "minimal": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Minimal</title>\n<style>\n*{box-sizing:border-box}body{margin:0;background:#101010;color:#eee;font-family:Arial,sans-serif;height:100vh;overflow:hidden}\nheader{height:56px;padding:0 20px;display:flex;align-items:center;border-bottom:1px solid #242424;font-size:11px;letter-spacing:.18em;color:#888}\nmain{height:calc(100vh - 56px);display:grid;grid-template-columns:1fr 1fr;gap:32px;padding:32px}.side{display:flex;flex-direction:column;justify-content:center;gap:18px}.side h3{margin:0;font-size:13px;color:#777}.dir{display:grid;grid-template-columns:1fr;gap:8px}.dir button{flex:1;border:1px solid #333;background:transparent;color:#aaa;border-radius:999px;padding:12px}.dir button.active{background:#f0f0f0;color:#111}input{width:100%;accent-color:#eee}.value{font-size:58px;font-weight:900;letter-spacing:-.08em}\n@media(max-width:680px){\nmain{grid-template-columns:1fr;gap:18px;padding:18px;overflow:auto;height:calc(100vh - 56px)}\n.side{min-height:300px}\n.value{font-size:44px}\n}\n</style>\n</head>\n<body>\n\n<header>MINIMAL CONTROL</header><main>\n<div class=\"side\" data-m=\"A\"><h3>ESQUERDO</h3><div class=\"value\">0</div><div class=\"dir\"><button class=\"active\" data-d=\"U\">FRENTE</button><button data-d=\"D\">RÉ</button></div><input type=\"range\" min=\"0\" max=\"255\" value=\"0\"></div>\n<div class=\"side\" data-m=\"B\"><h3>DIREITO</h3><div class=\"value\">0</div><div class=\"dir\"><button class=\"active\" data-d=\"U\">FRENTE</button><button data-d=\"D\">RÉ</button></div><input type=\"range\" min=\"0\" max=\"255\" value=\"0\"></div></main>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('.side').forEach(s=>{let d='U',m=s.dataset.m,r=s.querySelector('input'),v=s.querySelector('.value');\ns.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{d=b.dataset.d;s.querySelectorAll('[data-d]').forEach(x=>x.classList.remove('active'));b.classList.add('active')});\nr.oninput=()=>{v.textContent=r.value;let n=(d==='U'?1:-1)*Number(r.value);if(m==='A')sendSigned(n,lastB===999?0:lastB);else sendSigned(lastA===999?0:lastA,n)}})\n</script>\n</body>\n</html>", "wheel": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Volante</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#0d1014;color:white;font-family:Arial,sans-serif;height:100vh;overflow:hidden;touch-action:none}\nheader{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #252b33}header b{font-size:12px;letter-spacing:.17em;color:#ffb341}\nmain{height:calc(100vh - 58px);display:grid;grid-template-columns:1.2fr .8fr;align-items:center;padding:18px 30px;gap:28px}.wheelZone{display:grid;place-items:center;height:100%}.wheel{width:min(45vh,48vw,300px);aspect-ratio:1;border:24px solid #2b3037;border-radius:50%;position:relative;transition:.08s}.wheel:before,.wheel:after{content:\"\";position:absolute;left:50%;top:50%;background:#2b3037;transform-origin:center}.wheel:before{width:20px;height:45%;transform:translate(-50%,0)}.wheel:after{width:60%;height:20px;transform:translate(-50%,-50%)}\n.pedals{display:grid;gap:14px}.pedals button{height:120px;border:0;border-radius:20px;font-weight:900;font-size:18px}.go{background:#d8ff67;color:#12170a}.back{background:#ff775e;color:#1c0804}\n</style>\n</head>\n<body>\n\n<header><b>STEERING WHEEL</b><span>arraste o volante para virar</span></header>\n<main><div class=\"wheelZone\"><div class=\"wheel\" id=\"wheel\"></div></div><div class=\"pedals\"><button class=\"go\" id=\"go\">ACELERAR</button><button class=\"back\" id=\"back\">RÉ</button></div></main>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\nlet steer=0,throttle=0;const wheel=document.getElementById('wheel');\nfunction mix(){sendSigned(throttle+steer,throttle-steer)}\nfunction steerAt(e){let r=wheel.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/(r.width/2);steer=Math.round(clamp(x,-1,1)*150);wheel.style.transform=`rotate(${steer/5}deg)`;mix()}\nwheel.onpointerdown=e=>{wheel.setPointerCapture?.(e.pointerId);steerAt(e)};wheel.onpointermove=e=>{if(e.buttons)steerAt(e)};wheel.onpointerup=()=>{steer=0;wheel.style.transform='rotate(0)';mix()};\nfunction bind(id,v){let b=document.getElementById(id);b.onpointerdown=()=>{throttle=v;mix()};b.onpointerup=b.onpointerleave=()=>{throttle=0;mix()}}\nbind('go',210);bind('back',-180);\n</script>\n</body>\n</html>", "touchpad": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Touchpad</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#0c0b12;color:#fff;font-family:Arial,sans-serif;height:100vh;overflow:hidden;touch-action:none}\nheader{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #282335}header b{font-size:12px;letter-spacing:.17em;color:#c184ff}\n.pad{margin:18px;height:calc(100vh - 94px);border:1px solid #342c43;border-radius:28px;position:relative;background:radial-gradient(circle at center,#20162d,#100d16)}\n.cross:before,.cross:after{content:\"\";position:absolute;background:#ffffff12}.cross:before{left:50%;top:0;bottom:0;width:1px}.cross:after{top:50%;left:0;right:0;height:1px}.dot{position:absolute;width:52px;height:52px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);background:#c184ff;box-shadow:0 0 32px #c184ff77}.info{position:absolute;top:16px;left:18px;color:#8a7a98;font-size:11px;letter-spacing:.12em}\n</style>\n</head>\n<body>\n\n<header><b>ONE TOUCHPAD</b><span>frente/trás + esterço em uma área</span></header>\n<div class=\"pad\" id=\"pad\"><div class=\"cross\"></div><div class=\"dot\" id=\"dot\"></div><div class=\"info\">ARRASTE • SOLTE PARA PARAR</div></div>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\nconst pad=document.getElementById('pad'),dot=document.getElementById('dot');let active=false;\nfunction move(e){let r=pad.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width*2-1,-1,1),y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);\ndot.style.left=((x+1)*50)+'%';dot.style.top=((y+1)*50)+'%';let t=-y*220,s=x*150;sendSigned(t+s,t-s)}\npad.onpointerdown=e=>{active=true;pad.setPointerCapture?.(e.pointerId);move(e)};pad.onpointermove=e=>{if(active)move(e)};pad.onpointerup=()=>{active=false;dot.style.left=dot.style.top='50%';sendSigned(0,0,true)}\n</script>\n</body>\n</html>", "dpad": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>D-Pad</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#111318;color:#fff;font-family:Arial,sans-serif;height:100vh;display:grid;place-items:center;overflow:hidden}\n.wrap{text-align:center}.wrap h2{font-size:12px;letter-spacing:.18em;color:#7b8797;margin:0 0 22px}.dpad{display:grid;grid-template-columns:110px 110px 110px;grid-template-rows:92px 92px 92px;gap:8px}.dpad button{border:0;border-radius:18px;background:#242933;color:#fff;font-size:30px}.dpad button:active{background:#4f7cff}.up{grid-column:2}.left{grid-row:2;grid-column:1}.stop{grid-row:2;grid-column:2;background:#e74b55!important;font-size:12px!important;font-weight:bold}.right{grid-row:2;grid-column:3}.down{grid-row:3;grid-column:2}\n</style>\n</head>\n<body>\n\n<div class=\"wrap\"><h2>CLASSIC D-PAD</h2><div class=\"dpad\"><button class=\"up\" data-a=\"220\" data-b=\"220\">▲</button><button class=\"left\" data-a=\"-170\" data-b=\"170\">◀</button><button class=\"stop\" onclick=\"stopAll()\">STOP</button><button class=\"right\" data-a=\"170\" data-b=\"-170\">▶</button><button class=\"down\" data-a=\"-200\" data-b=\"-200\">▼</button></div></div>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('[data-a]').forEach(b=>{const a=Number(b.dataset.a),c=Number(b.dataset.b);b.onpointerdown=()=>sendSigned(a,c,true);b.onpointerup=b.onpointerleave=()=>sendSigned(0,0,true)})\n</script>\n</body>\n</html>", "tilt_landscape": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Inclinação — Paisagem</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#061417;color:white;font-family:Arial,sans-serif;height:100vh;overflow:hidden;touch-action:none}\nheader{height:58px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #163438}header b{font-size:11px;letter-spacing:.17em;color:#4ee6cd}#sensorStatus{font-size:10px;color:#6e928e}\nmain{height:calc(100vh - 58px);display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:20px 34px;gap:28px}.phone{width:min(34vw,240px);aspect-ratio:1.8;border:10px solid #25363a;border-radius:28px;margin:auto;position:relative;background:#0c2024;transition:.08s}.phone:after{content:\"\";position:absolute;width:34px;height:5px;background:#446267;border-radius:5px;right:8px;top:50%;transform:translateY(-50%)}.meters{display:grid;gap:14px}.meter label{display:flex;justify-content:space-between;font-size:11px;color:#78918e}.bar{height:12px;background:#14272a;border-radius:10px;overflow:hidden}.bar i{display:block;height:100%;width:50%;background:#4ee6cd;transition:.08s}\n.actions{display:flex;gap:8px}.actions button{border:1px solid #315258;background:transparent;color:#b9d7d3;border-radius:999px;padding:10px 14px;font-weight:bold}.actions button.on{background:#4ee6cd;color:#06201b}\n.manual{display:grid;grid-template-columns:1fr 1fr;gap:8px}.manual button{border:0;background:#173338;color:#d9f2ee;border-radius:12px;padding:13px}\n</style>\n</head>\n<body>\n\n<header><b>TILT • LANDSCAPE</b><span id=\"sensorStatus\">TOQUE EM ATIVAR</span></header>\n<main><div><div class=\"phone\" id=\"phone\"></div></div><div class=\"meters\">\n<div class=\"meter\"><label><span>ACELERAÇÃO</span><span id=\"thv\">0</span></label><div class=\"bar\"><i id=\"thbar\"></i></div></div>\n<div class=\"meter\"><label><span>ESTERÇO</span><span id=\"stv\">0</span></label><div class=\"bar\"><i id=\"stbar\"></i></div></div>\n<div class=\"actions\"><button id=\"enable\" onclick=\"enableSensor()\">ATIVAR SENSOR</button><button onclick=\"calibrate()\">CALIBRAR</button></div>\n<div class=\"manual\"><button onpointerdown=\"sendSigned(180,180)\" onpointerup=\"sendSigned(0,0)\">FRENTE</button><button onpointerdown=\"sendSigned(-160,-160)\" onpointerup=\"sendSigned(0,0)\">RÉ</button></div>\n</div></main>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\nlet sensorOn=false,zeroBeta=0,zeroGamma=0,lastBeta=0,lastGamma=0;\nconst statusEl=document.getElementById('sensorStatus');\nasync function enableSensor(){\n try{\n  if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){\n    const p=await DeviceOrientationEvent.requestPermission(); if(p!=='granted')throw new Error('Permissão negada');\n  }\n  window.addEventListener('deviceorientation',orientation,true);sensorOn=true;\n  if(statusEl)statusEl.textContent='SENSOR ATIVO';\n  document.getElementById('enable')?.classList.add('on');\n }catch(e){if(statusEl)statusEl.textContent='USE O CONTROLE MANUAL';}\n}\nfunction calibrate(){zeroBeta=lastBeta;zeroGamma=lastGamma;if(statusEl)statusEl.textContent='CALIBRADO';}\n\nfunction orientation(e){lastBeta=e.beta||0;lastGamma=e.gamma||0;\n // Para celular deitado: beta (inclinação frente/trás) e gamma (esterço).\n let t=clamp((lastBeta-zeroBeta)/28,-1,1),s=clamp((lastGamma-zeroGamma)/32,-1,1);\n if(Math.abs(t)<.08)t=0;if(Math.abs(s)<.08)s=0;\n let throttle=-t*220,steer=s*150;sendSigned(throttle+steer,throttle-steer);\n phone.style.transform=`rotate(${s*14}deg) rotateX(${t*18}deg)`;\n thv.textContent=Math.round(throttle);stv.textContent=Math.round(steer);thbar.style.width=(50+t*45)+'%';stbar.style.width=(50+s*45)+'%';\n}\n</script>\n</body>\n</html>", "tilt_portrait": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Inclinação — Retrato</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:linear-gradient(180deg,#1a0f24,#09070c);color:#fff;font-family:Arial,sans-serif;height:100vh;overflow:hidden}\nheader{height:58px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #35233d}header b{font-size:11px;letter-spacing:.17em;color:#ef83ff}header span{font-size:10px;color:#987aa0}\nmain{height:calc(100vh - 58px);display:grid;place-items:center}.content{text-align:center}.phone{width:135px;height:245px;border:9px solid #442f49;border-radius:30px;background:#211526;margin:0 auto 22px;transition:.08s;position:relative}.phone:before{content:\"\";position:absolute;top:8px;left:50%;transform:translateX(-50%);width:48px;height:5px;border-radius:5px;background:#65496b}\n.values{display:flex;justify-content:center;gap:32px;margin-bottom:18px}.values div{font-size:32px;font-weight:900}.values small{display:block;font-size:9px;color:#8f7496;letter-spacing:.12em;margin-bottom:4px}\nbutton{border:1px solid #5a3a61;background:transparent;color:#ead9ef;border-radius:999px;padding:11px 15px;font-weight:bold;margin:4px}button.on{background:#ef83ff;color:#2b0d31}\n</style>\n</head>\n<body>\n\n<header><b>TILT • PORTRAIT</b><span id=\"sensorStatus\">SENSOR DESATIVADO</span></header><main><div class=\"content\">\n<div class=\"phone\" id=\"phone\"></div><div class=\"values\"><div><small>FRENTE/RÉ</small><span id=\"v1\">0</span></div><div><small>GIRO</small><span id=\"v2\">0</span></div></div>\n<button id=\"enable\" onclick=\"enableSensor()\">ATIVAR SENSOR</button><button onclick=\"calibrate()\">CALIBRAR</button>\n</div></main>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\nlet sensorOn=false,zeroBeta=0,zeroGamma=0,lastBeta=0,lastGamma=0;\nconst statusEl=document.getElementById('sensorStatus');\nasync function enableSensor(){\n try{\n  if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){\n    const p=await DeviceOrientationEvent.requestPermission(); if(p!=='granted')throw new Error('Permissão negada');\n  }\n  window.addEventListener('deviceorientation',orientation,true);sensorOn=true;\n  if(statusEl)statusEl.textContent='SENSOR ATIVO';\n  document.getElementById('enable')?.classList.add('on');\n }catch(e){if(statusEl)statusEl.textContent='USE O CONTROLE MANUAL';}\n}\nfunction calibrate(){zeroBeta=lastBeta;zeroGamma=lastGamma;if(statusEl)statusEl.textContent='CALIBRADO';}\n\nfunction orientation(e){lastBeta=e.beta||0;lastGamma=e.gamma||0;\n let t=clamp((lastBeta-zeroBeta)/35,-1,1),s=clamp((lastGamma-zeroGamma)/30,-1,1);if(Math.abs(t)<.07)t=0;if(Math.abs(s)<.07)s=0;\n let throttle=-t*205,steer=s*145;sendSigned(throttle+steer,throttle-steer);phone.style.transform=`rotate(${s*12}deg) rotateX(${t*12}deg)`;\n v1.textContent=Math.round(throttle);v2.textContent=Math.round(steer)}\n</script>\n</body>\n</html>", "tilt_tank": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Inclinação — Tank</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#11140b;color:#f1f4df;font-family:Arial,sans-serif;height:100vh;overflow:hidden}\nheader{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #343a22}header b{font-size:11px;letter-spacing:.17em;color:#d5e564}header span{font-size:10px;color:#8b9170}\nmain{height:calc(100vh - 58px);display:grid;grid-template-columns:1fr 1fr;gap:22px;padding:28px}.gauge{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:15px}.line{height:55vh;width:48px;background:#242a17;border-radius:30px;position:relative}.fill{position:absolute;left:6px;right:6px;top:50%;bottom:50%;background:#d5e564;border-radius:20px}.num{font-size:42px;font-weight:900}.gauge small{letter-spacing:.14em;color:#899064}.actions{position:fixed;left:50%;bottom:15px;transform:translateX(-50%);display:flex;gap:8px}.actions button{border:1px solid #49512e;background:#181d10;color:#edf5c8;border-radius:999px;padding:9px 13px}.actions button.on{background:#d5e564;color:#151809}\n</style>\n</head>\n<body>\n\n<header><b>TILT TANK</b><span id=\"sensorStatus\">INCLINE CADA LADO</span></header><main>\n<div class=\"gauge\"><small>MOTOR ESQUERDO</small><div class=\"line\"><i class=\"fill\" id=\"fa\"></i></div><div class=\"num\" id=\"na\">0</div></div>\n<div class=\"gauge\"><small>MOTOR DIREITO</small><div class=\"line\"><i class=\"fill\" id=\"fb\"></i></div><div class=\"num\" id=\"nb\">0</div></div>\n</main><div class=\"actions\"><button id=\"enable\" onclick=\"enableSensor()\">ATIVAR</button><button onclick=\"calibrate()\">CALIBRAR</button></div>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\nlet sensorOn=false,zeroBeta=0,zeroGamma=0,lastBeta=0,lastGamma=0;\nconst statusEl=document.getElementById('sensorStatus');\nasync function enableSensor(){\n try{\n  if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){\n    const p=await DeviceOrientationEvent.requestPermission(); if(p!=='granted')throw new Error('Permissão negada');\n  }\n  window.addEventListener('deviceorientation',orientation,true);sensorOn=true;\n  if(statusEl)statusEl.textContent='SENSOR ATIVO';\n  document.getElementById('enable')?.classList.add('on');\n }catch(e){if(statusEl)statusEl.textContent='USE O CONTROLE MANUAL';}\n}\nfunction calibrate(){zeroBeta=lastBeta;zeroGamma=lastGamma;if(statusEl)statusEl.textContent='CALIBRADO';}\n\nfunction orientation(e){lastBeta=e.beta||0;lastGamma=e.gamma||0;\n // mistura inclinacao longitudinal com roll para criar duas esteiras\n let forward=clamp((zeroBeta-lastBeta)/30,-1,1),diff=clamp((lastGamma-zeroGamma)/28,-1,1);\n let a=(forward+diff*.7)*220,b=(forward-diff*.7)*220;a=clamp(a,-255,255);b=clamp(b,-255,255);sendSigned(a,b);\n na.textContent=Math.round(a);nb.textContent=Math.round(b);\n const paint=(el,v)=>{if(v>=0){el.style.top=(50-v/255*48)+'%';el.style.bottom='50%'}else{el.style.top='50%';el.style.bottom=(50+v/255*48)+'%'}};\n paint(fa,a);paint(fb,b)}\n</script>\n</body>\n</html>", "tilt_hybrid": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Inclinação + Touch</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#07111f;color:#fff;font-family:Arial,sans-serif;height:100vh;overflow:hidden;touch-action:none}\nheader{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #16304b}header b{font-size:11px;letter-spacing:.17em;color:#48a7ff}header span{font-size:10px;color:#66829e}\nmain{height:calc(100vh - 58px);display:grid;grid-template-columns:.8fr 1.2fr;gap:20px;padding:22px}.tilt{display:flex;flex-direction:column;align-items:center;justify-content:center}.phone{width:170px;height:100px;border:8px solid #274766;border-radius:22px;background:#0d2237;transition:.08s}.tilt strong{font-size:48px;margin-top:16px}.steer{position:relative;background:#0b1a2b;border:1px solid #214364;border-radius:24px}.steer:after{content:\"\";position:absolute;left:50%;top:10%;bottom:10%;width:1px;background:#315a7e}.knob{position:absolute;left:50%;top:50%;width:60px;height:60px;border-radius:50%;background:#48a7ff;transform:translate(-50%,-50%);box-shadow:0 0 25px #48a7ff66}.actions{position:absolute;left:12px;top:12px;display:flex;gap:7px}.actions button{border:1px solid #2e577e;background:#0e263d;color:#b9dfff;border-radius:999px;padding:8px 11px;font-size:10px}\n</style>\n</head>\n<body>\n\n<header><b>HYBRID TILT</b><span id=\"sensorStatus\">INCLINAÇÃO = ACELERAÇÃO</span></header><main>\n<div class=\"tilt\"><div class=\"phone\" id=\"phone\"></div><strong id=\"tv\">0</strong><div class=\"actions\"><button id=\"enable\" onclick=\"enableSensor()\">ATIVAR</button><button onclick=\"calibrate()\">CALIBRAR</button></div></div>\n<div class=\"steer\" id=\"steer\"><div class=\"knob\" id=\"knob\"></div></div></main>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\nlet sensorOn=false,zeroBeta=0,zeroGamma=0,lastBeta=0,lastGamma=0;\nconst statusEl=document.getElementById('sensorStatus');\nasync function enableSensor(){\n try{\n  if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){\n    const p=await DeviceOrientationEvent.requestPermission(); if(p!=='granted')throw new Error('Permissão negada');\n  }\n  window.addEventListener('deviceorientation',orientation,true);sensorOn=true;\n  if(statusEl)statusEl.textContent='SENSOR ATIVO';\n  document.getElementById('enable')?.classList.add('on');\n }catch(e){if(statusEl)statusEl.textContent='USE O CONTROLE MANUAL';}\n}\nfunction calibrate(){zeroBeta=lastBeta;zeroGamma=lastGamma;if(statusEl)statusEl.textContent='CALIBRADO';}\n\nlet throttle=0,steering=0;function mix(){sendSigned(throttle+steering,throttle-steering)}\nfunction orientation(e){lastBeta=e.beta||0;lastGamma=e.gamma||0;let t=clamp((zeroBeta-lastBeta)/30,-1,1);if(Math.abs(t)<.08)t=0;throttle=t*215;tv.textContent=Math.round(throttle);phone.style.transform=`rotateX(${t*16}deg)`;mix()}\nlet active=false;function smove(e){let r=steer.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);steering=x*155;knob.style.left=((x+1)*50)+'%';mix()}\nsteer.onpointerdown=e=>{active=true;steer.setPointerCapture?.(e.pointerId);smove(e)};steer.onpointermove=e=>{if(active)smove(e)};steer.onpointerup=()=>{active=false;steering=0;knob.style.left='50%';mix()}\n</script>\n</body>\n</html>", "gyro_wheel": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Giro — Volante</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#130b0a;color:white;font-family:Arial,sans-serif;height:100vh;overflow:hidden}\nheader{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #3d2520}header b{font-size:11px;letter-spacing:.17em;color:#ff8a63}header span{font-size:10px;color:#9e766c}\nmain{height:calc(100vh - 58px);display:grid;grid-template-columns:1fr .7fr;gap:30px;align-items:center;padding:20px 30px}.wheel{width:min(48vw,320px);aspect-ratio:1;border:23px solid #49312d;border-radius:50%;margin:auto;position:relative;transition:.07s}.wheel:after{content:\"\";position:absolute;left:15%;right:15%;top:50%;height:18px;background:#49312d;transform:translateY(-50%)}\n.controls{display:grid;gap:12px}.controls button{height:82px;border:0;border-radius:16px;font-weight:900}.enable{height:48px!important;border:1px solid #65443d!important;background:transparent!important;color:#ffd5ca}.enable.on{background:#ff8a63!important;color:#2b0f08!important}.go{background:#ffd166}.back{background:#ef6f6c}.cal{background:#31201d!important;color:#dba99d}\n</style>\n</head>\n<body>\n\n<header><b>GYRO WHEEL</b><span id=\"sensorStatus\">GIRO DO CELULAR = DIREÇÃO</span></header><main><div class=\"wheel\" id=\"wheel\"></div><div class=\"controls\"><button class=\"enable\" id=\"enable\" onclick=\"enableSensor()\">ATIVAR SENSOR</button><button class=\"go\" id=\"go\">ACELERAR</button><button class=\"back\" id=\"back\">RÉ</button><button class=\"cal\" onclick=\"calibrate()\">CENTRALIZAR</button></div></main>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\nlet sensorOn=false,zeroBeta=0,zeroGamma=0,lastBeta=0,lastGamma=0;\nconst statusEl=document.getElementById('sensorStatus');\nasync function enableSensor(){\n try{\n  if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){\n    const p=await DeviceOrientationEvent.requestPermission(); if(p!=='granted')throw new Error('Permissão negada');\n  }\n  window.addEventListener('deviceorientation',orientation,true);sensorOn=true;\n  if(statusEl)statusEl.textContent='SENSOR ATIVO';\n  document.getElementById('enable')?.classList.add('on');\n }catch(e){if(statusEl)statusEl.textContent='USE O CONTROLE MANUAL';}\n}\nfunction calibrate(){zeroBeta=lastBeta;zeroGamma=lastGamma;if(statusEl)statusEl.textContent='CALIBRADO';}\n\nlet steer=0,throttle=0;function mix(){sendSigned(throttle+steer,throttle-steer)}\nfunction orientation(e){lastBeta=e.beta||0;lastGamma=e.gamma||0;let s=clamp((lastGamma-zeroGamma)/32,-1,1);if(Math.abs(s)<.06)s=0;steer=s*160;wheel.style.transform=`rotate(${s*32}deg)`;mix()}\nfunction bind(id,v){let b=document.getElementById(id);b.onpointerdown=()=>{throttle=v;mix()};b.onpointerup=b.onpointerleave=()=>{throttle=0;mix()}}\nbind('go',210);bind('back',-180)\n</script>\n</body>\n</html>", "split_pad": "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no\">\n<title>Split Pad</title>\n<style>\n*{box-sizing:border-box;user-select:none}body{margin:0;background:#080912;color:#fff;font-family:Arial,sans-serif;height:100vh;overflow:hidden;touch-action:none}\nmain{height:100vh;display:grid;grid-template-columns:1fr 1fr}.half{position:relative;display:grid;place-items:center}.half:first-child{background:linear-gradient(145deg,#321258,#110820)}.half:last-child{background:linear-gradient(145deg,#06365a,#06101c)}.zone{width:72%;height:72%;border-radius:40px;border:1px solid #ffffff25;position:relative}.zone:after{content:\"\";position:absolute;top:50%;left:12%;right:12%;height:1px;background:#ffffff24}.dot{position:absolute;left:50%;top:50%;width:64px;height:64px;border-radius:50%;transform:translate(-50%,-50%);background:#fff}.name{position:absolute;top:18px;left:20px;font-size:10px;letter-spacing:.16em;color:#ffffff77}\n</style>\n</head>\n<body>\n\n<main><div class=\"half\"><div class=\"name\">LEFT MOTOR</div><div class=\"zone\" data-m=\"A\"><i class=\"dot\"></i></div></div><div class=\"half\"><div class=\"name\">RIGHT MOTOR</div><div class=\"zone\" data-m=\"B\"><i class=\"dot\"></i></div></div></main>\n\n<script>\nconst clamp=(v,a,b)=>Math.max(a,Math.min(b,v));\nlet lastA=999,lastB=999,lastT=0;\nfunction sendSigned(a,b,force=false){\n  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));\n  const now=Date.now();\n  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;\n  lastT=now; lastA=a; lastB=b;\n  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});\n  send('A',a); send('B',b);\n}\nfunction stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }\nwindow.addEventListener('pagehide',stopAll);\n\ndocument.querySelectorAll('.zone').forEach(z=>{let active=false,m=z.dataset.m,d=z.querySelector('.dot');\nfunction move(e){let r=z.getBoundingClientRect(),y=clamp((e.clientY-r.top)/r.height,0,1),v=Math.round((.5-y)*510);d.style.top=(y*100)+'%';if(m==='A')sendSigned(v,lastB===999?0:lastB);else sendSigned(lastA===999?0:lastA,v)}\nz.onpointerdown=e=>{active=true;z.setPointerCapture?.(e.pointerId);move(e)};z.onpointermove=e=>{if(active)move(e)};z.onpointerup=()=>{active=false;d.style.top='50%';if(m==='A')sendSigned(0,lastB===999?0:lastB,true);else sendSigned(lastA===999?0:lastA,0,true)}})\n</script>\n</body>\n</html>"};

const state = {
  layout: "joystick",
  pins: [18, 32, 27, 26],
  assignments: ["motorA_frente","motorA_re","motorB_frente","motorB_re"]
};

const labels = {
  motorA_frente: "Motor esquerdo → frente",
  motorA_re: "Motor esquerdo → ré",
  motorB_frente: "Motor direito → frente",
  motorB_re: "Motor direito → ré"
};

const pinMap = document.getElementById("pinMap");
const preview = document.getElementById("preview");
const message = document.getElementById("message");
const ssidEl = document.getElementById("ssid");
const passEl = document.getElementById("password");

function renderPinMap() {
  pinMap.innerHTML = "";
  state.pins.forEach((pin, index) => {
    const card = document.createElement("div");
    card.className = "pin-card";
    const options = Object.entries(labels).map(([value,label]) =>
      `<option value="${value}" ${state.assignments[index] === value ? "selected" : ""}>${label}</option>`
    ).join("");
    card.innerHTML = `
      <div class="gpio-badge">GPIO ${pin}</div>
      <label class="field">
        <span>Função física</span>
        <select data-index="${index}">${options}</select>
      </label>`;
    pinMap.appendChild(card);
  });

  pinMap.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", e => {
      const idx = Number(e.target.dataset.index);
      const newValue = e.target.value;
      const oldValue = state.assignments[idx];
      const other = state.assignments.indexOf(newValue);
      if (other !== -1 && other !== idx) state.assignments[other] = oldValue;
      state.assignments[idx] = newValue;
      renderPinMap();
      updateSummary();
    });
  });
}

function selectLayout(name) {
  state.layout = name;
  document.querySelectorAll(".controller").forEach(card => {
    card.classList.toggle("selected", card.dataset.layout === name);
  });
  preview.srcdoc = layouts[name];
  const names = {
    "joystick":"Joystick duplo",
    "buttons":"Botões",
    "sliders":"Sliders",
    "arcade":"Arcade",
    "tank":"Tank Drive",
    "minimal":"Minimal",
    "wheel":"Volante",
    "touchpad":"Touchpad",
    "dpad":"D‑Pad",
    "tilt_landscape":"Inclinação • Paisagem",
    "tilt_portrait":"Inclinação • Retrato",
    "tilt_tank":"Inclinação • Tank",
    "tilt_hybrid":"Inclinação + Touch",
    "gyro_wheel":"Giro • Volante",
    "split_pad":"Split Pad"
  };
  const pn = document.getElementById("previewName");
  if (pn) pn.textContent = names[name] || name;
  updateSummary();
}

document.querySelectorAll(".controller").forEach(card => {
  card.addEventListener("click", () => selectLayout(card.dataset.layout));
});

document.querySelectorAll(".gpio-input").forEach(input => {
  input.addEventListener("input", e => {
    const idx = Number(e.target.dataset.slot);
    state.pins[idx] = Number(e.target.value);
    renderPinMap();
    updateSummary();
  });
});

function mapping() {
  const out = {};
  state.assignments.forEach((fn, i) => out[fn] = state.pins[i]);
  return out;
}

function cppEscape(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
}

function safeFilePart(value) {
  return String(value).trim().replace(/[^\p{L}\p{N}_-]+/gu, "_").replace(/^_+|_+$/g, "") || "ROBO_ESP32";
}

function validate() {
  const ssid = ssidEl.value.trim();
  const pass = passEl.value;
  if (!ssid) return "Informe um nome para a rede Wi‑Fi.";
  if (pass && pass.length < 8) return "A senha do ponto de acesso precisa ter pelo menos 8 caracteres, ou ficar vazia.";
  if (new Set(state.pins).size !== 4) return "Os quatro GPIOs precisam ser diferentes.";
  if (state.pins.some(p => !Number.isInteger(p) || p < 0)) return "Há um GPIO inválido.";
  if (new Set(state.assignments).size !== 4) return "Cada função de motor deve usar um GPIO diferente.";
  return "";
}

function generateFirmware() {
  const err = validate();
  if (err) throw new Error(err);

  const p = mapping();
  const ssid = cppEscape(ssidEl.value.trim());
  const password = cppEscape(passEl.value);
  const html = layouts[state.layout];

  return `#include <WiFi.h>
#include <WebServer.h>

/*
  Gerado por: Gerador ESP32 • Carrinho Wi-Fi
  Layout: ${state.layout}
  O ESP32 cria um Access Point e hospeda o controle no endereço 192.168.4.1.
*/

// ==================== REDE ====================
const char* ssid = "${ssid}";
const char* password = "${password}";

// ==================== MOTORES ====================
// Motor A = esquerdo | Motor B = direito
const int motorA_frente = ${p.motorA_frente};
const int motorA_re     = ${p.motorA_re};
const int motorB_frente = ${p.motorB_frente};
const int motorB_re     = ${p.motorB_re};

const int freq = 5000;
const int resolucao = 8;

WebServer server(80);

int velA = 0;
int velB = 0;
char dirA = 'U';
char dirB = 'U';

// Estados usados pelo layout de botões
bool A_frente_alta=false, A_frente_baixa=false, A_re_alta=false, A_re_baixa=false;
bool B_frente_alta=false, B_frente_baixa=false, B_re_alta=false, B_re_baixa=false;

const int VEL_ALTA = 255;
const int VEL_BAIXA = 180;

void aplicarMotor(int pinFrente, int pinRe, int velocidade, char direcao) {
  velocidade = constrain(velocidade, 0, 255);
  if (velocidade == 0) {
    ledcWrite(pinFrente, 0);
    ledcWrite(pinRe, 0);
  } else if (direcao == 'U') {
    ledcWrite(pinFrente, velocidade);
    ledcWrite(pinRe, 0);
  } else {
    ledcWrite(pinFrente, 0);
    ledcWrite(pinRe, velocidade);
  }
}

void atualizarMotorA() { aplicarMotor(motorA_frente, motorA_re, velA, dirA); }
void atualizarMotorB() { aplicarMotor(motorB_frente, motorB_re, velB, dirB); }

void pararTudo() {
  velA = velB = 0;
  A_frente_alta=A_frente_baixa=A_re_alta=A_re_baixa=false;
  B_frente_alta=B_frente_baixa=B_re_alta=B_re_baixa=false;
  atualizarMotorA();
  atualizarMotorB();
}

// ==================== PÁGINA DO CONTROLE ====================
String paginaHTML() {
  return R"PETHTML(
${html}
)PETHTML";
}

// ==================== ROTAS COMUNS ====================
void handleRoot() {
  server.send(200, "text/html; charset=utf-8", paginaHTML());
}

void handleJoystick() {
  if (!server.hasArg("m") || !server.hasArg("s") || !server.hasArg("d")) {
    server.send(400, "text/plain", "Parametros faltando");
    return;
  }
  char motor = server.arg("m")[0];
  int velocidade = constrain(server.arg("s").toInt(), 0, 255);
  char direcao = server.arg("d")[0];

  if (motor == 'A') { velA = velocidade; dirA = direcao; atualizarMotorA(); }
  if (motor == 'B') { velB = velocidade; dirB = direcao; atualizarMotorB(); }
  server.send(200, "text/plain", "OK");
}

void handleDir() {
  if (!server.hasArg("m") || !server.hasArg("d")) {
    server.send(400, "text/plain", "Parametros faltando");
    return;
  }
  char motor = server.arg("m")[0];
  char d = server.arg("d")[0]; // U = UP, D = DOWN
  if (motor == 'A') { dirA = d; atualizarMotorA(); }
  if (motor == 'B') { dirB = d; atualizarMotorB(); }
  server.send(200, "text/plain", "OK");
}

void handleSpeed() {
  if (!server.hasArg("m") || !server.hasArg("s")) {
    server.send(400, "text/plain", "Parametros faltando");
    return;
  }
  char motor = server.arg("m")[0];
  int velocidade = constrain(server.arg("s").toInt(), 0, 255);
  if (motor == 'A') { velA = velocidade; atualizarMotorA(); }
  if (motor == 'B') { velB = velocidade; atualizarMotorB(); }
  server.send(200, "text/plain", "OK");
}

String statusMotores() {
  int a = dirA == 'U' ? velA : -velA;
  int b = dirB == 'U' ? velB : -velB;
  return "A: " + String(a) + " | B: " + String(b);
}

void handleComando(String cmd) {
  if (cmd == "AF_A_ON") A_frente_alta = true;
  else if (cmd == "AF_A_OFF") A_frente_alta = false;
  else if (cmd == "AF_B_ON") A_frente_baixa = true;
  else if (cmd == "AF_B_OFF") A_frente_baixa = false;
  else if (cmd == "AR_B_ON") A_re_baixa = true;
  else if (cmd == "AR_B_OFF") A_re_baixa = false;
  else if (cmd == "AR_A_ON") A_re_alta = true;
  else if (cmd == "AR_A_OFF") A_re_alta = false;
  else if (cmd == "BF_A_ON") B_frente_alta = true;
  else if (cmd == "BF_A_OFF") B_frente_alta = false;
  else if (cmd == "BF_B_ON") B_frente_baixa = true;
  else if (cmd == "BF_B_OFF") B_frente_baixa = false;
  else if (cmd == "BR_B_ON") B_re_baixa = true;
  else if (cmd == "BR_B_OFF") B_re_baixa = false;
  else if (cmd == "BR_A_ON") B_re_alta = true;
  else if (cmd == "BR_A_OFF") B_re_alta = false;
  else if (cmd == "PARAR") { pararTudo(); server.send(200, "text/plain", statusMotores()); return; }

  // Converte os estados dos botões no mesmo modelo universal de velocidade/direção.
  if (A_frente_alta) { velA=VEL_ALTA; dirA='U'; }
  else if (A_frente_baixa) { velA=VEL_BAIXA; dirA='U'; }
  else if (A_re_baixa) { velA=VEL_BAIXA; dirA='D'; }
  else if (A_re_alta) { velA=VEL_ALTA; dirA='D'; }
  else velA=0;

  if (B_frente_alta) { velB=VEL_ALTA; dirB='U'; }
  else if (B_frente_baixa) { velB=VEL_BAIXA; dirB='U'; }
  else if (B_re_baixa) { velB=VEL_BAIXA; dirB='D'; }
  else if (B_re_alta) { velB=VEL_ALTA; dirB='D'; }
  else velB=0;

  atualizarMotorA();
  atualizarMotorB();
  server.send(200, "text/plain", statusMotores());
}

void setup() {
  Serial.begin(115200);

  // API LEDC do Arduino-ESP32 3.x, igual aos projetos-base de joystick/botões.
  ledcAttach(motorA_frente, freq, resolucao);
  ledcAttach(motorA_re, freq, resolucao);
  ledcAttach(motorB_frente, freq, resolucao);
  ledcAttach(motorB_re, freq, resolucao);
  pararTudo();

  if (strlen(password) == 0) WiFi.softAP(ssid);
  else WiFi.softAP(ssid, password);

  Serial.println();
  Serial.println("=== Carrinho ESP32 ===");
  Serial.print("SSID: "); Serial.println(ssid);
  Serial.print("IP: "); Serial.println(WiFi.softAPIP());

  server.on("/", handleRoot);
  server.on("/joy", handleJoystick);
  server.on("/dir", handleDir);
  server.on("/speed", handleSpeed);

  const char* comandos[] = {
    "AF_A_ON","AF_A_OFF","AF_B_ON","AF_B_OFF","AR_A_ON","AR_A_OFF","AR_B_ON","AR_B_OFF",
    "BF_A_ON","BF_A_OFF","BF_B_ON","BF_B_OFF","BR_A_ON","BR_A_OFF","BR_B_ON","BR_B_OFF","PARAR"
  };
  for (int i=0; i<17; i++) {
    String cmd = comandos[i];
    server.on(("/" + cmd).c_str(), [cmd]() { handleComando(cmd); });
  }

  server.begin();
}

void loop() {
  server.handleClient();
}
`;
}

function updateSummary() {
  const p = mapping();
  const names = {
    "joystick":"Joystick duplo",
    "buttons":"Botões",
    "sliders":"Sliders",
    "arcade":"Arcade",
    "tank":"Tank Drive",
    "minimal":"Minimal",
    "wheel":"Volante",
    "touchpad":"Touchpad",
    "dpad":"D‑Pad",
    "tilt_landscape":"Inclinação • Paisagem",
    "tilt_portrait":"Inclinação • Retrato",
    "tilt_tank":"Inclinação • Tank",
    "tilt_hybrid":"Inclinação + Touch",
    "gyro_wheel":"Giro • Volante",
    "split_pad":"Split Pad"
  };
  document.getElementById("summary").innerHTML = `
    <div><span>INTERFACE</span><b>${names[state.layout] || state.layout}</b></div>
    <div><span>MOTOR ESQUERDO</span><b>Frente GPIO ${p.motorA_frente} · Ré GPIO ${p.motorA_re}</b></div>
    <div><span>MOTOR DIREITO</span><b>Frente GPIO ${p.motorB_frente} · Ré GPIO ${p.motorB_re}</b></div>`;
}

function downloadText(filename, text) {
  const blob = new Blob([text], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById("generate").addEventListener("click", () => {
  try {
    const code = generateFirmware();
    const name = `carrinho_${safeFilePart(ssidEl.value)}_${state.layout}.ino`;
    downloadText(name, code);
    message.className = "message";
    message.textContent = `Arquivo ${name} gerado com sucesso.`;
  } catch (e) {
    message.className = "message error";
    message.textContent = e.message;
  }
});

document.getElementById("copyCode").addEventListener("click", async () => {
  try {
    const code = generateFirmware();
    await navigator.clipboard.writeText(code);
    message.className = "message";
    message.textContent = "Código copiado.";
  } catch (e) {
    message.className = "message error";
    message.textContent = e.message || "Não foi possível copiar.";
  }
});

document.getElementById("openPreview").addEventListener("click", () => {
  const blob = new Blob([layouts[state.layout]], {type:"text/html"});
  window.open(URL.createObjectURL(blob), "_blank");
});

ssidEl.addEventListener("input", updateSummary);
passEl.addEventListener("input", updateSummary);


const rail = document.getElementById("controllerRail");
document.getElementById("railLeft")?.addEventListener("click", () => rail.scrollBy({left:-420, behavior:"smooth"}));
document.getElementById("railRight")?.addEventListener("click", () => rail.scrollBy({left:420, behavior:"smooth"}));

renderPinMap();
selectLayout("joystick");
updateSummary();

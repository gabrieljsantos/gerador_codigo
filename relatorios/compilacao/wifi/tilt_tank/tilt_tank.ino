#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>

/*
  Gerado por: Gerador ESP32 • Carrinho Wi-Fi
  Layout: tilt_tank
  O ESP32 cria um Access Point e hospeda o controle no endereço 192.168.4.1.
*/

// ==================== REDE ====================
const char* ssid = "ROBO_ESP32";
const char* password = "12345678";
const char* deviceName = "robo-teste";
const bool conectarRedeExistente = false;

// ==================== MOTORES ====================
// Motor A = esquerdo | Motor B = direito
const int motorA_frente = 18;
const int motorA_re     = 32;
const int motorB_frente = 27;
const int motorB_re     = 26;

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
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Inclinação — Tank</title>
<style>
*{box-sizing:border-box;user-select:none}body{margin:0;background:#11140b;color:#f1f4df;font-family:Arial,sans-serif;height:100vh;overflow:hidden}
header{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #343a22}header b{font-size:11px;letter-spacing:.17em;color:#d5e564}header span{font-size:10px;color:#8b9170}
main{height:calc(100vh - 58px);display:grid;grid-template-columns:1fr 1fr;gap:22px;padding:28px}.gauge{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:15px}.line{height:55vh;width:48px;background:#242a17;border-radius:30px;position:relative}.fill{position:absolute;left:6px;right:6px;top:50%;bottom:50%;background:#d5e564;border-radius:20px}.num{font-size:42px;font-weight:900}.gauge small{letter-spacing:.14em;color:#899064}.actions{position:fixed;left:50%;bottom:15px;transform:translateX(-50%);display:flex;gap:8px}.actions button{border:1px solid #49512e;background:#181d10;color:#edf5c8;border-radius:999px;padding:9px 13px}.actions button.on{background:#d5e564;color:#151809}
</style>
</head>
<body>

<header><b>TILT TANK</b><span id="sensorStatus">INCLINE CADA LADO</span></header><main>
<div class="gauge"><small>MOTOR ESQUERDO</small><div class="line"><i class="fill" id="fa"></i></div><div class="num" id="na">0</div></div>
<div class="gauge"><small>MOTOR DIREITO</small><div class="line"><i class="fill" id="fb"></i></div><div class="num" id="nb">0</div></div>
</main><div class="actions"><button id="enable" onclick="enableSensor()">ATIVAR</button><button onclick="calibrate()">CALIBRAR</button></div>

<script>
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let lastA=999,lastB=999,lastT=0;
function sendSigned(a,b,force=false){
  a=Math.round(clamp(a,-255,255)); b=Math.round(clamp(b,-255,255));
  const now=Date.now();
  if(!force && now-lastT<55 && Math.abs(a-lastA)<3 && Math.abs(b-lastB)<3) return;
  lastT=now; lastA=a; lastB=b;
  const send=(m,v)=>fetch(`/joy?m=${m}&s=${Math.abs(v)}&d=${v>=0?'U':'D'}`).catch(()=>{});
  send('A',a); send('B',b);
}
function stopAll(){ lastA=lastB=0; fetch('/PARAR').catch(()=>{}); }
window.addEventListener('pagehide',stopAll);

let sensorOn=false,zeroBeta=0,zeroGamma=0,lastBeta=0,lastGamma=0;
const statusEl=document.getElementById('sensorStatus');
async function enableSensor(){
 try{
  if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
    const p=await DeviceOrientationEvent.requestPermission(); if(p!=='granted')throw new Error('Permissão negada');
  }
  window.addEventListener('deviceorientation',orientation,true);sensorOn=true;
  if(statusEl)statusEl.textContent='SENSOR ATIVO';
  document.getElementById('enable')?.classList.add('on');
 }catch(e){if(statusEl)statusEl.textContent='USE O CONTROLE MANUAL';}
}
function calibrate(){zeroBeta=lastBeta;zeroGamma=lastGamma;if(statusEl)statusEl.textContent='CALIBRADO';}

function orientation(e){lastBeta=e.beta||0;lastGamma=e.gamma||0;
 // mistura inclinacao longitudinal com roll para criar duas esteiras
 let forward=clamp((zeroBeta-lastBeta)/30,-1,1),diff=clamp((lastGamma-zeroGamma)/28,-1,1);
 let a=(forward+diff*.7)*220,b=(forward-diff*.7)*220;a=clamp(a,-255,255);b=clamp(b,-255,255);sendSigned(a,b);
 na.textContent=Math.round(a);nb.textContent=Math.round(b);
 const paint=(el,v)=>{if(v>=0){el.style.top=(50-v/255*48)+'%';el.style.bottom='50%'}else{el.style.top='50%';el.style.bottom=(50+v/255*48)+'%'}};
 paint(fa,a);paint(fb,b)}
</script>
</body>
</html>
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

  if (conectarRedeExistente) {
    WiFi.mode(WIFI_STA); WiFi.setHostname(deviceName); WiFi.begin(ssid, password);
    Serial.print("Conectando");
    unsigned long inicio = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - inicio < 20000) { delay(350); Serial.print("."); }
    if (WiFi.status() != WL_CONNECTED) { Serial.println("\nFalha ao conectar. Reinicie e confira SSID/senha."); }
  } else {
    WiFi.mode(WIFI_AP);
    if (strlen(password) == 0) WiFi.softAP(ssid); else WiFi.softAP(ssid, password);
  }
  if (MDNS.begin(deviceName)) MDNS.addService("http", "tcp", 80);

  Serial.println();
  Serial.println("=== Carrinho ESP32 ===");
  Serial.print("SSID: "); Serial.println(ssid);
  Serial.print("IP: "); Serial.println(conectarRedeExistente ? WiFi.localIP() : WiFi.softAPIP());
  Serial.print("Nome: http://"); Serial.print(deviceName); Serial.println(".local");

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

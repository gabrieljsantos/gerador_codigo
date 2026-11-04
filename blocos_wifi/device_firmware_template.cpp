#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <ESPmDNS.h>

const char* SSID="__SSID__";
const char* PASS="__PASS__";
const char* DEVICE_NAME="__DEVICE_NAME__";
const bool STATION_MODE=__STATION_MODE__;
int PINO_MOTOR_ESQUERDO_FRENTE=__PIN_LF__;
int PINO_MOTOR_ESQUERDO_RE=__PIN_LR__;
int PINO_MOTOR_DIREITO_FRENTE=__PIN_RF__;
int PINO_MOTOR_DIREITO_RE=__PIN_RR__;
int GPIO_PINS[4]={__PIN_0__,__PIN_1__,__PIN_2__,__PIN_3__};
constexpr int FREQ=5000,BITS=8,MAX_INSTRUCOES=400,MAX_VARIAVEIS=16,MAX_LOOPS=12,CHUNK_SIZE=1200,MAX_PROJETO=9600;
WebServer server(80);
Preferences prefs;
String projeto;
String instrucoes[MAX_INSTRUCOES];
int totalInstrucoes=0,setupInstrucoes=0,pc=0,etapa=0,loopBase=0;
long variaveis[MAX_VARIAVEIS]={};
bool rodando=false,pausado=false,setupConcluido=false,esperando=false;
unsigned long prazo=0,resto=0;
struct LoopFrame{int inicio;int fim;long restante;};
LoopFrame pilha[MAX_LOOPS];
int profundidade=0;
int saidasPWM[4]={0,0,0,0};
const char PAGINA[] PROGMEM=R"CFHTML(__PAGE__)CFHTML";
const char PROJETO_INICIAL[] PROGMEM=R"CFPROJECT(__PROJECT__)CFPROJECT";

void aplicarPWM(){
  ledcWrite(PINO_MOTOR_ESQUERDO_FRENTE,saidasPWM[0]);
  ledcWrite(PINO_MOTOR_ESQUERDO_RE,saidasPWM[1]);
  ledcWrite(PINO_MOTOR_DIREITO_FRENTE,saidasPWM[2]);
  ledcWrite(PINO_MOTOR_DIREITO_RE,saidasPWM[3]);
}
void parar(){for(int i=0;i<4;i++)saidasPWM[i]=0;aplicarPWM();}
void motorA(bool frente,int p){p=constrain(p,0,255);if(frente){saidasPWM[1]=0;saidasPWM[0]=p;}else{saidasPWM[0]=0;saidasPWM[1]=p;}aplicarPWM();}
void motorB(bool frente,int p){p=constrain(p,0,255);if(frente){saidasPWM[3]=0;saidasPWM[2]=p;}else{saidasPWM[2]=0;saidasPWM[3]=p;}aplicarPWM();}
void pararFisico(){ledcWrite(PINO_MOTOR_ESQUERDO_FRENTE,0);ledcWrite(PINO_MOTOR_ESQUERDO_RE,0);ledcWrite(PINO_MOTOR_DIREITO_FRENTE,0);ledcWrite(PINO_MOTOR_DIREITO_RE,0);}
String chunkKey(int i){return String("p")+String(i);}
String loadProject(){int count=prefs.getUChar("pc",0);String value;for(int i=0;i<count;i++)value+=prefs.getString(chunkKey(i).c_str(),"");return value;}
bool saveProject(const String&value){if(value.length()>MAX_PROJETO)return false;int old=prefs.getUChar("pc",0),count=(value.length()+CHUNK_SIZE-1)/CHUNK_SIZE;for(int i=0;i<old;i++)prefs.remove(chunkKey(i).c_str());for(int i=0;i<count;i++){String part=value.substring(i*CHUNK_SIZE,min((i+1)*CHUNK_SIZE,(int)value.length()));if(!prefs.putString(chunkKey(i).c_str(),part))return false;}return prefs.putUChar("pc",count)>0;}
int fieldInt(const String&value,int wanted){int start=0;for(int i=0;i<=wanted;i++){int end=value.indexOf(',',start);if(end<0)end=value.length();if(i==wanted)return value.substring(start,end).toInt();start=end+1;}return 0;}
String fieldText(const String&value,int wanted){int start=0;for(int i=0;i<=wanted;i++){int end=value.indexOf(',',start);if(end<0)end=value.length();if(i==wanted)return value.substring(start,end);start=end+1;}return String();}
bool propertyInt(const String&object,const char*name,int&result){String key=String("\"")+name+"\"";int at=object.indexOf(key);if(at<0)return false;int colon=object.indexOf(':',at+key.length());if(colon<0)return false;int end=colon+1;while(end<object.length()&&object[end]==' ')end++;int stop=end;if(object[stop]=='-')stop++;while(stop<object.length()&&isDigit(object[stop]))stop++;if(stop==end)return false;result=object.substring(end,stop).toInt();return true;}
bool aplicarHardware(const String&json){int start=json.indexOf("\"hardware\"");if(start<0)return false;start=json.indexOf('[',start);int finish=json.indexOf(']',start);if(start<0||finish<0)return false;int pins[4],roles[4],count=0,pos=start+1;while(pos<finish&&count<4){int a=json.indexOf('{',pos);if(a<0||a>=finish)break;int b=json.indexOf('}',a);if(b<0||b>finish)return false;String obj=json.substring(a,b+1);if(!propertyInt(obj,"pin",pins[count])||!propertyInt(obj,"role",roles[count]))return false;if(pins[count]<0||pins[count]>48||roles[count]<0||roles[count]>3)return false;count++;pos=b+1;}if(count!=4)return false;for(int i=0;i<4;i++)for(int j=i+1;j<4;j++)if(pins[i]==pins[j]||roles[i]==roles[j])return false;
  int next[4];for(int i=0;i<4;i++)next[roles[i]]=pins[i];int previous[]={PINO_MOTOR_ESQUERDO_FRENTE,PINO_MOTOR_ESQUERDO_RE,PINO_MOTOR_DIREITO_FRENTE,PINO_MOTOR_DIREITO_RE};
  for(int i=0;i<4;i++)ledcDetach(previous[i]);PINO_MOTOR_ESQUERDO_FRENTE=next[0];PINO_MOTOR_ESQUERDO_RE=next[1];PINO_MOTOR_DIREITO_FRENTE=next[2];PINO_MOTOR_DIREITO_RE=next[3];for(int i=0;i<4;i++)GPIO_PINS[i]=pins[i];
  for(int i=0;i<4;i++){pinMode(next[i],OUTPUT);ledcAttach(next[i],FREQ,BITS);}for(int i=0;i<4;i++)saidasPWM[i]=0;aplicarPWM();return true;}
void iniciarPrograma(const String&source){rodando=false;pausado=false;esperando=false;totalInstrucoes=setupInstrucoes=0;profundidade=0;for(int i=0;i<MAX_INSTRUCOES;i++)instrucoes[i]="";int start=0,lineNo=0;while(start<source.length()){int end=source.indexOf('\n',start);if(end<0)end=source.length();String line=source.substring(start,end);line.trim();if(lineNo==0){if(!line.startsWith("META,"))return;setupInstrucoes=fieldInt(line,1);int vars=fieldInt(line,2);if(vars<0||vars>MAX_VARIAVEIS)return;for(int i=0;i<MAX_VARIAVEIS;i++)variaveis[i]=0;}else if(line.length()){if(totalInstrucoes>=MAX_INSTRUCOES)return;instrucoes[totalInstrucoes++]=line;}lineNo++;start=end+1;}if(setupInstrucoes<0||setupInstrucoes>totalInstrucoes)return;loopBase=setupInstrucoes;pc=setupInstrucoes?0:loopBase;etapa=0;setupConcluido=setupInstrucoes==0;esperando=false;pausado=false;rodando=totalInstrucoes>0;prazo=millis();if(!rodando)parar();}
void executarPrograma(){if(!rodando||pausado)return;if(esperando){if((long)(millis()-prazo)<0)return;esperando=false;}for(int n=0;n<12&&rodando;n++){if(pc>=totalInstrucoes){if(!setupConcluido){setupConcluido=true;pc=loopBase;profundidade=0;if(pc>=totalInstrucoes){rodando=false;parar();return;}}else{pc=loopBase;profundidade=0;}}String line=instrucoes[pc];String op=fieldText(line,0);int a=fieldInt(line,1),b=fieldInt(line,2),c=fieldInt(line,3),d=fieldInt(line,4);etapa++;
  if(op=="MAF"){motorA(true,a);pc++;}else if(op=="MAB"){motorA(false,a);pc++;}else if(op=="MAS"){motorA(true,0);motorA(false,0);pc++;}else if(op=="MBF"){motorB(true,a);pc++;}else if(op=="MBB"){motorB(false,a);pc++;}else if(op=="MBS"){motorB(true,0);motorB(false,0);pc++;}else if(op=="GPIO"){if(a>=0&&a<4)digitalWrite(GPIO_PINS[a],b?HIGH:LOW);pc++;}else if(op=="WAIT"){pc++;prazo=millis()+(unsigned long)max(0,a);esperando=true;return;}else if(op=="SET"){if(a>=0&&a<MAX_VARIAVEIS)variaveis[a]=b;pc++;}else if(op=="ADD"){if(a>=0&&a<MAX_VARIAVEIS)variaveis[a]+=b;pc++;}
  else if(op=="REP"||op=="FOREVER"){long times=op=="FOREVER"?-1:a;int finish=op=="FOREVER"?a:b;if(times==0)pc=finish+1;else if(profundidade<MAX_LOOPS){pilha[profundidade++]={pc,finish,times};pc++;}else{rodando=false;parar();}}
  else if(op=="ENDREP"){if(profundidade){LoopFrame&frame=pilha[profundidade-1];if(frame.restante<0||--frame.restante>0)pc=frame.inicio+1;else{profundidade--;pc++;}}else pc++;}
  else if(op=="IF"){long x=(a>=0&&a<MAX_VARIAVEIS)?variaveis[a]:0;bool ok=b==0?x==c:b==1?x!=c:b==2?x<c:b==3?x<=c:b==4?x>c:x>=c;pc=ok?pc+1:d;}else if(op=="JUMP")pc=a;else pc++;
}}
void txt(String value,int code=200){server.send(code,"text/plain; charset=utf-8",value);}
void iniciarRede(){if(STATION_MODE){WiFi.mode(WIFI_STA);WiFi.setHostname(DEVICE_NAME);WiFi.begin(SSID,PASS);unsigned long start=millis();while(WiFi.status()!=WL_CONNECTED&&millis()-start<20000){delay(350);Serial.print('.');}}else{WiFi.mode(WIFI_AP);if(strlen(PASS)>=8)WiFi.softAP(SSID,PASS);else WiFi.softAP(SSID);}if(!STATION_MODE||WiFi.status()==WL_CONNECTED){if(MDNS.begin(DEVICE_NAME))MDNS.addService("http","tcp",80);}}
void setup(){Serial.begin(115200);ledcAttach(PINO_MOTOR_ESQUERDO_FRENTE,FREQ,BITS);ledcAttach(PINO_MOTOR_ESQUERDO_RE,FREQ,BITS);ledcAttach(PINO_MOTOR_DIREITO_FRENTE,FREQ,BITS);ledcAttach(PINO_MOTOR_DIREITO_RE,FREQ,BITS);pinMode(PINO_MOTOR_ESQUERDO_FRENTE,OUTPUT);pinMode(PINO_MOTOR_ESQUERDO_RE,OUTPUT);pinMode(PINO_MOTOR_DIREITO_FRENTE,OUTPUT);pinMode(PINO_MOTOR_DIREITO_RE,OUTPUT);parar();prefs.begin("ctrlforge",false);projeto=loadProject();if(!projeto.length())projeto=String(FPSTR(PROJETO_INICIAL));else aplicarHardware(projeto);iniciarRede();
 server.on("/",HTTP_GET,[]{server.sendHeader("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");server.sendHeader("Pragma","no-cache");server.sendHeader("Expires","0");server.send_P(200,"text/html; charset=utf-8",PAGINA);});
 server.on("/project",HTTP_GET,[]{server.send(200,"application/json",projeto);});
 server.on("/save",HTTP_POST,[]{String value=server.arg("plain");if(!value.startsWith("{")||!value.endsWith("}")){txt("Projeto inválido.",400);return;}if(value.length()>MAX_PROJETO){txt("Projeto maior que o espaço reservado no ESP32.",413);return;}if(!aplicarHardware(value)){txt("Mapa de GPIOs inválido.",400);return;}if(!saveProject(value)){txt("Falha ao salvar o projeto na memória do ESP32.",507);return;}projeto=value;txt("Projeto salvo no ESP32.");});
 server.on("/run",HTTP_POST,[]{String value=server.arg("plain");if(!value.startsWith("META,")){txt("Programa de blocos inválido.",400);return;}iniciarPrograma(value);if(!rodando){txt("Não há instruções válidas para executar.",400);return;}txt("Programa salvo e executando.");});
 server.on("/pause",HTTP_POST,[]{if(!rodando){txt("Nenhum programa em execução.");return;}if(!pausado){resto=esperando&&(long)(prazo-millis())>0?prazo-millis():0;pausado=true;pararFisico();txt("Programa pausado.");}else{pausado=false;if(esperando)prazo=millis()+resto;aplicarPWM();txt("Programa retomado.");}});
 server.on("/stop",HTTP_POST,[]{rodando=pausado=esperando=false;profundidade=0;parar();txt("Programa parado.");});
 server.on("/manual",HTTP_POST,[]{rodando=pausado=esperando=false;String value=server.arg("plain");char command=value.length()?value[0]:'S';if(command=='F'){motorA(true,200);motorB(true,200);}else if(command=='B'){motorA(false,200);motorB(false,200);}else if(command=='L'){motorA(false,200);motorB(true,200);}else if(command=='R'){motorA(true,200);motorB(false,200);}else if(command=='S')parar();else{txt("Comando manual inválido.",400);return;}txt("OK");});
 server.on("/status",HTTP_GET,[]{server.send(200,"application/json",String("{\"running\":")+(rodando?"true":"false")+",\"paused\":"+(pausado?"true":"false")+",\"step\":"+etapa+"}");});server.begin();Serial.print("Endereco: http://");Serial.print(DEVICE_NAME);Serial.println(".local");Serial.print("IP: ");Serial.println(STATION_MODE?WiFi.localIP():WiFi.softAPIP());}
void loop(){server.handleClient();executarPrograma();delay(2);}

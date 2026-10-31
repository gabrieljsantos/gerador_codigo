#include <Arduino.h>
#line 1 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"

#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
const char* WIFI_SSID="CTRL-FORGE";
const char* WIFI_PASS="12345678";
const char* DEVICE_NAME="robo-teste";
const bool STATION_MODE=false;
WebServer webServer(80);
#line 10 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void tarefaWeb(void*);
#line 11 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void iniciarRede();
#line 32 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void pararMotorA();
#line 37 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void pararMotorB();
#line 42 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void motorAFrente(int potencia);
#line 48 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void motorATras(int potencia);
#line 54 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void motorBFrente(int potencia);
#line 60 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void motorBTras(int potencia);
#line 66 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void setup();
#line 76 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void loop();
#line 10 "/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/blocos/controle_variaveis/controle_variaveis.ino"
void tarefaWeb(void*){for(;;){webServer.handleClient();delay(2);}}
void iniciarRede(){Serial.begin(115200);if(STATION_MODE){WiFi.mode(WIFI_STA);WiFi.setHostname(DEVICE_NAME);WiFi.begin(WIFI_SSID,WIFI_PASS);unsigned long inicio=millis();while(WiFi.status()!=WL_CONNECTED&&millis()-inicio<20000)delay(300);}else{WiFi.mode(WIFI_AP);if(strlen(WIFI_PASS)>=8)WiFi.softAP(WIFI_SSID,WIFI_PASS);else WiFi.softAP(WIFI_SSID);}MDNS.begin(DEVICE_NAME);MDNS.addService("http","tcp",80);webServer.on("/",[]{webServer.send(200,"text/plain; charset=utf-8","CTRL.FORGE BLOCKS: programa autonomo em execucao");});webServer.begin();Serial.print("Endereco: http://");Serial.print(DEVICE_NAME);Serial.println(".local");Serial.print("IP: ");Serial.println(STATION_MODE?WiFi.localIP():WiFi.softAPIP());xTaskCreatePinnedToCore(tarefaWeb,"web",4096,nullptr,1,nullptr,0);}

/*
 * teste_controle_variaveis.ino
 * Gerado por CTRL.FORGE BLOCKS V2
 * Controle independente dos motores com PWM de 0 a 255
 */

const int GPIO_1 = 18;
const int GPIO_2 = 32;
const int GPIO_3 = 27;
const int GPIO_4 = 26;

const int MOTOR_A_FRENTE = 18;
const int MOTOR_A_TRAS   = 32;
const int MOTOR_B_FRENTE = 27;
const int MOTOR_B_TRAS   = 26;

// Variáveis criadas nos blocos
long contador = 0;

void pararMotorA() {
  analogWrite(MOTOR_A_FRENTE, 0);
  analogWrite(MOTOR_A_TRAS, 0);
}

void pararMotorB() {
  analogWrite(MOTOR_B_FRENTE, 0);
  analogWrite(MOTOR_B_TRAS, 0);
}

void motorAFrente(int potencia) {
  potencia = constrain(potencia, 0, 255);
  analogWrite(MOTOR_A_TRAS, 0);
  analogWrite(MOTOR_A_FRENTE, potencia);
}

void motorATras(int potencia) {
  potencia = constrain(potencia, 0, 255);
  analogWrite(MOTOR_A_FRENTE, 0);
  analogWrite(MOTOR_A_TRAS, potencia);
}

void motorBFrente(int potencia) {
  potencia = constrain(potencia, 0, 255);
  analogWrite(MOTOR_B_TRAS, 0);
  analogWrite(MOTOR_B_FRENTE, potencia);
}

void motorBTras(int potencia) {
  potencia = constrain(potencia, 0, 255);
  analogWrite(MOTOR_B_FRENTE, 0);
  analogWrite(MOTOR_B_TRAS, potencia);
}

void setup() {
  iniciarRede();
  pinMode(GPIO_1, OUTPUT); pinMode(GPIO_2, OUTPUT);
  pinMode(GPIO_3, OUTPUT); pinMode(GPIO_4, OUTPUT);
  pararMotorA();
  pararMotorB();

  contador = 0;
}

void loop() {
  while (true) {
    for (int i_99u2x = 0; i_99u2x < 3; i_99u2x++) {
      contador += 1;
      if (contador < 5) {
        motorAFrente(200);
      } else {
        pararMotorA();
      }
      delay(50);
      // ciclo de teste
    }
  }
}


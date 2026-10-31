# Relatório de compilação dos geradores

Gerado em: 2026-10-31T13:51:58-03:00
Compilador: /home/heisenberg0x01/bin/arduino-cli
Placa: `esp32:esp32:esp32`

**Resultado:** 2 compilados, 17 falharam, 0 não executados.

O gerador `blocos_wifi` foi excluído conforme solicitado.

| Gerador | Caso | Resultado | Diagnóstico |
|---|---|---|---|
| Wi-Fi | joystick | falhou | Networking   3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/Network; WebServer    3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/WebServer; FS           3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/FS; ESPmDNS      3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/ESPmDNS; Hash         3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/Hash; Used platform Version Path; esp32:esp32   3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12; Error during build: exit status 2 |
| Wi-Fi | buttons | falhou | /home/heisenberg0x01/.arduino15/packages/esp32/tools/esp-x32/2601/bin/../lib/gcc/xtensa-esp-elf/14.2.0/../../../../xtensa-esp-elf/bin/ar: unable to copy file '/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/build/esp32/core/core.a'; reason: No such file or directory |
| Wi-Fi | sliders | falhou | Used platform Version Path; esp32:esp32   3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12; Error during build: cleaning build path: unlinkat /run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/build/esp32/core: directory not empty |
| Wi-Fi | arcade | falhou | collect2: error: ld returned 1 exit status |
| Wi-Fi | tank | falhou | Networking   3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/Network; WebServer    3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/WebServer; FS           3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/FS; ESPmDNS      3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/ESPmDNS; Hash         3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12/libraries/Hash; Used platform Version Path; esp32:esp32   3.3.12  /home/heisenberg0x01/.arduino15/packages/esp32/hardware/esp32/3.3.12; Error during build: exit status 1 |
| Wi-Fi | minimal | falhou | /home/heisenberg0x01/.arduino15/packages/esp32/tools/esp-x32/2601/bin/../lib/gcc/xtensa-esp-elf/14.2.0/../../../../xtensa-esp-elf/bin/ar: unable to copy file '/run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/build/esp32/core/core.a'; reason: No such file or directory |
| Wi-Fi | wheel | falhou | cc1plus: fatal error: /run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/build/esp32/sketch/wheel.ino.cpp.merged: No such file or directory |
| Wi-Fi | touchpad | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Wi-Fi | dpad | falhou | cc1plus: fatal error: /run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/build/esp32/sketch/dpad.ino.cpp.merged: No such file or directory |
| Wi-Fi | tilt_landscape | falhou | cc1plus: fatal error: /run/media/heisenberg0x01/SSD Kingston/PROJECTS/PET/FORMACAO/gerador_codigo/relatorios/compilacao/build/esp32/sketch/tilt_landscape.ino.cpp.merged: No such file or directory |
| Wi-Fi | tilt_portrait | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Wi-Fi | tilt_tank | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Wi-Fi | tilt_hybrid | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Wi-Fi | gyro_wheel | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Wi-Fi | split_pad | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Blocos tradicional | vazio | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Blocos tradicional | motores | falhou | xtensa-esp-elf-g++: fatal error: cannot specify '-o' with '-c', '-S' or '-E' with multiple files |
| Blocos tradicional | gpio_pulso | compilou | Sketch uses 967863 bytes (73%) of program storage space. Maximum is 1310720 bytes.; Global variables use 49628 bytes (15%) of dynamic memory, leaving 278052 bytes for local variables. Maximum is 327680 bytes. |
| Blocos tradicional | controle_variaveis | compilou | Sketch uses 967747 bytes (73%) of program storage space. Maximum is 1310720 bytes.; Global variables use 49628 bytes (15%) of dynamic memory, leaving 278052 bytes for local variables. Maximum is 327680 bytes. |

Os logs completos ficam na pasta `logs/`; os sketches compilados ficam organizados por gerador e caso.

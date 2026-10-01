# CTRL.FORGE — Blocos Wi-Fi

Gerador de firmware para carrinhos ESP32 programáveis pelo navegador.

1. Configure apenas a rede e as GPIOs no gerador.
2. Baixe e grave o `.ino` usando Arduino-ESP32 3.x.
3. Conecte o celular à rede criada pelo ESP32.
4. Abra `http://192.168.4.1`.
5. Monte, salve e execute a sequência na página hospedada pelo ESP32.

O site gerador não contém um editor de blocos. A página embarcada no `.ino` oferece blocos de movimento, ordenação adequada a telas touch, pausa/retomada, parada e controle manual. Projeto e programa compilado são persistidos em `Preferences` (NVS). O executor é não bloqueante, mantendo o servidor web responsivo durante os movimentos.

Em **Rede existente**, escolha um nome exclusivo para o carrinho. Ele será acessível por `http://nome-escolhido.local`; o IP atribuído pelo roteador também é impresso no Monitor Serial em 115200 baud. Para usar várias placas, dê um nome diferente a cada uma e mantenha o celular na mesma rede.

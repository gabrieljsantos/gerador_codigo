# CTRL.FORGE — Gerador ESP32

Gerador web estático de firmware `.ino` para carrinhos Wi‑Fi com ESP32.

## Catálogo de controles
O projeto inclui 15 interfaces completas. Há controles por joystick, botões, sliders, D‑Pad, touchpad, volante e vários modos baseados na inclinação/orientação do celular.

Modos com sensores:
- Inclinação • Paisagem
- Inclinação • Retrato
- Inclinação • Tank
- Inclinação + Touch
- Giro • Volante

Os controles por sensores têm botão de ativação e calibração. Isso atende navegadores que exigem interação do usuário antes de liberar `DeviceOrientation`.

## Miniaturas
Todas as miniaturas em `assets/previews/` são SVGs minimalistas e seguem a mesma linguagem visual. Elas são apenas representações do tipo de controle; a prévia grande do gerador renderiza o HTML real do layout escolhido.

## Assets
- `assets/gabriel-topo.png`
- `assets/gabriel-doacao.png`
- `assets/qrcode.svg`

## GPIOs padrão
18, 32, 27 e 26.

## Uso
Abra `index.html`, configure a rede e os motores, escolha uma interface e clique em `GERAR .INO`.

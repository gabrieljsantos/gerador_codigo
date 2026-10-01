# CTRL.FORGE — Gerador de Código

Portal local e expansível que reúne geradores de código. As duas opções atuais são para ESP32:

- `wifi/`: firmware para carrinhos controlados por Wi‑Fi, com catálogo de controles.
- `blocos/`: firmware autônomo criado por programação visual em blocos.
- `blocos_wifi/`: firmware com editor de movimentos em blocos hospedado pelo ESP32 e otimizado para celular.

Abra `index.html` para escolher uma opção. Novos geradores podem ser adicionados em novas pastas e cartões.

## Vários ESP32 na mesma rede

Nos geradores com servidor web, escolha **Rede existente** e informe o SSID e a senha do roteador. Defina um nome diferente para cada placa, usando letras, números e hífens, por exemplo:

- `carrinho-sala` → `http://carrinho-sala.local`
- `carrinho-lab` → `http://carrinho-lab.local`
- `carrinho-02` → `http://carrinho-02.local`

O roteador entrega um IP diferente para cada ESP32. O firmware imprime esse IP e o endereço `.local` no Monitor Serial em 115200 baud. Celular e ESP32 devem estar na mesma rede. Nomes repetidos causam conflito; cada placa precisa de um nome exclusivo. Caso o aparelho não resolva endereços `.local`, use o IP mostrado no Monitor Serial ou na lista de clientes do roteador.

O modo **Ponto de acesso (padrão)** continua disponível. Nele, conecte diretamente à rede criada pelo ESP32 e use `http://192.168.4.1` ou o endereço `.local` configurado.

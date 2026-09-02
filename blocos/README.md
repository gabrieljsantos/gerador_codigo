# CTRL.FORGE BLOCKS V2

Editor visual e offline para criar firmware autônomo de carrinhos com ESP32.

## Recursos

- Configuração de quatro GPIOs e associação às direções dos dois motores.
- Blocos de início, repetição contínua, repetição contada e espera.
- Controle independente: Motor A frente/trás/parar e Motor B frente/trás/parar.
- Potência PWM configurável de 0 a 255 em cada bloco de acionamento.
- Controle direto e pulso temporizado em qualquer uma das quatro GPIOs.
- Variáveis, alteração de valor, comparações e condicionais `se` / `se-senão`.
- Blocos encaixáveis e reordenáveis por arrastar e soltar.
- Desfazer, limpeza, salvamento automático e projetos `.ctrlforge.json`.
- Prévia, cópia e download do firmware `.ino`.
- Funciona localmente, sem Wi-Fi, servidor ou dependências externas.

## Uso

Abra `index.html` em um navegador moderno, configure os pinos, monte o programa e clique em **EXPORTAR .INO**. Abra o arquivo gerado no Arduino IDE e selecione sua placa ESP32.

## GPIOs padrão

- 18: Motor A — frente
- 32: Motor A — trás
- 27: Motor B — frente
- 26: Motor B — trás

Os projetos são salvos automaticamente no armazenamento local do navegador. O botão **SALVAR** também baixa uma cópia que pode ser aberta depois com **CARREGAR**.

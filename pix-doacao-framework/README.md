# Framework de credenciais e método Pix

Referência portátil para implementar a doação via Pix em outros projetos. Este framework não define HTML, CSS, cores ou layout: a apresentação deve ser adaptada ao design de cada projeto.

## Conteúdo

```text
pix-doacao-framework/
├── README.md
└── assets/
    └── qrcode.svg
```

O arquivo `assets/qrcode.svg` é uma cópia independente da imagem usada no projeto original. Ao exportar, copie a pasta `pix-doacao-framework` inteira.

## Credencial disponível

| Item | Informação |
|---|---|
| Método | Pix por QR Code |
| Imagem oficial | `assets/qrcode.svg` |
| Formato | SVG |
| Tipo da chave | E-mail |
| Chave Pix | `gabriel3d.com@gmail.com` |
| Nome do recebedor | Gabriel de Jesus Santos |
| Instituição | Nu Pagamentos S.A. – Instituição de Pagamento (Nubank) |
| Descrição | Sem descrição |
| Valor | Conforme definido no QR Code/aplicativo bancário |

> Antes da publicação, confirme no aplicativo bancário se o QR Code continua apontando para Gabriel de Jesus Santos, na Nu Pagamentos S.A. – Instituição de Pagamento (Nubank).

## Método de uso em outro projeto

1. Copie a pasta `pix-doacao-framework` para o projeto de destino.
2. Use a imagem `pix-doacao-framework/assets/qrcode.svg` na seção de apoio.
3. Adapte marcação, texto e estilo ao projeto.
4. Mantenha o QR Code sobre fundo branco, sem filtros ou deformação.
5. Teste a leitura em pelo menos dois aplicativos bancários.
6. Confirme o nome do recebedor antes de publicar.

Exemplo mínimo, apenas como referência do caminho:

```html
<img
  src="pix-doacao-framework/assets/qrcode.svg"
  alt="QR Code para contribuição voluntária via Pix"
>
```

## Texto sugerido

```text
Apoie o projeto via Pix. Escaneie o QR Code no aplicativo do seu banco para fazer uma contribuição voluntária.
```

## Dados para exibição textual

Caso o projeto também mostre a chave para copiar, use exatamente estes dados:

```text
Tipo da chave: E-mail
Chave Pix: gabriel3d.com@gmail.com
Nome do recebedor: Gabriel de Jesus Santos
Instituição: Nu Pagamentos S.A. – Instituição de Pagamento (Nubank)
Descrição: Sem descrição
```

## Regras de segurança

- Não editar o conteúdo interno do QR Code.
- Não publicar uma chave digitada sem validação.
- Não aplicar transparência, filtros ou recortes na imagem.
- Não remover a margem branca necessária para leitura.
- Confirmar o destinatário após qualquer cópia ou processamento do arquivo.
- Se o QR Code for substituído, testar novamente antes de exportar.

## Checklist de exportação

- [ ] Copiar `README.md` e toda a pasta `assets`.
- [ ] Conferir o caminho relativo de `qrcode.svg`.
- [ ] Adaptar o visual ao projeto de destino.
- [ ] Informar que a contribuição é voluntária.
- [ ] Conferir a chave `gabriel3d.com@gmail.com`.
- [ ] Testar o QR Code em um celular.
- [ ] Confirmar Gabriel de Jesus Santos e Nu Pagamentos S.A. – Instituição de Pagamento no aplicativo bancário.

## Atualização futura

Para alterar a credencial, substitua `assets/qrcode.svg` por um QR Code obtido pelo canal bancário oficial, preserve o nome do arquivo, confirme o recebedor e refaça os testes de leitura.

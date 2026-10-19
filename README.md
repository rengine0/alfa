# ALFA — site + formulário com IA no Render

## Fluxo

1. A pessoa preenche o formulário em `contato.html`.
2. Se informar provedores (nome + telefone), precisa marcar **"Libero o acesso da ALFA aos números dos provedores"**. Sem isso, os números nem são guardados.
3. O servidor valida e envia os dados para a IA (Groq). **Os telefones dos provedores não vão para a IA**, só os nomes.
4. É gerado um `.txt` com: dados do formulário + autorização + análise da IA.
5. O `.txt` é enviado ao admin por e-mail (Resend) e/ou Telegram.

Se a IA falhar, o contato **não se perde**: o `.txt` vai assim mesmo, com um aviso de que a análise não foi gerada.
Se nenhum canal de envio funcionar, o usuário vê um erro e pode tentar de novo.

## Estrutura

```
server.js        servidor (Node, sem dependências): API + arquivos do site
public/          o site (index, contato, css, js)
render.yaml      configuração do Render (opcional)
.env.example     variáveis de ambiente
```

## Colocar no Render

1. Suba esta pasta para um repositório no GitHub.
2. No Render: **New > Web Service** > escolha o repositório.
   - Runtime: **Node**
   - Build Command: deixe vazio (ou `echo ok`)
   - Start Command: `node server.js`
   - (Ou use **New > Blueprint** e ele lê o `render.yaml`.)
3. Em **Environment**, crie as variáveis:

| Variável | Para quê |
|---|---|
| `GROQ_API_KEY` | chave da API da Groq (console.groq.com/keys) |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | envio ao admin pelo Telegram (mais fácil) |
| `RESEND_API_KEY` + `ADMIN_EMAIL` | envio ao admin por e-mail |

Configure pelo menos um canal (Telegram ou e-mail). Pode usar os dois.

### Telegram (5 minutos)
1. No Telegram, fale com **@BotFather**, envie `/newbot` e guarde o token.
2. Mande qualquer mensagem para o seu bot novo.
3. Abra `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates` e copie o número em `"chat":{"id": ...}`.

### E-mail (Resend)
- Crie conta em resend.com e gere uma API key.
- Sem domínio verificado, o Resend só entrega para o e-mail da sua própria conta (remetente `onboarding@resend.dev`). Para outros destinatários, verifique um domínio e ajuste `MAIL_FROM`.
- Por que não SMTP: o plano gratuito do Render bloqueia portas SMTP; Resend e Telegram funcionam por HTTPS.

## Testar localmente

```
SAVE_DIR=./leads GROQ_API_KEY=gsk_... node server.js
```
Abra http://localhost:3000/contato.html. Os `.txt` aparecem na pasta `leads/`.

## Observações

- Plano gratuito do Render "dorme" sem acesso: o primeiro envio depois de um tempo parado pode demorar. O formulário aguarda até 90 s.
- Proteções incluídas: limite de 5 envios por IP a cada 10 min, campo-armadilha contra robôs, validação de CNPJ no servidor e instruções para a IA ignorar ordens escritas dentro do formulário.
- Os telefones dos provedores são dados de terceiros: considere ter uma política de privacidade (LGPD) no site.
- O número de WhatsApp da ALFA (`NUMERO_ALFA`) não é mais usado: o formulário agora envia pelo servidor.

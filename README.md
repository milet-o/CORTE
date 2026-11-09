# ⚡ CORTE — O Primeiro Quizbowl em Português

**CORTE** é o primeiro sistema de **Quizbowl** desenvolvido nativamente para a língua portuguesa, combinando:
1. **Juiz Nativo CORTE**: Avaliação inteligente de respostas tolerante a acentuação, artigos em português, contrações, sobrenomes isolados e disparador de *Prompts* ("Seja mais específico").
2. **Pipeline Offline de Perguntas Piramidais**:
   - Módulo **Wikipédia Brasil**: Constrói questões sobre eventos históricos, vultos nacionais e literatura brasileira organizadas estritamente da pista mais difícil até o *giveaway* final.
   - Módulo **QBReader Adaptado**: Normaliza a estrutura sintática internacional preservando a fronteira de **Power (`*`)** e o lead-in em português.
3. **Leitor Piramidal em Tempo Real**:
   - Velocidade regulável (WPM).
   - Detecção visual de **POWER (+15 pts)**.
   - Botão e atalho de **CORTE** instantâneo no teclado (`Barra de Espaço`).
   - Timer de resposta regressivo de 7 segundos.
   - Banco de dados em formato JSON e exportado em CSV para fácil edição e ampliação.

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

### 2. Rodar o Pipeline Offline para Gerar/Atualizar o Banco de Questões
Para enriquecer os tópicos diretamente via API da Wikipédia PT-BR e consolidar os dados:
```bash
npm run pipeline:seed
```
Isso atualizará automaticamente:
- `data/questions.json` (banco de dados em JSON)
- `data/questions.csv` (planilha CSV completa para abrir no Excel/Google Sheets)

### 3. Rodar os Testes do Juiz Nativo
```bash
npx tsx test/judge.test.ts
```

---

## 🌐 Como Hospedar no Render (Gratuito e Sem Banco Externo)

Como o banco de dados do CORTE é autossuficiente (`data/questions.json`), **você não precisa de Supabase, Firebase ou qualquer banco externo**. Tudo fica embutido no seu próprio repositório Git!

### Passo a Passo no Render:
1. Abra sua conta no [Render.com](https://dashboard.render.com).
2. Clique em **"New +"** $\rightarrow$ **"Web Service"**.
3. Conecte seu repositório do **GitHub**.
4. O Render detectará automaticamente o arquivo `render.yaml`, ou você pode preencher manualmente:
   - **Name**: `corte-quizbowl` (ou o nome que preferir)
   - **Language**: `Node`
   - **Branch**: `main` (ou a sua branch ativa)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
5. Em **Environment Variables** (se não usar o blueprint automático), adicione:
   - `NODE_VERSION` = `20.18.0`
6. Clique em **"Deploy Web Service"**!
   - Em cerca de 2 minutos, o Render vai compilar o Next.js e gerar a sua URL pública (ex: `https://corte-quizbowl.onrender.com`).

---

## 🧠 Arquitetura do Juiz Nativo CORTE

O Juiz Nativo avalia a resposta em camadas de tolerância:
1. **Normalização**: Remove acentos e diacríticos (`é` -> `e`, `ç` -> `c`), limpa pontuações e artigos iniciais (`o`, `a`, `os`, `as`, `um`, `uma`, `de`, `do`, `da`).
2. **Rejeição Explícita**: Verifica `reject_aliases` para evitar que respostas comuns erradas avancem.
3. **Disparo de Prompt**: Identifica termos vagos (ex: *"presidente"*, *"ditador"*, *"revolta"*) e pede esclarecimento dando tempo extra ao jogador.
4. **Correspondência Canônica e Aliases**: Aceita o termo principal e apelidos históricos (ex: *"Vargas"*, *"JK"*, *"Machado"*).
5. **Fuzzy Matching / Levenshtein**: Tolera pequenos erros de digitação (typos de 1 a 2 caracteres dependendo do comprimento).
6. **Pontuação Clássica do Quizbowl**:
   - **+15 pontos**: Corte correto no **Power** (antes do `*`).
   - **+10 pontos**: Corte correto normal.
   - **-5 pontos**: Corte com interrupção da leitura e resposta incorreta (negativo).
   - **0 pontos**: Resposta incorreta após a leitura terminar.

# Arquitetura do Projeto — CORTE (Quizbowl em Português)

> **Regra de Ouro para Agentes**: Consulte este mapa ANTES de fazer buscas globais. Leia e edite **apenas** o subcomponente ou rota diretamente ligado ao pedido do usuário.

---

## Mapa de Diretórios e Arquivos

### `app/` (Rotas e API Handlers — Next.js App Router)
- `app/page.tsx` — Página inicial; carrega o banco de questões e renderiza `QuizbowlReader`.
- `app/layout.tsx` — Layout raiz, fontes e metadados.
- `app/globals.css` — Variáveis de tema neobrutalista (`--bg`, `--card`, `--or`, `--mu`, `--gr`, `--rd`, `--bl`, `--pk`) e animações globais (`.animate-pulse-dark`, `.animate-jelly`, `.animate-stamp`, `.accordion-stretch`).
- `app/bugs/page.tsx` — Painel do desenvolvedor (`/bugs`) para visualizar e excluir relatos de bugs.
- `app/api/questions/route.ts` — Retorna as questões do banco (`data/questions.json`).
- `app/api/judge/route.ts` — Julga respostas do modo solo (`lib/judge.ts`).
- `app/api/bugs/route.ts` — CRUD de relatos de bugs salvos em `data/bugs.json`.
- `app/api/rooms/route.ts` — Criação de salas multiplayer (`POST`).
- `app/api/rooms/[code]/route.ts` — Consulta do estado atual da sala (`GET`).
- `app/api/rooms/[code]/action/route.ts` — Ações na sala (`join`, `leave`, `kick_player`, `start_question`, `buzz`, `submit_answer`, `next_question`, `update_filters`, `update_avatar`).
- `app/api/rooms/[code]/events/route.ts` — Stream SSE em tempo real da sala.

### `components/reader/` (Modos Solo: Diário e Ilimitado)
- `components/QuizbowlReader.tsx` — **Coordenador de estado e timers** dos modos Diário/Ilimitado e chaveamento para o Multiplayer.
- `components/reader/ReaderHeader.tsx` — Barra superior: logo, contador de ofensiva (streak), botão de Relatar Bug, placar rápido do Ilimitado e seletor deslizante de modo (`Diário` / `Ilimitado` / `Amigos`).
- `components/reader/QuestionDisplay.tsx` — Coluna esquerda (7/12): badges da questão, leitura palavra por palavra com cursor e destaque de corte, barra de progresso e contagem final de 10s.
- `components/reader/ReaderFilters.tsx` — Topo da coluna direita no Modo Ilimitado: contador de questões encontradas, seletor de velocidade WPM (180/240/300) e filtros multi-seleção de dificuldade e temas.
- `components/reader/ActionPanel.tsx` — Botão CORTAR, input de resposta com barra de 10s, botões `Iniciar`/`Gabarito`/`Próxima`, card de Resposta Correta e ações de compartilhamento/treino do Modo Diário.

### `components/multiplayer/` (Salas Multiplayer)
- `components/MultiplayerRoom.tsx` — **Coordenador de estado e conexão SSE/Polling** da sala multiplayer (timers de 50ms, atalho `Espaço`, sons de eventos).
- `components/multiplayer/MultiplayerLobby.tsx` — Tela de Criar/Entrar na sala, escolha de apelido, cor de adesivo e Creature Mixer (corpo, olhos, boca, chapéu).
- `components/multiplayer/MultiplayerHeader.tsx` — Topo da sala ativa: código da sala, botão de copiar convite, lista de jogadores com avatares/badges/pontos, botão de expulsar jogador (`kick`) e botão de Bug/Sair.
- `components/multiplayer/MultiplayerQuestionBox.tsx` — Coluna esquerda (7/12): leitura palavra por palavra da questão, indicador de Power (+15) e barra de progresso/contagem final.
- `components/multiplayer/MultiplayerFilters.tsx` — Seletor de velocidade WPM (180/240/300), filtros de dificuldade e categorias da sala (controlados pelo Host).
- `components/multiplayer/MultiplayerControls.tsx` — Botão CORTAR, input de resposta com barra de 10s, botões do Host ("Iniciar Leitura" e "Próxima"), log de tentativas da rodada (`roundJudgments`) e card de Gabarito revelado.
- `components/multiplayer/MultiplayerKickedScreen.tsx` — Tela exibida quando um jogador é removido pelo Host.

### `components/` (Avatares e Modais Isolados)
- `components/CreatureAvatar.tsx` — Gerador SVG modular de monstrinhos estilo Kenney (5 corpos, 5 olhos, 5 bocas, 5 chapéus).
- `components/DopamineCelebration.tsx` — Overlay comemorativo de acerto (confetes + monstrinho pulando + duração de 2s com fade-out).
- `components/BugReportModal.tsx` — Modal para os jogadores enviarem relatos de bug com feedback `"obrigado <3"`.

### `lib/` (Lógica de Negócio, Áudio e Estado)
- `lib/multiplayer/types.ts` — Tipagens `RoomState`, `RoomPlayer`, `RoundJudgmentLog` e paleta `MULTIPLAYER_COLORS`.
- `lib/multiplayer/roomManager.ts` — Gerenciador em memória das salas, ticker de palavras baseado em WPM, julgamento de cortes e expulsão.
- `lib/judge.ts` — Algoritmo de validação de respostas em português (normalização de acentos, distância de Levenshtein, números e respostas alternativas).
- `lib/sfx.ts` — Efeitos sonoros procedurais via Web Audio API (`playClickSound`, `playCutSound`, `playCorrectSound`, `playWrongSound`, `playTickSound`, `playPlayerJoinSound`, `playGameStartSound`, `playPageFlipSound`, `playStampSound`).
- `lib/daily.ts` — Seleção determinística da pergunta do Corte Diário.
- `lib/storage.ts` — Persistência local (`localStorage`) de estatísticas, histórico e progresso diário.

---

## Regras de Leitura e Edição
1. **Leitura cirúrgica**: Nunca leia arquivos fora do escopo do pedido. Se o ajuste for no botão de cortar do multiplayer, abra direto `components/multiplayer/MultiplayerControls.tsx`. Se for no botão de cortar do modo solo, abra direto `components/reader/ActionPanel.tsx`.
2. **Estilo e CSS**: Não altere `app/globals.css` a menos que o pedido exija uma nova animação `@keyframes` ou variável global.
3. **Componentização**: Novos modais, painéis ou rotas devem nascer em arquivos próprios, nunca inflando componentes coordenadores.

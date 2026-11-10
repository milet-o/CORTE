<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Regras de Otimização e Arquitetura (CORTE)

- **Consulte `ARCHITECTURE.md` na raiz do projeto** para localizar arquivos antes de iniciar qualquer busca global pelo repositório.
- Sempre leia o subcomponente específico antes de editar, mas **nunca** inspecione arquivos fora do escopo do pedido.
- Não edite `app/globals.css` a menos que seja necessário criar uma nova classe global ou animação `@keyframes`.
- Novos modais, subpainéis e rotas devem ser criados em arquivos separados, mantendo os componentes coordenadores (`MultiplayerRoom.tsx`, `QuizbowlReader.tsx`) enxutos.

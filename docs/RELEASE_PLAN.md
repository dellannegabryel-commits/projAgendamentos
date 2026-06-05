# Plano de Release v1.0 — Agenda Fácil

> Documento vivo descrevendo o plano para a primeira release pública do Agenda Fácil.
> Criado em 2026-06-03. Atualizar conforme progresso.

## Contexto

Projeto em estado MVP funcional (~85% release-ready). Stack: Node 20 + TypeScript + Express + Prisma + PostgreSQL + Next.js 14 + Tailwind. Faltam bloqueadores críticos para um deploy seguro.

## Decisões

- **Auth admin:** Tela de setup `/admin/setup` exibida quando `count(Admin) == 0`
- **Reset de senha:** Token JWT assinado de curta duração (1h) + log no console (sem SMTP ainda)
- **WhatsApp:** Enviar também na criação do agendamento, não só na confirmação
- **Segurança:** Adicionar Helmet + CSP no Express
- **Documentação:** OpenAPI gerado a partir dos Zod schemas

## Bloco 1 — Fundação de Auth (1-2 dias)

### Backend
- [ ] Migration: adicionar `passwordResetToken` + `passwordResetExpires` no `Admin`
- [ ] `GET /api/auth/status` → `{ hasAdmin: boolean }`
- [ ] `POST /api/auth/setup` (público, falha se `hasAdmin === true`) → cria primeiro admin + retorna token
- [ ] `POST /api/auth/forgot-password` (público, sempre 200) → gera token + log
- [ ] `POST /api/auth/reset-password` (público, valida token) → redefine senha
- [ ] Testes para os novos métodos

### Frontend
- [ ] `/admin/setup` — substituir `/admin/login` quando `hasAdmin === false`
- [ ] `/admin/login` — link "Esqueci minha senha"
- [ ] `/admin/forgot-password` — formulário de email
- [ ] `/admin/reset-password?token=...` — formulário de nova senha
- [ ] `api.auth.{status, setup, forgotPassword, resetPassword}` no `lib/api.ts`

## Bloco 2 — Notificações + cleanup (1 dia)

- [ ] `appointment.service.ts:create` envia WhatsApp para o cliente (template "Recebemos...")
- [ ] Decidir destino do `frontend/src/lib/mock.ts` (remover ou wirar)
- [ ] Sincronizar `.env.example` (raiz ↔ backend)
- [ ] Helmet + CSP no `src/index.ts`
- [ ] Header `Vary: Origin` + melhoria CORS

## Bloco 3 — Polish admin (1-2 dias)

- [x] Backend: `GET /api/appointments?page&pageSize&sortBy&order`
- [x] Frontend: consumir `dateFrom`/`dateTo` no dashboard
- [x] Frontend: adicionar paginação na tabela
- [x] Nginx: HTTPS redirect, HSTS, CSP
- [x] OpenAPI/Swagger em `/api/docs` (22 paths documentados)

## Bloco 4 — Testes + CI (1-2 dias)

- [x] Smoke tests Playwright: wizard booking + login admin (9 testes em 2 suites)
- [x] Job E2E no CI (`docker compose up -d` + healthcheck + playwright + report artifact)
- [x] README atualizado com instruções de release

## Bloco 5 — Validação pré-release (1 dia)

- [ ] `docker compose up -d` + smoke E2E
- [ ] Healthchecks (db, evolution, app)
- [ ] Rate limiters verificados
- [ ] Backup/restore dry-run
- [ ] Tag da versão + changelog

## Critérios de aceitação

- [ ] Admin cria primeiro acesso via `/admin/setup` (sem seed manual)
- [ ] Admin reseta senha via fluxo "esqueci senha"
- [ ] Cliente recebe WhatsApp ao agendar
- [ ] Sem código morto (`mock.ts` resolvido)
- [ ] `.env.example` sincronizados
- [ ] Helmet + CSP ativos
- [ ] HTTPS via nginx funcional
- [ ] Dashboard com filtro de data + paginação
- [ ] OpenAPI documentando 23+ endpoints
- [ ] CI com lint + typecheck + test + build + docker build + E2E
- [ ] Deploy em homologação executado

## Pós-MVP (v1.1+)

- Modelo `Service` (duração, preço)
- Multi-tenant
- Pagamento online
- Integração calendário (Google/Outlook)
- Avaliações
- Dark mode
- SMS / Email transacional
- i18n

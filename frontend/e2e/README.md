# Testes E2E (Playwright)

Smoke tests que validam os fluxos críticos do Agenda Fácil.

## Pré-requisitos

- Stack rodando (Docker Compose ou `npm run dev` em backend e frontend)
- Para setup: banco de dados com **nenhum admin** cadastrado (caso contrário, o teste `setup inicial` faz `test.skip`)

## Rodar localmente

```bash
# Subir stack
docker compose up -d

# Instalar browsers (apenas primeira vez)
cd frontend
npm run test:e2e:install

# Rodar testes
npm run test:e2e

# UI mode (debug)
npm run test:e2e:ui
```

## Stack limpa para teste de setup

Para testar o fluxo de setup inicial, o banco precisa estar vazio de admins:

```bash
docker compose down -v
docker compose up -d
```

## Configuração

| Variável | Default | Descrição |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | URL base do app |
| `PLAYWRIGHT_PORT` | `3000` | Porta (usada apenas se BASE_URL não for definida) |

## Suites

### `smoke.spec.ts` (5 testes)
- Landing page carrega
- `/agendamento` renderiza
- `/admin/login` mostra link "esqueci senha"
- `/admin/forgot-password` exibe formulário
- `/admin/reset-password` (sem token) mostra estado de link inválido

### `admin-flow.spec.ts` (4 testes)
- Setup inicial cria admin
- Login após setup
- Login rejeita credenciais inválidas
- Admin acessa páginas de CRUD

## CI

O job `e2e` no `.github/workflows/ci.yml`:
1. Constrói o stack (depende de `docker`)
2. Sobe `docker compose up -d`
3. Aguarda `/health` responder
4. Roda `npx playwright test`
5. Upload do report e traces em caso de falha
6. `docker compose down -v` (sempre)

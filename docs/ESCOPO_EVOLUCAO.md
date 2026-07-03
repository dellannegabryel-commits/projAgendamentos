# Plano de Evolução de Escopo — Agenda Fácil

> Gerado em: 2026-07-03  
> Baseado na análise completa do repositório (backend Express/Prisma/PostgreSQL + frontend Next.js 14/Tailwind + infra Docker)

---

## Status da Implementação

| Fase | Status | Data |
|------|--------|------|
| Fase 1 — Schema & Fundação | ✅ Implementado | 2026-07-03 |
| Fase 2 — Features Core | ⏳ Pendente | — |
| Fase 3 — Experiência do Cliente | ⏳ Pendente | — |
| Fase 4 — Inteligência de Negócio | ⏳ Pendente | — |

---

## Escopo Atual (já implementado)

| Funcionalidade | Status |
|---|---|
| Agendamento público (multi-step wizard) | ✅ Completo |
| Dashboard admin (filtros, paginação, KPIs) | ✅ Completo |
| CRUD Categorias | ✅ Completo |
| CRUD Profissionais (vinculado a categoria) | ✅ Completo |
| CRUD Horários (dia da semana, start/end) | ✅ Completo |
| Auth admin (login, setup, forgot/reset) | ✅ Completo |
| WhatsApp (notificação criação/confirmação/cancelamento) | ✅ Completo |
| Validação disponibilidade + anti-double-booking | ✅ Completo |
| Swagger/OpenAPI docs | ✅ Completo |
| Docker Compose + CI/CD | ✅ Completo |

---

## Gap Analysis

### Oportunidades identificadas

| # | Item | Valor | Esforço | Tipo |
|---|------|-------|---------|------|
| 1 | Duração do serviço por categoria | Alto | Baixo | Schema + Backend + Frontend |
| 2 | Bloqueio de datas (feriados/férias) | Alto | Baixo | Schema + Backend + Frontend |
| 3 | Notificação para admin | Alto | Baixo | Backend |
| 4 | Lembrete automático (D-1) | Alto | Médio | Backend (job) |
| 5 | Multi-categoria por profissional | Alto | Médio | Schema + Backend + Frontend |
| 6 | Histórico do cliente (recorrente) | Médio | Médio | Frontend |
| 7 | Autosserviço do cliente (cancel via WhatsApp) | Médio | Médio | Backend + Frontend |
| 8 | Relatórios e analytics | Médio | Médio | Backend + Frontend |
| 9 | Fotos dos profissionais | Médio | Baixo | Schema + Frontend |
| — | Pagamento online (Pix) | — | Alto | Postergado |
| — | Google Calendar sync | — | Alto | Postergado |
| — | Multi-tenant (estabelecimentos) | — | Alto | Postergado |
| — | PWA / App mobile | — | Alto | Postergado |

---

## Plano de Execução — 4 Fases

### Fase 1: Schema & Fundação (~1-2 dias)

**Objetivo:** Preparar o banco de dados para todas as features seguintes.

| Item | Detalhes |
|------|----------|
| **Duração do serviço** | Adicionar `duration` (Int, default 30) na `Category`. Slots passam a respeitar a duração da categoria |
| **Multi-categoria (N:N)** | Criar tabela `ProfessionalCategory` (`professionalId` + `categoryId`). Profissional pode oferecer vários serviços |
| **Bloqueio de datas** | Modelo `DateBlock`: `id`, `professionalId`, `date`, `reason?`, `createdAt` |
| **Foto do profissional** | Adicionar `photoUrl` (String?) na `Professional` |
| **Migration única** | Gerar migration Prisma com todas as alterações acima |

### Fase 2: Features Core (~2-3 dias)

**Objetivo:** Implementar funcionalidades admin e backend.

| Item | Backend | Frontend |
|------|---------|----------|
| **Duração nos slots** | `generateTimeSlots` usa `category.duration` em vez de 30min fixo | Exibir duração no card do serviço (`1h`, `30min`) |
| **Multi-categoria** | CRUD aceita `categoryIds: string[]` | Select múltiplo no form de profissional |
| **Bloqueio de datas** | CRUD `DateBlock` + filtrar datas bloqueadas em `getAvailableSlots` | Nova página "/admin/bloqueios" com calendário |
| **Notificação admin** | Enviar WhatsApp pro número do estabelecimento (`ADMIN_PHONE`) ao criar agendamento | — |
| **Foto profissional** | Upload via URL → `photoUrl` | Input file no form do profissional |

### Fase 3: Experiência do Cliente (~2-3 dias)

**Objetivo:** Retenção e conveniência para o cliente final.

| Item | Detalhes |
|------|----------|
| **Lembrete automático** | Job (setInterval 10min) que busca appointments D+1 com status CONFIRMED e envia WhatsApp de lembrete |
| **Histórico do cliente** | No frontend, ao digitar telefone (`clientPhone`), buscar appointments anteriores com mesmo telefone e exibir toast "Bem-vindo de volta!" |
| **Autosserviço** | Endpoint público `POST /api/appointments/:id/cancel?token=<hash>` + link na mensagem de WhatsApp de criação com token único |

### Fase 4: Inteligência de Negócio (~2-3 dias)

**Objetivo:** Dashboard analítico para tomada de decisão.

| Item | Detalhes |
|------|----------|
| **Relatórios** | Nova página "/admin/relatorios" com cards (total agendamentos/mês, taxa de confirmação, top profissionais, cancelamentos) e gráfico mensal |
| **Exportar CSV** | Botão pra baixar CSV do período selecionado |

---

## Estimativa Total

| Fase | Tempo estimado |
|------|---------------:|
| Fase 1 — Schema & Fundação | ~1-2 dias |
| Fase 2 — Features Core | ~2-3 dias |
| Fase 3 — Experiência do Cliente | ~2-3 dias |
| Fase 4 — Inteligência de Negócio | ~2-3 dias |
| **Total** | **~7-11 dias** |

---

## Dependências Técnicas

```
Fase 1 (schema)
  └── Fase 2 (features core) — depende das novas colunas/tabelas
        ├── Fase 3 (experiência) — depende de notificações e slots
        └── Fase 4 (relatórios) — independente, pode rodar em paralelo com Fase 3
```

As fases 3 e 4 podem ser executadas em paralelo após a conclusão da Fase 2, pois não compartilham dependências entre si.

---

## Validação

Ao final de cada fase:
- `cd backend && npm run build` deve passar sem erros de tipo
- `npm run test` (backend) deve continuar passando
- `docker compose up --build` deve subir sem erros
- Navegar no fluxo completo (agendamento → admin → confirmação) deve funcionar

---

## Changelog — Fase 1 (2026-07-03)

### Schema (Prisma)
| Arquivo | Alteração |
|---------|-----------|
| `backend/prisma/schema.prisma` | Add `duration` (Int, default 30) em `Category` |
| | Add `ProfessionalCategory` (N:N entre Professional e Category) |
| | Add `photoUrl` (String?) em `Professional` |
| | Add `DateBlock` model (`professionalId`, `date`, `reason?`) |
| | Remover `categoryId` + `category` de `Professional` |

### Backend — Repositories
| Arquivo | Alteração |
|---------|-----------|
| `backend/src/repositories/professional.repository.ts` | Include `categories → category` em vez de `category`; `findByCategoryId` usa `categories: { some: { categoryId } }` |
| `backend/src/repositories/appointment.repository.ts` | Include `professional → categories → category` |
| `backend/src/repositories/dateBlock.repository.ts` | **Novo** — CRUD: `findAll`, `findByProfessionalId`, `findOverlapping`, `create`, `delete` |
| `backend/src/repositories/index.ts` | Export `DateBlockRepository` |

### Backend — Services
| Arquivo | Alteração |
|---------|-----------|
| `backend/src/services/category.service.ts` | Add `duration` (optional, default 30, min 5, max 480) no Zod schema |
| `backend/src/services/professional.service.ts` | `categoryId` → `categoryIds: string[]`; add `photoUrl`; `create` usa `categories: { create: [...] }`; `update` faz `deleteMany + create` |
| `backend/src/services/availability.service.ts` | Add `DateBlockRepository` + `ProfessionalRepository`; `getAvailableSlots` verifica se data está bloqueada; busca `category.duration` do profissional; `generateTimeSlots` aceita `durationMinutes` |
| `backend/src/services/dateBlock.service.ts` | **Novo** — Zod schema + CRUD com validação de duplicidade |
| `backend/src/services/index.ts` | Export `DateBlockService` |

### Backend — Controllers & Routes
| Arquivo | Alteração |
|---------|-----------|
| `backend/src/controllers/dateBlock.controller.ts` | **Novo** — `findAll`, `create`, `delete` |
| `backend/src/routes/dateBlock.routes.ts` | **Novo** — `GET /`, `POST /`, `DELETE /:id` (protegidos por auth) |
| `backend/src/controllers/index.ts` | Export `DateBlockController` |
| `backend/src/routes/index.ts` | Add `dateBlockRoutes` em `/date-blocks` |

### Frontend — API & Types
| Arquivo | Alteração |
|---------|-----------|
| `frontend/src/lib/api.ts` | `Category` add `duration: number`; add `ProfessionalCategory`; `Professional` muda `categoryId`+`category` → `categories: ProfessionalCategory[]` + `photoUrl?: string`; add `DateBlock`; `categories.create/update` aceita `duration`; `professionals.create/update` aceita `categoryIds` + `photoUrl`; add `api.dateBlocks` |

### Frontend — Admin Pages
| Arquivo | Alteração |
|---------|-----------|
| `frontend/src/app/admin/categorias/page.tsx` | Add coluna "Duração" na tabela; add campo `duration` no modal |
| `frontend/src/app/admin/profissionais/page.tsx` | Select único → checkboxes multi-categoria; add campo `photoUrl` |
| `frontend/src/app/admin/bloqueios/page.tsx` | **Novo** — Página completa: listagem, criar, remover bloqueios |
| `frontend/src/app/admin/page.tsx` | `professional.category.name` → `professional.categories.map(c => c.category.name).join(', ')` |
| `frontend/src/app/admin/layout.tsx` | Add "Bloqueios" na navegação |

### Frontend — Scheduling Components
| Arquivo | Alteração |
|---------|-----------|
| `frontend/src/components/scheduling/CategoryCard.tsx` | Exibe `duration` formatada (ex: "30 min", "1h30") |
| `frontend/src/components/scheduling/ProfessionalCard.tsx` | Exibe `photoUrl` como imagem se disponível |

### Pendente
| Item | Motivo |
|------|--------|
| `npx prisma db push` ou `prisma migrate dev` | Precisa de PostgreSQL rodando localmente |
| `npm run test` (backend) | Testes podem precisar de ajustes devido à mudança de schema |
| `docker compose up --build` | Depende da migration ser aplicada

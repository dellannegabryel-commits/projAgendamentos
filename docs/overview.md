# Agenda Fácil — Overview do Projeto

Sistema de agendamento online com integração WhatsApp. MVP completo com backend REST, frontend Next.js e orquestração Docker.

---

## Stack Tecnológica

| Camada        | Tecnologia                                  |
|---------------|---------------------------------------------|
| Backend       | Node.js 20 + TypeScript + Express + Prisma  |
| Banco         | PostgreSQL 16                               |
| Frontend      | Next.js 14 (App Router) + React 18 + Tailwind CSS 3 |
| Validação     | Zod                                         |
| WhatsApp      | Evolution API v2.3.7 (Docker)               |
| Formulários   | react-hook-form + hookform/resolvers        |
| Infra         | Docker Compose, GitHub Actions              |

---

## Estrutura de Diretórios

```
projAgendamentos/
├── backend/                         # API REST (Express + Prisma)
│   ├── prisma/schema.prisma         # Modelo de dados
│   ├── src/
│   │   ├── index.ts                 # Entrypoint Express (porta 3000)
│   │   ├── routes/                  # 4 arquivos de rotas
│   │   ├── controllers/             # 4 controllers (request/response)
│   │   ├── services/                # 5 services (regras de negócio)
│   │   └── repositories/           # 5 repositories (acesso Prisma)
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                        # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── agendamento/page.tsx # Wizard público (5 etapas)
│   │   │   └── admin/
│   │   │       ├── page.tsx         # Dashboard agendamentos
│   │   │       ├── categorias/      # CRUD categorias
│   │   │       ├── profissionais/   # CRUD profissionais
│   │   │       └── horarios/        # CRUD disponibilidades
│   │   ├── components/              # UI + scheduling + forms + layout + feedback
│   │   └── lib/
│   │       ├── api.ts               # Cliente API tipado
│   │       └── mock.ts              # Mock para dev sem backend
│   ├── Dockerfile
│   └── package.json
│
├── evolution-api/
│   └── docker-compose.yml           # Container Evolution API
├── docker-compose.yml               # 5 serviços: 2x Postgres, Evolution, Backend, Frontend
├── .github/workflows/ci.yml         # CI: build + typecheck
└── docs/
    └── frontend-overview.md         # Documentação do frontend
```

---

## Modelo de Dados (Prisma)

### Entidades

| Entidade       | Atributos principais                              | Relacionamentos                |
|----------------|---------------------------------------------------|--------------------------------|
| **Category**   | `id` (UUID), `name` (unique), `description?`, `isActive` | 1:N → Professional      |
| **Professional** | `id` (UUID), `name`, `phone`, `address?`, `categoryId`, `isActive` | N:1 → Category, 1:N → Availability, 1:N → Appointment |
| **Availability** | `id` (UUID), `professionalId`, `dayOfWeek` (0-6), `startTime`, `endTime`, `isActive` | N:1 → Professional. Unique: `[professionalId, dayOfWeek, startTime]` |
| **Appointment** | `id` (UUID), `professionalId`, `clientName`, `clientPhone`, `date`, `status` | N:1 → Professional |

### Enums

- **AppointmentStatus**: `PENDING` | `CONFIRMED` | `CANCELLED`

### Regras de Negócio (via services)

- Sem duplicação de agendamento para mesmo profissional + data + horário (exceto se CANCELLED)
- Slots disponíveis = grade horária semanal menos agendamentos já feitos
- Soft-delete (isActive = false) para Category, Professional, Availability
- Apenas PENDING pode ser CONFIRMED; apenas CANCELLED pode ser deletado
- Notificação WhatsApp ao confirmar ou cancelar
- Granularidade de 30 min para slots

---

## API Endpoints

Todas sob prefixo `/api`.

### Categories (`/api/categories`)

| Método | Rota       | Descrição                |
|--------|------------|--------------------------|
| GET    | `/`        | Listar ativas            |
| GET    | `/:id`     | Buscar por ID            |
| POST   | `/`        | Criar                    |
| PUT    | `/:id`     | Atualizar                |
| DELETE | `/:id`     | Soft-delete              |

### Professionals (`/api/professionals`)

| Método | Rota                     | Descrição                          |
|--------|--------------------------|------------------------------------|
| GET    | `/`                      | Listar ativos (com categoria)      |
| GET    | `/category/:categoryId`  | Filtrar por categoria              |
| GET    | `/:id`                   | Buscar por ID (categoria + horários) |
| POST   | `/`                      | Criar                              |
| PUT    | `/:id`                   | Atualizar                          |
| DELETE | `/:id`                   | Soft-delete                        |

### Availabilities (`/api/availabilities`)

| Método | Rota                                    | Descrição                                  |
|--------|-----------------------------------------|--------------------------------------------|
| GET    | `/`                                     | Listar ativas                              |
| GET    | `/professional/:professionalId`         | Por profissional                           |
| GET    | `/slots?professionalId=&date=`          | Slots disponíveis (grade - ocupados)       |
| POST   | `/`                                     | Criar                                      |
| PUT    | `/:id`                                  | Atualizar                                  |
| DELETE | `/:id`                                  | Soft-delete                                |

### Appointments (`/api/appointments`)

| Método | Rota             | Descrição                                    |
|--------|------------------|----------------------------------------------|
| GET    | `/`              | Listar (filtros: status, professionalId, dateFrom, dateTo) |
| GET    | `/:id`           | Buscar por ID                                |
| POST   | `/`              | Criar (status PENDING, valida duplicidade)   |
| PATCH  | `/:id/confirm`   | Confirmar (+ WhatsApp)                       |
| PATCH  | `/:id/cancel`    | Cancelar (+ WhatsApp)                        |
| DELETE | `/:id`           | Deletar (apenas se CANCELLED)                |

---

## Arquitetura

### Backend — Camadas

```
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL
```

- **Routes**: definem HTTP e delegam ao controller
- **Controllers**: tratam request/response e erros de validação Zod
- **Services**: regras de negócio, validação, orquestração
- **Repositories**: queries Prisma

### Frontend — Padrões

- **Next.js 14 App Router** com Client Components
- **Camada de API**: `lib/api.ts` com métodos tipados por recurso
- **Mock layer**: `lib/mock.ts` para desenvolvimento sem backend
- **Componentes modulares**: `ui/`, `scheduling/`, `forms/`, `layout/`, `feedback/`

### Infraestrutura

```
docker-compose.yml
├── db (PostgreSQL 16)          → app database
├── evolution-db (PostgreSQL 16) → Evolution API database
├── evolution (Evolution API)   → WhatsApp gateway
├── backend (Node 20)           → API Express (porta 3001)
└── frontend (Next.js 14)       → Static + Node server (porta 3000)
```

- **CI/CD**: GitHub Actions — `npm ci` + `prisma generate` + `tsc` / `next build` em push/PR para `develop`/`main`
- Backend usa `prisma db push` no startup (schema-first, sem migrations)

---

## Fluxo do Agendamento (Público)

1. **Informações Pessoais** → nome + telefone
2. **Selecionar Categoria** → lista categorias ativas
3. **Selecionar Profissional** → filtrado por categoria
4. **Escolher Data/Horário** → calendário (próximos 60 dias) + slots disponíveis
5. **Confirmar** → cria Appointment com status PENDING

### Admin

- Dashboard com lista filtrável (Todos / Pendentes / Confirmados / Cancelados)
- CRUD de categorias, profissionais, horários (via modais)
- Ações: Confirmar (→ WhatsApp), Cancelar (→ WhatsApp), Deletar (só cancelados)

---

## Estado Atual

- MVP completo e funcional
- `prisma db push` (sem migration files versionadas)
- API key do WhatsApp é placeholder (`sua-api-key-aqui`) — necessário configurar para produção
- Camada de mock no frontend permite desenvolvimento independente do backend
- Documentação presente: README, `docs/frontend-overview.md`, `requests.http`

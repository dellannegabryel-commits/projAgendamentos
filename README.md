# Sistema de Agendamento Online com WhatsApp

MVP de sistema de agendamento online com integração ao WhatsApp via Evolution API.

---

## 📁 Estrutura do Projeto

```
projAgendamentos/
├── backend/              # API REST (Node.js + TypeScript + Prisma + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── routes/
│   └── prisma/
├── frontend/             # Frontend (Next.js 14 + React + Tailwind CSS)
│   └── src/
│       ├── app/          # App Router (admin, agendamento, home)
│       ├── components/   # UI components (Button, Input, Select, Card, Badge, Stepper)
│       └── lib/          # API client + mock data
├── .github/workflows/    # CI (GitHub Actions)
├── docker-compose.yml    # Orquestração Docker
├── requests.http         # Exemplos de API
└── README.md
```

---

## 🚀 Como Rodar

### Docker (recomendado)

```bash
# Subir tudo (PostgreSQL + backend + frontend)
docker compose up -d

# Acessar:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:3001/api

# Parar:
docker compose down

# Ver logs:
docker compose logs -f
```

### Desenvolvimento (sem Docker)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure o .env com suas credenciais

# Criar banco PostgreSQL
createdb agendamento_db

# Sincronizar schema
npm run db:push

# Iniciar servidor com hot-reload
npm run dev
```

Backend rodando em: `http://localhost:3000`

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend rodando em: `http://localhost:3001`

---

## 📋 Funcionalidades

### Cliente
- [x] Informar nome e telefone (WhatsApp)
- [x] Selecionar categoria
- [x] Selecionar profissional (filtrado por categoria)
- [x] Escolher horário disponível
- [x] Criar agendamento com status PENDENTE

### Admin
- [x] CRUD de categorias
- [x] CRUD de profissionais
- [x] Configurar horários disponíveis por profissional
- [x] Listar agendamentos (com filtros por status, profissional, data)
- [x] Confirmar ou cancelar agendamento

### Regras de Negócio
- [x] Não permitir agendamento duplicado no mesmo horário
- [x] Horários disponíveis calculados com base na agenda + conflitos existentes
- [x] Envio automático de WhatsApp ao confirmar agendamento (via Evolution API)
- [x] Soft-delete (isActive) para categorias, profissionais e disponibilidades

---

## 🐳 Docker

O projeto é totalmente containerizado com 3 serviços:

| Serviço | Imagem | Porta (host) |
|---------|--------|-------------|
| `db` | postgres:16-alpine | 5432 |
| `backend` | Node.js 20 (Express + Prisma) | 3001 |
| `frontend` | Node.js 20 (Next.js) | 3000 |

- Backend executa `prisma db push` automaticamente ao iniciar
- Usuário não-root em todos os containers
- OpenSSL instalado para compatibilidade com Prisma engines

---

## ⚙️ CI/CD

GitHub Actions configurado em `.github/workflows/ci.yml`:

- **Backend**: `npm ci` → `prisma generate` → `tsc`
- **Frontend**: `npm ci` → `next build` (typecheck + lint)
- **Docker**: `docker compose build`

Acionado em push/PR para as branches `develop` e `main`.

---

## 🔧 Tech Stack

| Parte | Tecnologia |
|-------|------------|
| Backend | Node.js 20, TypeScript, Express 4.18, Prisma 5.10 |
| Banco | PostgreSQL 16 |
| Frontend | Next.js 14, React 18, Tailwind CSS 3 |
| Validação | Zod 3.22 |
| WhatsApp | Evolution API |
| UI Components | Button, Input, Select, Card, Badge, Stepper |
| Infra | Docker, Docker Compose, GitHub Actions |

---

## 🧪 Recursos Adicionais

- `requests.http` - Exemplos de requisição (VS Code REST Client)
- `backend/prisma/schema.prisma` - Modelos de dados (Category, Professional, Availability, Appointment)
- `frontend/src/lib/mock.ts` - Dados mockados para desenvolvimento

---


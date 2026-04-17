# Sistema de Agendamento Online com WhatsApp

MVP de sistema de agendamento online com integração ao WhatsApp via Evolution API.

---

## 📁 Estrutura do Projeto

```
projAgendamentos/
├── backend/           # API REST (Node.js + TypeScript + Prisma)
├── frontend/         # Frontend (Next.js)
├── requests.http    # Exemplos de API
└── README.md       # Documentação completa
```

---

## 🚀 Como Rodar

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure o .env com suas credenciais

# Criar banco PostgreSQL
createdb agendamento_db

# Executar migrations
npm run db:migrate

# Iniciar servidor
npm run dev
```

Backend rodando em: `http://localhost:3000`

### Frontend

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
- [x] Listar agendamentos (com filtros)
- [x] Confirmar ou cancelar agendamento

### Regras de Negócio
- [x] Não permitir agendamento duplicado no mesmo horário
- [x] Horários disponíveis calculados com base na agenda + conflitos existentes
- [x] Envio automático de WhatsApp ao confirmar agendamento

---

## 📡 API Reference

Ver `backend/README.md` para documentação completa da API.

---

## 🔧 Tech Stack

| Parte | Tecnologia |
|-------|------------|
| Backend | Node.js, TypeScript, Express, Prisma |
| Banco | PostgreSQL |
| Frontend | Next.js 14, React, Axios |
| WhatsApp | Evolution API |
| Validação | Zod |

---

## 🧪 Recursos Adicionais

- `requests.http` - Exemplos de requisição (VS Code REST Client)
- `backend/prisma/schema.prisma` - Modelos de dados

---

## 📄 Licença

MIT
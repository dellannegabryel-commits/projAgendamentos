# Frontend Overview

## Stack

| Tecnologia | Versão |
|---|---|
| Next.js | 14.1.0 (App Router) |
| React | 18.2.0 |
| TypeScript | 5.3.3 |
| Tailwind CSS | 3.4 |
| date-fns | 3.3.1 |
| clsx | 2.1.0 |

## Estrutura de Arquivos

```
frontend/
  next.config.js
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  src/
    lib/
      api.ts          (API client com endpoints tipados + mock flag)
      mock.ts         (Mock in-memory para desenvolvimento)
    components/
      ui/
        index.ts      (Barrel re-export)
        Badge.tsx
        Button.tsx
        Card.tsx
        Input.tsx
        Modal.tsx
        Select.tsx
        Stepper.tsx
    app/
      globals.css     (Global styles, Inter font)
      layout.tsx      (Root layout: html, body, font)
      page.tsx        (Home: links "Agendar Serviço" / "Área Admin")
      agendamento/
        page.tsx      (Wizard público de agendamento, 5 etapas)
      admin/
        layout.tsx    (Layout admin: sidebar + mobile header)
        page.tsx      (Dashboard: CRUD de agendamentos)
        categorias/
          page.tsx    (CRUD de categorias)
        profissionais/
          page.tsx    (CRUD de profissionais)
        horarios/
          page.tsx    (CRUD de disponibilidades)
```

---

## Páginas

### `/` — Home
Dois links de navegação: "Agendar Serviço" e "Área Admin". Layout mínimo sem branding.

### `/agendamento` — Agendamento Público
Wizard de 5 etapas usando o componente `Stepper`:

| Etapa | Descrição | Validação |
|---|---|---|
| 1. Você | Nome + WhatsApp | Campos obrigatórios |
| 2. Serviço | Seleciona categoria | Deve selecionar uma |
| 3. Profissional | Filtrado por categoria | Deve selecionar um |
| 4. Horário | Calendário (próximos 30 dias) + slots | Data + horário obrigatórios |
| 5. Confirmar | Resumo completo + botão de envio | — |

Após envio bem-sucedido: tela de sucesso com check verde e botão "Fazer Novo Agendamento".

### `/admin` — Dashboard de Agendamentos
- Tabela com colunas: Cliente, Profissional, Data/Hora, Status, Ações
- Filtros por status: Todos / Pendentes / Confirmados / Cancelados
- Badges de status (warning / success / error)
- Ações: Confirmar (pendente), Cancelar (pendente/confirmado), Excluir (cancelado)

### `/admin/categorias` — CRUD Categorias
- Tabela (Nome, Descrição, Ações: Editar/Excluir)
- Modal de criação/edição com campos Nome e Descrição
- Validação: nome obrigatório

### `/admin/profissionais` — CRUD Profissionais
- Tabela (Nome, Telefone, Categoria, Endereço, Ações)
- Modal de criação/edição: Nome, Telefone, Categoria (select), Endereço
- Categoria carregada da API

### `/admin/horarios` — CRUD Disponibilidades
- Tabela (Profissional, Dia da Semana, Início, Fim, Ações)
- Modal de criação/edição: Profissional (select), Dia da Semana (select 0-6), Início, Fim

---

## Componentes UI

Todos em `src/components/ui/`, customizados (sem biblioteca externa).

### Button
- Variants: `primary` (verde), `secondary` (cinza), `outline` (borda), `ghost` (transparente)
- Sizes: `sm`, `md`, `lg`
- Estado `loading` com spinner SVG inline

### Input
- Label flutuante, estado `error` com borda vermelha + mensagem
- Placeholder, foco com ring verde

### Select
- Mesmo padrão do Input
- Custom dropdown arrow via SVG inline
- Options tipadas, suporte a placeholder

### Card
- Variants: `default` (sombra), `outlined` (borda)
- Paddings: `none`, `sm`, `md`, `lg`

### Badge
- Variants: `default`, `success`, `warning`, `error`, `neutral`
- Estilo pill (border-radius full)

### Stepper
- Para wizards multi-etapas
- Círculos numerados com checkmark na etapa atual/completa
- Linha conectora entre etapas
- Animações de transição

### Modal
- Overlay com backdrop-blur
- Header com título + botão fechar (X)
- Container scrollável
- Animação fade-in

---

## Estilização

### Tailwind Config
- Paleta `primary` (verde): 50→900
- Fonte: `Inter`, system-ui fallback
- Sem plugins adicionais

### Global CSS
- Fonte Inter via Google Fonts
- Antialiasing
- Focus ring global verde (`#22c55e`)

### Tema
- Apenas claro (light mode)
- Background: `zinc-50`
- Cards: branco com sombra
- Sidebar: `zinc-900`

---

## API Client (`src/lib/api.ts`)

- `fetch` nativo com wrapper `fetchApi<T>()`
- Base URL: `NEXT_PUBLIC_API_URL` (fallback `http://localhost:3001/api`)
- Headers: `Content-Type: application/json`
- Tratamento de erro: parseia `{ error }` do response
- Suporte a `204 No Content` (DELETE)

Endpoints organizados por recurso:

| Recurso | Métodos |
|---|---|
| `api.categories` | list, get, create, update, delete |
| `api.professionals` | list, getByCategory, get, create, update, delete |
| `api.availabilities` | list, getByProfessional, getSlots, create, update, delete |
| `api.appointments` | list (com filtros), get, create, confirm, cancel, delete |

### Mock (`src/lib/mock.ts`)
Implementação completa em memória para desenvolvimento sem backend.

---

## Pontos de Melhoria

- **Identidade visual** — tema genérico (verde/cinza), sem marca definida
- **Sem biblioteca de ícones** — SVG inline em vez de soluções como Lucide, Heroicons
- **Sidebar admin simples** — sem ícones, sem collapse, sem responsividade refinada
- **Homepage minimalista** — dois links sem branding ou apresentação
- **Página de agendamento** — funcional mas visualmente básica, sem animações refinadas
- **Sem feedback visual** — loading só no botão, sem toast/snackbar/notificações
- **Sem tema dark**
- **Tabelas sem paginação, busca ou ordenação**
- **Sem componente de data picker nativo** — usa `<input type="date">`
- **Formulários sem máscara** (telefone sem formatação)

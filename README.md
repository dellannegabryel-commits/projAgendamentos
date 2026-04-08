# 🕒 LightSched - Gerenciador de Agendas

Motor de agendamento simplificado focado em disponibilidade de profissionais e gestão de horários.

## 🎯 Foco do MVP
Este projeto foca na orquestração de agendas para pequenas clínicas, priorizando a experiência de quem opera o sistema no dia a dia (Dashboard Administrativo).

### Core Features
- **Gestão de Grade:** Configuração de horários de trabalho por profissional.
- **Agenda Multicoluna:** Visualização clara de todos os profissionais do dia lado a lado.
- **Validação de Tempo:** Lógica rigorosa para impedir sobreposição de horários para o mesmo profissional.
- **Status de Atendimento:** Controle visual do fluxo (Agendado -> Em Atendimento -> Finalizado).

## 🛠️ Tecnologias
- **Next.js 14** (App Router)
- **Prisma ORM**
- **PostgreSQL**
- **shadcn/ui** (Components)

## 🏗️ Como Rodar
1. Instale as dependências: `npm install`
2. Configure o seu banco no `.env` (DATABASE_URL).
3. Rode as migrations: `npx prisma migrate dev`.
4. Inicie o servidor: `npm run dev`.

---
*Projeto desenhado para ser escalável: a estrutura de dados permite a adição futura de recursos físicos e multi-unidades.*
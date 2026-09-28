# Clique Saúde API

Backend real do **Clique Saúde**, construído para a Atividade 2 de PPE III
(Desenvolvimento Back-end e Banco de Dados Avançado): Node.js + Express,
arquitetura em camadas, Prisma ORM, autenticação JWT com bcrypt e
tratamento de erros centralizado.

Essa API é o próximo passo do roadmap definido na Atividade 1 (ver relatório
daquela entrega): substitui o `json-server` que o front-end em React usava
como mock, mantendo exatamente o mesmo contrato de dados.

## Por que essa evolução?

A versão anterior do sistema concentrava tudo num único servidor Flask:
rotas, regras de negócio e acesso ao banco (SQLite via SQL cru ou ORM leve)
misturados nos mesmos arquivos, sem separação clara de responsabilidades e
sem testes automatizados. Esta API em Node.js organiza o backend em camadas
(`routes → controllers → services → models`), isola o acesso a dados atrás
do Prisma ORM (facilitando trocar SQLite por PostgreSQL em produção só
mudando `DATABASE_URL`), centraliza autenticação via JWT e tratamento de
erros num único middleware, e é validada por uma suíte de testes
automatizados (Jest + Supertest) com cobertura mínima obrigatória — mantendo
o mesmo contrato de dados que o front-end em React já consome, agora servido
por uma API real em vez do mock `json-server`.

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express 5 |
| Banco de dados | SQLite (dev) via Prisma ORM — troca para PostgreSQL só mudando `DATABASE_URL` |
| Autenticação | JWT (`jsonwebtoken`) + hash de senha (`bcryptjs`) |
| Validação | Zod |
| Logs de requisição | Morgan |
| Testes | Jest + Supertest |
| CI/CD | GitHub Actions |

## Como rodar

```bash
npm install
cp .env.example .env        # ou copiar manualmente no Windows
npm run prisma:migrate      # cria o banco (dev.db) e as tabelas
npm run seed                # popula médicos, usuários e consultas de exemplo
npm run dev                 # sobe o servidor em http://localhost:3333
```

### Login de teste (criados pelo seed)

- Paciente: `paciente@cliquesaude.com` / `123456`
- Admin: `admin@cliquesaude.com` / `admin123`

## Arquitetura em camadas

```
src/
├── routes/          → define os endpoints e qual middleware/controller usar
├── controllers/      → recebem req/res, chamam o service, formatam a resposta
├── services/         → regras de negócio (disponibilidade, permissões, hash...)
├── models/           → acesso a dados (Prisma) isolado por entidade
├── middlewares/       → autenticação, admin, validação, tratamento de erros
├── validations/       → schemas Zod de cada recurso
├── utils/             → AppError, JWT, logger, asyncHandler
├── config/            → instância única do Prisma Client
├── app.js             → monta o Express (middlewares + rotas)
└── server.js          → ponto de entrada (lê .env e sobe o servidor)

prisma/
├── schema.prisma       → modelagem do banco (Usuario, Medico, HorarioDisponivel, Consulta)
└── seed.js              → popula o banco com dados de exemplo
```

## Endpoints

Todas as respostas seguem o formato `{ sucesso, dados }` (sucesso) ou
`{ sucesso: false, codigo, mensagem, detalhes? }` (erro).

### Autenticação (`/api/auth`)

| Método | Rota | Descrição | Protegida? |
|---|---|---|---|
| POST | `/api/auth/registro` | Cria um paciente novo | Não |
| POST | `/api/auth/login` | Autentica e retorna um token JWT | Não |
| GET | `/api/auth/perfil` | Dados do usuário logado | Sim |

**POST /api/auth/login**
```json
// Requisição
{ "email": "paciente@cliquesaude.com", "senha": "123456" }

// Resposta 200
{
  "sucesso": true,
  "dados": {
    "usuario": { "id": 2, "nome": "Weslley Santos", "email": "paciente@cliquesaude.com", "tipo": "paciente" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Use o token nas rotas protegidas: `Authorization: Bearer <token>`.

### Médicos (`/api/medicos`)

| Método | Rota | Descrição | Protegida? |
|---|---|---|---|
| GET | `/api/medicos?especialidade=` | Lista médicos (filtro opcional) | Não |
| GET | `/api/medicos/especialidades` | Lista especialidades únicas | Não |
| GET | `/api/medicos/:id` | Detalhe do médico + horários | Não |
| GET | `/api/medicos/:id/horarios` | Horários fixos do médico | Não |
| POST | `/api/medicos` | Cria médico | Sim (admin) |
| PUT | `/api/medicos/:id` | Atualiza médico | Sim (admin) |
| DELETE | `/api/medicos/:id` | Remove médico | Sim (admin) |

### Consultas (`/api/consultas`) — todas exigem login

| Método | Rota | Descrição | Extra |
|---|---|---|---|
| GET | `/api/consultas/minhas` | Consultas do paciente logado | — |
| GET | `/api/consultas?status=` | Todas as consultas (filtro opcional) | Somente admin |
| POST | `/api/consultas` | Agenda uma consulta | Verifica disponibilidade e fim de semana |
| PUT | `/api/consultas/:id` | Atualiza status/observações | Paciente só cancela a própria; admin pode qualquer status |
| DELETE | `/api/consultas/:id` | Exclui o registro definitivamente | Somente admin |

**POST /api/consultas**
```json
// Requisição (com Authorization: Bearer <token>)
{ "medicoId": 1, "data": "2026-10-12", "hora": "08:00", "observacoes": "Retorno" }

// Resposta 201
{ "sucesso": true, "dados": { "id": 5, "status": "Agendado", "medico": {...}, "paciente": {...} } }

// Resposta 409 (horário já ocupado)
{ "sucesso": false, "codigo": "ERRO_CONFLITO", "mensagem": "Esse horário já está reservado. Escolha outro." }
```

## Tratamento de erros

Todo erro esperado é uma instância de `AppError` (ou subclasse:
`ValidationError`, `AuthError`, `ForbiddenError`, `NotFoundError`,
`ConflictError`), lançada em qualquer camada e capturada pelo middleware
global (`src/middlewares/errorHandler.middleware.js`), que:

- Formata a resposta sempre no mesmo shape JSON.
- Usa o código HTTP correto para cada tipo de erro (400/401/403/404/409).
- Reconhece erros conhecidos do Prisma (ex: `P2002` violação de unicidade → 409).
- Qualquer exceção não prevista vira 500, é gravada em `logs/erros.log` para
  auditoria, e nunca expõe stack trace ou detalhes internos ao cliente.

## Segurança

- Senhas nunca são armazenadas em texto puro — hash com `bcryptjs` (10 rounds).
- Autenticação via JWT assinado (`JWT_SECRET` em `.env`, nunca commitado).
- Middleware `autenticar` protege rotas sensíveis; `exigirAdmin` protege
  ações administrativas (cadastro de médico, exclusão de consulta etc.).

## Testes automatizados (Atividade 3)

```bash
npm test              # roda toda a suíte (unitários + integração)
npm run test:coverage # roda a suíte e gera o relatório de cobertura
```

O comando `test`/`test:coverage` já cuida de tudo sozinho: aplica as
migrations no banco de teste (`prisma/test.db`, separado do banco de
desenvolvimento) antes de rodar os testes, via `globalSetup` do Jest.

### Estrutura

```
tests/
├── unit/                        → mocka os models, testa services/middlewares isoladamente
│   ├── data.test.js               (função pura ehFimDeSemana)
│   ├── auth.service.test.js
│   ├── consultas.service.test.js
│   ├── medicos.service.test.js
│   └── errorHandler.middleware.test.js
├── integration/                 → Supertest batendo na API real + banco de teste real
│   ├── auth.routes.test.js
│   ├── medicos.routes.test.js
│   └── consultas.routes.test.js
├── fixtures/dados.js             → objetos de exemplo reaproveitados
├── helpers/auth.js               → cria admin/médico direto no banco para os testes
└── setup/                        → globalSetup (migrations) e afterAll (desconecta o Prisma)
```

- **Unitários**: usam `jest.mock(...)` para isolar a camada de `services` dos
  `models` (Prisma nunca é chamado de verdade) — validam regras de negócio
  como bloqueio de fim de semana, conflito de horário e permissões
  paciente/admin.
- **Integração**: usam Supertest para chamar `src/app.js` de ponta a ponta,
  incluindo o banco de dados real (SQLite de teste), validando o fluxo
  completo — status HTTP, JSON de resposta, autenticação e regras de negócio
  juntas.

### Cobertura de código

Última medição local (ver também o artefato `cobertura-backend` publicado
pelo workflow de CI a cada execução):

| Métrica | Resultado | Mínimo exigido |
|---|---|---|
| Statements | 96,26% | 80% |
| Branches | 75,71% | 70% |
| Functions | 95,71% | 80% |
| Lines | 96,22% | 80% |

O limite mínimo está configurado em `jest.config.js` (`coverageThreshold`):
se a cobertura cair abaixo dele, `npm run test:coverage` (e o CI) falha.
Depois de rodar `npm run test:coverage`, abra `coverage/index.html` no
navegador para o relatório visual, arquivo a arquivo.

## CI/CD (GitHub Actions)

Arquivo: [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Roda a cada
push/PR para `main`, em 3 jobs encadeados:

1. **test** — instala dependências (`npm ci`), gera o Prisma Client, roda
   `npm run test:coverage` (o próprio Jest quebra o job se a cobertura cair
   abaixo do limite) e publica a pasta `coverage/` como artefato do workflow.
2. **build** — reinstala em um runner limpo e executa `npm run build`, que
   carrega a aplicação inteira (`require('./src/app.js')`) para garantir que
   não há erro de sintaxe ou de "wiring" entre rotas/middlewares antes de
   liberar para deploy.
3. **deploy** (opcional, **desativado por padrão** — `if: false`) — dispara
   um deploy hook (ex: Render) usando um secret do repositório. Para ativar:
   configure `RENDER_DEPLOY_HOOK_URL` nos secrets do GitHub e troque a
   condição do job para `if: github.ref == 'refs/heads/main'`.

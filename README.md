# Gerenciador de Tarefas

Aplicação de tarefas com backend NestJS/tRPC e frontend Next.js.

## Pré-requisitos

- Node.js 24 ou superior
- npm

## Configuração

Copie os exemplos de ambiente antes de iniciar as aplicações:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\web\.env.example frontend\web\.env.local
```

| Aplicação | Variável          | Descrição                                                     | Padrão                       |
| --------- | ----------------- | ------------------------------------------------------------- | ---------------------------- |
| Backend   | `PORT`            | Porta HTTP do NestJS e tRPC                                   | `3030`                       |
| Frontend  | `TRPC_SERVER_URL` | URL interna do endpoint tRPC usada pelo SSR e pelo proxy Next | `http://localhost:3030/trpc` |

Reinicie o frontend após alterar `TRPC_SERVER_URL`.

## Executando em desenvolvimento

Instale as dependências em cada aplicação:

```powershell
npm --prefix backend install
npm --prefix frontend\web install
```

Em terminais separados, inicie o backend e o frontend:

```powershell
npm --prefix backend run start:dev
npm --prefix frontend\web run dev
```

O backend atende em `http://localhost:3030/trpc`; o frontend é servido pelo Next.js em `http://localhost:3000/` .
O navegador usa /trpc e o Next faz proxy para o backend.

## Validação

```powershell
npm --prefix backend test
npm --prefix backend run lint
npm --prefix frontend\web run lint
npm --prefix frontend\web run build
```

## Estrutura

```text
backend/
  src/tarefas/       # Serviço, schemas, router tRPC e testes
frontend/web/
  app/               # Rota SSR, componentes e clientes tRPC
```

## Arquitetura

- `app/page.tsx` busca a primeira página de tarefas no servidor por tRPC.
- Componentes clientes mantêm criação, edição, exclusão.
- As tarefas são armazenadas em memória pelo backend; reiniciar o processo remove os dados.

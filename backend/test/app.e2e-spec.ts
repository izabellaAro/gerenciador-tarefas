import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { criarTarefasRouter } from './../src/tarefas/tarefas.router.js';
import { TarefasService } from './../src/tarefas/tarefas.service.js';

describe('Tarefas (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const router = criarTarefasRouter(app.get(TarefasService));
    app.use('/trpc', createExpressMiddleware({ router }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('executa o CRUD completo', async () => {
    const http = request(app.getHttpServer());

    const criada = await http.post('/trpc/criar').send({ titulo: ' Tarefa ' }).expect(200);
    const { id, titulo } = criada.body.result.data;
    expect(titulo).toBe('Tarefa');

    const lista = await http.get('/trpc/listar').expect(200);
    expect(lista.body.result.data).toHaveLength(1);

    const input = encodeURIComponent(JSON.stringify({ id }));
    await http.get(`/trpc/buscarPorId?input=${input}`).expect(200);

    const atualizada = await http.post('/trpc/atualizar').send({ id, descricao: 'nova' }).expect(200);
    expect(atualizada.body.result.data.descricao).toBe('nova');

    await http.post('/trpc/remover').send({ id }).expect(200);
    await http.post('/trpc/remover').send({ id }).expect(404);
  });

  it('retorna mensagem clara para título vazio', async () => {
    const res = await request(app.getHttpServer())
      .post('/trpc/criar')
      .send({ titulo: '  ' })
      .expect(400);
    expect(res.body.error.message).toContain('O título é obrigatório');
  });

  it('retorna mensagem clara para id inválido e inexistente', async () => {
    const http = request(app.getHttpServer());
    const invalido = await http.post('/trpc/remover').send({ id: '123' }).expect(400);
    expect(invalido.body.error.message).toContain('UUID válido');

    const id = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
    const inexistente = await http.post('/trpc/remover').send({ id }).expect(404);
    expect(inexistente.body.error.message).toBe(`Tarefa com id ${id} não encontrada`);
  });
});

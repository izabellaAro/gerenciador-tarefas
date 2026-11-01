import { TRPCError } from '@trpc/server';
import { criarTarefasRouter } from './tarefas.router.js';
import { TarefasService } from './tarefas.service.js';

describe('TarefasRouter', () => {
  it('retorna uma página de tarefas e valida o cursor', async () => {
    const service = new TarefasService();
    const tarefa = service.criar({ titulo: 'Tarefa' });
    const caller = criarTarefasRouter(service).createCaller({});

    await expect(caller.listarPaginado({})).resolves.toEqual({
      items: [tarefa],
      proximoCursor: null,
    });
    await expect(
      caller.listarPaginado({
        cursor: { dataCriacao: tarefa.dataCriacao, id: 'inválido' },
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });
});

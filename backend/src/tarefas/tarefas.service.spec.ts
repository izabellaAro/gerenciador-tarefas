import { NotFoundException } from '@nestjs/common';
import {
  LIMITE_PAGINA_TAREFAS,
  TarefasService,
} from './tarefas.service.js';

describe('TarefasService', () => {
  let service: TarefasService;

  beforeEach(() => {
    service = new TarefasService();
  });

  it('cria tarefa com id uuid e dataCriacao', () => {
    const tarefa = service.criar({ titulo: 'Estudar' });
    expect(tarefa.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof tarefa.dataCriacao).toBe('number');
    expect(tarefa.descricao).toBeUndefined();
  });

  it('lista e busca por id', () => {
    const tarefa = service.criar({ titulo: 'A', descricao: 'B' });
    expect(service.listar()).toEqual([tarefa]);
    expect(service.buscarPorId(tarefa.id)).toEqual(tarefa);
  });

  it('atualiza parcialmente mantendo os demais campos', () => {
    const tarefa = service.criar({ titulo: 'A', descricao: 'B' });
    const atualizada = service.atualizar({ id: tarefa.id, titulo: 'C' });
    expect(atualizada).toEqual({ ...tarefa, titulo: 'C' });
  });

  it('remove tarefa', () => {
    const tarefa = service.criar({ titulo: 'A' });
    service.remover(tarefa.id);
    expect(service.listar()).toEqual([]);
  });

  it('lança NotFoundException para id inexistente', () => {
    expect(() => service.buscarPorId('x')).toThrow(NotFoundException);
    expect(() => service.remover('x')).toThrow('Tarefa com id x não encontrada');
  });

  it('lista páginas ordenadas por criação e id sem repetir tarefas', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100);
    const tarefas = Array.from({ length: LIMITE_PAGINA_TAREFAS + 2 }, (_, index) =>
      service.criar({ titulo: `Tarefa ${index}` }),
    );

    const primeiraPagina = service.listarPaginado({});
    const segundaPagina = service.listarPaginado({
      cursor: primeiraPagina.proximoCursor!,
    });

    const ordenadas = [...tarefas].sort((a, b) => a.id.localeCompare(b.id));
    expect(primeiraPagina.items).toEqual(ordenadas.slice(0, LIMITE_PAGINA_TAREFAS));
    expect(primeiraPagina.proximoCursor).toEqual({
      dataCriacao: 100,
      id: ordenadas[LIMITE_PAGINA_TAREFAS - 1].id,
    });
    expect(segundaPagina.items).toEqual(ordenadas.slice(LIMITE_PAGINA_TAREFAS));
    expect(segundaPagina.proximoCursor).toBeNull();
  });
});

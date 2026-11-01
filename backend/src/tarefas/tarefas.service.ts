import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AtualizarTarefaInput,
  CursorTarefa,
  CriarTarefaInput,
  ListarTarefasPaginadoInput,
  Tarefa,
} from './tarefa.schema.js';

export const LIMITE_PAGINA_TAREFAS = 10;

export interface PaginaTarefas {
  items: Tarefa[];
  proximoCursor: CursorTarefa | null;
}

@Injectable()
export class TarefasService {
  private readonly tarefas = new Map<string, Tarefa>();

  criar(dados: CriarTarefaInput): Tarefa {
    const tarefa: Tarefa = {
      id: randomUUID(),
      titulo: dados.titulo,
      descricao: dados.descricao,
      dataCriacao: Date.now(),
    };
    this.tarefas.set(tarefa.id, tarefa);
    return tarefa;
  }

  listar(): Tarefa[] {
    return [...this.tarefas.values()];
  }

  listarPaginado({
    cursor,
  }: ListarTarefasPaginadoInput): PaginaTarefas {
    const tarefas = [...this.tarefas.values()]
      .sort(
        (a, b) =>
          a.dataCriacao - b.dataCriacao || a.id.localeCompare(b.id),
      )
      .filter(
        (tarefa) =>
          !cursor ||
          tarefa.dataCriacao > cursor.dataCriacao ||
          (tarefa.dataCriacao === cursor.dataCriacao &&
            tarefa.id.localeCompare(cursor.id) > 0),
      );
    const items = tarefas.slice(0, LIMITE_PAGINA_TAREFAS);
    const possuiMais = tarefas.length > LIMITE_PAGINA_TAREFAS;
    const ultimaTarefa = items.at(-1);

    return {
      items,
      proximoCursor:
        possuiMais && ultimaTarefa
          ? {
              dataCriacao: ultimaTarefa.dataCriacao,
              id: ultimaTarefa.id,
            }
          : null,
    };
  }

  buscarPorId(id: string): Tarefa {
    const tarefa = this.tarefas.get(id);
    if (!tarefa) {
      throw new NotFoundException(`Tarefa com id ${id} não encontrada`);
    }
    return tarefa;
  }

  atualizar({ id, ...dados }: AtualizarTarefaInput): Tarefa {
    const atual = this.buscarPorId(id);
    const atualizada: Tarefa = {
      ...atual,
      ...(dados.titulo !== undefined && { titulo: dados.titulo }),
      ...(dados.descricao !== undefined && { descricao: dados.descricao }),
    };
    this.tarefas.set(id, atualizada);
    return atualizada;
  }

  remover(id: string): Tarefa {
    const tarefa = this.buscarPorId(id);
    this.tarefas.delete(id);
    return tarefa;
  }
}

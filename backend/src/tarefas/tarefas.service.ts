import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AtualizarTarefaInput,
  CriarTarefaInput,
  Tarefa,
} from './tarefa.schema.js';

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

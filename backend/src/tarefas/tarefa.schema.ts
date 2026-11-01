import { z } from 'zod';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number;
}

const titulo = z
  .string({ error: 'O título é obrigatório e deve ser um texto' })
  .trim()
  .min(1, 'O título é obrigatório e não pode ser vazio');

const descricao = z.string({ error: 'A descrição deve ser um texto' });

export const idTarefaSchema = z.object({
  id: z.uuid('O id informado não é um UUID válido'),
});

export const criarTarefaSchema = z.object({
  titulo,
  descricao: descricao.optional(),
});

export const atualizarTarefaSchema = idTarefaSchema
  .extend({
    titulo: titulo.optional(),
    descricao: descricao.optional(),
  })
  .refine((dados) => dados.titulo !== undefined || dados.descricao !== undefined, {
    message: 'Informe ao menos um campo para atualizar (titulo ou descricao)',
  });

export type CriarTarefaInput = z.infer<typeof criarTarefaSchema>;
export type AtualizarTarefaInput = z.infer<typeof atualizarTarefaSchema>;

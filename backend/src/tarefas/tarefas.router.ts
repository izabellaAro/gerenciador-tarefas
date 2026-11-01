import { HttpException, Logger } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { z, ZodError } from 'zod';
import {
  atualizarTarefaSchema,
  criarTarefaSchema,
  idTarefaSchema,
  listarTarefasPaginadoSchema,
} from './tarefa.schema.js';
import type { TarefasService } from './tarefas.service.js';

const logger = new Logger('tRPC');

const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    if (error.cause instanceof ZodError) {
      const erros = z.flattenError(error.cause);
      const mensagens = [...erros.formErrors, ...Object.values(erros.fieldErrors).flat()];
      return {
        ...shape,
        message: `Dados inválidos: ${mensagens.join('; ')}`,
        data: { ...shape.data, erros },
      };
    }
    return shape;
  },
});

const tratarErros = t.middleware(async ({ next }) => {
  const resultado = await next();
  if (resultado.ok) return resultado;

  const { error } = resultado;
  if (error.code !== 'INTERNAL_SERVER_ERROR') return resultado;

  const causa = error.cause;
  if (causa instanceof HttpException && causa.getStatus() === 404) {
    throw new TRPCError({ code: 'NOT_FOUND', message: causa.message, cause: causa });
  }

  logger.error(error.message, error.stack);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Erro interno inesperado. Tente novamente mais tarde.',
  });
});

const procedure = t.procedure.use(tratarErros);

export function criarTarefasRouter(service: TarefasService) {
  return t.router({
    listar: procedure.query(() => service.listar()),
    listarPaginado: procedure
      .input(listarTarefasPaginadoSchema)
      .query(({ input }) => service.listarPaginado(input)),
    buscarPorId: procedure
      .input(idTarefaSchema)
      .query(({ input }) => service.buscarPorId(input.id)),
    criar: procedure
      .input(criarTarefaSchema)
      .mutation(({ input }) => service.criar(input)),
    atualizar: procedure
      .input(atualizarTarefaSchema)
      .mutation(({ input }) => service.atualizar(input)),
    remover: procedure
      .input(idTarefaSchema)
      .mutation(({ input }) => service.remover(input.id)),
  });
}

export type AppRouter = ReturnType<typeof criarTarefasRouter>;

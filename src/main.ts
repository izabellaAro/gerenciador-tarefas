import { NestFactory } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { AppModule } from './app.module.js';
import { criarTarefasRouter } from './tarefas/tarefas.router.js';
import { TarefasService } from './tarefas/tarefas.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const router = criarTarefasRouter(app.get(TarefasService));
  app.use('/trpc', createExpressMiddleware({ router }));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

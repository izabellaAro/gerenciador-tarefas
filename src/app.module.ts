import { Module } from '@nestjs/common';
import { TarefasModule } from './tarefas/tarefas.module.js';

@Module({
  imports: [TarefasModule],
})
export class AppModule {}

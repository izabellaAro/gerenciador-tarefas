import { Module } from '@nestjs/common';
import { TarefasService } from './tarefas.service.js';

@Module({
  providers: [TarefasService],
  exports: [TarefasService],
})
export class TarefasModule {}

import { AiModule } from '@/core/ai/ai.module';
import { GitModule } from '@/core/git/git.module';
import { TicketModule } from '@/core/ticket/ticket.module';
import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [GitModule, AiModule, TicketModule, StorageModule],
})
export class CoreModule {}

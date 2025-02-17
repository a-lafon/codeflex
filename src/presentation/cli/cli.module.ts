import { AiModule } from '@/core/ai/ai.module';
import { GitModule } from '@/core/git/git.module';
import { TicketModule } from '@/core/ticket/ticket.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [GitModule, AiModule, TicketModule],
})
export class CliModule {}

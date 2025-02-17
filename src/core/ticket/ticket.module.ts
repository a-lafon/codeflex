import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}

import { TicketAnalyzerAgent } from '@/core/ai/agents/ticket-analyzer/ticket-analyzer.agent';
import { TicketService } from '@/core/ticket/ticket.service';
import { TicketAnalyzer } from '@/core/ai/agents/ticket-analyzer/ticket-analyzer.schema';

export class TicketAnalysisUseCase {
  constructor(
    private readonly ticketAnalyzerAgent: TicketAnalyzerAgent,
    private readonly ticketService: TicketService,
  ) {}

  async exec(ticketId: string): Promise<TicketAnalyzer> {
    const ticket = await this.ticketService.getTicket(ticketId);
    return this.ticketAnalyzerAgent.analyze(ticket);
  }
}

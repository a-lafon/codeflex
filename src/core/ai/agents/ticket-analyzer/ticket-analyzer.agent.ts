import { Ticket } from '@/core/ticket/ticket.type';
import { ILlmProvider, ModelEnum } from '../../ai.interface';
import { Agent } from '../agent-base';
import { Inject, Injectable } from '@nestjs/common';
import {
  TicketAnalyzerSchema,
  TicketAnalyzerJsonSchema,
  TicketAnalyzer,
} from './ticket-analyzer.schema';

@Injectable()
export class TicketAnalyzerAgent extends Agent<typeof TicketAnalyzerSchema> {
  protected schemaName = 'ticket_analyzer';
  protected schemaObject = TicketAnalyzerJsonSchema;
  protected systemPrompt: string;
  protected model: ModelEnum = ModelEnum.MEDIUM;

  constructor(
    @Inject(ILlmProvider) protected readonly llmProvider: ILlmProvider,
  ) {
    super(llmProvider);
    this.systemPrompt = `You are an expert Jira ticket analyzer.
    Your task is to analyze a ticket and extract the main requirements and a clear summary.
    For each ticket, identify:
    1. A list of requirements or requested features
    2. A concise but comprehensive summary of the ticket
    
    Be precise and technically oriented in your analysis.`;
  }

  async analyze(ticket: Ticket): Promise<TicketAnalyzer> {
    const prompt = this.buildPrompt(ticket);
    return this.execute(prompt, TicketAnalyzerSchema);
  }

  private buildPrompt(ticket: Ticket): string {
    return `
      Analyze the following Jira ticket and extract the main requirements and a summary.

      # Ticket title:
      ${ticket.title}

      # Description:
      ${ticket.description || 'No description provided'}
    `;
  }
}

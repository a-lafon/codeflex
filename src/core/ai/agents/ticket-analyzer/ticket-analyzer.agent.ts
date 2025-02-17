import { Ticket, TicketWithReview } from '@/core/ticket/ticket.type';
import { ILlmProvider, ModelEnum } from '../../ai.interface';
import { Agent } from '../agent-base';
import { TicketAnalizerDto } from './ticket-analyzer.dto';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TicketAnalyzerAgent extends Agent<TicketAnalizerDto> {
  protected model = ModelEnum.SMALL;
  protected systemPrompt = `You are a highly capable Jira Extractor. 
  Your task is to analyze the given Jira ticket and extract the key technical and functional requirements clearly. 
  Additionally, provide a summary of the ticket that focuses on the most important aspects and key points. 
  This summary should help the user quickly understand the core content of the ticket without reiterating the title or description.
  `;
  protected dto = TicketAnalizerDto;

  constructor(
    @Inject(ILlmProvider) protected readonly llmProvider: ILlmProvider,
  ) {
    super(llmProvider);
  }

  async extract(ticket: Ticket): Promise<TicketWithReview> {
    const prompt = this.buildPrompt(ticket);
    const response = await super.execute(prompt);
    return {
      ...ticket,
      ...response,
    };
  }

  private buildPrompt(ticket: Ticket): string {
    return `
      Analyze the following Jira ticket and provide a summary of its content, including the key points mentioned in the description.

      # Title:
      ${ticket.title}

      # Description:
      ${ticket.description ? ticket.description : 'No description provided.'}

      After summarizing the ticket, extract the technical and functional requirements.
      If any requirement is unclear, return 'unspecified' for that requirement.
    `;
  }
}

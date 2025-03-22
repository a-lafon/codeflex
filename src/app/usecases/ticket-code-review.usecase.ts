import { TicketService } from '@/core/ticket/ticket.service';
import { GitMergeRequest } from '@/core/git/git.type';
import { ReviewOptions } from './code-review-usecase';
import { TicketCodeValidator } from '@/core/ai/agents/ticket-code-validator/ticket-code-validator.schema';
import { TicketCodeValidatorAgent } from '@/core/ai/agents/ticket-code-validator/ticket-code-validator.agent';

export class TicketCodeReviewUseCase {
  constructor(
    private readonly ticketCodeValidatorAgent: TicketCodeValidatorAgent,
    private readonly ticketService: TicketService,
  ) {}

  async exec(
    mergeRequest: GitMergeRequest,
    options?: ReviewOptions & { overrideJiraId?: string },
  ): Promise<TicketCodeValidator> {
    const jiraId = options?.overrideJiraId || mergeRequest.jiraId;

    if (!jiraId) {
      throw new Error(
        'No Jira ticket ID found in the merge request and no override provided',
      );
    }

    const ticket = await this.ticketService.getTicket(jiraId);
    return this.ticketCodeValidatorAgent.review(ticket, mergeRequest, options);
  }
}

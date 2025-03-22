import { IntegratedReviewAgent } from '@/core/ai/agents/integrated-review/integrated-review.agent';
import { TicketService } from '@/core/ticket/ticket.service';
import { GitMergeRequest } from '@/core/git/git.type';
import { ReviewOptions } from './code-review-usecase';
import { IntegratedReview } from '@/core/ai/agents/integrated-review/integrated-review.schema';

export class TicketCodeReviewUseCase {
  constructor(
    private readonly integratedReviewAgent: IntegratedReviewAgent,
    private readonly ticketService: TicketService,
  ) {}

  async exec(
    mergeRequest: GitMergeRequest,
    options?: ReviewOptions & { overrideJiraId?: string },
  ): Promise<IntegratedReview> {
    const jiraId = options?.overrideJiraId || mergeRequest.jiraId;

    if (!jiraId) {
      throw new Error(
        'No Jira ticket ID found in the merge request and no override provided',
      );
    }

    const ticket = await this.ticketService.getTicket(jiraId);
    return this.integratedReviewAgent.integratedReview(
      ticket,
      mergeRequest,
      options,
    );
  }
}

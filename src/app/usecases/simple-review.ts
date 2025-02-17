import { GitReviewAgent } from '@/core/ai/agents/git-review/git-review.agent';
import { TicketAnalyzerAgent } from '@/core/ai/agents/ticket-analyzer/ticket-analyzer.agent';
import { GitService } from '@/core/git/git.service';
import { TicketService } from '@/core/ticket/ticket.service';
import { Ticket } from '@/core/ticket/ticket.type';

export class SimpleReview {
  constructor(
    private readonly gitService: GitService,
    private readonly ticketService: TicketService,
    private readonly ticketAnalyzer: TicketAnalyzerAgent,
    private readonly gitReviewAgent: GitReviewAgent,
  ) {}

  async exec(projectId: string, mergeRequestId: string) {
    let ticket: Ticket | undefined = undefined;

    const mergeRequest = await this.gitService.getMergeRequest(
      projectId,
      mergeRequestId,
    );

    const review = await this.gitReviewAgent.review(mergeRequest);

    console.log(review);

    if (mergeRequest.jiraId) {
      ticket = await this.ticketService.getTicket(mergeRequest.jiraId);
      const ticketWithReview = await this.ticketAnalyzer.extract(ticket);
      console.log(ticketWithReview);
    }
  }
}

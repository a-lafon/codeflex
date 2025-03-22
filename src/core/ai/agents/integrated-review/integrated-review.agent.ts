import { Inject, Injectable } from '@nestjs/common';
import { ILlmProvider, ModelEnum } from '../../ai.interface';
import { Agent } from '../agent-base';
import { GitMergeRequest } from '@/core/git/git.type';
import { Ticket } from '@/core/ticket/ticket.type';
import { GitReviewAgent } from '../git-review/git-review.agent';
import { TicketAnalyzerAgent } from '../ticket-analyzer/ticket-analyzer.agent';
import { ReviewOptions } from '@/app/usecases/code-review-usecase';
import {
  IntegratedReviewSchema,
  IntegratedReviewJsonSchema,
  IntegratedReview,
} from './integrated-review.schema';

@Injectable()
export class IntegratedReviewAgent extends Agent<
  typeof IntegratedReviewSchema
> {
  protected schemaName = 'integrated_review';
  protected schemaObject = IntegratedReviewJsonSchema;
  protected systemPrompt: string;
  protected model: ModelEnum = ModelEnum.LARGE;

  constructor(
    @Inject(ILlmProvider) protected readonly llmProvider: ILlmProvider,
    private readonly gitReviewAgent: GitReviewAgent,
    private readonly ticketAnalyzerAgent: TicketAnalyzerAgent,
  ) {
    super(llmProvider);
    this.systemPrompt = `You are an expert in integrating ticket analysis and code reviews.
    Your task is to analyze both the requirements of a Jira ticket and an associated code review,
    then provide an integrated analysis that verifies if the code meets the requirements and suggests improvements.
    
    Focus on:
    1. Alignment between code changes and ticket requirements
    2. Missing functionality or implementation gaps
    3. Prioritized recommendations for improving the implementation
    4. Overall assessment of the merge request's quality relative to the ticket's needs`;
  }

  async integratedReview(
    ticket: Ticket,
    mergeRequest: GitMergeRequest,
    options?: ReviewOptions,
  ): Promise<IntegratedReview> {
    const ticketAnalysis = await this.ticketAnalyzerAgent.analyze(ticket);

    const codeReview = await this.gitReviewAgent.review(mergeRequest, {
      options,
    });

    const prompt = this.buildPrompt(ticketAnalysis, codeReview, mergeRequest);
    return this.execute(prompt, IntegratedReviewSchema);
  }

  private buildPrompt(
    ticketAnalysis: IntegratedReview['ticketAnalysis'],
    codeReview: IntegratedReview['codeReview'],
    mergeRequest: GitMergeRequest,
  ): string {
    return `
      Analyze the following combination of a ticket analysis and a code review.
      Verify if the code meets the requirements in the ticket and suggest improvements.

      # Ticket Analysis:
      ${JSON.stringify(ticketAnalysis, null, 2)}

      # Code Review:
      ${JSON.stringify(codeReview, null, 2)}

      # Merge Request Title:
      ${mergeRequest.title}

      Integrate these analyses to provide:
      1. A list of specific recommendations
      2. A conclusion on whether the code meets the ticket requirements
    `;
  }
}

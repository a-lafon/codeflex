import { GitReviewAgent } from '@/core/ai/agents/git-review/git-review.agent';
import { GitReview } from '@/core/ai/agents/git-review/git-review.schema';
import { GitMergeRequest } from '@/core/git/git.type';

export type ReviewOptions = {
  detailLevel?: 'basic' | 'standard' | 'thorough';
  focusAreas?: string[];
  ignorePatterns?: string[];
  verbose?: boolean;
  projectGuidelines?: string;
};

export class CodeReviewUseCase {
  constructor(private readonly gitReviewAgent: GitReviewAgent) {}

  async exec(
    mergeRequest: GitMergeRequest,
    options?: ReviewOptions,
  ): Promise<GitReview> {
    const review = await this.gitReviewAgent.review(mergeRequest, {
      options,
      similarMergeRequests: [],
    });

    return review;
  }
}

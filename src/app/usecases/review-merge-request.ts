import { GitReviewAgent } from '@/core/ai/agents/git-review/git-review.agent';
import { GitService } from '@/core/git/git.service';
import { GitMergeRequest } from '@/core/git/git.type';

export type ReviewOptions = {
  detailLevel?: 'basic' | 'standard' | 'thorough';
  focusAreas?: string[];
  ignorePatterns?: string[];
  verbose?: boolean;
};

export class ReviewMergeRequest {
  constructor(
    private readonly gitService: GitService,
    private readonly gitReviewAgent: GitReviewAgent,
  ) {}

  async exec(
    projectId: string,
    mergeRequestId: string,
    options?: ReviewOptions,
  ): Promise<GitMergeRequest> {
    if (options?.verbose) {
      console.log(
        `Fetching merge request ${mergeRequestId} from project ${projectId}`,
      );
    }

    const mergeRequest = await this.gitService.fetchMergeRequest(
      projectId,
      mergeRequestId,
    );

    if (options?.verbose) {
      console.log(`Retrieved merge request: "${mergeRequest.title}"`);
      console.log(
        `Starting code review with options:`,
        JSON.stringify(options, null, 2),
      );
    }

    const review = await this.gitReviewAgent.review(mergeRequest, {
      options,
      similarMergeRequests: [],
    });

    mergeRequest.review = review;

    return mergeRequest;
  }
}

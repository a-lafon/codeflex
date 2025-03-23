import { GitReview } from '@/core/ai/agents/git-review/git-review.schema';
import { GitMergeRequest } from '@/core/git/git.type';

export type ReviewStorageOptions = {
  projectId: string;
  mergeRequestId: string;
};

export interface IReviewStorageProvider {
  saveReview(review: GitReview, options: ReviewStorageOptions): Promise<string>;
  findReviews(
    projectId: ReviewStorageOptions['projectId'],
    limit?: number,
  ): Promise<GitReview[]>;
  findSimilarReviews(
    currentReview: GitMergeRequest,
    options: ReviewStorageOptions,
    limit?: number,
  ): Promise<GitReview[]>;
}

export const IReviewStorageProvider = Symbol('IReviewStorageProvider');

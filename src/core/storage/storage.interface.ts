import { GitReview } from '@/core/ai/agents/git-review/git-review.schema';
import { GitMergeRequest } from '@/core/git/git.type';

export type ReviewStorageOptions = {
  projectId: string;
  mergeRequestId: string;
  gitHost?: string;
};

export interface IReviewStorageProvider {
  saveReview(review: GitReview, options: ReviewStorageOptions): Promise<void>;
  findReviews(
    options: ReviewStorageOptions,
    limit?: number,
  ): Promise<GitReview[]>;
  findSimilarReviews(
    currentReview: GitMergeRequest,
    options: ReviewStorageOptions,
    limit?: number,
  ): Promise<GitReview[]>;
}

export const IReviewStorageProvider = Symbol('IReviewStorageProvider');

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
  findOneReview(
    projectId: ReviewStorageOptions['projectId'],
    mergeRequestId: ReviewStorageOptions['mergeRequestId'],
  ): Promise<GitReview | null>;
}

export interface IMergeRequestStorageProvider {
  saveMergeRequest(mergeRequest: GitMergeRequest): Promise<string>;
  findMergeRequests(
    projectId: string,
    limit?: number,
  ): Promise<GitMergeRequest[]>;
  findSimilarMergeRequests(
    currentMergeRequest: GitMergeRequest,
    limit?: number,
  ): Promise<GitMergeRequest[]>;
}

export const IReviewStorageProvider = Symbol('IReviewStorageProvider');
export const IMergeRequestStorageProvider = Symbol(
  'IMergeRequestStorageProvider',
);

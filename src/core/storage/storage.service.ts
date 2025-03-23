import { Injectable, Inject } from '@nestjs/common';
import { GitReview } from '@/core/ai/agents/git-review/git-review.schema';
import { GitMergeRequest } from '@/core/git/git.type';
import {
  IReviewStorageProvider,
  IMergeRequestStorageProvider,
  ReviewStorageOptions,
} from './storage.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject(IReviewStorageProvider)
    private readonly reviewStorageProvider: IReviewStorageProvider,

    @Inject(IMergeRequestStorageProvider)
    private readonly mergeRequestStorageProvider: IMergeRequestStorageProvider,
  ) {}

  async saveReview(
    review: GitReview,
    options: ReviewStorageOptions,
  ): Promise<string> {
    return this.reviewStorageProvider.saveReview(review, options);
  }

  async findReviews(
    projectId: ReviewStorageOptions['projectId'],
    limit = 10,
  ): Promise<GitReview[]> {
    return this.reviewStorageProvider.findReviews(projectId, limit);
  }

  async findOneReview(
    projectId: ReviewStorageOptions['projectId'],
    mergeRequestId: ReviewStorageOptions['mergeRequestId'],
  ): Promise<GitReview | null> {
    return this.reviewStorageProvider.findOneReview(projectId, mergeRequestId);
  }

  async saveMergeRequest(mergeRequest: GitMergeRequest): Promise<string> {
    return this.mergeRequestStorageProvider.saveMergeRequest(mergeRequest);
  }

  async findMergeRequests(
    projectId: string,
    limit = 10,
  ): Promise<GitMergeRequest[]> {
    return this.mergeRequestStorageProvider.findMergeRequests(projectId, limit);
  }

  async findSimilarMergeRequests(
    currentMergeRequest: GitMergeRequest,
    limit = 3,
  ): Promise<GitMergeRequest[]> {
    return this.mergeRequestStorageProvider.findSimilarMergeRequests(
      currentMergeRequest,
      limit,
    );
  }
}

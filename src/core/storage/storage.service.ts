import { Injectable, Inject } from '@nestjs/common';
import { GitReview } from '@/core/ai/agents/git-review/git-review.schema';
import { GitMergeRequest } from '@/core/git/git.type';
import {
  IReviewStorageProvider,
  ReviewStorageOptions,
} from './storage.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject(IReviewStorageProvider)
    private readonly reviewStorageProvider: IReviewStorageProvider,
  ) {}

  async saveReview(
    review: GitReview,
    options: ReviewStorageOptions,
  ): Promise<string> {
    return this.reviewStorageProvider.saveReview(review, options);
  }

  async findReviews(
    options: ReviewStorageOptions,
    limit = 10,
  ): Promise<GitReview[]> {
    return this.reviewStorageProvider.findReviews(options, limit);
  }

  async findSimilarReviews(
    currentReview: GitMergeRequest,
    options: ReviewStorageOptions,
    limit = 3,
  ): Promise<GitReview[]> {
    return this.reviewStorageProvider.findSimilarReviews(
      currentReview,
      options,
      limit,
    );
  }
}

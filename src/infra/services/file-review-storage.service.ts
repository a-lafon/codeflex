import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Injectable } from '@nestjs/common';
import { GitReview } from '@/core/ai/agents/git-review/git-review.schema';
import { GitMergeRequest } from '@/core/git/git.type';
import {
  IReviewStorageProvider,
  ReviewStorageOptions,
} from '@/core/storage/storage.interface';

@Injectable()
export class FileReviewStorageService implements IReviewStorageProvider {
  private getStorageBasePath(): string {
    const baseDir =
      process.env.CODEFLEX_DATA_DIR || path.join(os.homedir(), '.codeflex');
    const storageDir = path.join(baseDir, 'reviews');

    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    return storageDir;
  }

  private getProjectPath(projectId: ReviewStorageOptions['projectId']): string {
    const projectDir = path.join(
      this.getStorageBasePath(),
      'default',
      projectId,
    );

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    return projectDir;
  }

  private getReviewFilePath(
    projectId: ReviewStorageOptions['projectId'],
    mergeRequestId: ReviewStorageOptions['mergeRequestId'],
  ): string {
    const projectDir = this.getProjectPath(projectId);
    return path.join(projectDir, `mr_${mergeRequestId}.json`);
  }

  async saveReview(
    review: GitReview,
    options: ReviewStorageOptions,
  ): Promise<string> {
    const filePath = this.getReviewFilePath(
      options.projectId,
      options.mergeRequestId,
    );
    const reviewData = {
      ...review,
      _meta: {
        savedAt: new Date().toISOString(),
        projectId: options.projectId,
        mergeRequestId: options.mergeRequestId,
      },
    };

    await fs.promises.writeFile(filePath, JSON.stringify(reviewData, null, 2));
    return filePath;
  }

  async findOneReview(
    projectId: ReviewStorageOptions['projectId'],
    mergeRequestId: ReviewStorageOptions['mergeRequestId'],
  ): Promise<GitReview | null> {
    const filePath = this.getReviewFilePath(projectId, mergeRequestId);

    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = await fs.promises.readFile(filePath, 'utf8');
      const review = JSON.parse(content) as GitReview;

      return review;
    } catch (error) {
      console.error(
        `Error retrieving review for merge request ${mergeRequestId}:`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  async findReviews(
    projectId: ReviewStorageOptions['projectId'],
    limit = 10,
  ): Promise<GitReview[]> {
    const projectDir = this.getProjectPath(projectId);

    if (!fs.existsSync(projectDir)) {
      return [];
    }

    try {
      const files = await fs.promises.readdir(projectDir);
      const reviewFiles = files.filter((file) => file.endsWith('.json'));

      const reviewsWithStats = await Promise.all(
        reviewFiles.map(async (file) => {
          const filePath = path.join(projectDir, file);
          const stats = await fs.promises.stat(filePath);
          return { file, stats };
        }),
      );

      // Sort by most recent first
      const sortedFiles = reviewsWithStats
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime())
        .slice(0, limit)
        .map((item) => item.file);

      const reviews = await Promise.all(
        sortedFiles.map(async (file) => {
          const content = await fs.promises.readFile(
            path.join(projectDir, file),
            'utf8',
          );
          return JSON.parse(content) as GitReview;
        }),
      );

      return reviews;
    } catch (error) {
      console.error('Error finding reviews:', error);
      return [];
    }
  }
}

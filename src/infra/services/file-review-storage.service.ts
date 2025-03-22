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

  private getProjectPath(options: ReviewStorageOptions): string {
    const gitHost = options.gitHost || 'default';
    const projectDir = path.join(
      this.getStorageBasePath(),
      gitHost,
      options.projectId,
    );

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    return projectDir;
  }

  private getReviewFilePath(options: ReviewStorageOptions): string {
    const projectDir = this.getProjectPath(options);
    return path.join(projectDir, `mr_${options.mergeRequestId}.json`);
  }

  async saveReview(
    review: GitReview,
    options: ReviewStorageOptions,
  ): Promise<void> {
    const filePath = this.getReviewFilePath(options);
    const reviewData = {
      ...review,
      _meta: {
        savedAt: new Date().toISOString(),
        projectId: options.projectId,
        mergeRequestId: options.mergeRequestId,
      },
    };

    await fs.promises.writeFile(filePath, JSON.stringify(reviewData, null, 2));
  }

  async findReviews(
    options: ReviewStorageOptions,
    limit = 10,
  ): Promise<GitReview[]> {
    const projectDir = this.getProjectPath(options);

    if (!fs.existsSync(projectDir)) {
      return [];
    }

    try {
      const files = await fs.promises.readdir(projectDir);
      const reviewFiles = files
        .filter((file) => file.endsWith('.json'))
        .filter((file) => file !== `mr_${options.mergeRequestId}.json`);

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

  async findSimilarReviews(
    currentReview: GitMergeRequest,
    options: ReviewStorageOptions,
    limit = 3,
  ): Promise<GitReview[]> {
    // Pour l'instant, cette méthode retourne simplement les revues les plus récentes
    // Dans le futur, on pourrait implémenter un vrai algorithme de similarité

    // Récupérer quelques revues de plus que demandé pour avoir une marge de manœuvre
    const reviews = await this.findReviews(options, limit * 2);

    // Pour l'instant, on retourne simplement les N revues les plus récentes
    return reviews.slice(0, limit);
  }
}

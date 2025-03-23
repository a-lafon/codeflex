import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Injectable } from '@nestjs/common';
import { GitMergeRequest } from '@/core/git/git.type';
import { IMergeRequestStorageProvider } from '@/core/storage/storage.interface';

@Injectable()
export class FileMergeRequestStorageService
  implements IMergeRequestStorageProvider
{
  private getStorageBasePath(): string {
    const baseDir =
      process.env.CODEFLEX_DATA_DIR || path.join(os.homedir(), '.codeflex');
    const storageDir = path.join(baseDir, 'merge-requests');

    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    return storageDir;
  }

  private getProjectPath(projectId: string): string {
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

  private getMergeRequestFilePath(
    projectId: string,
    mergeRequestId: string,
  ): string {
    const projectDir = this.getProjectPath(projectId);
    return path.join(projectDir, `mr_${mergeRequestId}.json`);
  }

  async saveMergeRequest(mergeRequest: GitMergeRequest): Promise<string> {
    const filePath = this.getMergeRequestFilePath(
      mergeRequest.projectId,
      mergeRequest.id,
    );
    const mrData = {
      ...mergeRequest,
      _meta: {
        savedAt: new Date().toISOString(),
      },
    };

    await fs.promises.writeFile(filePath, JSON.stringify(mrData, null, 2));
    return filePath;
  }

  async findMergeRequests(
    projectId: string,
    limit = 10,
  ): Promise<GitMergeRequest[]> {
    const projectDir = this.getProjectPath(projectId);

    if (!fs.existsSync(projectDir)) {
      return [];
    }

    try {
      const files = await fs.promises.readdir(projectDir);
      const mrFiles = files.filter((file) => file.endsWith('.json'));

      const mrsWithStats = await Promise.all(
        mrFiles.map(async (file) => {
          const filePath = path.join(projectDir, file);
          const stats = await fs.promises.stat(filePath);
          return { file, stats };
        }),
      );

      // Sort by most recent first
      const sortedFiles = mrsWithStats
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime())
        .slice(0, limit)
        .map((item) => item.file);

      const mergeRequests = await Promise.all(
        sortedFiles.map(async (file) => {
          const content = await fs.promises.readFile(
            path.join(projectDir, file),
            'utf8',
          );
          return JSON.parse(content) as GitMergeRequest;
        }),
      );

      return mergeRequests;
    } catch (error) {
      console.error('Error finding merge requests:', error);
      return [];
    }
  }

  async findSimilarMergeRequests(
    currentMergeRequest: GitMergeRequest,
    limit = 3,
  ): Promise<GitMergeRequest[]> {
    // Pour l'instant, cette méthode retourne simplement les MRs les plus récentes
    // Dans le futur, on pourrait implémenter un vrai algorithme de similarité

    // Récupérer quelques MRs de plus que demandé pour avoir une marge de manœuvre
    const mergeRequests = await this.findMergeRequests(
      currentMergeRequest.projectId,
      limit * 2,
    );

    // Pour l'instant, on retourne simplement les N MRs les plus récentes
    return mergeRequests.slice(0, limit);
  }
}

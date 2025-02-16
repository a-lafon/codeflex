import { IGitClient } from 'src/core/git/git.interface';

export class ReviewMergeRequest {
  constructor(private readonly gitClient: IGitClient) {}

  async exec(projectId: string, mergeRequestId: string) {
    const result = await this.gitClient.getMergeRequest(
      projectId,
      mergeRequestId,
    );
    console.log(result);
  }
}

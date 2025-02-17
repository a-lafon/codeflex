import { GitMergeRequest } from './git.type';

export interface IGitClient {
  getMergeRequest(
    projectId: string,
    mergeRequestId: string,
  ): Promise<GitMergeRequest>;

  getMergeRequests(
    projectId: string,
    options?: { lastDate?: Date },
  ): Promise<GitMergeRequest[]>;
}

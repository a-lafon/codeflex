import { GitMergeRequest } from './git.type';

export interface IGitProvider {
  fetchMergeRequest(
    projectId: string,
    mergeRequestId: string,
  ): Promise<GitMergeRequest>;
}

export const IGitProvider = Symbol('IGitProvider');

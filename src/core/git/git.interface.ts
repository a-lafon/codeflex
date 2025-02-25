import { GitMergeRequest } from './git.type';

export interface IGitProvider {
  getMergeRequest(
    projectId: string,
    mergeRequestId: string,
  ): Promise<GitMergeRequest>;
}

export const IGitProvider = Symbol('IGitProvider');

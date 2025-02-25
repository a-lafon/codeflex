import { Inject, Injectable } from '@nestjs/common';
import { GitMergeRequest } from './git.type';
import { IGitProvider } from './git.interface';

@Injectable()
export class GitService {
  constructor(
    @Inject(IGitProvider) private readonly gitProvider: IGitProvider,
  ) {}

  async getMergeRequest(
    projectId: string,
    mergeRequestId: string,
  ): Promise<GitMergeRequest> {
    return this.gitProvider.getMergeRequest(projectId, mergeRequestId);
  }
}

import { Injectable } from '@nestjs/common';
import { GitlabClient } from './gitlab.client';
import { GitMergeRequest } from './git.type';

@Injectable()
export class GitService {
  constructor(private readonly gitlabClient: GitlabClient) {}

  async getMergeRequest(
    projectId: string,
    mergeRequestId: string,
  ): Promise<GitMergeRequest> {
    return this.gitlabClient.getMergeRequest(projectId, mergeRequestId);
  }
}

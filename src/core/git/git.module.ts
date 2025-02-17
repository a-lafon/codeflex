import { GitlabClient } from '@/core/git/gitlab.client';
import { Module } from '@nestjs/common';
import { GitService } from './git.service';

@Module({
  providers: [GitlabClient, GitService],
  exports: [GitService],
})
export class GitModule {}

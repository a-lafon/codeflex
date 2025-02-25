import { GitlabService } from '@/infra/services/gitlab.service';
import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { IGitProvider } from './git.interface';

const GitProvider = { provide: IGitProvider, useClass: GitlabService };

@Module({
  providers: [GitProvider, GitService],
  exports: [GitProvider, GitService],
})
export class GitModule {}

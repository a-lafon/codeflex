import { GitlabClient } from '@/core/git/gitlab.client';
import { Module } from '@nestjs/common';

@Module({
  providers: [GitlabClient],
  exports: [GitlabClient],
})
export class CliModule {}

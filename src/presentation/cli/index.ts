import { ReviewMergeRequest } from '@/app/usecases/review-merge-request';
import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { CliModule } from './cli.module';
import { GitlabClient } from '@/core/git/gitlab.client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: false,
  });
  const gitlabClient = app.get(GitlabClient);

  const program = new Command();
  program
    .command('review')
    .description('Review a merge request')
    .option('-m, --merge-request <id>', 'Specify a merge request id')
    .option('-p, --project <id>', 'Specify a project id')
    .action(async (options: { mergeRequest: string; project: string }) => {
      const reviewMergeRequest = new ReviewMergeRequest(gitlabClient);
      await reviewMergeRequest.exec(options.project, options.mergeRequest);
    });

  program.parse(process.argv);
  await app.close();
}
bootstrap();

import { SimpleReview } from '@/app/usecases/simple-review';
import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { CliModule } from './cli.module';
import { GitService } from '@/core/git/git.service';
import { TicketService } from '@/core/ticket/ticket.service';
import { TicketAnalyzerAgent } from '@/core/ai/agents/ticket-analyzer/ticket-analyzer.agent';
import { GitReviewAgent } from '@/core/ai/agents/git-review/git-review.agent';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    // logger: false,
  });

  const program = new Command();
  program
    .command('review')
    .description('Review a merge request')
    .option('-m, --merge-request <id>', 'Specify a merge request id')
    .option('-p, --project <id>', 'Specify a project id')
    .action(async (options: { mergeRequest: string; project: string }) => {
      const simpleReview = new SimpleReview(
        app.get(GitService),
        app.get(TicketService),
        app.get(TicketAnalyzerAgent),
        app.get(GitReviewAgent),
      );
      await simpleReview.exec(options.project, options.mergeRequest);
    });

  program.parse(process.argv);
  await app.close();
}
bootstrap();
